/**
 * AI Provider Configuration
 *
 * Why this exists: Centralizes AI model configuration and provides
 * typed access to different providers for specific use cases.
 *
 * Model Strategy:
 * - Router decisions: OpenAI gpt-4o-mini (fast, accurate routing)
 * - Copy generation: Google Gemini (creative, empathetic copy)
 * - Widget selection: OpenAI gpt-4o-mini (deterministic)
 * - Structured extraction: OpenAI gpt-4o-mini (reliable JSON)
 * - Complex reasoning: OpenAI gpt-4o (when needed)
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// =============================================================================
// PROVIDER INITIALIZATION
// =============================================================================

/**
 * OpenAI provider configuration
 */
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Google Gemini provider configuration
 */
export const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// =============================================================================
// MODEL SHORTCUTS
// =============================================================================

/**
 * Model configurations for different use cases
 */
export const models = {
  /**
   * Router model - fast, accurate routing decisions
   */
  router: openaiProvider('gpt-4o-mini'),

  /**
   * Copy generation - empathetic, creative copy
   */
  copywriter: googleProvider('gemini-3-flash-preview'),

  /**
   * Widget selection - deterministic choices
   */
  widgetPlanner: openaiProvider('gpt-4o-mini'),

  /**
   * Extraction model - reliable structured output
   */
  extractor: openaiProvider('gpt-4o-mini'),

  /**
   * Complex reasoning - for insight generation
   */
  reasoner: openaiProvider('gpt-4o'),
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ModelKey = keyof typeof models;

/**
 * Get a specific model by key
 */
export function getModel(key: ModelKey) {
  return models[key];
}

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

/**
 * Base system prompt fragments
 */
export const systemPromptFragments = {
  /**
   * Core identity for all Clue agent interactions
   */
  coreIdentity: `You are Clue, a symptom tracking companion for people with chronic conditions.
You are warm, patient, and evidence-grounded. You never use emojis in text.
You respect the user's energy and never guilt them about tracking.`,

  /**
   * Low energy mode modifier
   */
  lowEnergyMode: `The user is in low-energy mode. Be extra brief.
No follow-up questions. Accept any input. Don't suggest extra logging.`,

  /**
   * Flare mode modifier
   */
  flareMode: `The user is experiencing a flare. Priority is acknowledgment and minimal input.
Only capture what they volunteer. Offer to help when they feel better.`,

  /**
   * Evidence rules for insight generation
   */
  evidenceRules: `Every claim must be backed by specific data:
- Cite sample_days (minimum 6)
- Show effect_size (minimum 1.0 on 0-10 scale)
- Note missing_rate (maximum 25%)
- Never claim certainty - use language like "may", "tends to", "suggests"`,
} as const;

/**
 * Compose a system prompt from fragments
 */
export function composeSystemPrompt(
  fragments: (keyof typeof systemPromptFragments)[]
): string {
  return fragments.map((key) => systemPromptFragments[key]).join('\n\n');
}
