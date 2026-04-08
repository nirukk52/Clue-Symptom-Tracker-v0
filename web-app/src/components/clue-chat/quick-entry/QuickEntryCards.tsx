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
 * DarkCard keeps all Bearable-inspired quick-entry cards visually consistent
 * with the app's calmer dark-sheet treatment inside the cream shell.
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
    <section className="overflow-hidden rounded-[28px] border border-primary/10 bg-[#1f1f23] text-white shadow-[0_22px_48px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/30 bg-black/20 text-white/80">
            <MaterialIcon name={icon} size="md" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold tracking-tight">{title}</h3>
            {subtitle ? <p className="mt-1 text-[12px] text-white/60">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
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
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-t-[28px] border border-primary/10 bg-[#1f1f23] text-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <p className="text-[16px] font-semibold">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
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
 * RatingSquares renders a large-touch 1-10 selector aligned with the supplied
 * mood/sleep screenshot pattern.
 */
function RatingSquares({
  value,
  onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`rounded-[18px] border px-4 py-6 text-center text-[28px] font-semibold transition ${
            rating === value
              ? 'border-accent-mint/70 bg-accent-mint/15 text-accent-mint shadow-[0_0_0_1px_rgba(184,227,214,0.3)]'
              : 'border-white/10 bg-white/7 text-white/82 hover:border-white/20 hover:bg-white/10'
          }`}
        >
          {rating}
        </button>
      ))}
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
    <div className="flex items-center gap-2">
      {options.map((option) => {
        const isActive = option.value === rating || (option.value === undefined && rating === undefined);

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex h-14 w-14 items-center justify-center rounded-[18px] border transition ${
              isActive
                ? 'border-accent-blue/70 bg-accent-blue/15 text-accent-blue'
                : 'border-white/10 bg-white/7 text-white/75 hover:border-white/18 hover:bg-white/10'
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
                    className={`w-1.5 rounded-full ${
                      index < (option.bars ?? 0) ? 'bg-current' : 'bg-current/25'
                    }`}
                    style={{ height: `${10 + index * 8}px` }}
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
      subtitle="Log the emotional tone of today in one tap."
      action={<MaterialIcon name="more_horiz" size="sm" className="text-white/45" />}
    >
      <div className="space-y-4">
        <RatingSquares
          value={mood?.rating}
          onChange={(rating) => onChange({ rating, note: mood?.note })}
        />
        <textarea
          value={mood?.note ?? ''}
          onChange={(event) => onChange(mood ? { ...mood, note: event.target.value } : { rating: 5, note: event.target.value })}
          placeholder="Optional context for your mood today..."
          rows={2}
          className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[13px] text-white placeholder:text-white/35 outline-none transition focus:border-accent-mint/50 focus:bg-white/8"
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
        subtitle="Keep your current meds visible so daily logging stays one tap away."
        action={<MaterialIcon name="more_horiz" size="sm" className="text-white/45" />}
      >
        <div className="space-y-3">
          {medications.length > 0 ? (
            medications.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">{medication.medicationName}</p>
                  <p className="mt-1 text-[12px] text-white/58">
                    {[medication.dosage, medication.timing, medication.taken ? 'Taken' : 'Skipped']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor(medication)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-dashed border-white/28 bg-white/8 text-white transition hover:border-white/40 hover:bg-white/12"
                    aria-label={`Edit ${medication.medicationName}`}
                  >
                    <MaterialIcon name="add" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(medication.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${medication.medicationName}`}
                  >
                    <MaterialIcon name="delete" size="sm" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 px-4 py-5 text-[13px] text-white/58">
              Add the meds or supplements you want available for fast daily logging.
            </div>
          )}

          <button
            type="button"
            onClick={() => openEditor()}
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/12"
          >
            <MaterialIcon name="add" size="sm" />
            Add / Edit
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
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
              placeholder="e.g. Bactrim"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-white/70">Dosage</span>
              <input
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
                placeholder="1 tablet"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-white/70">Timing</span>
              <input
                value={timing}
                onChange={(event) => setTiming(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
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
                    ? 'border-accent-mint/60 bg-accent-mint/15 text-accent-mint'
                    : 'border-white/10 bg-white/6 text-white/70'
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
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
              placeholder="Optional context"
            />
          </label>
          <button
            type="button"
            onClick={saveMedicationDraft}
            className="w-full rounded-full bg-white px-4 py-3 text-[14px] font-semibold text-primary transition hover:bg-white/90"
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
      className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white/75">
            <MaterialIcon name={definition.icon} size="sm" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-white">{definition.label}</p>
            <p className="mt-1 text-[11px] text-white/55">{category.label}</p>
          </div>
        </div>
        {currentFactor ? (
          <button
            type="button"
            onClick={() => onRemoveFactor(currentFactor.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={`Remove ${definition.label}`}
          >
            <MaterialIcon name="close" size="sm" />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
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
            className={`inline-flex rounded-full border px-4 py-2 text-[12px] font-medium transition ${
              currentFactor
                ? 'border-accent-mint/60 bg-accent-mint/15 text-accent-mint'
                : 'border-white/12 bg-white/6 text-white/75 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {currentFactor ? 'Logged for today' : 'Tap to log'}
          </button>
        )}
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
        subtitle="Keep sleep quality and sleep factors together on low-energy days."
        action={
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Edit sleep factors"
          >
            <MaterialIcon name="add" size="sm" />
          </button>
        }
      >
        <div className="space-y-3">
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
        subtitle="Keep likely triggers and supports visible without turning tracking into a chore."
        action={<MaterialIcon name="more_horiz" size="sm" className="text-white/45" />}
      >
        <div className="space-y-3">
          {visibleCategories.map((category) => {
            const isExpanded = expandedCategoryKey === category.key;
            const visibleItems = category.items.filter((item) => {
              const visibleKeys = visibleItemKeysByCategory[category.key] ?? [];
              return visibleKeys.includes(item.key) || Boolean(item.defaultVisible);
            });

            return (
              <div key={category.key} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
                <button
                  type="button"
                  onClick={() => setExpandedCategoryKey(isExpanded ? null : category.key)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-white/75">
                      <MaterialIcon name={category.icon} size="sm" />
                    </span>
                    <span className="truncate text-[15px] font-semibold uppercase tracking-[0.04em] text-white/82">
                      {category.label}
                    </span>
                  </div>
                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size="sm" className="text-white/75" />
                </button>

                {isExpanded ? (
                  <div className="space-y-3 border-t border-white/8 px-4 py-4">
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
                        className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-[12px] font-medium text-white/85 transition hover:bg-white/12"
                      >
                        <MaterialIcon name="add_circle" size="xs" />
                        Add item
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleCategoryVisibility(category.key)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-[12px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
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
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/12"
          >
            <MaterialIcon name="add" size="sm" />
            Add / Edit
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
        subtitle="Keep the metrics you care about one tap away."
        action={<MaterialIcon name="more_horiz" size="sm" className="text-white/45" />}
      >
        <div className="space-y-3">
          {visibleMetrics.map((metric) => {
            const currentMeasurement = measurements.find((measurement) => measurement.metricKey === metric.key);

            return (
              <div
                key={metric.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-accent-mint">
                    <MaterialIcon name={metric.icon} size="sm" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-white">{metric.label}</p>
                    <p className="mt-1 text-[12px] text-white/58">
                      {currentMeasurement ? `${currentMeasurement.value} ${metric.unit}` : metric.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openMetricEditor(metric.key)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-dashed border-white/28 bg-white/8 text-white transition hover:border-white/40 hover:bg-white/12"
                    aria-label={`Log ${metric.label}`}
                  >
                    <MaterialIcon name="add" size="sm" />
                  </button>
                  {currentMeasurement ? (
                    <button
                      type="button"
                      onClick={() => onRemoveMeasurement(currentMeasurement.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-white/60 transition hover:bg-white/10 hover:text-white"
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
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/12"
          >
            <MaterialIcon name="add" size="sm" />
            Add / Edit
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
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
              placeholder={editingMetricDefinition?.unit}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-white/70">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white outline-none transition focus:border-accent-mint/50"
              placeholder="Optional context"
            />
          </label>
          <button
            type="button"
            onClick={saveMeasurementDraft}
            className="w-full rounded-full bg-white px-4 py-3 text-[14px] font-semibold text-primary transition hover:bg-white/90"
          >
            Save measurement
          </button>
        </div>
      </FormSheet>
    </>
  );
}
