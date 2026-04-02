/**
 * log_symptom Tool
 *
 * Why this exists: Extracts and logs structured symptom data from user messages.
 * Writes to symptom_logs and timeline_entries. Includes 5-minute deduplication
 * to prevent duplicate logs when severity is added separately via the slider.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

/**
 * Maps tool input severity to DB: omit 0 and negatives so the model cannot
 * overwrite "unknown" with a false zero (graph/pipeline use null for unknown).
 */
function resolveStoredSeverity(severity: number | undefined): number | null {
  if (severity === undefined || severity === null) return null;
  if (severity <= 0) return null;
  if (severity > 10) return 10;
  return severity;
}

/**
 * Builds the deterministic slider payload used when symptom severity is missing.
 * Why this exists: Every symptom log should capture severity through the same UI
 * flow, without relying on the model to remember a second tool call.
 */
function buildSeveritySlider(symptomName: string) {
  return {
    interactive: true,
    type: 'severity-slider' as const,
    metric: symptomName,
    symptom: symptomName,
    prompt: `How intense is your ${symptomName.toLowerCase()} right now?`,
    initialValue: 5,
    labels: 'severity' as const,
  };
}

export const logSymptom = tool({
  description:
    'Log a symptom mentioned by the user. Call this whenever the user describes how they feel, reports pain, fatigue, or any health symptom.',
  inputSchema: z.object({
    symptomName: z.string().describe('Name of the symptom (e.g. "headache", "fatigue", "nausea")'),
    severity: z.number().min(0).max(10).optional().describe('Severity on 0-10 scale if mentioned'),
    notes: z.string().optional().describe('Additional context the user provided'),
  }),
  execute: async ({ symptomName, severity, notes }) => {
    const uid = getUid();
    const supabase = getSupabase();

    // Check for recent duplicate (same symptom within 5 minutes) to prevent double-logging
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentLog } = await supabase
      .from('symptom_logs')
      .select('id, severity')
      .eq('user_id', uid)
      .ilike('symptom_name', symptomName)
      .gte('logged_at', fiveMinAgo)
      .order('logged_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const storedSev = resolveStoredSeverity(severity);

    if (recentLog) {
      // Recent log exists - update with severity if provided and current severity is missing or zero
      const needsSeverityUpdate =
        storedSev !== null && (recentLog.severity === null || recentLog.severity === 0);
      
      if (needsSeverityUpdate) {
        await supabase
          .from('symptom_logs')
          .update({ severity: storedSev, notes: notes ?? undefined })
          .eq('id', recentLog.id);

        await supabase
          .from('timeline_entries')
          .update({ severity: storedSev, description: notes ?? undefined })
          .eq('user_id', uid)
          .ilike('title', symptomName)
          .gte('logged_at', fiveMinAgo);

        return {
          success: true,
          message: `Updated ${symptomName} to ${storedSev}/10.`,
          logId: recentLog.id,
          updated: true,
        };
      }

      // Already logged with valid severity - skip duplicate
      if (recentLog.severity !== null && recentLog.severity > 0) {
        return {
          success: true,
          message: `${symptomName} already logged at ${recentLog.severity}/10.`,
          logId: recentLog.id,
          skipped: true,
        };
      }

      // Logged without severity and no new severity provided - skip duplicate
      return {
        success: true,
        message: `${symptomName} already logged.`,
        logId: recentLog.id,
        skipped: true,
        ...buildSeveritySlider(symptomName),
      };
    }

    // No recent duplicate - create new entry
    const { data: symptomLog, error: logError } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: uid,
        symptom_name: symptomName,
        severity: storedSev,
        notes: notes ?? null,
      })
      .select('id')
      .single();

    if (logError) {
      console.error('[log_symptom] symptom_logs insert failed:', logError);
      return { success: false, message: `Failed to log symptom: ${logError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'symptom',
      title: symptomName,
      description: notes ?? null,
      severity: storedSev,
      status: 'current',
    });

    if (timelineError) {
      console.error('[log_symptom] timeline_entries insert failed:', timelineError);
    }

    const severityText = storedSev !== null ? ` at ${storedSev}/10` : '';
    return {
      success: true,
      message: `Logged ${symptomName}${severityText}.`,
      logId: symptomLog?.id,
      ...(storedSev === null ? buildSeveritySlider(symptomName) : {}),
    };
  },
});
