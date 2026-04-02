/**
 * Chat Agent Executor
 *
 * Why this exists: Compiles and invokes the new Chat Agent graph so we can
 * migrate route-level orchestration incrementally without deleting the legacy
 * pipeline first.
 */

import type { UIMessage } from 'ai';

import { createThreadConfig, generateThreadId, getCheckpointer } from '../../checkpointer';
import { createChatAgentGraph } from './graph';
import type { ChatAgentStateType } from './state';

/**
 * Input payload for the Chat Agent.
 * Why this exists: The Chat Agent only needs conversation history plus the
 * identifiers required for context lookup and checkpoint isolation.
 */
export interface ExecuteChatAgentInput {
  messages: UIMessage[];
  userId?: string;
  conversationId?: string;
}

/**
 * Result payload returned by the Chat Agent.
 * Why this exists: The route only needs the assembled system prompt and the
 * final pre-LLM state for downstream orchestration.
 */
export interface ExecuteChatAgentResult {
  success: boolean;
  systemPrompt: string;
  state: ChatAgentStateType;
  errors: string[];
  threadId: string;
}

let compiledChatAgent:
  | ReturnType<ReturnType<typeof createChatAgentGraph>['compile']>
  | null = null;

/**
 * Returns a cached compiled Chat Agent graph.
 * Why this exists: LangGraph compilation is relatively expensive, so repeated
 * requests should reuse the same compiled workflow when possible.
 */
async function getCompiledChatAgent() {
  if (compiledChatAgent) {
    return compiledChatAgent;
  }

  const workflow = createChatAgentGraph();

  try {
    const checkpointer = await getCheckpointer();
    compiledChatAgent = workflow.compile({ checkpointer });
  } catch (error) {
    console.warn('[chat-agent/executor] Checkpointer unavailable, compiling without persistence:', error);
    compiledChatAgent = workflow.compile();
  }

  return compiledChatAgent;
}

/**
 * Executes the pre-LLM Chat Agent flow.
 * Why this exists: Gives the migration a clean entry point for prompt-building
 * without forcing the route to swap to the new post-turn agents yet.
 */
export async function executeChatAgent(
  input: ExecuteChatAgentInput
): Promise<ExecuteChatAgentResult> {
  const userId = input.userId || 'anonymous';
  const threadId = input.conversationId || generateThreadId(userId);

  try {
    const graph = await getCompiledChatAgent();
    const result = await graph.invoke(
      {
        messages: input.messages,
        userId,
        conversationId: input.conversationId || null,
      },
      createThreadConfig(threadId, 'chat-agent')
    );

    return {
      success: !(result.errors?.length > 0),
      systemPrompt: result.systemPrompt || '',
      state: result as ChatAgentStateType,
      errors: result.errors || [],
      threadId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat Agent execution failed';
    console.error('[chat-agent/executor] Failed:', error);

    return {
      success: false,
      systemPrompt: '',
      state: {} as ChatAgentStateType,
      errors: [message],
      threadId,
    };
  }
}
