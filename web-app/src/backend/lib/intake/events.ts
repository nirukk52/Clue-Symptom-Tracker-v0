/**
 * Dynamic intake event projection
 *
 * Why this exists: Converts validated slot changes and extractions into stable
 * clinical events, then projects those events into the graph without relying on
 * prompt heuristics.
 */

import type { FilledSlots, RasaEntity } from '../rasa';
import type { NormalizedEntity } from '../openmed';
import { upsertGraphNode } from '../graph';

import type { ProblemThread, ValidatedClinicalEvent } from './types';

/**
 * Builds validated clinical events from changed Rasa slots.
 * Why this exists: Slot changes are the closest thing to validated intake facts
 * in the current system, so graph projection should start from them.
 */
export function buildValidatedClinicalEvents(params: {
  previousSlots: FilledSlots;
  currentSlots: FilledSlots;
  activeProblemThread: ProblemThread | null;
}): ValidatedClinicalEvent[] {
  const occurredAt = new Date().toISOString();
  const threadId = params.activeProblemThread?.id ?? 'general-intake';
  const events: ValidatedClinicalEvent[] = [];

  if (
    params.currentSlots.currentSymptom &&
    params.previousSlots.currentSymptom !== params.currentSlots.currentSymptom
  ) {
    events.push({
      type: 'symptom_reported',
      occurredAt,
      threadId,
      symptomName: params.currentSlots.currentSymptom,
      severity: params.currentSlots.symptomSeverity ?? undefined,
      source: 'rasa_slot',
    });
  }

  if (
    params.currentSlots.currentSymptom &&
    params.currentSlots.symptomSeverity != null &&
    params.previousSlots.symptomSeverity !== params.currentSlots.symptomSeverity
  ) {
    events.push({
      type: 'symptom_severity_recorded',
      occurredAt,
      threadId,
      symptomName: params.currentSlots.currentSymptom,
      severity: params.currentSlots.symptomSeverity,
      source: 'active_question',
    });
  }

  pushFactorEvent(
    events,
    occurredAt,
    threadId,
    'Sleep',
    params.previousSlots.sleepQuality,
    params.currentSlots.sleepQuality
  );
  pushFactorEvent(
    events,
    occurredAt,
    threadId,
    'Stress',
    params.previousSlots.stressLevel,
    params.currentSlots.stressLevel
  );
  pushFactorEvent(
    events,
    occurredAt,
    threadId,
    'Energy',
    params.previousSlots.energyLevel,
    params.currentSlots.energyLevel
  );
  pushFactorEvent(
    events,
    occurredAt,
    threadId,
    'Mood',
    params.previousSlots.moodRating,
    params.currentSlots.moodRating
  );

  if (
    params.currentSlots.currentCondition &&
    params.previousSlots.currentCondition !== params.currentSlots.currentCondition
  ) {
    events.push({
      type: 'condition_reported',
      occurredAt,
      threadId,
      conditionName: params.currentSlots.currentCondition,
      source: 'rasa_slot',
    });
  }

  if (
    params.currentSlots.currentMedication &&
    params.previousSlots.currentMedication !== params.currentSlots.currentMedication
  ) {
    events.push({
      type: 'medication_reported',
      occurredAt,
      threadId,
      medicationName: params.currentSlots.currentMedication,
      source: 'rasa_slot',
    });
  }

  return events;
}

/**
 * Builds fallback events when Rasa is unavailable.
 * Why this exists: The graph should still receive structured updates from
 * extractor output even if the dialogue-state adapter is down.
 */
export function buildFallbackValidatedClinicalEvents(params: {
  biomedicalEntities: NormalizedEntity[];
  factorEntities: RasaEntity[];
  activeProblemThread: ProblemThread | null;
}): ValidatedClinicalEvent[] {
  const occurredAt = new Date().toISOString();
  const threadId = params.activeProblemThread?.id ?? 'general-intake';
  const events: ValidatedClinicalEvent[] = [];

  for (const entity of params.biomedicalEntities) {
    if (entity.type === 'symptom') {
      events.push({
        type: 'symptom_reported',
        occurredAt,
        threadId,
        symptomName: entity.name,
        source: 'extractor',
      });
    }

    if (entity.type === 'condition') {
      events.push({
        type: 'condition_reported',
        occurredAt,
        threadId,
        conditionName: entity.name,
        source: 'extractor',
      });
    }

    if (entity.type === 'medication') {
      events.push({
        type: 'medication_reported',
        occurredAt,
        threadId,
        medicationName: entity.name,
        source: 'extractor',
      });
    }
  }

  for (const factor of params.factorEntities) {
    if (factor.entity === 'severity') {
      const symptomName =
        params.activeProblemThread?.symptomName ??
        params.biomedicalEntities.find((entity) => entity.type === 'symptom')?.name;

      if (symptomName && typeof factor.value === 'number') {
        events.push({
          type: 'symptom_severity_recorded',
          occurredAt,
          threadId,
          symptomName,
          severity: factor.value,
          source: 'active_question',
        });
      }
    }

    const factorName = mapFactorEntityToName(factor.entity);
    if (factorName && typeof factor.value === 'number') {
      events.push({
        type: 'factor_recorded',
        occurredAt,
        threadId,
        factorName,
        value: factor.value,
        source: factor.confidence && factor.confidence > 0.9 ? 'active_question' : 'extractor',
      });
    }
  }

  return events;
}

/**
 * Projects validated clinical events into graph nodes.
 * Why this exists: The graph should reflect stable intake facts rather than raw
 * user messages or pending-question heuristics.
 */
export async function projectValidatedEventsToGraph(
  userId: string,
  events: ValidatedClinicalEvent[]
): Promise<number> {
  let nodesCreated = 0;

  for (const event of events) {
    if (event.type === 'symptom_reported') {
      const nodeId = await upsertGraphNode(userId, {
        type: 'symptom',
        name: event.symptomName,
        subLabel: event.severity != null ? `Severity ${event.severity}/10` : undefined,
        data: {
          threadId: event.threadId,
          eventType: event.type,
          source: event.source,
          occurredAt: event.occurredAt,
          severity: event.severity,
        },
      });
      if (nodeId) nodesCreated++;
    }

    if (event.type === 'symptom_severity_recorded') {
      const nodeId = await upsertGraphNode(userId, {
        type: 'symptom',
        name: event.symptomName,
        subLabel: `Severity ${event.severity}/10`,
        data: {
          threadId: event.threadId,
          eventType: event.type,
          source: event.source,
          occurredAt: event.occurredAt,
          severity: event.severity,
        },
      });
      if (nodeId) nodesCreated++;
    }

    if (event.type === 'factor_recorded') {
      const nodeId = await upsertGraphNode(userId, {
        type: 'factor',
        name: event.factorName,
        subLabel: formatFactorSubLabel(event.factorName, event.value),
        data: {
          threadId: event.threadId,
          eventType: event.type,
          source: event.source,
          occurredAt: event.occurredAt,
          value: event.value,
        },
      });
      if (nodeId) nodesCreated++;
    }

    if (event.type === 'condition_reported') {
      const nodeId = await upsertGraphNode(userId, {
        type: 'condition',
        name: event.conditionName,
        data: {
          threadId: event.threadId,
          eventType: event.type,
          source: event.source,
          occurredAt: event.occurredAt,
        },
      });
      if (nodeId) nodesCreated++;
    }

    if (event.type === 'medication_reported') {
      const nodeId = await upsertGraphNode(userId, {
        type: 'medication',
        name: event.medicationName,
        data: {
          threadId: event.threadId,
          eventType: event.type,
          source: event.source,
          occurredAt: event.occurredAt,
        },
      });
      if (nodeId) nodesCreated++;
    }
  }

  return nodesCreated;
}

/**
 * Adds a factor event when a tracked numeric value changes.
 * Why this exists: Factor projections should only happen for newly validated
 * values, not every time the pipeline runs.
 */
function pushFactorEvent(
  events: ValidatedClinicalEvent[],
  occurredAt: string,
  threadId: string,
  factorName: 'Sleep' | 'Stress' | 'Energy' | 'Mood',
  previous: number | undefined,
  current: number | undefined
): void {
  if (current == null || previous === current) {
    return;
  }

  events.push({
    type: 'factor_recorded',
    occurredAt,
    threadId,
    factorName,
    value: current,
    source: 'rasa_slot',
  });
}

/**
 * Maps low-level factor entities into display names.
 * Why this exists: Extractor output uses slot-style identifiers while the graph
 * and UI use user-facing factor labels.
 */
function mapFactorEntityToName(entity: string): 'Sleep' | 'Stress' | 'Energy' | 'Mood' | null {
  if (entity === 'sleep_hours') return 'Sleep';
  if (entity === 'stress_level') return 'Stress';
  if (entity === 'energy_level') return 'Energy';
  if (entity === 'mood_rating') return 'Mood';
  return null;
}

/**
 * Formats factor values for graph sub-labels.
 * Why this exists: Sleep is stored as hours while other factors are stored as
 * normalized 1-10 ratings.
 */
function formatFactorSubLabel(
  factorName: 'Sleep' | 'Stress' | 'Energy' | 'Mood',
  value: number
): string {
  return factorName === 'Sleep' ? `${value} hours` : `${value}/10`;
}

