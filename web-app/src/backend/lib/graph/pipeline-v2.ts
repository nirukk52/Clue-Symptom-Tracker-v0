/**
 * Graph Update Pipeline v2 (OpenMed + Rasa + HealthKG)
 *
 * Why this exists: Replaces the custom LLM-based entity extraction with OSS tools:
 * - OpenMed: Biomedical NER for symptoms, medications, conditions
 * - Rasa: Dialogue state management and slot filling
 * - HealthKG: Deterministic condition scoring and question selection (kept from v1)
 *
 * Architecture:
 * 1. PRE-RESPONSE: Extract entities (OpenMed + LLM factors) → Update Rasa slots →
 *    Sync to Supabase → Score conditions (HealthKG) → Pick next question
 * 2. POST-RESPONSE: Update clues (LLM) → Delete resolved Unknown nodes
 */

import { upsertGraphNode, getUserGraph, deleteGraphNode, getNodesByType } from './index';
import { extractBiomedicalEntities, extractFactorsAsRasaEntities } from '../openmed';
import { sendMessage, getFilledSlots, type FilledSlots, type RasaEntity } from '../rasa';
import { scoreConditions, type ScoredCondition } from './health-kg';
import { pickNextQuestion, type QuestionResult } from './info-gain';
import { updateClues } from './update-clues';

// =============================================================================
// TYPES
// =============================================================================

export interface PrePipelineV2Result {
  success: boolean;
  entitiesExtracted: number;
  nodesCreated: number;
  slotsUpdated: string[];
  topConditions: ScoredCondition[];
  nextQuestion: QuestionResult | null;
  activeForm: string | null;
  errors: string[];
}

export interface PostPipelineV2Result {
  success: boolean;
  cluesGenerated: boolean;
  unknownsResolved: number;
  errors: string[];
}

export interface PipelineV2Input {
  userId: string;
  message: string;
}

// =============================================================================
// PRE-RESPONSE PIPELINE v2
// =============================================================================

/**
 * Runs BEFORE streamText. Extracts entities using OpenMed + LLM, updates Rasa
 * slots, syncs to Supabase, scores conditions, and picks next question.
 *
 * Latency: ~300-500ms (OpenMed + factor LLM in parallel, then Rasa)
 */
export async function runPreResponsePipelineV2(
  input: PipelineV2Input
): Promise<PrePipelineV2Result> {
  const result: PrePipelineV2Result = {
    success: false,
    entitiesExtracted: 0,
    nodesCreated: 0,
    slotsUpdated: [],
    topConditions: [],
    nextQuestion: null,
    activeForm: null,
    errors: [],
  };

  const { userId, message } = input;

  try {
    // Step 1: Extract entities in parallel (OpenMed + LLM factors)
    const [biomedicalEntities, factorEntities] = await Promise.all([
      extractBiomedicalEntities(message),
      extractFactorsAsRasaEntities(message),
    ]);

    result.entitiesExtracted = biomedicalEntities.length + factorEntities.length;
    console.log(
      `[pipeline-v2] Extracted ${biomedicalEntities.length} biomedical + ${factorEntities.length} factor entities`
    );

    // Step 2: Convert to Rasa entities and update slots
    const rasaEntities: RasaEntity[] = [
      ...biomedicalEntities.map((e) => ({
        entity: e.type === 'symptom' ? 'symptom_name' : 
                e.type === 'medication' ? 'medication_name' : 'condition_name',
        value: e.name,
        confidence: e.confidence,
      })),
      ...factorEntities,
    ];

    // Send to Rasa with pre-extracted entities
    await sendMessage(userId, message, rasaEntities);

    // Get updated slot state
    const filledSlots = await getFilledSlots(userId);
    result.activeForm = filledSlots.activeForm ?? null;

    // Track which slots were updated this turn
    result.slotsUpdated = getUpdatedSlotNames(filledSlots);
    console.log(`[pipeline-v2] Slots updated: ${result.slotsUpdated.join(', ') || 'none'}`);

    // Step 3: Sync filled slots to Supabase graph nodes
    let nodesCreated = 0;

    // Sync symptom
    if (filledSlots.currentSymptom) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'symptom',
        name: filledSlots.currentSymptom,
        subLabel: filledSlots.symptomSeverity
          ? `Severity ${filledSlots.symptomSeverity}/10`
          : undefined,
        data: filledSlots.symptomSeverity
          ? { severity: filledSlots.symptomSeverity }
          : undefined,
      });
      if (nodeId) nodesCreated++;
    }

    // Sync factors
    if (filledSlots.sleepQuality !== undefined) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'factor',
        name: 'Sleep',
        subLabel: `${filledSlots.sleepQuality} hours`,
        data: { hours: filledSlots.sleepQuality },
      });
      if (nodeId) nodesCreated++;
    }

    if (filledSlots.stressLevel !== undefined) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'factor',
        name: 'Stress',
        subLabel: `${filledSlots.stressLevel}/10`,
        data: { level: filledSlots.stressLevel },
      });
      if (nodeId) nodesCreated++;
    }

    if (filledSlots.energyLevel !== undefined) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'factor',
        name: 'Energy',
        subLabel: `${filledSlots.energyLevel}/10`,
        data: { level: filledSlots.energyLevel },
      });
      if (nodeId) nodesCreated++;
    }

    if (filledSlots.moodRating !== undefined) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'factor',
        name: 'Mood',
        subLabel: `${filledSlots.moodRating}/10`,
        data: { rating: filledSlots.moodRating },
      });
      if (nodeId) nodesCreated++;
    }

    // Sync medication
    if (filledSlots.currentMedication) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'medication',
        name: filledSlots.currentMedication,
      });
      if (nodeId) nodesCreated++;
    }

    // Sync condition
    if (filledSlots.currentCondition) {
      const nodeId = await upsertGraphNode(userId, {
        type: 'condition',
        name: filledSlots.currentCondition,
      });
      if (nodeId) nodesCreated++;
    }

    result.nodesCreated = nodesCreated;
    console.log(`[pipeline-v2] Created/updated ${nodesCreated} graph nodes`);

    // Step 4: Score conditions using HealthKG (if we have symptoms)
    const graphData = await getUserGraph(userId);
    const symptoms = graphData.nodes
      .filter((n) => n.type === 'symptom')
      .map((n) => n.label);

    if (symptoms.length > 0) {
      result.topConditions = scoreConditions(symptoms, 5);
      console.log(
        `[pipeline-v2] Top conditions: ${result.topConditions.map((c) => c.condition).join(', ')}`
      );
    }

    // Step 5: Pick next question using info-gain (HealthKG)
    // Only if Rasa form is complete (no active form) or form doesn't have a question
    if (!filledSlots.activeForm) {
      const knownFactors = graphData.nodes
        .filter((n) => n.type === 'factor')
        .map((n) => n.label);
      const recentQuestions = graphData.nodes
        .filter((n) => n.type === 'unknown')
        .map((n) => n.questionText || '')
        .filter(Boolean);

      result.nextQuestion = pickNextQuestion({
        knownSymptoms: symptoms,
        knownFactors,
        recentQuestions,
      });

      if (result.nextQuestion) {
        console.log(`[pipeline-v2] Next question: ${result.nextQuestion.question}`);
      }
    } else {
      console.log(`[pipeline-v2] Form active (${filledSlots.activeForm}), skipping question selection`);
    }

    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error('[pipeline-v2] Pre-response pipeline failed:', error);
  }

  return result;
}

// =============================================================================
// POST-RESPONSE PIPELINE v2
// =============================================================================

/**
 * Runs AFTER the response is streamed. Generates clues and resolves Unknown nodes
 * that have been answered (slots filled).
 */
export async function runPostResponsePipelineV2(
  input: PipelineV2Input,
  preResult?: PrePipelineV2Result
): Promise<PostPipelineV2Result> {
  const result: PostPipelineV2Result = {
    success: false,
    cluesGenerated: false,
    unknownsResolved: 0,
    errors: [],
  };

  const { userId } = input;

  try {
    // Step 1: Update clues (LLM-based insight generation)
    if (preResult?.nodesCreated && preResult.nodesCreated > 0) {
      await updateClues(userId);
      result.cluesGenerated = true;
      console.log('[pipeline-v2] Updated clues');
    }

    // Step 2: Resolve (delete) Unknown nodes that have been answered
    // If a slot was filled, check if there's a matching Unknown node
    if (preResult?.slotsUpdated && preResult.slotsUpdated.length > 0) {
      const unknownNodes = await getNodesByType(userId, 'unknown');
      
      for (const unknown of unknownNodes) {
        const shouldResolve = shouldResolveUnknown(unknown, preResult.slotsUpdated);
        if (shouldResolve) {
          await deleteGraphNode(userId, unknown.id);
          result.unknownsResolved++;
          console.log(`[pipeline-v2] Resolved unknown: ${unknown.label}`);
        }
      }
    }

    // Step 3: Create new Unknown node for next question (if we have one)
    if (preResult?.nextQuestion && !preResult.activeForm) {
      await upsertGraphNode(userId, {
        type: 'unknown',
        name: truncate(preResult.nextQuestion.question, 50),
        subLabel: 'Tap to answer',
        questionText: preResult.nextQuestion.question,
        questionPriority: preResult.nextQuestion.priority,
        data: {
          reasoning: preResult.nextQuestion.reasoning,
          relatedSymptom: preResult.nextQuestion.relatedSymptom,
        },
      });
    }

    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error('[pipeline-v2] Post-response pipeline failed:', error);
  }

  return result;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Gets the names of slots that have values (were updated).
 */
function getUpdatedSlotNames(slots: FilledSlots): string[] {
  const updated: string[] = [];
  
  if (slots.currentSymptom) updated.push('current_symptom');
  if (slots.symptomSeverity !== undefined) updated.push('symptom_severity');
  if (slots.sleepQuality !== undefined) updated.push('sleep_quality');
  if (slots.stressLevel !== undefined) updated.push('stress_level');
  if (slots.energyLevel !== undefined) updated.push('energy_level');
  if (slots.moodRating !== undefined) updated.push('mood_rating');
  if (slots.currentMedication) updated.push('current_medication');
  if (slots.currentCondition) updated.push('current_condition');
  
  return updated;
}

/**
 * Determines if an Unknown node should be resolved based on filled slots.
 */
function shouldResolveUnknown(
  unknown: { label: string; questionText?: string | null },
  filledSlots: string[]
): boolean {
  const questionLower = (unknown.questionText || unknown.label).toLowerCase();
  
  // Map slots to question keywords
  const slotKeywords: Record<string, string[]> = {
    sleep_quality: ['sleep', 'slept', 'hours'],
    stress_level: ['stress', 'stressed'],
    energy_level: ['energy', 'energetic', 'tired'],
    mood_rating: ['mood', 'feeling'],
    symptom_severity: ['severity', 'scale', '1-10', 'rate'],
    current_symptom: ['symptom', 'pain', 'hurts'],
  };
  
  for (const slot of filledSlots) {
    const keywords = slotKeywords[slot] || [];
    for (const keyword of keywords) {
      if (questionLower.includes(keyword)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

// Re-export types from dependencies
export type { ScoredCondition } from './health-kg';
export type { QuestionResult } from './info-gain';
