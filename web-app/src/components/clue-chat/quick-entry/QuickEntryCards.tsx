'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  buildQuickEntryMedicationId,
  getFactorCategory,
  getMeasurementDefinition,
  QUICK_ENTRY_FACTOR_CATEGORIES,
  QUICK_ENTRY_MEASUREMENTS,
  type QuickEntryFactorCategoryDefinition,
  type QuickEntryFactorDraft,
  type QuickEntryMedicationGroup,
  type QuickEntryMeasurementKey,
  type QuickEntryMeasurementDraft,
  type QuickEntryMedicationDraft,
  type QuickEntryMoodDraft,
  type QuickEntrySavedMedication,
  toQuickEntrySavedMedication,
} from '@/lib/quick-entry';

import { QuickEntryPickerSheet, type QuickEntryPickerOption } from './QuickEntryPickerSheet';

interface MoodEntryCardProps {
  mood: QuickEntryMoodDraft | null;
  onChange: (nextMood: QuickEntryMoodDraft | null) => void;
}

interface MedicationEntryCardProps {
  medications: QuickEntryMedicationDraft[];
  savedMedications: QuickEntrySavedMedication[];
  medicationGroups: QuickEntryMedicationGroup[];
  onMedicationGroupsChange: (groups: QuickEntryMedicationGroup[]) => void;
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
 * normalizeMoodNote keeps the mood note aligned with the compact card styling by
 * capitalizing the first meaningful character even when the keyboard does not.
 */
function normalizeMoodNote(note: string): string {
  const firstLetterIndex = note.search(/[A-Za-z]/);

  if (firstLetterIndex === -1) {
    return note;
  }

  return `${note.slice(0, firstLetterIndex)}${note.charAt(firstLetterIndex).toUpperCase()}${note.slice(firstLetterIndex + 1)}`;
}

/**
 * getCurrentMoodTime returns the user's current local time in the compact HH:MM
 * format stored by the quick-entry mood dropdown.
 */
function getCurrentMoodTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * formatMoodTimeLabel turns a stored HH:MM value into the friendlier label shown
 * in the mood-time dropdown.
 */
function formatMoodTimeLabel(time: string): string {
  const [hoursString, minutesString] = time.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return time;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hours, minutes));
}

/**
 * buildMoodTimeOptions keeps the dropdown compact by offering half-hour anchors
 * plus the user's current time when it does not already land on one.
 */
function buildMoodTimeOptions(currentTime: string): Array<{ value: string; label: string }> {
  const options = Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, '0');
    const minutes = index % 2 === 0 ? '00' : '30';
    const value = `${hours}:${minutes}`;

    return {
      value,
      label: formatMoodTimeLabel(value),
    };
  });

  if (!options.some((option) => option.value === currentTime)) {
    options.push({
      value: currentTime,
      label: `Current time · ${formatMoodTimeLabel(currentTime)}`,
    });
  }

  return options.sort((leftOption, rightOption) => leftOption.value.localeCompare(rightOption.value));
}

/**
 * buildMedicationTimeOptions keeps medication logging on a consistent time
 * dropdown while preserving any previously saved timing value during edits.
 */
function buildMedicationTimeOptions(selectedTime?: string): Array<{ value: string; label: string }> {
  const options = buildMoodTimeOptions(getCurrentMoodTime());
  const trimmedSelectedTime = selectedTime?.trim();

  if (trimmedSelectedTime && !options.some((option) => option.value === trimmedSelectedTime)) {
    options.push({
      value: trimmedSelectedTime,
      label: formatMoodTimeLabel(trimmedSelectedTime),
    });
  }

  return options.sort((leftOption, rightOption) => leftOption.value.localeCompare(rightOption.value));
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
  headerClassName,
  className,
  bodyClassName,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  headerClassName?: string;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-primary/8 bg-linear-to-r from-accent-mint/10 via-white to-accent-purple/10 text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
        className ?? ''
      }`}
    >
      <div className={`flex items-start justify-between gap-2 px-3 py-3 ${headerClassName ?? ''}`}>
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
      <div className={`px-3 pb-3 ${bodyClassName ?? ''}`}>{children}</div>
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
 * MOOD_RATING_OPTIONS translates the slider's warm-to-calm color progression
 * into fixed buttons so mood logging feels closer to the supplied Bearable grid.
 */
const MOOD_RATING_OPTIONS = [
  {
    value: 1,
    icon: 'sentiment_very_dissatisfied',
    textClassName: 'text-rose-300',
    numberClassName: 'text-rose-300',
    borderClassName: 'border-accent-rose/45',
    activeClassName: 'border-rose-300 bg-rose-100/70',
  },
  {
    value: 2,
    icon: 'sentiment_very_dissatisfied',
    textClassName: 'text-rose-300',
    numberClassName: 'text-rose-300',
    borderClassName: 'border-accent-rose/45',
    activeClassName: 'border-rose-300 bg-rose-100/70',
  },
  {
    value: 3,
    icon: 'sentiment_dissatisfied',
    textClassName: 'text-orange-300',
    numberClassName: 'text-orange-300',
    borderClassName: 'border-accent-peach/45',
    activeClassName: 'border-orange-300 bg-orange-100/70',
  },
  {
    value: 4,
    icon: 'sentiment_dissatisfied',
    textClassName: 'text-orange-300',
    numberClassName: 'text-orange-300',
    borderClassName: 'border-accent-peach/45',
    activeClassName: 'border-orange-300 bg-orange-100/70',
  },
  {
    value: 5,
    icon: 'sentiment_neutral',
    textClassName: 'text-amber-300',
    numberClassName: 'text-amber-300',
    borderClassName: 'border-accent-yellow/60',
    activeClassName: 'border-amber-300 bg-amber-100/70',
  },
  {
    value: 6,
    icon: 'sentiment_neutral',
    textClassName: 'text-amber-300',
    numberClassName: 'text-amber-300',
    borderClassName: 'border-accent-yellow/60',
    activeClassName: 'border-amber-300 bg-amber-100/70',
  },
  {
    value: 7,
    icon: 'sentiment_satisfied',
    textClassName: 'text-emerald-300',
    numberClassName: 'text-emerald-300',
    borderClassName: 'border-accent-mint/60',
    activeClassName: 'border-emerald-300 bg-emerald-100/70',
  },
  {
    value: 8,
    icon: 'sentiment_satisfied',
    textClassName: 'text-emerald-300',
    numberClassName: 'text-emerald-300',
    borderClassName: 'border-accent-mint/60',
    activeClassName: 'border-emerald-300 bg-emerald-100/70',
  },
  {
    value: 9,
    icon: 'sentiment_very_satisfied',
    textClassName: 'text-cyan-300',
    numberClassName: 'text-cyan-300',
    borderClassName: 'border-accent-blue/55',
    activeClassName: 'border-cyan-300 bg-cyan-100/70',
  },
  {
    value: 10,
    icon: 'sentiment_very_satisfied',
    textClassName: 'text-cyan-300',
    numberClassName: 'text-cyan-300',
    borderClassName: 'border-accent-blue/55',
    activeClassName: 'border-cyan-300 bg-cyan-100/70',
  },
] as const;

/**
 * RatingSquares keeps mood logging self-contained so the quick-entry mood card
 * can mirror the reference grid without a second layer of chrome around it.
 */
function RatingSquares({
  value,
  time,
  note,
  hasPendingLogAction,
  onChange,
  onTimeChange,
  onNoteChange,
  onDone,
}: {
  value?: number;
  time?: string;
  note?: string;
  hasPendingLogAction: boolean;
  onChange: (value: number) => void;
  onTimeChange: (time: string) => void;
  onNoteChange: (note: string) => void;
  onDone: () => void;
}) {
  const safeValue = value ?? 5;
  const currentTime = useMemo(() => getCurrentMoodTime(), []);
  const selectedTime = time ?? currentTime;
  const selectedTimeLabel = useMemo(() => formatMoodTimeLabel(selectedTime), [selectedTime]);
  const moodTimeOptions = useMemo(() => buildMoodTimeOptions(currentTime), [currentTime]);
  const topRowOptions = MOOD_RATING_OPTIONS.filter((option) => option.value % 2 === 1);
  const buttonRows = [
    MOOD_RATING_OPTIONS.filter((option) => option.value % 2 === 1),
    MOOD_RATING_OPTIONS.filter((option) => option.value % 2 === 0),
  ];

  return (
    <div className="rounded-[28px] border border-primary/8 bg-linear-to-r from-accent-rose/14 via-accent-yellow/18 to-accent-mint/18 p-2.5 text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-2 flex items-start justify-between gap-2.5">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-primary">How is your mood today?</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
            Tap the number that best matches how you feel right now.
          </p>
        </div>
        <div className="relative flex shrink-0 items-center gap-1 rounded-full border border-primary/8 bg-white/90 px-3 py-1 shadow-sm">
          <span className="whitespace-nowrap text-[11px] font-semibold text-primary">{selectedTimeLabel}</span>
          <span className="inline-flex w-3 shrink-0 items-center justify-center text-primary/55">
            <MaterialIcon name="expand_more" size="xs" />
          </span>
          <label className="sr-only" htmlFor="quick-entry-mood-time">
            Mood time
          </label>
          <select
            id="quick-entry-mood-time"
            value={selectedTime}
            onChange={(event) => onTimeChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
            aria-label="Mood time"
          >
            {moodTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-5 gap-1.5">
        {topRowOptions.map((option) => (
          <div key={`mood-icon-${option.value}`} className="flex justify-center">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/70 shadow-sm ${option.textClassName} ${option.borderClassName}`}
              aria-hidden="true"
            >
              <MaterialIcon name={option.icon} size="sm" />
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {buttonRows.map((row, rowIndex) => (
          <div key={`mood-row-${rowIndex}`} className="grid grid-cols-5 gap-1.5">
            {row.map((option) => {
              const isActive = safeValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  aria-pressed={isActive}
                  aria-label={`Set mood to ${option.value} out of 10`}
                  className={`flex h-[48px] items-center justify-center rounded-xl border text-[22px] font-bold tracking-tight transition ${option.numberClassName} ${
                    isActive
                      ? `${option.activeClassName} border-2`
                      : `${option.borderClassName} bg-white/92 hover:bg-white`
                  }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-2xl border border-primary/8 bg-white/72 p-1.5">
        <label className="sr-only" htmlFor="quick-entry-mood-note">
          Additional context for today&apos;s mood
        </label>
        <input
          id="quick-entry-mood-note"
          type="text"
          value={note ?? ''}
          onChange={(event) => onNoteChange(normalizeMoodNote(event.target.value))}
          placeholder="Additional context"
          autoCapitalize="sentences"
          className="h-8 w-full bg-transparent px-2 text-[12px] font-semibold tracking-tight text-primary placeholder:font-semibold placeholder:text-primary/55 outline-none"
        />
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onDone}
          disabled={!hasPendingLogAction}
          className={`flex h-10 w-full items-center justify-center gap-2 rounded-full border px-5 text-[12px] font-semibold transition ${
            hasPendingLogAction
              ? 'border-primary bg-primary text-white hover:bg-primary/92'
              : 'cursor-not-allowed border-primary/8 bg-white/55 text-primary/35'
          }`}
        >
          {hasPendingLogAction ? <MaterialIcon name="check" size="xs" /> : null}
          {hasPendingLogAction ? `Log ${safeValue}/10 at ${selectedTimeLabel}` : 'Done'}
        </button>
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
 * QUICK_DURATION_HOUR_OPTIONS keeps the inline sleep-duration picker fast enough
 * for mobile use without requiring freeform typing.
 */
const QUICK_DURATION_HOUR_OPTIONS = Array.from({ length: 16 }, (_, index) => index + 1);

/**
 * QUICK_DURATION_MINUTE_OPTIONS limits minute selection to common quarter-hour
 * increments so the sleep row stays compact.
 */
const QUICK_DURATION_MINUTE_OPTIONS = [0, 15, 30, 45];

/**
 * parseDurationNote rebuilds the stored duration string into select-friendly
 * values when the quick-entry screen reloads saved sleep data.
 */
function parseDurationNote(note?: string): { hours: string; minutes: string } {
  if (!note) {
    return { hours: '', minutes: '00' };
  }

  const hoursMatch = note.match(/(\d+)\s*h/i);
  const minutesMatch = note.match(/(\d+)\s*m/i);

  return {
    hours: hoursMatch?.[1] ?? '',
    minutes: minutesMatch?.[1]?.padStart(2, '0') ?? '00',
  };
}

/**
 * buildDurationNote keeps duration rows compatible with the existing factor
 * schema by persisting the selected time as a readable note string.
 */
function buildDurationNote(hours: number, minutes: number): string {
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(' ');
}

/**
 * SleepDurationControl gives duration-based sleep items a dedicated inline
 * picker so they do not fall back to the generic "Tap to log" affordance.
 */
function SleepDurationControl({
  definition,
  currentFactor,
  category,
  onUpsertFactor,
  onRemoveFactor,
}: {
  definition: { key: string; label: string; icon: string };
  currentFactor?: QuickEntryFactorDraft;
  category: QuickEntryFactorCategoryDefinition;
  onUpsertFactor: (factor: QuickEntryFactorDraft) => void;
  onRemoveFactor: (factorId: string) => void;
}) {
  const selectedDuration = parseDurationNote(currentFactor?.notes);

  /**
   * updateDuration rewrites the factor row whenever either select changes so
   * the row behaves like a quick picker instead of a secondary form flow.
   */
  function updateDuration(nextHours: string, nextMinutes: string) {
    const hours = Number(nextHours || 0);
    const minutes = Number(nextMinutes || 0);

    if (hours === 0 && minutes === 0) {
      if (currentFactor) {
        onRemoveFactor(currentFactor.id);
      }
      return;
    }

    onUpsertFactor({
      id: currentFactor?.id ?? createDraftId('factor'),
      categoryKey: category.key,
      categoryLabel: category.label,
      factorKey: definition.key,
      factorName: definition.label,
      notes: buildDurationNote(hours, minutes),
    });
  }

  return (
    <div className="rounded-xl border border-primary/8 bg-white/80 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/4 text-primary/60">
            <MaterialIcon name={definition.icon} size="xs" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-primary">{definition.label}</p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {currentFactor?.notes ?? 'Choose hours and minutes'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <label className="sr-only" htmlFor={`${definition.key}-hours`}>
            {definition.label} hours
          </label>
          <select
            id={`${definition.key}-hours`}
            value={selectedDuration.hours}
            onChange={(event) => updateDuration(event.target.value, selectedDuration.minutes)}
            className="h-8 rounded-full border border-primary/10 bg-primary/3 px-2 text-[11px] font-medium text-primary outline-none transition focus:border-primary/20"
            aria-label={`${definition.label} hours`}
          >
            <option value="">Hr</option>
            {QUICK_DURATION_HOUR_OPTIONS.map((hour) => (
              <option key={`${definition.key}-hour-${hour}`} value={String(hour)}>
                {hour}h
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${definition.key}-minutes`}>
            {definition.label} minutes
          </label>
          <select
            id={`${definition.key}-minutes`}
            value={selectedDuration.minutes}
            onChange={(event) => updateDuration(selectedDuration.hours, event.target.value)}
            className="h-8 rounded-full border border-primary/10 bg-primary/3 px-2 text-[11px] font-medium text-primary outline-none transition focus:border-primary/20"
            aria-label={`${definition.label} minutes`}
          >
            {QUICK_DURATION_MINUTE_OPTIONS.map((minute) => {
              const label = `${String(minute).padStart(2, '0')}m`;
              return (
                <option key={`${definition.key}-minute-${minute}`} value={String(minute).padStart(2, '0')}>
                  {label}
                </option>
              );
            })}
          </select>
          {currentFactor ? (
            <button
              type="button"
              onClick={() => onRemoveFactor(currentFactor.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary/55 transition hover:bg-primary/8 hover:text-primary"
              aria-label={`Clear ${definition.label}`}
            >
              <MaterialIcon name="close" size="sm" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * MoodEntryCard adapts the Bearable mood grid to Clue's warm quick-entry shell.
 */
function MoodEntryCardContent({ mood, onChange }: MoodEntryCardProps) {
  const [draftTime, setDraftTime] = useState(() => mood?.time ?? getCurrentMoodTime());
  const [draftNote, setDraftNote] = useState(mood?.note ?? '');
  const [hasPendingLogAction, setHasPendingLogAction] = useState(false);

  return (
    <RatingSquares
      value={mood?.rating}
      time={mood?.time ?? draftTime}
      note={mood?.note ?? draftNote}
      hasPendingLogAction={hasPendingLogAction}
      onChange={(rating) =>
        {
          setHasPendingLogAction(true);
          onChange({
            rating,
            time: mood?.time ?? draftTime,
            note: (mood?.note ?? draftNote) || undefined,
          });
        }
      }
      onTimeChange={(time) => {
        setDraftTime(time);
        if (mood) {
          onChange({ ...mood, time });
        }
      }}
      onNoteChange={(note) => {
        setDraftNote(note);
        if (mood) {
          onChange({ ...mood, note });
        }
      }}
      onDone={() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setHasPendingLogAction(false);
      }}
    />
  );
}

/**
 * MoodEntryCard keeps draft note/time local until a rating is explicitly chosen,
 * which lets the CTA represent a fresh log action instead of preloaded data.
 */
export function MoodEntryCard({ mood, onChange }: MoodEntryCardProps) {
  return <MoodEntryCardContent mood={mood} onChange={onChange} />;
}

/**
 * buildMedicationSubtitle keeps quick-add rows readable without repeating empty
 * separators when only part of the saved medication metadata is present.
 */
function buildMedicationSubtitle(
  medication: Pick<QuickEntrySavedMedication, 'dosage' | 'timing'> & { taken?: boolean }
): string {
  return [medication.dosage, medication.timing, typeof medication.taken === 'boolean' ? (medication.taken ? 'Taken' : 'Skipped') : null]
    .filter(Boolean)
    .join(' · ');
}

interface ParsedMedicationDosage {
  quantity: number;
  unit: string;
}

/**
 * normalizeMedicationUnit keeps dosage grouping stable even when logs switch
 * between singular and plural unit labels like tablet/tablets.
 */
function normalizeMedicationUnit(unit: string): string {
  const compactUnit = unit.trim().toLowerCase().replace(/\s+/g, ' ');

  if (compactUnit.endsWith('ies')) {
    return `${compactUnit.slice(0, -3)}y`;
  }

  if (compactUnit.endsWith('s') && !compactUnit.endsWith('ss')) {
    return compactUnit.slice(0, -1);
  }

  return compactUnit;
}

/**
 * parseMedicationDosage extracts the numeric quantity and reusable unit so the
 * card can present per-dose chips and daily totals for one medication family.
 */
function parseMedicationDosage(dosage?: string): ParsedMedicationDosage | null {
  const trimmedDosage = dosage?.trim();
  if (!trimmedDosage) {
    return null;
  }

  const quantityOnlyMatch = trimmedDosage.match(/^(\d+(?:\.\d+)?)$/);
  if (quantityOnlyMatch) {
    const quantity = Number(quantityOnlyMatch[1]);
    return Number.isFinite(quantity)
      ? {
          quantity,
          unit: '',
        }
      : null;
  }

  const match = trimmedDosage.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!match) {
    return null;
  }

  const quantity = Number(match[1]);
  if (!Number.isFinite(quantity)) {
    return null;
  }

  return {
    quantity,
    unit: normalizeMedicationUnit(match[2]),
  };
}

/**
 * formatMedicationQuantity keeps chip and editor labels readable by dropping
 * trailing decimal noise for whole-number quantities.
 */
function formatMedicationQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1).replace(/\.0$/, '');
}

/**
 * formatMedicationUnit mirrors Bearable's singular/plural dosage copy for the
 * inline summary pill and quantity editor.
 */
function formatMedicationUnit(unit: string, quantity: number): string {
  if (!unit) {
    return '';
  }

  if (Math.abs(quantity - 1) < 0.001) {
    return unit;
  }

  if (unit.endsWith('y') && !/[aeiou]y$/.test(unit)) {
    return `${unit.slice(0, -1)}ies`;
  }

  return `${unit}s`;
}

/**
 * formatMedicationDosage rebuilds a quantity plus base unit into the dosage text
 * persisted by quick entry and reused across reloads.
 */
function formatMedicationDosage(quantity: number, unit: string): string {
  const formattedUnit = formatMedicationUnit(unit, quantity);
  return [formatMedicationQuantity(quantity), formattedUnit].filter(Boolean).join(' ');
}

/**
 * buildMedicationDoseChipLabel keeps the small dose chip compact by preferring
 * the extracted quantity and only falling back to raw dosage text when needed.
 */
function buildMedicationDoseChipLabel(dosage?: string): string {
  const parsedDosage = parseMedicationDosage(dosage);
  if (parsedDosage) {
    return formatMedicationQuantity(parsedDosage.quantity);
  }

  return dosage?.trim() || '1';
}

/**
 * buildMedicationFamilyKey keeps one visible row per medication name so dose
 * events for the same med cluster together like the Bearable reference.
 */
function buildMedicationFamilyKey(params: { medicationName: string; dosage?: string }): string {
  return params.medicationName.trim().toLowerCase();
}

/**
 * pickRepresentativeMedicationShortcut chooses the baseline shortcut displayed in
 * the row header when a medication family has multiple saved dosage variants.
 */
function pickRepresentativeMedicationShortcut(
  savedOptions: QuickEntrySavedMedication[],
  medicationName: string
): QuickEntrySavedMedication {
  const preferredOption = savedOptions
    .slice()
    .sort((leftOption, rightOption) => {
      const leftDosage = parseMedicationDosage(leftOption.dosage);
      const rightDosage = parseMedicationDosage(rightOption.dosage);
      const leftDistance = Math.abs((leftDosage?.quantity ?? 1) - 1);
      const rightDistance = Math.abs((rightDosage?.quantity ?? 1) - 1);
      return leftDistance - rightDistance;
    })[0];

  return (
    preferredOption ?? {
      id: `${medicationName.trim().toLowerCase()}::`,
      medicationName,
    }
  );
}

/**
 * buildMedicationTotalLabel converts a set of today's entries into the compact
 * total pill shown on the right side of the expanded medication row.
 */
function buildMedicationTotalLabel(entries: QuickEntryMedicationDraft[]): string | null {
  const parsedDosages = entries
    .map((entry) => parseMedicationDosage(entry.dosage))
    .filter((parsedDosage): parsedDosage is ParsedMedicationDosage => Boolean(parsedDosage));

  if (parsedDosages.length === 0) {
    return null;
  }

  const primaryUnit = parsedDosages.find((parsedDosage) => parsedDosage.unit)?.unit ?? '';
  const totalQuantity = parsedDosages
    .filter((parsedDosage) => !primaryUnit || parsedDosage.unit === primaryUnit || !parsedDosage.unit)
    .reduce((sum, parsedDosage) => sum + parsedDosage.quantity, 0);

  if (!primaryUnit) {
    return `${formatMedicationQuantity(totalQuantity)} ${Math.abs(totalQuantity - 1) < 0.001 ? 'dose' : 'doses'}`;
  }

  return formatMedicationDosage(totalQuantity, primaryUnit);
}

/**
 * MedicationDoseSheet recreates the dosage-adjustment popover so users can add
 * or revise one medication event without leaving the quick-entry screen.
 */
function MedicationDoseSheet({
  isOpen,
  medicationName,
  quantity,
  unit,
  time,
  onAdjust,
  onTimeChange,
  onDelete,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  medicationName: string;
  quantity: number;
  unit: string;
  time: string;
  onAdjust: (delta: number) => void;
  onTimeChange: (time: string) => void;
  onDelete?: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const timeOptions = useMemo(() => buildMedicationTimeOptions(time), [time]);
  const timeLabel = useMemo(() => formatMoodTimeLabel(time), [time]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-85 flex items-end justify-center bg-primary/20 px-3 pb-4 pt-10 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[34px] border border-primary/10 bg-bg-cream text-primary shadow-[0_32px_64px_rgba(15,23,42,0.16)]">
        <div className="border-b border-primary/8 bg-bg-cream px-5 pb-6 pt-5">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold tracking-tight text-primary">{medicationName}</p>
            </div>
            <div className="flex items-center gap-2">
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary/60 transition hover:bg-primary/5 hover:text-primary"
                  aria-label={`Delete ${medicationName} dose`}
                >
                  <MaterialIcon name="delete" size="sm" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary/60 transition hover:bg-primary/5 hover:text-primary"
                aria-label={`Close ${medicationName} editor`}
              >
                <MaterialIcon name="close" size="sm" />
              </button>
            </div>
          </div>

          <div className="mx-auto flex max-w-[440px] items-center justify-center gap-3 rounded-[28px] border border-primary/8 bg-white px-6 py-5 text-center shadow-sm">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-cream text-primary shadow-sm">
              <MaterialIcon name="pill" size="sm" />
            </span>
            <p className="text-[34px] font-bold tracking-tight text-primary">x {formatMedicationQuantity(quantity)}</p>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-3">
            {[
              { label: '-1', delta: -1 },
              { label: '-0.5', delta: -0.5 },
              { label: '+0.5', delta: 0.5 },
              { label: '+1', delta: 1 },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onAdjust(option.delta)}
                className="flex h-[92px] items-center justify-center rounded-full border border-primary/10 bg-white text-[22px] font-semibold tracking-tight text-primary transition hover:bg-bg-cream"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-primary/8 bg-white px-5 pb-5 pt-4 text-primary">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1 text-[38px] font-bold leading-none text-primary">
                {formatMedicationQuantity(quantity)}
                <span className="inline-flex h-7 w-7 items-center justify-center text-primary/45">
                  <MaterialIcon name="edit" size="sm" />
                </span>
              </p>
              <p className="mt-2 text-[18px] leading-tight text-primary">
                {unit ? formatMedicationUnit(unit, quantity) : Math.abs(quantity - 1) < 0.001 ? 'dose' : 'doses'}
              </p>
            </div>

            <div className="relative flex shrink-0 items-center gap-1 rounded-full border border-primary/10 bg-bg-cream px-5 py-3 shadow-sm">
              <span className="whitespace-nowrap text-[18px] font-medium text-primary">{timeLabel}</span>
              <span className="inline-flex w-4 shrink-0 items-center justify-center text-primary/55">
                <MaterialIcon name="expand_more" size="xs" />
              </span>
              <label className="sr-only" htmlFor="quick-entry-medication-time">
                Medication time
              </label>
              <select
                id="quick-entry-medication-time"
                value={time}
                onChange={(event) => onTimeChange(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
                aria-label="Medication time"
              >
                {timeOptions.map((option) => (
                  <option key={`dose-time-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-primary px-6 text-[20px] font-semibold text-white transition hover:bg-primary/92"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
              <MaterialIcon name="check" size="sm" />
            </span>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MedicationEntryCard keeps previously logged medications visible as reusable
 * shortcuts and lets the user bundle common stacks into saved groups.
 */
export function MedicationEntryCard({
  medications,
  savedMedications,
  medicationGroups,
  onMedicationGroupsChange,
  onUpsert,
  onRemove,
}: MedicationEntryCardProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [medicationName, setMedicationName] = useState('');
  const [medicationStrength, setMedicationStrength] = useState('');
  const [medicationUnit, setMedicationUnit] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMedicationIds, setSelectedGroupMedicationIds] = useState<string[]>([]);
  const [doseEditorMedication, setDoseEditorMedication] = useState<QuickEntrySavedMedication | null>(null);
  const [editingDoseMedicationId, setEditingDoseMedicationId] = useState<string | null>(null);
  const [doseQuantity, setDoseQuantity] = useState(1);
  const [doseUnit, setDoseUnit] = useState('dose');
  const [doseTime, setDoseTime] = useState(() => getCurrentMoodTime());

  const reusableMedications = useMemo(() => {
    const reusableMedicationMap = new Map<string, QuickEntrySavedMedication>();

    for (const medication of savedMedications) {
      reusableMedicationMap.set(medication.id, medication);
    }

    for (const medication of medications) {
      const reusableMedication = toQuickEntrySavedMedication(medication);
      reusableMedicationMap.set(reusableMedication.id, reusableMedication);
    }

    return Array.from(reusableMedicationMap.values()).sort((leftMedication, rightMedication) =>
      leftMedication.medicationName.localeCompare(rightMedication.medicationName)
    );
  }, [medications, savedMedications]);
  const medicationRows = useMemo(() => {
    const medicationRowMap = new Map<
      string,
      {
        familyKey: string;
        representativeMedication: QuickEntrySavedMedication;
        savedOptions: QuickEntrySavedMedication[];
        todayEntries: QuickEntryMedicationDraft[];
        totalLabel: string | null;
      }
    >();

    for (const savedMedication of reusableMedications) {
      const familyKey = buildMedicationFamilyKey(savedMedication);
      const existingRow = medicationRowMap.get(familyKey);
      const savedOptions = [...(existingRow?.savedOptions ?? []), savedMedication];
      medicationRowMap.set(familyKey, {
        familyKey,
        representativeMedication: pickRepresentativeMedicationShortcut(savedOptions, savedMedication.medicationName),
        savedOptions,
        todayEntries: existingRow?.todayEntries ?? [],
        totalLabel: existingRow?.totalLabel ?? null,
      });
    }

    for (const medication of medications) {
      const familyKey = buildMedicationFamilyKey(medication);
      const existingRow = medicationRowMap.get(familyKey);
      const todayEntries = [...(existingRow?.todayEntries ?? []), medication].sort((leftMedication, rightMedication) =>
        (leftMedication.timing ?? '').localeCompare(rightMedication.timing ?? '')
      );
      const savedOptions = existingRow?.savedOptions ?? [toQuickEntrySavedMedication(medication)];
      medicationRowMap.set(familyKey, {
        familyKey,
        representativeMedication: pickRepresentativeMedicationShortcut(savedOptions, medication.medicationName),
        savedOptions,
        todayEntries,
        totalLabel: buildMedicationTotalLabel(todayEntries),
      });
    }

    return Array.from(medicationRowMap.values()).sort((leftRow, rightRow) =>
      leftRow.representativeMedication.medicationName.localeCompare(rightRow.representativeMedication.medicationName)
    );
  }, [medications, reusableMedications]);

  /**
   * openEditor seeds the fallback manual medication editor so new meds can still
   * enter the system even before reusable shortcuts exist.
   */
  function openEditor() {
    setMedicationName('');
    setMedicationStrength('');
    setMedicationUnit('');
    setIsEditorOpen(true);
  }

  /**
   * openGroupEditor seeds the reusable medication group editor from either an
   * existing group or a new empty selection.
   */
  function openGroupEditor(group?: QuickEntryMedicationGroup) {
    setEditingGroupId(group?.id ?? null);
    setGroupName(group?.name ?? '');
    setSelectedGroupMedicationIds(group?.medicationIds ?? []);
    setIsGroupEditorOpen(true);
  }

  /**
   * openDoseEditor prepares the purple dosage editor for either a fresh dose, an
   * exact existing event, or a total-prefilled add flow from the summary pill.
   */
  function openDoseEditor(params: {
    savedMedication: QuickEntrySavedMedication;
    existingMedication?: QuickEntryMedicationDraft;
    quantity?: number;
    unit?: string;
    time?: string;
  }) {
    const parsedExistingDosage = parseMedicationDosage(params.existingMedication?.dosage);
    const parsedSavedDosage = parseMedicationDosage(params.savedMedication.dosage);

    setDoseEditorMedication(params.savedMedication);
    setEditingDoseMedicationId(params.existingMedication?.id ?? null);
    setDoseQuantity(params.quantity ?? parsedExistingDosage?.quantity ?? parsedSavedDosage?.quantity ?? 1);
    setDoseUnit(params.unit ?? parsedExistingDosage?.unit ?? parsedSavedDosage?.unit ?? 'dose');
    setDoseTime(params.time ?? params.existingMedication?.timing ?? params.savedMedication.timing ?? getCurrentMoodTime());
  }

  /**
   * logSavedMedication writes one taken event immediately from a reusable shortcut
   * so group chips can stay one tap.
   */
  function logSavedMedication(savedMedication: QuickEntrySavedMedication) {
    const parsedDosage = parseMedicationDosage(savedMedication.dosage);

    onUpsert({
      id: createDraftId('med'),
      medicationName: savedMedication.medicationName,
      dosage: savedMedication.dosage ?? formatMedicationDosage(parsedDosage?.quantity ?? 1, parsedDosage?.unit ?? 'dose'),
      taken: true,
      timing: savedMedication.timing ?? getCurrentMoodTime(),
      notes: savedMedication.notes,
    });
  }

  /**
   * addMedicationGroupToToday expands a saved bundle into today's medication
   * draft rows so common stacks still take one tap from the new chip UI.
   */
  function addMedicationGroupToToday(group: QuickEntryMedicationGroup) {
    for (const medicationId of group.medicationIds) {
      const savedMedication = reusableMedications.find((medication) => medication.id === medicationId);
      if (savedMedication) {
        logSavedMedication(savedMedication);
      }
    }
  }

  /**
   * saveMedicationDraft immediately logs one dose of the new medication so the
   * entry reaches medication_logs and survives a page refresh. The shortcut
   * appears on reload via getSavedMedications rather than ephemeral state.
   */
  function saveMedicationDraft() {
    if (!medicationName.trim()) {
      return;
    }

    const trimmedMedicationName = medicationName.trim();
    const trimmedStrength = medicationStrength.trim();
    const trimmedUnit = medicationUnit.trim();

    const dosage = [trimmedStrength, trimmedUnit].filter(Boolean).join(' ') || undefined;

    onUpsert({
      id: createDraftId('med'),
      medicationName: trimmedMedicationName,
      dosage,
      taken: true,
      timing: getCurrentMoodTime(),
    });

    setIsEditorOpen(false);
  }

  /**
   * saveMedicationGroup persists one local medication bundle so the card can
   * mirror Bearable's "group" shortcut flow without extra backend writes.
   */
  function saveMedicationGroup() {
    if (!groupName.trim() || selectedGroupMedicationIds.length === 0) {
      return;
    }

    const nextGroup: QuickEntryMedicationGroup = {
      id: editingGroupId ?? createDraftId('med-group'),
      name: groupName.trim(),
      medicationIds: Array.from(new Set(selectedGroupMedicationIds)),
    };

    onMedicationGroupsChange(
      medicationGroups.some((group) => group.id === nextGroup.id)
        ? medicationGroups.map((group) => (group.id === nextGroup.id ? nextGroup : group))
        : [...medicationGroups, nextGroup]
    );

    setIsGroupEditorOpen(false);
  }

  /**
   * deleteMedicationGroup removes one reusable stack from local quick-entry
   * preferences when the user no longer wants the shortcut.
   */
  function deleteMedicationGroup(groupId: string) {
    onMedicationGroupsChange(medicationGroups.filter((group) => group.id !== groupId));
  }

  /**
   * adjustDoseQuantity snaps the purple editor to half-step increments and avoids
   * invalid zero-or-negative medication quantities.
   */
  function adjustDoseQuantity(delta: number) {
    setDoseQuantity((currentQuantity) => {
      const nextQuantity = Math.round((currentQuantity + delta) * 2) / 2;
      return Math.max(0.5, nextQuantity);
    });
  }

  /**
   * saveDoseEntry commits the active purple editor back into today's snapshot and
   * closes the editor immediately after confirmation.
   */
  function saveDoseEntry() {
    if (!doseEditorMedication) {
      return;
    }

    onUpsert({
      id: editingDoseMedicationId ?? createDraftId('med'),
      medicationName: doseEditorMedication.medicationName,
      dosage: formatMedicationDosage(doseQuantity, doseUnit),
      taken: true,
      timing: doseTime,
      notes:
        medications.find((medication) => medication.id === editingDoseMedicationId)?.notes ??
        doseEditorMedication.notes,
    });

    setDoseEditorMedication(null);
    setEditingDoseMedicationId(null);
  }

  /**
   * deleteDoseEntry removes the exact medication event currently being edited from
   * the purple editor so dose chips are directly reversible.
   */
  function deleteDoseEntry() {
    if (!editingDoseMedicationId) {
      return;
    }

    onRemove(editingDoseMedicationId);
    setDoseEditorMedication(null);
    setEditingDoseMedicationId(null);
  }

  return (
    <>
      <DarkCard
        icon="pill"
        title="Meds / Supplements"
        subtitle="Previously logged meds stay here for faster daily reuse."
        headerClassName="py-2.5"
        className="bg-white/90"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {medicationGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => addMedicationGroupToToday(group)}
                className="inline-flex h-9 items-center rounded-full border border-primary/10 bg-white/85 px-3.5 text-[12px] font-semibold text-primary shadow-sm transition hover:border-primary/20 hover:bg-white"
              >
                {group.name} taken
              </button>
            ))}
            <button
              type="button"
              onClick={() => openGroupEditor()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/10 bg-primary-light/85 px-3.5 text-[12px] font-semibold text-primary shadow-sm transition hover:border-primary/20 hover:bg-primary-light"
            >
              <MaterialIcon name="edit" size="xs" />
              Edit groups
            </button>
          </div>

          {medicationRows.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-primary/8 bg-white/82 divide-y divide-primary/8">
              {medicationRows.map((row) => {
                const fallbackDosage =
                  row.representativeMedication.dosage ??
                  row.savedOptions.find((option) => option.dosage)?.dosage ??
                  row.todayEntries.find((entry) => entry.dosage)?.dosage;
                const shouldShowTotal =
                  Boolean(row.totalLabel) &&
                  (row.todayEntries.length > 1 || Boolean(parseMedicationDosage(row.totalLabel ?? undefined)?.unit));

                return (
                  <div key={row.familyKey} className="bg-white/78 px-4 py-2.5 text-primary">
                    {row.todayEntries.length === 0 ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 pt-0.5">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <p className="truncate text-[15px] font-semibold tracking-tight text-primary">
                              {row.representativeMedication.medicationName}
                            </p>
                            {fallbackDosage ? (
                              <p className="shrink-0 text-[12px] leading-none text-text-muted">{fallbackDosage}</p>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDoseEditor({ savedMedication: row.representativeMedication })}
                          className="inline-flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/18 bg-bg-cream text-primary/55 transition hover:bg-primary/3 hover:text-primary"
                          aria-label={`Add ${row.representativeMedication.medicationName}`}
                        >
                          <MaterialIcon name="add" size="sm" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <p className="truncate text-[15px] font-semibold tracking-tight text-primary">
                              {row.representativeMedication.medicationName}
                            </p>
                            <p className="shrink-0 text-[12px] leading-none text-text-muted">
                              {fallbackDosage ?? row.totalLabel ?? 'Tracked today'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-nowrap items-start gap-2.5 overflow-x-auto pb-0.5 pr-1">
                            {row.todayEntries.map((medication) => (
                              <button
                                key={medication.id}
                                type="button"
                                onClick={() =>
                                  openDoseEditor({
                                    savedMedication: row.representativeMedication,
                                    existingMedication: medication,
                                  })
                                }
                                className="flex shrink-0 flex-col items-center gap-1"
                                aria-label={`Edit ${row.representativeMedication.medicationName} dose`}
                              >
                                <span className="inline-flex h-[46px] min-w-[46px] items-center justify-center rounded-[14px] border border-primary/10 bg-bg-cream px-3 text-[17px] font-bold tracking-tight text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                                  {buildMedicationDoseChipLabel(medication.dosage)}
                                </span>
                                <span className="text-[10px] leading-none text-text-muted">
                                  {medication.timing ? formatMoodTimeLabel(medication.timing) : 'Now'}
                                </span>
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={() => openDoseEditor({ savedMedication: row.representativeMedication })}
                              className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center self-start rounded-[14px] border-2 border-dashed border-primary/18 bg-bg-cream text-primary/55 transition hover:bg-primary/3 hover:text-primary"
                              aria-label={`Add another ${row.representativeMedication.medicationName} dose`}
                            >
                              <MaterialIcon name="add" size="sm" />
                            </button>
                          </div>

                          {shouldShowTotal ? (
                            <button
                              type="button"
                              onClick={() => {
                                const parsedTotal = parseMedicationDosage(row.totalLabel ?? undefined);
                                openDoseEditor({
                                  savedMedication: row.representativeMedication,
                                  quantity: parsedTotal?.quantity,
                                  unit: parsedTotal?.unit,
                                });
                              }}
                              className="inline-flex h-[42px] min-w-[118px] shrink-0 items-center justify-center rounded-[14px] border border-primary/12 bg-bg-cream px-4 text-[15px] font-semibold tracking-tight text-primary transition hover:bg-primary/3"
                            >
                              {row.totalLabel}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/12 bg-white/70 px-4 py-4 text-[12px] text-text-muted">
              Previously saved meds will appear here after you log them once.
            </div>
          )}

          <button
            type="button"
            onClick={openEditor}
            className="inline-flex h-10 items-center gap-1.5 self-start rounded-full border border-primary/10 bg-white px-4 text-[12px] font-semibold text-primary shadow-sm transition hover:border-primary/20 hover:bg-primary/3"
          >
            <MaterialIcon name="add" size="sm" />
            Add medication
          </button>
        </div>
      </DarkCard>

      <MedicationDoseSheet
        isOpen={Boolean(doseEditorMedication)}
        medicationName={doseEditorMedication?.medicationName ?? 'Medication'}
        quantity={doseQuantity}
        unit={doseUnit}
        time={doseTime}
        onAdjust={adjustDoseQuantity}
        onTimeChange={setDoseTime}
        onDelete={editingDoseMedicationId ? deleteDoseEntry : undefined}
        onConfirm={saveDoseEntry}
        onClose={() => {
          setDoseEditorMedication(null);
          setEditingDoseMedicationId(null);
        }}
      />

      <FormSheet isOpen={isEditorOpen} title="Add Medication" onClose={() => setIsEditorOpen(false)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-primary/70">Medication name</span>
            <input
              value={medicationName}
              onChange={(event) => setMedicationName(event.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder="e.g. Bactrim"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-primary/70">Strength</span>
              <input
                value={medicationStrength}
                onChange={(event) => setMedicationStrength(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
                placeholder="e.g. 500"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[12px] font-medium text-primary/70">Unit</span>
              <input
                value={medicationUnit}
                onChange={(event) => setMedicationUnit(event.target.value)}
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
                placeholder="e.g. mg"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {['mg', 'mcg', 'g', 'ml', 'tablet', 'capsule', 'drop', 'patch'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMedicationUnit(preset)}
                className={`inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium transition ${
                  medicationUnit === preset
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/12 bg-white text-primary/70 hover:border-primary/20 hover:bg-primary/3'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={saveMedicationDraft}
            disabled={!medicationName.trim()}
            className="w-full rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Add medication
          </button>
        </div>
      </FormSheet>

      <FormSheet
        isOpen={isGroupEditorOpen}
        title={editingGroupId ? 'Edit Medication Group' : 'Create Medication Group'}
        onClose={() => setIsGroupEditorOpen(false)}
      >
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[12px] font-medium text-primary/70">Group name</span>
            <input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-[14px] text-primary outline-none transition focus:border-primary/20"
              placeholder="Morning meds"
            />
          </label>

          <div className="space-y-2">
            <p className="text-[12px] font-medium text-primary/70">Included medications</p>
            {reusableMedications.length > 0 ? (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {reusableMedications.map((savedMedication) => {
                  const isSelected = selectedGroupMedicationIds.includes(savedMedication.id);

                  return (
                    <button
                      key={savedMedication.id}
                      type="button"
                      onClick={() =>
                        setSelectedGroupMedicationIds((currentIds) =>
                          currentIds.includes(savedMedication.id)
                            ? currentIds.filter((medicationId) => medicationId !== savedMedication.id)
                            : [...currentIds, savedMedication.id]
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? 'border-primary bg-primary/6'
                          : 'border-primary/10 bg-white hover:border-primary/20 hover:bg-primary/2'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-primary">{savedMedication.medicationName}</p>
                        <p className="mt-0.5 text-[11px] text-text-muted">
                          {buildMedicationSubtitle(savedMedication) || 'Saved medication shortcut'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-primary/12 text-primary/40'
                        }`}
                        aria-hidden="true"
                      >
                        <MaterialIcon name={isSelected ? 'check' : 'add'} size="xs" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-primary/12 bg-primary/2 px-4 py-4 text-[12px] text-text-muted">
                Log at least one medication to create reusable groups.
              </div>
            )}
          </div>

          {editingGroupId ? (
            <button
              type="button"
              onClick={() => {
                deleteMedicationGroup(editingGroupId);
                setIsGroupEditorOpen(false);
              }}
              className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              Delete group
            </button>
          ) : null}

          <button
            type="button"
            onClick={saveMedicationGroup}
            disabled={!groupName.trim() || selectedGroupMedicationIds.length === 0}
            className="w-full rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Save group
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

  if (category.key === 'sleep' && definition.key === 'time-in-bed') {
    return (
      <SleepDurationControl
        key={definition.key}
        definition={definition}
        currentFactor={currentFactor}
        category={category}
        onUpsertFactor={onUpsertFactor}
        onRemoveFactor={onRemoveFactor}
      />
    );
  }

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
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center">
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
            className={`inline-flex h-8 min-w-[96px] items-center justify-center rounded-full border px-3 text-center text-[11px] font-medium transition ${
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
