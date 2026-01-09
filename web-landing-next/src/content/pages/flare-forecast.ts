import type { LandingPageContent } from '@/types';

/**
 * Flare Forecast Landing Page Content
 *
 * Value prop: "Your flares have a forecast"
 * Target: People who want advance warning of flares
 */

export const flareForecastContent: LandingPageContent = {
  pageId: 'flare_forecast_landing',
  product: 'flare-forecast',

  meta: {
    title: 'Your flares have a forecast',
    description: 'Get a 48-hour heads up based on your body\'s patterns. Stop being blindsided by flares.',
  },

  hero: {
    headlines: {
      default: 'Your flares have a forecast',
      alt1: 'Know before it hits',
      alt2: 'Stop being blindsided',
      altFocus: 'When will your next flare hit?',
    },
    subheadline: 'Get a 48-hour heads up based on your body\'s patterns. Stop being blindsided by flares.',
    ctaText: 'See how it works',
    ctaId: 'hero_flare_forecast',
    altCtaText: 'Find out',
    altCtaId: 'hero_focus_question',
  },

  conditions: ['Fibromyalgia', 'Long COVID', 'ME/CFS', 'POTS', 'Lupus'],

  features: [
    {
      icon: 'visibility',
      title: 'Pattern Detection',
      description: 'Your app learns what comes before a flare — sleep changes, activity spikes, stress markers.',
    },
    {
      icon: 'notifications_active',
      title: '48-Hour Warnings',
      description: 'Get notified when your patterns suggest a flare is likely, so you can prepare.',
    },
    {
      icon: 'trending_up',
      title: 'Risk Timeline',
      description: 'See your flare probability for the next few days, not just a single prediction.',
    },
    {
      icon: 'lightbulb',
      title: 'Prevention Tips',
      description: 'Personalized suggestions based on what\'s worked before when you\'ve avoided flares.',
    },
  ],

  testimonials: [
    {
      quote: 'I finally stopped canceling plans at the last minute. Now I know 2 days ahead.',
      author: 'Sarah M.',
      condition: 'Fibromyalgia',
    },
  ],
};
