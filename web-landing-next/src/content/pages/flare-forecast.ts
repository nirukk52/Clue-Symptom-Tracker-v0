import type { LandingPageContent } from '@/types';

/**
 * Flare Forecast Landing Page Content
 *
 * Why this exists: Product-specific landing page for the "predict flares" angle.
 * All content comes from the config file - this file just wires it up.
 */

export const flareForecastContent: LandingPageContent = {
  pageId: 'flare_forecast_landing',
  product: 'flare-forecast',

  meta: {
    title: 'Chronic Life - Your flares have a forecast',
    description:
      "Get a 48-hour heads up based on your body's patterns. Stop being blindsided by flares.",
  },

  hero: {
    headlines: {
      default: 'Your flares have a forecast.',
      alt1: 'See flares coming 48 hours early.',
      alt2: 'Stop being blindsided by flares.',
    },
    subheadline:
      "Get a 48-hour heads up based on your body's patterns. Stop being blindsided by flares.",
    ctaText: 'See your forecast',
    ctaId: 'hero_see_forecast',
  },

  conditions: ['Long COVID', 'ME/CFS', 'Fibromyalgia', 'POTS', 'EDS'],

  features: [
    {
      icon: 'visibility',
      title: 'Pattern Detection',
      description:
        'Your app learns what comes before a flare — sleep changes, activity spikes, stress markers.',
    },
    {
      icon: 'notifications_active',
      title: '48-Hour Warnings',
      description:
        'Get notified when your patterns suggest a flare is likely, so you can prepare.',
    },
    {
      icon: 'trending_up',
      title: 'Risk Timeline',
      description:
        'See your flare probability for the next few days, not just a single prediction.',
    },
    {
      icon: 'lightbulb',
      title: 'Prevention Tips',
      description:
        "Personalized suggestions based on what's worked before when you've avoided flares.",
    },
  ],

  testimonials: [
    {
      quote:
        'I finally stopped canceling plans at the last minute. Now I know 2 days ahead.',
      author: 'Sarah M.',
      condition: 'Fibromyalgia',
    },
  ],
};
