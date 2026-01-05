/**
 * TypeScript interfaces for the Summary Generation Agent
 *
 * Why this exists: Defines the shape of user context data and generated output
 * to ensure type safety across the context assembler and summary generator.
 */

// =============================================================================
// INPUT: User Journey Context
// =============================================================================

/**
 * UTM parameters from the ad campaign that brought the user
 * Why: Tells us which messaging already resonated with them
 */
export interface UTMContext {
  source: string | null; // 'reddit', 'google', etc.
  medium: string | null; // 'paid', 'organic', etc.
  campaign: string | null; // 'prediction_depth_test', etc.
  content: string | null; // 'flare_forecast', 'top_suspect', etc.
  term: string | null; // keyword if any
}

/**
 * Ad copy that brought the user to the site
 * Why: We should echo language they already clicked on
 */
export interface AdContext {
  headline: string; // "Your flares have a forecast"
  description: string; // "A symptom tracker that learns your patterns..."
  cta: string; // "See your forecast"
  adGroup: string; // "flare_forecast"
}

/**
 * Landing page copy the user saw
 * Why: Continuity - repeat the value props they read
 */
export interface LandingPageContext {
  productOffering: string; // 'flare-forecast', 'top-suspect', etc.
  heroTitle: string; // "Predict your next flare"
  heroSubtitle: string; // "See the storm coming..."
  primaryCTA: string; // "Start predicting flares"
  empathyCopy: string; // "A shift in your patterns suggests..."
  focusFeature: string; // "Lag Effect Detection (24-48h warning)"
}

/**
 * Persona story (NOT name - internal language)
 * Why: Social proof - "someone like me uses this"
 */
export interface PersonaContext {
  story: string; // "She manages fibromyalgia and long COVID..."
  description: string; // "Project manager who had to step back..."
  // NOTE: We deliberately exclude name, age, demographic
  // Those are internal A/B testing variables, not for user-facing copy
}

/**
 * A single modal question response
 */
export interface QuestionAnswer {
  questionKey: string; // 'q1_entry', 'q2_pain_point', etc.
  questionText: string; // "What brings you here today?"
  answerValue: string; // 'fatigue', 'delayed_payback', etc.
  answerLabel: string; // "Fatigue that won't quit"
}

/**
 * All four modal question responses
 * Why: This is the user's self-declared intent and pain
 */
export interface ModalResponses {
  q1: QuestionAnswer; // Entry point - what condition/symptom
  q2: QuestionAnswer; // Pain point - what's hardest
  q3: QuestionAnswer; // Product-specific question 1
  q4: QuestionAnswer; // Product-specific question 2 (desired outcome)
}

/**
 * Complete user journey context for summary generation
 * This is EVERYTHING we know about the user at conversion time
 */
export interface UserConversionContext {
  // Session identifiers
  sessionId: string;
  modalSessionId: string;

  // Campaign attribution
  utm: UTMContext;

  // What they saw before clicking
  ad: AdContext | null; // null if direct visit

  // Landing page they arrived on
  landingPage: LandingPageContext;

  // Persona they connected with (story only, not name)
  persona: PersonaContext;

  // Their answers to modal questions
  answers: ModalResponses;

  // Device context (for copy adjustments)
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

// =============================================================================
// OUTPUT: Generated Summary
// =============================================================================

/**
 * The conversion summary shown before auth options
 * Why: This is THE conversion hook - must be highly personalized
 */
export interface ConversionSummary {
  /**
   * Headline that speaks directly to their pain/desire
   * Should reference their Q1 (condition) and Q2 (pain point)
   * Example: "We'll give you a 48-hour heads up before your fatigue crashes"
   */
  title: string;

  /**
   * Three specific benefits, ordered by relevance to their answers
   * Should feel like the app already understands their specific situation
   */
  benefits: [string, string, string];

  /**
   * CTA text for the auth buttons
   * Should feel like natural next step, not pushy
   */
  ctaText: string;
}

/**
 * Full response from the summary generator including metadata
 */
export interface SummaryGenerationResult {
  summary: ConversionSummary;
  metadata: {
    modelUsed: string; // 'gpt-4o-mini', 'claude-haiku', etc.
    promptTemplateId: string; // 'conversion_summary_v1'
    tokensUsed: number;
    latencyMs: number;
  };
}

// =============================================================================
// STORAGE: What we save to Supabase
// =============================================================================

/**
 * Data stored in ai_generations table
 */
export interface AIGenerationRecord {
  modal_session_id: string;
  session_id: string;
  context_json: UserConversionContext;
  generated_headline: string;
  generated_features: string[];
  generated_cta: string;
  full_output_json: SummaryGenerationResult;
  model_used: string;
  prompt_template_id: string;
  tokens_used: number;
  latency_ms: number;
  was_shown: boolean;
  summary_variant: 'llm_v1';
}
