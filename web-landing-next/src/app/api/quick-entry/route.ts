/**
 * Quick entry API route.
 *
 * Why this exists: Structured quick-entry saves should bypass freeform chat so
 * the UI, persistence, and future chat widgets share one deterministic contract.
 */

import { z } from 'zod';

import {
  getQuickEntrySnapshot,
  getSavedMedicationsForUser,
  saveQuickEntrySnapshot,
  type QuickEntrySource,
} from '@/backend/lib/quick-entry';
import type { QuickEntrySnapshot } from '@/lib/quick-entry';

/**
 * moodDraftSchema validates the optional mood card payload.
 */
const moodDraftSchema = z.object({
  rating: z.number().int().min(1).max(10),
  note: z.string().max(200).optional(),
});

/**
 * medicationDraftSchema validates one medication card row.
 */
const medicationDraftSchema = z.object({
  id: z.string(),
  medicationName: z.string().min(1).max(120),
  dosage: z.string().max(80).optional(),
  taken: z.boolean(),
  timing: z.string().max(80).optional(),
  notes: z.string().max(200).optional(),
});

/**
 * factorDraftSchema validates one selected factor or sleep row.
 */
const factorDraftSchema = z.object({
  id: z.string(),
  categoryKey: z.string().min(1).max(80),
  categoryLabel: z.string().min(1).max(120),
  factorKey: z.string().min(1).max(80),
  factorName: z.string().min(1).max(120),
  rating: z.number().int().min(0).max(10).optional(),
  scaleMax: z.number().int().refine((value) => value === 3 || value === 10).optional(),
  notes: z.string().max(200).optional(),
});

/**
 * measurementDraftSchema validates one entered health metric.
 */
const measurementDraftSchema = z.object({
  id: z.string(),
  metricKey: z.string().min(1).max(80),
  metricName: z.string().min(1).max(120),
  unit: z.string().min(1).max(20),
  value: z.number().finite(),
  notes: z.string().max(200).optional(),
});

/**
 * quickEntrySnapshotSchema validates the full structured quick-entry document.
 */
const quickEntrySnapshotSchema = z.object({
  mood: moodDraftSchema.nullable(),
  medications: z.array(medicationDraftSchema),
  factors: z.array(factorDraftSchema),
  measurements: z.array(measurementDraftSchema),
});

/**
 * quickEntrySaveSchema validates POST saves for the quick-entry contract.
 */
const quickEntrySaveSchema = z.object({
  userId: z.string().min(1),
  targetDate: z.string().optional(),
  source: z.enum(['quick_entry', 'chat_widget']).optional(),
  snapshot: quickEntrySnapshotSchema,
});

/**
 * GET returns the current structured quick-entry snapshot for one day.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const targetDate = url.searchParams.get('date') ?? undefined;

  if (!userId) {
    return Response.json({ error: 'Missing userId parameter.' }, { status: 400 });
  }

  try {
    const [snapshot, savedMedications] = await Promise.all([
      getQuickEntrySnapshot({ userId, targetDate }),
      getSavedMedicationsForUser({ userId }),
    ]);
    return Response.json({ snapshot, savedMedications });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load quick entry snapshot.';
    console.error('[api/quick-entry] GET failed:', error);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * POST saves a structured quick-entry snapshot and replaces same-source rows
 * for that day so the screen behaves like an editor instead of an append-only
 * chat shortcut.
 */
export async function POST(req: Request) {
  try {
    const body = quickEntrySaveSchema.parse(await req.json());
    await saveQuickEntrySnapshot({
      userId: body.userId,
      targetDate: body.targetDate,
      source: body.source as QuickEntrySource | undefined,
      snapshot: body.snapshot as QuickEntrySnapshot,
    });

    const [snapshot, savedMedications] = await Promise.all([
      getQuickEntrySnapshot({
        userId: body.userId,
        targetDate: body.targetDate,
      }),
      getSavedMedicationsForUser({ userId: body.userId }),
    ]);

    return Response.json({ success: true, snapshot, savedMedications });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'Invalid quick entry payload.',
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to save quick entry snapshot.';
    console.error('[api/quick-entry] POST failed:', error);
    return Response.json({ error: message }, { status: 500 });
  }
}
