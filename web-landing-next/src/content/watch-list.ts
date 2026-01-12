/**
 * Watch List Configuration for Screen 4
 *
 * Why this exists: After Q3 baseline capture, we show users what Clue will
 * actively monitor for them. This turns onboarding into a "result" rather than
 * just setup - key for retention in trackers.
 *
 * Structure:
 * - Each Q2 pain point maps to 3 watch items
 * - Each Q2 maps to a baseline format function
 * - Categories determine the overall value proposition framing
 */

export type ValueCategory =
  | 'PREDICTION_BASED'
  | 'TRIGGER_DISCOVERY'
  | 'VALIDATION'
  | 'PATTERN_FINDING'
  | 'MULTI_CONDITION';

export interface WatchListItem {
  text: string;
}

export interface WatchListConfig {
  items: WatchListItem[];
  category: ValueCategory;
  baselineLabel: string; // e.g., "Energy right now", "Testing", etc.
}

/**
 * Q2 to Value Category mapping
 */
export const Q2_TO_CATEGORY: Record<string, ValueCategory> = {
  // PREDICTION_BASED
  energy_envelope: 'PREDICTION_BASED',
  early_warning: 'PREDICTION_BASED',
  flare_patterns: 'PREDICTION_BASED',
  weather_triggers: 'PREDICTION_BASED',
  hormonal_link: 'PREDICTION_BASED',

  // TRIGGER_DISCOVERY
  good_days_trap: 'TRIGGER_DISCOVERY',
  brain_fog: 'TRIGGER_DISCOVERY',
  unknown_triggers: 'TRIGGER_DISCOVERY',
  food_triggers: 'TRIGGER_DISCOVERY',
  stress_sleep: 'TRIGGER_DISCOVERY',
  food_culprits: 'TRIGGER_DISCOVERY',
  stress_gut: 'TRIGGER_DISCOVERY',
  mood_connection: 'TRIGGER_DISCOVERY',

  // VALIDATION
  treatment_effect: 'VALIDATION',
  diet_working: 'VALIDATION',
  track_treatment: 'VALIDATION',
  doctor_log: 'VALIDATION',

  // PATTERN_FINDING
  no_focus: 'PATTERN_FINDING',
  log_and_see: 'PATTERN_FINDING',
  find_any_pattern: 'PATTERN_FINDING',
  track_trends: 'PATTERN_FINDING',
  find_patterns: 'PATTERN_FINDING',
  see_trends: 'PATTERN_FINDING',
  just_curious: 'PATTERN_FINDING',

  // MULTI_CONDITION
  symptom_overlap: 'MULTI_CONDITION',
  competing_needs: 'MULTI_CONDITION',
  unified_view: 'MULTI_CONDITION',
  prioritize_issue: 'MULTI_CONDITION',
  reduce_overwhelm: 'MULTI_CONDITION',
};

/**
 * Watch list items per Q2 selection
 */
export const WATCH_LIST_CONFIG: Record<string, WatchListConfig> = {
  // ============================================
  // PREDICTION_BASED (Fatigue, Flares, Migraines)
  // ============================================

  energy_envelope: {
    category: 'PREDICTION_BASED',
    baselineLabel: 'Energy right now',
    items: [
      { text: 'Your daily energy rhythm' },
      { text: 'When you crash vs when you thrive' },
      { text: 'Patterns in your peak energy hours' },
    ],
  },

  early_warning: {
    category: 'PREDICTION_BASED',
    baselineLabel: 'Warning signs today',
    items: [
      { text: 'Subtle warning signs before flares' },
      { text: "Your body's early signals" },
      { text: '24-48 hour pre-flare patterns' },
    ],
  },

  flare_patterns: {
    category: 'PREDICTION_BASED',
    baselineLabel: 'Flare status',
    items: [
      { text: 'When your flares typically hit' },
      { text: 'Time-of-month patterns' },
      { text: 'Activity to flare delays' },
    ],
  },

  weather_triggers: {
    category: 'PREDICTION_BASED',
    baselineLabel: 'Head status',
    items: [
      { text: 'Barometric pressure correlations' },
      { text: 'Weather change to headache timing' },
      { text: 'Your weather sensitivity score' },
    ],
  },

  hormonal_link: {
    category: 'PREDICTION_BASED',
    baselineLabel: 'Cycle phase',
    items: [
      { text: 'Cycle phase to migraine patterns' },
      { text: 'Your hormonal trigger window' },
      { text: 'When to prep for attacks' },
    ],
  },

  // ============================================
  // TRIGGER_DISCOVERY
  // ============================================

  good_days_trap: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Activity suspects',
    items: [
      { text: 'Activity to crash correlations' },
      { text: 'Which activities cost extra spoons' },
      { text: 'Your energy payback timeline' },
    ],
  },

  brain_fog: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Mental clarity',
    items: [
      { text: 'Sleep to clarity connections' },
      { text: 'What clears vs clouds your head' },
      { text: 'Your fog trigger profile' },
    ],
  },

  mood_connection: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Mood and energy',
    items: [
      { text: 'Mood to fatigue correlations' },
      { text: 'Which affects which first' },
      { text: 'Your emotional energy cost' },
    ],
  },

  unknown_triggers: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Testing',
    items: [
      { text: 'Suspect testing based on your input' },
      { text: '24-48 hour lag effect patterns' },
      { text: 'Your trigger confidence scores' },
    ],
  },

  food_triggers: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Foods to watch',
    items: [
      { text: 'Food to migraine correlations' },
      { text: 'Time delay patterns' },
      { text: 'Your personal food risk list' },
    ],
  },

  stress_sleep: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Primary suspects',
    items: [
      { text: 'Stress vs sleep as triggers' },
      { text: 'Which matters more for you' },
      { text: 'Your stress threshold' },
    ],
  },

  food_culprits: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Suspect foods',
    items: [
      { text: 'Meal to reaction timing' },
      { text: 'Safe foods vs risky foods' },
      { text: 'Your gut trigger profile' },
    ],
  },

  stress_gut: {
    category: 'TRIGGER_DISCOVERY',
    baselineLabel: 'Stress level',
    items: [
      { text: 'Stress to gut correlations' },
      { text: 'Your brain-gut connection' },
      { text: 'Stress threshold for symptoms' },
    ],
  },

  // ============================================
  // VALIDATION
  // ============================================

  treatment_effect: {
    category: 'VALIDATION',
    baselineLabel: 'Day 1 record',
    items: [
      { text: 'Treatment to flare correlation' },
      { text: 'Is your protocol working' },
      { text: 'Data for your next appointment' },
    ],
  },

  diet_working: {
    category: 'VALIDATION',
    baselineLabel: 'Day 1 symptoms',
    items: [
      { text: 'Diet adherence to symptoms' },
      { text: 'Is your diet paying off' },
      { text: 'Evidence for adjustments' },
    ],
  },

  track_treatment: {
    category: 'VALIDATION',
    baselineLabel: 'Starting intensity',
    items: [
      { text: 'Treatment impact measurement' },
      { text: 'Before vs after comparison' },
      { text: 'Real efficacy data' },
    ],
  },

  doctor_log: {
    category: 'VALIDATION',
    baselineLabel: 'Today record',
    items: [
      { text: 'Clinical-grade symptom log' },
      { text: 'Interference with daily life' },
      { text: 'Doctor-ready export building' },
    ],
  },

  // ============================================
  // PATTERN_FINDING
  // ============================================

  no_focus: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Starting point',
    items: [
      { text: 'Whatever patterns emerge' },
      { text: 'Surprises in your data' },
      { text: "Connections you haven't seen" },
    ],
  },

  log_and_see: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Baseline captured',
    items: [
      { text: 'Flare frequency and timing' },
      { text: 'Intensity trends' },
      { text: 'Unexpected correlations' },
    ],
  },

  find_any_pattern: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Head status today',
    items: [
      { text: 'Headache frequency' },
      { text: 'Location patterns' },
      { text: 'Duration trends' },
    ],
  },

  track_trends: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Baseline',
    items: [
      { text: 'Symptom type frequency' },
      { text: 'Weekly trends' },
      { text: 'Good day vs bad day patterns' },
    ],
  },

  find_patterns: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Starting point',
    items: [
      { text: 'Symptom to context links' },
      { text: 'What precedes bad days' },
      { text: 'Hidden triggers' },
    ],
  },

  see_trends: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Today',
    items: [
      { text: 'Week-over-week changes' },
      { text: 'Your baseline vs now' },
      { text: 'Long-term direction' },
    ],
  },

  just_curious: {
    category: 'PATTERN_FINDING',
    baselineLabel: 'Starting observation',
    items: [
      { text: 'Body observations over time' },
      { text: 'What your data reveals' },
      { text: "Insights you didn't expect" },
    ],
  },

  // ============================================
  // MULTI_CONDITION
  // ============================================

  symptom_overlap: {
    category: 'MULTI_CONDITION',
    baselineLabel: 'Main issue today',
    items: [
      { text: 'Which condition causes which symptom' },
      { text: 'Overlap patterns' },
      { text: 'Attribution confidence' },
    ],
  },

  competing_needs: {
    category: 'MULTI_CONDITION',
    baselineLabel: 'Current status',
    items: [
      { text: 'Medication timing optimization' },
      { text: 'Conflict identification' },
      { text: 'Side effect patterns' },
    ],
  },

  unified_view: {
    category: 'MULTI_CONDITION',
    baselineLabel: 'Overall',
    items: [
      { text: 'All symptoms in one dashboard' },
      { text: 'Cross-condition patterns' },
      { text: 'Unified timeline' },
    ],
  },

  prioritize_issue: {
    category: 'MULTI_CONDITION',
    baselineLabel: 'Priority #1',
    items: [
      { text: 'Impact tracking for your top issue' },
      { text: 'Priority changes over time' },
      { text: 'Where to focus energy' },
    ],
  },

  reduce_overwhelm: {
    category: 'MULTI_CONDITION',
    baselineLabel: 'Overall status',
    items: [
      { text: 'Minimal tracking, maximum insight' },
      { text: 'One-number trends' },
      { text: 'Simple progress tracking' },
    ],
  },
};

/**
 * Format baseline value for display based on widget type and Q2
 */
export function formatBaselineValue(
  q2: string,
  q3Data: {
    condition?: string;
    widgetType?: string;
    widgetValue?: number | string | string[];
  }
): string {
  const config = WATCH_LIST_CONFIG[q2];
  if (!config) return 'Baseline captured';

  const { widgetValue, widgetType } = q3Data;

  // Format based on widget type - handle both 'slider' and 'gradient_slider'
  if (
    (widgetType === 'slider' || widgetType === 'gradient_slider') &&
    typeof widgetValue === 'number'
  ) {
    return `${widgetValue}%`;
  }

  // Handle both 'chips' and 'chip_selector'
  if (
    (widgetType === 'chips' || widgetType === 'chip_selector') &&
    Array.isArray(widgetValue)
  ) {
    if (widgetValue.length === 0) return 'None selected';
    if (widgetValue.length <= 2) return widgetValue.join(', ');
    return `${widgetValue.slice(0, 2).join(', ')} +${widgetValue.length - 2} more`;
  }

  if (typeof widgetValue === 'string') {
    return widgetValue;
  }

  // Show numeric value as percentage if it's a number
  if (typeof widgetValue === 'number') {
    return `${widgetValue}%`;
  }

  return 'Recorded';
}

/**
 * Condition display names for user-friendly display
 * Maps internal values from conditions.ts to user-friendly labels
 */
const CONDITION_DISPLAY_NAMES: Record<string, string> = {
  // Fatigue conditions
  me_cfs: 'ME/CFS',
  long_covid: 'Long COVID',
  fibromyalgia: 'Fibromyalgia',
  pots: 'POTS',
  eds: 'Ehlers-Danlos Syndrome',
  chronic_fatigue: 'Chronic fatigue',
  // Flare conditions
  ra: 'Rheumatoid Arthritis',
  lupus: 'Lupus',
  ms: 'Multiple Sclerosis',
  ankylosing: 'Ankylosing Spondylitis',
  psoriatic: 'Psoriatic Arthritis',
  // Migraine conditions
  chronic_migraine: 'Chronic Migraine',
  episodic_migraine: 'Episodic Migraine',
  cluster_headache: 'Cluster Headaches',
  tension_headache: 'Tension Headaches',
  menstrual_migraine: 'Menstrual Migraines',
  // IBS/Gut conditions
  ibs_d: 'IBS-D',
  ibs_c: 'IBS-C',
  ibs_m: 'IBS-M',
  crohns: "Crohn's Disease",
  colitis: 'Ulcerative Colitis',
  gerd: 'GERD',
  // Multiple conditions
  fibro_cfs: 'Fibromyalgia + ME/CFS',
  autoimmune_multi: 'Multiple autoimmune',
  pain_fatigue: 'Chronic pain + fatigue',
  gut_plus: 'GI + other conditions',
  mental_physical: 'Mental + physical health',
  // Other conditions
  endometriosis: 'Endometriosis',
  pcos: 'PCOS',
  pmdd: 'PMDD',
  depression: 'Depression',
  anxiety: 'Anxiety',
  insomnia: 'Chronic Insomnia',
  undiagnosed: 'Undiagnosed',
  // Generic fallback
  other: 'Your condition',
};

/**
 * Format condition for display
 */
function formatConditionDisplay(condition: string): string {
  return CONDITION_DISPLAY_NAMES[condition] || condition.replace(/_/g, ' ');
}

/**
 * Get watch list for a specific Q2 selection
 */
export function getWatchList(
  q2: string,
  q3Data: {
    condition?: string;
    widgetType?: string;
    widgetValue?: number | string | string[];
  }
): {
  items: WatchListItem[];
  baseline: string;
  baselineLabel: string;
  condition: string;
  category: ValueCategory;
} {
  const config = WATCH_LIST_CONFIG[q2] || WATCH_LIST_CONFIG['no_focus'];

  return {
    items: config.items,
    baseline: formatBaselineValue(q2, q3Data),
    baselineLabel: config.baselineLabel,
    condition: formatConditionDisplay(q3Data.condition || 'other'),
    category: config.category,
  };
}

/**
 * Get category headline for Screen 4
 */
export function getCategoryHeadline(category: ValueCategory): string {
  switch (category) {
    case 'PREDICTION_BASED':
      return "We'll help you see what's coming";
    case 'TRIGGER_DISCOVERY':
      return "We'll help you find the culprits";
    case 'VALIDATION':
      return "We'll help you prove what's working";
    case 'PATTERN_FINDING':
      return "We'll help you spot the patterns";
    case 'MULTI_CONDITION':
      return "We'll help you make sense of it all";
    default:
      return "Here's what we'll watch for you";
  }
}
