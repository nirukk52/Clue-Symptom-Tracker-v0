/**
 * AI Provider Configuration
 *
 * Why this exists: Centralizes AI model configuration and provides
 * typed access to different providers for specific use cases.
 *
 * Model Strategy: All agent models use Claude Opus 4.6 with extended
 * thinking enabled for maximum reasoning quality across routing,
 * extraction, and insight generation.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic, type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';

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

/**
 * Anthropic Claude provider configuration.
 */
export const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// =============================================================================
// THINKING CONFIGURATION
// =============================================================================

/**
 * Canonical Anthropic model id string for persisted audit rows and provider wiring.
 * Why this exists: Graph insight nodes and logs need a single source of truth for
 * the API model id without duplicating string literals across call sites.
 */
export const opusModelId = 'claude-opus-4-6' as const;

/**
 * Extended-thinking token budget paired with `opusThinkingOptions`.
 * Why this exists: Lets graph node audit metadata record the same budget the
 * runtime request used, without parsing providerOptions at write time.
 */
export const opusThinkingBudgetTokens = 10_000 as const;

/**
 * Shared extended-thinking providerOptions for all Opus 4.6 generateObject /
 * streamText calls. Import and spread into each call site.
 */
export const opusThinkingOptions = {
  anthropic: {
    thinking: { type: 'enabled', budgetTokens: opusThinkingBudgetTokens },
  } satisfies AnthropicLanguageModelOptions,
};

// =============================================================================
// MODEL SHORTCUTS
// =============================================================================

/**
 * Model configurations for different use cases.
 * All slots use Opus 4.6 — pair with opusThinkingOptions at call sites.
 */
export const models = {
  /** Router model — routing decisions */
  router: anthropicProvider(opusModelId),

  /** Copy generation — empathetic, creative copy */
  copywriter: anthropicProvider(opusModelId),

  /** Widget selection — deterministic choices */
  widgetPlanner: anthropicProvider(opusModelId),

  /** Extraction model — structured output */
  extractor: anthropicProvider(opusModelId),

  /** Complex reasoning — insight generation */
  reasoner: anthropicProvider(opusModelId),
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ModelKey = keyof typeof models;

/**
 * Embeds LLM audit metadata on `graph_nodes.data_json` for support and regression
 * checks. Why this exists: Product insights must be traceable to the exact
 * model slot and thinking budget used when the row was written.
 */
export function graphNodeLlmGenerationAudit(modelKey: ModelKey) {
  return {
    generationSource: 'llm' as const,
    generationModelId: opusModelId,
    generationModelKey: modelKey,
    thinkingBudgetTokens: opusThinkingBudgetTokens,
  };
}

/**
 * Embeds non-LLM provenance on `graph_nodes.data_json` when the row was produced
 * by deterministic logic or static copy. Why this exists: Keeps the same audit
 * field names as LLM rows so dashboards do not special-case missing keys.
 */
export function graphNodeNonLlmGenerationAudit(
  source: 'deterministic_info_gain' | 'template'
) {
  return {
    generationSource: source,
    generationModelId: null as string | null,
    generationModelKey: null as ModelKey | null,
    thinkingBudgetTokens: null as number | null,
  };
}

/**
 * Get a specific model by key
 */
export function getModel(key: ModelKey) {
  return models[key];
}

/**
 * Chat model provider options exposed in the chat composer.
 * Why this exists: The client allows users to choose a model family while the
 * backend resolves that preference into a concrete provider/model pair.
 */
export type ChatModelProvider = 'chatgpt' | 'gemini' | 'claude';

/**
 * Resolves a chat provider key to a concrete model instance.
 * Why this exists: Route handlers should not duplicate provider-specific model
 * wiring when supporting user-selected chat backends.
 */
export function getChatModel(provider: ChatModelProvider | undefined) {
  if (provider === 'gemini') {
    return googleProvider('gemini-2.5-flash');
  }

  if (provider === 'claude') {
    return anthropicProvider('claude-sonnet-4-20250514');
  }

  return openaiProvider('gpt-5.4');
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
