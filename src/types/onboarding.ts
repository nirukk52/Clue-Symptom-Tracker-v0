/**
 * Type definitions for the onboarding flow
 * 
 * Why it exists: Provides type safety for onboarding state, ensuring data consistency
 * across screens and persistence layers.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §Key Entities
 */

/** Condition categories for Screen 1A selection */
export type ConditionCategory =
  | 'common'
  | 'digestive'
  | 'pain-inflammation'
  | 'mental-health'
  | 'sleep-energy'
  | 'neuro'
  | 'hormonal'
  | 'autoimmune'
  | 'other';

/** Individual condition selectable in onboarding */
export interface Condition {
  id: string;
  label: string;
  emoji: string;
  category: ConditionCategory;
}

/** Priority outcome options for Screen 1B */
export type PriorityId =
  | 'energy-crashes'
  | 'pain-inflammation'
  | 'mood-anxiety'
  | 'sleep-quality'
  | 'digestion-gut';

export interface Priority {
  id: PriorityId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/** User intent modes for Screen 2 */
export type IntentId = 'awareness' | 'tracking' | 'insight' | 'action';

export interface IntentMode {
  id: IntentId;
  title: string;
  icon: string;
  quotes: string[];
}

/** Feature options for impact question (Screen 1C) */
export type FeatureId =
  | 'meds-supplements'
  | 'sleep'
  | 'food'
  | 'stress'
  | 'exercise'
  | 'cycle-hormones'
  | 'work-routine'
  | 'weather'
  | 'hydration'
  | 'social-outings';

/** Outcome options for impact question (Screen 1C) */
export type OutcomeId =
  | 'your-priority'
  | 'pain'
  | 'fatigue'
  | 'mood'
  | 'ibs'
  | 'sleep-quality'
  | 'headache'
  | 'anxiety'
  | 'brain-fog'
  | 'skin';

export interface ImpactQuestion {
  featureId: FeatureId;
  outcomeId: OutcomeId;
  /** Generated question string: "How does [Feature] impact [Outcome]?" */
  questionText: string;
}

/** Baseline entry captured on Screen 3 */
export interface BaselineEntry {
  /** Severity value 0-10 for primary outcome */
  severity: number;
  /** Whether user marked this as a flare */
  isFlare: boolean;
  /** When the flare started if applicable */
  flareStartTime?: 'just-now' | 'earlier-today' | 'yesterday' | string;
  /** Selected driver chips */
  drivers: string[];
  /** Optional free-text note */
  note?: string;
  /** Timestamp of baseline capture */
  capturedAt: number;
}

/** Complete onboarding state */
export interface OnboardingState {
  /** Current step index (0-5 for screens 1A through 4) */
  step: number;
  /** Selected conditions from Screen 1A (max 3) */
  conditions: string[];
  /** Selected priority from Screen 1B */
  priority: PriorityId | null;
  /** Impact question from Screen 1C */
  impactQuestion: ImpactQuestion | null;
  /** Selected intent mode from Screen 2 */
  intent: IntentId | null;
  /** Baseline data from Screen 3 */
  baseline: BaselineEntry | null;
  /** Whether onboarding has been completed */
  isComplete: boolean;
  /** Timestamp when onboarding was completed */
  completedAt: number | null;
}

/** Actions for the onboarding store */
export interface OnboardingActions {
  /** Set selected conditions (Screen 1A) */
  setConditions: (conditions: string[]) => void;
  /** Set priority outcome (Screen 1B) */
  setPriority: (priority: PriorityId) => void;
  /** Set impact question (Screen 1C) */
  setImpactQuestion: (question: ImpactQuestion) => void;
  /** Set intent mode (Screen 2) */
  setIntent: (intent: IntentId) => void;
  /** Set baseline data (Screen 3) */
  setBaseline: (baseline: BaselineEntry) => void;
  /** Advance to next step */
  nextStep: () => void;
  /** Go back to previous step */
  prevStep: () => void;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Reset onboarding state (for abandonment) */
  reset: () => void;
}

