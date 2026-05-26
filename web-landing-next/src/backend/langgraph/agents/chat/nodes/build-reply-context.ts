/**
 * Chat Agent BuildReplyContext Node
 *
 * Why this exists: Converts raw context reads into the exact system prompt that
 * powers streaming while keeping clinical question selection outside the chat
 * model itself.
 */

import { buildSystemPrompt } from '@/backend/agents/clue/prompts/system';

import type { ChatAgentStateType, ChatAgentStateUpdate } from '../state';

const EXPLICIT_SEVERITY_PATTERN =
  /\b(?:10|[0-9])(?:\s*\/\s*10|\s+out\s+of\s+10)?\b|\b(?:mild|moderate|severe)\b/i;

/**
 * Detects whether the latest user turn already included an explicit severity.
 * Why this exists: Symptom turns without a severity should end after logging so
 * the UI slider can capture the missing detail before the next clue appears.
 */
function hasExplicitSeverity(text: string): boolean {
  return EXPLICIT_SEVERITY_PATTERN.test(text);
}

/**
 * Detects terse follow-up answers like "yes", "earlier today", or "meal and stress".
 * Why this exists: These replies usually complete the current logging thread and
 * should not have a queued clue appended into the same assistant message.
 */
function isShortFollowupReply(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return normalized.split(/\s+/).length <= 4;
}

/**
 * Decides whether the next clue should be deferred until the following turn.
 * Why this exists: Prompting alone is too soft for pacing; the Chat Agent must
 * deterministically suppress clue injection when severity capture is still open.
 */
function shouldDeferNextClueForSeverityCollection(state: ChatAgentStateType): boolean {
  if (!state.nextClue || state.isFlareMode || state.resolvedFollowupAction) {
    return false;
  }

  if (!state.userMessageText.trim()) {
    return false;
  }

  const mentionedSymptoms = state.extractedEntities.some((entity) => entity.type === 'symptom');
  if (!mentionedSymptoms) {
    return isShortFollowupReply(state.userMessageText);
  }

  return !hasExplicitSeverity(state.userMessageText);
}

/**
 * Builds the system prompt for the new Chat Agent.
 * Why this exists: The route should only stream the model response; prompt
 * assembly belongs in the pre-LLM orchestration graph.
 */
export async function buildReplyContextNode(
  state: ChatAgentStateType
): Promise<ChatAgentStateUpdate> {
  try {
    const deferNextClueForSeverityCollection = shouldDeferNextClueForSeverityCollection(state);

    return {
      deferNextClueForSeverityCollection,
      systemPrompt: buildSystemPrompt({
        memories: state.memories || undefined,
        graphSummary: state.graphSummary || undefined,
        isFlareMode: state.isFlareMode,
        extractedEntities: state.extractedEntities,
        turnResolution: state.turnResolution || undefined,
        nextClue: deferNextClueForSeverityCollection ? undefined : state.nextClue || undefined,
        deferNextClueForSeverityCollection,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to build chat system prompt';
    console.error('[chat-agent/build-reply-context] Failed:', error);

    return {
      deferNextClueForSeverityCollection: false,
      systemPrompt: '',
      errors: [message],
    };
  }
}
