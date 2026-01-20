import { TESTIMONIALS } from '@/content/testimonials';
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
      default: 'Log how you’re feeling\nwithout forms,\ntracking, or effort',
      alt1: 'No streaks.\nNo sad faces.\nNo guilt.',
      alt2: 'Built for days\nwhen you can\nbarely function.',
      altFocus: 'A tracker\nthat finally\ngets it.',
    },
    subheadline:
      "Bad days are hard to explain. Just say what’s going on — we’ll help find patterns and which issue to tackle first.",
    ctaText: 'Just say how today feels',
    ctaId: 'hero_quick_checkin',
    altCtaText: 'See how it works on bad days',
    altCtaId: 'hero_flare_mode',
  },

  conditions: [
    'Low energy day',
    'Brain fog',
    'Flare day',
    'Pain spike',
    'Overwhelmed',
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
   * Mix of: Real pain quotes + flipped positive quotes + Clue insights
   *
   * Categories:
   * - burden: Tracking exhaustion, "full-time job" feeling
   * - brain_fog: Memory issues, cognitive load
   * - judgment: Emotional toll, anxiety from app feedback
   * - setup: Complex configuration, overwhelm
   * - insight: Lack of useful analysis
   * - doctor: Provider communication struggles
   * - validation: Feeling dismissed, not believed
   * - sync: Data scattered across apps
   * - flexibility: Apps too limited or rigid
   *
   * Source: spoonies-our-customer-pain-points-and-experiences.md
   */
  /**
   * Persona assignment logic (from PERSONA-DESIGN.md):
   *
   * MAYA (38, South Asian/Mediterranean, fibromyalgia + long COVID):
   * - Project manager, stepped back to part-time work
   * - Data-focused, organized, methodical
   * - Long COVID, Fibromyalgia, work-life references
   * - Doctor communication (prepared approach)
   *
   * JORDAN (28, non-binary, younger):
   * - ADHD + chronic illness mentions
   * - Brain fog, cognitive load, memory issues
   * - Mental health, depression references
   * - POTS (younger demographic)
   * - Casual/relatable tone
   *
   * MARCUS (40, Black man, grounded strength):
   * - Self-advocacy, validation struggles
   * - Doctor dismissal / gaslighting
   * - Fighting for recognition
   * - EDS, undiagnosed, "no one believes me"
   * - Firm, determined tone
   */
  testimonials: TESTIMONIALS,

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
