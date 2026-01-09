import type { LandingPageContent } from '@/types';

/**
 * Top Suspect Landing Page Content
 *
 * Value prop: "Find your hidden triggers"
 * Target: People who want to understand what causes their symptoms
 */

export const topSuspectContent: LandingPageContent = {
  pageId: 'top_suspect_landing',
  product: 'top-suspect',

  meta: {
    title: 'Find your hidden triggers',
    description: 'Discover what\'s really causing your flares with pattern detection that catches what you miss.',
  },

  hero: {
    headlines: {
      default: 'Find your hidden triggers',
      alt1: 'Connect the dots your brain can\'t',
      alt2: 'Stop guessing, start knowing',
    },
    subheadline: 'Discover what\'s really causing your flares with pattern detection that catches what you miss.',
    ctaText: 'See how it works',
    ctaId: 'hero_top_suspect',
  },

  conditions: ['Migraines', 'IBS', 'Fibromyalgia', 'Eczema', 'MCAS'],

  features: [
    {
      icon: 'search',
      title: 'Trigger Detection',
      description: 'AI analyzes your logs to find correlations you\'d never spot yourself.',
    },
    {
      icon: 'format_list_numbered',
      title: 'Ranked Suspects',
      description: 'See your top triggers ranked by confidence, not just frequency.',
    },
    {
      icon: 'schedule',
      title: 'Lag Effect Detection',
      description: 'Catches delayed reactions — like foods that hit 24-48 hours later.',
    },
    {
      icon: 'description',
      title: 'Doctor-Ready Reports',
      description: 'Export findings in a format your doctor will actually read.',
    },
  ],
};
