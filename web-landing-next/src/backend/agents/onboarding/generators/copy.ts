/**
 * Copy Generator (Gemini)
 *
 * Why this exists: Generates hyper-personalized copy for WatchListPreview
 * using Google's Gemini model. Falls back to templates if AI fails.
 */

import {
  getDefaultCTA,
  getDefaultHeadline,
  getDefaultWatchItems,
} from '../templates/graphs';
import type {
  CopyGenerationResult,
  GeneratedCopy,
  PromiseCategory,
  UserConversionContext,
} from '../types';

/**
 * Prompt template for Gemini copy generation
 */
const COPY_PROMPT_TEMPLATE = `You are a conversion copywriter for Chronic Life, a symptom tracking app.

## Your Task
Generate personalized copy for the WatchListPreview component that will make the user sign up.

## User Context

### What they're managing
- Condition: {{condition}}
- Their biggest pain point: {{painPoint}}

### What they want
- Product focus: {{productOffering}}
- Desired outcome: {{desiredOutcome}}

### Ad they clicked (if any)
{{adContext}}

## Generate

1. **headline**: A compelling headline that:
   - Speaks directly to their pain point ({{painPoint}})
   - Promises a specific outcome related to the product
   - Feels like we already understand their situation
   - NO generic "chronic illness" language

2. **watchItems**: Three specific things we'll monitor for THEM:
   - Tailored to their condition ({{condition}})
   - Related to the product's focus
   - Concrete and actionable

3. **ctaText**: First-person, action-oriented CTA:
   - MUST start with "Save my", "Start my", "Know my", "Find my", or "Protect my"
   - Example: "Save my progress", "Start my forecast", "Know my triggers"

## Rules
- NO emojis ever
- NO "Based on what you told us" phrase
- First person CTAs ONLY (my, not your)
- Warm but not cheesy
- Specific to their condition, not generic
- No exclamation marks

## Output Format
Return ONLY valid JSON:
{
  "headline": "Your personalized headline",
  "watchItems": ["Item 1", "Item 2", "Item 3"],
  "ctaText": "First-person CTA"
}`;

/**
 * Builds the prompt with user context
 */
function buildPrompt(context: UserConversionContext): string {
  let prompt = COPY_PROMPT_TEMPLATE;

  // Replace placeholders
  prompt = prompt.replace(/{{condition}}/g, context.answers.q1.answerLabel);
  prompt = prompt.replace(/{{painPoint}}/g, context.answers.q2.answerLabel);
  prompt = prompt.replace(
    /{{productOffering}}/g,
    formatProductName(context.landingPage.productOffering)
  );
  prompt = prompt.replace(
    /{{desiredOutcome}}/g,
    context.answers.q4?.answerLabel || 'Better symptom management'
  );

  // Ad context
  const adContext = context.ad
    ? `- Headline: ${context.ad.headline}\n- Description: ${context.ad.description}`
    : 'Direct visit (no ad)';
  prompt = prompt.replace(/{{adContext}}/g, adContext);

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
 * Parses Gemini response to GeneratedCopy
 */
function parseGeminiResponse(text: string): GeneratedCopy {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    headline?: string;
    watchItems?: string[];
    ctaText?: string;
  };

  if (!parsed.headline || !parsed.watchItems || !parsed.ctaText) {
    throw new Error('Missing required fields in response');
  }

  if (parsed.watchItems.length < 3) {
    throw new Error('Need at least 3 watch items');
  }

  // Validate CTA is first person
  const firstPersonStarters = [
    'save my',
    'start my',
    'know my',
    'find my',
    'protect my',
    'track my',
    'get my',
  ];
  const ctaLower = parsed.ctaText.toLowerCase();
  const isFirstPerson = firstPersonStarters.some((s) => ctaLower.startsWith(s));

  if (!isFirstPerson) {
    // Fix it to first person
    parsed.ctaText = `Save my progress`;
  }

  return {
    headline: parsed.headline,
    watchItems: [
      parsed.watchItems[0]!,
      parsed.watchItems[1]!,
      parsed.watchItems[2]!,
    ],
    ctaText: parsed.ctaText,
  };
}

/**
 * Generates personalized copy using Gemini
 */
export async function generateCopy(
  context: UserConversionContext,
  apiKey?: string
): Promise<CopyGenerationResult> {
  const startTime = Date.now();
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  // If no API key, use fallback
  if (!geminiKey) {
    console.warn('No Gemini API key, using fallback copy');
    return generateFallbackCopy(context, Date.now() - startTime);
  }

  try {
    const prompt = buildPrompt(context);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: {
        content?: {
          parts?: { text?: string }[];
        };
      }[];
      usageMetadata?: {
        totalTokenCount?: number;
      };
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini response');
    }

    const copy = parseGeminiResponse(text);
    const latencyMs = Date.now() - startTime;

    return {
      copy,
      metadata: {
        modelUsed: 'gemini-1.5-flash',
        promptTemplateId: 'watch_list_copy_v1',
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        latencyMs,
      },
    };
  } catch (error) {
    console.error('Copy generation failed, using fallback:', error);
    return generateFallbackCopy(context, Date.now() - startTime);
  }
}

/**
 * Generates fallback copy using templates
 */
function generateFallbackCopy(
  context: UserConversionContext,
  latencyMs: number
): CopyGenerationResult {
  const condition = context.answers.q1.answerValue;
  const painPoint = context.answers.q2.answerLabel;
  const productOffering = context.landingPage.productOffering;

  return {
    copy: {
      headline: getDefaultHeadline(condition, painPoint),
      watchItems: getDefaultWatchItems(condition),
      ctaText: getDefaultCTA(productOffering),
    },
    metadata: {
      modelUsed: 'template_fallback',
      promptTemplateId: 'watch_list_copy_fallback',
      tokensUsed: 0,
      latencyMs,
    },
  };
}

/**
 * Determines the promise category based on context
 */
export function determinePromiseCategory(
  context: UserConversionContext
): PromiseCategory {
  const q2Value = context.answers.q2.answerValue.toLowerCase();
  const productOffering = context.landingPage.productOffering;

  // Check product offering first
  if (productOffering === 'flare-forecast') return 'prediction';
  if (productOffering === 'top-suspect') return 'trigger_discovery';

  // Check Q2 pain point
  if (
    q2Value.includes('warning') ||
    q2Value.includes('blindsided') ||
    q2Value.includes('predict')
  ) {
    return 'prediction';
  }

  if (
    q2Value.includes('trigger') ||
    q2Value.includes('cause') ||
    q2Value.includes('why')
  ) {
    return 'trigger_discovery';
  }

  if (
    q2Value.includes('doctor') ||
    q2Value.includes('proof') ||
    q2Value.includes('evidence')
  ) {
    return 'validation';
  }

  return 'pattern_finding';
}

export default generateCopy;
