/**
 * Graph Update Pipeline
 *
 * Why this exists: Orchestrates the graph update process around chat turns.
 * Split into PRE-response (before LLM generates reply) and POST-response
 * (after response is streamed).
 *
 * PRE-RESPONSE (blocking, ~300-400ms):
 * - extractEntities (LLM) → get symptoms from user message
 * - upsertGraphNodes → persist to DB
 * - scoreConditions (CSV lookup) → rank possible conditions
 * - pickNextQuestion (info-gain math) → determine best follow-up
 *
 * POST-RESPONSE (background, non-blocking):
 * - updateClues (LLM) → generate insight nodes
 *
 * This architecture ensures the next question is computed BEFORE the response
 * is generated, so the LLM can naturally include it in its reply.
 */

import type { AtomicFact } from '../memory';
import { upsertGraphNode, getUserGraph } from './index';
import { extractEntities, factsToEntities, type ExtractedEntity } from './extract-entities';
import { updateClues } from './update-clues';
import { pickNextQuestion as pickNextQuestionInfoGain, type QuestionResult } from './info-gain';
import { scoreConditions, type ScoredCondition } from './health-kg';
import { pickNextQuestions as pickNextQuestionsLLM } from './pick-next-question-llm';

// =============================================================================
// TYPES
// =============================================================================

export interface PrePipelineResult {
  success: boolean;
  entitiesExtracted: number;
  nodesCreated: number;
  topConditions: ScoredCondition[];
  nextQuestion: QuestionResult | null;
  errors: string[];
}

export interface PostPipelineResult {
  success: boolean;
  cluesGenerated: boolean;
  errors: string[];
}

export interface PrePipelineInput {
  userId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  atomicFacts?: AtomicFact[];
}

export interface PostPipelineInput {
  userId: string;
}

// Legacy types for backward compatibility
export interface PipelineResult {
  success: boolean;
  entitiesExtracted: number;
  nodesCreated: number;
  cluesGenerated: boolean;
  questionsGenerated: boolean;
  errors: string[];
}

export interface PipelineInput {
  userId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  atomicFacts?: AtomicFact[];
}

// =============================================================================
// PRE-RESPONSE PIPELINE
// =============================================================================

/**
 * Runs BEFORE streamText to extract entities, score conditions, and pick the
 * next question. Returns data to inject into the system prompt.
 *
 * Latency: ~300-400ms (mostly entity extraction LLM call)
 */
export async function runPreResponsePipeline(input: PrePipelineInput): Promise<PrePipelineResult> {
  const result: PrePipelineResult = {
    success: false,
    entitiesExtracted: 0,
    nodesCreated: 0,
    topConditions: [],
    nextQuestion: null,
    errors: [],
  };

  const { userId, messages, atomicFacts } = input;

  try {
    // Step 1: Extract entities from user message
    let entities: ExtractedEntity[];
    if (atomicFacts && atomicFacts.length > 0) {
      entities = factsToEntities(atomicFacts);
      console.log(`[graph-pipeline] Using ${atomicFacts.length} pre-extracted facts`);
    } else {
      entities = await extractEntities(messages);
      console.log(`[graph-pipeline] Extracted ${entities.length} entities from messages`);
    }
    result.entitiesExtracted = entities.length;

    // Step 2: Upsert entity nodes to DB
    let nodesCreated = 0;
    for (const entity of entities) {
      const nodeId = await upsertGraphNode(userId, {
        type: entity.type,
        name: entity.name,
        subLabel: entity.subLabel,
        data: entity.data,
      });
      if (nodeId) {
        nodesCreated++;
      }
    }
    result.nodesCreated = nodesCreated;
    console.log(`[graph-pipeline] Created/updated ${nodesCreated} nodes`);

    // Step 3: Score conditions using CSV lookup (NO LLM)
    const symptoms = entities
      .filter(e => e.type === 'symptom')
      .map(e => e.name);

    if (symptoms.length > 0) {
      result.topConditions = scoreConditions(symptoms, 5);
      console.log(`[graph-pipeline] Top conditions: ${result.topConditions.map(c => c.condition).join(', ')}`);
    }

    // Step 4: Pick next question using info-gain (NO LLM)
    const graphData = await getUserGraph(userId);
    const knownSymptoms = graphData.nodes
      .filter(n => n.type === 'symptom')
      .map(n => n.label);
    const knownFactors = graphData.nodes
      .filter(n => n.type === 'factor')
      .map(n => n.label);
    const recentQuestions = graphData.nodes
      .filter(n => n.type === 'unknown')
      .map(n => n.questionText || '')
      .filter(Boolean);

    result.nextQuestion = pickNextQuestionInfoGain({
      knownSymptoms,
      knownFactors,
      recentQuestions,
    });

    if (result.nextQuestion) {
      console.log(`[graph-pipeline] Next question: ${result.nextQuestion.question}`);
    } else {
      console.log('[graph-pipeline] No deterministic question found');
    }

    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error('[graph-pipeline] Pre-response pipeline failed:', error);
  }

  return result;
}

// =============================================================================
// POST-RESPONSE PIPELINE
// =============================================================================

/**
 * Runs AFTER the response is streamed. Generates clue (insight) nodes.
 * This is fire-and-forget — runs in background, doesn't block the user.
 *
 * Also persists the "unknown" node for the next question if we picked one
 * via info-gain, or falls back to LLM question generation if info-gain
 * returned nothing.
 */
export async function runPostResponsePipeline(
  input: PostPipelineInput,
  preResult?: PrePipelineResult
): Promise<PostPipelineResult> {
  const result: PostPipelineResult = {
    success: false,
    cluesGenerated: false,
    errors: [],
  };

  const { userId } = input;

  try {
    // Step 1: Update clues (LLM-based insight generation)
    if (preResult?.nodesCreated && preResult.nodesCreated > 0) {
      await updateClues(userId);
      result.cluesGenerated = true;
      console.log('[graph-pipeline] Updated clues');
    }

    // Step 2: Persist the next question as an "unknown" node
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
    } else {
      // Fallback: use LLM question picker if info-gain found nothing
      await pickNextQuestionsLLM(userId);
      console.log('[graph-pipeline] Used LLM fallback for questions');
    }

    result.success = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error('[graph-pipeline] Post-response pipeline failed:', error);
  }

  return result;
}

// =============================================================================
// LEGACY API (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use runPreResponsePipeline + runPostResponsePipeline instead.
 * Kept for backward compatibility with existing code.
 */
export async function runGraphPipeline(input: PipelineInput): Promise<PipelineResult> {
  const result: PipelineResult = {
    success: false,
    entitiesExtracted: 0,
    nodesCreated: 0,
    cluesGenerated: false,
    questionsGenerated: false,
    errors: [],
  };

  // Run both pipelines sequentially (old behavior)
  const preResult = await runPreResponsePipeline(input);
  result.entitiesExtracted = preResult.entitiesExtracted;
  result.nodesCreated = preResult.nodesCreated;
  result.errors.push(...preResult.errors);

  const postResult = await runPostResponsePipeline({ userId: input.userId }, preResult);
  result.cluesGenerated = postResult.cluesGenerated;
  result.questionsGenerated = true;
  result.errors.push(...postResult.errors);

  result.success = preResult.success && postResult.success;
  return result;
}

/**
 * Lightweight version of the pipeline that only updates clues and questions.
 * Use when entities are already in the graph (e.g., after tool-based logging).
 */
export async function runCluesAndQuestionsPipeline(userId: string): Promise<void> {
  try {
    await updateClues(userId);
    await pickNextQuestionsLLM(userId);
    console.log('[graph-pipeline] Updated clues and questions');
  } catch (error) {
    console.error('[graph-pipeline] Clues/questions pipeline failed:', error);
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

// Re-export types from health-kg for convenience
export type { ScoredCondition } from './health-kg';
export type { QuestionResult } from './info-gain';
