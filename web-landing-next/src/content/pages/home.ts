import type { LandingPageContent } from '@/types';

/**
 * Home Landing Page Content
 *
 * Value prop: "Predict your next flare before it hits"
 * Target: General chronic illness audience
 */

export const homeContent: LandingPageContent = {
  pageId: 'home_landing',
  product: 'home',

  meta: {
    title: 'Predict your next flare before it hits',
    description: '20-second check-ins, flare mode on bad days, and a history that works when brain fog hits. Built for chronic life.',
  },

  hero: {
    headlines: {
      default: 'Predict your next flare before it hits',
      alt1: 'Finally know what\'s coming',
      alt2: 'Your body has patterns. Let\'s find them.',
    },
    subheadline: '20-second check-ins, flare mode on bad days, and a history that works when brain fog hits.',
    ctaText: 'Get early access',
    ctaId: 'hero_home',
  },

  conditions: ['Fibromyalgia', 'Long COVID', 'ME/CFS', 'Endometriosis', 'PCOS'],

  features: [
    {
      icon: 'visibility',
      title: 'Flare Forecasting',
      description: 'Get a 48-hour heads up based on your body\'s unique patterns.',
    },
    {
      icon: 'bolt',
      title: 'Spoon-Friendly',
      description: '20-second check-ins. Voice notes when typing is too much.',
    },
    {
      icon: 'search',
      title: 'Trigger Detection',
      description: 'Find the hidden patterns your brain fog misses.',
    },
    {
      icon: 'description',
      title: 'Doctor-Ready',
      description: 'Export findings in a format your doctor will actually read.',
    },
  ],
};
