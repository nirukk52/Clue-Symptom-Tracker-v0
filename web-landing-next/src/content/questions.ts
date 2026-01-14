import type { ProductQuestions, QuestionOption } from '@/types';

/**
 * Question Data - All modal question options
 *
 * Why this exists: Centralizes question data for the onboarding modal.
 *
 * Design Philosophy:
 * - NO EMOJIS (per frontend-design skill - feels juvenile, inconsistent)
 * - Long text only for Q2 (describes lived experience)
 * - Follows "Language of Care" - validation over instruction
 * - Neutral language, permission-based framing
 *
 * Reference:
 * - .claude-skills/spoonie-copywriter/SKILL.md
 * - .claude-skills/frontend-design/SKILL.md
 */

/**
 * Q1: Universal entry point - what's your main struggle?
 *
 * Design: Short punchy label + descriptive subtext
 * Format: label = main text (bold), description = subtext (muted)
 */
export const Q1_OPTIONS: QuestionOption[] = [
  {
    value: 'fatigue',
    label: "Fatigue that won't quit",
    description: 'Crashes, PEM, running on empty',
  },
  {
    value: 'flares',
    label: 'Unpredictable flares',
    description: "Sudden bad days you can't plan for",
  },
  {
    value: 'migraines',
    label: 'Migraines that derail everything',
    description: 'Attacks that take you out',
  },
  {
    value: 'ibs_gut',
    label: 'IBS / Gut issues',
    description: 'Bloating, pain, unpredictable reactions',
  },
  {
    value: 'multiple',
    label: 'Multiple conditions',
    description: 'Everything overlaps, tracking is messy',
  },
  {
    value: 'other',
    label: 'Something else',
    description: "Your main issue isn't listed",
  },
];

// Q2: Contextual questions based on Q1 selection
export const Q2_QUESTIONS: Record<string, string> = {
  fatigue: 'What do you hope to figure out about your fatigue?',
  flares: 'What do you want to understand about your flares?',
  migraines: 'What would help you most with your migraines?',
  ibs_gut: 'What would you like to understand about your digestive issues?',
  multiple: 'What feels like the biggest challenge right now?',
  other: 'What would be most helpful to track?',
};

// Q2 Options - Long text only (describes lived experience)
export const Q2_OPTIONS: Record<string, QuestionOption[]> = {
  fatigue: [
    {
      value: 'energy_envelope',
      label:
        'When during the day am I most fatigued versus when I actually have energy',
    },
    {
      value: 'good_days_trap',
      label:
        'Whether activities like exercise or outings are causing me to crash afterwards',
    },
    {
      value: 'brain_fog',
      label:
        'Whether better sleep actually improves my energy and mental clarity',
    },
    {
      value: 'mood_connection',
      label: 'How my fatigue and mood are connected and affecting each other',
    },
    {
      value: 'no_focus',
      label:
        'I want to track and see what patterns come up, no specific focus yet',
    },
  ],
  flares: [
    {
      value: 'unknown_triggers',
      label:
        'What might be triggering my flare-ups, because I genuinely have no idea',
    },
    {
      value: 'early_warning',
      label:
        'Whether there are warning signs I could catch before a flare fully hits',
    },
    {
      value: 'treatment_effect',
      label:
        'Whether my treatments or routines are actually reducing my flares',
    },
    {
      value: 'flare_patterns',
      label:
        'Whether my flares follow any pattern like time of month or activity level',
    },
    {
      value: 'log_and_see',
      label:
        'I want to log my flares and look for patterns over time, no specific theory',
    },
  ],
  migraines: [
    {
      value: 'food_triggers',
      label:
        'Which foods or drinks might be triggering my migraines without me realizing',
    },
    {
      value: 'weather_triggers',
      label:
        'Whether weather changes or barometric pressure correlate with my headaches',
    },
    {
      value: 'hormonal_link',
      label:
        'Whether my migraines are linked to my hormonal cycle or specific times of month',
    },
    {
      value: 'stress_sleep',
      label:
        'Whether stress or poor sleep are the real triggers setting off my migraines',
    },
    {
      value: 'find_any_pattern',
      label:
        'I want to track everything and see what patterns emerge, no specific theory',
    },
  ],
  ibs_gut: [
    {
      value: 'food_culprits',
      label:
        'Which specific foods might be causing my digestive flare-ups or reactions',
    },
    {
      value: 'stress_gut',
      label:
        'Whether stress or anxiety is making my gut symptoms significantly worse',
    },
    {
      value: 'timing_patterns',
      label: 'What time of day my digestive issues are most intense and why',
    },
    {
      value: 'diet_working',
      label:
        'Whether my current diet or medication is actually improving my symptoms',
    },
    {
      value: 'track_trends',
      label:
        'I want to track everything and look for trends, no specific idea yet',
    },
  ],
  multiple: [
    {
      value: 'symptom_overlap',
      label:
        'Which condition is causing which symptom, because everything blurs together',
    },
    {
      value: 'competing_needs',
      label:
        'How to juggle different medications or treatments that sometimes conflict',
    },
    {
      value: 'unified_view',
      label:
        'Seeing all my symptoms in one combined view instead of scattered notes',
    },
    {
      value: 'prioritize_issue',
      label:
        'Figuring out which issue to tackle first when everything feels urgent',
    },
    {
      value: 'reduce_overwhelm',
      label:
        'Tracking everything I need to without getting completely overwhelmed',
    },
  ],
  other: [
    {
      value: 'find_patterns',
      label:
        'Finding patterns or triggers for symptoms that seem random right now',
    },
    {
      value: 'track_treatment',
      label:
        'Tracking whether a new treatment or habit is actually making a difference',
    },
    {
      value: 'doctor_log',
      label:
        'Having a log I can actually show my doctor instead of trying to remember',
    },
    {
      value: 'see_trends',
      label:
        'Seeing overall trends in my health over weeks and months, not just day to day',
    },
    {
      value: 'just_curious',
      label:
        'I want to try tracking and see what I learn, no specific goal yet',
    },
  ],
};

// Q3 & Q4: Product-specific questions
export const PRODUCT_QUESTIONS: Record<string, ProductQuestions> = {
  'flare-forecast': {
    q3: {
      text: 'How much warning would make a difference?',
      options: [
        { value: 'hours', label: 'A few hours to adjust my day' },
        { value: 'day', label: 'A day to cancel or reschedule' },
        { value: 'days', label: '2-3 days to prepare properly' },
        { value: 'any', label: 'Just knowing it is coming would help' },
      ],
    },
    q4: {
      text: 'What would you do with advance notice?',
      options: [
        { value: 'rest', label: 'Rest before it hits' },
        { value: 'reschedule', label: 'Reschedule commitments' },
        { value: 'prepare', label: 'Stock up on what I need' },
        { value: 'tell_others', label: 'Tell people around me' },
        { value: 'all', label: 'All of the above' },
      ],
    },
  },
  'top-suspect': {
    q3: {
      text: 'Which trigger are you most unsure about?',
      options: [
        { value: 'sleep', label: 'Sleep quality or timing' },
        { value: 'food', label: 'Something I am eating' },
        { value: 'stress', label: 'Stress levels' },
        { value: 'hormones', label: 'Hormonal cycle' },
        { value: 'environment', label: 'Weather or environment' },
        { value: 'unknown', label: 'Not sure — that is the problem' },
      ],
    },
    q4: {
      text: 'What would "proof" look like to you?',
      options: [
        { value: 'correlations', label: 'Seeing correlations in my data' },
        { value: 'ranked_list', label: 'A ranked list of likely triggers' },
        { value: 'doctor_ready', label: 'Something I can show my doctor' },
        { value: 'confidence', label: 'Enough confidence to make changes' },
      ],
    },
  },
  'crash-prevention': {
    q3: {
      text: 'What is your biggest pacing struggle?',
      options: [
        { value: 'push_too_hard', label: 'I push too hard on good days' },
        { value: 'cant_tell', label: 'I cannot tell when to stop' },
        { value: 'ignore_signs', label: 'I ignore the warning signs' },
        { value: 'guilt', label: 'I feel guilty resting' },
        { value: 'boom_bust', label: 'The boom-bust cycle never ends' },
      ],
    },
    q4: {
      text: 'What would "permission to rest" look like?',
      options: [
        { value: 'data_limit', label: 'Data showing I am at my limit' },
        { value: 'push_rest_signal', label: 'A clear push vs rest signal' },
        { value: 'explain_others', label: 'Something to explain to others' },
        {
          value: 'confidence_rest',
          label: 'Confidence that resting is the right call',
        },
      ],
    },
  },
  'spoon-saver': {
    q3: {
      text: 'What kills tracking for you?',
      options: [
        { value: 'too_many_questions', label: 'Too many questions' },
        { value: 'typing', label: 'Having to type' },
        { value: 'remembering', label: 'Remembering to do it' },
        { value: 'not_worth_it', label: 'Does not feel worth the effort' },
        { value: 'bad_days', label: 'Bad days make it impossible' },
      ],
    },
    q4: {
      text: 'On your worst days, what could you manage?',
      options: [
        { value: 'one_tap', label: 'One tap to say how I feel' },
        { value: 'voice', label: 'Voice note, no typing' },
        { value: 'yes_no', label: 'Just yes or no questions' },
        { value: 'nothing', label: 'Nothing — that is the problem' },
      ],
    },
  },
  // Default for home page
  home: {
    q3: {
      text: 'How much warning would make a difference?',
      options: [
        { value: 'hours', label: 'A few hours to adjust my day' },
        { value: 'day', label: 'A day to cancel or reschedule' },
        { value: 'days', label: '2-3 days to prepare properly' },
        { value: 'any', label: 'Just knowing it is coming would help' },
      ],
    },
    q4: {
      text: 'What would you do with advance notice?',
      options: [
        { value: 'rest', label: 'Rest before it hits' },
        { value: 'reschedule', label: 'Reschedule commitments' },
        { value: 'prepare', label: 'Stock up on what I need' },
        { value: 'all', label: 'All of the above' },
      ],
    },
  },
};
