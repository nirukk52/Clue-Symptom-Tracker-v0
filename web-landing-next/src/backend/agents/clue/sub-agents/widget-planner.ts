'use server';

/**
 * Widget Planner Sub-Agent (RAG-Powered)
 *
 * Why this exists: Decides which widgets to show next based on context,
 * missing fields, and focus hypothesis progress. Uses RAG to find
 * semantically relevant widgets from the onboarding-flow.json knowledge base.
 *
 * Pipeline:
 * 1. Observe: today's baseline, focus hypothesis, missing fields
 * 2. Diagnose: identify biggest uncertainty blocking the focus question
 * 3. Retrieve: use RAG to find relevant widgets (semantic search)
 * 4. Rank: score each candidate (value, effort, focus, novelty, confidence)
 * 5. Emit: top 3 actions with decision trace + evidence
 */

import { findRelevantWidgets } from '../../lib/ai/embedding';
import type {
  ActionCandidate,
  MessageContext,
  Next3Actions,
  WidgetSpec,
  WidgetType,
} from '../types';

// Scoring weights (MVP)
const WEIGHTS = {
  value: 0.35,
  effort: 0.25,
  focusRelevance: 0.2,
  confidence: 0.15,
  novelty: 0.05,
};

/**
 * Plan the next 3 actions for the user (RAG-powered)
 */
export async function planNextActions(
  context: MessageContext,
  userMessage?: string // Optional message for semantic search
): Promise<Next3Actions> {
  // 1. Observe current state
  const observation = observeState(context);

  // 2. Diagnose biggest uncertainty
  const diagnosis = diagnoseUncertainty(context, observation);

  // 3. Generate candidate actions (now using RAG)
  const candidates = await generateCandidatesWithRAG(
    context,
    diagnosis,
    userMessage
  );

  // 4. Rank candidates
  const rankedCandidates = rankCandidates(candidates, context);

  // 5. Take top 3
  const top3 = rankedCandidates.slice(0, 3) as [
    ActionCandidate,
    ActionCandidate,
    ActionCandidate,
  ];

  // Generate decision trace ID
  const decisionTraceId = crypto.randomUUID();

  return {
    actions: top3,
    diagnosis: diagnosis.message,
    decisionTraceId,
  };
}

/**
 * Generate candidates using RAG retrieval from widget embeddings
 */
async function generateCandidatesWithRAG(
  context: MessageContext,
  diagnosis: Diagnosis,
  userMessage?: string
): Promise<ActionCandidate[]> {
  const candidates: ActionCandidate[] = [];

  // Build search query based on context
  const searchQuery = buildSearchQuery(context, diagnosis, userMessage);

  // Use RAG to find semantically relevant widgets
  const relevantWidgets = await findRelevantWidgets(searchQuery, {
    condition: context.user.primaryCondition,
    limit: 6,
    similarityThreshold: 0.4,
  });

  // Convert retrieved widgets to candidates
  for (const widget of relevantWidgets) {
    candidates.push(createCandidateFromRAG(widget, widget.similarity));
  }

  // Always include essential fallback widgets if not already present
  const hasOutcomeSlider = candidates.some(
    (c) => c.widget.type === 'outcome_slider'
  );
  const hasFlareToggle = candidates.some(
    (c) => c.widget.type === 'flare_toggle'
  );

  if (!hasOutcomeSlider && diagnosis.primaryGap === 'outcome') {
    candidates.push(
      createCandidate(
        'outcome_slider',
        context.focus?.outcomeLabel || 'How are you feeling?',
        'Priority outcome for trend tracking'
      )
    );
  }

  if (!hasFlareToggle) {
    candidates.push(
      createCandidate(
        'flare_toggle',
        'Is this a flare day?',
        'Helps track flare patterns'
      )
    );
  }

  return candidates;
}

/**
 * Build a semantic search query from context
 */
function buildSearchQuery(
  context: MessageContext,
  diagnosis: Diagnosis,
  userMessage?: string
): string {
  const parts: string[] = [];

  // Use user message if provided
  if (userMessage) {
    parts.push(userMessage);
  }

  // Add condition context
  if (context.user.primaryCondition) {
    parts.push(`tracking ${context.user.primaryCondition}`);
  }

  // Add focus hypothesis context
  if (context.focus) {
    parts.push(
      `understanding ${context.focus.featureLabel} and ${context.focus.outcomeLabel}`
    );
  }

  // Add diagnosis context
  if (diagnosis.primaryGap !== 'none') {
    parts.push(diagnosis.message);
  }

  // Add conversion context (what they signed up for)
  if (context.conversion) {
    parts.push(context.conversion.painPoint);
  }

  return parts.join('. ');
}

/**
 * Create a candidate from RAG search result
 */
function createCandidateFromRAG(
  widget: Awaited<ReturnType<typeof findRelevantWidgets>>[0],
  similarity: number
): ActionCandidate {
  const widgetSpec: WidgetSpec = {
    widgetId: crypto.randomUUID(),
    type: mapWidgetType(widget.metadata.widgetType),
    label: widget.metadata.question,
    description: widget.metadata.q4Value,
    writesTo: 'day_observations', // Default, can be refined
    reason: `Matched via RAG (${(similarity * 100).toFixed(0)}% relevance)`,
    evidenceSnapshotId: widget.widgetId, // Reference to source widget
  };

  return {
    id: crypto.randomUUID(),
    widget: widgetSpec,
    scores: {
      value: similarity, // Use similarity as base value score
      effort: 0.7, // Default, refined later
      focusRelevance: similarity,
      novelty: 0.8,
      confidence: similarity,
    },
    totalScore: 0,
    rank: 0,
  };
}

/**
 * Map onboarding-flow widget types to Clue agent widget types
 */
function mapWidgetType(flowType: string): WidgetType {
  const mapping: Record<string, WidgetType> = {
    time_segment_selector: 'outcome_slider',
    dual_selector: 'outcome_slider',
    dual_slider: 'outcome_slider',
    triple_selector: 'severity_slider',
    quad_selector: 'severity_slider',
    multi_select_chips: 'drivers_chips',
    timeline_selector: 'flare_toggle',
    rank_selector: 'outcome_slider',
    attribution_selector: 'drivers_chips',
    multi_symptom_tracker: 'severity_slider',
    single_slider: 'outcome_slider',
    clinical_capture: 'symptom_8char',
    gradient_slider: 'outcome_slider',
  };
  return mapping[flowType] || 'outcome_slider';
}

interface Observation {
  focusDay: number;
  completionRate: number;
  medsTimingMissing: boolean;
  outcomeMissing: boolean;
  isFlare: boolean;
  isLowEnergy: boolean;
}

/**
 * Observe current state for planning
 */
function observeState(context: MessageContext): Observation {
  return {
    focusDay: context.focus?.dayCount || 0,
    completionRate: context.lastSevenDays.completionRate,
    medsTimingMissing: context.today ? !context.today.meds.timingLogged : true,
    outcomeMissing: context.today ? context.today.completionScore < 0.3 : true,
    isFlare: context.today?.isFlare || false,
    isLowEnergy: context.agentState.energyState === 'low_energy',
  };
}

interface Diagnosis {
  primaryGap: 'meds_timing' | 'outcome' | 'feature' | 'data' | 'none';
  message: string;
}

/**
 * Diagnose the biggest uncertainty
 */
function diagnoseUncertainty(
  context: MessageContext,
  observation: Observation
): Diagnosis {
  // If in flare mode, just capture basics
  if (observation.isFlare || observation.isLowEnergy) {
    return {
      primaryGap: 'none',
      message: 'In flare/low-energy mode - capturing minimal baseline only',
    };
  }

  // Priority order: outcome → meds timing → feature
  if (observation.outcomeMissing) {
    return {
      primaryGap: 'outcome',
      message: `Missing today's ${context.focus?.outcomeLabel || 'outcome'} check-in`,
    };
  }

  if (observation.medsTimingMissing && context.focus) {
    return {
      primaryGap: 'meds_timing',
      message: `Cannot evaluate "${context.focus.featureLabel} → ${context.focus.outcomeLabel}" without meds timing`,
    };
  }

  if (observation.focusDay < 3) {
    return {
      primaryGap: 'data',
      message: `Building baseline (Day ${observation.focusDay}/7) - collecting feature data`,
    };
  }

  return {
    primaryGap: 'none',
    message: 'Baseline captured - ready for insights',
  };
}

/**
 * Create a candidate action
 */
function createCandidate(
  type: WidgetType,
  label: string,
  reason: string
): ActionCandidate {
  const widget: WidgetSpec = {
    widgetId: crypto.randomUUID(),
    type,
    label,
    description: reason,
    writesTo: getWritesTo(type),
    reason,
  };

  return {
    id: crypto.randomUUID(),
    widget,
    scores: {
      value: 0,
      effort: 0,
      focusRelevance: 0,
      novelty: 0,
      confidence: 0,
    },
    totalScore: 0,
    rank: 0,
  };
}

/**
 * Get the table a widget writes to
 */
function getWritesTo(type: WidgetType): string {
  const mapping: Record<WidgetType, string> = {
    outcome_slider: 'day_observations',
    severity_slider: 'symptom_logs',
    flare_toggle: 'day_cards',
    start_time_picker: 'flare_sessions',
    drivers_chips: 'day_observations',
    meds_taken: 'med_logs',
    meds_time_picker: 'med_logs',
    sleep_quality: 'day_observations',
    short_note: 'notes',
    symptom_8char: 'episode_facts',
  };
  return mapping[type];
}

/**
 * Rank candidates by weighted score
 */
function rankCandidates(
  candidates: ActionCandidate[],
  context: MessageContext
): ActionCandidate[] {
  // Score each candidate
  const scored = candidates.map((candidate) => {
    const scores = scoreCandidate(candidate, context);
    const totalScore =
      scores.value * WEIGHTS.value +
      scores.effort * WEIGHTS.effort +
      scores.focusRelevance * WEIGHTS.focusRelevance +
      scores.confidence * WEIGHTS.confidence +
      scores.novelty * WEIGHTS.novelty;

    return {
      ...candidate,
      scores,
      totalScore,
    };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  return scored.map((c, i) => ({ ...c, rank: i + 1 }));
}

/**
 * Score a single candidate
 */
function scoreCandidate(
  candidate: ActionCandidate,
  context: MessageContext
): ActionCandidate['scores'] {
  const type = candidate.widget.type;

  // Value: how much clarity it unlocks
  let value = 0.5;
  if (type === 'outcome_slider') value = 0.9;
  if (type === 'meds_time_picker' && context.focus) value = 0.85;
  if (type === 'flare_toggle') value = 0.7;
  if (type === 'short_note') value = 0.3;

  // Effort: taps/time required (inverted - lower is better)
  let effort = 0.5;
  if (type === 'flare_toggle') effort = 0.9; // One tap = high score
  if (type === 'outcome_slider') effort = 0.8;
  if (type === 'short_note') effort = 0.3; // Typing = low score
  if (type === 'symptom_8char') effort = 0.2;

  // Focus relevance: direct tie to hypothesis
  let focusRelevance = 0.5;
  if (context.focus) {
    if (type === 'outcome_slider') focusRelevance = 1.0;
    if (type === 'meds_time_picker') focusRelevance = 0.8;
    if (type === 'sleep_quality') focusRelevance = 0.7;
  }

  // Novelty: not repeated recently (assume all are novel for now)
  const novelty = 0.8;

  // Confidence: likelihood it improves understanding
  let confidence = 0.6;
  if (type === 'outcome_slider') confidence = 0.95;
  if (type === 'meds_time_picker') confidence = 0.85;

  return { value, effort, focusRelevance, novelty, confidence };
}
