/**
 * Dynamic intake types
 *
 * Why this exists: Gives the intake engine a stable vocabulary for active
 * questions, problem threads, and validated clinical events before anything is
 * projected into logs or the graph.
 */

/**
 * Supported structured input modes for intake questions.
 * Why this exists: The runtime needs to know whether a question expects a
 * numeric text reply or should trigger the slider UI tool.
 */
export type IntakeInputType = 'slider' | 'free_text_number';

/**
 * Stable identifiers for deterministic intake questions.
 * Why this exists: Terse replies must resolve against a known question ID
 * rather than being guessed from graph nodes or prompt wording.
 */
export type IntakeQuestionKind =
  | 'symptom_severity'
  | 'sleep_hours'
  | 'stress_level'
  | 'energy_level'
  | 'mood_rating';

/**
 * Lightweight problem thread for multi-condition conversations.
 * Why this exists: Users often switch between symptoms or conditions inside one
 * chat, so intake state must track the currently active problem without
 * overwriting older context.
 */
export interface ProblemThread {
  id: string;
  title: string;
  symptomName?: string;
  conditionName?: string;
  status: 'active' | 'background';
  createdAt: string;
  updatedAt: string;
}

/**
 * Canonical active intake question stored in user preferences.
 * Why this exists: The app needs one source of truth for the currently pending
 * structured question instead of spreading it across Rasa, prompts, and graph
 * unknown nodes.
 */
export interface ActiveIntakeQuestion {
  id: string;
  kind: IntakeQuestionKind;
  prompt: string;
  inputType: IntakeInputType;
  threadId: string;
  slotName:
    | 'symptom_severity'
    | 'sleep_quality'
    | 'stress_level'
    | 'energy_level'
    | 'mood_rating';
  metric: string;
  labelPreset?: 'severity' | 'sleep' | 'stress' | 'energy' | 'mood';
  askedAt: string;
}

/**
 * Persisted intake state for a user.
 * Why this exists: Centralizes active question and problem-thread ownership in
 * one store so the route and pipeline can make deterministic decisions.
 */
export interface IntakeState {
  flareMode: boolean;
  activeProblemThreadId: string | null;
  problemThreads: ProblemThread[];
  activeQuestion: ActiveIntakeQuestion | null;
}

/**
 * Validated clinical event types emitted by intake.
 * Why this exists: The graph should be projected from validated domain events
 * rather than directly from ad hoc slot state or prompt heuristics.
 */
export type ValidatedClinicalEvent =
  | {
      type: 'symptom_reported';
      occurredAt: string;
      threadId: string;
      symptomName: string;
      severity?: number;
      source: 'rasa_slot' | 'extractor';
    }
  | {
      type: 'symptom_severity_recorded';
      occurredAt: string;
      threadId: string;
      symptomName: string;
      severity: number;
      source: 'rasa_slot' | 'active_question';
    }
  | {
      type: 'factor_recorded';
      occurredAt: string;
      threadId: string;
      factorName: 'Sleep' | 'Stress' | 'Energy' | 'Mood';
      value: number;
      source: 'rasa_slot' | 'active_question' | 'extractor';
    }
  | {
      type: 'condition_reported';
      occurredAt: string;
      threadId: string;
      conditionName: string;
      source: 'rasa_slot' | 'extractor';
    }
  | {
      type: 'medication_reported';
      occurredAt: string;
      threadId: string;
      medicationName: string;
      source: 'rasa_slot' | 'extractor';
    };

