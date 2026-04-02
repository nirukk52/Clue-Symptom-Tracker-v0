/**
 * Insight Agent State
 *
 * Why this exists: Defines the read-only clinical reasoning state that turns a
 * clean graph into a single next-best question for the Chat Agent.
 */

import { Annotation } from '@langchain/langgraph';

import type { GraphEdge, GraphNode } from '@/backend/lib/graph';
import type { ScoredCondition } from '@/backend/lib/graph/health-kg';

/**
 * Stored clue payload produced by the Insight Agent.
 * Why this exists: The output needs a stable shape so it can be persisted to
 * the insights table and later injected back into the Chat Agent prompt.
 */
export interface GeneratedClue {
  question: string;
  reasoning: string;
  priority: number;
}

/**
 * Insight Agent state root.
 * Why this exists: Keeps clinical scoring and question selection independent
 * from chat orchestration and graph-writing concerns.
 */
export const InsightAgentState = Annotation.Root({
  /**
   * User identifier whose graph is being analyzed.
   */
  userId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'anonymous',
  }),

  /**
   * Symptom nodes from the clean user graph.
   */
  symptomNodes: Annotation<GraphNode[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Factor nodes from the clean user graph.
   */
  factorNodes: Annotation<GraphNode[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Condition nodes from the clean user graph.
   */
  conditionNodes: Annotation<GraphNode[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Medication nodes from the clean user graph.
   */
  medicationNodes: Annotation<GraphNode[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Graph edges used for correlation-aware fallback question generation.
   */
  edges: Annotation<GraphEdge[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Lowercased symptom names currently known for the user.
   */
  knownSymptoms: Annotation<Set<string>>({
    reducer: (_, next) => next,
    default: () => new Set<string>(),
  }),

  /**
   * Top scored candidate conditions from the HealthKG matcher.
   */
  topConditions: Annotation<ScoredCondition[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * The single clue selected for the next turn.
   */
  clue: Annotation<GeneratedClue | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * Inserted insight row ID once the clue is persisted.
   */
  insightId: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * Insight generation errors for debugging and retry flows.
   */
  errors: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
});

/**
 * Concrete state shape for Insight Agent nodes.
 */
export type InsightAgentStateType = typeof InsightAgentState.State;

/**
 * Partial state update returned by Insight Agent nodes.
 */
export type InsightAgentStateUpdate = Partial<InsightAgentStateType>;
