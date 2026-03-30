/**
 * Chat API Route
 *
 * Why this exists: Main entry point for the Clue AI chat. Uses Vercel AI SDK
 * streamText with OpenAI via AI Gateway (gpt-5.4) and tool calling. Integrates mem0 for user memory
 * and Supabase-backed tools for symptom logging, insights, and more.
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

  const memories = await getRelevantMemories(uid, lastMessageText);

  const systemPrompt = buildSystemPrompt({
    memories: memories || undefined,
    isFlareMode,
  });

  const result = streamText({
    model: 'openai/gpt-5.4',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: chatTools,
    onFinish: async ({ text }) => {
      // Store memories from this exchange (fire-and-forget)
      if (lastMessageText && text) {
        storeMemory(uid, [
          { role: 'user', content: lastMessageText },
          { role: 'assistant', content: text },
        ]).catch(() => {});
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
