/**
 * Graph Reconciler ExtractEntities Node
 *
 * Why this exists: Merges structured logs with post-turn extraction so the
 * Graph Agent can recover entities the chat model did not log explicitly.
 */

import { canonicalizeSymptomName } from '@/backend/lib/graph/health-kg';
import { canonicalizeMedicationName } from '@/backend/lib/openmed/client';
import { extractBiomedicalEntities, extractFactors } from '@/backend/lib/openmed';

import type {
  GraphReconcilerStateType,
  GraphReconcilerStateUpdate,
  ReconciledEntity,
} from '../state';

const MIN_OPENMED_CONFIDENCE = 0.75;
const FACTOR_ONLY_SYMPTOM_NAMES = new Set([
  'cycle',
  'energy',
  'food',
  'hydration',
  'meal',
  'mood',
  'period',
  'sleep',
  'stress',
]);
const MOOD_CONTEXT_PATTERN =
  /\bmood\b|\bfeel(?:ing)?\b|\bhappy\b|\bsad\b|\bdown\b|\banxious\b|\bdepressed\b|\birritable\b/;

/**
 * Converts factor extraction output into graph-ready factor entities.
 * Why this exists: The factor extractor speaks in normalized numeric fields,
 * while the Graph Agent needs typed factor nodes with user-facing names.
 */
function factorValuesToEntities(
  factors: Awaited<ReturnType<typeof extractFactors>>,
  sourceText: string,
  timestamp?: string
): ReconciledEntity[] {
  const entities: ReconciledEntity[] = [];
  const normalizedText = sourceText.toLowerCase();

  if (factors.sleep_hours !== null && /\bsleep(?:ing)?\b|\bslept\b|\bbed\b|\bnap\b/.test(normalizedText)) {
    entities.push({
      type: 'factor',
      name: 'Sleep',
      source: 'factor_extractor',
      value: factors.sleep_hours,
      timestamp,
    });
  }

  if (factors.stress_level !== null && /\bstress(?:ed)?\b|\boverwhelm(?:ed)?\b/.test(normalizedText)) {
    entities.push({
      type: 'factor',
      name: 'Stress',
      source: 'factor_extractor',
      value: factors.stress_level,
      timestamp,
    });
  }

  if (factors.energy_level !== null && /\benergy\b/.test(normalizedText)) {
    entities.push({
      type: 'factor',
      name: 'Energy',
      source: 'factor_extractor',
      value: factors.energy_level,
      timestamp,
    });
  }

  if (factors.mood_rating !== null && MOOD_CONTEXT_PATTERN.test(normalizedText)) {
    entities.push({
      type: 'factor',
      name: 'Mood',
      source: 'factor_extractor',
      value: factors.mood_rating,
      timestamp,
    });
  }

  return entities;
}

/**
 * Recovers qualitative factor mentions that do not carry a numeric value.
 * Why this exists: Users often name likely drivers like meal, stress, or cycle
 * without rating them, but the graph should still preserve those factor nodes.
 */
function extractMentionedFactorEntities(text: string, timestamp?: string): ReconciledEntity[] {
  const normalizedText = text.toLowerCase();
  const factorMatchers: Array<{ name: string; pattern: RegExp }> = [
    { name: 'Sleep', pattern: /\bsleep(?:ing)?\b|\bslept\b|\binsomnia\b/ },
    { name: 'Meal', pattern: /\bmeal(s)?\b|\bfood\b/ },
    { name: 'Stress', pattern: /\bstress(ed)?\b/ },
    { name: 'Cycle', pattern: /\bcycle\b|\bperiod\b|\bhormone(s)?\b/ },
  ];

  return factorMatchers
    .filter(({ pattern }) => pattern.test(normalizedText))
    .map(({ name }) => ({
      type: 'factor' as const,
      name,
      source: 'factor_extractor' as const,
      timestamp,
    }));
}

/**
 * Builds a stable lookup key for deduping reconciled entities.
 * Why this exists: The extraction pass merges multiple sources and needs one
 * canonical comparison key for exact duplicate suppression.
 */
function entityKey(entity: ReconciledEntity): string {
  return `${entity.type}:${entity.name.trim().toLowerCase()}`;
}

/**
 * Tokenizes a symptom label into comparable words.
 * Why this exists: Low-trust symptom candidates should be dropped when they are
 * clearly just a generic substring of a stronger logged symptom.
 */
function tokenizeLabel(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Detects a bare numeric follow-up reply such as "6" or "7/10".
 * Why this exists: Severity-only replies should not be reinterpreted as mood or
 * energy factors during the graph recovery pass.
 */
function isBareNumericReply(value: string): boolean {
  return /^([0-9]|10)(?:\s*\/\s*10)?$/.test(value.trim());
}

/**
 * Filters out symptom candidates that are actually factor concepts.
 * Why this exists: OpenMed can recover tokens like "stress" from user text, but
 * in this graph model those belong as factors instead of symptom nodes.
 */
function isFactorLikeSymptom(entity: ReconciledEntity): boolean {
  if (entity.type !== 'symptom') {
    return false;
  }

  return FACTOR_ONLY_SYMPTOM_NAMES.has(entity.name.trim().toLowerCase());
}

/**
 * Checks whether a low-trust symptom is already covered by a logged symptom.
 * Why this exists: OpenMed can extract partial spans like "Heartbeat" from a
 * logged symptom such as "Racing Heartbeat", which should not become a new node.
 */
function isCoveredByLoggedSymptom(
  entity: ReconciledEntity,
  logEntities: ReconciledEntity[]
): boolean {
  if (entity.type !== 'symptom') {
    return false;
  }

  const candidateTokens = tokenizeLabel(entity.name);
  if (candidateTokens.length === 0) {
    return false;
  }

  return logEntities.some((loggedEntity) => {
    if (loggedEntity.type !== 'symptom') {
      return false;
    }

    const loggedTokens = tokenizeLabel(loggedEntity.name);
    if (loggedTokens.length <= candidateTokens.length) {
      return false;
    }

    return candidateTokens.every((token) => loggedTokens.includes(token));
  });
}

/**
 * Converts fresh log rows into graph-ready entities.
 * Why this exists: Structured logs are the Graph Agent's primary source of
 * truth, so they should be normalized before we compare them with gap entities.
 */
function buildLogEntities(state: GraphReconcilerStateType): ReconciledEntity[] {
  const symptomEntities = state.recentLogs.symptomLogs.map<ReconciledEntity>((log) => ({
    type: 'symptom',
    name: canonicalizeSymptomName(log.symptom_name),
    source: 'log',
    timestamp: log.logged_at,
    severity: log.severity,
    notes: log.notes,
  }));

  const medicationEntities = state.recentLogs.medicationLogs.map<ReconciledEntity>((log) => ({
    type: 'medication',
    name: canonicalizeMedicationName(log.medication_name),
    source: 'log',
    timestamp: log.logged_at,
    notes: log.notes,
  }));

  const moodEntities = state.recentLogs.moodLogs.map<ReconciledEntity>((log) => ({
    type: 'factor',
    name: 'Mood',
    source: 'log',
    timestamp: log.logged_at,
    value: log.rating,
    notes: log.notes,
  }));

  return [...symptomEntities, ...medicationEntities, ...moodEntities];
}

/**
 * Deduplicates recovered entities against structured log entities.
 * Why this exists: Logs are the highest-confidence source, so recovery passes
 * should only fill gaps instead of duplicating what is already known.
 */
function filterGapEntities(
  logEntities: ReconciledEntity[],
  recoveredEntities: ReconciledEntity[]
): ReconciledEntity[] {
  const logKeys = new Set(logEntities.map(entityKey));
  const factorNames = new Set(
    [...logEntities, ...recoveredEntities]
      .filter((entity) => entity.type === 'factor')
      .map((entity) => entity.name.trim().toLowerCase())
  );
  const seenRecovered = new Set<string>();

  return recoveredEntities.filter((entity) => {
    if (
      entity.source === 'openmed' &&
      entity.provisional &&
      (entity.confidence ?? 0) < MIN_OPENMED_CONFIDENCE
    ) {
      return false;
    }

    if (entity.source === 'openmed' && entity.provisional && isCoveredByLoggedSymptom(entity, logEntities)) {
      return false;
    }

    if (isFactorLikeSymptom(entity)) {
      return false;
    }

    if (entity.type === 'symptom' && factorNames.has(entity.name.trim().toLowerCase())) {
      return false;
    }

    const key = entityKey(entity);
    if (logKeys.has(key) || seenRecovered.has(key)) {
      return false;
    }

    seenRecovered.add(key);
    return true;
  });
}

/**
 * Extracts recovered biomedical and factor entities from the recent turn.
 * Why this exists: The Graph Agent should reconcile both explicit logs and
 * inferred entities before it becomes the single writer to the graph.
 */
export async function extractEntitiesNode(
  state: GraphReconcilerStateType
): Promise<GraphReconcilerStateUpdate> {
  try {
    const logEntities = buildLogEntities(state);
    const userMessages = state.recentMessages.filter((message) => message.role === 'user');
    const userOnlyText = userMessages
      .map((message) => message.content)
      .join('\n')
      .trim();
    const factorExtractionText = userMessages
      .map((message) => message.content.trim())
      .filter((content) => content.length > 0 && !isBareNumericReply(content))
      .join('\n')
      .trim();
    const latestTimestamp =
      state.recentMessages.at(-1)?.created_at ??
      state.recentLogs.symptomLogs.at(-1)?.logged_at ??
      state.recentLogs.medicationLogs.at(-1)?.logged_at ??
      state.recentLogs.moodLogs.at(-1)?.logged_at;

    const [biomedicalEntities, factorValues] = await Promise.all([
      userOnlyText ? extractBiomedicalEntities(userOnlyText) : Promise.resolve([]),
      factorExtractionText
        ? extractFactors(factorExtractionText)
        : Promise.resolve({
            sleep_hours: null,
            stress_level: null,
            energy_level: null,
            mood_rating: null,
            severity: null,
          }),
    ]);

    const recoveredEntities: ReconciledEntity[] = [
      ...biomedicalEntities.map((entity) => ({
        type: entity.type,
        name: entity.name,
        source: 'openmed' as const,
        timestamp: latestTimestamp,
        confidence: entity.confidence,
        provisional: true,
        rawText: entity.rawText,
      })),
      ...extractMentionedFactorEntities(userOnlyText, latestTimestamp),
      ...factorValuesToEntities(factorValues, factorExtractionText, latestTimestamp),
    ];

    return {
      logEntities,
      gapEntities: filterGapEntities(logEntities, recoveredEntities),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract graph reconciliation entities';
    console.error('[graph-reconciler/extract-entities] Failed:', error);

    return {
      logEntities: buildLogEntities(state),
      gapEntities: [],
      errors: [message],
    };
  }
}
