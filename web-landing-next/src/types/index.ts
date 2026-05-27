/**
 * Type definitions for Chronic Life / Clue
 *
 * Why this exists: Shared types for landing pages, the Clue chat agent,
 * knowledge graph, and related features.
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
  altCtaText?: string;
  altCtaId?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export type PainPointCategory =
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
  | 'doctor'
  | 'flexibility'
  | 'ux'
  | 'desire';

export interface Testimonial {
  id?: string;
  quote: string;
  source: string;
  condition?: string;
  painPoint: PainPointCategory;
  isFlipped?: boolean;
  isClueInsight?: boolean;
  persona?: PersonaKey;
}

export interface NoGuiltContent {
  headline: string;
  subheadline: string;
  features: string[];
}

export interface BrainFogContent {
  headline: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

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
  noGuilt?: NoGuiltContent;
  brainFog?: BrainFogContent;
  comparison?: ComparisonItem[];
}

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

export interface QuestionOption {
  value: string;
  label: string;
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

export interface QuestionAnswer {
  questionKey: string;
  questionText: string;
  answerValue: string;
  answerLabel: string;
}

export interface ModalResponsesStructured {
  q1: QuestionAnswer;
  q2: QuestionAnswer;
  q3: QuestionAnswer;
  q4: QuestionAnswer;
}

export interface ConversionSummary {
  title: string;
  benefits: [string, string, string];
  ctaText: string;
}

export interface SummaryGenerationResult {
  summary: ConversionSummary;
  metadata: {
    modelUsed: string;
    promptTemplateId: string;
    tokensUsed: number;
    latencyMs: number;
  };
}

export type PersonaKey = 'maya' | 'jordan' | 'marcus';

export interface PersonaInfo {
  name: string;
  image: string;
  alt: string;
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
  createdAt: string;
}

/**
 * Chat conversation record
 */
export interface ChatConversation {
  id?: string;
  user_id?: string;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// GRAPH TYPES (shared with clue-chat/types.ts)
// ============================================

export type GraphNodeType =
  | 'symptom'
  | 'factor'
  | 'medication'
  | 'condition'
  | 'clue'
  | 'unknown';

export type GraphEdgeType =
  | 'TRIGGERS'
  | 'CORRELATES_WITH'
  | 'SUPPORTED_BY'
  | 'NEEDS_INFO'
  | 'ABOUT'
  | 'IMPROVES';

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface ButtonVariant {
  variant?: 'hero' | 'nav' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
