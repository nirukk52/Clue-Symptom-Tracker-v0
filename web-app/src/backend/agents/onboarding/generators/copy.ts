/**
 * Copy Generator (Gemini)
 *
 * Why this exists: Generates hyper-personalized copy and selects layouts
 * for ValuePropScreen using Google's Gemini model. Falls back to templates if AI fails.
 *
 * Two main functions:
 * 1. generateCopy - Original, just generates copy for WatchListPreview
 * 2. generateCopyAndLayout - New, generates copy AND selects layout for ValuePropScreen
 */

import {
  getDefaultCTA,
  getDefaultHeadline,
  getDefaultWatchItems,
} from '../templates/graphs';
import type {
  AIGeneratedUI,
  AIGenerationResult,
  CopyGenerationResult,
  EnhancedUserContext,
  GeneratedCopy,
  LayoutId,
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
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
        modelUsed: 'gemini-3-flash-preview',
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

// =============================================================================
// ENHANCED COPY + LAYOUT GENERATION
// =============================================================================

/**
 * Enhanced prompt template that includes layout selection
 * Now includes full campaign attribution and widget context
 */
const ENHANCED_PROMPT_TEMPLATE = `You are the onboarding agent for Chronic Life, a symptom tracking app.

## Full User Journey Context

### Campaign Attribution
- Ad clicked: {{adHeadline}} ({{adGroup}})
- Landing page: {{landingTitle}}
- Landing CTA: {{landingCTA}}
- UTM: {{utmCampaign}} / {{utmContent}}

### User's Stated Needs
- Q1 Domain: {{q1Domain}} - "{{q1Label}}"
- Q2 Pain Point: {{q2PainPoint}} - "{{q2Label}}"
- Q3 Baseline: {{q3WidgetName}} captured {{q3Value}}
- Widget Promise: {{q4Value}}

### Widget Context
- Widget Type: {{widgetType}}
- Captures: {{captures}}

## Available Layouts
Select the most appropriate layout based on Q1 domain and Q2 pain point:

| Layout ID | Best For | Focus |
|-----------|----------|-------|
| fatigue | Energy management, ME/CFS, crash prevention | Energy timeline, rhythm patterns |
| flares | Unpredictable symptom flares | 7-day forecast, early warning |
| migraines | Migraine/headache tracking | Trigger correlations (weather, food, cycle) |
| ibs_gut | IBS, gut issues, food sensitivities | Food-symptom timeline |
| multiple | Managing multiple conditions | Multi-symptom dashboard |
| other | General tracking, pattern discovery | Adaptive learning visualization |

## Generate

1. **layoutId**: Select ONE from [fatigue, flares, migraines, ibs_gut, multiple, other]
   - Match to Q1 domain primarily
   - Consider Q2 pain point secondarily

2. **headline**: Personalized headline that:
   - Speaks directly to their Q2 pain point ({{q2Label}})
   - References what we learned from Q3
   - NO generic "chronic illness" language

3. **watchItems**: Three monitoring promises:
   - Based on widget captures ({{captures}})
   - Personalized to their condition
   - Concrete and actionable

4. **ctaText**: First-person CTA:
   - Default to "Save my spoons" unless another phrase fits better
   - Alternatives: "Start my forecast", "Know my triggers", "Find my patterns"

5. **victoryMessage**: Short celebration (5-8 words):
   - Acknowledge their Q3 baseline data
   - Make them feel accomplished
   - Examples: "Your baseline is captured", "Energy pattern saved"

6. **previewBadge**: Short preview card title (2-4 words, ALL CAPS):
   - Describes what the preview visualization shows
   - Must relate to the layout and user's condition
   - Examples by layout:
     - fatigue: "YOUR ENERGY PATTERN", "DAILY ENERGY RHYTHM"
     - flares: "7-DAY FLARE FORECAST", "YOUR FLARE RISK"
     - migraines: "TRIGGER CORRELATION", "MIGRAINE PATTERNS"
     - ibs_gut: "FOOD-SYMPTOM TIMELINE", "GUT REACTION MAP"
     - multiple: "SYMPTOM DASHBOARD", "CONDITION OVERVIEW"
     - other: "PATTERN PREVIEW", "YOUR TRACKING VIEW"

## Rules
- NO emojis ever
- First person CTAs ONLY (my, not your)
- Warm but not cheesy
- Specific to their condition, not generic
- No exclamation marks

## Output Format
Return ONLY valid JSON:
{
  "layoutId": "fatigue",
  "headline": "Your personalized headline",
  "watchItems": ["Item 1", "Item 2", "Item 3"],
  "ctaText": "Save my spoons",
  "victoryMessage": "Your baseline is captured",
  "previewBadge": "YOUR ENERGY PATTERN"
}`;

/**
 * Layout mapping from Q1 domain
 */
const Q1_TO_LAYOUT: Record<string, LayoutId> = {
  fatigue: 'fatigue',
  flares: 'flares',
  migraines: 'migraines',
  ibs_gut: 'ibs_gut',
  multiple: 'multiple',
  other: 'other',
  // Additional mappings for common Q1 values
  energy: 'fatigue',
  pain: 'flares',
  headaches: 'migraines',
  digestive: 'ibs_gut',
  gut: 'ibs_gut',
};

/**
 * Builds enhanced prompt with full context
 */
function buildEnhancedPrompt(context: EnhancedUserContext): string {
  let prompt = ENHANCED_PROMPT_TEMPLATE;

  // Campaign attribution
  prompt = prompt.replace(
    /{{adHeadline}}/g,
    context.ad?.headline || 'Direct visit'
  );
  prompt = prompt.replace(/{{adGroup}}/g, context.ad?.adGroup || 'N/A');
  prompt = prompt.replace(/{{landingTitle}}/g, context.landingPage.heroTitle);
  prompt = prompt.replace(/{{landingCTA}}/g, context.landingPage.primaryCTA);
  prompt = prompt.replace(/{{utmCampaign}}/g, context.utm.campaign || 'N/A');
  prompt = prompt.replace(/{{utmContent}}/g, context.utm.content || 'N/A');

  // User's stated needs (Q1-Q3)
  prompt = prompt.replace(/{{q1Domain}}/g, context.answers.q1.answerValue);
  prompt = prompt.replace(/{{q1Label}}/g, context.answers.q1.answerLabel);
  prompt = prompt.replace(/{{q2PainPoint}}/g, context.answers.q2.answerValue);
  prompt = prompt.replace(/{{q2Label}}/g, context.answers.q2.answerLabel);
  prompt = prompt.replace(/{{q3WidgetName}}/g, context.widget.widgetName);
  prompt = prompt.replace(
    /{{q3Value}}/g,
    formatWidgetValue(context.widget.userInput.widgetValue)
  );
  prompt = prompt.replace(/{{q4Value}}/g, context.widget.q4Value);

  // Widget context
  prompt = prompt.replace(/{{widgetType}}/g, context.widget.widgetType);
  prompt = prompt.replace(/{{captures}}/g, context.widget.captures.join(', '));

  return prompt;
}

/**
 * Formats widget value for display in prompt
 */
function formatWidgetValue(value: number | string | string[]): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return `${value}%`;
  return value;
}

/**
 * Parses Gemini response to AIGeneratedUI
 */
function parseEnhancedGeminiResponse(text: string): AIGeneratedUI {
  // Try to parse JSON directly first (since we request JSON response)
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (_e) {
    // If direct parse fails, try regex extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Gemini response (no JSON found):', text);
      throw new Error('No JSON found in response');
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (innerError) {
      console.error('JSON parse error after regex extraction:', innerError);
      console.error('Extracted text:', jsonMatch[0]);
      throw new Error('Invalid JSON in response');
    }
  }

  // Type assertion and validation
  const typedParsed = parsed as {
    layoutId?: string;
    headline?: string;
    watchItems?: string[];
    ctaText?: string;
    victoryMessage?: string;
    previewBadge?: string;
  };

  // Validate required fields
  if (
    !typedParsed.layoutId ||
    !typedParsed.headline ||
    !typedParsed.watchItems ||
    !typedParsed.ctaText ||
    !typedParsed.victoryMessage
  ) {
    console.error('Missing required fields in parsed JSON:', typedParsed);
    throw new Error('Missing required fields in response');
  }

  if (typedParsed.watchItems.length < 3) {
    throw new Error('Need at least 3 watch items');
  }

  // Validate layoutId
  const validLayouts: LayoutId[] = [
    'fatigue',
    'flares',
    'migraines',
    'ibs_gut',
    'multiple',
    'other',
  ];
  const layoutId = validLayouts.includes(typedParsed.layoutId as LayoutId)
    ? (typedParsed.layoutId as LayoutId)
    : 'flares';

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
  const ctaLower = typedParsed.ctaText.toLowerCase();
  const isFirstPerson = firstPersonStarters.some((s) => ctaLower.startsWith(s));

  if (!isFirstPerson) {
    typedParsed.ctaText = 'Save my spoons';
  }

  // Use provided previewBadge or get default based on layoutId
  const previewBadge =
    typedParsed.previewBadge || getDefaultPreviewBadge(layoutId);

  return {
    layoutId,
    headline: typedParsed.headline,
    watchItems: [
      typedParsed.watchItems[0]!,
      typedParsed.watchItems[1]!,
      typedParsed.watchItems[2]!,
    ],
    ctaText: typedParsed.ctaText,
    victoryMessage: typedParsed.victoryMessage,
    previewBadge,
  };
}

/**
 * Generates personalized copy AND selects layout using Gemini
 * This is the new primary function for ValuePropScreen
 */
export async function generateCopyAndLayout(
  context: EnhancedUserContext,
  apiKey?: string
): Promise<AIGenerationResult> {
  const startTime = Date.now();
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  // If no API key, use fallback
  if (!geminiKey) {
    console.warn('No Gemini API key, using fallback for copy+layout');
    return generateEnhancedFallback(context, Date.now() - startTime);
  }

  try {
    const prompt = buildEnhancedPrompt(context);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`,
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
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
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
        finishReason?: string;
      }[];
      usageMetadata?: {
        totalTokenCount?: number;
      };
    };

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      console.error(
        'Gemini response missing text. Full response:',
        JSON.stringify(data, null, 2)
      );
      if (candidate?.finishReason) {
        console.error('Finish reason:', candidate.finishReason);
      }
      throw new Error('No text in Gemini response');
    }

    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn('Gemini response truncated due to MAX_TOKENS');
    }

    const ui = parseEnhancedGeminiResponse(text);
    const latencyMs = Date.now() - startTime;

    return {
      ui,
      metadata: {
        modelUsed: 'gemini-3-flash-preview',
        promptTemplateId: 'value_prop_screen_v1',
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        latencyMs,
      },
    };
  } catch (error) {
    console.error('Enhanced copy generation failed, using fallback:', error);
    return generateEnhancedFallback(context, Date.now() - startTime);
  }
}

/**
 * Generates fallback copy+layout using templates and Q1 mapping
 */
function generateEnhancedFallback(
  context: EnhancedUserContext,
  latencyMs: number
): AIGenerationResult {
  const q1Value = context.answers.q1.answerValue.toLowerCase();
  const _condition = context.answers.q1.answerLabel; // eslint: kept for future use
  const painPoint = context.answers.q2.answerLabel;
  const productOffering = context.landingPage.productOffering;

  // Determine layout from Q1
  const layoutId: LayoutId = Q1_TO_LAYOUT[q1Value] || 'flares';

  // Get default watch items
  const defaultWatchItems = getDefaultWatchItems(q1Value);

  // Generate victory message based on widget
  const victoryMessage = getDefaultVictoryMessage(context.widget.widgetType);

  // Get default preview badge based on layout
  const previewBadge = getDefaultPreviewBadge(layoutId);

  return {
    ui: {
      layoutId,
      headline: getDefaultHeadline(q1Value, painPoint),
      watchItems: defaultWatchItems,
      ctaText: getDefaultCTA(productOffering),
      victoryMessage,
      previewBadge,
    },
    metadata: {
      modelUsed: 'template_fallback',
      promptTemplateId: 'value_prop_screen_fallback',
      tokensUsed: 0,
      latencyMs,
    },
  };
}

/**
 * Gets default victory message based on widget type
 */
function getDefaultVictoryMessage(widgetType: string): string {
  const messages: Record<string, string> = {
    slider: 'Your baseline is captured',
    gradient_slider: 'Your energy level is saved',
    time_segment_selector: 'Your rhythm is recorded',
    dual_selector: 'Your starting point is set',
    multi_select_chips: 'Your triggers are noted',
    single_select: 'Your preference is saved',
  };
  return messages[widgetType] || 'Your progress is saved';
}

/**
 * Gets default preview badge based on layout
 * Why: Each layout needs a descriptive badge for its preview card
 */
export function getDefaultPreviewBadge(layoutId: LayoutId): string {
  const badges: Record<LayoutId, string> = {
    fatigue: 'YOUR ENERGY PATTERN',
    flares: '7-DAY FLARE FORECAST',
    migraines: 'TRIGGER CORRELATION',
    ibs_gut: 'FOOD-SYMPTOM TIMELINE',
    multiple: 'SYMPTOM DASHBOARD',
    other: 'PATTERN PREVIEW',
  };
  return badges[layoutId] || 'PATTERN PREVIEW';
}

export default generateCopy;
