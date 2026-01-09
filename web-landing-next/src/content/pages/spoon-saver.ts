import type { LandingPageContent } from '@/types';

/**
 * Spoon Saver Landing Page Content
 *
 * Value prop: "Tracking that doesn't cost spoons"
 * Target: People who find tracking too exhausting
 */

export const spoonSaverContent: LandingPageContent = {
  pageId: 'spoon_saver_landing',
  product: 'spoon-saver',

  meta: {
    title: 'Tracking that doesn\'t cost spoons',
    description: '20-second check-ins. Voice notes when typing is too much. Flare mode on bad days.',
  },

  hero: {
    headlines: {
      default: 'Tracking that doesn\'t cost spoons',
      alt1: 'Finally, an app that gets it',
      alt2: 'Built for low-energy days',
    },
    subheadline: '20-second check-ins. Voice notes when typing is too much. Flare mode on bad days.',
    ctaText: 'See how it works',
    ctaId: 'hero_spoon_saver',
  },

  conditions: ['ME/CFS', 'Fibromyalgia', 'Long COVID', 'Chronic Fatigue', 'POTS'],

  features: [
    {
      icon: 'bolt',
      title: '20-Second Check-ins',
      description: 'Just the essentials. Tap a few options, done. No endless questionnaires.',
    },
    {
      icon: 'mic',
      title: 'Voice Notes',
      description: 'When typing is too much, just talk. We\'ll capture what matters.',
    },
    {
      icon: 'bedtime',
      title: 'Flare Mode',
      description: 'Bad day? One tap switches to minimal tracking that still keeps you covered.',
    },
    {
      icon: 'psychology',
      title: 'Brain Fog Friendly',
      description: 'Big buttons, simple choices, and a history you can actually understand.',
    },
  ],
};
