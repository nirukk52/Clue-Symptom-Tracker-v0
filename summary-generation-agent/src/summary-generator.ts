/**
 * Summary Generator
 *
 * Why this exists: Generates hyper-personalized conversion summaries using LLM
 * based on the complete user journey context.
 *
 * Uses OpenAI API directly (compatible with Vercel AI SDK patterns).
 * Falls back to template if LLM fails.
 */

import type { SummaryGenerationResult, UserConversionContext } from './types';

// Prompt template (loaded from prompts/conversion-summary.md structure)
const PROMPT_TEMPLATE = `You are a conversion copywriter for Chronic Life, a symptom tracking app for people with chronic conditions.

## Your Task

Generate a personalized conversion summary that makes the user feel understood and ready to sign up.

## User Context

### How They Found Us
- **Ad they clicked**: {{ad.headline}}
- **Ad description**: {{ad.description}}
- **Landing page title**: {{landingPage.heroTitle}}
- **Product focus**: {{landingPage.productOffering}}

### Their Story (Someone Like Them)
{{persona.story}}

### What They Told Us

**Q1: What brings you here?**
Answer: {{answers.q1.answerLabel}}

**Q2: What's been hardest?**
Answer: {{answers.q2.answerLabel}}

**Q3: {{answers.q3.questionText}}**
Answer: {{answers.q3.answerLabel}}

**Q4: {{answers.q4.questionText}}**
Answer: {{answers.q4.answerLabel}}

## Writing Guidelines

### The Title Should:
1. Directly address their Q2 pain point (what's been hardest)
2. Promise a specific outcome related to the product
3. Feel like you already understand their specific situation
4. NOT use generic chronic illness language

### The 3 Benefits Should:
1. **Benefit 1**: Address their Q3 answer (product-specific need)
2. **Benefit 2**: Echo the landing page's focus feature
3. **Benefit 3**: Provide social proof or reassurance based on persona story

### Tone:
- Warm but not cheesy
- Specific, not generic
- Confident without overpromising
- Like a knowledgeable friend, not a marketer

### DO NOT:
- Use persona names (Maya, Jordan, Marcus) - that's internal language
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
    "Second benefit based on landing page feature", 
    "Third benefit based on persona/reassurance"
  ],
  "ctaText": "Action-oriented CTA"
}`;

/** Calls OpenAI API to generate summary */
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

/** Parses and validates OpenAI response */
function parseOpenAIResponse(content: string) {
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
  return parsed;
}

/** Generates a personalized conversion summary using LLM */
export async function generateSummary(
  context: UserConversionContext,
  apiKey: string
): Promise<SummaryGenerationResult> {
  const startTime = Date.now();

  try {
    const prompt = buildPrompt(context);
    const data = await callOpenAI(prompt, apiKey);
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error('No content in OpenAI response');

    const parsed = parseOpenAIResponse(content);
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
 * Builds the prompt by replacing placeholders with context values
 */
function buildPrompt(context: UserConversionContext): string {
  let prompt = PROMPT_TEMPLATE;

  // Ad context (may be null for direct visits)
  prompt = prompt.replace(
    '{{ad.headline}}',
    context.ad?.headline || 'Direct visit'
  );
  prompt = prompt.replace(
    '{{ad.description}}',
    context.ad?.description || 'No ad - came directly to site'
  );

  // Landing page context
  prompt = prompt.replace(
    '{{landingPage.heroTitle}}',
    context.landingPage.heroTitle
  );
  prompt = prompt.replace(
    '{{landingPage.productOffering}}',
    formatProductName(context.landingPage.productOffering)
  );

  // Persona context (story only, no name)
  prompt = prompt.replace('{{persona.story}}', context.persona.story);

  // Question answers
  prompt = prompt.replace(
    '{{answers.q1.answerLabel}}',
    context.answers.q1.answerLabel
  );
  prompt = prompt.replace(
    '{{answers.q2.answerLabel}}',
    context.answers.q2.answerLabel
  );
  prompt = prompt.replace(
    '{{answers.q3.questionText}}',
    context.answers.q3.questionText
  );
  prompt = prompt.replace(
    '{{answers.q3.answerLabel}}',
    context.answers.q3.answerLabel
  );
  prompt = prompt.replace(
    '{{answers.q4.questionText}}',
    context.answers.q4.questionText
  );
  prompt = prompt.replace(
    '{{answers.q4.answerLabel}}',
    context.answers.q4.answerLabel
  );

  return prompt;
}

/**
 * Formats product offering slug to readable name
 */
function formatProductName(slug: string): string {
  const names: Record<string, string> = {
    'flare-forecast': 'Flare Forecast (48-hour predictions)',
    'top-suspect': 'Top Suspect (trigger identification)',
    'crash-prevention': 'Crash Prevention (pacing alerts)',
    'spoon-saver': 'Spoon Saver (low-energy tracking)',
  };
  return names[slug] || slug;
}

/**
 * Generates a fallback summary using templates when LLM fails
 */
function generateFallbackSummary(
  context: UserConversionContext,
  latencyMs: number
): SummaryGenerationResult {
  const q1Label = context.answers.q1.answerLabel.toLowerCase();
  const product = context.landingPage.productOffering;

  // Product-specific templates that incorporate Q1
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
  };

  const template = templates[product] ?? templates['flare-forecast']!;

  return {
    summary: {
      title: template!.title,
      benefits: template!.benefits,
      ctaText: template!.ctaText,
    },
    metadata: {
      modelUsed: 'template_fallback',
      promptTemplateId: 'conversion_summary_fallback',
      tokensUsed: 0,
      latencyMs,
    },
  };
}

export default generateSummary;
