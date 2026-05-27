import type { LandingPageContent } from '@/types';

/**
 * Crash Prevention Landing Page Content
 *
 * Why this exists: Product-specific landing page for the "pacing/energy" angle.
 * Target: People who struggle with pacing and boom-bust cycles
 */

export const crashPreventionContent: LandingPageContent = {
  pageId: 'crash_prevention_landing',
  product: 'crash-prevention',

  meta: {
    title: "Chronic Life - Know when to stop before it's too late",
    description:
      "Get daily alerts when you're approaching your limit. Break the boom-bust cycle.",
  },

  hero: {
    headlines: {
      default: "Know when to stop before it's too late.",
      alt1: 'Break the boom-bust cycle.',
      alt2: 'Stop paying tomorrow for today.',
    },
    subheadline:
      "Get daily alerts when you're approaching your limit. Break the boom-bust cycle.",
    ctaText: 'Start preventing crashes',
    ctaId: 'hero_prevent_crashes',
  },

  conditions: ['Long COVID', 'ME/CFS', 'Fibromyalgia', 'POTS', 'EDS'],

  features: [
    {
      icon: 'battery_horiz_075',
      title: 'Energy Tracking',
      description:
        'Log your energy levels in seconds. We learn your patterns and limits.',
    },
    {
      icon: 'warning',
      title: 'Limit Alerts',
      description:
        "Get a gentle nudge when you're approaching your energy envelope.",
    },
    {
      icon: 'self_improvement',
      title: 'Pacing Coach',
      description:
        'Daily push vs. rest guidance based on your current reserves.',
    },
    {
      icon: 'insights',
      title: 'Crash Analysis',
      description:
        'See what led to past crashes so you can avoid repeating them.',
    },
  ],
};
