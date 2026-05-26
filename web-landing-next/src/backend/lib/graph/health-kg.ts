/**
 * HealthKnowledgeGraph Loader
 *
 * Why this exists: Provides deterministic condition scoring and missing symptom
 * lookups from the clinicalml/HealthKnowledgeGraph dataset. Replaces LLM-based
 * condition scoring which MediQ research shows LLMs are actively bad at.
 *
 * CSV format: "Diseases,Symptoms" where Symptoms is a comma-separated list
 * of "symptom_name (weight)" pairs.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface DiseaseSymptom {
  symptom: string;
  weight: number;
}

interface DiseaseEntry {
  disease: string;
  symptoms: Map<string, number>;
}

export interface ScoredCondition {
  condition: string;
  probability: number;
  matchedSymptoms: string[];
}

interface MissingSymptom {
  symptom: string;
  weight: number;
}

// =============================================================================
// SINGLETON LOADER
// =============================================================================

let _knowledgeGraph: Map<string, DiseaseEntry> | null = null;
let _symptomToConditions: Map<string, Array<{ condition: string; weight: number }>> | null = null;
let _allSymptoms: Set<string> | null = null;
const SYMPTOM_NOISE_WORDS = new Set(['a', 'an', 'and', 'in', 'my', 'of', 'the', 'with']);
const SYMPTOM_ALIAS_MAP = new Map<string, string>([
  ['dizzy', 'dizziness'],
  ['energy', 'fatigue'],
  ['energy level', 'fatigue'],
  ['exhausted', 'fatigue'],
  ['exhaustion', 'fatigue'],
  ['head hurts', 'headache'],
  ['head pain', 'headache'],
  ['low energy', 'fatigue'],
]);

/**
 * Parses symptom string like "pain (0.318), fever (0.119)" into array of {symptom, weight}
 */
function parseSymptomString(symptomsStr: string): DiseaseSymptom[] {
  const result: DiseaseSymptom[] = [];
  
  // Match pattern: "symptom_name (weight)"
  const regex = /([^(,]+)\s*\(([0-9.]+)\)/g;
  let match;
  
  while ((match = regex.exec(symptomsStr)) !== null) {
    const symptom = match[1].trim().toLowerCase();
    const weight = parseFloat(match[2]);
    if (symptom && !isNaN(weight)) {
      result.push({ symptom, weight });
    }
  }
  
  return result;
}

/**
 * Loads and parses the HealthKnowledgeGraph CSV.
 * Lazy singleton — only parses once on first access.
 */
function loadKnowledgeGraph(): Map<string, DiseaseEntry> {
  if (_knowledgeGraph !== null) {
    return _knowledgeGraph;
  }

  const csvPath = join(process.cwd(), 'data', 'health-kg.csv');
  
  try {
    const csvContent = readFileSync(csvPath, 'utf-8');
    // Split on \r\n (Windows), \r (old Mac), or \n (Unix) — the CSV uses \r\n
    const lines = csvContent.split(/\r\n|\r|\n/);
    
    _knowledgeGraph = new Map();
    _symptomToConditions = new Map();
    _allSymptoms = new Set();

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // CSV format: Disease,"symptom1 (w1), symptom2 (w2), ..."
      // Find first comma that's not inside quotes
      const firstComma = line.indexOf(',');
      if (firstComma === -1) continue;

      const disease = line.slice(0, firstComma).trim().toLowerCase();
      const symptomsRaw = line.slice(firstComma + 1).trim();
      
      // Remove surrounding quotes if present
      const symptomsStr = symptomsRaw.startsWith('"') && symptomsRaw.endsWith('"')
        ? symptomsRaw.slice(1, -1)
        : symptomsRaw;

      const symptoms = parseSymptomString(symptomsStr);
      const symptomMap = new Map<string, number>();

      for (const { symptom, weight } of symptoms) {
        symptomMap.set(symptom, weight);
        _allSymptoms!.add(symptom);

        // Build reverse index: symptom → conditions
        if (!_symptomToConditions!.has(symptom)) {
          _symptomToConditions!.set(symptom, []);
        }
        _symptomToConditions!.get(symptom)!.push({ condition: disease, weight });
      }

      _knowledgeGraph.set(disease, {
        disease,
        symptoms: symptomMap,
      });
    }

    console.log(`[health-kg] Loaded ${_knowledgeGraph.size} conditions, ${_allSymptoms.size} unique symptoms`);
  } catch (error) {
    console.error('[health-kg] Failed to load CSV:', error);
    _knowledgeGraph = new Map();
    _symptomToConditions = new Map();
    _allSymptoms = new Set();
  }

  return _knowledgeGraph;
}

/**
 * Gets the reverse index: symptom → conditions
 */
function getSymptomToConditions(): Map<string, Array<{ condition: string; weight: number }>> {
  loadKnowledgeGraph();
  return _symptomToConditions!;
}

/**
 * Tokenizes a symptom phrase into comparable semantic tokens.
 * Why this exists: User-entered symptom phrases often include filler words like
 * "in" or "my", which should not create distinct graph nodes.
 */
function tokenizeSymptomPhrase(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !SYMPTOM_NOISE_WORDS.has(token));
}

/**
 * Builds a stable comparison fingerprint for a symptom phrase.
 * Why this exists: Sorting the semantic tokens lets us match word-order variants
 * such as "pain in chest" and "chest pain" to the same canonical symptom.
 */
function buildSymptomFingerprint(value: string): string {
  return tokenizeSymptomPhrase(value).sort().join(' ');
}

/**
 * Resolves common plain-language symptom aliases before KG matching.
 * Why this exists: Users often say "head hurts" or "dizzy" instead of the
 * clinical noun phrase stored in the graph, and those variants should still
 * land on the same canonical symptom label.
 */
function resolveSymptomAlias(userInput: string): string | null {
  const comparableInput = tokenizeSymptomPhrase(userInput).join(' ');
  if (!comparableInput) {
    return null;
  }

  const directAlias = SYMPTOM_ALIAS_MAP.get(comparableInput);
  if (directAlias) {
    return directAlias;
  }

  const tokens = new Set(comparableInput.split(' '));
  if (tokens.has('dizzy')) {
    return 'dizziness';
  }

  if (tokens.has('head') && (tokens.has('hurt') || tokens.has('hurts') || tokens.has('pain'))) {
    return 'headache';
  }

  return null;
}

/**
 * Formats a symptom label for user-facing storage and display.
 * Why this exists: HealthKG stores normalized lowercase labels, but logs and the
 * graph should keep a consistent title-cased presentation.
 */
function formatSymptomLabel(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gets all known symptoms in the vocabulary.
 */
export function getAllSymptoms(): Set<string> {
  loadKnowledgeGraph();
  return _allSymptoms!;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Scores conditions based on user's symptoms using noisy-OR aggregation.
 * This is a deterministic lookup — no LLM needed.
 *
 * Noisy-OR model: P(D|S1,S2,...) ≈ 1 - Π(1 - P(S_i|D) * P(D))
 * Simplified: we sum log-odds for matched symptoms
 *
 * @param userSymptoms Array of symptom names (will be normalized to lowercase)
 * @param topK How many conditions to return (default 5)
 * @returns Top-K conditions sorted by probability descending
 */
export function scoreConditions(userSymptoms: string[], topK = 5): ScoredCondition[] {
  const kg = loadKnowledgeGraph();
  
  // Normalize user symptoms to lowercase
  const normalizedSymptoms = new Set(userSymptoms.map(s => s.toLowerCase().trim()));
  
  if (normalizedSymptoms.size === 0) {
    return [];
  }

  const conditionScores: Array<ScoredCondition> = [];

  for (const [conditionName, entry] of kg) {
    let score = 0;
    const matchedSymptoms: string[] = [];

    for (const userSymptom of normalizedSymptoms) {
      // Direct match
      if (entry.symptoms.has(userSymptom)) {
        score += entry.symptoms.get(userSymptom)!;
        matchedSymptoms.push(userSymptom);
        continue;
      }

      // Partial match: check if user symptom contains or is contained by known symptom
      for (const [knownSymptom, weight] of entry.symptoms) {
        if (userSymptom.includes(knownSymptom) || knownSymptom.includes(userSymptom)) {
          score += weight * 0.7; // Discount partial matches
          matchedSymptoms.push(knownSymptom);
          break;
        }
      }
    }

    if (matchedSymptoms.length > 0) {
      conditionScores.push({
        condition: conditionName,
        probability: score,
        matchedSymptoms,
      });
    }
  }

  // Sort by probability descending and take top-K
  return conditionScores
    .sort((a, b) => b.probability - a.probability)
    .slice(0, topK);
}

/**
 * Gets symptoms associated with a condition that the user hasn't reported.
 * These are candidates for follow-up questions.
 *
 * @param condition Condition name (will be normalized)
 * @param knownSymptoms Symptoms the user has already reported
 * @param topK How many missing symptoms to return (default 10)
 * @returns Missing symptoms sorted by weight descending
 */
export function getMissingSymptoms(
  condition: string,
  knownSymptoms: string[],
  topK = 10
): MissingSymptom[] {
  const kg = loadKnowledgeGraph();
  const entry = kg.get(condition.toLowerCase().trim());

  if (!entry) {
    return [];
  }

  const knownSet = new Set(knownSymptoms.map(s => s.toLowerCase().trim()));
  const missing: MissingSymptom[] = [];

  for (const [symptom, weight] of entry.symptoms) {
    // Skip if user already reported this symptom
    if (knownSet.has(symptom)) continue;

    // Skip if there's a partial match
    let isKnown = false;
    for (const known of knownSet) {
      if (symptom.includes(known) || known.includes(symptom)) {
        isKnown = true;
        break;
      }
    }
    if (isKnown) continue;

    missing.push({ symptom, weight });
  }

  return missing
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topK);
}

/**
 * Gets all conditions that could explain a given symptom.
 * Useful for understanding differential diagnosis.
 *
 * @param symptom Symptom name
 * @returns Conditions sorted by weight descending
 */
export function getConditionsForSymptom(symptom: string): Array<{ condition: string; weight: number }> {
  const index = getSymptomToConditions();
  const conditions = index.get(symptom.toLowerCase().trim()) || [];
  return [...conditions].sort((a, b) => b.weight - a.weight);
}

/**
 * Finds the closest matching symptom name in our vocabulary.
 * Returns null if no good match is found.
 *
 * @param userInput Raw symptom input from user
 * @returns Normalized symptom name or null
 */
export function normalizeSymptom(userInput: string): string | null {
  const symptoms = getAllSymptoms();
  const input = userInput.toLowerCase().trim();
  const inputTokens = tokenizeSymptomPhrase(input);
  const comparableInput = inputTokens.join(' ');
  const inputFingerprint = buildSymptomFingerprint(input);
  const aliasMatch = resolveSymptomAlias(input);

  if (aliasMatch && symptoms.has(aliasMatch)) {
    return aliasMatch;
  }

  // Exact match
  if (symptoms.has(input)) {
    return input;
  }

  // Match semantically equivalent phrases after removing filler words and order differences.
  for (const symptom of symptoms) {
    if (buildSymptomFingerprint(symptom) === inputFingerprint && inputFingerprint) {
      return symptom;
    }
  }

  // Check for contains match
  for (const symptom of symptoms) {
    const symptomTokens = tokenizeSymptomPhrase(symptom);
    const comparableSymptom = symptomTokens.join(' ');
    const hasMeaningfulSubstringMatch =
      inputTokens.length >= 2 &&
      symptomTokens.length >= 2 &&
      (symptom.includes(input) || input.includes(symptom));
    const hasMeaningfulPhraseMatch =
      inputTokens.length >= 2 &&
      symptomTokens.length >= 2 &&
      ((comparableInput && comparableSymptom.includes(comparableInput)) ||
        (comparableSymptom && comparableInput.includes(comparableSymptom)));

    if (hasMeaningfulSubstringMatch || hasMeaningfulPhraseMatch) {
      return symptom;
    }
  }

  return null;
}

/**
 * Returns the canonical display label for a symptom name when possible.
 * Why this exists: All symptom writes should converge on one stable label even
 * when the model or the user phrases the same symptom slightly differently.
 */
export function canonicalizeSymptomName(userInput: string): string {
  return formatSymptomLabel(normalizeSymptom(userInput) ?? userInput.trim());
}
