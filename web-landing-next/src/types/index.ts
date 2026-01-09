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

export interface Testimonial {
  quote: string;
  author: string;
  condition?: string;
}

export interface LandingPageContent {
  pageId: string;
  product: ProductKey;
  meta: PageMeta;
  hero: HeroContent;
  conditions: string[];
  features: Feature[];
  testimonials?: Testimonial[];
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

// ============================================
// MODAL TYPES
// ============================================

export interface QuestionOption {
  value: string;
  label: string;
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
  q2?: string;
  q3?: string;
  q4?: string;
  email?: string;
}

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
