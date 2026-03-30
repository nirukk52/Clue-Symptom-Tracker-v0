/**
 * Chat API Route
 *
 * Why this exists: Main entry point for the Clue AI chat. Uses Vercel AI SDK
 * streamText with OpenAI via AI Gateway (gpt-5.4) and tool calling. Integrates mem0 for user memory,
 * Supabase-backed tools for symptom logging, and the knowledge graph pipeline.
 *
 * Pipeline architecture:
 * 1. PRE-RESPONSE: extractEntities → upsertNodes → scoreConditions → pickNextQuestion
 *    - Runs BEFORE streamText so the LLM can include the next question in its reply
 *    - scoreConditions and pickNextQuestion are deterministic (no LLM)
 * 2. POST-RESPONSE: updateClues (LLM) → storeMemory → persistMessages
 *    - Runs in onFinish callback, non-blocking
 *
 * Conversational pacing:
 * - If ask_severity tool is called, we defer the next question to the following turn
 * - This prevents "Rate your headache + How did you sleep?" in the same response
 * - pending_next_question is stored in user_preferences and used on the next turn
 */

import { createClient } from '@supabase/supabase-js';
import {
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from 'ai';

import { buildSystemPrompt } from '@/backend/agents/clue/prompts/system';
import { chatTools, setActiveUserId } from '@/backend/agents/clue/tools/chat-tools';
import {
  getRelevantMemories,
  storeMemory,
} from '@/backend/lib/memory';
import { runPreResponsePipeline, runPostResponsePipeline, type PrePipelineResult } from '@/backend/lib/graph/pipeline';
import { getGraphSummary } from '@/backend/lib/graph';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
  setActiveUserId(uid);
  const supabase = getSupabase();

  // Check if user is in flare mode AND if there's a pending question from previous turn
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('flare_mode, pending_next_question')
    .eq('user_id', uid)
    .single();

  const isFlareMode = prefs?.flare_mode ?? false;
  const pendingQuestion = prefs?.pending_next_question as string | null;

  // Extract the last user message text from parts
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const lastMessageText = lastUserMsg?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ') || '';

  // Step 1: Fetch memories, graph state, and run pre-pipeline in parallel
  // Pre-pipeline extracts entities + scores conditions + picks next question BEFORE response
  const chatMessages = [{ role: 'user' as const, content: lastMessageText }];

  const [memories, graphSummary, preResult] = await Promise.all([
    getRelevantMemories(uid, lastMessageText),
    uid !== 'anonymous' ? getGraphSummary(uid) : '',
    uid !== 'anonymous' && lastMessageText
      ? runPreResponsePipeline({ userId: uid, messages: chatMessages })
      : Promise.resolve(null as PrePipelineResult | null),
  ]);

  // Step 2: Determine which question to inject
  // Priority: pending question from previous turn > newly picked question
  // But only inject if we're not in flare mode
  const newQuestion = preResult?.nextQuestion?.question || undefined;
  const questionToInject = isFlareMode ? undefined : (pendingQuestion || newQuestion);
  
  // Build system prompt — only inject question if we have one and no pending severity
  const systemPrompt = buildSystemPrompt({
    memories: memories || undefined,
    graphSummary: graphSummary || undefined,
    isFlareMode,
    nextQuestion: questionToInject,
  });

  if (questionToInject) {
    console.log('[chat/route] Injecting question into prompt:', questionToInject, pendingQuestion ? '(from pending)' : '(new)');
  }

  // Step 3: Stream the response
  const result = streamText({
    model: 'openai/gpt-5.4',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: chatTools,
    onFinish: async ({ text, toolCalls }) => {
      const fullChatMessages = [
        { role: 'user' as const, content: lastMessageText },
        { role: 'assistant' as const, content: text || '' },
      ];

      // Check if ask_severity was called in this response
      const askedSeverity = toolCalls?.some(tc => tc.toolName === 'ask_severity') ?? false;

      // Manage pending_next_question based on whether ask_severity was called
      if (uid !== 'anonymous') {
        if (askedSeverity && newQuestion) {
          // Severity slider shown — defer the new question to next turn
          console.log('[chat/route] ask_severity called — deferring question to next turn:', newQuestion);
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: uid,
              pending_next_question: newQuestion,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } else if (pendingQuestion) {
          // Used the pending question (or no severity asked) — clear it
          console.log('[chat/route] Clearing pending question');
          await supabase
            .from('user_preferences')
            .update({ pending_next_question: null, updated_at: new Date().toISOString() })
            .eq('user_id', uid);
        }
      }

      // Store memories (fire-and-forget)
      if (lastMessageText && text) {
        storeMemory(uid, fullChatMessages).catch(() => {});
      }

      // Run post-response pipeline (fire-and-forget)
      // This generates clue nodes and persists the next question node
      if (uid !== 'anonymous' && preResult) {
        runPostResponsePipeline({ userId: uid }, preResult).catch((err) => {
          console.error('[chat/route] Post-pipeline failed:', err);
        });
      }

      // Persist messages to database
      if (conversationId && lastMessageText) {
        const { error } = await supabase.from('chat_messages').insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: lastMessageText,
          },
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: text || '',
          },
        ]);
        if (error) {
          console.error('[chat/route] Failed to save messages:', error);
        } else {
          console.log('[chat/route] Saved messages for conversation:', conversationId);
        }
      } else {
        console.log('[chat/route] Skipped saving - conversationId:', conversationId, 'lastMessageText:', !!lastMessageText);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
