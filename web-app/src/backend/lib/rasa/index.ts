/**
 * Rasa Module Exports
 *
 * Why this exists: Clean re-exports for the Rasa dialogue manager integration.
 */

export {
  sendMessage,
  getTracker,
  getFilledSlots,
  setSlot,
  resetSlots,
  getActiveForm,
  getMissingSlots,
  isRasaHealthy,
  type RasaWebhookResponse,
  type RasaTracker,
  type FilledSlots,
  type RasaEntity,
  type SlotValue,
} from './client';
