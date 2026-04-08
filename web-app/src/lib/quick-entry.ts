/**
 * Quick entry shared types and curated catalogs.
 *
 * Why this exists: The quick-entry tab, chat widgets, and server persistence
 * all need one deterministic source of truth for fixed categories, metrics,
 * and payload shapes.
 */

/**
 * QuickEntryFactorCategoryKey narrows factor sections to the curated set used
 * by the first Bearable-style quick-entry rollout.
 */
export type QuickEntryFactorCategoryKey =
  | 'sleep'
  | 'lifestyle'
  | 'behavioural-patterns'
  | 'work'
  | 'active'
  | 'recovery'
  | 'social'
  | 'weather'
  | 'personal-care';

/**
 * QuickEntryMeasurementKey keeps health measurement inputs mapped to stable
 * storage keys instead of user-facing labels.
 */
export type QuickEntryMeasurementKey =
  | 'heart-rate'
  | 'step-count'
  | 'weight'
  | 'blood-glucose'
  | 'blood-pressure-systolic'
  | 'blood-pressure-diastolic'
  | 'body-temperature'
  | 'heart-rate-variability'
  | 'oxygen-saturation'
  | 'resting-heart-rate';

/**
 * QuickEntryMedicationDraft captures a single medication row before it is saved.
 */
export interface QuickEntryMedicationDraft {
  id: string;
  medicationName: string;
  dosage?: string;
  taken: boolean;
  timing?: string;
  notes?: string;
}

/**
 * QuickEntryMoodDraft captures the daily mood card state.
 */
export interface QuickEntryMoodDraft {
  rating: number;
  note?: string;
}

/**
 * QuickEntryFactorDraft stores a selected factor or sleep entry.
 */
export interface QuickEntryFactorDraft {
  id: string;
  categoryKey: QuickEntryFactorCategoryKey;
  categoryLabel: string;
  factorKey: string;
  factorName: string;
  rating?: number;
  scaleMax?: number;
  notes?: string;
}

/**
 * QuickEntryMeasurementDraft stores one structured health measurement row.
 */
export interface QuickEntryMeasurementDraft {
  id: string;
  metricKey: QuickEntryMeasurementKey;
  metricName: string;
  unit: string;
  value: number;
  notes?: string;
}

/**
 * QuickEntrySnapshot is the structured quick-entry document exchanged between
 * the client and the quick-entry API.
 */
export interface QuickEntrySnapshot {
  mood: QuickEntryMoodDraft | null;
  medications: QuickEntryMedicationDraft[];
  factors: QuickEntryFactorDraft[];
  measurements: QuickEntryMeasurementDraft[];
}

/**
 * QuickEntryFactorItemDefinition describes one curated factor option.
 */
export interface QuickEntryFactorItemDefinition {
  key: string;
  label: string;
  icon: string;
  supportsRating?: boolean;
  defaultVisible?: boolean;
}

/**
 * QuickEntryFactorCategoryDefinition groups related factor items into the
 * expandable sections shown in the quick-entry tab.
 */
export interface QuickEntryFactorCategoryDefinition {
  key: QuickEntryFactorCategoryKey;
  label: string;
  icon: string;
  defaultVisible?: boolean;
  items: QuickEntryFactorItemDefinition[];
}

/**
 * QuickEntryMeasurementDefinition describes one curated health metric.
 */
export interface QuickEntryMeasurementDefinition {
  key: QuickEntryMeasurementKey;
  label: string;
  unit: string;
  icon: string;
  defaultVisible?: boolean;
}

/**
 * QUICK_ENTRY_FACTOR_CATEGORIES mirrors the Bearable-style fixed factor catalog
 * while keeping labels aligned with Chronic Life's calmer visual language.
 */
export const QUICK_ENTRY_FACTOR_CATEGORIES: QuickEntryFactorCategoryDefinition[] = [
  {
    key: 'sleep',
    label: 'Sleep',
    icon: 'bedtime',
    defaultVisible: true,
    items: [
      { key: 'sleep-quality', label: 'Sleep Quality', icon: 'bedtime', supportsRating: true, defaultVisible: true },
      { key: 'early-bedtime', label: 'Early Bedtime', icon: 'dark_mode', defaultVisible: true },
      { key: 'late-bedtime', label: 'Late Bedtime', icon: 'dark_mode', defaultVisible: true },
      { key: 'time-in-bed', label: 'Time in Bed', icon: 'hotel', defaultVisible: true },
      { key: 'nap-time', label: 'Nap Time', icon: 'airline_seat_flat', defaultVisible: true },
      { key: 'blue-light-blocking-glasses', label: 'Blue-light Blocking Glasses', icon: 'visibility' },
      { key: 'cat-in-bedroom', label: 'Cat in Bedroom', icon: 'pets' },
      { key: 'cpap-machine', label: 'CPAP Machine', icon: 'settings_input_component' },
      { key: 'device-in-bed', label: 'Device in Bed', icon: 'smartphone' },
      { key: 'dog-in-bedroom', label: 'Dog in Bedroom', icon: 'pets' },
      { key: 'ear-plugs', label: 'Ear Plugs', icon: 'hearing' },
      { key: 'electric-blanket', label: 'Electric Blanket', icon: 'electric_bolt' },
      { key: 'hot-flash-during-sleep', label: 'Hot Flash During Sleep', icon: 'local_fire_department' },
      { key: 'nasal-strip', label: 'Nasal Strip', icon: 'air' },
      { key: 'not-in-usual-bed', label: 'Not in Usual Bed', icon: 'single_bed' },
      { key: 'pain-affected-sleep', label: 'Pain Affected Sleep', icon: 'sick' },
      { key: 'read-in-bed', label: 'Read in Bed', icon: 'menu_book' },
      { key: 'shared-bed', label: 'Shared Bed', icon: 'king_bed' },
      { key: 'sleep-at-altitude', label: 'Sleep at Altitude', icon: 'terrain' },
      { key: 'sleep-mask', label: 'Sleep Mask', icon: 'visibility_off' },
      { key: 'sleep-story', label: 'Sleep Story', icon: 'graphic_eq' },
      { key: 'sound-machine', label: 'Sound Machine', icon: 'speaker' },
      { key: 'weighted-blanket', label: 'Weighted Blanket', icon: 'bed' },
      { key: 'morning-sunlight', label: 'Get Sunlight in the Morning', icon: 'light_mode' },
      { key: 'no-screens-before-sleep', label: 'No Screens Within 1hr of Sleep', icon: 'do_not_disturb_on' },
    ],
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle',
    icon: 'av_timer',
    defaultVisible: true,
    items: [
      { key: 'caffeine', label: 'Caffeine', icon: 'coffee', supportsRating: true, defaultVisible: true },
      { key: 'alcohol', label: 'Alcohol', icon: 'wine_bar', supportsRating: true, defaultVisible: true },
      { key: 'hydration', label: 'Hydration', icon: 'water_drop', supportsRating: true, defaultVisible: true },
      { key: 'screen-time', label: 'Screen Time', icon: 'monitor', supportsRating: true },
      { key: 'travel', label: 'Travel', icon: 'flight' },
      { key: 'late-meal', label: 'Late Meal', icon: 'restaurant' },
    ],
  },
  {
    key: 'behavioural-patterns',
    label: 'Behavioural Patterns',
    icon: 'cycles',
    defaultVisible: true,
    items: [
      { key: 'stress', label: 'Stress', icon: 'psychology', supportsRating: true, defaultVisible: true },
      { key: 'brain-fog', label: 'Brain Fog', icon: 'cloud', supportsRating: true },
      { key: 'overstimulation', label: 'Overstimulation', icon: 'graphic_eq', supportsRating: true },
      { key: 'routine-change', label: 'Routine Change', icon: 'swap_horiz' },
      { key: 'missed-breaks', label: 'Missed Breaks', icon: 'timer_off' },
    ],
  },
  {
    key: 'work',
    label: 'Work',
    icon: 'work_outline',
    defaultVisible: true,
    items: [
      { key: 'meetings', label: 'Meetings', icon: 'groups', supportsRating: true, defaultVisible: true },
      { key: 'commute', label: 'Commute', icon: 'directions_car' },
      { key: 'desk-time', label: 'Desk Time', icon: 'desktop_windows', supportsRating: true },
      { key: 'physical-labor', label: 'Physical Labor', icon: 'construction', supportsRating: true },
    ],
  },
  {
    key: 'active',
    label: 'Active',
    icon: 'monitor_heart',
    defaultVisible: true,
    items: [
      { key: 'walking', label: 'Walking', icon: 'directions_walk', supportsRating: true, defaultVisible: true },
      { key: 'exercise', label: 'Exercise', icon: 'fitness_center', supportsRating: true, defaultVisible: true },
      { key: 'stretching', label: 'Stretching', icon: 'self_improvement' },
      { key: 'standing-long', label: 'Long Time Standing', icon: 'accessibility_new', supportsRating: true },
    ],
  },
  {
    key: 'recovery',
    label: 'Recovery',
    icon: 'healing',
    items: [
      { key: 'rest', label: 'Rest', icon: 'weekend', supportsRating: true, defaultVisible: true },
      { key: 'heat-pack', label: 'Heat Pack', icon: 'device_thermostat' },
      { key: 'hydration-support', label: 'Electrolytes', icon: 'local_drink' },
      { key: 'meditation', label: 'Meditation', icon: 'spa' },
    ],
  },
  {
    key: 'social',
    label: 'Social',
    icon: 'person',
    items: [
      { key: 'social-time', label: 'Social Time', icon: 'group', supportsRating: true, defaultVisible: true },
      { key: 'crowds', label: 'Crowds', icon: 'groups_2', supportsRating: true },
      { key: 'phone-calls', label: 'Phone Calls', icon: 'call', supportsRating: true },
    ],
  },
  {
    key: 'weather',
    label: 'Weather',
    icon: 'wb_twilight',
    items: [
      { key: 'heat', label: 'Heat', icon: 'thermostat', supportsRating: true, defaultVisible: true },
      { key: 'cold', label: 'Cold', icon: 'ac_unit', supportsRating: true },
      { key: 'rain', label: 'Rain', icon: 'rainy' },
      { key: 'pressure-change', label: 'Pressure Change', icon: 'compress' },
    ],
  },
  {
    key: 'personal-care',
    label: 'Personal Care',
    icon: 'health_and_beauty',
    items: [
      { key: 'shower', label: 'Shower', icon: 'shower' },
      { key: 'bath', label: 'Bath', icon: 'bathtub' },
      { key: 'skin-care', label: 'Skin Care', icon: 'face' },
      { key: 'compression', label: 'Compression Wear', icon: 'checkroom' },
    ],
  },
];

/**
 * QUICK_ENTRY_MEASUREMENTS defines the starter health metrics available from
 * the measurement add-picker.
 */
export const QUICK_ENTRY_MEASUREMENTS: QuickEntryMeasurementDefinition[] = [
  { key: 'heart-rate', label: 'Heart Rate', unit: 'bpm', icon: 'monitor_heart', defaultVisible: true },
  { key: 'step-count', label: 'Step Count', unit: 'steps', icon: 'steps', defaultVisible: true },
  { key: 'weight', label: 'Weight', unit: 'kg', icon: 'scale', defaultVisible: true },
  { key: 'blood-glucose', label: 'Blood Glucose', unit: 'mg/dL', icon: 'water_drop' },
  { key: 'blood-pressure-systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', icon: 'favorite' },
  { key: 'blood-pressure-diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', icon: 'favorite' },
  { key: 'body-temperature', label: 'Body Temperature', unit: 'C', icon: 'device_thermostat' },
  { key: 'heart-rate-variability', label: 'Heart Rate Variability', unit: 'ms', icon: 'multiline_chart' },
  { key: 'oxygen-saturation', label: 'Oxygen Saturation', unit: '%', icon: 'air' },
  { key: 'resting-heart-rate', label: 'Resting Heart Rate', unit: 'bpm', icon: 'favorite_border' },
];

/**
 * DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS keeps the first-load quick-entry screen
 * close to the supplied Bearable references.
 */
export const DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS = QUICK_ENTRY_FACTOR_CATEGORIES
  .filter((category) => category.defaultVisible)
  .map((category) => category.key);

/**
 * DEFAULT_VISIBLE_MEASUREMENT_KEYS keeps the first measurement card compact.
 */
export const DEFAULT_VISIBLE_MEASUREMENT_KEYS = QUICK_ENTRY_MEASUREMENTS
  .filter((metric) => metric.defaultVisible)
  .map((metric) => metric.key);

/**
 * getFactorCategory returns one curated category by key.
 */
export function getFactorCategory(
  categoryKey: QuickEntryFactorCategoryKey
): QuickEntryFactorCategoryDefinition | undefined {
  return QUICK_ENTRY_FACTOR_CATEGORIES.find((category) => category.key === categoryKey);
}

/**
 * getMeasurementDefinition returns one curated health metric by key.
 */
export function getMeasurementDefinition(
  metricKey: QuickEntryMeasurementKey
): QuickEntryMeasurementDefinition | undefined {
  return QUICK_ENTRY_MEASUREMENTS.find((metric) => metric.key === metricKey);
}

/**
 * buildQuickEntrySummary turns a structured save payload into one compact,
 * human-readable sentence for UI confirmations and optional future chat echoes.
 */
export function buildQuickEntrySummary(snapshot: QuickEntrySnapshot): string {
  const parts: string[] = [];

  if (snapshot.mood) {
    parts.push(`Mood ${snapshot.mood.rating}/10`);
  }

  if (snapshot.medications.length > 0) {
    parts.push(`${snapshot.medications.length} med ${snapshot.medications.length === 1 ? 'entry' : 'entries'}`);
  }

  if (snapshot.factors.length > 0) {
    parts.push(`${snapshot.factors.length} factor ${snapshot.factors.length === 1 ? 'log' : 'logs'}`);
  }

  if (snapshot.measurements.length > 0) {
    parts.push(`${snapshot.measurements.length} measurement ${snapshot.measurements.length === 1 ? 'entry' : 'entries'}`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Nothing selected yet';
}
