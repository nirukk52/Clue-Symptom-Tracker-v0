/**
 * Graph Reconciler State
 *
 * Why this exists: Defines the single-writer working memory for reconciling raw
 * logs and conversation history into clean graph nodes and edges.
 */

import { Annotation } from '@langchain/langgraph';

import type { GraphData, GraphNodeType } from '@/backend/lib/graph';

/**
 * Lightweight symptom log record used by the Graph Agent.
 * Why this exists: Reconciliation only needs the fields required to turn new
 * logs into normalized graph entities.
 */
export interface SymptomLogRecord {
  id: string;
  symptom_name: string;
  severity: number | null;
  notes: string | null;
  logged_at: string;
}

/**
 * Lightweight medication log record used by the Graph Agent.
 * Why this exists: Medication logs seed medication nodes and treatment edges.
 */
export interface MedicationLogRecord {
  id: string;
  medication_name: string;
  dosage: string | null;
  notes: string | null;
  logged_at: string;
}

/**
 * Lightweight mood log record used by the Graph Agent.
 * Why this exists: Mood is currently treated as a factor node during graph
 * reconciliation, so only the numeric payload is required.
 */
export interface MoodLogRecord {
  id: string;
  rating: number;
  notes: string | null;
  logged_at: string;
}

/**
 * Simplified chat message record used during reconciliation.
 * Why this exists: The Graph Agent only needs role, content, and timing to run
 * NER and factor extraction over the recent exchange.
 */
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Normalized entity candidate for graph reconciliation.
 * Why this exists: The Graph Agent merges entities from log tables, OpenMed,
 * and factor extraction before deduplicating graph writes.
 */
export interface ReconciledEntity {
  type: GraphNodeType;
  name: string;
  source: 'log' | 'openmed' | 'factor_extractor';
  timestamp?: string;
  severity?: number | null;
  value?: number | null;
  notes?: string | null;
}

/**
 * Grouped recent logs fetched since the last reconciliation cursor.
 * Why this exists: The ReadState node should hand downstream nodes a single
 * snapshot rather than scattering table-specific arrays around the state.
 */
export interface RecentLogs {
  symptomLogs: SymptomLogRecord[];
  medicationLogs: MedicationLogRecord[];
  moodLogs: MoodLogRecord[];
}

/**
 * Graph Reconciler state root.
 * Why this exists: Keeps graph-writing responsibilities isolated from chat and
 * insight logic while preserving a typed contract for future nodes.
 */
export const GraphReconcilerState = Annotation.Root({
  /**
   * User identifier whose graph is being reconciled.
   */
  userId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'anonymous',
  }),

  /**
   * Watermark timestamp from agent_cursors.
   */
  cursorAt: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * New structured logs since the last successful reconciliation.
   */
  recentLogs: Annotation<RecentLogs>({
    reducer: (_, next) => next,
    default: () => ({
      symptomLogs: [],
      medicationLogs: [],
      moodLogs: [],
    }),
  }),

  /**
   * Recent conversation messages used to recover missed entities.
   */
  recentMessages: Annotation<ConversationMessage[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Current graph snapshot for deduplication and edge updates.
   */
  currentGraph: Annotation<GraphData>({
    reducer: (_, next) => next,
    default: () => ({ nodes: [], edges: [] }),
  }),

  /**
   * High-confidence entities coming directly from structured logs.
   */
  logEntities: Annotation<ReconciledEntity[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Additional entities recovered from OpenMed or factor extraction.
   */
  gapEntities: Annotation<ReconciledEntity[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Count of nodes written during the run.
   */
  nodesUpserted: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  /**
   * Count of edges written during the run.
   */
  edgesUpserted: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  /**
   * Reconciliation errors for retry and debugging flows.
   */
  errors: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
});

/**
 * Concrete state shape for Graph Agent nodes.
 */
export type GraphReconcilerStateType = typeof GraphReconcilerState.State;

/**
 * Partial state update returned by Graph Agent nodes.
 */
export type GraphReconcilerStateUpdate = Partial<GraphReconcilerStateType>;
