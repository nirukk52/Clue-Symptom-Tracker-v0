/**
 * Type definitions for Chronic Life Landing Pages
 *
 * Why this exists: Provides type safety for page content, tracking events,
 * and component props. Catches errors at build time instead of runtime.
 */

// ============================================
// PAGE CONTENT TYPES
// ============================================

export interface PageMeta {
  title: string;
  description: string;
}

export interface HeroContent {
  headlines: {
    default: string;
    alt1?: string;
    alt2?: string;
    altFocus?: string;
  };
  subheadline: string;
  ctaText: string;
  ctaId: string;
  /** Alternative CTA for focus variant */
  altCtaText?: string;
  altCtaId?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

/**
 * Testimonial from Spoonie community
 * Why: Social proof using real voices from chronic illness community
 *
 * Types:
 * - Problem quotes: Show the pain points users face
 * - Flipped quotes: Same pain points but showing how Clue solves them
 * - Clue insights: Show actual Clue-generated insights
 */
export interface Testimonial {
  quote: string;
  source: string;
  /** Condition tag displayed on the card */
  condition?: string;
  /** Pain point category for styling */
  painPoint:
    | 'burden'
    | 'judgment'
    | 'brain_fog'
    | 'relief'
    | 'aspiration'
    | 'timing'
    | 'complexity'
    | 'validation'
    | 'setup'
    | 'insight'
    | 'sync'
    | 'doctor';
  /** Whether this is a "flipped" positive version (showing Clue's solution) */
  isFlipped?: boolean;
  /** Whether this is a Clue-generated insight example */
  isClueInsight?: boolean;
}

/**
 * "No Guilt" section content
 * Why: Key differentiator - emotional safety in tracking
 */
export interface NoGuiltContent {
  headline: string;
  subheadline: string;
  features: string[];
}

/**
 * "Brain Fog Friendly" section content
 * Why: Accessibility for cognitive impairment
 */
export interface BrainFogContent {
  headline: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

/**
 * Comparison table for "What Makes Us Different"
 * Why: Differentiate from Bearable/Daylio competitors
 */
export interface ComparisonItem {
  them: string;
  us: string;
}

export interface LandingPageContent {
  pageId: string;
  product: ProductKey;
  meta: PageMeta;
  hero: HeroContent;
  conditions: string[];
  features: Feature[];
  testimonials?: Testimonial[];
  /** "No Guilt" emotional safety section (spoon-saver specific) */
  noGuilt?: NoGuiltContent;
  /** Brain fog accessibility section (spoon-saver specific) */
  brainFog?: BrainFogContent;
  /** Comparison with competitors (spoon-saver specific) */
  comparison?: ComparisonItem[];
}

// ============================================
// PRODUCT TYPES
// ============================================

export type ProductKey =
  | 'flare-forecast'
  | 'top-suspect'
  | 'crash-prevention'
  | 'spoon-saver'
  | 'home';

export interface ProductOffering {
  name: string;
  icon: string;
  color: string;
}

// ============================================
// TRACKING TYPES
// ============================================

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface TrackingEvent {
  event_type: string;
  session_id: string;
  element_id: string;
  element_text?: string;
  page_url: string;
  referrer?: string;
}

/**
 * Landing visit record - tracks initial page visits
 * Stored in `landing_visits` table
 */
export interface LandingVisit {
  id?: string;
  session_id: string;
  product_offering: ProductKey;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  headline_variant?: string;
  persona_shown?: PersonaKey;
  persona_source?: 'url_param' | 'random' | 'default';
  user_agent?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  referrer?: string;
  created_at?: string;
}

/**
 * Modal session record - tracks modal engagement
 * Stored in `modal_sessions` table
 */
export interface ModalSession {
  id?: string;
  visit_id?: string;
  session_id: string;
  product_offering: ProductKey;
  persona_shown?: PersonaKey;
  utm_content?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  step_reached: number;
  total_steps: number;
  completed?: boolean;
  completed_at?: string;
  abandoned_at_step?: number;
  time_to_complete_ms?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Modal response record - tracks individual question answers
 * Stored in `modal_responses` table
 */
export interface ModalResponse {
  id?: string;
  modal_session_id: string;
  question_number: number;
  question_key: string;
  question_text: string;
  step_number: number;
  answer_value: string;
  answer_label: string;
  previous_answer_value?: string;
  product_offering: ProductKey;
  time_to_answer_ms?: number;
  created_at?: string;
}

// ============================================
// MODAL TYPES
// ============================================

/**
 * QuestionOption - Option for modal questions
 *
 * Why label + description: Q1 uses short punchy labels with descriptive
 * subtext to keep UI scannable while providing context. Q2+ use label only.
 */
export interface QuestionOption {
  value: string;
  /** Main label - short for Q1, longer descriptive text for Q2+ */
  label: string;
  /** Optional description shown below label (used in Q1 for subtext) */
  description?: string;
}

export interface Question {
  text: string;
  options: QuestionOption[];
}

export interface ProductQuestions {
  q3: Question;
  q4: Question;
}

export interface ModalResponses {
  q1?: string;
  q1_label?: string;
  q2?: string;
  q2_label?: string;
  q3?: string;
  q3_label?: string;
  q4?: string;
  q4_label?: string;
  email?: string;
}

// ============================================
// SUMMARY GENERATION TYPES
// ============================================

/**
 * Question answer for summary context
 */
export interface QuestionAnswer {
  questionKey: string;
  questionText: string;
  answerValue: string;
  answerLabel: string;
}

/**
 * All modal question responses in structured format for summary generation
 */
export interface ModalResponsesStructured {
  q1: QuestionAnswer;
  q2: QuestionAnswer;
  q3: QuestionAnswer;
  q4: QuestionAnswer;
}

/**
 * The conversion summary shown before auth options
 */
export interface ConversionSummary {
  title: string;
  benefits: [string, string, string];
  ctaText: string;
}

/**
 * Full response from the summary generator
 */
export interface SummaryGenerationResult {
  summary: ConversionSummary;
  metadata: {
    modelUsed: string;
    promptTemplateId: string;
    tokensUsed: number;
    latencyMs: number;
  };
}

// ============================================
// CHAT TYPES
// ============================================

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  selectedChip?: string;
  wasChipSelection?: boolean;
  createdAt: string;
}

/**
 * Chat conversation record
 */
export interface ChatConversation {
  id?: string;
  modal_session_id?: string;
  user_email?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  product_offering: ProductKey;
  last_message_at?: string;
  created_at?: string;
}

/**
 * Dynamic chips based on user's Q1 answer
 */
export const CHAT_CHIPS_BY_Q1: Record<string, string[]> = {
  fatigue: ['Low energy', 'Brain fog', 'Just tired'],
  flares: ['Starting to flare', 'Feeling okay', 'Not sure'],
  migraines: ['Head hurts', 'Aura symptoms', 'Feeling fine'],
  ibs_gut: ['Stomach issues', 'Bloated', 'Doing okay'],
  multiple: ['Rough day', 'Managing', 'Better today'],
  other: ['Not great', 'Okay', 'Pretty good'],
};

// ============================================
// PERSONA TYPES
// ============================================

export type PersonaKey = 'maya' | 'jordan' | 'marcus';

export interface PersonaInfo {
  name: string;
  image: string;
  alt: string;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ButtonVariant {
  variant?: 'hero' | 'nav' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
