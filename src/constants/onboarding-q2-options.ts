/**
 * Q2 Pain Point Options - Personalized follow-up based on Q1 domain selection
 *
 * Why it exists: Maps user's primary concern (Q1) to specific pain points (Q2)
 * that drive the baseline widget (Q3) and value proposition (Q4).
 *
 * Design Philosophy: "Low-Friction, High-Insight" - short labels that validate
 * the user's lived experience while capturing clinically useful data.
 *
 * Reference:
 * - onboarding-flow-user-initiation-docs/onboarding-flow-approach2.md
 * - onboarding-flow-user-initiation-docs/language-of-care.md
 */

// ============================================================================
// Q1 DOMAIN DEFINITIONS
// ============================================================================

/**
 * Q1Domain - Primary concern categories that determine the entire onboarding path
 *
 * Why these 6? Validated through user research and spoonie community feedback.
 * Each activates a different clinical protocol and widget configuration.
 */
export type Q1Domain =
  | 'fatigue' // Energy Envelope logic - ME/CFS, Long COVID, PEM tracking
  | 'flares' // Crisis Management - rapid delta detection, flare mode
  | 'migraines' // Prodrome Detection - early warning, abortive intervention
  | 'ibs_gut' // Motility & Trigger - lag analysis, Bristol scale
  | 'multiple' // Complexity Management - symptom blur, multi-condition
  | 'other'; // Discovery Mode - open-ended, NLP learning

export interface Q1Option {
  id: Q1Domain;
  /** Short UI label (2-4 words) */
  label: string;
  /** Emoji for visual recognition */
  emoji: string;
  /** Subtitle for context */
  description: string;
  /** Clinical protocol activated */
  clinicalContext: string;
  /** System state changes when selected */
  systemBehavior: string;
}

export const Q1_OPTIONS: Q1Option[] = [
  {
    id: 'fatigue',
    label: "Fatigue that won't quit",
    emoji: '🔋',
    description: 'Crashes, PEM, running on empty',
    clinicalContext: 'Energy Envelope logic - validates against FACIT-F scale',
    systemBehavior:
      'Pre-loads Battery visual metaphor widgets, suppresses high-intensity graphics',
  },
  {
    id: 'flares',
    label: 'Unpredictable flares',
    emoji: '⚡',
    description: "Sudden bad days you can't plan for",
    clinicalContext:
      'Crisis Management - prioritizes Delta Detection (rapid change from baseline)',
    systemBehavior:
      'Sets missing data forgiveness to maximum, enables Flare Mode toggle',
  },
  {
    id: 'migraines',
    label: 'Migraines that derail everything',
    emoji: '🌩️',
    description: 'Attacks that take you out',
    clinicalContext: 'Prodrome Detection - aligns with ICHD-3 migraine phases',
    systemBehavior:
      'Enables Dark Mode by default, focuses on pre-headache signals',
  },
  {
    id: 'ibs_gut',
    label: 'IBS / Gut issues',
    emoji: '🌿',
    description: 'Bloating, pain, unpredictable reactions',
    clinicalContext:
      'Motility & Trigger engine - Bristol Stool Scale, IBS-SSS validation',
    systemBehavior:
      'Prioritizes meal-time context prompts, enables lag analysis (4-24h)',
  },
  {
    id: 'multiple',
    label: 'Multiple conditions',
    emoji: '🎯',
    description: 'Everything overlaps, tracking is messy',
    clinicalContext:
      'Complexity Management - handles Symptom Blur across conditions',
    systemBehavior:
      'Activates Triage Widget, enables multi-select without overwhelm',
  },
  {
    id: 'other',
    label: 'Something else',
    emoji: '✨',
    description: "Your main issue isn't listed",
    clinicalContext:
      'Discovery Mode - NLP learns user vocabulary before fixed widgets',
    systemBehavior:
      'Open-ended structured input, gradual crystallization into widgets',
  },
];

// ============================================================================
// Q2 PAIN POINT DEFINITIONS
// ============================================================================

/**
 * Q2PainPoint - Specific pain points that validate user experience
 *
 * Design Principle: Labels should mirror the user's internal monologue
 * (e.g., "Good day trap" not "Post-exertional malaise risk assessment")
 */
export interface Q2Option {
  /** Unique identifier (snake_case) - stored in DB */
  id: string;
  /** Short UI label (2-4 words) - what users see */
  label: string;
  /** Original long-form text from research */
  originalText: string;
  /** What clinical/behavioral data this captures */
  captures: string;
  /** Why spoonies relate to this (validation) */
  psychologicalMechanism: string;
  /** Widget type for Q3 baseline */
  q3WidgetType: string;
  /** Q4 value hook category */
  q4HookType: 'prediction' | 'validation' | 'safety';
}

// ============================================================================
// FATIGUE DOMAIN Q2 OPTIONS
// ============================================================================

export const FATIGUE_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'energy_envelope',
    label: 'Energy limits',
    originalText:
      "When during the day I'm most fatigued vs. when I have energy",
    captures: 'Subjective capacity baseline (0-100%), daily energy patterns',
    psychologicalMechanism:
      'User lacks proprioceptive awareness of energy limits - needs external fuel gauge',
    q3WidgetType: 'visual_battery_fill',
    q4HookType: 'prediction',
  },
  {
    id: 'good_days_trap',
    label: 'Good day trap',
    originalText:
      'If certain activities (exercise, outings) are causing me to crash',
    captures: 'Activity intensity relative to baseline, PEM risk factor',
    psychologicalMechanism:
      'Classic "Boom and Bust" cycle - high-energy days trigger crashes 24-48h later',
    q3WidgetType: 'chip_select_intensity',
    q4HookType: 'prediction',
  },
  {
    id: 'brain_fog',
    label: 'Brain fog',
    originalText: 'Whether better sleep improves my energy levels',
    captures: 'Cognitive clarity score, sleep-energy correlation',
    psychologicalMechanism:
      "Cognitive dysfunction makes memory unreliable - can't recall meds or symptom onset",
    q3WidgetType: 'visual_weather_icons',
    q4HookType: 'prediction',
  },
  {
    id: 'mood_connection',
    label: 'Mood connection',
    originalText: 'How my fatigue and mood might be connected',
    captures: 'Fatigue-mood correlation, emotional impact score',
    psychologicalMechanism:
      'Validation that fatigue affects mental state - it\'s not "just depression"',
    q3WidgetType: 'slider_dual_track',
    q4HookType: 'validation',
  },
  {
    id: 'no_focus',
    label: 'Just explore',
    originalText:
      "No specific focus - I'll track everything and see what comes up",
    captures: 'General exhaustion frequency, exploratory baseline',
    psychologicalMechanism:
      'New to tracking or overwhelmed by where to start - needs guided discovery',
    q3WidgetType: 'slider_days_exhausted',
    q4HookType: 'prediction',
  },
];

// ============================================================================
// FLARES DOMAIN Q2 OPTIONS
// ============================================================================

export const FLARES_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'unknown_triggers',
    label: 'Unknown triggers',
    originalText: 'What might be triggering my flare-ups',
    captures: 'Suspected trigger categories (food, weather, stress, hormones)',
    psychologicalMechanism:
      "User suspects triggers but can't confirm - wants data-driven answers",
    q3WidgetType: 'multi_select_checkboxes',
    q4HookType: 'prediction',
  },
  {
    id: 'early_warning',
    label: 'Early warnings',
    originalText: 'If I can spot any early warning signs before a flare',
    captures: 'Pre-flare symptom recognition, warning sign awareness',
    psychologicalMechanism:
      'Flares feel sudden but may have subtle prodrome - wants early detection',
    q3WidgetType: 'chip_select_warning_signs',
    q4HookType: 'prediction',
  },
  {
    id: 'treatment_effect',
    label: 'Treatment working?',
    originalText: 'Whether my treatments or routines are reducing my flares',
    captures: 'Treatment effectiveness, before/after comparison',
    psychologicalMechanism:
      "Investing effort in treatment but unsure if it's actually helping",
    q3WidgetType: 'chip_select_treatment',
    q4HookType: 'validation',
  },
  {
    id: 'flare_patterns',
    label: 'Find patterns',
    originalText:
      'If flares follow any pattern (e.g. time of month or activity)',
    captures: 'Flare predictability score, temporal patterns',
    psychologicalMechanism:
      'Wants to anticipate bad days and plan life around likely flare windows',
    q3WidgetType: 'slider_predictability',
    q4HookType: 'prediction',
  },
  {
    id: 'log_and_see',
    label: 'Log and see',
    originalText:
      'Not sure yet - I just need to log flares and look for patterns later',
    captures: 'Flare frequency baseline, raw occurrence data',
    psychologicalMechanism:
      'Overwhelmed or new - just wants simple logging without analysis pressure',
    q3WidgetType: 'slider_flare_count',
    q4HookType: 'prediction',
  },
];

// ============================================================================
// MIGRAINES DOMAIN Q2 OPTIONS
// ============================================================================

export const MIGRAINES_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'food_triggers',
    label: 'Food triggers',
    originalText: 'Which foods or drinks might trigger my migraines',
    captures:
      'Suspected dietary triggers (alcohol, caffeine, chocolate, aged foods)',
    psychologicalMechanism:
      'Common migraine trigger category - wants to identify culprit foods',
    q3WidgetType: 'multi_select_foods',
    q4HookType: 'prediction',
  },
  {
    id: 'weather_triggers',
    label: 'Weather link',
    originalText:
      'If weather changes (humidity, storms) correlate with my headaches',
    captures: 'Weather-migraine correlation, barometric sensitivity',
    psychologicalMechanism:
      "Many migraineurs suspect weather but can't prove it - wants data confirmation",
    q3WidgetType: 'chip_select_weather',
    q4HookType: 'prediction',
  },
  {
    id: 'hormonal_link',
    label: 'Cycle link',
    originalText: 'Whether my migraines are linked to hormonal cycles',
    captures: 'Menstrual migraine pattern, hormonal correlation',
    psychologicalMechanism:
      'Menstrual migraines affect 60%+ of female migraineurs - critical pattern',
    q3WidgetType: 'chip_select_cycle',
    q4HookType: 'prediction',
  },
  {
    id: 'stress_sleep',
    label: 'Stress & sleep',
    originalText: 'If stress or poor sleep are setting off my migraines',
    captures: 'Stress-sleep-migraine triangle, lifestyle triggers',
    psychologicalMechanism:
      'Common modifiable triggers - wants to know if improving these helps',
    q3WidgetType: 'chip_select_stress_sleep',
    q4HookType: 'prediction',
  },
  {
    id: 'find_any_pattern',
    label: 'Find any pattern',
    originalText:
      "I don't know yet - I'll track them and see if any pattern emerges",
    captures: 'Migraine day frequency, exploratory baseline',
    psychologicalMechanism:
      'New to tracking or tried everything - wants comprehensive exploration',
    q3WidgetType: 'slider_migraine_days',
    q4HookType: 'prediction',
  },
];

// ============================================================================
// IBS/GUT DOMAIN Q2 OPTIONS
// ============================================================================

export const IBS_GUT_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'food_culprits',
    label: 'Food culprits',
    originalText: 'Which foods might be causing my GI flare-ups',
    captures: 'Suspected food triggers (dairy, gluten, high-FODMAP, spicy)',
    psychologicalMechanism:
      'Food is the most common IBS trigger - but identification is complex',
    q3WidgetType: 'multi_select_foods_ibs',
    q4HookType: 'prediction',
  },
  {
    id: 'stress_gut',
    label: 'Stress → gut',
    originalText: 'If stress or anxiety is making my symptoms worse',
    captures: 'Gut-brain axis correlation, stress multiplier',
    psychologicalMechanism:
      'Validates that physical symptoms have emotional triggers - not "just in your head"',
    q3WidgetType: 'chip_select_stress',
    q4HookType: 'validation',
  },
  {
    id: 'timing_patterns',
    label: 'Timing patterns',
    originalText: 'What time of day my gut issues are most intense',
    captures: 'Diurnal symptom pattern, meal timing correlation',
    psychologicalMechanism:
      'Wants to adjust meal timing or activities based on symptom windows',
    q3WidgetType: 'chip_select_time_of_day',
    q4HookType: 'prediction',
  },
  {
    id: 'diet_working',
    label: 'Diet working?',
    originalText: 'Whether my diet or medications are improving my symptoms',
    captures: 'Treatment effectiveness, before/after comparison',
    psychologicalMechanism:
      "Following elimination diet or taking meds - needs proof it's worth the effort",
    q3WidgetType: 'chip_select_treatment_ibs',
    q4HookType: 'validation',
  },
  {
    id: 'track_trends',
    label: 'Track trends',
    originalText:
      "No specific idea - I'll track everything and look for trends",
    captures: 'Weekly symptom frequency, exploratory baseline',
    psychologicalMechanism:
      'Overwhelmed by complexity - wants simple tracking to start',
    q3WidgetType: 'slider_symptom_days',
    q4HookType: 'prediction',
  },
];

// ============================================================================
// MULTIPLE CONDITIONS DOMAIN Q2 OPTIONS
// ============================================================================

export const MULTIPLE_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'symptom_overlap',
    label: 'Symptom blur',
    originalText: 'Figuring out which condition is causing what symptom',
    captures: 'Primary driver identification, symptom attribution',
    psychologicalMechanism:
      'Diagnostic Blur - is fatigue from ME/CFS or depression? Dizziness POTS or migraine?',
    q3WidgetType: 'single_select_primary',
    q4HookType: 'validation',
  },
  {
    id: 'competing_needs',
    label: 'Competing needs',
    originalText: 'Juggling different medications or treatments for each',
    captures: 'Treatment count, medication interactions, trade-offs',
    psychologicalMechanism:
      'What helps one condition may hurt another - needs unified tracking',
    q3WidgetType: 'slider_treatment_count',
    q4HookType: 'validation',
  },
  {
    id: 'unified_view',
    label: 'One timeline',
    originalText: 'Seeing all my symptoms in one combined timeline',
    captures: 'Current tracking method, data fragmentation status',
    psychologicalMechanism:
      'Juggling separate logs is exhausting - wants single source of truth',
    q3WidgetType: 'chip_select_tracking_method',
    q4HookType: 'validation',
  },
  {
    id: 'prioritize_issue',
    label: 'What first?',
    originalText: 'Prioritizing which issue to tackle first',
    captures: 'Current top priority condition/symptom (open text)',
    psychologicalMechanism:
      'Overwhelmed by everything - needs help focusing limited energy',
    q3WidgetType: 'text_input_priority',
    q4HookType: 'safety',
  },
  {
    id: 'reduce_overwhelm',
    label: 'Less overwhelm',
    originalText: 'Tracking it all without getting overwhelmed',
    captures: 'Current overwhelm level (1-10), capacity baseline',
    psychologicalMechanism:
      'Managing health feels like a full-time job - needs spoon-saving solution',
    q3WidgetType: 'slider_overwhelm',
    q4HookType: 'safety',
  },
];

// ============================================================================
// OTHER/GENERAL DOMAIN Q2 OPTIONS
// ============================================================================

export const OTHER_Q2_OPTIONS: Q2Option[] = [
  {
    id: 'find_patterns',
    label: 'Find patterns',
    originalText: 'Find patterns or triggers for my symptoms',
    captures: 'Suspected trigger categories (food, stress, weather, hormones)',
    psychologicalMechanism:
      'General pattern-seeking - condition not in main categories',
    q3WidgetType: 'multi_select_triggers',
    q4HookType: 'prediction',
  },
  {
    id: 'track_treatment',
    label: 'New treatment',
    originalText: 'Track if my new treatment or habit is making a difference',
    captures: 'Treatment type, before/after tracking intent',
    psychologicalMechanism:
      'Starting something new - wants objective measure of effectiveness',
    q3WidgetType: 'chip_select_new_treatment',
    q4HookType: 'validation',
  },
  {
    id: 'doctor_log',
    label: 'Doctor log',
    originalText: 'Have a log I can share with my doctor (or keep for myself)',
    captures: 'Sharing intent (doctor vs personal), export need',
    psychologicalMechanism:
      'History of being dismissed - wants credible evidence for appointments',
    q3WidgetType: 'chip_select_sharing_intent',
    q4HookType: 'validation',
  },
  {
    id: 'see_trends',
    label: 'See trends',
    originalText: 'See overall trends in my health over time',
    captures: 'Current trajectory perception (better/worse/same)',
    psychologicalMechanism:
      'Wants big-picture view - is condition improving or declining?',
    q3WidgetType: 'chip_select_trajectory',
    q4HookType: 'validation',
  },
  {
    id: 'just_curious',
    label: 'Just curious',
    originalText:
      "I'm just curious - I want to try tracking and see what I learn",
    captures: 'Good days baseline (0-30), exploratory entry point',
    psychologicalMechanism:
      'Low commitment entry - may convert to serious tracker with good experience',
    q3WidgetType: 'slider_good_days',
    q4HookType: 'prediction',
  },
];

// ============================================================================
// Q2 OPTIONS BY Q1 DOMAIN (MAIN EXPORT)
// ============================================================================

export const Q2_OPTIONS_BY_DOMAIN: Record<Q1Domain, Q2Option[]> = {
  fatigue: FATIGUE_Q2_OPTIONS,
  flares: FLARES_Q2_OPTIONS,
  migraines: MIGRAINES_Q2_OPTIONS,
  ibs_gut: IBS_GUT_Q2_OPTIONS,
  multiple: MULTIPLE_Q2_OPTIONS,
  other: OTHER_Q2_OPTIONS,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Q2 options for a given Q1 domain
 */
export const getQ2OptionsForDomain = (domain: Q1Domain): Q2Option[] => {
  return Q2_OPTIONS_BY_DOMAIN[domain] ?? OTHER_Q2_OPTIONS;
};

/**
 * Get Q2 option by ID across all domains
 */
export const getQ2OptionById = (id: string): Q2Option | undefined => {
  for (const options of Object.values(Q2_OPTIONS_BY_DOMAIN)) {
    const found = options.find((opt) => opt.id === id);
    if (found) return found;
  }
  return undefined;
};

/**
 * Get Q1 option by ID
 */
export const getQ1OptionById = (id: Q1Domain): Q1Option | undefined => {
  return Q1_OPTIONS.find((opt) => opt.id === id);
};

/**
 * Flattened list of all Q2 options (30 total)
 */
export const ALL_Q2_OPTIONS: Q2Option[] =
  Object.values(Q2_OPTIONS_BY_DOMAIN).flat();

// ============================================================================
// Q3 WIDGET TYPE MAPPING
// ============================================================================

/**
 * Maps Q2 pain point to specific Q3 widget configuration
 * This drives the personalized baseline capture experience
 */
export interface Q3WidgetConfig {
  /** Widget component type */
  type: string;
  /** Question text to display */
  questionText: string;
  /** Data field to capture */
  dataField: string;
  /** Options or range for the widget */
  options?: string[] | { min: number; max: number };
}

export const Q3_WIDGET_CONFIGS: Record<string, Q3WidgetConfig> = {
  // Fatigue widgets
  visual_battery_fill: {
    type: 'BatterySlider',
    questionText:
      'Where is your battery level right now compared to your absolute best?',
    dataField: 'subjective_capacity',
    options: { min: 0, max: 100 },
  },
  chip_select_intensity: {
    type: 'ChipGroup',
    questionText: 'How was your activity level yesterday compared to usual?',
    dataField: 'pem_risk_factor',
    options: ['Rested', 'Balanced', 'Pushed limits', 'Overdid it'],
  },
  visual_weather_icons: {
    type: 'IconSelect',
    questionText: "What's the weather inside your head right now?",
    dataField: 'cognitive_clarity_score',
    options: ['Clear sun ☀️', 'Hazy 🌤️', 'Thick fog 🌫️', 'Stormy ⛈️'],
  },
  slider_dual_track: {
    type: 'DualSlider',
    questionText: 'How much has fatigue affected your mood lately?',
    dataField: 'fatigue_mood_correlation',
    options: { min: 1, max: 10 },
  },
  slider_days_exhausted: {
    type: 'SeveritySlider',
    questionText:
      'On how many days in the past week did you feel completely exhausted?',
    dataField: 'exhaustion_frequency',
    options: { min: 0, max: 7 },
  },

  // Flares widgets
  multi_select_checkboxes: {
    type: 'ChipGroup',
    questionText: 'Do you suspect any of these triggers for your flare-ups?',
    dataField: 'suspected_triggers',
    options: [
      'Certain foods',
      'Weather changes',
      'Stress or overexertion',
      'Hormonal changes',
      'Not sure yet',
    ],
  },
  chip_select_warning_signs: {
    type: 'ChipGroup',
    questionText: 'Do you notice any warning signs before a flare hits?',
    dataField: 'warning_sign_awareness',
    options: ['Yes, usually', 'Sometimes', 'No, they strike without warning'],
  },
  chip_select_treatment: {
    type: 'ChipGroup',
    questionText: 'Are you currently doing anything to prevent flares?',
    dataField: 'treatment_status',
    options: [
      "Yes, and it's helping",
      'Yes, but not sure yet',
      'Not yet/no special treatment',
    ],
  },
  slider_predictability: {
    type: 'SeveritySlider',
    questionText: 'How predictable have your flares been so far?',
    dataField: 'flare_predictability',
    options: { min: 1, max: 10 }, // 1 = completely random, 10 = very predictable
  },
  slider_flare_count: {
    type: 'SeveritySlider',
    questionText: 'How many flare-ups did you have in the last month?',
    dataField: 'flare_frequency',
    options: { min: 0, max: 30 },
  },

  // Migraines widgets
  multi_select_foods: {
    type: 'ChipGroup',
    questionText:
      'Which of these foods or drinks do you suspect trigger your migraines?',
    dataField: 'food_triggers',
    options: [
      'Alcohol',
      'Caffeine',
      'Chocolate',
      'Aged/processed foods',
      'Not sure yet',
    ],
  },
  chip_select_weather: {
    type: 'ChipGroup',
    questionText:
      'Do weather changes (storms, humidity) seem to trigger your headaches?',
    dataField: 'weather_correlation',
    options: ['Yes, definitely', 'Maybe/Not sure', 'No correlation'],
  },
  chip_select_cycle: {
    type: 'ChipGroup',
    questionText:
      'Do your migraines align with hormonal changes (e.g. your menstrual cycle)?',
    dataField: 'hormonal_correlation',
    options: ['Yes, often', 'Sometimes/Maybe', 'No or Not applicable'],
  },
  chip_select_stress_sleep: {
    type: 'ChipGroup',
    questionText:
      'How much do stress or poor sleep seem to bring on your headaches?',
    dataField: 'stress_sleep_correlation',
    options: ['A lot', 'A little', 'Not at all', 'Not sure'],
  },
  slider_migraine_days: {
    type: 'SeveritySlider',
    questionText: 'How many migraine days did you have in the past month?',
    dataField: 'migraine_frequency',
    options: { min: 0, max: 30 },
  },

  // IBS/Gut widgets
  multi_select_foods_ibs: {
    type: 'ChipGroup',
    questionText: 'Any foods you suspect are triggering your digestive issues?',
    dataField: 'food_triggers_ibs',
    options: [
      'Dairy',
      'Gluten',
      'Greasy/spicy foods',
      'High-FODMAP',
      'Not sure yet',
    ],
  },
  chip_select_stress: {
    type: 'ChipGroup',
    questionText: 'Does stress typically make your gut symptoms worse?',
    dataField: 'stress_gut_correlation',
    options: ['Yes, definitely', 'Sometimes/Maybe', 'No difference'],
  },
  chip_select_time_of_day: {
    type: 'ChipGroup',
    questionText: 'When do your digestive symptoms bother you most?',
    dataField: 'symptom_timing',
    options: ['Morning', 'Afternoon', 'Evening', 'Night', 'No set pattern'],
  },
  chip_select_treatment_ibs: {
    type: 'ChipGroup',
    questionText:
      'Are you following any diet or treatment for this, and does it seem to help?',
    dataField: 'treatment_effectiveness',
    options: [
      "Yes, and it's helping",
      'Yes, but not sure',
      'Yes, but no improvement',
      'No specific diet/treatment',
    ],
  },
  slider_symptom_days: {
    type: 'SeveritySlider',
    questionText:
      'How many days per week do you experience noticeable gut symptoms?',
    dataField: 'gut_symptom_frequency',
    options: { min: 0, max: 7 },
  },

  // Multiple conditions widgets
  single_select_primary: {
    type: 'ChipGroup',
    questionText:
      'Do you often feel unsure which condition is causing a symptom?',
    dataField: 'diagnostic_confusion',
    options: ["Yes, it's confusing", 'Sometimes', 'No, I can usually tell'],
  },
  slider_treatment_count: {
    type: 'SeveritySlider',
    questionText:
      'How many different medications or treatments are you managing right now?',
    dataField: 'treatment_count',
    options: { min: 0, max: 10 },
  },
  chip_select_tracking_method: {
    type: 'ChipGroup',
    questionText: 'How are you currently tracking your conditions?',
    dataField: 'current_tracking_method',
    options: [
      'Separate logs for each',
      'One combined journal',
      'Not really tracking yet',
    ],
  },
  text_input_priority: {
    type: 'TextInput',
    questionText:
      'Which condition or symptom is bothering you the most right now?',
    dataField: 'primary_concern_text',
  },
  slider_overwhelm: {
    type: 'SeveritySlider',
    questionText:
      'On a scale of 1-10, how overwhelmed do you feel managing your health lately?',
    dataField: 'overwhelm_level',
    options: { min: 1, max: 10 },
  },

  // Other/General widgets
  multi_select_triggers: {
    type: 'ChipGroup',
    questionText: 'Do you suspect any general triggers for your symptoms?',
    dataField: 'general_triggers',
    options: ['Food/diet', 'Stress', 'Weather', 'Hormones', 'Not sure yet'],
  },
  chip_select_new_treatment: {
    type: 'ChipGroup',
    questionText:
      'Are you trying a new treatment or habit that you want to monitor?',
    dataField: 'new_treatment_type',
    options: [
      'Yes - new medication/supplement',
      'Yes - new diet change',
      'Yes - new routine/exercise',
      'No new changes',
    ],
  },
  chip_select_sharing_intent: {
    type: 'ChipGroup',
    questionText:
      'Do you plan to share your symptom logs with a doctor or specialist?',
    dataField: 'sharing_intent',
    options: ['Yes, definitely', 'Maybe later', 'No, just for me'],
  },
  chip_select_trajectory: {
    type: 'ChipGroup',
    questionText:
      'Lately, would you say your condition is getting better, worse, or staying the same?',
    dataField: 'health_trajectory',
    options: [
      'Getting worse',
      'Fluctuating up and down',
      'Improving',
      'Staying about the same',
    ],
  },
  slider_good_days: {
    type: 'SeveritySlider',
    questionText:
      'Out of the past 30 days, about how many were "good" (relatively symptom-free) days for you?',
    dataField: 'good_days_baseline',
    options: { min: 0, max: 30 },
  },
};

/**
 * Get Q3 widget config for a Q2 option
 */
export const getQ3WidgetConfig = (
  q2Option: Q2Option
): Q3WidgetConfig | undefined => {
  return Q3_WIDGET_CONFIGS[q2Option.q3WidgetType];
};
