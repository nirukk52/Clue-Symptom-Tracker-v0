/**
 * open_quick_entry_card Tool
 *
 * Why this exists: Gives Clue a deterministic way to request the structured
 * Bearable-style quick-entry widgets instead of relying on freeform follow-up
 * phrasing for mood, sleep, factors, measurements, or medication logging.
 */

import { tool } from 'ai';
import { z } from 'zod';

export const openQuickEntryCard = tool({
  description:
    'Open one structured quick-entry card inside chat. Use this when the user explicitly wants to log mood, medications, sleep factors, other factors/triggers, or health measurements through UI instead of typing freeform details.',
  inputSchema: z.object({
    entryKind: z.enum(['mood', 'medication', 'sleep', 'factor', 'measurement']),
    prompt: z.string().optional().describe('Optional short prompt shown above the structured widget.'),
  }),
  execute: async ({ entryKind, prompt }) => {
    return {
      interactive: true,
      type: 'quick-entry-card' as const,
      entryKind,
      prompt:
        prompt ||
        (entryKind === 'mood'
          ? 'Log today’s mood using the card below.'
          : entryKind === 'medication'
            ? 'Use the medication card below to record what you took or skipped.'
            : entryKind === 'sleep'
              ? 'Log sleep quality or sleep factors using the card below.'
              : entryKind === 'factor'
                ? 'Use the factor card below to log likely triggers or supports.'
                : 'Use the measurement card below to log the metric you have handy.'),
    };
  },
});
