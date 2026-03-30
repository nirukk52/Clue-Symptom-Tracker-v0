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

    if (recentLog) {
      // Recent log exists - update with severity if provided and current severity is missing or zero
      const needsSeverityUpdate = severity !== undefined && 
        severity > 0 && 
        (recentLog.severity === null || recentLog.severity === 0);
      
      if (needsSeverityUpdate) {
        await supabase
          .from('symptom_logs')
          .update({ severity, notes: notes ?? undefined })
          .eq('id', recentLog.id);

        await supabase
          .from('timeline_entries')
          .update({ severity, description: notes ?? undefined })
          .eq('user_id', uid)
          .ilike('title', symptomName)
          .gte('logged_at', fiveMinAgo);

        return {
          success: true,
          message: `Updated ${symptomName} to ${severity}/10.`,
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
      };
    }

    // No recent duplicate - create new entry
    const { data: symptomLog, error: logError } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: uid,
        symptom_name: symptomName,
        severity: severity ?? null,
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
      severity: severity ?? null,
      status: 'current',
    });

    if (timelineError) {
      console.error('[log_symptom] timeline_entries insert failed:', timelineError);
    }

    const severityText = severity !== undefined ? ` at ${severity}/10` : '';
    return {
      success: true,
      message: `Logged ${symptomName}${severityText}.`,
      logId: symptomLog?.id,
    };
  },
});
