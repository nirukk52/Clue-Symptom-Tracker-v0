/**
 * Chat Agent State
 *
 * Why this exists: Defines the focused pre-LLM working memory for the new Chat
 * Agent so it can prepare reply context without inheriting intake- or graph-
 * reconciliation-specific state from the legacy pipeline.
 */

import { Annotation } from '@langchain/langgraph';

import type { UIMessage } from 'ai';

import type { NormalizedEntity } from '@/backend/lib/openmed';

/**
 * The latest clue produced by the Insight Agent.
 * Why this exists: The Chat Agent needs one structured follow-up directive that
 * can be injected into the system prompt without recomputing clinical logic.
 */
export interface NextClue {
  question: string;
  reasoning: string;
  priority: number;
}

/**
 * Chat Agent state root.
 * Why this exists: Keeps the new three-node Chat Agent small, explicit, and
 * independent from the legacy deterministic intake pipeline.
 */
export const ChatAgentState = Annotation.Root({
  /**
   * Full UI message history for the conversation.
   */
  messages: Annotation<UIMessage[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * User identifier used for memory and database reads.
   */
  userId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => 'anonymous',
  }),

  /**
   * Conversation identifier used for checkpoint isolation.
   */
  conversationId: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * Flattened text from the latest user turn.
   */
  userMessageText: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),

  /**
   * Biomedical entities normalized by OpenMed before the LLM runs.
   */
  extractedEntities: Annotation<NormalizedEntity[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  /**
   * Relevant long-term memory snippets from Mem0.
   */
  memories: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * Text summary of the current health graph.
   */
  graphSummary: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * The single follow-up clue to ask on the next turn, if available.
   */
  nextClue: Annotation<NextClue | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /**
   * Whether the user is currently in low-energy flare mode.
   */
  isFlareMode: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),

  /**
   * Fully assembled system prompt handed to streamText.
   */
  systemPrompt: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),

  /**
   * Per-run errors collected during pre-LLM orchestration.
   */
  errors: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
});

/**
 * Concrete state shape for Chat Agent nodes.
 */
export type ChatAgentStateType = typeof ChatAgentState.State;

/**
 * Partial state update returned by Chat Agent nodes.
 */
export type ChatAgentStateUpdate = Partial<ChatAgentStateType>;
