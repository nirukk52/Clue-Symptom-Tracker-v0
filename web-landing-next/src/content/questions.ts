import type { QuestionOption, ProductQuestions } from '@/types';

/**
 * Question Data - All modal question options
 *
 * Why this exists: Centralizes the ~300 lines of question data from
 * campaign-modal.js. Now type-safe and easily editable.
 */

// Q1: Universal entry point - what's your main struggle?
export const Q1_OPTIONS: QuestionOption[] = [
  { value: 'fatigue', label: "Fatigue that won't quit" },
  { value: 'flares', label: 'Unpredictable flares' },
  { value: 'migraines', label: 'Migraines that derail everything' },
  { value: 'ibs_gut', label: "IBS / Gut issues I can't figure out" },
  { value: 'multiple', label: 'Managing multiple conditions' },
  { value: 'other', label: 'Something else' },
];

// Q2: Contextual pain points (based on Q1 selection)
export const Q2_OPTIONS: Record<string, QuestionOption[]> = {
  fatigue: [
    { value: 'energy_envelope', label: 'I never know how much I can safely do' },
    { value: 'good_days_trap', label: 'Good days trick me into overdoing it' },
    { value: 'brain_fog', label: 'Brain fog makes everything harder' },
    { value: 'not_understood', label: "People don't understand why I can't just push through" },
    { value: 'delayed_payback', label: "I pay for today's effort tomorrow" },
  ],
  flares: [
    { value: 'cant_plan', label: "I can't plan anything because I never know" },
    { value: 'no_warning', label: 'They hit without warning' },
    { value: 'unknown_triggers', label: "I don't know what's triggering them" },
    { value: 'cancel_constantly', label: 'I cancel on people constantly' },
    { value: 'anxiety_waiting', label: 'I waste good days waiting for the other shoe to drop' },
  ],
  migraines: [
    { value: 'too_late_meds', label: "By the time I notice, it's too late for meds to help" },
    { value: 'unknown_triggers', label: "I can't figure out what triggers them" },
    { value: 'lost_days', label: 'I lose entire days when they hit' },
    { value: 'miss_warning', label: "I miss the warning signs until it's too late" },
    { value: 'no_patterns', label: "I've tried tracking but can't find patterns" },
  ],
  ibs_gut: [
    { value: 'unsafe_foods', label: "I can't tell which foods are safe" },
    { value: 'delayed_reactions', label: "Reactions are delayed so I can't connect them" },
    { value: 'inconsistent', label: 'Same food, different reactions — makes no sense' },
    { value: 'elimination_exhausting', label: 'Elimination diets are exhausting and inconclusive' },
    { value: 'eating_gamble', label: 'Eating out feels like a gamble' },
  ],
  multiple: [
    { value: 'symptom_overlap', label: "I can't tell which condition is causing what" },
    { value: 'competing_needs', label: 'What helps one thing makes another worse' },
    { value: 'tracking_burden', label: 'Tracking everything is a full-time job' },
    { value: 'medical_silos', label: "My doctors don't connect the dots" },
    { value: 'all_blurs', label: 'It all blurs together into one bad day' },
  ],
  other: [
    { value: 'still_figuring', label: "I'm still trying to figure out what's wrong" },
    { value: 'not_believed', label: "I don't feel believed by doctors" },
    { value: 'tracking_failed', label: "I've tried tracking before but it didn't help" },
    { value: 'life_disruption', label: "I can't live the life I used to" },
    { value: 'want_answers', label: 'I just want answers' },
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
        { value: 'any', label: "Just knowing it's coming would help" },
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
        { value: 'food', label: "Something I'm eating" },
        { value: 'stress', label: 'Stress levels' },
        { value: 'hormones', label: 'Hormonal cycle' },
        { value: 'environment', label: 'Weather or environment' },
        { value: 'unknown', label: "Not sure — that's the problem" },
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
      text: "What's your biggest pacing struggle?",
      options: [
        { value: 'push_too_hard', label: 'I push too hard on good days' },
        { value: 'cant_tell', label: "I can't tell when to stop" },
        { value: 'ignore_signs', label: 'I ignore the warning signs' },
        { value: 'guilt', label: 'I feel guilty resting' },
        { value: 'boom_bust', label: 'The boom-bust cycle never ends' },
      ],
    },
    q4: {
      text: 'What would "permission to rest" look like?',
      options: [
        { value: 'data_limit', label: "Data showing I'm at my limit" },
        { value: 'push_rest_signal', label: 'A clear push vs. rest signal' },
        { value: 'explain_others', label: 'Something to explain to others' },
        { value: 'confidence_rest', label: 'Confidence that resting is the right call' },
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
        { value: 'not_worth_it', label: "Doesn't feel worth the effort" },
        { value: 'bad_days', label: 'Bad days make it impossible' },
      ],
    },
    q4: {
      text: 'On your worst days, what could you manage?',
      options: [
        { value: 'one_tap', label: 'One tap to say how I feel' },
        { value: 'voice', label: 'Voice note, no typing' },
        { value: 'yes_no', label: 'Just yes/no questions' },
        { value: 'nothing', label: "Nothing — that's the problem" },
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
        { value: 'any', label: "Just knowing it's coming would help" },
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
