'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  getFactorCategory,
  getMeasurementDefinition,
  QUICK_ENTRY_FACTOR_CATEGORIES,
  QUICK_ENTRY_MEASUREMENTS,
  type QuickEntryFactorCategoryDefinition,
  type QuickEntryFactorDraft,
  type QuickEntryMeasurementKey,
  type QuickEntryMeasurementDraft,
  type QuickEntryMedicationDraft,
  type QuickEntryMoodDraft,
} from '@/lib/quick-entry';

import { QuickEntryPickerSheet, type QuickEntryPickerOption } from './QuickEntryPickerSheet';

interface MoodEntryCardProps {
  mood: QuickEntryMoodDraft | null;
  onChange: (nextMood: QuickEntryMoodDraft | null) => void;
}

interface MedicationEntryCardProps {
  medications: QuickEntryMedicationDraft[];
  onUpsert: (medication: QuickEntryMedicationDraft) => void;
  onRemove: (medicationId: string) => void;
}

interface SleepEntryCardProps {
  sleepFactors: QuickEntryFactorDraft[];
  visibleSleepItemKeys: string[];
  onToggleSleepItemVisibility: (factorKey: string) => void;
  onUpsertFactor: (factor: QuickEntryFactorDraft) => void;
  onRemoveFactor: (factorId: string) => void;
}

interface FactorsEntryCardProps {
  factors: QuickEntryFactorDraft[];
  visibleCategoryKeys: string[];
  visibleItemKeysByCategory: Partial<Record<string, string[]>>;
  onToggleCategoryVisibility: (categoryKey: string) => void;
  onToggleItemVisibility: (categoryKey: string, factorKey: string) => void;
  onUpsertFactor: (factor: QuickEntryFactorDraft) => void;
  onRemoveFactor: (factorId: string) => void;
}

interface MeasurementsEntryCardProps {
  measurements: QuickEntryMeasurementDraft[];
  visibleMeasurementKeys: string[];
  onToggleMeasurementVisibility: (metricKey: string) => void;
  onUpsertMeasurement: (measurement: QuickEntryMeasurementDraft) => void;
  onRemoveMeasurement: (measurementId: string) => void;
}

/**
 * createDraftId gives local quick-entry rows stable client IDs before they are
 * replaced by persisted rows from the API.
 */
function createDraftId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * DarkCard keeps every quick-entry section visually compact so mobile logging
 * feels closer to the chat sliders than to a stack of oversized dashboard cards.
 */
function DarkCard({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/8 bg-linear-to-r from-accent-mint/10 via-white to-accent-purple/10 text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-2 px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/85 text-primary/65 shadow-sm">
            <MaterialIcon name={icon} size="xs" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
            {subtitle ? <p className="mt-0.5 hidden text-[11px] leading-relaxed text-text-muted sm:block">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="px-3 pb-3">{children}</div>
    </section>
  );
}

/**
 * FormSheet provides a lightweight modal editor for medication and measurement
 * rows without forcing the whole quick-entry tab to leave context.
 */
function FormSheet({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-85 flex items-end justify-center bg-primary/35 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-t-[28px] border border-primary/10 bg-bg-cream text-primary shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-primary/8 px-5 py-4">
          <p className="text-[16px] font-semibold">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 text-primary/60 transition hover:bg-primary/8 hover:text-primary"
            aria-label={`Close ${title}`}
          >
            <MaterialIcon name="close" size="sm" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * RatingSquares keeps mood rating in the same compact visual language as the
 * chat slider so quick entry does not feel heavier than conversational logging.
 */
function RatingSquares({
  value,
  onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) {
  const safeValue = value ?? 5;
  const percentage = ((safeValue - 1) / 9) * 100;

  return (
    <div className="from-accent-mint/20 via-accent-peach/20 to-accent-rose/30 rounded-2xl bg-linear-to-r p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-primary">How is your mood today?</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-primary shadow-sm">
          {safeValue}/10
        </span>
      </div>
      <div className="relative">
        <div className="from-accent-mint via-accent-peach to-accent-rose h-2.5 w-full rounded-full bg-linear-to-r opacity-40" />
        <div
          className="from-accent-mint via-accent-peach to-accent-rose absolute left-0 top-0 h-2.5 rounded-full bg-linear-to-r transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-all duration-150"
          style={{
            left: `calc(${percentage}% - 8px)`,
            backgroundColor:
              safeValue <= 3
                ? 'var(--color-accent-mint)'
                : safeValue <= 6
                  ? 'var(--color-accent-peach)'
                  : 'var(--color-accent-rose)',
          }}
        />
        <input
          type="range"
          min={1}
          max={10}
          value={safeValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Mood rating"
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-text-muted">
        <span>Poor</span>
        <span>Okay</span>
        <span>Good</span>
      </div>
    </div>
  );
}

/**
 * FactorRatingControl gives rated factor rows the Bearable-style X + low/medium/
 * high affordance while still storing deterministic numeric values.
 */
function FactorRatingControl({
  rating,
  onChange,
}: {
  rating?: number;
  onChange: (rating?: number) => void;
}) {
  const options = [
    { value: undefined, label: 'clear', icon: 'close' },
    { value: 1, label: 'low', bars: 1 },
    { value: 2, label: 'medium', bars: 2 },
    { value: 3, label: 'high', bars: 3 },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {options.map((option) => {
        const isActive = option.value === rating || (option.value === undefined && rating === undefined);

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${
              isActive
                ? 'border-primary bg-primary text-white'
                : 'border-primary/10 bg-white text-primary/65 hover:border-primary/20 hover:bg-primary/3'
            }`}
            aria-label={`Set factor intensity to ${option.label}`}
          >
            {option.icon ? (
              <MaterialIcon name={option.icon} size="sm" />
            ) : (
              <span className="flex items-end gap-1">
                {Array.from({ length: 3 }, (_, index) => (
                  <span
                    key={`${option.label}-${index}`}
                    className={`w-1 rounded-full ${
                      index < (option.bars ?? 0) ? 'bg-current' : 'bg-current/25'
                    }`}
                    style={{ height: `${8 + index * 6}px` }}
                  />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * MoodEntryCard adapts the Bearable mood grid to Clue's warm quick-entry shell.
 */
export function MoodEntryCard({ mood, onChange }: MoodEntryCardProps) {
  return (
    <DarkCard
      icon="mood"
      title="Mood"
    >
      <div className="space-y-2">
        <RatingSquares
          value={mood?.rating}
          onChange={(rating) => onChange({ rating, note: mood?.note })}
        />
        <textarea
          value={mood?.note ?? ''}
          onChange={(event) => onChange(mood ? { ...mood, note: event.target.value } : { rating: 5, note: event.target.value })}
          placeholder="Optional context for your mood today..."
          rows={1}
          className="w-full rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-[12px] text-primary placeholder:text-text-muted/80 outline-none transition focus:border-primary/20 focus:bg-white"
        />
      </div>
    </DarkCard>
  );
}

/**
 * MedicationEntryCard keeps medication logging compact but editable enough for
 * repeated daily use without sending the user back into chat.
 */
export function MedicationEntryCard({
  medications,
  onUpsert,
  onRemove,
}: MedicationEntryCardProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<QuickEntryMedicationDraft | null>(null);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [taken, setTaken] = useState(true);
  const [timing, setTiming] = useState('');
  const [notes, setNotes] = useState('');

  /**
   * openEditor seeds the medication editor from either an existing row or an
   * empty draft so edits stay low friction.
   */
  function openEditor(medication?: QuickEntryMedicationDraft) {
    setEditingMedication(medication ?? null);
    setMedicationName(medication?.medicationName ?? '');
    setDosage(medication?.dosage ?? '');
    setTaken(medication?.taken ?? true);
    setTiming(medication?.timing ?? '');
    setNotes(medication?.notes ?? '');
    setIsEditorOpen(true);
  }

  /**
   * saveMedicationDraft writes the editor state back to the parent quick-entry
   * snapshot while preserving edits to existing medication rows.
   */
  function saveMedicationDraft() {
    if (!medicationName.trim()) {
      return;
    }

    onUpsert({
      id: editingMedication?.id ?? createDraftId('med'),
      medicationName: medicationName.trim(),
      dosage: dosage.trim() || undefined,
      taken,
      timing: timing.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsEditorOpen(false);
  }

  return (
    <>
      <DarkCard
        icon="pill"
        title="Meds / Supplements"
      >
        <div className="space-y-2">
          {medications.length > 0 ? (
            medications.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-primary/8 bg-white/80 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-primary">{medication.medicationName}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {[medication.dosage, medication.timing, medication.taken ? 'Taken' : 'Skipped']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor(medication)}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-primary/10 bg-primary/3 px-2.5 text-[11px] font-medium text-primary transition hover:border-primary/20 hover:bg-primary/5"
                    aria-label={`Edit ${medication.medicationName}`}
                  >
                    <MaterialIcon name="edit" size="xs" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(medication.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary/55 transition hover:bg-primary/8 hover:text-primary"
                    aria-label={`Remove ${medication.medicationName}`}
                  >
                    <MaterialIcon name="delete" size="sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-primary/12 bg-white/70 px-3 py-3 text-[12px] text-text-muted">
              Add the meds or supplements you want available for fast daily logging.
            </div>
          )}

          <button
            type="button"
            onClick={() => openEditor()}
            className="mx-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3.5 text-[12px] font-semibold text-primary transition hover:border-primary/20 hover:bg-primary/3"
          >
            <MaterialIcon name="add" size="sm" />
            Add medication
          </button>
        </div>
      </DarkCard>

      <FormSheet isOpen={isEditorOpen} title="Medication Entry" onClose={() => setIsEditorOpen(false)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-white/70">Medication name</span>
            <input
              value={medicationName}
              onChange={(event) => setMedicationName(event.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder="e.g. Bactrim"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-white/70">Dosage</span>
              <input
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
                placeholder="1 tablet"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-white/70">Timing</span>
              <input
                value={timing}
                onChange={(event) => setTiming(event.target.value)}
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
                placeholder="Morning"
              />
            </label>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Taken', value: true },
              { label: 'Skipped', value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setTaken(option.value)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-[13px] font-medium transition ${
                  taken === option.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/10 bg-white text-primary/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-white/70">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder="Optional context"
            />
          </label>
          <button
            type="button"
            onClick={saveMedicationDraft}
            className="w-full rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92"
          >
            Save medication
          </button>
        </div>
      </FormSheet>
    </>
  );
}

/**
 * renderFactorRow is shared by the sleep and other-factor cards so factor rows
 * behave consistently regardless of which curated section they came from.
 */
function renderFactorRow(params: {
  definition: { key: string; label: string; icon: string; supportsRating?: boolean };
  currentFactor?: QuickEntryFactorDraft;
  category: QuickEntryFactorCategoryDefinition;
  onUpsertFactor: (factor: QuickEntryFactorDraft) => void;
  onRemoveFactor: (factorId: string) => void;
}) {
  const { definition, currentFactor, category, onUpsertFactor, onRemoveFactor } = params;

  return (
    <div
      key={definition.key}
      className="rounded-xl border border-primary/8 bg-white/80 px-3 py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/4 text-primary/60">
            <MaterialIcon name={definition.icon} size="xs" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-primary">{definition.label}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.03em] text-text-muted">{category.label}</p>
          </div>
        </div>
        <div className="shrink-0">
          {definition.supportsRating ? (
          <FactorRatingControl
            rating={currentFactor?.rating}
            onChange={(rating) => {
              if (rating === undefined && currentFactor) {
                onRemoveFactor(currentFactor.id);
                return;
              }

              onUpsertFactor({
                id: currentFactor?.id ?? createDraftId('factor'),
                categoryKey: category.key,
                categoryLabel: category.label,
                factorKey: definition.key,
                factorName: definition.label,
                rating,
                scaleMax: 3,
              });
            }}
          />
          ) : (
          <button
            type="button"
            onClick={() => {
              if (currentFactor) {
                onRemoveFactor(currentFactor.id);
                return;
              }

              onUpsertFactor({
                id: createDraftId('factor'),
                categoryKey: category.key,
                categoryLabel: category.label,
                factorKey: definition.key,
                factorName: definition.label,
              });
            }}
            className={`inline-flex h-8 rounded-full border px-3 text-[11px] font-medium transition ${
              currentFactor
                ? 'border-primary bg-primary text-white'
                : 'border-primary/12 bg-white text-primary/75 hover:border-primary/20 hover:bg-primary/3'
            }`}
          >
            {currentFactor ? 'Logged for today' : 'Tap to log'}
          </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SleepEntryCard keeps sleep quality and sleep factors together because users
 * often reason about both in the same moment.
 */
export function SleepEntryCard({
  sleepFactors,
  visibleSleepItemKeys,
  onToggleSleepItemVisibility,
  onUpsertFactor,
  onRemoveFactor,
}: SleepEntryCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const sleepCategory = getFactorCategory('sleep');

  if (!sleepCategory) {
    return null;
  }

  const sleepOptions = sleepCategory.items.filter(
    (item) => visibleSleepItemKeys.includes(item.key) || item.defaultVisible
  );

  const pickerOptions: QuickEntryPickerOption[] = sleepCategory.items.map((item) => ({
    id: item.key,
    label: item.label,
    icon: item.icon,
    selected: visibleSleepItemKeys.includes(item.key) || Boolean(item.defaultVisible),
  }));

  return (
    <>
      <DarkCard
        icon="hotel"
        title="Sleep"
        action={
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-primary/10 bg-white px-2.5 text-[11px] font-medium text-primary transition hover:border-primary/20 hover:bg-primary/3"
            aria-label="Edit sleep factors"
          >
            <MaterialIcon name="tune" size="xs" />
            Edit
          </button>
        }
      >
        <div className="space-y-2">
          {sleepOptions.map((item) =>
            renderFactorRow({
              definition: item,
              category: sleepCategory,
              currentFactor: sleepFactors.find((factor) => factor.factorKey === item.key),
              onUpsertFactor,
              onRemoveFactor,
            })
          )}
        </div>
      </DarkCard>

      <QuickEntryPickerSheet
        isOpen={isPickerOpen}
        title="Sleep Factors"
        subtitle="Reveal the sleep factors you want available on this screen."
        options={pickerOptions}
        onClose={() => setIsPickerOpen(false)}
        onToggle={onToggleSleepItemVisibility}
      />
    </>
  );
}

/**
 * FactorsEntryCard mirrors the Bearable category stack while adapting the row
 * contents to the app's calmer touch targets and copy.
 */
export function FactorsEntryCard({
  factors,
  visibleCategoryKeys,
  visibleItemKeysByCategory,
  onToggleCategoryVisibility,
  onToggleItemVisibility,
  onUpsertFactor,
  onRemoveFactor,
}: FactorsEntryCardProps) {
  const [expandedCategoryKey, setExpandedCategoryKey] = useState<string | null>(visibleCategoryKeys[0] ?? null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [itemPickerCategoryKey, setItemPickerCategoryKey] = useState<string | null>(null);

  const visibleCategories = QUICK_ENTRY_FACTOR_CATEGORIES.filter(
    (category) => category.key !== 'sleep' && visibleCategoryKeys.includes(category.key)
  );

  const categoryPickerOptions: QuickEntryPickerOption[] = QUICK_ENTRY_FACTOR_CATEGORIES
    .filter((category) => category.key !== 'sleep')
    .map((category) => ({
      id: category.key,
      label: category.label,
      description: `${category.items.length} curated entries`,
      icon: category.icon,
      selected: visibleCategoryKeys.includes(category.key),
    }));

  const activeItemPickerCategory = itemPickerCategoryKey
    ? QUICK_ENTRY_FACTOR_CATEGORIES.find((category) => category.key === itemPickerCategoryKey)
    : undefined;

  const itemPickerOptions: QuickEntryPickerOption[] = activeItemPickerCategory
    ? activeItemPickerCategory.items.map((item) => ({
        id: item.key,
        label: item.label,
        icon: item.icon,
        selected: (visibleItemKeysByCategory[activeItemPickerCategory.key] ?? []).includes(item.key) || Boolean(item.defaultVisible),
      }))
    : [];

  return (
    <>
      <DarkCard
        icon="neurology"
        title="Other Factors"
      >
        <div className="space-y-2">
          {visibleCategories.map((category) => {
            const isExpanded = expandedCategoryKey === category.key;
            const visibleItems = category.items.filter((item) => {
              const visibleKeys = visibleItemKeysByCategory[category.key] ?? [];
              return visibleKeys.includes(item.key) || Boolean(item.defaultVisible);
            });

            return (
              <div key={category.key} className="overflow-hidden rounded-xl border border-primary/8 bg-white/75">
                <button
                  type="button"
                  onClick={() => setExpandedCategoryKey(isExpanded ? null : category.key)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/4 text-primary/60">
                      <MaterialIcon name={category.icon} size="xs" />
                    </span>
                    <span className="truncate text-[12px] font-semibold uppercase tracking-[0.04em] text-primary/80">
                      {category.label}
                    </span>
                  </div>
                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size="sm" className="text-primary/55" />
                </button>

                {isExpanded ? (
                  <div className="space-y-2 border-t border-primary/8 px-3 py-2.5">
                    {visibleItems.map((item) =>
                      renderFactorRow({
                        definition: item,
                        category,
                        currentFactor: factors.find((factor) => factor.factorKey === item.key),
                        onUpsertFactor,
                        onRemoveFactor,
                      })
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setItemPickerCategoryKey(category.key)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3 text-[11px] font-medium text-primary transition hover:border-primary/20 hover:bg-primary/3"
                      >
                        <MaterialIcon name="add_circle" size="xs" />
                        Add item
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleCategoryVisibility(category.key)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/5 px-3 text-[11px] font-medium text-primary/65 transition hover:bg-primary/8 hover:text-primary"
                      >
                        <MaterialIcon name="visibility_off" size="xs" />
                        Hide category
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCategoryPickerOpen(true)}
            className="mx-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3.5 text-[12px] font-semibold text-primary transition hover:border-primary/20 hover:bg-primary/3"
          >
            <MaterialIcon name="add" size="sm" />
            Add category
          </button>
        </div>
      </DarkCard>

      <QuickEntryPickerSheet
        isOpen={isCategoryPickerOpen}
        title="Factor Categories"
        subtitle="Choose which curated categories should appear in quick entry."
        options={categoryPickerOptions}
        onClose={() => setIsCategoryPickerOpen(false)}
        onToggle={onToggleCategoryVisibility}
      />

      <QuickEntryPickerSheet
        isOpen={Boolean(activeItemPickerCategory)}
        title={activeItemPickerCategory ? `${activeItemPickerCategory.label} Factors` : 'Factor Items'}
        subtitle="Reveal more curated options for this category."
        options={itemPickerOptions}
        onClose={() => setItemPickerCategoryKey(null)}
        onToggle={(itemId) => {
          if (activeItemPickerCategory) {
            onToggleItemVisibility(activeItemPickerCategory.key, itemId);
          }
        }}
      />
    </>
  );
}

/**
 * MeasurementsEntryCard keeps starter metrics visible and uses plus buttons to
 * open focused numeric input sheets for individual measurements.
 */
export function MeasurementsEntryCard({
  measurements,
  visibleMeasurementKeys,
  onToggleMeasurementVisibility,
  onUpsertMeasurement,
  onRemoveMeasurement,
}: MeasurementsEntryCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingMetricKey, setEditingMetricKey] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const visibleMetrics = useMemo(
    () => QUICK_ENTRY_MEASUREMENTS.filter((metric) => visibleMeasurementKeys.includes(metric.key)),
    [visibleMeasurementKeys]
  );

  const pickerOptions: QuickEntryPickerOption[] = QUICK_ENTRY_MEASUREMENTS.map((metric) => ({
    id: metric.key,
    label: metric.label,
    description: metric.unit,
    icon: metric.icon,
    selected: visibleMeasurementKeys.includes(metric.key),
  }));

  const editingMetricDefinition = editingMetricKey
    ? getMeasurementDefinition(editingMetricKey as QuickEntryMeasurementKey)
    : undefined;
  const existingMeasurement = editingMetricDefinition
    ? measurements.find((measurement) => measurement.metricKey === editingMetricDefinition.key)
    : undefined;

  /**
   * openMetricEditor seeds the editor from the current saved value so users can
   * quickly overwrite a measurement instead of retyping from scratch.
   */
  function openMetricEditor(metricKey: string) {
    const metricDefinition = getMeasurementDefinition(metricKey as QuickEntryMeasurementKey);
    const currentMeasurement = metricDefinition
      ? measurements.find((measurement) => measurement.metricKey === metricDefinition.key)
      : undefined;

    setEditingMetricKey(metricKey);
    setValue(typeof currentMeasurement?.value === 'number' ? String(currentMeasurement.value) : '');
    setNotes(currentMeasurement?.notes ?? '');
  }

  /**
   * saveMeasurementDraft writes the current metric editor back into the parent
   * quick-entry snapshot.
   */
  function saveMeasurementDraft() {
    if (!editingMetricDefinition || !value.trim()) {
      return;
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      return;
    }

    onUpsertMeasurement({
      id: existingMeasurement?.id ?? createDraftId('measurement'),
      metricKey: editingMetricDefinition.key,
      metricName: editingMetricDefinition.label,
      unit: editingMetricDefinition.unit,
      value: parsedValue,
      notes: notes.trim() || undefined,
    });

    setEditingMetricKey(null);
  }

  return (
    <>
      <DarkCard
        icon="favorite"
        title="Health Measurements"
      >
        <div className="space-y-2">
          {visibleMetrics.map((metric) => {
            const currentMeasurement = measurements.find((measurement) => measurement.metricKey === metric.key);

            return (
              <div
                key={metric.key}
                className="flex items-center justify-between gap-2 rounded-xl border border-primary/8 bg-white/80 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-mint/30 text-primary/70">
                    <MaterialIcon name={metric.icon} size="xs" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-primary">{metric.label}</p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {currentMeasurement ? `${currentMeasurement.value} ${metric.unit}` : metric.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openMetricEditor(metric.key)}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-primary/10 bg-primary/3 px-2.5 text-[11px] font-medium text-primary transition hover:border-primary/20 hover:bg-primary/5"
                    aria-label={`Log ${metric.label}`}
                  >
                    <MaterialIcon name={currentMeasurement ? 'edit' : 'add'} size="xs" />
                    {currentMeasurement ? 'Edit' : 'Log'}
                  </button>
                  {currentMeasurement ? (
                    <button
                      type="button"
                      onClick={() => onRemoveMeasurement(currentMeasurement.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary/55 transition hover:bg-primary/8 hover:text-primary"
                      aria-label={`Remove ${metric.label}`}
                    >
                      <MaterialIcon name="delete" size="sm" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="mx-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/10 bg-white px-3.5 text-[12px] font-semibold text-primary transition hover:border-primary/20 hover:bg-primary/3"
          >
            <MaterialIcon name="add" size="sm" />
            Add metric
          </button>
        </div>
      </DarkCard>

      <QuickEntryPickerSheet
        isOpen={isPickerOpen}
        title="Health Measurements"
        subtitle="Choose which preloaded metrics should appear in quick entry."
        options={pickerOptions}
        onClose={() => setIsPickerOpen(false)}
        onToggle={onToggleMeasurementVisibility}
      />

      <FormSheet
        isOpen={Boolean(editingMetricDefinition)}
        title={editingMetricDefinition ? `Log ${editingMetricDefinition.label}` : 'Log Measurement'}
        onClose={() => setEditingMetricKey(null)}
      >
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-white/70">Value ({editingMetricDefinition?.unit})</span>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="decimal"
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder={editingMetricDefinition?.unit}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-white/70">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder="Optional context"
            />
          </label>
          <button
            type="button"
            onClick={saveMeasurementDraft}
            className="w-full rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92"
          >
            Save measurement
          </button>
        </div>
      </FormSheet>
    </>
  );
}
