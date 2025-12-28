/**
 * Condition options for Screen 1A "What are you managing?"
 * 
 * Why it exists: Provides the selectable conditions organized by category
 * for the onboarding flow. Users can select up to 3 conditions.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 1
 */

import type { Condition, ConditionCategory } from '@/types/onboarding';

/** Re-export Condition type for convenience */
export type { Condition, ConditionCategory } from '@/types/onboarding';

/** Category metadata with display properties */
export const CONDITION_CATEGORIES: Record<
  ConditionCategory,
  { label: string; color: string }
> = {
  common: { label: 'Common Picks', color: '#666666' },
  digestive: { label: 'Digestive', color: '#E8974F' },
  'pain-inflammation': { label: 'Pain + Inflammation', color: '#D0BDF4' },
  'mental-health': { label: 'Mental Health', color: '#A4C8D8' },
  'sleep-energy': { label: 'Sleep + Energy', color: '#B8E3D6' },
  neuro: { label: 'Neuro', color: '#9B8BB4' },
  hormonal: { label: 'Hormonal', color: '#F5B5C8' },
  autoimmune: { label: 'Autoimmune', color: '#8BC5CD' },
  other: { label: 'Other', color: '#A3A3A3' },
};

/** All available conditions for selection */
export const CONDITIONS: Condition[] = [
  // Common Picks
  { id: 'chronic-pain', label: 'Chronic Pain', emoji: '💫', category: 'common' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴', category: 'common' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰', category: 'common' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙', category: 'common' },

  // Digestive
  { id: 'ibs', label: 'IBS', emoji: '🌿', category: 'digestive' },
  { id: 'crohns', label: "Crohn's Disease", emoji: '🩺', category: 'digestive' },
  { id: 'bloating', label: 'Bloating', emoji: '🎈', category: 'digestive' },
  { id: 'acid-reflux', label: 'Acid Reflux', emoji: '🔥', category: 'digestive' },

  // Pain + Inflammation
  { id: 'migraines', label: 'Migraines', emoji: '🤕', category: 'pain-inflammation' },
  { id: 'fibromyalgia', label: 'Fibromyalgia', emoji: '✨', category: 'pain-inflammation' },
  { id: 'arthritis', label: 'Arthritis', emoji: '🦴', category: 'pain-inflammation' },
  { id: 'back-pain', label: 'Back Pain', emoji: '🔙', category: 'pain-inflammation' },

  // Mental Health
  { id: 'depression', label: 'Depression', emoji: '🌧️', category: 'mental-health' },
  { id: 'brain-fog', label: 'Brain Fog', emoji: '🧠', category: 'mental-health' },
  { id: 'ptsd', label: 'PTSD', emoji: '💜', category: 'mental-health' },
  { id: 'adhd', label: 'ADHD', emoji: '⚡', category: 'mental-health' },

  // Sleep + Energy
  { id: 'chronic-fatigue', label: 'Chronic Fatigue', emoji: '🔋', category: 'sleep-energy' },
  { id: 'sleep-apnea', label: 'Sleep Apnea', emoji: '😮‍💨', category: 'sleep-energy' },
  { id: 'restless-legs', label: 'Restless Legs', emoji: '🦵', category: 'sleep-energy' },

  // Neuro
  { id: 'long-covid', label: 'Long COVID', emoji: '🦠', category: 'neuro' },
  { id: 'vertigo', label: 'Vertigo', emoji: '🌀', category: 'neuro' },
  { id: 'neuropathy', label: 'Neuropathy', emoji: '⚡', category: 'neuro' },

  // Hormonal
  { id: 'endometriosis', label: 'Endometriosis', emoji: '🩸', category: 'hormonal' },
  { id: 'pcos', label: 'PCOS', emoji: '🔄', category: 'hormonal' },
  { id: 'thyroid', label: 'Thyroid Issues', emoji: '🦋', category: 'hormonal' },
  { id: 'menopause', label: 'Menopause', emoji: '🌡️', category: 'hormonal' },

  // Autoimmune
  { id: 'lupus', label: 'Lupus', emoji: '🦋', category: 'autoimmune' },
  { id: 'ms', label: 'Multiple Sclerosis', emoji: '🧬', category: 'autoimmune' },
  { id: 'ra', label: 'Rheumatoid Arthritis', emoji: '🤲', category: 'autoimmune' },
  { id: 'hashimotos', label: "Hashimoto's", emoji: '🔬', category: 'autoimmune' },

  // Other
  { id: 'other', label: 'Other', emoji: '➕', category: 'other' },
];

/** Get conditions filtered by category */
export const getConditionsByCategory = (category: ConditionCategory): Condition[] =>
  CONDITIONS.filter((c) => c.category === category);

/** Get condition by ID */
export const getConditionById = (id: string): Condition | undefined =>
  CONDITIONS.find((c) => c.id === id);

/** Maximum number of conditions user can select */
export const MAX_CONDITIONS = 3;

