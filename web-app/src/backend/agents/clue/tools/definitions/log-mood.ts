/**
 * log_mood Tool
 *
 * Why this exists: Records user's mood rating on a 1-10 scale.
 * Writes to mood_logs and timeline_entries for emotional tracking.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

export const logMood = tool({
  description:
    'Log the user\'s mood or emotional state on a 1-10 scale. Call this when users share how they feel emotionally.',
  inputSchema: z.object({
    rating: z.number().min(1).max(10).describe('Mood rating 1-10'),
    note: z.string().optional().describe('Brief note about mood context'),
  }),
  execute: async ({ rating, note }) => {
    const supabase = getSupabase();
    const uid = getUid();

    const { error: moodError } = await supabase.from('mood_logs').insert({
      user_id: uid,
      rating,
      note: note ?? null,
    });

    if (moodError) {
      console.error('[log_mood] insert failed:', moodError);
      return { success: false, message: `Failed to log mood: ${moodError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'note',
      title: `Mood: ${rating}/10`,
      description: note ?? null,
    });

    if (timelineError) {
      console.error('[log_mood] timeline insert failed:', timelineError);
    }

    return {
      success: true,
      message: `Logged mood at ${rating}/10.`,
    };
  },
});
