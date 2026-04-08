'use client';

import { useMemo, useState } from 'react';

import type { QuickEntrySnapshot } from '@/lib/quick-entry';

import {
  FactorsEntryCard,
  MeasurementsEntryCard,
  MedicationEntryCard,
  MoodEntryCard,
  SleepEntryCard,
} from './QuickEntryCards';

interface QuickEntryChatCardProps {
  entryKind: 'mood' | 'medication' | 'sleep' | 'factor' | 'measurement';
  prompt?: string;
  disabled?: boolean;
  onSubmit: (snapshot: QuickEntrySnapshot) => Promise<void> | void;
}

/**
 * QuickEntryChatCard reuses the same structured quick-entry cards inside the
 * chat stream so Clue can ask for a deterministic UI instead of freeform text.
 */
export function QuickEntryChatCard({
  entryKind,
  prompt,
  disabled = false,
  onSubmit,
}: QuickEntryChatCardProps) {
  const [snapshot, setSnapshot] = useState<QuickEntrySnapshot>({
    mood: null,
    medications: [],
    factors: [],
    measurements: [],
  });
  const [visibleCategoryKeys, setVisibleCategoryKeys] = useState<string[]>(['lifestyle', 'behavioural-patterns']);
  const [visibleMeasurementKeys, setVisibleMeasurementKeys] = useState<string[]>(['heart-rate', 'weight', 'step-count']);
  const [visibleSleepItemKeys, setVisibleSleepItemKeys] = useState<string[]>(['sleep-quality', 'early-bedtime', 'late-bedtime', 'time-in-bed']);
  const [visibleFactorItemKeysByCategory, setVisibleFactorItemKeysByCategory] = useState<Partial<Record<string, string[]>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * hasInput keeps the inline submit button disabled until the user actually
   * filled the widget Clue asked them to use.
   */
  const hasInput = useMemo(() => {
    switch (entryKind) {
      case 'mood':
        return Boolean(snapshot.mood);
      case 'medication':
        return snapshot.medications.length > 0;
      case 'sleep':
        return snapshot.factors.some((factor) => factor.categoryKey === 'sleep');
      case 'factor':
        return snapshot.factors.some((factor) => factor.categoryKey !== 'sleep');
      case 'measurement':
        return snapshot.measurements.length > 0;
    }
  }, [entryKind, snapshot]);

  /**
   * handleSubmit persists the inline widget payload through the shared quick-
   * entry API contract and lets the parent mark the chat interactive complete.
   */
  async function handleSubmit() {
    if (!hasInput || disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(snapshot);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[92%] space-y-3 rounded-[28px] border border-primary/10 bg-white/85 p-3 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      {prompt ? <p className="px-1 text-[13px] leading-relaxed text-text-muted">{prompt}</p> : null}

      {entryKind === 'mood' ? (
        <MoodEntryCard
          mood={snapshot.mood}
          onChange={(mood) => setSnapshot((current) => ({ ...current, mood }))}
        />
      ) : null}

      {entryKind === 'medication' ? (
        <MedicationEntryCard
          medications={snapshot.medications}
          onUpsert={(medication) =>
            setSnapshot((current) => ({
              ...current,
              medications: current.medications.some((existingMedication) => existingMedication.id === medication.id)
                ? current.medications.map((existingMedication) =>
                    existingMedication.id === medication.id ? medication : existingMedication
                  )
                : [...current.medications, medication],
            }))
          }
          onRemove={(medicationId) =>
            setSnapshot((current) => ({
              ...current,
              medications: current.medications.filter((medication) => medication.id !== medicationId),
            }))
          }
        />
      ) : null}

      {entryKind === 'sleep' ? (
        <SleepEntryCard
          sleepFactors={snapshot.factors.filter((factor) => factor.categoryKey === 'sleep')}
          visibleSleepItemKeys={visibleSleepItemKeys}
          onToggleSleepItemVisibility={(factorKey) =>
            setVisibleSleepItemKeys((current) =>
              current.includes(factorKey)
                ? current.filter((item) => item !== factorKey)
                : [...current, factorKey]
            )
          }
          onUpsertFactor={(factor) =>
            setSnapshot((current) => ({
              ...current,
              factors: current.factors.some((existingFactor) => existingFactor.id === factor.id)
                ? current.factors.map((existingFactor) => (existingFactor.id === factor.id ? factor : existingFactor))
                : [...current.factors, factor],
            }))
          }
          onRemoveFactor={(factorId) =>
            setSnapshot((current) => ({
              ...current,
              factors: current.factors.filter((factor) => factor.id !== factorId),
            }))
          }
        />
      ) : null}

      {entryKind === 'factor' ? (
        <FactorsEntryCard
          factors={snapshot.factors.filter((factor) => factor.categoryKey !== 'sleep')}
          visibleCategoryKeys={visibleCategoryKeys}
          visibleItemKeysByCategory={visibleFactorItemKeysByCategory}
          onToggleCategoryVisibility={(categoryKey) =>
            setVisibleCategoryKeys((current) =>
              current.includes(categoryKey)
                ? current.filter((item) => item !== categoryKey)
                : [...current, categoryKey]
            )
          }
          onToggleItemVisibility={(categoryKey, factorKey) =>
            setVisibleFactorItemKeysByCategory((current) => ({
              ...current,
              [categoryKey]: (current[categoryKey] ?? []).includes(factorKey)
                ? (current[categoryKey] ?? []).filter((item) => item !== factorKey)
                : [...(current[categoryKey] ?? []), factorKey],
            }))
          }
          onUpsertFactor={(factor) =>
            setSnapshot((current) => ({
              ...current,
              factors: current.factors.some((existingFactor) => existingFactor.id === factor.id)
                ? current.factors.map((existingFactor) => (existingFactor.id === factor.id ? factor : existingFactor))
                : [...current.factors, factor],
            }))
          }
          onRemoveFactor={(factorId) =>
            setSnapshot((current) => ({
              ...current,
              factors: current.factors.filter((factor) => factor.id !== factorId),
            }))
          }
        />
      ) : null}

      {entryKind === 'measurement' ? (
        <MeasurementsEntryCard
          measurements={snapshot.measurements}
          visibleMeasurementKeys={visibleMeasurementKeys}
          onToggleMeasurementVisibility={(metricKey) =>
            setVisibleMeasurementKeys((current) =>
              current.includes(metricKey)
                ? current.filter((item) => item !== metricKey)
                : [...current, metricKey]
            )
          }
          onUpsertMeasurement={(measurement) =>
            setSnapshot((current) => ({
              ...current,
              measurements: current.measurements.some((existingMeasurement) => existingMeasurement.id === measurement.id)
                ? current.measurements.map((existingMeasurement) =>
                    existingMeasurement.id === measurement.id ? measurement : existingMeasurement
                  )
                : [...current.measurements, measurement],
            }))
          }
          onRemoveMeasurement={(measurementId) =>
            setSnapshot((current) => ({
              ...current,
              measurements: current.measurements.filter((measurement) => measurement.id !== measurementId),
            }))
          }
        />
      ) : null}

      {!disabled ? (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!hasInput || isSubmitting}
          className="w-full rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting ? 'Saving...' : 'Save in Clue'}
        </button>
      ) : (
        <div className="rounded-full border border-accent-mint/40 bg-accent-mint/15 px-4 py-3 text-center text-[12px] font-medium text-primary">
          Saved
        </div>
      )}
    </div>
  );
}
