/**
 * Quick entry persistence helpers.
 *
 * Why this exists: The quick-entry tab and any future structured chat widgets
 * should write through one deterministic server-side path instead of relying on
 * natural-language chat turns for structured logging.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { executeInsightAgent } from '@/backend/langgraph';
import { upsertGraphNode } from '@/backend/lib/graph';
import { canonicalizeMedicationName } from '@/backend/lib/openmed/client';
import type {
  QuickEntryFactorDraft,
  QuickEntryMeasurementDraft,
  QuickEntryMedicationDraft,
  QuickEntrySavedMedication,
  QuickEntryMoodDraft,
  QuickEntrySnapshot,
} from '@/lib/quick-entry';
import { toQuickEntrySavedMedication } from '@/lib/quick-entry';

/**
 * QuickEntrySource tracks where a structured save originated so edits can
 * replace only the matching rows for that surface.
 */
export type QuickEntrySource = 'quick_entry' | 'chat_widget';

/**
 * DbTimelineEntryRow is the minimal row shape used to rehydrate the quick-entry
 * UI from timeline-linked tables.
 */
interface DbTimelineEntryRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  severity: number | null;
  dosage: string | null;
  logged_at: string;
  entry_time: string;
}

/**
 * getSupabase creates the privileged client required for deterministic quick-
 * entry writes and graph updates.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * isMissingColumnError detects schema-cache misses for not-yet-applied columns.
 */
function isMissingColumnError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  return (
    (normalizedMessage.includes('could not find') && normalizedMessage.includes('column')) ||
    (normalizedMessage.includes('column') && normalizedMessage.includes('does not exist'))
  );
}

/**
 * isMissingRelationError detects writes against tables that do not exist yet in
 * the local or remote database.
 */
function isMissingRelationError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  return (
    (normalizedMessage.includes('relation') && normalizedMessage.includes('does not exist')) ||
    (normalizedMessage.includes('could not find the table') && normalizedMessage.includes('schema cache'))
  );
}

/**
 * isTimelineTypeError detects timeline check-constraint failures so the helper
 * can fall back to legacy entry types before the new migration is applied.
 */
function isTimelineTypeError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('timeline_entries_type_check') || normalizedMessage.includes('violates check constraint');
}

/**
 * getDayBounds converts an ISO date string into an inclusive UTC range used to
 * scope per-day quick-entry replacements.
 */
function getDayBounds(targetDate?: string): { start: string; end: string } {
  const baseDate = targetDate ? new Date(`${targetDate}T12:00:00.000Z`) : new Date();
  const startDate = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), 23, 59, 59, 999));

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

/**
 * buildMoodTimestamp combines the selected quick-entry day with the optional
 * mood time so the saved log can reflect when the user says the mood applied.
 */
function buildMoodTimestamp(mood: QuickEntryMoodDraft, targetDate?: string): string | undefined {
  if (!mood.time) {
    return undefined;
  }

  const baseDate = targetDate ? new Date(`${targetDate}T12:00:00.000Z`) : new Date();
  const [hoursString, minutesString] = mood.time.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return undefined;
  }

  const timestamp = new Date(baseDate);
  timestamp.setHours(hours, minutes, 0, 0);
  return timestamp.toISOString();
}

/**
 * buildMoodTimelineDescription keeps mood timeline rows expressive without
 * forcing the user to open the raw log row.
 */
function buildMoodTimelineDescription(mood: QuickEntryMoodDraft): string | null {
  return mood.note?.trim() ? mood.note.trim() : null;
}

/**
 * buildMedicationTimelineDescription turns a med draft into a concise timeline
 * description that reads well in the day view.
 */
function buildMedicationTimelineDescription(medication: QuickEntryMedicationDraft): string {
  if (!medication.taken) {
    return medication.notes?.trim() ? `Skipped · ${medication.notes.trim()}` : 'Skipped';
  }

  const parts = ['Taken'];
  if (medication.dosage?.trim()) {
    parts.push(medication.dosage.trim());
  }
  if (medication.timing?.trim()) {
    parts.push(medication.timing.trim());
  }
  if (medication.notes?.trim()) {
    parts.push(medication.notes.trim());
  }

  return parts.join(' · ');
}

/**
 * buildFactorTimelineDescription keeps factor entries readable while preserving
 * intensity when the user rated an item.
 */
function buildFactorTimelineDescription(factor: QuickEntryFactorDraft): string {
  const parts = [factor.categoryLabel];

  if (typeof factor.rating === 'number' && typeof factor.scaleMax === 'number') {
    parts.push(`${factor.rating}/${factor.scaleMax}`);
  }

  if (factor.notes?.trim()) {
    parts.push(factor.notes.trim());
  }

  return parts.join(' · ');
}

/**
 * buildMeasurementTimelineDescription gives measurements a compact subtitle in
 * the timeline and keeps their value visible even on smaller cards.
 */
function buildMeasurementTimelineDescription(measurement: QuickEntryMeasurementDraft): string {
  const parts = [`${measurement.value} ${measurement.unit}`];

  if (measurement.notes?.trim()) {
    parts.push(measurement.notes.trim());
  }

  return parts.join(' · ');
}

/**
 * replaceExistingStructuredRows removes only previously saved rows from the
 * same structured surface and date so resaving the quick-entry tab behaves like
 * editing the day's snapshot instead of duplicating it.
 */
async function replaceExistingStructuredRows(params: {
  supabase: SupabaseClient;
  userId: string;
  source: QuickEntrySource;
  start: string;
  end: string;
}): Promise<void> {
  const { supabase, userId, source, start, end } = params;

  const deleteResults = await Promise.allSettled([
    supabase
      .from('mood_logs')
      .delete()
      .eq('user_id', userId)
      .eq('source', source)
      .gte('logged_at', start)
      .lte('logged_at', end),
    supabase
      .from('medication_logs')
      .delete()
      .eq('user_id', userId)
      .eq('source', source)
      .gte('logged_at', start)
      .lte('logged_at', end),
    supabase
      .from('factor_logs')
      .delete()
      .eq('user_id', userId)
      .eq('source', source)
      .gte('logged_at', start)
      .lte('logged_at', end),
    supabase
      .from('health_measurement_logs')
      .delete()
      .eq('user_id', userId)
      .eq('source', source)
      .gte('logged_at', start)
      .lte('logged_at', end),
    supabase
      .from('timeline_entries')
      .delete()
      .eq('user_id', userId)
      .eq('source', source)
      .gte('entry_time', start)
      .lte('entry_time', end),
  ]);

  for (const result of deleteResults) {
    if (result.status !== 'fulfilled' || !result.value.error) {
      continue;
    }

    const message = result.value.error.message;
    if (isMissingColumnError(message) || isMissingRelationError(message)) {
      continue;
    }

    throw new Error(message);
  }
}

/**
 * saveMood persists the mood card into both its source table and the shared
 * timeline, then keeps the graph's mood factor node warm for the canvas.
 */
async function saveMood(params: {
  supabase: SupabaseClient;
  userId: string;
  mood: QuickEntryMoodDraft;
  source: QuickEntrySource;
  targetDate?: string;
}): Promise<void> {
  const { supabase, userId, mood, source, targetDate } = params;
  const moodTimestamp = buildMoodTimestamp(mood, targetDate);

  const { error: moodError } = await supabase.from('mood_logs').insert({
    user_id: userId,
    rating: mood.rating,
    note: mood.note?.trim() || null,
    logged_at: moodTimestamp,
    source,
  });

  if (moodError && isMissingColumnError(moodError.message)) {
    const { error: fallbackMoodError } = await supabase.from('mood_logs').insert({
      user_id: userId,
      rating: mood.rating,
      note: mood.note?.trim() || null,
      logged_at: moodTimestamp,
    });

    if (fallbackMoodError) {
      throw new Error(`Failed to save mood log: ${fallbackMoodError.message}`);
    }
  } else if (moodError) {
    throw new Error(`Failed to save mood log: ${moodError.message}`);
  }

  let { error: timelineError } = await supabase.from('timeline_entries').insert({
    user_id: userId,
    type: 'mood',
    title: `Mood ${mood.rating}/10`,
    description: buildMoodTimelineDescription(mood),
    entry_time: moodTimestamp,
    source,
  });

  if (timelineError && isMissingColumnError(timelineError.message)) {
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: 'mood',
      title: `Mood ${mood.rating}/10`,
      description: buildMoodTimelineDescription(mood),
      entry_time: moodTimestamp,
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError) {
    throw new Error(`Failed to save mood timeline entry: ${timelineError.message}`);
  }

  await upsertGraphNode(userId, {
    type: 'factor',
    name: 'Mood',
    subLabel: `Latest ${mood.rating}/10`,
    data: {
      latestRating: mood.rating,
      latestNote: mood.note?.trim() || null,
      latestSource: source,
    },
  });
}

/**
 * saveMedication persists one med row and refreshes the corresponding graph
 * medication node so the canvas stays aligned with quick-entry logging.
 */
async function saveMedication(params: {
  supabase: SupabaseClient;
  userId: string;
  medication: QuickEntryMedicationDraft;
  source: QuickEntrySource;
}): Promise<void> {
  const { supabase, userId, medication, source } = params;
  const canonicalMedicationName = canonicalizeMedicationName(medication.medicationName);

  const { error: medicationError } = await supabase.from('medication_logs').insert({
    user_id: userId,
    med_name: canonicalMedicationName,
    dosage: medication.dosage?.trim() || null,
    taken: medication.taken,
    timing: medication.timing?.trim() || null,
    notes: medication.notes?.trim() || null,
    source,
  });

  if (medicationError && isMissingColumnError(medicationError.message)) {
    const { error: fallbackMedicationError } = await supabase.from('medication_logs').insert({
      user_id: userId,
      med_name: canonicalMedicationName,
      dosage: medication.dosage?.trim() || null,
      taken: medication.taken,
      timing: medication.timing?.trim() || null,
      notes: medication.notes?.trim() || null,
    });

    if (fallbackMedicationError) {
      throw new Error(`Failed to save medication log: ${fallbackMedicationError.message}`);
    }
  } else if (medicationError) {
    throw new Error(`Failed to save medication log: ${medicationError.message}`);
  }

  let { error: timelineError } = await supabase.from('timeline_entries').insert({
    user_id: userId,
    type: 'medication',
    title: canonicalMedicationName,
    description: buildMedicationTimelineDescription(medication),
    dosage: medication.dosage?.trim() || null,
    status: medication.taken ? 'current' : 'issue',
    source,
  });

  if (timelineError && isMissingColumnError(timelineError.message)) {
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: 'medication',
      title: canonicalMedicationName,
      description: buildMedicationTimelineDescription(medication),
      dosage: medication.dosage?.trim() || null,
      status: medication.taken ? 'current' : 'issue',
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError) {
    throw new Error(`Failed to save medication timeline entry: ${timelineError.message}`);
  }

  await upsertGraphNode(userId, {
    type: 'medication',
    name: canonicalMedicationName,
    subLabel: medication.dosage?.trim() || (medication.taken ? 'Taken today' : 'Skipped today'),
    data: {
      latestDosage: medication.dosage?.trim() || null,
      latestTiming: medication.timing?.trim() || null,
      latestTaken: medication.taken,
      latestSource: source,
    },
  });
}

/**
 * saveFactor stores a factor row, mirrors it into the timeline, and directly
 * updates the factor node used by the graph canvas.
 */
async function saveFactor(params: {
  supabase: SupabaseClient;
  userId: string;
  factor: QuickEntryFactorDraft;
  source: QuickEntrySource;
}): Promise<void> {
  const { supabase, userId, factor, source } = params;

  const { error: factorError } = await supabase.from('factor_logs').insert({
    user_id: userId,
    category_key: factor.categoryKey,
    category_label: factor.categoryLabel,
    factor_key: factor.factorKey,
    factor_name: factor.factorName,
    rating: typeof factor.rating === 'number' ? factor.rating : null,
    scale_max: typeof factor.scaleMax === 'number' ? factor.scaleMax : null,
    notes: factor.notes?.trim() || null,
    source,
  });

  if (factorError && !isMissingRelationError(factorError.message)) {
    throw new Error(`Failed to save factor log: ${factorError.message}`);
  }

  let { error: timelineError } = await supabase.from('timeline_entries').insert({
    user_id: userId,
    type: 'factor',
    title: factor.factorName,
    description: buildFactorTimelineDescription(factor),
    severity: typeof factor.scaleMax === 'number' && factor.scaleMax === 10 ? factor.rating ?? null : null,
    status: 'current',
    source,
  });

  if (timelineError && isMissingColumnError(timelineError.message)) {
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: 'factor',
      title: factor.factorName,
      description: buildFactorTimelineDescription(factor),
      severity: typeof factor.scaleMax === 'number' && factor.scaleMax === 10 ? factor.rating ?? null : null,
      status: 'current',
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError && isTimelineTypeError(timelineError.message)) {
    const legacyType = factor.categoryKey === 'sleep' ? 'note' : 'note';
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: legacyType,
      title: factor.factorName,
      description: buildFactorTimelineDescription(factor),
      severity: typeof factor.scaleMax === 'number' && factor.scaleMax === 10 ? factor.rating ?? null : null,
      status: 'current',
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError) {
    throw new Error(`Failed to save factor timeline entry: ${timelineError.message}`);
  }

  const subLabel =
    typeof factor.rating === 'number' && typeof factor.scaleMax === 'number'
      ? `${factor.categoryLabel} · ${factor.rating}/${factor.scaleMax}`
      : factor.categoryLabel;

  await upsertGraphNode(userId, {
    type: 'factor',
    name: factor.factorName,
    subLabel,
    data: {
      categoryKey: factor.categoryKey,
      categoryLabel: factor.categoryLabel,
      latestRating: factor.rating ?? null,
      scaleMax: factor.scaleMax ?? null,
      latestNotes: factor.notes?.trim() || null,
      latestSource: source,
    },
  });
}

/**
 * saveMeasurement writes one health metric and mirrors it into the timeline.
 * Measurements stay timeline-first for now because the graph schema has no
 * dedicated measurement node type.
 */
async function saveMeasurement(params: {
  supabase: SupabaseClient;
  userId: string;
  measurement: QuickEntryMeasurementDraft;
  source: QuickEntrySource;
}): Promise<void> {
  const { supabase, userId, measurement, source } = params;

  const { error: measurementError } = await supabase.from('health_measurement_logs').insert({
    user_id: userId,
    metric_key: measurement.metricKey,
    metric_name: measurement.metricName,
    unit: measurement.unit,
    value_numeric: measurement.value,
    notes: measurement.notes?.trim() || null,
    source,
  });

  if (measurementError && !isMissingRelationError(measurementError.message)) {
    throw new Error(`Failed to save measurement log: ${measurementError.message}`);
  }

  let { error: timelineError } = await supabase.from('timeline_entries').insert({
    user_id: userId,
    type: 'measurement',
    title: measurement.metricName,
    description: buildMeasurementTimelineDescription(measurement),
    source,
  });

  if (timelineError && isMissingColumnError(timelineError.message)) {
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: 'measurement',
      title: measurement.metricName,
      description: buildMeasurementTimelineDescription(measurement),
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError && isTimelineTypeError(timelineError.message)) {
    const fallbackResult = await supabase.from('timeline_entries').insert({
      user_id: userId,
      type: 'test',
      title: measurement.metricName,
      description: buildMeasurementTimelineDescription(measurement),
    });
    timelineError = fallbackResult.error;
  }

  if (timelineError) {
    throw new Error(`Failed to save measurement timeline entry: ${timelineError.message}`);
  }
}

/**
 * saveQuickEntrySnapshot persists a full quick-entry screen state and replaces
 * older rows saved from the same structured surface on that day.
 */
export async function saveQuickEntrySnapshot(params: {
  userId: string;
  snapshot: QuickEntrySnapshot;
  targetDate?: string;
  source?: QuickEntrySource;
}): Promise<void> {
  const { userId, snapshot, targetDate, source = 'quick_entry' } = params;
  const supabase = getSupabase();
  const { start, end } = getDayBounds(targetDate);

  await replaceExistingStructuredRows({
    supabase,
    userId,
    source,
    start,
    end,
  });

  if (snapshot.mood) {
    await saveMood({ supabase, userId, mood: snapshot.mood, source, targetDate });
  }

  for (const medication of snapshot.medications) {
    await saveMedication({ supabase, userId, medication, source });
  }

  for (const factor of snapshot.factors) {
    await saveFactor({ supabase, userId, factor, source });
  }

  for (const measurement of snapshot.measurements) {
    await saveMeasurement({ supabase, userId, measurement, source });
  }

  try {
    await executeInsightAgent({ userId });
  } catch (error) {
    console.warn('[quick-entry] Insight refresh failed:', error);
  }
}

/**
 * getLatestMoodForDay rehydrates the most recent saved mood for the chosen day.
 */
async function getLatestMoodForDay(params: {
  supabase: SupabaseClient;
  userId: string;
  start: string;
  end: string;
}): Promise<QuickEntryMoodDraft | null> {
  const { supabase, userId, start, end } = params;
  const { data, error } = await supabase
    .from('mood_logs')
    .select('rating, note, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    rating: data.rating,
    time: typeof data.logged_at === 'string' ? data.logged_at.slice(11, 16) : undefined,
    note: data.note ?? undefined,
  };
}

/**
 * getMedicationsForDay rebuilds the medication card rows from structured logs.
 */
async function getMedicationsForDay(params: {
  supabase: SupabaseClient;
  userId: string;
  start: string;
  end: string;
}): Promise<QuickEntryMedicationDraft[]> {
  const { supabase, userId, start, end } = params;
  const { data, error } = await supabase
    .from('medication_logs')
    .select('id, med_name, dosage, taken, timing, notes')
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    medicationName: row.med_name,
    dosage: row.dosage ?? undefined,
    taken: row.taken ?? true,
    timing: row.timing ?? undefined,
    notes: row.notes ?? undefined,
  }));
}

/**
 * getSavedMedicationsForUser rebuilds reusable medication shortcuts from the
 * user's historical medication logs so quick entry can surface one-tap add rows.
 */
export async function getSavedMedicationsForUser(params: {
  userId: string;
}): Promise<QuickEntrySavedMedication[]> {
  const { userId } = params;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('medication_logs')
    .select('med_name, dosage, timing, notes, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(250);

  if (error || !data) {
    return [];
  }

  const seenMedicationIds = new Set<string>();
  const savedMedications: QuickEntrySavedMedication[] = [];

  for (const row of data) {
    const medication = toQuickEntrySavedMedication({
      medicationName: row.med_name,
      dosage: row.dosage ?? undefined,
      timing: row.timing ?? undefined,
      notes: row.notes ?? undefined,
    });

    if (seenMedicationIds.has(medication.id)) {
      continue;
    }

    seenMedicationIds.add(medication.id);
    savedMedications.push(medication);
  }

  return savedMedications;
}

/**
 * getFactorsForDay rebuilds selected factor and sleep rows for the chosen day.
 */
async function getFactorsForDay(params: {
  supabase: SupabaseClient;
  userId: string;
  start: string;
  end: string;
}): Promise<QuickEntryFactorDraft[]> {
  const { supabase, userId, start, end } = params;
  const { data, error } = await supabase
    .from('factor_logs')
    .select('id, category_key, category_label, factor_key, factor_name, rating, scale_max, notes')
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    categoryKey: row.category_key,
    categoryLabel: row.category_label,
    factorKey: row.factor_key,
    factorName: row.factor_name,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    scaleMax: typeof row.scale_max === 'number' ? row.scale_max : undefined,
    notes: row.notes ?? undefined,
  })) as QuickEntryFactorDraft[];
}

/**
 * getMeasurementsForDay rebuilds the selected health metrics for the day.
 */
async function getMeasurementsForDay(params: {
  supabase: SupabaseClient;
  userId: string;
  start: string;
  end: string;
}): Promise<QuickEntryMeasurementDraft[]> {
  const { supabase, userId, start, end } = params;
  const { data, error } = await supabase
    .from('health_measurement_logs')
    .select('id, metric_key, metric_name, unit, value_numeric, notes')
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    metricKey: row.metric_key,
    metricName: row.metric_name,
    unit: row.unit,
    value: row.value_numeric,
    notes: row.notes ?? undefined,
  })) as QuickEntryMeasurementDraft[];
}

/**
 * getQuickEntrySnapshot returns the saved structured state for a given day so
 * the quick-entry UI survives reloads and editing sessions.
 */
export async function getQuickEntrySnapshot(params: {
  userId: string;
  targetDate?: string;
}): Promise<QuickEntrySnapshot> {
  const { userId, targetDate } = params;
  const supabase = getSupabase();
  const { start, end } = getDayBounds(targetDate);

  const [mood, medications, factors, measurements] = await Promise.all([
    getLatestMoodForDay({ supabase, userId, start, end }),
    getMedicationsForDay({ supabase, userId, start, end }),
    getFactorsForDay({ supabase, userId, start, end }),
    getMeasurementsForDay({ supabase, userId, start, end }),
  ]);

  return {
    mood,
    medications,
    factors,
    measurements,
  };
}

/**
 * getTimelineSourceRows surfaces the quick-entry-specific timeline slice used
 * in focused verification and future debug tooling.
 */
export async function getTimelineSourceRows(params: {
  userId: string;
  targetDate?: string;
}): Promise<DbTimelineEntryRow[]> {
  const { userId, targetDate } = params;
  const supabase = getSupabase();
  const { start, end } = getDayBounds(targetDate);
  const { data } = await supabase
    .from('timeline_entries')
    .select('id, type, title, description, severity, dosage, logged_at, entry_time')
    .eq('user_id', userId)
    .gte('entry_time', start)
    .lte('entry_time', end)
    .order('entry_time', { ascending: true });

  return (data ?? []) as DbTimelineEntryRow[];
}
