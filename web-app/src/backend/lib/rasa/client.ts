/**
 * Rasa HTTP Client
 *
 * Why this exists: Provides type-safe access to Rasa dialogue manager.
 * Rasa handles short-term dialogue state (slot filling) while Mem0 handles
 * long-term memory. When slots fill, we sync to Supabase graph nodes.
 *
 * Key operations:
 * - sendMessage: Process user message, get filled slots
 * - getTracker: Get current conversation state
 * - setSlot: Manually set a slot value (for pre-filled entities)
 * - resetSlots: Clear slots when starting new topic
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Rasa response from webhook endpoint.
 */
export interface RasaWebhookResponse {
  recipient_id: string;
  text?: string;
  buttons?: Array<{ title: string; payload: string }>;
  custom?: Record<string, unknown>;
}

/**
 * Rasa tracker (conversation state).
 */
export interface RasaTracker {
  sender_id: string;
  slots: Record<string, SlotValue>;
  latest_message: {
    intent?: { name: string; confidence: number };
    entities?: Array<{
      entity: string;
      value: unknown;
      confidence?: number;
    }>;
    text?: string;
  };
  events: RasaEvent[];
  active_loop?: {
    name: string;
  } | null;
  latest_action_name?: string;
}

/**
 * Slot value can be various types.
 */
export type SlotValue = string | number | boolean | null | undefined;

/**
 * Rasa event in conversation history.
 */
export interface RasaEvent {
  event: string;
  timestamp?: number;
  name?: string;
  value?: unknown;
  [key: string]: unknown;
}

/**
 * Filled slots from Rasa, normalized for our use.
 */
export interface FilledSlots {
  currentSymptom?: string;
  symptomSeverity?: number;
  sleepQuality?: number;
  stressLevel?: number;
  energyLevel?: number;
  moodRating?: number;
  currentMedication?: string;
  currentCondition?: string;
  activeForm?: string | null;
}

/**
 * Entity to pass to Rasa for slot filling.
 */
export interface RasaEntity {
  entity: string;
  value: string | number;
  confidence?: number;
}

// =============================================================================
// CLIENT
// =============================================================================

const RASA_URL = process.env.RASA_URL || 'http://localhost:5005';

/**
 * Sends a message to Rasa and returns the response.
 * Also accepts pre-extracted entities to fill slots directly.
 *
 * @param senderId User ID (conversation scope)
 * @param message User message text
 * @param entities Pre-extracted entities from OpenMed/LLM
 */
export async function sendMessage(
  senderId: string,
  message: string,
  entities?: RasaEntity[]
): Promise<RasaWebhookResponse[]> {
  try {
    // If we have pre-extracted entities, set them as slots first
    if (entities && entities.length > 0) {
      await setEntitiesAsSlots(senderId, entities);
    }

    const response = await fetch(`${RASA_URL}/webhooks/rest/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: senderId,
        message,
      }),
    });

    if (!response.ok) {
      console.error(`[rasa] Webhook returned ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('[rasa] Failed to send message:', error);
    return [];
  }
}

/**
 * Gets the current tracker state for a conversation.
 */
export async function getTracker(senderId: string): Promise<RasaTracker | null> {
  try {
    const response = await fetch(
      `${RASA_URL}/conversations/${senderId}/tracker`,
      { method: 'GET' }
    );

    if (!response.ok) {
      console.error(`[rasa] Tracker fetch returned ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[rasa] Failed to get tracker:', error);
    return null;
  }
}

/**
 * Gets filled slots from the tracker, normalized to our format.
 */
export async function getFilledSlots(senderId: string): Promise<FilledSlots> {
  const tracker = await getTracker(senderId);
  if (!tracker) {
    return {};
  }

  return {
    currentSymptom: tracker.slots.current_symptom as string | undefined,
    symptomSeverity: tracker.slots.symptom_severity as number | undefined,
    sleepQuality: tracker.slots.sleep_quality as number | undefined,
    stressLevel: tracker.slots.stress_level as number | undefined,
    energyLevel: tracker.slots.energy_level as number | undefined,
    moodRating: tracker.slots.mood_rating as number | undefined,
    currentMedication: tracker.slots.current_medication as string | undefined,
    currentCondition: tracker.slots.current_condition as string | undefined,
    activeForm: tracker.active_loop?.name ?? null,
  };
}

/**
 * Sets a single slot value.
 */
export async function setSlot(
  senderId: string,
  slotName: string,
  value: SlotValue
): Promise<boolean> {
  try {
    const response = await fetch(
      `${RASA_URL}/conversations/${senderId}/tracker/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'slot',
          name: slotName,
          value,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(`[rasa] Failed to set slot ${slotName}:`, error);
    return false;
  }
}

/**
 * Sets multiple entities as slots.
 * Used to pass OpenMed/LLM-extracted entities to Rasa.
 */
async function setEntitiesAsSlots(
  senderId: string,
  entities: RasaEntity[]
): Promise<void> {
  const slotMapping: Record<string, string> = {
    symptom_name: 'current_symptom',
    medication_name: 'current_medication',
    condition_name: 'current_condition',
    severity: 'symptom_severity',
    sleep_hours: 'sleep_quality',
    stress_level: 'stress_level',
    energy_level: 'energy_level',
    mood_rating: 'mood_rating',
  };

  for (const entity of entities) {
    const slotName = slotMapping[entity.entity] || entity.entity;
    await setSlot(senderId, slotName, entity.value);
  }
}

/**
 * Resets all slots to their initial values.
 * Call when starting a new topic or conversation.
 */
export async function resetSlots(senderId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${RASA_URL}/conversations/${senderId}/tracker/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'restart',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('[rasa] Failed to reset slots:', error);
    return false;
  }
}

/**
 * Gets the active form name, if any.
 */
export async function getActiveForm(senderId: string): Promise<string | null> {
  const tracker = await getTracker(senderId);
  return tracker?.active_loop?.name ?? null;
}

/**
 * Checks which required slots are still missing for the active form.
 */
export async function getMissingSlots(senderId: string): Promise<string[]> {
  const tracker = await getTracker(senderId);
  if (!tracker || !tracker.active_loop) {
    return [];
  }

  // Form slot requirements (matches domain.yml)
  const formSlots: Record<string, string[]> = {
    daily_checkin_form: ['sleep_quality', 'stress_level', 'energy_level'],
    symptom_detail_form: ['current_symptom', 'symptom_severity'],
    full_intake_form: [
      'current_symptom',
      'symptom_severity',
      'sleep_quality',
      'stress_level',
      'energy_level',
      'mood_rating',
    ],
  };

  const requiredSlots = formSlots[tracker.active_loop.name] || [];
  const missing: string[] = [];

  for (const slot of requiredSlots) {
    const value = tracker.slots[slot];
    if (value === null || value === undefined) {
      missing.push(slot);
    }
  }

  return missing;
}

/**
 * Health check for Rasa service.
 */
export async function isRasaHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${RASA_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
