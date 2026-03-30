/**
 * get_timeline Tool
 *
 * Why this exists: Fetches timeline entries for a given date or date range.
 * Reads from timeline_entries table to show user's health history.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

export const getTimeline = tool({
  description:
    'Get the user\'s timeline entries for a specific date or recent period. Call this when users ask about their history or what happened on a given day.',
  inputSchema: z.object({
    date: z.string().optional().describe('Specific date in YYYY-MM-DD format. Defaults to today.'),
    daysBack: z.number().optional().describe('Number of days to look back. Defaults to 1 (today only).'),
  }),
  execute: async ({ date, daysBack }) => {
    const supabase = getSupabase();
    const uid = getUid();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const lookBack = daysBack || 1;

    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - (lookBack - 1));

    const { data: entries } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('user_id', uid)
      .gte('entry_time', startDate.toISOString())
      .lte('entry_time', new Date(targetDate + 'T23:59:59').toISOString())
      .order('entry_time', { ascending: true });

    if (!entries || entries.length === 0) {
      return {
        entries: [],
        message: `No entries found for ${lookBack === 1 ? targetDate : `the last ${lookBack} days`}.`,
      };
    }

    return {
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        time: new Date(e.entry_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        status: e.status,
        severity: e.severity,
        dosage: e.dosage,
        duration: e.duration,
      })),
      message: `Found ${entries.length} entries.`,
    };
  },
});
