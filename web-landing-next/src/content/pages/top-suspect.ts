import type { LandingPageContent } from '@/types';

/**
 * Top Suspect Landing Page Content
 *
 * Why this exists: Product-specific landing page for the "find triggers" angle.
 * Target: People who want to understand what causes their symptoms
 */

export const topSuspectContent: LandingPageContent = {
  pageId: 'top_suspect_landing',
  product: 'top-suspect',

  meta: {
    title: "Chronic Life - Stop guessing what's making you sick",
    description:
      'Was it the pizza, the weather, or the stress? Get evidence-based answers about your triggers.',
  },

  hero: {
    headlines: {
      default: "Stop guessing what's making you sick.",
      alt1: 'Find the culprit behind your flares.',
      alt2: 'Was it the pizza or the stress?',
    },
    subheadline:
      'Was it the pizza, the weather, or the stress? Get evidence-based answers about your triggers.',
    ctaText: 'Find your trigger',
    ctaId: 'hero_find_trigger',
  },

  conditions: ['Long COVID', 'ME/CFS', 'Fibromyalgia', 'POTS', 'EDS'],

  features: [
    {
      icon: 'search',
      title: 'Trigger Detection',
      description:
        "AI analyzes your logs to find correlations you'd never spot yourself.",
    },
    {
      icon: 'format_list_numbered',
      title: 'Ranked Suspects',
      description:
        'See your top triggers ranked by confidence, not just frequency.',
    },
    {
      icon: 'schedule',
      title: 'Lag Effect Detection',
      description:
        'Catches delayed reactions — like foods that hit 24-48 hours later.',
    },
    {
      icon: 'description',
      title: 'Doctor-Ready Reports',
      description:
        'Export findings in a format your doctor will actually read.',
    },
  ],
};
