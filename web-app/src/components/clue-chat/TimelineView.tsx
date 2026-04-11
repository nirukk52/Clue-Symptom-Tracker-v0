'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { SpoonBurgerIcon } from '@/components/ui/SpoonBurgerIcon';
import { supabase } from '@/lib/supabase';

import type { TimelineEntry, TimelineEntryStatus, TimelineEntryType } from './types';
import {
  buildTimelineSummary,
  EmptyTimelineState,
  FILTER_OPTIONS,
  formatCalendarRange,
  formatMonthMarker,
  formatSelectedDate,
  getCalendarDays,
  getDayLabel,
  getFilterLabel,
  getPeriodIcon,
  getPeriodLabel,
  groupEntriesByPeriod,
  isSameCalendarDay,
  shouldShowMonthMarker,
  TimelineEntryCard,
  TimelineSummaryCards,
  type TimelineFilter,
} from './TimelineViewContent';

interface TimelineViewProps {
  userId?: string;
}

/**
 * TimelineView renders the user's selected-day health story in a format that is
 * easier to scan for active symptoms, interventions, and progression.
 */
export function TimelineView({ userId }: TimelineViewProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarDays = getCalendarDays(today);
  const isToday = (date: Date) => isSameCalendarDay(date, today);
  const isSelected = (date: Date) => isSameCalendarDay(date, selectedDate);

  useEffect(() => {
    if (!userId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      });
    }
  }, [userId]);

  /**
   * Fetch the selected day's timeline entries while keeping all view-specific
   * derivations client-side, so the UI can evolve without backend churn.
   */
  const fetchEntries = useCallback(
    async (date: Date) => {
      if (!currentUserId) return;

      setIsLoading(true);
      try {
        const dateStr = date.toISOString().split('T')[0];
        const { data } = await supabase
          .from('timeline_entries')
          .select('*')
          .eq('user_id', currentUserId)
          .gte('entry_time', `${dateStr}T00:00:00`)
          .lte('entry_time', `${dateStr}T23:59:59`)
          .order('entry_time', { ascending: true });

        if (!data || data.length === 0) {
          setEntries([]);
          return;
        }

        setEntries(
          data.map((entry: Record<string, unknown>) => ({
            id: entry.id as string,
            type: entry.type as TimelineEntryType,
            title: entry.title as string,
            description: (entry.description as string) || undefined,
            occurredAt: (entry.entry_time as string) || undefined,
            time: entry.entry_time
              ? new Date(entry.entry_time as string).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : undefined,
            status: (entry.status as TimelineEntryStatus) || undefined,
            severity: typeof entry.severity === 'number' ? entry.severity : undefined,
            dosage: (entry.dosage as string) || undefined,
            duration: (entry.duration as string) || undefined,
          }))
        );
      } catch {
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate, fetchEntries]);

  useEffect(() => {
    if (calendarRef.current) {
      const todayButton = calendarRef.current.querySelector('[data-today="true"]');
      if (todayButton) {
        todayButton.scrollIntoView({ inline: 'center', behavior: 'instant' });
      }
    }
  }, []);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') {
      return entries;
    }

    return entries.filter((entry) => entry.type === activeFilter);
  }, [activeFilter, entries]);

  const summary = useMemo(() => buildTimelineSummary(entries), [entries]);
  const groupedEntries = useMemo(() => groupEntriesByPeriod(filteredEntries), [filteredEntries]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-3 pb-2 pt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted/70">
            {formatCalendarRange(calendarDays)}
          </p>
          <h2 className="text-[16px] font-semibold text-primary">Timeline of Symptoms & Interventions</h2>
          <p className="mt-1 text-[11px] text-text-muted leading-tight">
            Scan what changed, what is active now, and what may matter most today.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/10 bg-white/80 text-primary"
            title="Spoon navigation icon"
            aria-label="Spoon navigation icon"
          >
            <SpoonBurgerIcon size={16} />
          </span>
          <p className="max-w-40 text-right text-[11px] text-text-muted leading-tight">
            {formatSelectedDate(selectedDate)}
          </p>
        </div>
      </div>

      <div
        ref={calendarRef}
        className="flex shrink-0 gap-1 px-3 pb-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {calendarDays.map((day, index) => {
          const showMonthMarker = shouldShowMonthMarker(calendarDays, index);

          return (
            <button
              key={day.toISOString()}
              aria-label={`View timeline for ${formatSelectedDate(day)}`}
              data-today={isToday(day) ? 'true' : undefined}
              onClick={() => setSelectedDate(day)}
              type="button"
              className={`flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                isSelected(day) ? 'bg-pill-selected' : 'hover:bg-pill-hover'
              }`}
            >
              <span className="min-h-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-text-muted/70">
                {showMonthMarker ? formatMonthMarker(day) : ''}
              </span>
              <span className="text-text-muted text-[10px] font-medium">{getDayLabel(day)}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
                  isToday(day)
                    ? 'bg-primary text-white'
                    : isSelected(day)
                      ? 'text-primary'
                      : 'text-text-muted'
                }`}
              >
                {day.getDate()}
              </div>
              <div
                className={`w-1 h-1 rounded-full ${
                  day <= today ? 'bg-accent-purple' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <TimelineSummaryCards summary={summary} />
      </div>

      <div className="shrink-0 px-3 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'border-primary/20 bg-primary text-white'
                    : 'border-primary/10 bg-white/80 text-text-muted hover:border-primary/20 hover:text-primary'
                }`}
              >
                <MaterialIcon name={option.icon} size="xs" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-text-muted text-[13px]">Loading timeline...</div>
          </div>
        ) : entries.length === 0 ? (
          <EmptyTimelineState
            title="No entries for this day yet."
            body="Chat with Clue to start tracking symptoms, meds, and how the day unfolds."
          />
        ) : filteredEntries.length === 0 ? (
          <EmptyTimelineState
            title={`No ${getFilterLabel(activeFilter).toLowerCase()} logged for this day.`}
            body="Try another filter or open chat to log what is happening right now."
          />
        ) : (
          <div className="space-y-4">
            {groupedEntries.map((section) => (
              <section key={section.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 border border-primary/10 text-primary">
                      <MaterialIcon name={getPeriodIcon(section.key)} size="xs" />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-semibold text-primary">{getPeriodLabel(section.key)}</h3>
                      <p className="text-[10px] text-text-muted">
                        {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.entries.map((entry, index) => (
                    <TimelineEntryCard
                      key={entry.id}
                      entry={entry}
                      isLast={index === section.entries.length - 1}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
