/**
 * Quote Selector - AI-assisted selection of social proof quotes
 *
 * Why this exists: Selects the most relevant testimonial quote based on
 * user's Q1 domain (condition) and Q2 pain point. Prioritizes "flipped"
 * positive quotes that show how Clue solves the problem, but falls back
 * to raw pain quotes that establish empathy.
 *
 * Selection logic:
 * 1. Match by condition first (most specific)
 * 2. Match by pain point category
 * 3. Prefer "flipped" positive quotes (isFlipped: true)
 * 4. Fall back to universal quotes
 */

import onboardingFlow from '@/content/onboarding-flow.json';
import {
  type CanonicalTestimonialId,
  getTestimonialById,
  TESTIMONIALS,
} from '@/content/testimonials';
import type { PainPointCategory, Testimonial } from '@/types';

import type { SelectedQuote } from '../types';

/**
 * Domain to condition mapping
 * Why: Maps Q1 domain IDs to condition keywords for matching
 */
const DOMAIN_TO_CONDITIONS: Record<string, string[]> = {
  fatigue: ['ME/CFS', 'Long COVID', 'Chronic Fatigue', 'Fibromyalgia'],
  flares: [
    'Fibromyalgia',
    'Chronic Pain',
    'Multiple chronic illnesses',
    'Autoimmune',
  ],
  migraines: ['Migraines', 'Headaches', 'Migraine'],
  ibs_gut: ['IBS', 'Gut', 'GERD', 'Digestive'],
  pots: ['POTS', 'Dysautonomia', 'EDS'],
  mental_health: ['Depression', 'Anxiety', 'Mental Health', 'ADHD', 'Bipolar'],
  multiple: ['Multiple conditions', 'Multiple chronic illnesses'],
  other: [],
};

/**
 * Default testimonial ID (stable fallback)
 *
 * Why this exists: Screen 4 must always render instantly, even when inputs are missing.
 */
const DEFAULT_TESTIMONIAL_ID: CanonicalTestimonialId =
  'burden_04_morning_coffee_flipped';

/**
 * Convert a canonical testimonial ID to the UI payload
 *
 * Why this exists: Analytics + selection operate on IDs; UI needs strings.
 */
export function testimonialIdToSelectedQuote(
  testimonialId: CanonicalTestimonialId
): SelectedQuote {
  const t = getTestimonialById(testimonialId);
  return {
    quote: t.quote,
    source: t.source,
    condition: t.condition,
    isClueInsight: Boolean(t.isClueInsight),
  };
}

/**
 * Score a testimonial based on match quality
 * Higher score = better match
 */
function scoreTestimonial(
  testimonial: (typeof TESTIMONIALS)[number],
  q1Domain: string,
  q2Value: string,
  preferFlipped: boolean
): number {
  let score = 0;

  // Get conditions that match this domain
  const domainConditions = DOMAIN_TO_CONDITIONS[q1Domain] || [];
  const painPointCategories = getPainPointCategoriesForQ2(q2Value);

  // Condition match (most important)
  if (testimonial.condition) {
    const conditionLower = testimonial.condition.toLowerCase();
    for (const domainCondition of domainConditions) {
      if (conditionLower.includes(domainCondition.toLowerCase())) {
        score += 30;
        break;
      }
    }
  }

  // Pain point category match
  if (
    testimonial.painPoint &&
    painPointCategories.includes(testimonial.painPoint)
  ) {
    score += 20;
  }

  // Flipped (positive/solution) quotes are preferred
  if (preferFlipped && testimonial.isFlipped) {
    score += 15;
  }

  // Clue insight quotes are valuable, but for social proof we slightly prefer real voices
  if (testimonial.isClueInsight) {
    score -= 5;
  }

  // Shorter quotes are often more impactful
  if (testimonial.quote.length < 100) {
    score += 5;
  }

  return score;
}

/**
 * Map Q2 value to testimonial pain point categories (deterministic)
 *
 * Why this exists: Phase 1 removes LLM latency; we still need context-aware selection.
 */
function getPainPointCategoriesForQ2(q2Value: string): PainPointCategory[] {
  const buckets = onboardingFlow.q4_value_props;

  if (buckets.validation.includes(q2Value)) return ['validation', 'doctor'];
  if (buckets.multi_condition.includes(q2Value))
    return ['burden', 'flexibility', 'setup'];
  if (buckets.trigger_discovery.includes(q2Value))
    return ['insight', 'burden', 'brain_fog'];
  if (buckets.pattern_finding.includes(q2Value)) return ['insight', 'setup'];
  if (buckets.prediction_based.includes(q2Value))
    return ['insight', 'brain_fog'];

  // Heuristic backups for unknown/new values
  if (q2Value.includes('brain_fog')) return ['brain_fog'];
  if (q2Value.includes('doctor')) return ['doctor', 'validation'];

  return ['burden', 'insight'];
}

/**
 * Select the best testimonial ID for a user based on their Q1/Q2 responses
 *
 * Why this exists: Screen 4 logs IDs; rendering looks up the quote locally.
 */
export function selectTestimonialIdForUser(
  q1Domain: string,
  q2Value: string,
  preferFlipped: boolean = true
): CanonicalTestimonialId {
  if (!q1Domain || !q2Value) return DEFAULT_TESTIMONIAL_ID;

  let best: { id: CanonicalTestimonialId; score: number } | null = null;

  for (const t of TESTIMONIALS) {
    const score = scoreTestimonial(t, q1Domain, q2Value, preferFlipped);
    if (!best || score > best.score) {
      best = { id: t.id, score };
    }
  }

  return best?.id ?? DEFAULT_TESTIMONIAL_ID;
}

/**
 * Backwards-compatible API returning a `SelectedQuote`
 *
 * Why this exists: Existing agent code expects a `SelectedQuote`. We keep this
 * wrapper while Phase 1 shifts everything to IDs + deterministic UI.
 */
export function selectQuoteForUser(
  _testimonials: Testimonial[],
  q1Domain: string,
  q2Value: string,
  preferFlipped: boolean = true
): SelectedQuote {
  const id = selectTestimonialIdForUser(q1Domain, q2Value, preferFlipped);
  return testimonialIdToSelectedQuote(id);
}

/**
 * Get a quote by specific pain point category
 * Useful for manual overrides or A/B testing
 */
export function getQuoteByPainPoint(
  _testimonials: Testimonial[],
  painPoint: string,
  preferFlipped: boolean = true
): SelectedQuote | null {
  const matches = TESTIMONIALS.filter((t) => t.painPoint === painPoint);

  if (matches.length === 0) {
    return null;
  }

  // Prefer flipped if requested
  if (preferFlipped) {
    const flipped = matches.find((t) => t.isFlipped);
    if (flipped) {
      return testimonialIdToSelectedQuote(flipped.id);
    }
  }

  // Return first match
  return testimonialIdToSelectedQuote(matches[0].id);
}

/**
 * Get a random quote from a specific condition
 * Useful for testing or variety
 */
export function getRandomQuoteForCondition(
  _testimonials: Testimonial[],
  condition: string
): SelectedQuote | null {
  const matches = TESTIMONIALS.filter((t) =>
    t.condition?.toLowerCase().includes(condition.toLowerCase())
  );

  if (matches.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * matches.length);
  return testimonialIdToSelectedQuote(matches[randomIndex].id);
}

export default selectQuoteForUser;
