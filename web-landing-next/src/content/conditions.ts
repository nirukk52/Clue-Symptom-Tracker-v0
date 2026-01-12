/**
 * Condition Mappings - Maps Q1 domains to specific conditions
 *
 * Why this exists: Q3 needs to confirm the user's specific condition
 * before capturing baseline data. These are grouped by Q1 domain
 * and sourced from illness.md (comprehensive chronic illness list).
 *
 * Design Philosophy:
 * - Show most common conditions first (based on tracking user clusters)
 * - Limit to 6 per category to avoid overwhelm
 * - Include "Other" option for unlisted conditions
 */

export interface ConditionOption {
  value: string;
  label: string;
}

/**
 * Conditions mapped by Q1 domain
 * Source: web-landing-next/src/content/illness.md
 */
export const CONDITIONS_BY_DOMAIN: Record<string, ConditionOption[]> = {
  fatigue: [
    { value: 'me_cfs', label: 'ME/CFS' },
    { value: 'long_covid', label: 'Long COVID' },
    { value: 'fibromyalgia', label: 'Fibromyalgia' },
    { value: 'pots', label: 'POTS' },
    { value: 'eds', label: 'Ehlers-Danlos Syndrome' },
    { value: 'chronic_fatigue', label: 'Chronic fatigue (undiagnosed)' },
    { value: 'other', label: 'Other fatigue condition' },
  ],
  flares: [
    { value: 'fibromyalgia', label: 'Fibromyalgia' },
    { value: 'ra', label: 'Rheumatoid Arthritis' },
    { value: 'lupus', label: 'Lupus (SLE)' },
    { value: 'ms', label: 'Multiple Sclerosis' },
    { value: 'ankylosing', label: 'Ankylosing Spondylitis' },
    { value: 'psoriatic', label: 'Psoriatic Arthritis' },
    { value: 'other', label: 'Other flare-prone condition' },
  ],
  migraines: [
    { value: 'chronic_migraine', label: 'Chronic Migraine' },
    { value: 'episodic_migraine', label: 'Episodic Migraine' },
    { value: 'cluster_headache', label: 'Cluster Headaches' },
    { value: 'tension_headache', label: 'Tension Headaches' },
    { value: 'menstrual_migraine', label: 'Menstrual Migraines' },
    { value: 'other', label: 'Other headache condition' },
  ],
  ibs_gut: [
    { value: 'ibs_d', label: 'IBS-D (diarrhea-predominant)' },
    { value: 'ibs_c', label: 'IBS-C (constipation-predominant)' },
    { value: 'ibs_m', label: 'IBS-M (mixed)' },
    { value: 'crohns', label: "Crohn's Disease" },
    { value: 'colitis', label: 'Ulcerative Colitis' },
    { value: 'gerd', label: 'GERD / Acid Reflux' },
    { value: 'other', label: 'Other digestive condition' },
  ],
  multiple: [
    { value: 'fibro_cfs', label: 'Fibromyalgia + ME/CFS' },
    { value: 'autoimmune_multi', label: 'Multiple autoimmune conditions' },
    { value: 'pain_fatigue', label: 'Chronic pain + fatigue' },
    { value: 'gut_plus', label: 'GI issues + other conditions' },
    { value: 'mental_physical', label: 'Mental health + physical' },
    { value: 'other', label: 'Other combination' },
  ],
  other: [
    { value: 'endometriosis', label: 'Endometriosis' },
    { value: 'pcos', label: 'PCOS' },
    { value: 'pmdd', label: 'PMDD' },
    { value: 'depression', label: 'Depression' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'insomnia', label: 'Chronic Insomnia' },
    { value: 'undiagnosed', label: 'Undiagnosed / Exploring' },
    { value: 'other', label: 'Something else' },
  ],
};

/**
 * Get confirmation question for Q3 condition picker
 * Personalized based on Q1 domain
 */
export const CONDITION_QUESTIONS: Record<string, string> = {
  fatigue: 'Which fatigue condition are you managing?',
  flares: 'Which condition causes your flares?',
  migraines: 'What type of headaches do you experience?',
  ibs_gut: 'What digestive condition are you tracking?',
  multiple: 'What best describes your situation?',
  other: 'What condition are you tracking?',
};

/**
 * Default selection based on Q1 (pre-selected suggestion)
 */
export const DEFAULT_CONDITION: Record<string, string> = {
  fatigue: 'chronic_fatigue',
  flares: 'fibromyalgia',
  migraines: 'chronic_migraine',
  ibs_gut: 'ibs_m',
  multiple: 'fibro_cfs',
  other: 'undiagnosed',
};
