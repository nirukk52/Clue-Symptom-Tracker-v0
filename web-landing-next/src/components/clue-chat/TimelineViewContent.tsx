'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { TimelineEntry, TimelineEntryStatus, TimelineEntryType } from './types';

export type TimelineFilter = 'all' | TimelineEntryType;
type TimelinePeriodKey = 'overnight' | 'morning' | 'afternoon' | 'evening' | 'unspecified';

export const FILTER_OPTIONS: Array<{ id: TimelineFilter; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'dashboard' },
  { id: 'symptom', label: 'Symptoms', icon: 'monitor_heart' },
  { id: 'medication', label: 'Meds', icon: 'medication' },
  { id: 'factor', label: 'Factors', icon: 'neurology' },
  { id: 'measurement', label: 'Measures', icon: 'monitoring' },
  { id: 'mood', label: 'Mood', icon: 'mood' },
  { id: 'note', label: 'Notes', icon: 'edit_note' },
];

/**
 * TimelineSummaryCards surfaces the selected day's key signals before the user
 * reads the detailed event list.
 */
export function TimelineSummaryCards({
  summary,
}: {
  summary: ReturnType<typeof buildTimelineSummary>;
}) {
  const cards = [
    {
      label: 'Logged today',
      value: String(summary.totalEntries),
      hint: summary.totalEntries === 1 ? '1 event captured' : `${summary.totalEntries} events captured`,
      icon: 'timeline',
    },
    {
      label: 'Current symptoms',
      value: summary.currentSymptoms.length > 0 ? summary.currentSymptoms.join(', ') : 'None logged',
      hint: summary.currentSymptoms.length > 0 ? 'Still marked active' : 'No active symptoms on the timeline',
      icon: 'monitor_heart',
    },
    {
      label: 'Highest severity',
      value: summary.highestSeverity ? `${summary.highestSeverity.title} ${summary.highestSeverity.severity}/10` : 'Not logged',
      hint: summary.highestSeverity ? summary.highestSeverity.label : 'No symptom severity captured yet',
      icon: 'signal_cellular_alt',
    },
    {
      label: 'Medications',
      value: String(summary.medicationCount),
      hint: summary.medicationCount > 0 ? 'Medication events recorded' : 'No medications logged today',
      icon: 'medication',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-primary/10 bg-white/85 px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-primary">
              <MaterialIcon name={card.icon} size="xs" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted/70">
              {card.label}
            </p>
          </div>
          <p className="mt-3 text-[14px] font-semibold text-primary leading-snug">{card.value}</p>
          <p className="mt-1 text-[11px] text-text-muted leading-snug">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * TimelineEntryCard makes each event self-describing with type, status, and
 * symptom intensity so dense days are easier to scan.
 */
export function TimelineEntryCard({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const colors = getEntryColor(entry.type);
  const statusStyle = entry.status ? getStatusStyle(entry.status) : null;
  const severityMeta = typeof entry.severity === 'number' ? getSeverityMeta(entry.severity) : null;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-7 w-7 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0 shadow-sm`}>
          <MaterialIcon name={getEntryIcon(entry.type)} size="xs" className={colors.icon} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-primary/10" />}
      </div>

      <div className={`mb-2 flex-1 rounded-xl border ${colors.border} ${colors.bg} px-3 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {entry.time && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted/70">
                  {entry.time}
                </span>
              )}
              <h3 className="text-[14px] font-semibold text-primary">{entry.title}</h3>
              <span className="rounded-full border border-white/70 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                {getEntryTypeLabel(entry.type)}
              </span>
            </div>

            {(entry.description || severityMeta || entry.dosage || entry.duration) && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {severityMeta && (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${severityMeta.badge}`}>
                      {entry.severity}/10 {severityMeta.label}
                    </span>
                  )}

                  {entry.dosage && (
                    <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {entry.dosage}
                    </span>
                  )}

                  {entry.duration && (
                    <span className="rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {entry.duration}
                    </span>
                  )}
                </div>

                {severityMeta && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
                      <div
                        className={`h-full rounded-full ${severityMeta.bar}`}
                        style={{ width: `${Math.max(8, Math.min(entry.severity ?? 0, 10) * 10)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Severity shows intensity at a glance instead of hiding it in narrative text.
                    </p>
                  </div>
                )}

                {entry.description && (
                  <p className="text-[12px] text-text-muted leading-snug">{entry.description}</p>
                )}
              </div>
            )}
          </div>

          {statusStyle && entry.status && (
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusStyle.text} ${statusStyle.bg} ${statusStyle.border}`}>
              <span>{getStatusGlyph(entry.status)}</span>
              {formatStatus(entry.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * EmptyTimelineState keeps blank and filtered states feeling intentional.
 */
export function EmptyTimelineState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="max-w-sm rounded-xl border border-dashed border-primary/15 bg-white/60 px-5 py-6 text-center">
        <p className="text-[14px] font-semibold text-primary">{title}</p>
        <p className="mt-2 text-[12px] text-text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/**
 * getEntryIcon gives each entry family a stable pictogram.
 */
function getEntryIcon(type: TimelineEntryType): string {
  const iconMap: Record<TimelineEntryType, string> = {
    symptom: 'monitor_heart',
    medication: 'medication',
    supplement: 'pill',
    diet: 'restaurant',
    test: 'science',
    measurement: 'monitoring',
    factor: 'neurology',
    reaction: 'warning',
    note: 'edit_note',
    mood: 'mood',
  };

  return iconMap[type] || 'circle';
}

/**
 * getEntryColor applies the semantic timeline palette.
 */
function getEntryColor(type: TimelineEntryType): { icon: string; bg: string; border: string } {
  const colorMap: Record<TimelineEntryType, { icon: string; bg: string; border: string }> = {
    symptom: { icon: 'text-rose-700', bg: 'bg-rose-50/90', border: 'border-rose-200' },
    medication: { icon: 'text-blue-700', bg: 'bg-blue-50/90', border: 'border-blue-200' },
    supplement: { icon: 'text-teal-700', bg: 'bg-teal-50/90', border: 'border-teal-200' },
    diet: { icon: 'text-orange-700', bg: 'bg-orange-50/90', border: 'border-orange-200' },
    test: { icon: 'text-slate-700', bg: 'bg-slate-50/90', border: 'border-slate-200' },
    measurement: { icon: 'text-cyan-700', bg: 'bg-cyan-50/90', border: 'border-cyan-200' },
    factor: { icon: 'text-violet-700', bg: 'bg-violet-50/90', border: 'border-violet-200' },
    reaction: { icon: 'text-red-700', bg: 'bg-red-50/90', border: 'border-red-200' },
    note: { icon: 'text-violet-700', bg: 'bg-violet-50/90', border: 'border-violet-200' },
    mood: { icon: 'text-fuchsia-700', bg: 'bg-fuchsia-50/90', border: 'border-fuchsia-200' },
  };

  return colorMap[type] || { icon: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
}

/**
 * getStatusStyle keeps status chips consistent.
 */
function getStatusStyle(status: TimelineEntryStatus): { text: string; bg: string; border: string } {
  const styleMap: Record<TimelineEntryStatus, { text: string; bg: string; border: string }> = {
    start: { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
    ongoing: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    tolerated: { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    issue: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    current: { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
    completed: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  };

  return styleMap[status] || { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
}

/**
 * getStatusGlyph adds a text-safe cue for status.
 */
function getStatusGlyph(status: TimelineEntryStatus): string {
  const glyphMap: Record<TimelineEntryStatus, string> = {
    start: '▷',
    ongoing: '◷',
    tolerated: '✓',
    issue: '!',
    current: '●',
    completed: '•',
  };

  return glyphMap[status] || '•';
}

/**
 * formatStatus converts internal keys into readable labels.
 */
function formatStatus(status: TimelineEntryStatus): string {
  const labels: Record<TimelineEntryStatus, string> = {
    start: 'Start',
    ongoing: 'Ongoing',
    tolerated: 'Tolerated',
    issue: 'Issue',
    current: 'Current',
    completed: 'Completed',
  };

  return labels[status] || status;
}

/**
 * getEntryTypeLabel provides short labels for type chips.
 */
function getEntryTypeLabel(type: TimelineEntryType): string {
  const labels: Record<TimelineEntryType, string> = {
    symptom: 'Symptom',
    medication: 'Medication',
    supplement: 'Supplement',
    diet: 'Food',
    test: 'Test',
    measurement: 'Measurement',
    factor: 'Factor',
    reaction: 'Reaction',
    note: 'Note',
    mood: 'Mood',
  };

  return labels[type] || 'Entry';
}

/**
 * getSeverityMeta maps numeric severity to a visual tier.
 */
function getSeverityMeta(severity: number): { label: string; badge: string; bar: string } {
  if (severity >= 9) {
    return {
      label: 'Severe',
      badge: 'border-red-300 bg-red-50 text-red-800',
      bar: 'bg-red-700',
    };
  }

  if (severity >= 7) {
    return {
      label: 'High',
      badge: 'border-rose-300 bg-rose-50 text-rose-800',
      bar: 'bg-rose-600',
    };
  }

  if (severity >= 4) {
    return {
      label: 'Moderate',
      badge: 'border-orange-300 bg-orange-50 text-orange-800',
      bar: 'bg-orange-500',
    };
  }

  return {
    label: 'Mild',
    badge: 'border-amber-300 bg-amber-50 text-amber-800',
    bar: 'bg-amber-400',
  };
}

/**
 * buildTimelineSummary derives the top-level selected-day story.
 */
export function buildTimelineSummary(entries: TimelineEntry[]) {
  const currentSymptoms = entries
    .filter((entry) => entry.type === 'symptom' && entry.status === 'current')
    .map((entry) => entry.title);

  const highestSeverity = entries
    .filter((entry) => entry.type === 'symptom' && typeof entry.severity === 'number')
    .sort((first, second) => (second.severity ?? 0) - (first.severity ?? 0))[0];

  return {
    totalEntries: entries.length,
    currentSymptoms,
    medicationCount: entries.filter((entry) => entry.type === 'medication').length,
    highestSeverity: highestSeverity
      ? {
          title: highestSeverity.title,
          severity: highestSeverity.severity ?? 0,
          label: getSeverityMeta(highestSeverity.severity ?? 0).label,
        }
      : null,
  };
}

/**
 * groupEntriesByPeriod turns a flat list into time-of-day sections.
 */
export function groupEntriesByPeriod(entries: TimelineEntry[]) {
  const grouped = new Map<TimelinePeriodKey, TimelineEntry[]>();

  for (const entry of entries) {
    const key = getTimelinePeriod(entry.occurredAt);
    const existing = grouped.get(key) ?? [];
    existing.push(entry);
    grouped.set(key, existing);
  }

  const order: TimelinePeriodKey[] = ['overnight', 'morning', 'afternoon', 'evening', 'unspecified'];

  return order
    .map((key) => ({ key, entries: grouped.get(key) ?? [] }))
    .filter((section) => section.entries.length > 0);
}

/**
 * getTimelinePeriod assigns each event to a day section.
 */
function getTimelinePeriod(occurredAt?: string): TimelinePeriodKey {
  if (!occurredAt) {
    return 'unspecified';
  }

  const hour = new Date(occurredAt).getHours();

  if (hour < 6) return 'overnight';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * getFilterLabel keeps helper copy aligned with active chips.
 */
export function getFilterLabel(filter: TimelineFilter): string {
  return FILTER_OPTIONS.find((option) => option.id === filter)?.label || 'Entries';
}

/**
 * getPeriodLabel keeps section headings conversational.
 */
export function getPeriodLabel(period: ReturnType<typeof groupEntriesByPeriod>[number]['key']): string {
  const labels: Record<TimelinePeriodKey, string> = {
    overnight: 'Overnight',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    unspecified: 'Any time',
  };

  return labels[period];
}

/**
 * getPeriodIcon adds a small visual cue for time-of-day grouping.
 */
export function getPeriodIcon(period: ReturnType<typeof groupEntriesByPeriod>[number]['key']): string {
  const iconMap: Record<TimelinePeriodKey, string> = {
    overnight: 'dark_mode',
    morning: 'wb_sunny',
    afternoon: 'clear_day',
    evening: 'nights_stay',
    unspecified: 'schedule',
  };

  return iconMap[period];
}

/**
 * getCalendarDays builds the rolling date strip around today.
 */
export function getCalendarDays(baseDate: Date): Date[] {
  const days: Date[] = [];

  for (let i = -14; i <= 14; i++) {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() + i);
    days.push(day);
  }

  return days;
}

/**
 * isSameCalendarDay compares dates at the day level only.
 */
export function isSameCalendarDay(first: Date, second: Date): boolean {
  return first.toDateString() === second.toDateString();
}

/**
 * getDayLabel keeps weekday labels compact for the date rail.
 */
export function getDayLabel(date: Date): string {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
}

/**
 * shouldShowMonthMarker prevents month boundaries from disappearing.
 */
export function shouldShowMonthMarker(days: Date[], index: number): boolean {
  if (index === 0) {
    return true;
  }

  const previousDay = days[index - 1];
  const currentDay = days[index];

  return (
    previousDay.getMonth() !== currentDay.getMonth() ||
    previousDay.getFullYear() !== currentDay.getFullYear()
  );
}

/**
 * formatMonthMarker gives the date rail lightweight month context.
 */
export function formatMonthMarker(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
  });
}

/**
 * formatSelectedDate shows the exact day being reviewed.
 */
export function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * formatCalendarRange summarizes the date rail in one compact label.
 */
export function formatCalendarRange(days: Date[]): string {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  if (
    firstDay.getMonth() === lastDay.getMonth() &&
    firstDay.getFullYear() === lastDay.getFullYear()
  ) {
    return firstDay.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  if (firstDay.getFullYear() === lastDay.getFullYear()) {
    return `${firstDay.toLocaleDateString('en-US', {
      month: 'short',
    })} - ${lastDay.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })}`;
  }

  return `${firstDay.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })} - ${lastDay.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })}`;
}
