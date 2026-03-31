/**
 * Dynamic intake questionnaire
 *
 * Why this exists: Replaces prompt- and graph-driven intake ownership with a
 * data-defined questionnaire that deterministically chooses the next structured
 * question for the user.
 */

import type { FilledSlots, RasaEntity } from '../rasa';
import type { NormalizedEntity } from '../openmed';

import type {
  ActiveIntakeQuestion,
  IntakeState,
  ProblemThread,
} from './types';

/**
 * Selects or creates the currently active problem thread.
 * Why this exists: Users can mention multiple symptoms or conditions in one
 * conversation, so the questionnaire needs a stable episode-like anchor for
 * follow-up questions.
 */
export function resolveProblemThreads(params: {
  existingThreads: ProblemThread[];
  activeProblemThreadId: string | null;
  biomedicalEntities: NormalizedEntity[];
  message: string;
}): { problemThreads: ProblemThread[]; activeProblemThreadId: string | null } {
  const now = new Date().toISOString();
  const threads: ProblemThread[] = params.existingThreads.map((thread) => ({
    ...thread,
    status: 'background',
  }));

  const symptomEntity = params.biomedicalEntities.find((entity) => entity.type === 'symptom');
  const conditionEntity = params.biomedicalEntities.find((entity) => entity.type === 'condition');

  let activeThread = threads.find((thread) => thread.id === params.activeProblemThreadId) ?? null;

  if (symptomEntity) {
    activeThread =
      threads.find(
        (thread) =>
          thread.symptomName?.toLowerCase() === symptomEntity.name.toLowerCase()
        ) ?? null;

    if (!activeThread) {
      activeThread = {
        id: `symptom:${slugify(symptomEntity.name)}:${Date.now()}`,
        title: symptomEntity.name,
        symptomName: symptomEntity.name,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      threads.unshift(activeThread);
    }
  } else if (conditionEntity) {
    activeThread =
      threads.find(
        (thread) =>
          thread.conditionName?.toLowerCase() === conditionEntity.name.toLowerCase()
      ) ?? null;

    if (!activeThread) {
      activeThread = {
        id: `condition:${slugify(conditionEntity.name)}:${Date.now()}`,
        title: conditionEntity.name,
        conditionName: conditionEntity.name,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      threads.unshift(activeThread);
    }
  }

  if (!activeThread && params.activeProblemThreadId) {
    activeThread = threads.find((thread) => thread.id === params.activeProblemThreadId) ?? null;
  }

  if (!activeThread) {
    activeThread = {
      id: 'general-intake',
      title: 'General intake',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    if (!threads.some((thread) => thread.id === activeThread?.id)) {
      threads.unshift(activeThread);
    }
  }

  activeThread.updatedAt = now;
  activeThread.status = 'active';

  return {
    problemThreads: dedupeThreads(threads),
    activeProblemThreadId: activeThread.id,
  };
}

/**
 * Chooses the canonical next intake question for the user.
 * Why this exists: The route must ask exactly one structured question at a time
 * without relying on prompt heuristics or graph unknown nodes.
 */
export function selectActiveIntakeQuestion(params: {
  intakeState: IntakeState;
  filledSlots: FilledSlots;
  activeProblemThread: ProblemThread | null;
}): ActiveIntakeQuestion | null {
  if (params.intakeState.flareMode) {
    return null;
  }

  const currentQuestion = params.intakeState.activeQuestion;
  if (currentQuestion && isSlotStillMissing(currentQuestion.slotName, params.filledSlots)) {
    return currentQuestion;
  }

  const activeProblemThread = params.activeProblemThread;
  const symptomName = params.filledSlots.currentSymptom ?? activeProblemThread?.symptomName;

  if (symptomName && params.filledSlots.symptomSeverity == null) {
    return {
      id: `${activeProblemThread?.id ?? 'general-intake'}:symptom_severity`,
      kind: 'symptom_severity',
      prompt: `Rate your ${symptomName}.`,
      inputType: 'slider',
      threadId: activeProblemThread?.id ?? 'general-intake',
      slotName: 'symptom_severity',
      metric: symptomName,
      labelPreset: 'severity',
      askedAt: new Date().toISOString(),
    };
  }

  const baselineQuestions: Array<ActiveIntakeQuestion | null> = [
    params.filledSlots.sleepQuality == null
      ? {
          id: `${activeProblemThread?.id ?? 'general-intake'}:sleep_hours`,
          kind: 'sleep_hours',
          prompt: 'How many hours did you sleep last night?',
          inputType: 'free_text_number',
          threadId: activeProblemThread?.id ?? 'general-intake',
          slotName: 'sleep_quality',
          metric: 'sleep hours',
          askedAt: new Date().toISOString(),
        }
      : null,
    params.filledSlots.stressLevel == null
      ? {
          id: `${activeProblemThread?.id ?? 'general-intake'}:stress_level`,
          kind: 'stress_level',
          prompt: 'Rate your stress level today.',
          inputType: 'slider',
          threadId: activeProblemThread?.id ?? 'general-intake',
          slotName: 'stress_level',
          metric: 'stress level',
          labelPreset: 'stress',
          askedAt: new Date().toISOString(),
        }
      : null,
    params.filledSlots.energyLevel == null
      ? {
          id: `${activeProblemThread?.id ?? 'general-intake'}:energy_level`,
          kind: 'energy_level',
          prompt: 'Rate your energy level today.',
          inputType: 'slider',
          threadId: activeProblemThread?.id ?? 'general-intake',
          slotName: 'energy_level',
          metric: 'energy level',
          labelPreset: 'energy',
          askedAt: new Date().toISOString(),
        }
      : null,
    params.filledSlots.moodRating == null
      ? {
          id: `${activeProblemThread?.id ?? 'general-intake'}:mood_rating`,
          kind: 'mood_rating',
          prompt: 'Rate your mood today.',
          inputType: 'slider',
          threadId: activeProblemThread?.id ?? 'general-intake',
          slotName: 'mood_rating',
          metric: 'mood',
          labelPreset: 'mood',
          askedAt: new Date().toISOString(),
        }
      : null,
  ];

  return baselineQuestions.find(Boolean) ?? null;
}

/**
 * Resolves the user's latest reply against the active intake question.
 * Why this exists: Numeric-only answers should only be interpreted in the
 * context of the single currently active structured question.
 */
export function resolveActiveQuestionAnswer(
  question: ActiveIntakeQuestion | null,
  message: string
): { rasaEntity: RasaEntity; answeredQuestionId: string } | null {
  if (!question) {
    return null;
  }

  const numericValue = extractNumericValue(message);
  if (numericValue === null) {
    return null;
  }

  const entityByKind: Record<ActiveIntakeQuestion['kind'], RasaEntity['entity']> = {
    symptom_severity: 'severity',
    sleep_hours: 'sleep_hours',
    stress_level: 'stress_level',
    energy_level: 'energy_level',
    mood_rating: 'mood_rating',
  };

  if (question.kind === 'sleep_hours' && (numericValue < 0 || numericValue > 24)) {
    return null;
  }

  if (question.kind !== 'sleep_hours' && (numericValue < 0 || numericValue > 10)) {
    return null;
  }

  return {
    rasaEntity: {
      entity: entityByKind[question.kind],
      value: numericValue,
      confidence: 0.95,
    },
    answeredQuestionId: question.id,
  };
}

/**
 * Returns the active problem thread object from state.
 * Why this exists: The pipeline needs a stable helper to attach projected
 * events to the right symptom or condition thread.
 */
export function getActiveProblemThread(
  problemThreads: ProblemThread[],
  activeProblemThreadId: string | null
): ProblemThread | null {
  if (!activeProblemThreadId) {
    return null;
  }

  return problemThreads.find((thread) => thread.id === activeProblemThreadId) ?? null;
}

/**
 * Extracts a single numeric value from a structured intake reply.
 * Why this exists: Slider responses and terse numeric replies are sent back as
 * chat text, so intake needs a deterministic parser.
 */
function extractNumericValue(message: string): number | null {
  const match = message.match(/\b(\d{1,2})(?:\s*\/\s*10)?\b/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

/**
 * Checks whether a slot is still unresolved.
 * Why this exists: The active intake question should stay sticky until its
 * target slot has actually been filled.
 */
function isSlotStillMissing(
  slotName: ActiveIntakeQuestion['slotName'],
  slots: FilledSlots
): boolean {
  if (slotName === 'symptom_severity') return slots.symptomSeverity == null;
  if (slotName === 'sleep_quality') return slots.sleepQuality == null;
  if (slotName === 'stress_level') return slots.stressLevel == null;
  if (slotName === 'energy_level') return slots.energyLevel == null;
  return slots.moodRating == null;
}

/**
 * Removes duplicate threads while keeping the newest metadata.
 * Why this exists: Repeated mentions of the same symptom should not create an
 * ever-growing list of near-identical problem threads.
 */
function dedupeThreads(threads: ProblemThread[]): ProblemThread[] {
  const byId = new Map<string, ProblemThread>();

  for (const thread of threads) {
    byId.set(thread.id, thread);
  }

  return Array.from(byId.values()).slice(0, 8);
}

/**
 * Creates a URL-safe slug for deterministic thread IDs.
 * Why this exists: Thread IDs need to be readable and stable without depending
 * on database-generated UUIDs.
 */
function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

