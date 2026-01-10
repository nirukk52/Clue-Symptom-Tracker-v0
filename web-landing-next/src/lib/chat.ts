/**
 * Chat Library
 *
 * Why this exists: Generates LLM-powered personalized chat greetings and responses
 * for the post-signup conversational flow. Adapted from campaign-modal.js chat logic.
 */

import type {
  ChatMessage,
  ModalResponsesStructured,
  ProductKey,
} from '@/types';

import { supabase } from './supabase';

/**
 * Context for chat generation
 */
interface ChatContext {
  condition: string;
  conditionValue: string;
  painPoint: string;
  warningPreference: string;
  actionPlan: string;
  product: ProductKey;
  messageCount: number;
  conversationId?: string;
  userEmail?: string;
}

/**
 * Builds chat context from Q1-Q4 responses
 */
export function buildChatContext(
  responses: ModalResponsesStructured,
  product: ProductKey,
  messageCount: number,
  conversationId?: string,
  userEmail?: string
): ChatContext {
  return {
    condition: responses.q1.answerLabel || 'chronic symptoms',
    conditionValue: responses.q1.answerValue || 'other',
    painPoint: responses.q2.answerLabel || 'managing symptoms',
    warningPreference: responses.q3.answerLabel || '',
    actionPlan: responses.q4.answerLabel || '',
    product,
    messageCount,
    conversationId,
    userEmail,
  };
}

/**
 * Fallback chips by Q1 answer
 */
const FALLBACK_CHIPS: Record<string, string[]> = {
  fatigue: ['Low energy', 'Brain fog', 'Just tired'],
  flares: ['Starting to flare', 'Feeling okay', 'Not sure'],
  migraines: ['Head hurts', 'Aura symptoms', 'Feeling fine'],
  ibs_gut: ['Stomach issues', 'Bloated', 'Doing okay'],
  multiple: ['Rough day', 'Managing', 'Better today'],
  other: ['Not great', 'Okay', 'Pretty good'],
};

/**
 * Generates an LLM-powered personalized greeting with dynamic chips
 */
export async function generateLLMGreeting(
  context: ChatContext,
  apiKey: string
): Promise<{ greeting: string; chips: string[] }> {
  // Fallback if no API key
  if (!apiKey) {
    return getFallbackGreeting(context);
  }

  try {
    const systemPrompt = `You are a warm, empathetic health companion for Chronic Life, a symptom prediction app.

USER CONTEXT (from their signup):
- Main health concern: ${context.condition}
- Biggest challenge: ${context.painPoint}
- How much warning they need: ${context.warningPreference || 'not specified'}
- What they'd do with advance notice: ${context.actionPlan || 'not specified'}
- Product they're interested in: ${context.product}

YOUR TASK:
Generate a personalized welcome message and 3 quick-reply chips.

REQUIREMENTS:
1. Greeting should be 1-2 sentences MAX
2. Acknowledge their specific situation naturally (don't list everything)
3. Ask about how they're feeling RIGHT NOW
4. Be warm and human, not clinical or robotic
5. Chips should be contextual to their condition (e.g., for fatigue: energy-related options)

RESPOND IN THIS EXACT JSON FORMAT (no markdown, just JSON):
{"greeting": "Your personalized message here", "chips": ["Option 1", "Option 2", "Option 3"]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    const parsed = JSON.parse(content) as { greeting: string; chips: string[] };
    return {
      greeting: parsed.greeting || getFallbackGreeting(context).greeting,
      chips: parsed.chips || getFallbackGreeting(context).chips,
    };
  } catch (err) {
    console.error('LLM greeting generation failed:', err);
    return getFallbackGreeting(context);
  }
}

/**
 * Fallback greeting when LLM is unavailable
 */
function getFallbackGreeting(context: ChatContext): {
  greeting: string;
  chips: string[];
} {
  const q1Label = context.condition || 'your symptoms';
  const q2Label = context.painPoint || '';

  let greeting: string;
  if (q2Label) {
    greeting = `Great to have you here. Managing ${q1Label.toLowerCase()} is tough, especially when ${q2Label.toLowerCase()}. How are you feeling right now?`;
  } else {
    greeting = `Welcome! Since you mentioned dealing with ${q1Label.toLowerCase()}, let's get your first data point. What's your biggest symptom right now?`;
  }

  const chips = FALLBACK_CHIPS[context.conditionValue] || FALLBACK_CHIPS.other;

  return { greeting, chips };
}

/**
 * Generates a chat response using OpenAI
 */
export async function generateChatResponse(
  userMessage: string,
  chatHistory: ChatMessage[],
  context: ChatContext,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    return getFallbackResponse(context.messageCount);
  }

  try {
    const systemPrompt = `You are a warm, empathetic health companion for Chronic Life, a symptom prediction app.

FULL USER CONTEXT (from their signup):
- Main health concern: ${context.condition}
- Biggest challenge: ${context.painPoint}
- Warning preference: ${context.warningPreference || 'not specified'}
- What they'd do with warning: ${context.actionPlan || 'not specified'}
- Product interest: ${context.product}
- Exchange # in this session: ${context.messageCount + 1}

CONVERSATION STRATEGY:
- Turn 1-2: Understand their current state (what's bothering them, severity, duration)
- Turn 3+: Offer to wrap up ("I've got what I need to start learning your patterns")

GUIDELINES:
- Be brief (1-2 sentences max)
- Be warm and human, not clinical
- Ask ONE follow-up question per turn
- Focus on how they're feeling RIGHT NOW
- Never give medical advice
- Use casual, supportive language
- Reference their specific condition/challenge when natural`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.slice(-6).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    return (
      data.choices[0]?.message?.content ||
      getFallbackResponse(context.messageCount)
    );
  } catch (err) {
    console.error('Chat generation error:', err);
    return getFallbackResponse(context.messageCount);
  }
}

/**
 * Fallback responses when LLM is unavailable
 */
function getFallbackResponse(messageCount: number): string {
  const fallbacks = [
    'Thanks for sharing that. How long have you been feeling this way today?',
    'Got it. On a scale of 1-10, how much is this affecting your day?',
    'I hear you. Is this typical for you, or worse than usual?',
    "Thanks — that's helpful context. Anything else I should know?",
    "Perfect, I've captured that. You can close this whenever you're ready.",
  ];

  return fallbacks[Math.min(messageCount, fallbacks.length - 1)];
}

/**
 * Gets contextual follow-up chips based on message count
 */
export function getFollowUpChips(messageCount: number): string[] | null {
  if (messageCount === 1) {
    return ['Just started', 'Few hours', 'All day', 'Multiple days'];
  }
  if (messageCount === 2) {
    return ['Mild', 'Moderate', 'Severe'];
  }
  return null; // Hide chips after 2 exchanges
}

// ============================================
// SUPABASE CHAT PERSISTENCE
// ============================================

/**
 * Creates a new chat conversation in Supabase
 */
export async function createChatConversation(
  modalSessionId: string | null,
  userEmail: string | null,
  product: ProductKey,
  utm: { source?: string; medium?: string; campaign?: string; content?: string }
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        modal_session_id: modalSessionId,
        user_email: userEmail,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        utm_content: utm.content,
        product_offering: product,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error creating chat conversation:', error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Error creating chat conversation:', err);
    return null;
  }
}

/**
 * Saves a chat message to Supabase
 */
export async function saveChatMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  selectedChip?: string
): Promise<void> {
  try {
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role,
      content,
      selected_chip: selectedChip,
      was_chip_selection: !!selectedChip,
    });

    // Update conversation last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (err) {
    console.error('Error saving chat message:', err);
  }
}

/**
 * Stores user context for cross-session persistence
 */
export async function storeUserContext(
  email: string,
  responses: ModalResponsesStructured,
  product: ProductKey,
  conversationId?: string
): Promise<void> {
  try {
    await supabase.from('user_contexts').upsert(
      {
        email,
        q1_condition: responses.q1.answerValue,
        q1_label: responses.q1.answerLabel,
        q2_painpoint: responses.q2.answerValue,
        q2_label: responses.q2.answerLabel,
        q3_warning: responses.q3.answerValue,
        q3_label: responses.q3.answerLabel,
        q4_action: responses.q4.answerValue,
        q4_label: responses.q4.answerLabel,
        product_offering: product,
        last_conversation_id: conversationId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
  } catch (err) {
    console.error('Error storing user context:', err);
  }
}

/**
 * Loads user context for returning users
 */
export async function loadUserContext(
  email: string
): Promise<ModalResponsesStructured | null> {
  try {
    const { data, error } = await supabase
      .from('user_contexts')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      q1: {
        questionKey: 'q1_entry',
        questionText: 'What brings you here today?',
        answerValue: data.q1_condition,
        answerLabel: data.q1_label,
      },
      q2: {
        questionKey: 'q2_pain_point',
        questionText: "What's been hardest about managing this?",
        answerValue: data.q2_painpoint,
        answerLabel: data.q2_label,
      },
      q3: {
        questionKey: 'q3_product_specific',
        questionText: '',
        answerValue: data.q3_warning,
        answerLabel: data.q3_label,
      },
      q4: {
        questionKey: 'q4_product_specific',
        questionText: '',
        answerValue: data.q4_action,
        answerLabel: data.q4_label,
      },
    };
  } catch (err) {
    console.error('Error loading user context:', err);
    return null;
  }
}
