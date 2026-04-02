/**
 * Chat API Route (Three-Agent Architecture)
 *
 * Why this exists: Main entry point for the Clue AI chat. The route now uses a
 * focused pre-LLM Chat Agent for prompt construction, then runs the Graph
 * Reconciler and Insight Agent after streaming completes.
 *
 * Runtime flow:
 * 1. PRE-LLM: executeChatAgent builds the system prompt from memories, graph
 *    summary, extracted entities, and the latest stored clue.
 * 2. STREAMING: streamText handles the user-visible response and tool calls.
 * 3. POST-LLM: persist chat history, store long-term memory, run Graph
 *    Reconciler, then run Insight Agent if graph reconciliation succeeded.
 */

import {
  generateId,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from 'ai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { chatTools } from '@/backend/agents/clue/tools/chat-tools';
import {
  executeChatAgent,
  executeGraphReconciler,
  executeInsightAgent,
} from '@/backend/langgraph';
import { storeMemory } from '@/backend/lib/memory';
import { extractTextFromUIMessage, serializeUIMessage } from '@/lib/chat-ui-messages';

/**
 * Creates a privileged Supabase client for route-level persistence.
 * Why this exists: The post-stream handoff persists chat messages and launches
 * background agents using server-side service role access.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Checks whether a string is a UUID.
 * Why this exists: `chat_messages.conversation_id` expects a UUID, so route-
 * level smoke tests or malformed clients should fail soft rather than breaking
 * the entire post-turn handoff.
 */
function isUuid(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Returns the newest user-authored UI message in the request payload.
 * Why this exists: Persistence and memory storage should keep the exact
 * user-authored `UIMessage`, not a lossy text reconstruction.
 */
function getLatestUserMessage(messages: UIMessage[]): UIMessage | null {
  return [...messages].reverse().find((message) => message.role === 'user') ?? null;
}

/**
 * Persists the current user/assistant exchange to chat history.
 * Why this exists: The Graph Reconciler reads `chat_messages`, so the turn must
 * be saved before background reconciliation starts in full `UIMessage` format.
 */
async function persistTurnMessages(params: {
  conversationId?: string;
  userMessage: UIMessage;
  responseMessage: UIMessage;
}): Promise<void> {
  const { conversationId, userMessage, responseMessage } = params;
  if (!isUuid(conversationId)) {
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('chat_messages').insert([
    {
      conversation_id: conversationId,
      role: 'user',
      content: serializeUIMessage(userMessage),
    },
    {
      conversation_id: conversationId,
      role: 'assistant',
      content: serializeUIMessage(responseMessage),
    },
  ]);

  if (error) {
    throw new Error(`Failed to persist chat messages: ${error.message}`);
  }
}

/**
 * Runs the post-stream handoff for persistence and background agents.
 * Why this exists: Keeps the live user response fast while still ensuring the
 * new three-agent architecture receives the finished turn artifacts.
 */
async function runPostTurnAgents(params: {
  userId: string;
  conversationId?: string;
  userMessage: UIMessage;
  responseMessage: UIMessage;
}): Promise<void> {
  const { userId, conversationId, userMessage, responseMessage } = params;
  const userMessageText = extractTextFromUIMessage(userMessage);
  const assistantReply = extractTextFromUIMessage(responseMessage);

  await persistTurnMessages({ conversationId, userMessage, responseMessage });

  try {
    await storeMemory(userId, [
      { role: 'user', content: userMessageText },
      { role: 'assistant', content: assistantReply },
    ]);
  } catch (error) {
    console.warn('[chat/route] Memory storage failed:', error);
  }

  const graphResult = await executeGraphReconciler({ userId });
  if (!graphResult.success) {
    console.error('[chat/route] Graph Reconciler failed:', graphResult.errors);
    return;
  }

  const insightResult = await executeInsightAgent({ userId });
  if (!insightResult.success) {
    console.error('[chat/route] Insight Agent failed:', insightResult.errors);
  }
}

export async function POST(req: Request) {
  const {
    messages,
    userId,
    conversationId,
  }: {
    messages: UIMessage[];
    userId?: string;
    conversationId?: string;
  } = await req.json();

  const uid = userId || 'anonymous';

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 1: Pre-LLM orchestration via Chat Agent
  // ─────────────────────────────────────────────────────────────────────────
  // The Chat Agent builds the system prompt, but the route preserves streaming.
  
  const preLLMResult = await executeChatAgent({
    messages,
    userId: uid,
    conversationId,
  });

  if (!preLLMResult.success && preLLMResult.errors.length > 0) {
    console.error('[chat/route] Pre-LLM phase failed:', preLLMResult.errors);
    // Continue with empty system prompt — LLM will handle gracefully
  }

  const systemPrompt = preLLMResult.systemPrompt || '';
  const chatState = preLLMResult.state;
  const latestUserMessage = getLatestUserMessage(messages);

  if (chatState.nextClue) {
    console.log('[chat/route] Injecting clue:', chatState.nextClue.question);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 2: Stream the LLM response
  // ─────────────────────────────────────────────────────────────────────────
  // The system prompt was built by the Chat Agent; we stream here for UX.

  const result = streamText({
    model: 'openai/gpt-5.4',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: chatTools,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: generateId,
    onFinish: async ({ responseMessage }) => {
      if (uid !== 'anonymous' && latestUserMessage) {
        runPostTurnAgents({
          userId: uid,
          conversationId,
          userMessage: latestUserMessage,
          responseMessage,
        }).catch((err) => {
          console.error('[chat/route] Post-turn handoff failed:', err);
        });
      }
    },
  });
}
