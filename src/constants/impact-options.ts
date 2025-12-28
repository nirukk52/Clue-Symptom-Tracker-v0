/**
 * Feature and Outcome options for Screen 1C "Your first impact question"
 * 
 * Why it exists: Defines the dropdown options for creating the Focus Hypothesis.
 * Users select a Feature and Outcome to create "How does [Feature] impact [Outcome]?"
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 3
 */

import type { FeatureId, OutcomeId, PriorityId } from '@/types/onboarding';

export interface FeatureOption {
  id: FeatureId;
  label: string;
  emoji: string;
}

export interface OutcomeOption {
  id: OutcomeId;
  label: string;
  emoji: string;
}

/** All available feature options (potential triggers/inputs) */
export const FEATURES: FeatureOption[] = [
  { id: 'meds-supplements', label: 'Meds + supplements', emoji: '💊' },
  { id: 'sleep', label: 'Sleep', emoji: '🛏️' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'stress', label: 'Stress', emoji: '😤' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'cycle-hormones', label: 'Cycle / hormones', emoji: '🔄' },
  { id: 'work-routine', label: 'Work + routine', emoji: '💼' },
  { id: 'weather', label: 'Weather', emoji: '🌤️' },
  { id: 'hydration', label: 'Hydration', emoji: '💧' },
  { id: 'social-outings', label: 'Social / outings', emoji: '👥' },
];

/** All available outcome options (symptoms/effects to track) */
export const OUTCOMES: OutcomeOption[] = [
  { id: 'your-priority', label: 'Your priority', emoji: '⭐' },
  { id: 'pain', label: 'Pain', emoji: '💢' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'mood', label: 'Mood', emoji: '🎭' },
  { id: 'ibs', label: 'IBS', emoji: '🌿' },
  { id: 'sleep-quality', label: 'Sleep quality', emoji: '🌙' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'brain-fog', label: 'Brain fog / focus', emoji: '🧠' },
  { id: 'skin', label: 'Skin', emoji: '✨' },
];

/** Get feature by ID */
export const getFeatureById = (id: FeatureId): FeatureOption | undefined =>
  FEATURES.find((f) => f.id === id);

/** Get outcome by ID */
export const getOutcomeById = (id: OutcomeId): OutcomeOption | undefined =>
  OUTCOMES.find((o) => o.id === id);

/** Get feature label for display */
export const getFeatureLabel = (id: FeatureId): string =>
  getFeatureById(id)?.label ?? 'Unknown';

/** Get outcome label for display */
export const getOutcomeLabel = (id: OutcomeId): string =>
  getOutcomeById(id)?.label ?? 'Unknown';

/** Map priority to corresponding outcome for "Your priority" option */
export const PRIORITY_TO_OUTCOME: Record<PriorityId, OutcomeId> = {
  'energy-crashes': 'fatigue',
  'pain-inflammation': 'pain',
  'mood-anxiety': 'mood',
  'sleep-quality': 'sleep-quality',
  'digestion-gut': 'ibs',
};

/** Generate the impact question string */
export const generateImpactQuestion = (
  featureId: FeatureId,
  outcomeId: OutcomeId
): string => {
  const feature = getFeatureLabel(featureId);
  const outcome = getOutcomeLabel(outcomeId);
  return `How does ${feature} impact ${outcome}?`;
};

