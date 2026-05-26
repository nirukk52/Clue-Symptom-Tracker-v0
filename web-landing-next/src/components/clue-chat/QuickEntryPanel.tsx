'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS,
  DEFAULT_VISIBLE_MEASUREMENT_KEYS,
  type QuickEntryFactorDraft,
  type QuickEntryMeasurementDraft,
  type QuickEntryMedicationGroup,
  type QuickEntryMedicationDraft,
  type QuickEntrySavedMedication,
  type QuickEntrySnapshot,
  toQuickEntrySavedMedication,
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
  onRequestSignIn?: () => void;
  isSignInLoading?: boolean;
}

const VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY = 'clue_quick_entry_visible_factor_categories';
const VISIBLE_MEASUREMENTS_STORAGE_KEY = 'clue_quick_entry_visible_measurements';
const VISIBLE_SLEEP_ITEMS_STORAGE_KEY = 'clue_quick_entry_visible_sleep_items';
const VISIBLE_FACTOR_ITEMS_STORAGE_KEY = 'clue_quick_entry_visible_factor_items';
const MEDICATION_GROUPS_STORAGE_KEY = 'clue_quick_entry_medication_groups';
const AUTOSAVE_DELAY_MS = 450;

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
 * getSnapshotKey gives autosave a stable way to compare structured drafts.
 */
function getSnapshotKey(snapshot: QuickEntrySnapshot): string {
  return JSON.stringify(snapshot);
}

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
 * readStoredMedicationGroups restores locally persisted medication bundles while
 * discarding malformed entries.
 */
function readStoredMedicationGroups(storageKey: string): QuickEntryMedicationGroup[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.flatMap((group): QuickEntryMedicationGroup[] => {
      if (
        !group ||
        typeof group !== 'object' ||
        typeof group.id !== 'string' ||
        typeof group.name !== 'string' ||
        !Array.isArray(group.medicationIds)
      ) {
        return [];
      }

      return [
        {
          id: group.id,
          name: group.name,
          medicationIds: group.medicationIds.filter(
            (medicationId: unknown): medicationId is string => typeof medicationId === 'string'
          ),
        },
      ];
    });
  } catch {
    return [];
  }
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

/**
 * mergeSavedMedications folds current-day meds into the reusable medication list
 * so the card can keep surfacing previously logged shortcuts.
 */
function mergeSavedMedications(
  savedMedications: QuickEntrySavedMedication[],
  medications: QuickEntryMedicationDraft[]
): QuickEntrySavedMedication[] {
  const mergedById = new Map<string, QuickEntrySavedMedication>();

  for (const medication of savedMedications) {
    mergedById.set(medication.id, medication);
  }

  for (const medication of medications) {
    const savedMedication = toQuickEntrySavedMedication(medication);
    mergedById.set(savedMedication.id, savedMedication);
  }

  return Array.from(mergedById.values()).sort((leftMedication, rightMedication) =>
    leftMedication.medicationName.localeCompare(rightMedication.medicationName)
  );
}

/**
 * sanitizeMedicationGroups removes empty or dangling medication references after
 * the reusable medication list has been rebuilt from saved history.
 */
function sanitizeMedicationGroups(
  medicationGroups: QuickEntryMedicationGroup[],
  savedMedications: QuickEntrySavedMedication[]
): QuickEntryMedicationGroup[] {
  const savedMedicationIds = new Set(savedMedications.map((medication) => medication.id));

  return medicationGroups.flatMap((group) => {
    const medicationIds = group.medicationIds.filter((medicationId) => savedMedicationIds.has(medicationId));
    if (!group.name.trim() || medicationIds.length === 0) {
      return [];
    }

    return [
      {
        ...group,
        name: group.name.trim(),
        medicationIds: Array.from(new Set(medicationIds)),
      },
    ];
  });
}

export function QuickEntryPanel({
  isOpen,
  onClose,
  variant = 'modal',
  userId,
  onSaved,
  onRequestSignIn,
  isSignInLoading = false,
}: QuickEntryPanelProps) {
  const isInline = variant === 'inline';
  const [snapshot, setSnapshot] = useState<QuickEntrySnapshot>(EMPTY_SNAPSHOT);
  const [lastSavedSnapshotKey, setLastSavedSnapshotKey] = useState(() => getSnapshotKey(EMPTY_SNAPSHOT));
  const [savedMedications, setSavedMedications] = useState<QuickEntrySavedMedication[]>([]);
  const [medicationGroups, setMedicationGroups] = useState<QuickEntryMedicationGroup[]>([]);
  const [visibleCategoryKeys, setVisibleCategoryKeys] = useState<string[]>(DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS.filter((key) => key !== 'sleep'));
  const [visibleMeasurementKeys, setVisibleMeasurementKeys] = useState<string[]>(DEFAULT_VISIBLE_MEASUREMENT_KEYS);
  const [visibleSleepItemKeys, setVisibleSleepItemKeys] = useState<string[]>(['sleep-quality', 'early-bedtime', 'late-bedtime', 'time-in-bed', 'nap-time']);
  const [visibleFactorItemKeysByCategory, setVisibleFactorItemKeysByCategory] = useState<Partial<Record<string, string[]>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failedSnapshotKey, setFailedSnapshotKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const hasLoadedSnapshotRef = useRef(false);
  const isMountedRef = useRef(true);
  const isSavingRef = useRef(false);
  const snapshotKey = useMemo(() => getSnapshotKey(snapshot), [snapshot]);
  const latestSnapshotRef = useRef(snapshot);
  const latestSnapshotKeyRef = useRef(snapshotKey);
  const lastSavedSnapshotKeyRef = useRef(lastSavedSnapshotKey);
  const failedSnapshotKeyRef = useRef<string | null>(failedSnapshotKey);

  useEffect(() => {
    latestSnapshotRef.current = snapshot;
    latestSnapshotKeyRef.current = snapshotKey;
  }, [snapshot, snapshotKey]);

  useEffect(() => {
    lastSavedSnapshotKeyRef.current = lastSavedSnapshotKey;
  }, [lastSavedSnapshotKey]);

  useEffect(() => {
    failedSnapshotKeyRef.current = failedSnapshotKey;
  }, [failedSnapshotKey]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * loadSnapshot hydrates the current day's structured quick-entry state and
   * merges it with locally remembered visibility preferences.
   */
  const loadSnapshot = useCallback(async () => {
    if (!userId || !isOpen) {
      return;
    }

    hasLoadedSnapshotRef.current = false;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/quick-entry?userId=${encodeURIComponent(userId)}`, {
        cache: 'no-store',
      });
      const data = await response.json() as {
        snapshot?: QuickEntrySnapshot;
        savedMedications?: QuickEntrySavedMedication[];
        error?: string;
      };

      if (!response.ok || !data.snapshot) {
        throw new Error(data.error || 'Failed to load quick entry state.');
      }

      const storedCategoryKeys = readStoredArray(VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY, DEFAULT_VISIBLE_FACTOR_CATEGORY_KEYS.filter((key) => key !== 'sleep'));
      const storedMeasurementKeys = readStoredArray(VISIBLE_MEASUREMENTS_STORAGE_KEY, DEFAULT_VISIBLE_MEASUREMENT_KEYS);
      const storedSleepItemKeys = readStoredArray(VISIBLE_SLEEP_ITEMS_STORAGE_KEY, ['sleep-quality', 'early-bedtime', 'late-bedtime', 'time-in-bed', 'nap-time']);
      const storedFactorItemKeys = readStoredRecord(VISIBLE_FACTOR_ITEMS_STORAGE_KEY);
      const storedMedicationGroups = readStoredMedicationGroups(MEDICATION_GROUPS_STORAGE_KEY);
      const mergedSavedMedications = mergeSavedMedications(data.savedMedications ?? [], data.snapshot.medications);
      const sanitizedMedicationGroups = sanitizeMedicationGroups(storedMedicationGroups, mergedSavedMedications);

      const mergedCategoryKeys = mergeCategoryVisibility(data.snapshot, storedCategoryKeys);
      const mergedMeasurementKeys = mergeMeasurementVisibility(data.snapshot, storedMeasurementKeys);
      const mergedSleepItemKeys = Array.from(
        new Set([
          ...storedSleepItemKeys,
          ...data.snapshot.factors.filter((factor) => factor.categoryKey === 'sleep').map((factor) => factor.factorKey),
        ])
      );
      const mergedFactorItemKeys = mergeFactorItemVisibility(data.snapshot, storedFactorItemKeys);
      const loadedSnapshotKey = getSnapshotKey(data.snapshot);

      setSnapshot(data.snapshot);
      latestSnapshotRef.current = data.snapshot;
      latestSnapshotKeyRef.current = loadedSnapshotKey;
      lastSavedSnapshotKeyRef.current = loadedSnapshotKey;
      setLastSavedSnapshotKey(loadedSnapshotKey);
      failedSnapshotKeyRef.current = null;
      setFailedSnapshotKey(null);
      setSavedMedications(mergedSavedMedications);
      setMedicationGroups(sanitizedMedicationGroups);
      setVisibleCategoryKeys(mergedCategoryKeys);
      setVisibleMeasurementKeys(mergedMeasurementKeys);
      setVisibleSleepItemKeys(mergedSleepItemKeys);
      setVisibleFactorItemKeysByCategory(mergedFactorItemKeys);

      writeStoredValue(VISIBLE_FACTOR_CATEGORIES_STORAGE_KEY, mergedCategoryKeys);
      writeStoredValue(VISIBLE_MEASUREMENTS_STORAGE_KEY, mergedMeasurementKeys);
      writeStoredValue(VISIBLE_SLEEP_ITEMS_STORAGE_KEY, mergedSleepItemKeys);
      writeStoredValue(VISIBLE_FACTOR_ITEMS_STORAGE_KEY, mergedFactorItemKeys);
      writeStoredValue(MEDICATION_GROUPS_STORAGE_KEY, sanitizedMedicationGroups);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load quick entry state.';
      setErrorMessage(message);
    } finally {
      hasLoadedSnapshotRef.current = true;
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
   * persistSnapshot writes the current quick-entry draft without requiring an
   * explicit submit tap, which keeps the panel aligned with low-energy usage.
   */
  const persistSnapshot = useCallback(async (nextSnapshot: QuickEntrySnapshot, snapshotKeyToSave: string) => {
    if (!userId) {
      setErrorMessage('Sign in to save quick entry data.');
      return;
    }

    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quick-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          source: 'quick_entry',
          snapshot: nextSnapshot,
        }),
      });
      const data = await response.json() as {
        snapshot?: QuickEntrySnapshot;
        savedMedications?: QuickEntrySavedMedication[];
        error?: string;
      };

      if (!response.ok || !data.snapshot) {
        throw new Error(data.error || 'Failed to save quick entry.');
      }

      const mergedSavedMedicationState = mergeSavedMedications(data.savedMedications ?? [], data.snapshot.medications);
      const sanitizedMedicationGroupState = sanitizeMedicationGroups(medicationGroups, mergedSavedMedicationState);
      const savedSnapshotKey = getSnapshotKey(data.snapshot);

      if (latestSnapshotKeyRef.current === snapshotKeyToSave) {
        latestSnapshotRef.current = data.snapshot;
        latestSnapshotKeyRef.current = savedSnapshotKey;
        setSnapshot(data.snapshot);
        lastSavedSnapshotKeyRef.current = savedSnapshotKey;
        setLastSavedSnapshotKey(savedSnapshotKey);
      } else {
        lastSavedSnapshotKeyRef.current = snapshotKeyToSave;
        setLastSavedSnapshotKey(snapshotKeyToSave);
      }

      setSavedMedications(mergedSavedMedicationState);
      setMedicationGroups(sanitizedMedicationGroupState);
      writeStoredValue(MEDICATION_GROUPS_STORAGE_KEY, sanitizedMedicationGroupState);
      failedSnapshotKeyRef.current = null;
      setFailedSnapshotKey(null);
      onSaved?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save quick entry.';
      failedSnapshotKeyRef.current = snapshotKeyToSave;
      setFailedSnapshotKey(snapshotKeyToSave);
      setErrorMessage(message);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);

      if (
        isMountedRef.current &&
        latestSnapshotKeyRef.current !== lastSavedSnapshotKeyRef.current &&
        failedSnapshotKeyRef.current !== latestSnapshotKeyRef.current
      ) {
        if (autoSaveTimeoutRef.current) {
          window.clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = window.setTimeout(() => {
          void persistSnapshot(latestSnapshotRef.current, latestSnapshotKeyRef.current);
        }, AUTOSAVE_DELAY_MS);
      }
    }
  }, [medicationGroups, onSaved, userId]);

  useEffect(() => {
    if (!isOpen || !userId || isLoading || !hasLoadedSnapshotRef.current) {
      return;
    }

    if (snapshotKey === lastSavedSnapshotKeyRef.current || failedSnapshotKeyRef.current === snapshotKey) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      void persistSnapshot(latestSnapshotRef.current, latestSnapshotKeyRef.current);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [failedSnapshotKey, isLoading, isOpen, persistSnapshot, snapshotKey, userId]);

  const sleepFactors = useMemo(
    () => snapshot.factors.filter((factor) => factor.categoryKey === 'sleep'),
    [snapshot.factors]
  );
  const nonSleepFactors = useMemo(
    () => snapshot.factors.filter((factor) => factor.categoryKey !== 'sleep'),
    [snapshot.factors]
  );
  const isSavePending = snapshotKey !== lastSavedSnapshotKey;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={
        isInline
          ? 'flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-bg-cream'
          : 'fixed inset-0 z-70 flex items-end justify-center sm:items-center'
      }
    >
      {!isInline ? (
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      ) : null}

      <div
        className={
          isInline
            ? 'flex h-full min-h-0 flex-1 w-full flex-col overflow-hidden'
            : 'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-bg-cream shadow-xl sm:max-w-3xl sm:rounded-3xl'
        }
        style={{
          backgroundColor: '#fdf7ef',
          backgroundImage: `radial-gradient(circle, rgba(32, 19, 46, 0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        {!isInline ? (
          <div className="flex items-center justify-between border-b border-primary/8 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="add_circle" size="sm" className="text-primary/70" />
                <h2 className="text-[15px] font-semibold text-primary">Quick Entry</h2>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                Structured logging for low-energy days, without the chat overhead.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-primary/5 hover:text-primary"
              aria-label="Close quick entry"
            >
              <MaterialIcon name="close" size="sm" />
            </button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!userId ? (
            <div className="rounded-2xl border border-primary/10 bg-white px-5 py-6 text-center shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
              <p className="text-[16px] font-semibold text-primary">Sign in to use structured quick entry</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                Quick entry now saves directly to your structured history, timeline, and canvas. Once signed in, this tab will load your current day automatically.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
              Pulling up today&apos;s entry...
            </div>
          ) : (
            <div className="space-y-3">
              {/*
                Compassionate empty-state hint at the top of the panel (May 26 review).
                Cards below stay rendered so the user can fill what they want and
                skip the rest — no minimum, no pressure.
              */}
              <p className="px-3 py-2 text-[12px] leading-relaxed text-text-muted/90 text-center">
                Nothing here yet. Fill what feels easy — skip the rest.
              </p>
              <MoodEntryCard mood={snapshot.mood} onChange={(nextMood) => setSnapshot((current) => ({ ...current, mood: nextMood }))} />
              <MedicationEntryCard
                medications={snapshot.medications}
                savedMedications={savedMedications}
                medicationGroups={medicationGroups}
                onMedicationGroupsChange={(nextGroups) => {
                  const sanitizedGroups = sanitizeMedicationGroups(
                    nextGroups,
                    mergeSavedMedications(savedMedications, snapshot.medications)
                  );
                  setMedicationGroups(sanitizedGroups);
                  writeStoredValue(MEDICATION_GROUPS_STORAGE_KEY, sanitizedGroups);
                }}
                onUpsert={upsertMedication}
                onRemove={removeMedication}
              />
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

        <div className="border-t border-primary/8 px-4 py-3">
          {errorMessage ? (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          {!userId ? (
            <button
              type="button"
              onClick={onRequestSignIn}
              disabled={!onRequestSignIn || isSignInLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSignInLoading ? (
                <>
                  <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <MaterialIcon name="lock" size="sm" />
                  Sign in to save entries
                </>
              )}
            </button>
          ) : (
            <div
              className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold text-white ${
                errorMessage ? 'bg-rose-500' : 'bg-primary'
              }`}
              role="status"
              aria-live="polite"
            >
              {errorMessage ? (
              <>
                <MaterialIcon name="error" size="sm" />
                Autosave failed
              </>
            ) : isSaving || isSavePending ? (
              <>
                <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
                Saving entries...
              </>
            ) : (
              <>
                <MaterialIcon name="check" size="sm" />
                Entries saved
              </>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
