/**
 * Chat API Route
 *
 * Why this exists: Main entry point for the Clue AI chat. Uses Vercel AI SDK
 * streamText with OpenAI via AI Gateway (gpt-5.4) and tool calling. Integrates mem0 for user memory,
 * Supabase-backed tools for symptom logging, and the knowledge graph pipeline v2.
 *
 * Pipeline v2 architecture (OpenMed + Rasa + HealthKG):
 * 1. PRE-RESPONSE: Extract entities (OpenMed + LLM factors) → Update Rasa slots →
 *    Sync to Supabase → Score conditions (HealthKG) → Pick next question (info-gain)
 * 2. POST-RESPONSE: Update clues (LLM) → Delete resolved Unknown nodes → Store memory
 *
 * Key changes from v1:
 * - OpenMed handles biomedical NER (symptoms, meds, conditions) instead of LLM
 * - Rasa handles short-term dialogue state (slots) — Mem0 handles long-term memory
 * - Unknown nodes are deleted when corresponding slots fill (not marked as resolved)
 *
 * Conversational pacing:
 * - If ask_severity tool is called, we defer the next question to the following turn
 * - If Rasa has an active form, we let it complete before HealthKG picks the next question
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
import {
  runPreResponsePipelineV2,
  runPostResponsePipelineV2,
  type PrePipelineV2Result,
} from '@/backend/lib/graph/pipeline-v2';
import { getGraphSummary } from '@/backend/lib/graph';
import { isOpenMedHealthy } from '@/backend/lib/openmed';
import { isRasaHealthy } from '@/backend/lib/rasa';

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

  // Check service health (non-blocking, just for logging)
  Promise.all([isOpenMedHealthy(), isRasaHealthy()]).then(([openmed, rasa]) => {
    if (!openmed) console.warn('[chat/route] OpenMed service unavailable');
    if (!rasa) console.warn('[chat/route] Rasa service unavailable');
  });

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

  // Step 1: Fetch memories, graph state, and run pre-pipeline v2 in parallel
  // Pre-pipeline v2: OpenMed + LLM factors → Rasa slots → Supabase → HealthKG question
  const [memories, graphSummary, preResult] = await Promise.all([
    getRelevantMemories(uid, lastMessageText),
    uid !== 'anonymous' ? getGraphSummary(uid) : '',
    uid !== 'anonymous' && lastMessageText
      ? runPreResponsePipelineV2({ userId: uid, message: lastMessageText })
      : Promise.resolve(null as PrePipelineV2Result | null),
  ]);

  // Step 2: Determine which question to inject
  // Priority: Rasa active form > pending question > newly picked question (HealthKG)
  // But only inject if we're not in flare mode
  const rasaActiveForm = preResult?.activeForm;
  const newQuestion = preResult?.nextQuestion?.question || undefined;
  
  // If Rasa has an active form, don't inject HealthKG question (let form complete first)
  const questionToInject = isFlareMode
    ? undefined
    : rasaActiveForm
      ? undefined  // Rasa form is active, skip injection
      : (pendingQuestion || newQuestion);
  
  // Build system prompt with Rasa context
  const systemPrompt = buildSystemPrompt({
    memories: memories || undefined,
    graphSummary: graphSummary || undefined,
    isFlareMode,
    nextQuestion: questionToInject,
    // Include Rasa form context if active
    rasaContext: rasaActiveForm
      ? `Active form: ${rasaActiveForm}. Continue collecting required information.`
      : undefined,
  });

  if (questionToInject) {
    console.log('[chat/route] Injecting question into prompt:', questionToInject, pendingQuestion ? '(from pending)' : '(new from HealthKG)');
  } else if (rasaActiveForm) {
    console.log('[chat/route] Rasa form active:', rasaActiveForm, '- skipping HealthKG question');
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

      // Store memories (fire-and-forget) — Mem0 for long-term memory
      if (lastMessageText && text) {
        storeMemory(uid, fullChatMessages).catch(() => {});
      }

      // Run post-response pipeline v2 (fire-and-forget)
      // This generates clue nodes and deletes resolved Unknown nodes
      if (uid !== 'anonymous' && preResult) {
        runPostResponsePipelineV2({ userId: uid, message: lastMessageText }, preResult).catch((err) => {
          console.error('[chat/route] Post-pipeline v2 failed:', err);
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
