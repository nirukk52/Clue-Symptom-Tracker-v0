import type { LandingPageContent } from '@/types';

/**
 * Spoon Saver Landing Page Content
 *
 * Why this exists: Product-specific landing page for the "low energy tracking" angle.
 * Target: People who find tracking too exhausting
 */

export const spoonSaverContent: LandingPageContent = {
  pageId: 'spoon_saver_landing',
  product: 'spoon-saver',

  meta: {
    title: 'Chronic Life - Track symptoms without draining your energy',
    description:
      "20-second check-ins designed for spoonies. When every task costs energy, tracking shouldn't.",
  },

  hero: {
    headlines: {
      default: 'Track symptoms without draining your energy.',
      alt1: '20-second check-ins for spoonies.',
      alt2: 'Stop spending spoons on tracking.',
      altFocus: 'Finally answer your biggest health question.',
    },
    subheadline:
      "When every task costs energy, tracking shouldn't. Log symptoms in 20 seconds flat.",
    ctaText: 'Start a 20-second check-in',
    ctaId: 'hero_quick_checkin',
    altCtaText: 'Set up your first focus question',
    altCtaId: 'hero_focus_question',
  },

  conditions: ['Long COVID', 'ME/CFS', 'Fibromyalgia', 'POTS', 'EDS'],

  features: [
    {
      icon: 'bolt',
      title: '20-Second Check-ins',
      description:
        'Just the essentials. Tap a few options, done. No endless questionnaires.',
    },
    {
      icon: 'mic',
      title: 'Voice Notes',
      description:
        "When typing is too much, just talk. We'll capture what matters.",
    },
    {
      icon: 'bedtime',
      title: 'Flare Mode',
      description:
        'Bad day? One tap switches to minimal tracking that still keeps you covered.',
    },
    {
      icon: 'psychology',
      title: 'Brain Fog Friendly',
      description:
        'Big buttons, simple choices, and a history you can actually understand.',
    },
  ],
};
