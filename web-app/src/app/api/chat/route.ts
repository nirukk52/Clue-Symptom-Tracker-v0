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

  // Check if user is in flare mode
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('flare_mode')
    .eq('user_id', uid)
    .single();

  const isFlareMode = prefs?.flare_mode ?? false;

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

  // Step 2: Build system prompt with next question injected
  const nextQuestion = preResult?.nextQuestion?.question || undefined;
  const systemPrompt = buildSystemPrompt({
    memories: memories || undefined,
    graphSummary: graphSummary || undefined,
    isFlareMode,
    nextQuestion,
  });

  if (nextQuestion) {
    console.log('[chat/route] Injecting next question into prompt:', nextQuestion);
  }

  // Step 3: Stream the response
  const result = streamText({
    model: 'openai/gpt-5.4',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: chatTools,
    onFinish: async ({ text }) => {
      const fullChatMessages = [
        { role: 'user' as const, content: lastMessageText },
        { role: 'assistant' as const, content: text || '' },
      ];

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
