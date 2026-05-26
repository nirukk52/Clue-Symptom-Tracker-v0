/**
 * Chat Agent Module Exports
 *
 * Why this exists: Gives the new three-agent architecture a stable import
 * surface while it is being migrated in alongside the legacy pipeline.
 */

export {
  executeChatAgent,
  type ExecuteChatAgentInput,
  type ExecuteChatAgentResult,
} from './executor';
export { createChatAgentGraph, CHAT_AGENT_NODE_NAMES } from './graph';
export {
  ChatAgentState,
  type ChatAgentStateType,
  type ChatAgentStateUpdate,
  type NextClue,
} from './state';
