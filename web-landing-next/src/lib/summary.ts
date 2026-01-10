/**
 * Summary Generation Library
 *
 * Why this exists: Generates hyper-personalized conversion summaries using LLM
 * based on the complete user journey context. Adapted from summary-generation-agent.
 */

import type {
  ModalResponsesStructured,
  SummaryGenerationResult,
} from '@/types';

import { supabase } from './supabase';

// Prompt template for LLM summary generation
const PROMPT_TEMPLATE = `You are a conversion copywriter for Chronic Life, a symptom tracking app for people with chronic conditions.

## Your Task

Generate a personalized conversion summary that makes the user feel understood and ready to sign up.

## User Context

### Product They're Interested In
{{productOffering}}

### What They Told Us

**Q1: What brings you here?**
Answer: {{q1Label}}

**Q2: What's been hardest?**
Answer: {{q2Label}}

**Q3: {{q3Question}}**
Answer: {{q3Label}}

**Q4: {{q4Question}}**
Answer: {{q4Label}}

## Writing Guidelines

### The Title Should:
1. Directly address their Q2 pain point (what's been hardest)
2. Promise a specific outcome related to the product
3. Feel like you already understand their specific situation
4. NOT use generic chronic illness language

### The 3 Benefits Should:
1. **Benefit 1**: Address their Q3 answer (product-specific need)
2. **Benefit 2**: Echo the product's core value proposition
3. **Benefit 3**: Provide reassurance about the approach

### Tone:
- Warm but not cheesy
- Specific, not generic
- Confident without overpromising
- Like a knowledgeable friend, not a marketer

### DO NOT:
- Say "chronic illness" generically - be specific to their condition
- Use phrases like "we understand" or "you're not alone" - too cliché
- Overpromise ("cure", "fix", "solve")
- Use exclamation marks

## Output Format

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "title": "Your personalized headline here",
  "benefits": [
    "First benefit based on Q3",
    "Second benefit based on product feature",
    "Third benefit about approach/reassurance"
  ],
  "ctaText": "Action-oriented CTA"
}`;

/**
 * Context needed for summary generation
 */
interface SummaryContext {
  productOffering: string;
  answers: ModalResponsesStructured;
}

/**
 * Builds the prompt by replacing placeholders with context values
 */
function buildPrompt(context: SummaryContext): string {
  let prompt = PROMPT_TEMPLATE;

  prompt = prompt.replace(
    '{{productOffering}}',
    formatProductName(context.productOffering)
  );
  prompt = prompt.replace('{{q1Label}}', context.answers.q1.answerLabel);
  prompt = prompt.replace('{{q2Label}}', context.answers.q2.answerLabel);
  prompt = prompt.replace('{{q3Question}}', context.answers.q3.questionText);
  prompt = prompt.replace('{{q3Label}}', context.answers.q3.answerLabel);
  prompt = prompt.replace('{{q4Question}}', context.answers.q4.questionText);
  prompt = prompt.replace('{{q4Label}}', context.answers.q4.answerLabel);

  return prompt;
}

/**
 * Formats product offering slug to readable name
 */
function formatProductName(slug: string): string {
  const names: Record<string, string> = {
    'flare-forecast': 'Flare Forecast (48-hour flare predictions)',
    'top-suspect': 'Top Suspect (trigger identification)',
    'crash-prevention': 'Crash Prevention (pacing alerts)',
    'spoon-saver': 'Spoon Saver (low-energy tracking)',
    home: 'Chronic Life (symptom tracking)',
  };
  return names[slug] || slug;
}

/**
 * Calls OpenAI API to generate summary
 */
async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a conversion copywriter. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return (await response.json()) as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens: number };
  };
}

/**
 * Generates a personalized conversion summary using LLM
 */
export async function generateSummary(
  context: SummaryContext,
  apiKey: string
): Promise<SummaryGenerationResult> {
  const startTime = Date.now();

  try {
    const prompt = buildPrompt(context);
    const data = await callOpenAI(prompt, apiKey);
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error('No content in OpenAI response');

    const parsed = JSON.parse(content) as {
      title: string;
      benefits: string[];
      ctaText: string;
    };

    if (
      !parsed.title ||
      !Array.isArray(parsed.benefits) ||
      parsed.benefits.length < 3
    ) {
      throw new Error('Invalid response structure');
    }

    const latencyMs = Date.now() - startTime;

    return {
      summary: {
        title: parsed.title,
        benefits: [
          parsed.benefits[0] ?? '',
          parsed.benefits[1] ?? '',
          parsed.benefits[2] ?? '',
        ],
        ctaText: parsed.ctaText || 'Get started',
      },
      metadata: {
        modelUsed: 'gpt-4o-mini',
        promptTemplateId: 'conversion_summary_v1',
        tokensUsed: data.usage?.total_tokens || 0,
        latencyMs,
      },
    };
  } catch (error) {
    console.error('Summary generation failed, using fallback:', error);
    return generateFallbackSummary(context, Date.now() - startTime);
  }
}

/**
 * Generates a fallback summary using templates when LLM fails
 */
function generateFallbackSummary(
  context: SummaryContext,
  latencyMs: number
): SummaryGenerationResult {
  const q1Label = context.answers.q1.answerLabel.toLowerCase();
  const product = context.productOffering;

  const templates: Record<
    string,
    { title: string; benefits: [string, string, string]; ctaText: string }
  > = {
    'flare-forecast': {
      title: `We'll learn your patterns and give you a heads up before ${q1Label} flares hit.`,
      benefits: [
        '48-hour early warning based on your sleep, stress, and activity',
        'Gentle alerts that feel like a weather forecast',
        'Doctor-ready summaries showing your prediction accuracy',
      ],
      ctaText: 'Start predicting',
    },
    'top-suspect': {
      title: `We'll help you finally figure out what's triggering your ${q1Label}.`,
      benefits: [
        'Track sleep, food, stress, and cycle in one place',
        "Weekly 'Top Suspects' ranked by correlation",
        'Evidence you can actually show your doctor',
      ],
      ctaText: 'Find your triggers',
    },
    'crash-prevention': {
      title: `We'll help you pace yourself so ${q1Label} doesn't steal tomorrow.`,
      benefits: [
        'Daily Push/Rest indicator based on your patterns',
        "Gentle nudges when you're approaching your limit",
        'Break the boom-bust cycle with data-backed rest',
      ],
      ctaText: 'Start pacing',
    },
    'spoon-saver': {
      title: `We'll make tracking ${q1Label} so simple it won't cost you a spoon.`,
      benefits: [
        '20-second check-ins designed for your worst days',
        'Voice logging when typing feels like too much',
        'Automatic patterns — no spreadsheets required',
      ],
      ctaText: 'Start tracking',
    },
    home: {
      title: `We'll learn your patterns and give you a heads up before ${q1Label} gets worse.`,
      benefits: [
        '48-hour early warning based on your patterns',
        'Gentle alerts that feel like a weather forecast',
        'Doctor-ready summaries you can actually use',
      ],
      ctaText: 'Get started',
    },
  };

  const template = templates[product] ?? templates['home']!;

  return {
    summary: {
      title: template.title,
      benefits: template.benefits,
      ctaText: template.ctaText,
    },
    metadata: {
      modelUsed: 'template_fallback',
      promptTemplateId: 'conversion_summary_fallback',
      tokensUsed: 0,
      latencyMs,
    },
  };
}

/**
 * Logs AI generation to Supabase with full context
 */
export async function logAIGeneration(
  modalSessionId: string | null,
  sessionId: string,
  result: SummaryGenerationResult,
  context: SummaryContext
): Promise<void> {
  if (!modalSessionId) return;

  try {
    await supabase.from('ai_generations').insert({
      modal_session_id: modalSessionId,
      session_id: sessionId,
      context_json: {
        product: context.productOffering,
        responses: context.answers,
      },
      generated_headline: result.summary.title,
      generated_features: result.summary.benefits,
      generated_cta: result.summary.ctaText,
      full_output_json: result,
      model_used: result.metadata.modelUsed,
      prompt_template_id: result.metadata.promptTemplateId,
      tokens_used: result.metadata.tokensUsed,
      latency_ms: result.metadata.latencyMs,
      was_shown: true,
      summary_variant:
        result.metadata.modelUsed === 'gpt-4o-mini' ? 'llm_v1' : 'template_v2',
    });
  } catch (err) {
    console.error('Error logging AI generation:', err);
  }
}

/**
 * Updates AI generation as converted after auth
 */
export async function markAIGenerationConverted(
  modalSessionId: string,
  ctaClicked: 'google_signin' | 'email_create'
): Promise<void> {
  try {
    await supabase
      .from('ai_generations')
      .update({
        converted: true,
        cta_clicked: ctaClicked,
        cta_click_time: new Date().toISOString(),
      })
      .eq('modal_session_id', modalSessionId);
  } catch (err) {
    console.error('Error marking AI generation converted:', err);
  }
}

export default generateSummary;
