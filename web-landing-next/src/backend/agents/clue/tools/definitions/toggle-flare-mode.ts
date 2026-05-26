/**
 * toggle_flare_mode Tool
 *
 * Why this exists: Toggles flare mode on/off, changing the agent's behavior to
 * minimize cognitive load on the user during high-symptom periods.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

export const toggleFlareMode = tool({
  description:
    'Toggle flare mode on or off. Call this when the user indicates they are having a flare, crash, or very bad day, OR when they say they are feeling better and want to exit flare mode.',
  inputSchema: z.object({
    activate: z.boolean().describe('True to activate flare mode, false to deactivate'),
  }),
  execute: async ({ activate }) => {
    const supabase = getSupabase();
    const uid = getUid();

    await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: uid,
          flare_mode: activate,
          energy_state: activate ? 'flare' : 'normal',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    return {
      success: true,
      flareMode: activate,
      message: activate
        ? 'Flare mode activated. I\'ll keep things minimal.'
        : 'Flare mode deactivated. Welcome back.',
    };
  },
});
