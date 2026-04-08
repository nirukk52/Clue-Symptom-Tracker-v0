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
  type NextClue,
} from '@/backend/langgraph';
import { getChatModel, type ChatModelProvider } from '@/backend/lib/ai/providers';
import { canonicalizeSymptomName } from '@/backend/lib/graph/health-kg';
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
 * Minimal user preference row used for queued clue handoff writes.
 * Why this exists: The route only needs the one pending clue slot and should
 * avoid coupling turn pacing writes to the rest of the preferences schema.
 */
interface PendingQuestionPreferenceRow {
  pending_next_question: string | null;
}

/**
 * Serializes a queued next clue for the follow-up handoff slot.
 * Why this exists: The queued clue must survive the post-turn background work so
 * the next severity reply can deterministically consume it.
 */
function serializePendingNextQuestion(nextClue: NextClue): string {
  return JSON.stringify({
    question: nextClue.question,
    reasoning: nextClue.reasoning,
    priority: nextClue.priority,
  });
}

/**
 * Detects whether a tool result asks the client to render a rating slider.
 * Why this exists: The post-turn handoff should queue the next clue only after a
 * reply that intentionally stopped to collect missing severity.
 */
function isRatingSliderOutput(output: unknown): boolean {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const candidate = output as { interactive?: unknown; type?: unknown };
  return (
    candidate.interactive === true &&
    (candidate.type === 'severity-slider' || candidate.type === 'rating-slider')
  );
}

/**
 * Checks whether the assistant response included a severity collection UI.
 * Why this exists: This is the deterministic signal that the turn should queue
 * the next clue for later instead of asking it immediately.
 */
function responseRequestsSeverityFollowup(responseMessage: UIMessage): boolean {
  return responseMessage.parts.some((part) => {
    if (!part.type.startsWith('tool-')) {
      return false;
    }

    if (!('state' in part) || (part.state !== 'output-available' && part.state !== 'done')) {
      return false;
    }

    return 'output' in part && isRatingSliderOutput(part.output);
  });
}

/**
 * Upserts the queued next clue into user preferences.
 * Why this exists: The clue should be available on the next turn even if the
 * user answers the severity slider before insight hydration catches up.
 */
async function setPendingNextQuestion(
  supabase: SupabaseClient,
  userId: string,
  nextClue: NextClue | null
): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        pending_next_question: nextClue ? serializePendingNextQuestion(nextClue) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    throw new Error(`Failed to update pending next question: ${error.message}`);
  }
}

/**
 * Loads the latest active next-question clue from the insight queue.
 * Why this exists: Post-turn pacing needs the freshly generated clue so the next
 * severity reply can ask it without waiting for another background fetch.
 */
async function getLatestQueuedClue(
  supabase: SupabaseClient,
  userId: string
): Promise<NextClue | null> {
  const { data, error } = await supabase
    .from('insights')
    .select('content, reasoning, priority')
    .eq('user_id', userId)
    .eq('type', 'next_question')
    .neq('status', 'dismissed')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load latest queued clue: ${error.message}`);
  }

  if (!data?.content) {
    return null;
  }

  return {
    question: data.content,
    reasoning:
      typeof data.reasoning === 'string' && data.reasoning.trim()
        ? data.reasoning.trim()
        : 'This clue was selected from the latest graph-based insight pass.',
    priority: typeof data.priority === 'number' ? data.priority : 0,
  };
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
 * Returns the latest user-authored message before the newest user turn.
 * Why this exists: Deterministic fallbacks sometimes need the previous user
 * label when the Chat Agent could not resolve a terse numeric reply.
 */
function getPreviousUserMessage(messages: UIMessage[]): UIMessage | null {
  let seenLatestUser = false;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== 'user') {
      continue;
    }

    if (!seenLatestUser) {
      seenLatestUser = true;
      continue;
    }

    return message;
  }

  return null;
}

/**
 * Parses a bare numeric follow-up reply.
 * Why this exists: Numeric severity turns should be handled deterministically
 * even if the Chat Agent does not resolve them on one specific path.
 */
function parseNumericReply(text: string): number | null {
  const match = text.trim().match(/^([0-9]|10)(?:\s*\/\s*10)?$/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isInteger(value) && value >= 0 && value <= 10 ? value : null;
}

/**
 * Builds a conservative fallback action for terse numeric replies.
 * Why this exists: The route should still protect user-facing logging flows if
 * the upstream chat node could not fully resolve the target.
 */
function inferFallbackResolvedFollowupAction(messages: UIMessage[]):
  | { kind: 'update_symptom_severity'; symptomName?: string; severity: number }
  | { kind: 'update_latest_unrated_symptom_severity'; symptomName?: string; severity: number }
  | null {
  const latestUserMessage = getLatestUserMessage(messages);
  if (!latestUserMessage) {
    return null;
  }

  const rating = parseNumericReply(extractTextFromUIMessage(latestUserMessage));
  if (rating === null) {
    return null;
  }

  const previousUserMessage = getPreviousUserMessage(messages);
  const previousUserText = previousUserMessage
    ? extractTextFromUIMessage(previousUserMessage).trim().toLowerCase()
    : '';
  if (previousUserText === 'energy') {
    return {
      kind: 'update_symptom_severity',
      symptomName: 'Fatigue',
      severity: rating,
    };
  }

  if (previousUserText && previousUserText.split(/\s+/).length <= 3) {
    return {
      kind: 'update_latest_unrated_symptom_severity',
      severity: rating,
    };
  }

  return null;
}

/**
 * Persists the current user/assistant exchange to chat history.
 * Why this exists: The Graph Reconciler reads `chat_messages`, so the turn must
 * be saved before background reconciliation starts in full `UIMessage` format.
 */
async function persistTurnMessages(params: {
  conversationId?: string;
  userId: string;
  userMessage: UIMessage;
  responseMessage: UIMessage;
}): Promise<void> {
  const { conversationId, userId, userMessage, responseMessage } = params;
  if (!isUuid(conversationId)) {
    return;
  }

  const supabase = getSupabase();
  await ensureConversationExists(supabase, conversationId, userId);
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

  const { error: updateError } = await supabase
    .from('chat_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    console.warn('[chat/route] Failed to update conversation timestamp:', updateError);
  }
}

/**
 * Ensures the referenced conversation row exists before message persistence.
 * Why this exists: The post-turn handoff must not fail if the client supplies a
 * valid UUID whose conversation row was not persisted or was created out of band.
 */
async function ensureConversationExists(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify conversation: ${error.message}`);
  }

  if (data?.id) {
    return;
  }

  const { error: insertError } = await supabase.from('chat_conversations').insert({
    id: conversationId,
    user_id: userId,
  });

  if (insertError) {
    throw new Error(`Failed to create missing conversation: ${insertError.message}`);
  }
}

/**
 * Applies one resolved follow-up action before the model responds.
 * Why this exists: Explicit rating replies should update durable symptom state
 * deterministically when the Chat Agent has already resolved the target.
 */
async function applyResolvedFollowupAction(params: {
  userId: string;
  action:
    | { kind: 'update_symptom_severity'; symptomName?: string; severity: number }
    | { kind: 'update_latest_unrated_symptom_severity'; symptomName?: string; severity: number }
    | null;
}): Promise<void> {
  const { userId, action } = params;
  if (!action) {
    return;
  }

  const supabase = getSupabase();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const notes = `User confirmed severity as ${action.severity}/10 in direct follow-up.`;

  if (action.kind === 'update_latest_unrated_symptom_severity') {
    const { data: recentUnratedLog, error: recentUnratedLogError } = await supabase
      .from('symptom_logs')
      .select('id, symptom_name')
      .eq('user_id', userId)
      .or('severity.is.null,severity.eq.0')
      .gte('logged_at', fiveMinAgo)
      .order('logged_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (recentUnratedLogError) {
      throw new Error(`Failed to load recent unrated symptom log: ${recentUnratedLogError.message}`);
    }

    if (!recentUnratedLog?.id || !recentUnratedLog.symptom_name) {
      return;
    }

    const canonicalSymptomName = canonicalizeSymptomName(recentUnratedLog.symptom_name);
    const { error: updateLogError } = await supabase
      .from('symptom_logs')
      .update({ severity: action.severity, notes })
      .eq('id', recentUnratedLog.id);

    if (updateLogError) {
      throw new Error(`Failed to update unrated symptom log: ${updateLogError.message}`);
    }

    const { error: updateTimelineError } = await supabase
      .from('timeline_entries')
      .update({ severity: action.severity, description: notes })
      .eq('user_id', userId)
      .ilike('title', canonicalSymptomName)
      .gte('entry_time', fiveMinAgo);

    if (updateTimelineError) {
      throw new Error(`Failed to update unrated timeline entry: ${updateTimelineError.message}`);
    }

    return;
  }

  if (!action.symptomName) {
    return;
  }

  const canonicalSymptomName = canonicalizeSymptomName(action.symptomName);
  const { data: recentLog, error: recentLogError } = await supabase
    .from('symptom_logs')
    .select('id')
    .eq('user_id', userId)
    .ilike('symptom_name', canonicalSymptomName)
    .gte('logged_at', fiveMinAgo)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentLogError) {
    throw new Error(`Failed to load recent symptom log: ${recentLogError.message}`);
  }

  if (recentLog?.id) {
    const { error: updateLogError } = await supabase
      .from('symptom_logs')
      .update({ severity: action.severity, notes })
      .eq('id', recentLog.id);

    if (updateLogError) {
      throw new Error(`Failed to update symptom log: ${updateLogError.message}`);
    }

    const { error: updateTimelineError } = await supabase
      .from('timeline_entries')
      .update({ severity: action.severity, description: notes })
      .eq('user_id', userId)
      .ilike('title', canonicalSymptomName)
      .gte('entry_time', fiveMinAgo);

    if (updateTimelineError) {
      throw new Error(`Failed to update timeline entry: ${updateTimelineError.message}`);
    }

    return;
  }

  const { error: insertLogError } = await supabase.from('symptom_logs').insert({
    user_id: userId,
    symptom_name: canonicalSymptomName,
    severity: action.severity,
    notes,
  });

  if (insertLogError) {
    throw new Error(`Failed to insert symptom log: ${insertLogError.message}`);
  }

  const { error: insertTimelineError } = await supabase.from('timeline_entries').insert({
    user_id: userId,
    type: 'symptom',
    title: canonicalSymptomName,
    description: notes,
    severity: action.severity,
    status: 'current',
  });

  if (insertTimelineError) {
    throw new Error(`Failed to insert timeline entry: ${insertTimelineError.message}`);
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
  usedPendingNextClue: boolean;
}): Promise<void> {
  const { userId, conversationId, userMessage, responseMessage, usedPendingNextClue } = params;
  const userMessageText = extractTextFromUIMessage(userMessage);
  const assistantReply = extractTextFromUIMessage(responseMessage);
  const queueNextClueForLater = responseRequestsSeverityFollowup(responseMessage);

  await persistTurnMessages({ conversationId, userId, userMessage, responseMessage });

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

  const supabase = getSupabase();

  try {
    if (usedPendingNextClue) {
      await setPendingNextQuestion(supabase, userId, null);
    }

    if (queueNextClueForLater) {
      const latestQueuedClue = insightResult.success
        ? await getLatestQueuedClue(supabase, userId)
        : null;
      await setPendingNextQuestion(supabase, userId, latestQueuedClue);
    }
  } catch (error) {
    console.warn('[chat/route] Failed to update pending next question:', error);
  }
}

export async function POST(req: Request) {
  const {
    messages,
    userId,
    conversationId,
    modelProvider,
  }: {
    messages: UIMessage[];
    userId?: string;
    conversationId?: string;
    modelProvider?: ChatModelProvider;
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

  if (uid !== 'anonymous') {
    try {
      await applyResolvedFollowupAction({
        userId: uid,
        action: chatState.resolvedFollowupAction ?? inferFallbackResolvedFollowupAction(messages),
      });
    } catch (error) {
      console.warn('[chat/route] Failed to apply resolved follow-up action:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 2: Stream the LLM response
  // ─────────────────────────────────────────────────────────────────────────
  // The system prompt was built by the Chat Agent; we stream here for UX.

  const result = streamText({
    model: getChatModel(modelProvider),
    system: systemPrompt,
    messages: await convertToModelMessages(chatState.modelMessages?.length ? chatState.modelMessages : messages),
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
          usedPendingNextClue: Boolean(chatState.usedPendingNextClue),
        }).catch((err) => {
          console.error('[chat/route] Post-turn handoff failed:', err);
        });
      }
    },
  });
}
