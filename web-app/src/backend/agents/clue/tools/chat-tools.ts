/**
 * Chat Tools Registry for the Clue Agent
 *
 * Why this exists: Exports all chat tools as a single registry for the API route.
 * Individual tools are defined in separate files under ./definitions/ for maintainability.
 */

export { setActiveUserId } from './utils';

import {
  logSymptom,
  logMedication,
  logMood,
  getTimeline,
  generateDoctorSummary,
  askSeverity,
  openQuickEntryCard,
  toggleFlareMode,
} from './definitions';

/**
 * All chat tools exported as a single registry for the API route.
 */
export const chatTools = {
  log_symptom: logSymptom,
  log_medication: logMedication,
  log_mood: logMood,
  get_timeline: getTimeline,
  generate_doctor_summary: generateDoctorSummary,
  toggle_flare_mode: toggleFlareMode,
  ask_severity: askSeverity,
  open_quick_entry_card: openQuickEntryCard,
};
