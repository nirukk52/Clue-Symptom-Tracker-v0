/**
 * Chat Agent ExtractEntities Node
 *
 * Why this exists: Runs the light pre-LLM OpenMed pass so the model gets
 * normalized clinical names before it decides which logging tools to call.
 */

import type { UIMessage } from 'ai';

import { extractBiomedicalEntities } from '@/backend/lib/openmed';

import type { ChatAgentStateType, ChatAgentStateUpdate } from '../state';

/**
 * Flattens the latest user message into plain text for biomedical extraction.
 * Why this exists: UI messages store content as typed parts rather than a
 * single string, but OpenMed expects raw text.
 */
function extractLastUserMessageText(messages: UIMessage[]): string {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (!lastUserMessage?.parts) {
    return '';
  }

  return lastUserMessage.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim();
}

/**
 * Extracts normalized biomedical entities from the latest user turn.
 * Why this exists: The Chat Agent should front-load symptom, condition, and
 * medication normalization before the conversational model starts tool calling.
 */
export async function extractEntitiesNode(
  state: ChatAgentStateType
): Promise<ChatAgentStateUpdate> {
  try {
    const userMessageText = extractLastUserMessageText(state.messages);
    const extractedEntities = userMessageText
      ? await extractBiomedicalEntities(userMessageText)
      : [];

    return {
      userMessageText,
      extractedEntities,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract biomedical entities';
    console.error('[chat-agent/extract-entities] Failed:', error);

    return {
      userMessageText: '',
      extractedEntities: [],
      errors: [message],
    };
  }
}
