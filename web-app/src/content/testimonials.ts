import type { Testimonial } from '@/types';

/**
 * Canonical Testimonials (SSOT)
 *
 * Why this exists: We need one stable, shared source of social proof quotes
 * across landing pages and onboarding Screen 4. Each testimonial has a stable
 * `id` so we can log exactly what a user saw (and later let an LLM select
 * among options without string-matching).
 */

export type TestimonialId = string;

/**
 * CanonicalTestimonial
 *
 * Why this exists: Extends the existing `Testimonial` type with a stable ID for
 * analytics + deterministic selection.
 */
export type CanonicalTestimonial = Testimonial & {
  id: TestimonialId;
};

export const TESTIMONIALS = [
  // ============================================================
  // BURDEN: "Tracking feels like a full-time job"
  // ============================================================
  {
    id: 'burden_01_page_long_list',
    quote:
      'I used to have a page-long list of symptoms. Now I track the same detail in 30 seconds with Clue.',
    source: 'Clue user',
    condition: 'Multiple chronic illnesses',
    painPoint: 'burden',
    persona: 'maya',
  },
  {
    id: 'burden_02_easy_mental_models',
    quote:
      'I got back to tracking because Clue created easy mental models for me.',
    source: 'Clue user',
    condition: 'Long COVID',
    painPoint: 'burden',
    persona: 'maya',
  },
  {
    id: 'burden_03_effortless_tracking',
    quote:
      'I thought tracking had to be a full-time job. Clue showed me it can be effortless.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'burden',
    persona: 'maya',
  },
  {
    id: 'burden_04_morning_coffee_flipped',
    quote:
      'Symptom tracking is no longer a full-time job. It’s just a part of my morning coffee.',
    source: 'Clue user',
    condition: 'Long COVID',
    painPoint: 'burden',
    isFlipped: true,
    persona: 'maya',
  },

  // ============================================================
  // BRAIN FOG: Memory issues, cognitive overload
  // ============================================================
  {
    id: 'brain_fog_01_memory_foggy',
    quote: 'My memory is foggy, but Clue remembers everything clearly for me.',
    source: 'Clue user',
    condition: 'Fibromyalgia',
    painPoint: 'brain_fog',
    persona: 'maya',
  },
  {
    id: 'brain_fog_02_gentle_nudges',
    quote:
      "I used to forget to track. Clue's gentle nudges fit perfectly into my day.",
    source: 'Clue user',
    condition: 'Chronic Pain',
    painPoint: 'brain_fog',
    persona: 'jordan',
  },
  {
    id: 'brain_fog_03_zero_in_on_what_matters',
    quote:
      'Clue helps me zero in on what matters without the exhausting complexity.',
    source: 'Clue user',
    condition: 'ADHD + Chronic Illness',
    painPoint: 'brain_fog',
    persona: 'jordan',
  },
  {
    id: 'brain_fog_04_lost_data_flipped',
    quote: 'Brain fog used to mean lost data. Now Clue remembers for me.',
    source: 'Clue user',
    condition: 'Long COVID',
    painPoint: 'brain_fog',
    isFlipped: true,
    persona: 'maya',
  },
  {
    id: 'brain_fog_05_one_tap_lifesaver',
    quote:
      'On bad days, the one-tap check-in is a lifesaver. No thinking required.',
    source: 'Clue user',
    condition: 'ME/CFS',
    painPoint: 'brain_fog',
    persona: 'jordan',
  },

  // ============================================================
  // JUDGMENT: Emotional toll, anxiety from app feedback
  // ============================================================
  {
    id: 'judgment_01_supportive_friend',
    quote:
      'Even on my worst days, Clue feels like a supportive friend, not a judgmental judge.',
    source: 'Clue user',
    condition: 'Depression + Chronic Pain',
    painPoint: 'judgment',
    persona: 'jordan',
  },
  {
    id: 'judgment_02_six_of_ten_victory',
    quote:
      'Clue understands that a 6/10 can be a victory. Finally, an app that gets my baseline.',
    source: 'Clue user',
    condition: 'Chronic Pain',
    painPoint: 'judgment',
    persona: 'marcus',
  },
  {
    id: 'judgment_03_open_on_bad_days',
    quote:
      'I actually open Clue on my bad days now. Flare Mode makes it safe and simple.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'judgment',
    persona: 'jordan',
  },
  {
    id: 'judgment_04_no_streak_worry',
    quote:
      'I stopped worrying about streaks. Clue values my data, not my daily login count.',
    source: 'Clue user',
    condition: 'Chronic Illness',
    painPoint: 'judgment',
    persona: 'maya',
  },
  {
    id: 'judgment_05_empowering_heart_rate',
    quote:
      'Tracking my heart rate used to give me anxiety. Clue presents it in a way that feels empowering.',
    source: 'Clue user',
    condition: 'POTS',
    painPoint: 'judgment',
    persona: 'jordan',
  },
  {
    id: 'judgment_06_no_sad_faces_flipped',
    quote: 'No sad faces. No broken streaks. Just data that actually helps.',
    source: 'Clue user',
    condition: 'Chronic Pain',
    painPoint: 'judgment',
    isFlipped: true,
    persona: 'marcus',
  },

  // ============================================================
  // SETUP: Complex configuration, analysis paralysis
  // ============================================================
  {
    id: 'setup_01_minutes_not_months',
    quote: 'I was set up and tracking meaningful data in minutes, not months.',
    source: 'Clue user',
    condition: 'Multiple chronic illnesses',
    painPoint: 'setup',
    persona: 'maya',
  },
  {
    id: 'setup_02_ready_day_one',
    quote:
      "I didn't have time to configure a complex app. Clue was ready for me from day one.",
    source: 'Clue user',
    condition: 'Fibromyalgia',
    painPoint: 'setup',
    persona: 'maya',
  },
  {
    id: 'setup_03_better_than_paper',
    quote:
      'I stopped searching for the perfect journal. Clue adapts to me better than paper ever did.',
    source: 'Clue user',
    condition: 'POTS',
    painPoint: 'setup',
    persona: 'jordan',
  },
  {
    id: 'setup_04_drown_in_data_points',
    quote:
      'I used to drown in data points. Now I just log what matters and get my life back.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'setup',
    persona: 'maya',
  },
  {
    id: 'setup_05_year_setting_up_flipped',
    quote:
      'I used to spend a year setting up trackers. Clue understood my conditions from day one.',
    source: 'Clue user',
    condition: 'Fibromyalgia + POTS',
    painPoint: 'setup',
    isFlipped: true,
    persona: 'maya',
  },

  // ============================================================
  // FLEXIBILITY: Apps too limited or rigid
  // ============================================================
  {
    id: 'flexibility_01_no_limits',
    quote:
      'Finally, no limits on my symptoms. Clue grows with my changing needs.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'flexibility',
    persona: 'maya',
  },
  {
    id: 'flexibility_02_handles_complex_list',
    quote:
      'My symptom list is complex, but Clue handles it with ease. No more messy notes.',
    source: 'Clue user',
    condition: 'POTS',
    painPoint: 'flexibility',
    persona: 'jordan',
  },
  {
    id: 'flexibility_03_add_any_symptom',
    quote:
      'I can add any symptom I feel. Clue respects that my condition is unique.',
    source: 'Clue user',
    condition: 'Dysautonomia',
    painPoint: 'flexibility',
    persona: 'jordan',
  },

  // ============================================================
  // INSIGHT: Lack of useful analysis
  // ============================================================
  {
    id: 'insight_01_understand_triggers',
    quote:
      'I used to just track. Now I actually understand my triggers thanks to Clue.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'insight',
    persona: 'maya',
  },
  {
    id: 'insight_02_strength_weighted_correlations',
    quote:
      'Clue gives me clear, strength-weighted correlations I can actually trust.',
    source: 'Clue user',
    condition: 'Migraines',
    painPoint: 'insight',
    persona: 'maya',
  },
  {
    id: 'insight_03_triggers_vs_warning_signs',
    quote:
      'Clue helped me finally distinguish between my triggers and my warning signs.',
    source: 'Clue user',
    condition: 'Migraines',
    painPoint: 'insight',
    persona: 'maya',
  },
  {
    id: 'insight_04_unpacking_flareups_flipped',
    quote:
      "It takes away so much stress that I don't have to be the one unpacking what's leading to flare-ups.",
    source: 'Clue user',
    condition: 'Fibromyalgia',
    painPoint: 'insight',
    isFlipped: true,
    persona: 'maya',
  },
  {
    id: 'insight_05_less_time_in_app',
    quote:
      'I spend less time in the app and more time living, because the insights are just there.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'insight',
    persona: 'maya',
  },

  // ============================================================
  // DOCTOR: Provider communication struggles
  // ============================================================
  {
    id: 'doctor_01_credibility_reports',
    quote:
      "My doctor actually listens now. Clue's reports gave me the credibility I needed.",
    source: 'Clue user',
    condition: 'Migraines',
    painPoint: 'doctor',
    persona: 'maya',
  },
  {
    id: 'doctor_02_empirical_data_treatment_plan',
    quote:
      "Clue gave me the empirical data to turn 'it's in your head' into a treatment plan.",
    source: 'Clue user',
    condition: 'Bipolar + Chronic Illness',
    painPoint: 'doctor',
    persona: 'jordan',
  },
  {
    id: 'doctor_03_productive_appointments',
    quote:
      'Having this data changed my medical appointments from frustrating to productive.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'doctor',
    persona: 'marcus',
  },

  // ============================================================
  // VALIDATION: Feeling dismissed, not believed
  // ============================================================
  {
    id: 'validation_01_not_a_mystery',
    quote:
      "I felt lost before. Clue's patterns showed me I'm not a mystery—I'm understandable.",
    source: 'Clue user',
    condition: 'Undiagnosed',
    painPoint: 'validation',
    persona: 'marcus',
  },
  {
    id: 'validation_02_data_speaks_for_itself',
    quote:
      'Doctors stopped dismissing me when I showed them my Clue reports. The data speaks for itself.',
    source: 'Clue user',
    condition: 'Chronic Illness',
    painPoint: 'validation',
    persona: 'marcus',
  },
  {
    id: 'validation_03_best_advocate',
    quote: 'I proved my adherence and my symptoms. Clue was my best advocate.',
    source: 'Clue user',
    condition: 'Mental Health + Chronic',
    painPoint: 'validation',
    persona: 'marcus',
  },
  {
    id: 'validation_04_wasnt_crazy',
    quote:
      "Seeing clear patterns validated my experience. I wasn't crazy, I was just tracking.",
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'validation',
    persona: 'marcus',
  },
  {
    id: 'validation_05_no_one_knows_flipped',
    quote:
      "Doctors said 'no one knows what to do with you.' Clue helped me find patterns they missed.",
    source: 'Clue user',
    condition: 'EDS + MCAS',
    painPoint: 'validation',
    isFlipped: true,
    persona: 'marcus',
  },
  {
    id: 'validation_06_designed_for_illness_flipped',
    quote:
      "Finally, an app designed for illness, not fitness. No step counts, no 'wellness' shaming.",
    source: 'Clue user',
    condition: 'Multiple chronic illnesses',
    painPoint: 'validation',
    isFlipped: true,
    persona: 'marcus',
  },

  // ============================================================
  // SYNC: Data scattered across apps
  // ============================================================
  {
    id: 'sync_01_complete_story',
    quote:
      'Clue brings everything together. My health data finally tells a complete story.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'sync',
    persona: 'maya',
  },
  {
    id: 'sync_02_apple_health_flipped',
    quote:
      'Finally, an app that syncs with Apple Health. All my data in one place.',
    source: 'Clue user',
    condition: 'POTS',
    painPoint: 'sync',
    isFlipped: true,
    persona: 'jordan',
  },

  // ============================================================
  // UX: Cognitive overload, distraction
  // ============================================================
  {
    id: 'ux_01_no_social_noise',
    quote:
      'I love that Clue focuses on *my* health, not distracting social noise.',
    source: 'Clue user',
    condition: 'ADHD + Chronic Illness',
    painPoint: 'ux',
    persona: 'jordan',
  },
  {
    id: 'ux_02_safe_space',
    quote: 'Clue is my safe space. No doom-scrolling, just helpful tracking.',
    source: 'Clue user',
    condition: 'Chronic Illness',
    painPoint: 'ux',
    persona: 'marcus',
  },
  {
    id: 'ux_03_stripped_away_clutter',
    quote:
      'Tracking is no longer a burden. Clue stripped away the clutter and left the clarity.',
    source: 'Clue user',
    condition: 'Multiple conditions',
    painPoint: 'ux',
    persona: 'marcus',
  },

  // ============================================================
  // CLUE INSIGHTS: AI-generated correlations
  // ============================================================
  {
    id: 'clue_insight_01_humidity_joint_pain',
    quote: 'High humidity correlates with your joint pain at 0.6 strength.',
    source: 'Clue Insight',
    condition: 'Rheumatoid Arthritis',
    painPoint: 'insight',
    isClueInsight: true,
    persona: 'marcus',
  },
  {
    id: 'clue_insight_02_fatigue_medication',
    quote: 'Noticed your fatigue is often lower on days you take medication X.',
    source: 'Clue Insight',
    condition: 'ME/CFS',
    painPoint: 'insight',
    isClueInsight: true,
    persona: 'jordan',
  },
  {
    id: 'clue_insight_03_flares_follow_short_sleep',
    quote: 'Your flares often follow nights with less than 5 hours of sleep.',
    source: 'Clue Insight',
    condition: 'Endometriosis',
    painPoint: 'insight',
    isClueInsight: true,
    persona: 'maya',
  },
  {
    id: 'clue_insight_04_family_boosts_mood',
    quote: 'Certain family interactions consistently boost your mood.',
    source: 'Clue Insight',
    condition: 'Depression + Chronic',
    painPoint: 'insight',
    isClueInsight: true,
    persona: 'jordan',
  },
  {
    id: 'clue_insight_05_supplement_making_worse',
    quote: 'That supplement may actually be making things worse.',
    source: 'Clue Insight',
    condition: 'Long COVID',
    painPoint: 'insight',
    isClueInsight: true,
    persona: 'maya',
  },

  // ============================================================
  // POSITIVE: What spoonies want / hope for
  // ============================================================
  {
    id: 'desire_01_saves_energy',
    quote: 'I want a tracker that saves me energy rather than consuming it.',
    source: 'Spoonie community',
    condition: 'ME/CFS',
    painPoint: 'desire',
    persona: 'jordan',
  },
  {
    id: 'desire_02_helpful_companion',
    quote:
      'I need a tool that feels like a helpful companion, not a strict ledger.',
    source: 'Spoonie community',
    condition: 'Fibromyalgia',
    painPoint: 'desire',
    persona: 'maya',
  },
  {
    id: 'desire_03_track_less_live_more',
    quote: 'I want to track less and live more.',
    source: 'Spoonie community',
    condition: 'Chronic Illness',
    painPoint: 'desire',
    persona: 'marcus',
  },
  {
    id: 'desire_04_energy_precious_spoons',
    quote:
      'When your energy is precious, every task costs a spoon. I need an app that gets it.',
    source: 'Spoonie community',
    condition: 'Multiple conditions',
    painPoint: 'desire',
    persona: 'jordan',
  },
] satisfies readonly CanonicalTestimonial[];

/**
 * TestimonialId union
 *
 * Why this exists: Gives us type-safe IDs for selection and logging.
 */
export type CanonicalTestimonialId = (typeof TESTIMONIALS)[number]['id'];

/**
 * Find testimonial by id
 *
 * Why this exists: UI/agent code logs IDs, and rendering needs the full record.
 */
export function getTestimonialById(
  id: CanonicalTestimonialId
): CanonicalTestimonial {
  const found = TESTIMONIALS.find((t) => t.id === id);
  if (!found) {
    // Fail-safe: keep UI alive even if analytics references drift.
    return TESTIMONIALS[0];
  }
  return found;
}
