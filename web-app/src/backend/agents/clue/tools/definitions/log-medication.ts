/**
 * log_medication Tool
 *
 * Why this exists: Records medication intake or changes from user messages.
 * Writes to medication_logs and timeline_entries for tracking adherence.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { canonicalizeMedicationName } from '@/backend/lib/openmed/client';
import { getSupabase, getUid } from '../utils';

export const logMedication = tool({
  description:
    'Log a medication the user mentions taking, skipping, or changing. Call this when users discuss their meds.',
  inputSchema: z.object({
    medName: z.string().describe('Medication name'),
    dosage: z.string().optional().describe('Dosage if mentioned (e.g. "150mg")'),
    taken: z.boolean().describe('Whether the medication was taken'),
    timing: z.string().optional().describe('When it was taken (e.g. "morning", "8am")'),
    notes: z.string().optional().describe('Additional context'),
  }),
  execute: async ({ medName, dosage, taken, timing, notes }) => {
    const supabase = getSupabase();
    const uid = getUid();
    const canonicalMedicationName = canonicalizeMedicationName(medName);

    const { error: medError } = await supabase.from('medication_logs').insert({
      user_id: uid,
      med_name: canonicalMedicationName,
      dosage: dosage ?? null,
      taken,
      timing: timing ?? null,
      notes: notes ?? null,
    });

    if (medError) {
      console.error('[log_medication] insert failed:', medError);
      return { success: false, message: `Failed to log medication: ${medError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'medication',
      title: canonicalMedicationName,
      description: taken ? `Taken${dosage ? ` - ${dosage}` : ''}` : 'Skipped',
      dosage: dosage ?? null,
      status: taken ? 'current' : 'issue',
    });

    if (timelineError) {
      console.error('[log_medication] timeline insert failed:', timelineError);
    }

    const statusText = taken ? 'Logged' : 'Noted as skipped';
    return {
      success: true,
      message: `${statusText}: ${canonicalMedicationName}${dosage ? ` (${dosage})` : ''}.`,
    };
  },
});
