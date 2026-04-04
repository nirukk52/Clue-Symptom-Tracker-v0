/**
 * Chat Agent LangGraph
 *
 * Why this exists: Defines the focused pre-LLM graph for the new Chat Agent so
 * conversational context building can evolve independently from graph
 * reconciliation and insight generation.
 */

import { END, START, StateGraph } from '@langchain/langgraph';

import { buildReplyContextNode } from './nodes/build-reply-context';
import { extractEntitiesNode } from './nodes/extract-entities';
import { loadContextNode } from './nodes/load-context';
import { resolveFollowupTurnNode } from './nodes/resolve-followup-turn';
import { ChatAgentState } from './state';

/**
 * Chat Agent node names.
 * Why this exists: Centralizes the graph vocabulary so executor logic and
 * debugging stay consistent as the architecture grows.
 */
export const CHAT_AGENT_NODE_NAMES = {
  RESOLVE_FOLLOWUP_TURN: 'ResolveFollowupTurn',
  EXTRACT_ENTITIES: 'ExtractEntities',
  LOAD_CONTEXT: 'LoadContext',
  BUILD_REPLY_CONTEXT: 'BuildReplyContext',
} as const;

/**
 * Builds the three-node Chat Agent graph.
 * Why this exists: The chat orchestration should stay small and deterministic:
 * normalize entities, load context, then assemble the prompt.
 */
export function createChatAgentGraph() {
  return new StateGraph(ChatAgentState)
    .addNode(CHAT_AGENT_NODE_NAMES.RESOLVE_FOLLOWUP_TURN, resolveFollowupTurnNode)
    .addNode(CHAT_AGENT_NODE_NAMES.EXTRACT_ENTITIES, extractEntitiesNode)
    .addNode(CHAT_AGENT_NODE_NAMES.LOAD_CONTEXT, loadContextNode)
    .addNode(CHAT_AGENT_NODE_NAMES.BUILD_REPLY_CONTEXT, buildReplyContextNode)
    .addEdge(START, CHAT_AGENT_NODE_NAMES.RESOLVE_FOLLOWUP_TURN)
    .addEdge(CHAT_AGENT_NODE_NAMES.RESOLVE_FOLLOWUP_TURN, CHAT_AGENT_NODE_NAMES.EXTRACT_ENTITIES)
    .addEdge(CHAT_AGENT_NODE_NAMES.EXTRACT_ENTITIES, CHAT_AGENT_NODE_NAMES.LOAD_CONTEXT)
    .addEdge(CHAT_AGENT_NODE_NAMES.LOAD_CONTEXT, CHAT_AGENT_NODE_NAMES.BUILD_REPLY_CONTEXT)
    .addEdge(CHAT_AGENT_NODE_NAMES.BUILD_REPLY_CONTEXT, END);
}
