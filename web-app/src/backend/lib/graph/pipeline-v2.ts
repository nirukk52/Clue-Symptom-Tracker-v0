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
import {
  extractBiomedicalEntities,
  extractFactorsAsRasaEntities,
  isOpenMedHealthy,
  type NormalizedEntity,
} from '../openmed';
import {
  sendMessage,
  getFilledSlots,
  isRasaHealthy,
  type FilledSlots,
  type RasaEntity,
} from '../rasa';
import {
  buildFallbackValidatedClinicalEvents,
  buildValidatedClinicalEvents,
  projectValidatedEventsToGraph,
} from '../intake/events';
import {
  getActiveProblemThread,
  resolveActiveQuestionAnswer,
  resolveProblemThreads,
  selectActiveIntakeQuestion,
} from '../intake/questionnaire';
import { getIntakeState, saveIntakeState } from '../intake/state';
import type { ActiveIntakeQuestion, ValidatedClinicalEvent } from '../intake/types';
import { scoreConditions, type ScoredCondition } from './health-kg';
import { pickNextQuestion, type QuestionResult } from './info-gain';
import { updateClues } from './update-clues';

// Cache service health to avoid repeated checks within same request
let _openMedHealthy: boolean | null = null;
let _rasaHealthy: boolean | null = null;

async function checkServices(): Promise<{ openmed: boolean; rasa: boolean }> {
  if (_openMedHealthy === null || _rasaHealthy === null) {
    [_openMedHealthy, _rasaHealthy] = await Promise.all([
      isOpenMedHealthy(),
      isRasaHealthy(),
    ]);
  }
  return { openmed: _openMedHealthy, rasa: _rasaHealthy };
}

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
  intakeQuestion: ActiveIntakeQuestion | null;
  activeFlow: string | null;
  activeProblemThreadId: string | null;
  validatedEvents: ValidatedClinicalEvent[];
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
 * Runs BEFORE streamText. Extracts entities using OpenMed + LLM, optionally
 * updates Rasa slots (if available), syncs to Supabase, scores conditions,
 * and picks next question.
 *
 * Graceful degradation:
 * - If OpenMed is down: Skip biomedical extraction, rely on LLM factors only
 * - If Rasa is down: Skip dialogue state, create nodes directly from extractions
 *
 * Latency: ~300-500ms (OpenMed + factor LLM in parallel, then Rasa if available)
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
    intakeQuestion: null,
    activeFlow: null,
    activeProblemThreadId: null,
    validatedEvents: [],
    errors: [],
  };

  const { userId, message } = input;

  try {
    // Check service availability
    const services = await checkServices();
    console.log(`[pipeline-v2] Services: OpenMed=${services.openmed}, Rasa=${services.rasa}`);
    const intakeState = await getIntakeState(userId);

    // Step 1: Extract entities in parallel (OpenMed + LLM factors)
    // Gracefully handle OpenMed being down
    let biomedicalEntities: NormalizedEntity[] = [];
    let factorEntities: RasaEntity[] = [];

    const extractionPromises: Promise<void>[] = [];

    if (services.openmed) {
      extractionPromises.push(
        extractBiomedicalEntities(message).then((e) => {
          biomedicalEntities = e;
        })
      );
    } else {
      console.log('[pipeline-v2] OpenMed unavailable, skipping biomedical extraction');
    }

    // Always extract factors via LLM
    extractionPromises.push(
      extractFactorsAsRasaEntities(message).then((e) => {
        factorEntities = e;
      })
    );

    await Promise.all(extractionPromises);

    result.entitiesExtracted = biomedicalEntities.length + factorEntities.length;
    console.log(
      `[pipeline-v2] Extracted ${biomedicalEntities.length} biomedical + ${factorEntities.length} factor entities`
    );

    const threadResolution = resolveProblemThreads({
      existingThreads: intakeState.problemThreads,
      activeProblemThreadId: intakeState.activeProblemThreadId,
      biomedicalEntities,
      message,
    });
    const activeProblemThread = getActiveProblemThread(
      threadResolution.problemThreads,
      threadResolution.activeProblemThreadId
    );
    result.activeProblemThreadId = threadResolution.activeProblemThreadId;

    // Step 2: Update Rasa slots (if Rasa is available)
    let filledSlots: FilledSlots = {};
    let previousSlots: FilledSlots = {};
    const activeQuestionAnswer = resolveActiveQuestionAnswer(intakeState.activeQuestion, message);

    if (activeQuestionAnswer) {
      factorEntities = factorEntities.filter(
        (entity) => entity.entity !== activeQuestionAnswer.rasaEntity.entity
      );
      factorEntities.push(activeQuestionAnswer.rasaEntity);
      console.log(
        `[pipeline-v2] Resolved active intake answer: ${activeQuestionAnswer.rasaEntity.entity}=${activeQuestionAnswer.rasaEntity.value}`
      );
    }

    if (services.rasa) {
      previousSlots = await getFilledSlots(userId);
      const rasaEntities: RasaEntity[] = [
        ...biomedicalEntities.map((e) => ({
          entity: e.type === 'symptom' ? 'symptom_name' : 
                  e.type === 'medication' ? 'medication_name' : 'condition_name',
          value: e.name,
          confidence: e.confidence,
        })),
        ...factorEntities,
      ];

      await sendMessage(userId, message, rasaEntities);
      filledSlots = await getFilledSlots(userId);
      filledSlots = backfillMissingClinicalSlots(
        filledSlots,
        biomedicalEntities,
        activeProblemThread
      );
      result.activeFlow = filledSlots.activeForm ?? null;
      result.slotsUpdated = getChangedSlotNames(previousSlots, filledSlots);
      console.log(`[pipeline-v2] Rasa slots changed this turn: ${result.slotsUpdated.join(', ') || 'none'}`);
    } else {
      console.log('[pipeline-v2] Rasa unavailable, creating nodes directly from extractions');
    }

    // Step 3: Convert validated state changes into events before graph projection.
    const validatedEvents = services.rasa
      ? buildValidatedClinicalEvents({
          previousSlots,
          currentSlots: filledSlots,
          activeProblemThread,
        })
      : buildFallbackValidatedClinicalEvents({
          biomedicalEntities,
          factorEntities,
          activeProblemThread,
        });
    result.validatedEvents = validatedEvents;

    const nodesCreated = await projectValidatedEventsToGraph(userId, validatedEvents);

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

    // Step 5: Dynamic intake owns structured questions. Only ask exploratory
    // info-gain questions after intake yields control.
    result.intakeQuestion = selectActiveIntakeQuestion({
      intakeState: {
        ...intakeState,
        activeProblemThreadId: threadResolution.activeProblemThreadId,
        problemThreads: threadResolution.problemThreads,
        activeQuestion: intakeState.activeQuestion,
      },
      filledSlots,
      activeProblemThread,
    });

    await saveIntakeState(userId, {
      activeProblemThreadId: threadResolution.activeProblemThreadId,
      problemThreads: threadResolution.problemThreads,
      activeQuestion: result.intakeQuestion,
    });

    if (result.intakeQuestion) {
      console.log(`[pipeline-v2] Active intake question: ${result.intakeQuestion.id}`);
      result.success = true;
      return result;
    }

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

    // Step 2: Resolve exploratory Unknown nodes from validated symptom events.
    if (preResult?.validatedEvents && preResult.validatedEvents.length > 0) {
      const unknownNodes = await getNodesByType(userId, 'unknown');
      
      for (const unknown of unknownNodes) {
        const shouldResolve = shouldResolveUnknown(unknown, preResult.validatedEvents);
        if (shouldResolve) {
          await deleteGraphNode(userId, unknown.id);
          result.unknownsResolved++;
          console.log(`[pipeline-v2] Resolved unknown: ${unknown.label}`);
        }
      }
    }

    // Step 3: Create new Unknown node for next question (if we have one)
    if (preResult?.nextQuestion) {
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
 * Returns only slot names that changed in the current turn.
 * This prevents resolving Unknown nodes for stale slot values from prior turns.
 */
function getChangedSlotNames(previous: FilledSlots, current: FilledSlots): string[] {
  const changed: string[] = [];
  const slotMapping: Array<{ key: keyof FilledSlots; name: string }> = [
    { key: 'currentSymptom', name: 'current_symptom' },
    { key: 'symptomSeverity', name: 'symptom_severity' },
    { key: 'sleepQuality', name: 'sleep_quality' },
    { key: 'stressLevel', name: 'stress_level' },
    { key: 'energyLevel', name: 'energy_level' },
    { key: 'moodRating', name: 'mood_rating' },
    { key: 'currentMedication', name: 'current_medication' },
    { key: 'currentCondition', name: 'current_condition' },
  ];

  for (const { key, name } of slotMapping) {
    const before = previous[key];
    const after = current[key];
    const bothUnset = before == null && after == null;
    if (!bothUnset && before !== after) {
      changed.push(name);
    }
  }

  return changed;
}

/**
 * Backfills key clinical slots from extracted entities when a fresh Rasa session
 * does not retain the pre-seeded values for the current turn.
 */
function backfillMissingClinicalSlots(
  currentSlots: FilledSlots,
  biomedicalEntities: NormalizedEntity[],
  activeProblemThread: { symptomName?: string; conditionName?: string } | null
): FilledSlots {
  const symptomEntity = biomedicalEntities.find((entity) => entity.type === 'symptom');
  const medicationEntity = biomedicalEntities.find((entity) => entity.type === 'medication');
  const conditionEntity = biomedicalEntities.find((entity) => entity.type === 'condition');

  return {
    ...currentSlots,
    currentSymptom:
      currentSlots.currentSymptom ??
      symptomEntity?.name ??
      activeProblemThread?.symptomName,
    currentMedication: currentSlots.currentMedication ?? medicationEntity?.name,
    currentCondition:
      currentSlots.currentCondition ??
      conditionEntity?.name ??
      activeProblemThread?.conditionName,
  };
}

/**
 * Determines if an exploratory Unknown node should be resolved.
 * Why this exists: Unknown nodes now represent exploratory follow-up questions,
 * so they should only resolve when a validated symptom event answers them.
 */
function shouldResolveUnknown(
  unknown: { label: string; questionText?: string | null },
  validatedEvents: ValidatedClinicalEvent[]
): boolean {
  const questionLower = (unknown.questionText || unknown.label).toLowerCase();

  for (const event of validatedEvents) {
    if (event.type !== 'symptom_reported' && event.type !== 'symptom_severity_recorded') {
      continue;
    }

    if (questionLower.includes(event.symptomName.toLowerCase())) {
      return true;
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
