/**
 * Information Gain Question Picker
 *
 * Why this exists: Deterministic question selection using information gain math.
 * Replaces LLM-based question picking which MediQ research shows LLMs are bad at.
 *
 * Algorithm:
 * 1. Get top conditions based on user's symptoms (scoreConditions)
 * 2. For each missing symptom from those conditions:
 *    - Compute information gain: how much would knowing this reduce entropy?
 *    - Apply safety multiplier for red-flag symptoms
 *    - Apply recency decay if we asked similar questions recently
 * 3. Return the highest-scoring question
 *
 * Zero LLM calls — pure computation.
 */

import { scoreConditions, getMissingSymptoms } from './health-kg';

// =============================================================================
// TYPES
// =============================================================================

export interface QuestionResult {
  question: string;
  priority: number;
  relatedSymptom: string;
  reasoning: string;
}

export interface InfoGainInput {
  knownSymptoms: string[];
  knownFactors: string[];
  recentQuestions?: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Red-flag symptoms that should be prioritized for safety.
 * Getting these checked first can catch serious conditions.
 */
const SAFETY_PRIORITY_SYMPTOMS = new Set([
  'chest pain',
  'chest pressure',
  'difficulty breathing',
  'shortness of breath',
  'severe headache',
  'slurred speech',
  'confusion',
  'numbness',
  'weakness of one side of the body',
  'fainting',
  'seizures',
  'vomiting blood',
  'blood in stool',
  'coughing up blood',
  'high fever',
  'thoughts of suicide',
  'severe pain',
  'rapid heartbeat',
  'racing heartbeat',
  'low blood pressure',
]);

/**
 * Question templates for different symptom types.
 */
const QUESTION_TEMPLATES = {
  yesNo: [
    'Have you been experiencing {symptom}?',
    'Have you noticed any {symptom}?',
    'Are you having any {symptom}?',
  ],
  severity: [
    'How severe is your {symptom} on a scale of 1-10?',
    'Can you rate your {symptom} from 1-10?',
  ],
  frequency: [
    'How often do you experience {symptom}?',
    'How frequently does the {symptom} occur?',
  ],
};

/**
 * Weights for the composite score formula.
 */
const WEIGHTS = {
  infoGain: 0.6,
  safety: 0.3,
  recency: 0.1,
};

// =============================================================================
// INFORMATION GAIN MATH
// =============================================================================

/**
 * Computes Shannon entropy: H(X) = -Σ p(x) * log2(p(x))
 */
function entropy(probabilities: number[]): number {
  let h = 0;
  for (const p of probabilities) {
    if (p > 0 && p < 1) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/**
 * Computes information gain for asking about a symptom.
 *
 * IG(Conditions, Symptom) = H(Conditions) - H(Conditions | Symptom)
 *
 * In practice, we approximate this as:
 * - High IG when symptom has high weight for top conditions but not all
 * - Low IG when symptom is shared by all conditions equally (doesn't discriminate)
 *
 * @param conditionProbs Current probability distribution over conditions
 * @param symptomWeights Weight of the symptom for each condition (0 if not associated)
 */
function computeInfoGain(
  conditionProbs: Map<string, number>,
  symptomWeights: Map<string, number>
): number {
  if (conditionProbs.size === 0) return 0;

  // Normalize condition probabilities
  const total = Array.from(conditionProbs.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  const probs: number[] = [];
  const adjustedProbs: number[] = [];

  for (const [condition, prob] of conditionProbs) {
    const normalizedProb = prob / total;
    probs.push(normalizedProb);

    // If symptom is present, how would it change our beliefs?
    const symptomWeight = symptomWeights.get(condition) || 0;
    // Bayes: P(C|S) ∝ P(S|C) * P(C) ≈ weight * prob
    const adjusted = normalizedProb * (1 + symptomWeight);
    adjustedProbs.push(adjusted);
  }

  // Normalize adjusted probabilities
  const adjustedTotal = adjustedProbs.reduce((a, b) => a + b, 0);
  const normalizedAdjusted = adjustedProbs.map(p => p / adjustedTotal);

  const currentEntropy = entropy(probs);
  const expectedEntropy = entropy(normalizedAdjusted);

  return Math.max(0, currentEntropy - expectedEntropy);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Picks the next best question to ask using information gain.
 * Completely deterministic — no LLM calls.
 *
 * @param input Known symptoms, factors, and recent questions
 * @returns Best question to ask, or null if no good candidates
 */
export function pickNextQuestion(input: InfoGainInput): QuestionResult | null {
  const { knownSymptoms, knownFactors, recentQuestions = [] } = input;

  // Step 1: Score conditions based on known symptoms
  const topConditions = scoreConditions(knownSymptoms, 5);

  if (topConditions.length === 0) {
    // No conditions matched — fall back to baseline questions
    return pickBaselineQuestion(knownSymptoms, knownFactors, recentQuestions);
  }

  // Build condition probability map
  const conditionProbs = new Map<string, number>();
  for (const { condition, probability } of topConditions) {
    conditionProbs.set(condition, probability);
  }

  // Step 2: Collect candidate symptoms from top conditions
  const candidateSymptoms = new Map<string, number>(); // symptom → max weight
  const symptomConditionWeights = new Map<string, Map<string, number>>(); // symptom → condition → weight

  for (const { condition } of topConditions) {
    const missing = getMissingSymptoms(condition, knownSymptoms, 20);
    for (const { symptom, weight } of missing) {
      // Track max weight across conditions
      if (!candidateSymptoms.has(symptom) || candidateSymptoms.get(symptom)! < weight) {
        candidateSymptoms.set(symptom, weight);
      }

      // Track per-condition weights for info gain calculation
      if (!symptomConditionWeights.has(symptom)) {
        symptomConditionWeights.set(symptom, new Map());
      }
      symptomConditionWeights.get(symptom)!.set(condition, weight);
    }
  }

  if (candidateSymptoms.size === 0) {
    return pickBaselineQuestion(knownSymptoms, knownFactors, recentQuestions);
  }

  // Step 3: Score each candidate symptom
  const recentLower = new Set(recentQuestions.map(q => q.toLowerCase()));
  const scoredSymptoms: Array<{
    symptom: string;
    score: number;
    infoGain: number;
    safetyScore: number;
    recencyScore: number;
  }> = [];

  for (const [symptom, maxWeight] of candidateSymptoms) {
    // Info gain
    const weights = symptomConditionWeights.get(symptom)!;
    const infoGain = computeInfoGain(conditionProbs, weights);

    // Safety score: 1.0 for red flags, 0.5 otherwise
    const safetyScore = SAFETY_PRIORITY_SYMPTOMS.has(symptom) ? 1.0 : 0.5;

    // Recency decay: penalize if we asked about this recently
    let recencyScore = 1.0;
    for (const recent of recentLower) {
      if (recent.includes(symptom) || symptom.includes(recent.split(' ')[0])) {
        recencyScore = 0.2;
        break;
      }
    }

    // Composite score
    const score =
      WEIGHTS.infoGain * (infoGain * 10) + // Scale info gain
      WEIGHTS.safety * safetyScore * 10 +
      WEIGHTS.recency * recencyScore * 10 +
      maxWeight; // Base weight as tiebreaker

    scoredSymptoms.push({ symptom, score, infoGain, safetyScore, recencyScore });
  }

  // Sort by score descending
  scoredSymptoms.sort((a, b) => b.score - a.score);

  const best = scoredSymptoms[0];
  if (!best) {
    return null;
  }

  // Step 4: Format question
  const template = QUESTION_TEMPLATES.yesNo[0];
  const question = template.replace('{symptom}', best.symptom);

  // Build reasoning
  const topConditionNames = topConditions.slice(0, 3).map(c => c.condition).join(', ');
  const reasoning = `This symptom would help distinguish between ${topConditionNames}. ` +
    `Info gain: ${best.infoGain.toFixed(2)}, ` +
    `Safety priority: ${best.safetyScore > 0.5 ? 'high' : 'normal'}`;

  return {
    question,
    priority: Math.round(best.score),
    relatedSymptom: best.symptom,
    reasoning,
  };
}

/**
 * Picks a baseline question when we don't have enough symptom data.
 * These are common health factors that affect most conditions.
 */
function pickBaselineQuestion(
  knownSymptoms: string[],
  knownFactors: string[],
  recentQuestions: string[]
): QuestionResult | null {
  // Keep baseline questions aligned with slot-backed factors to avoid yes/no loops.
  const baselineFactors = [
    { factor: 'sleep', question: 'How many hours did you sleep last night?', priority: 8 },
    { factor: 'stress', question: 'How would you rate your stress level today? (1-10)', priority: 7 },
    { factor: 'energy', question: 'How would you rate your energy level today? (1-10)', priority: 7 },
    { factor: 'mood', question: 'How would you rate your mood today? (1-10)', priority: 6 },
  ];

  const knownLower = new Set([...knownSymptoms, ...knownFactors].map(s => s.toLowerCase()));
  const recentLower = new Set(recentQuestions.map(q => q.toLowerCase()));

  for (const { factor, question, priority } of baselineFactors) {
    // Skip if we already know this
    if (isKnownFactor(factor, knownLower)) continue;

    // Skip if we asked recently
    let askedRecently = false;
    for (const recent of recentLower) {
      if (recent.includes(factor)) {
        askedRecently = true;
        break;
      }
    }
    if (askedRecently) continue;

    return {
      question,
      priority,
      relatedSymptom: factor,
      reasoning: 'Baseline question to establish health context',
    };
  }

  return null;
}

/**
 * Matches baseline factor labels to current graph vocabulary.
 * This exists so baseline prompts do not repeat when equivalent factors already exist.
 */
function isKnownFactor(factor: string, knownLower: Set<string>): boolean {
  const aliases: Record<string, string[]> = {
    sleep: ['sleep'],
    stress: ['stress'],
    energy: ['energy', 'fatigue', 'tired'],
    mood: ['mood', 'feeling'],
  };

  const candidateTerms = aliases[factor] ?? [factor];
  for (const known of knownLower) {
    for (const term of candidateTerms) {
      if (known === term || known.includes(term)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Gets multiple question candidates ranked by priority.
 * Useful for showing a queue of questions in the UI.
 *
 * @param input Known symptoms, factors, and recent questions
 * @param count How many questions to return
 */
export function pickTopQuestions(input: InfoGainInput, count = 3): QuestionResult[] {
  const questions: QuestionResult[] = [];
  const usedSymptoms = new Set<string>();
  const recentQuestions = [...(input.recentQuestions || [])];

  for (let i = 0; i < count; i++) {
    const result = pickNextQuestion({
      ...input,
      recentQuestions,
    });

    if (!result) break;
    if (usedSymptoms.has(result.relatedSymptom)) continue;

    questions.push(result);
    usedSymptoms.add(result.relatedSymptom);
    recentQuestions.push(result.question);
  }

  return questions;
}
