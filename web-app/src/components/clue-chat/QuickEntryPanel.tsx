'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  buildQuickEntrySummary,
  DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS,
  DEFAULT_VISIBLE_MEASUREMENT_KEYS,
  type QuickEntryFactorDraft,
  type QuickEntryMeasurementDraft,
  type QuickEntryMedicationDraft,
  type QuickEntrySnapshot,
} from '@/lib/quick-entry';

import {
  FactorsEntryCard,
  MeasurementsEntryCard,
  MedicationEntryCard,
  MoodEntryCard,
  SleepEntryCard,
} from './quick-entry/QuickEntryCards';

/**
 * QuickEntryPanel renders the structured Bearable-style quick-entry editor used
 * in the mobile tab and modal shortcut.
 */
interface QuickEntryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'inline';
  userId?: string;
  onSaved?: () => void;
}

const VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY = 'clue_quick_entry_visible_factor_categories';
const VISIBLE_MEASUREMENTS_STORAGE_KEY = 'clue_quick_entry_visible_measurements';
const VISIBLE_SLEEP_ITEMS_STORAGE_KEY = 'clue_quick_entry_visible_sleep_items';
const VISIBLE_FACTOR_ITEMS_STORAGE_KEY = 'clue_quick_entry_visible_factor_items';

/**
 * EMPTY_SNAPSHOT keeps quick-entry state creation deterministic.
 */
const EMPTY_SNAPSHOT: QuickEntrySnapshot = {
  mood: null,
  medications: [],
  factors: [],
  measurements: [],
};

/**
 * readStoredArray rehydrates one local visibility preference while staying safe
 * around invalid or absent localStorage values.
 */
function readStoredArray(storageKey: string, fallback: string[]): string[] {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter((value): value is string => typeof value === 'string') : fallback;
  } catch {
    return fallback;
  }
}

/**
 * readStoredRecord rehydrates one local visibility record from localStorage.
 */
function readStoredRecord(storageKey: string): Partial<Record<string, string[]>> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsedValue).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [],
      ])
    );
  } catch {
    return {};
  }
}

/**
 * writeStoredValue persists lightweight visibility preferences between reloads.
 */
function writeStoredValue(storageKey: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

/**
 * mergeCategoryVisibility ensures categories with saved factors stay visible
 * even if the user never explicitly added them through the picker.
 */
function mergeCategoryVisibility(snapshot: QuickEntrySnapshot, currentKeys: string[]): string[] {
  const savedKeys = snapshot.factors
    .map((factor) => factor.categoryKey)
    .filter((key) => key !== 'sleep');

  return Array.from(new Set([...currentKeys, ...savedKeys]));
}

/**
 * mergeFactorItemVisibility ensures logged factors remain visible after reload.
 */
function mergeFactorItemVisibility(
  snapshot: QuickEntrySnapshot,
  currentRecord: Partial<Record<string, string[]>>
): Partial<Record<string, string[]>> {
  const nextRecord = { ...currentRecord };

  for (const factor of snapshot.factors) {
    const currentItems = nextRecord[factor.categoryKey] ?? [];
    nextRecord[factor.categoryKey] = Array.from(new Set([...currentItems, factor.factorKey]));
  }

  return nextRecord;
}

/**
 * mergeMeasurementVisibility keeps logged measurement metrics visible after the
 * next reload even if they were not part of the starter metric list.
 */
function mergeMeasurementVisibility(snapshot: QuickEntrySnapshot, currentKeys: string[]): string[] {
  const savedKeys = snapshot.measurements.map((measurement) => measurement.metricKey);
  return Array.from(new Set([...currentKeys, ...savedKeys]));
}

export function QuickEntryPanel({
  isOpen,
  onClose,
  variant = 'modal',
  userId,
  onSaved,
}: QuickEntryPanelProps) {
  const isInline = variant === 'inline';
  const [snapshot, setSnapshot] = useState<QuickEntrySnapshot>(EMPTY_SNAPSHOT);
  const [visibleCategoryKeys, setVisibleCategoryKeys] = useState<string[]>(DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS.filter((key) => key !== 'sleep'));
  const [visibleMeasurementKeys, setVisibleMeasurementKeys] = useState<string[]>(DEFAULT_VISIBLE_MEASUREMENT_KEYS);
  const [visibleSleepItemKeys, setVisibleSleepItemKeys] = useState<string[]>(['sleep-quality', 'early-bedtime', 'late-bedtime', 'time-in-bed', 'nap-time']);
  const [visibleFactorItemKeysByCategory, setVisibleFactorItemKeysByCategory] = useState<Partial<Record<string, string[]>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * loadSnapshot hydrates the current day's structured quick-entry state and
   * merges it with locally remembered visibility preferences.
   */
  const loadSnapshot = useCallback(async () => {
    if (!userId || !isOpen) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/quick-entry?userId=${encodeURIComponent(userId)}`, {
        cache: 'no-store',
      });
      const data = await response.json() as { snapshot?: QuickEntrySnapshot; error?: string };

      if (!response.ok || !data.snapshot) {
        throw new Error(data.error || 'Failed to load quick entry state.');
      }

      const storedCategoryKeys = readStoredArray(VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY, DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS.filter((key) => key !== 'sleep'));
      const storedMeasurementKeys = readStoredArray(VISIBLE_MEASUREMENTS_STORAGE_KEY, DEFAULT_VISIBLE_MEASUREMENT_KEYS);
      const storedSleepItemKeys = readStoredArray(VISIBLE_SLEEP_ITEMS_STORAGE_KEY, ['sleep-quality', 'early-bedtime', 'late-bedtime', 'time-in-bed', 'nap-time']);
      const storedFactorItemKeys = readStoredRecord(VISIBLE_FACTOR_ITEMS_STORAGE_KEY);

      const mergedCategoryKeys = mergeCategoryVisibility(data.snapshot, storedCategoryKeys);
      const mergedMeasurementKeys = mergeMeasurementVisibility(data.snapshot, storedMeasurementKeys);
      const mergedSleepItemKeys = Array.from(
        new Set([
          ...storedSleepItemKeys,
          ...data.snapshot.factors.filter((factor) => factor.categoryKey === 'sleep').map((factor) => factor.factorKey),
        ])
      );
      const mergedFactorItemKeys = mergeFactorItemVisibility(data.snapshot, storedFactorItemKeys);

      setSnapshot(data.snapshot);
      setVisibleCategoryKeys(mergedCategoryKeys);
      setVisibleMeasurementKeys(mergedMeasurementKeys);
      setVisibleSleepItemKeys(mergedSleepItemKeys);
      setVisibleFactorItemKeysByCategory(mergedFactorItemKeys);

      writeStoredValue(VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY, mergedCategoryKeys);
      writeStoredValue(VISIBLE_MEASUREMENTS_STORAGE_KEY, mergedMeasurementKeys);
      writeStoredValue(VISIBLE_SLEEP_ITEMS_STORAGE_KEY, mergedSleepItemKeys);
      writeStoredValue(VISIBLE_FACTOR_ITEMS_STORAGE_KEY, mergedFactorItemKeys);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load quick entry state.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadSnapshot();
  }, [isOpen, loadSnapshot]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !isInline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isInline, isOpen]);

  /**
   * upsertMedication replaces or appends one medication row in the snapshot.
   */
  function upsertMedication(nextMedication: QuickEntryMedicationDraft) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      medications: currentSnapshot.medications.some((medication) => medication.id === nextMedication.id)
        ? currentSnapshot.medications.map((medication) =>
            medication.id === nextMedication.id ? nextMedication : medication
          )
        : [...currentSnapshot.medications, nextMedication],
    }));
  }

  /**
   * removeMedication removes one medication row from the draft snapshot.
   */
  function removeMedication(medicationId: string) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      medications: currentSnapshot.medications.filter((medication) => medication.id !== medicationId),
    }));
  }

  /**
   * upsertFactor replaces or appends one factor row in the draft snapshot.
   */
  function upsertFactor(nextFactor: QuickEntryFactorDraft) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      factors: currentSnapshot.factors.some((factor) => factor.id === nextFactor.id)
        ? currentSnapshot.factors.map((factor) => (factor.id === nextFactor.id ? nextFactor : factor))
        : [...currentSnapshot.factors, nextFactor],
    }));
  }

  /**
   * removeFactor removes one factor row from the current draft snapshot.
   */
  function removeFactor(factorId: string) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      factors: currentSnapshot.factors.filter((factor) => factor.id !== factorId),
    }));
  }

  /**
   * upsertMeasurement replaces or appends one health measurement row.
   */
  function upsertMeasurement(nextMeasurement: QuickEntryMeasurementDraft) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      measurements: currentSnapshot.measurements.some((measurement) => measurement.id === nextMeasurement.id)
        ? currentSnapshot.measurements.map((measurement) =>
            measurement.id === nextMeasurement.id ? nextMeasurement : measurement
          )
        : [...currentSnapshot.measurements, nextMeasurement],
    }));
  }

  /**
   * removeMeasurement deletes one measurement row from the draft snapshot.
   */
  function removeMeasurement(measurementId: string) {
    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      measurements: currentSnapshot.measurements.filter((measurement) => measurement.id !== measurementId),
    }));
  }

  /**
   * toggleCategoryVisibility updates which factor sections appear in the panel.
   */
  function toggleCategoryVisibility(categoryKey: string) {
    setVisibleCategoryKeys((currentKeys) => {
      const nextKeys = currentKeys.includes(categoryKey)
        ? currentKeys.filter((key) => key !== categoryKey)
        : [...currentKeys, categoryKey];
      writeStoredValue(VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY, nextKeys);
      return nextKeys;
    });
  }

  /**
   * toggleMeasurementVisibility updates which curated metrics appear in the
   * measurements card.
   */
  function toggleMeasurementVisibility(metricKey: string) {
    setVisibleMeasurementKeys((currentKeys) => {
      const nextKeys = currentKeys.includes(metricKey)
        ? currentKeys.filter((key) => key !== metricKey)
        : [...currentKeys, metricKey];
      writeStoredValue(VISIBLE_MEASUREMENTS_STORAGE_KEY, nextKeys);
      return nextKeys;
    });
  }

  /**
   * toggleSleepItemVisibility updates which sleep factor rows remain visible.
   */
  function toggleSleepItemVisibility(factorKey: string) {
    setVisibleSleepItemKeys((currentKeys) => {
      const nextKeys = currentKeys.includes(factorKey)
        ? currentKeys.filter((key) => key !== factorKey)
        : [...currentKeys, factorKey];
      writeStoredValue(VISIBLE_SLEEP_ITEMS_STORAGE_KEY, nextKeys);
      return nextKeys;
    });
  }

  /**
   * toggleFactorItemVisibility updates the visible curated items for one factor
   * category and persists the selection locally.
   */
  function toggleFactorItemVisibility(categoryKey: string, factorKey: string) {
    setVisibleFactorItemKeysByCategory((currentRecord) => {
      const currentItems = currentRecord[categoryKey] ?? [];
      const nextItems = currentItems.includes(factorKey)
        ? currentItems.filter((item) => item !== factorKey)
        : [...currentItems, factorKey];
      const nextRecord = {
        ...currentRecord,
        [categoryKey]: nextItems,
      };
      writeStoredValue(VISIBLE_FACTOR_ITEMS_STORAGE_KEY, nextRecord);
      return nextRecord;
    });
  }

  /**
   * handleSave persists the full structured snapshot through the deterministic
   * quick-entry API and refreshes the graph/timeline-facing state.
   */
  const handleSave = useCallback(async () => {
    if (!userId) {
      setErrorMessage('Sign in to save quick entry data.');
      return;
    }

    setIsSaving(true);
    setSavedSummary(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quick-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          source: 'quick_entry',
          snapshot,
        }),
      });
      const data = await response.json() as { snapshot?: QuickEntrySnapshot; error?: string };

      if (!response.ok || !data.snapshot) {
        throw new Error(data.error || 'Failed to save quick entry.');
      }

      setSnapshot(data.snapshot);
      setSavedSummary(buildQuickEntrySummary(data.snapshot));
      onSaved?.();

      if (!isInline) {
        window.setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save quick entry.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }, [isInline, onClose, onSaved, snapshot, userId]);

  const hasAnyInput = useMemo(
    () =>
      Boolean(snapshot.mood) ||
      snapshot.medications.length > 0 ||
      snapshot.factors.length > 0 ||
      snapshot.measurements.length > 0,
    [snapshot]
  );

  const sleepFactors = useMemo(
    () => snapshot.factors.filter((factor) => factor.categoryKey === 'sleep'),
    [snapshot.factors]
  );
  const nonSleepFactors = useMemo(
    () => snapshot.factors.filter((factor) => factor.categoryKey !== 'sleep'),
    [snapshot.factors]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={
        isInline
          ? 'flex min-h-0 flex-1 flex-col bg-bg-cream'
          : 'fixed inset-0 z-70 flex items-end justify-center sm:items-center'
      }
    >
      {!isInline ? (
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      ) : null}

      <div
        className={
          isInline
            ? 'flex min-h-0 flex-1 w-full flex-col bg-bg-cream'
            : 'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-bg-cream shadow-xl sm:max-w-3xl sm:rounded-3xl'
        }
      >
        <div className="flex items-center justify-between border-b border-primary/8 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <MaterialIcon name="add_circle" size="sm" className="text-primary/70" />
              <h2 className="text-[16px] font-semibold text-primary">Quick Entry</h2>
            </div>
            <p className="mt-0.5 text-[12px] text-text-muted">
              Structured logging for low-energy days, without the chat overhead.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-primary/5 hover:text-primary"
            aria-label={isInline ? 'Return to chat' : 'Close quick entry'}
          >
            <MaterialIcon name="close" size="sm" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!userId ? (
            <div className="rounded-[28px] border border-primary/10 bg-white px-5 py-6 text-center shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <p className="text-[16px] font-semibold text-primary">Sign in to use structured quick entry</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                Quick entry now saves directly to your structured history, timeline, and canvas. Once signed in, this tab will load your current day automatically.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">Loading quick entry...</div>
          ) : (
            <div className="space-y-4">
              <MoodEntryCard mood={snapshot.mood} onChange={(nextMood) => setSnapshot((current) => ({ ...current, mood: nextMood }))} />
              <MedicationEntryCard medications={snapshot.medications} onUpsert={upsertMedication} onRemove={removeMedication} />
              <SleepEntryCard
                sleepFactors={sleepFactors}
                visibleSleepItemKeys={visibleSleepItemKeys}
                onToggleSleepItemVisibility={toggleSleepItemVisibility}
                onUpsertFactor={upsertFactor}
                onRemoveFactor={removeFactor}
              />
              <FactorsEntryCard
                factors={nonSleepFactors}
                visibleCategoryKeys={visibleCategoryKeys}
                visibleItemKeysByCategory={visibleFactorItemKeysByCategory}
                onToggleCategoryVisibility={toggleCategoryVisibility}
                onToggleItemVisibility={toggleFactorItemVisibility}
                onUpsertFactor={upsertFactor}
                onRemoveFactor={removeFactor}
              />
              <MeasurementsEntryCard
                measurements={snapshot.measurements}
                visibleMeasurementKeys={visibleMeasurementKeys}
                onToggleMeasurementVisibility={toggleMeasurementVisibility}
                onUpsertMeasurement={upsertMeasurement}
                onRemoveMeasurement={removeMeasurement}
              />
            </div>
          )}
        </div>

        <div className="border-t border-primary/8 px-5 py-4">
          {errorMessage ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          {savedSummary ? (
            <div className="mb-3 rounded-2xl border border-accent-mint/40 bg-accent-mint/20 px-4 py-3 text-[12px] text-primary">
              Saved: {savedSummary}
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasAnyInput || isSaving || !userId}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSaving ? (
              <>
                <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
                Saving quick entry...
              </>
            ) : (
              <>
                <MaterialIcon name="check" size="sm" />
                Save structured entry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
