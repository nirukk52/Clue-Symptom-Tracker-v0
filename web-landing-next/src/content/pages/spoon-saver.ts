import type { LandingPageContent } from '@/types';

/**
 * Spoon Saver Landing Page Content
 *
 * Why this exists: Core product landing page for "Low-effort, non-judgmental,
 * flexible symptom tracking that works on bad days and doesn't create guilt."
 *
 * Content sourced from: spoonies-our-customer-pain-points-and-experiences.md
 * Real user quotes from r/ChronicIllness, r/BearableApp, r/POTS forums
 */

export const spoonSaverContent: LandingPageContent = {
  pageId: 'spoon_saver_landing',
  product: 'spoon-saver',

  meta: {
    title: 'Chronic Life - Track symptoms without draining your energy',
    description:
      'Low-effort symptom tracking for spoonies. No guilt, no judgment, no streaks. Built for bad days.',
  },

  hero: {
    headlines: {
      default: 'Track symptoms without draining your energy.',
      alt1: 'No streaks. No sad faces. No guilt.',
      alt2: 'Built for days when you can barely function.',
      altFocus: 'A tracker that finally gets it.',
    },
    subheadline:
      "When every task costs energy, tracking shouldn't. Log symptoms in 20 seconds, even on your worst days.",
    ctaText: 'Start a 20-second check-in',
    ctaId: 'hero_quick_checkin',
    altCtaText: 'See how it works on bad days',
    altCtaId: 'hero_flare_mode',
  },

  conditions: [
    'Long COVID',
    'ME/CFS',
    'Fibromyalgia',
    'POTS',
    'EDS',
    'Chronic Pain',
  ],

  features: [
    {
      icon: 'bolt',
      title: '20-Second Check-ins',
      description:
        'Just the essentials. Tap a few options, done. No endless questionnaires or complex forms.',
    },
    {
      icon: 'bedtime',
      title: 'Flare Mode',
      description:
        "Bad day? One tap switches to minimal tracking. We'll capture what matters without draining you.",
    },
    {
      icon: 'psychology',
      title: 'Brain Fog Friendly',
      description:
        'Big buttons, simple choices. When your brain is mush, we adapt to your capacity.',
    },
    {
      icon: 'favorite',
      title: 'No Judgment',
      description:
        'No red sad faces. No broken streaks. Your 6/10 might be a victory—we know that.',
    },
    {
      icon: 'mic',
      title: 'Voice Notes',
      description:
        "When typing is too much, just talk. We'll capture what matters without the effort.",
    },
    {
      icon: 'auto_awesome',
      title: 'Pattern Discovery',
      description:
        "We do the analysis so you don't have to. See connections your foggy brain might miss.",
    },
  ],

  /**
   * Testimonials highlighting pain points AND Clue's solutions
   * Mix of: flipped positive quotes + Clue insights + doctor validation
   * Shows the transformation: Problem → Clue Solution
   */
  testimonials: [
    // FLIPPED: Burden → Easy with Clue
    {
      quote: 'Symptom tracking is no longer a full-time job.',
      source: 'Clue user',
      condition: 'Long COVID',
      painPoint: 'burden',
      isFlipped: true,
    },
    // FLIPPED: Setup complexity → Clue handles it
    {
      quote:
        'I used to spend a year setting up trackers. Clue understood my conditions from day one.',
      source: 'Clue user',
      condition: 'Fibromyalgia + POTS',
      painPoint: 'setup',
      isFlipped: true,
    },
    // FLIPPED: Nobody knows what to do → Clue knows
    {
      quote:
        "Doctors said 'no one knows what to do with you.' Clue helped me find patterns they missed.",
      source: 'Clue user',
      condition: 'EDS + MCAS',
      painPoint: 'validation',
      isFlipped: true,
    },
    // CLUE INSIGHT: Correlation detection
    {
      quote: 'High humidity correlates with your joint pain at 0.6 strength.',
      source: 'Clue Insight',
      condition: 'Rheumatoid Arthritis',
      painPoint: 'insight',
      isClueInsight: true,
    },
    // CLUE INSIGHT: Medication effectiveness
    {
      quote:
        'Noticed your fatigue is often lower on days you take medication X.',
      source: 'Clue Insight',
      condition: 'ME/CFS',
      painPoint: 'insight',
      isClueInsight: true,
    },
    // DOCTOR VALIDATION: Reports that work
    {
      quote:
        'My doctor loves when I walk in with the reports—he can see how things are going at a glance.',
      source: 'r/ChronicIllness',
      condition: 'Migraines',
      painPoint: 'doctor',
    },
    // FLIPPED: Data scattered → Syncs automatically
    {
      quote:
        'Finally, an app that syncs with Apple Health. All my data in one place.',
      source: 'Clue user',
      condition: 'POTS',
      painPoint: 'sync',
      isFlipped: true,
    },
    // FLIPPED: Brain fog memory issues → Clue remembers
    {
      quote: 'Brain fog used to mean lost data. Now Clue remembers for me.',
      source: 'Clue user',
      condition: 'Long COVID',
      painPoint: 'brain_fog',
      isFlipped: true,
    },
    // FLIPPED: Judgment/anxiety → No guilt tracking
    {
      quote: 'No sad faces. No broken streaks. Just data that actually helps.',
      source: 'Clue user',
      condition: 'Chronic Pain',
      painPoint: 'judgment',
      isFlipped: true,
    },
    // CLUE INSIGHT: Trigger detection
    {
      quote: 'Your flares often follow nights with less than 5 hours of sleep.',
      source: 'Clue Insight',
      condition: 'Endometriosis',
      painPoint: 'insight',
      isClueInsight: true,
    },
    // FLIPPED: Fitness-focused apps → Designed for illness
    {
      quote:
        "Finally, an app designed for illness, not fitness. No step counts, no 'wellness' shaming—just real symptom tracking.",
      source: 'Clue user',
      condition: 'Multiple chronic illnesses',
      painPoint: 'validation',
      isFlipped: true,
    },
  ],

  /**
   * "No Guilt Zone" - Key differentiator
   * Addresses: Emotional toll, anxiety, feeling judged by app
   */
  // noGuilt: {
  //   headline: "We don't judge your bad days.",
  //   subheadline: "No streaks. No sad faces. No guilt.",
  //   features: [
  //     "Your 6/10 might be a victory—we know that",
  //     "Missing days are data too (you were 'wiped')",
  //     "Neutral language, not value judgments",
  //     "Come back anytime, no questions asked",
  //     "We celebrate awareness, not just 'good' days",
  //   ],
  // },

  /**
   * Brain Fog Friendly - Accessibility for cognitive impairment
   * Addresses: "Brain fog makes everything harder"
   */
  brainFog: {
    headline: 'A second brain for foggy days.',
    features: [
      {
        icon: 'touch_app',
        title: 'One-tap logging',
        description: 'No typing required. Just tap and done.',
      },
      {
        icon: 'record_voice_over',
        title: 'Voice notes',
        description: 'Speak when typing feels impossible.',
      },
      {
        icon: 'history',
        title: 'Memory backup',
        description: "We remember context so you don't have to.",
      },
      {
        icon: 'visibility',
        title: 'Clear history',
        description: "Understand what happened even when you can't recall.",
      },
      {
        icon: 'dark_mode',
        title: 'Dark mode',
        description: 'Easy on sensitive eyes during migraines.',
      },
    ],
  },

  /**
   * Comparison: What makes us different
   * Differentiate from Bearable, Daylio, and other trackers
   */
  comparison: [
    {
      them: 'Track everything every day',
      us: 'Track what matters to YOUR question',
    },
    {
      them: 'Sad face emojis on bad days',
      us: 'Neutral, supportive language',
    },
    {
      them: 'Streak gamification',
      us: 'No guilt for missed days',
    },
    {
      them: 'Complex setup with 50+ options',
      us: 'Smart templates you customize',
    },
    {
      them: "Data dumps you can't understand",
      us: 'Insights that tell you something',
    },
    {
      them: 'Same interface every day',
      us: 'Flare Mode adapts to your capacity',
    },
  ],
};
