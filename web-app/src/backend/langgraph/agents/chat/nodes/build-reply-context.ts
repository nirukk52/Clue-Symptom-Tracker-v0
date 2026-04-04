/**
 * Chat Agent BuildReplyContext Node
 *
 * Why this exists: Converts raw context reads into the exact system prompt that
 * powers streaming while keeping clinical question selection outside the chat
 * model itself.
 */

import { buildSystemPrompt } from '@/backend/agents/clue/prompts/system';
import { setActiveUserId } from '@/backend/agents/clue/tools/chat-tools';

import type { ChatAgentStateType, ChatAgentStateUpdate } from '../state';

/**
 * Builds the system prompt for the new Chat Agent.
 * Why this exists: The route should only stream the model response; prompt
 * assembly belongs in the pre-LLM orchestration graph.
 */
export async function buildReplyContextNode(
  state: ChatAgentStateType
): Promise<ChatAgentStateUpdate> {
  try {
    setActiveUserId(state.userId);

    return {
      systemPrompt: buildSystemPrompt({
        memories: state.memories || undefined,
        graphSummary: state.graphSummary || undefined,
        isFlareMode: state.isFlareMode,
        extractedEntities: state.extractedEntities,
        turnResolution: state.turnResolution || undefined,
        nextClue: state.nextClue || undefined,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to build chat system prompt';
    console.error('[chat-agent/build-reply-context] Failed:', error);

    return {
      systemPrompt: '',
      errors: [message],
    };
  }
}
