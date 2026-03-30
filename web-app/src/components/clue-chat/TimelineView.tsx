'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

import type { TimelineEntry, TimelineEntryStatus, TimelineEntryType } from './types';

/**
 * TimelineView - Standalone full-width daily timeline of symptoms and interventions
 *
 * Why this exists: Provides a chronological view of the user's health events,
 * promoted from an in-chat sub-tab to its own top-level nav tab so it is
 * accessible on both mobile and desktop. Filters by user_id for data isolation.
 */

interface TimelineViewProps {
  userId?: string;
}

/**
 * Get icon name for a timeline entry type
 * Why this exists: Different entry types need distinct visual indicators
 */
function getEntryIcon(type: TimelineEntryType): string {
  const iconMap: Record<TimelineEntryType, string> = {
    symptom: 'monitor_heart',
    medication: 'medication',
    supplement: 'pill',
    diet: 'restaurant',
    test: 'science',
    reaction: 'warning',
    note: 'edit_note',
    mood: 'mood',
  };
  return iconMap[type] || 'circle';
}

/**
 * Get color classes for a timeline entry type
 * Why this exists: Visual distinction helps users quickly scan different entry types
 */
function getEntryColor(type: TimelineEntryType): { icon: string; bg: string; border: string } {
  const colorMap: Record<TimelineEntryType, { icon: string; bg: string; border: string }> = {
    symptom: { icon: 'text-amber-400/80', bg: 'bg-amber-50/70', border: 'border-amber-100' },
    medication: { icon: 'text-blue-400/80', bg: 'bg-blue-50/60', border: 'border-blue-100' },
    supplement: { icon: 'text-teal-400/80', bg: 'bg-teal-50/50', border: 'border-teal-100' },
    diet: { icon: 'text-rose-300/80', bg: 'bg-rose-50/50', border: 'border-rose-100' },
    test: { icon: 'text-slate-400/80', bg: 'bg-slate-50/60', border: 'border-slate-100' },
    reaction: { icon: 'text-red-300/80', bg: 'bg-red-50/40', border: 'border-red-100' },
    note: { icon: 'text-violet-400/80', bg: 'bg-violet-50/50', border: 'border-violet-100' },
    mood: { icon: 'text-purple-400/80', bg: 'bg-purple-50/50', border: 'border-purple-100' },
  };
  return colorMap[type] || { icon: 'text-gray-400/80', bg: 'bg-gray-50', border: 'border-gray-200' };
}

/**
 * Get status badge styling
 * Why this exists: Status badges provide quick feedback on intervention outcomes
 */
function getStatusStyle(status: TimelineEntryStatus): { text: string; bg: string; border: string } {
  const styleMap: Record<TimelineEntryStatus, { text: string; bg: string; border: string }> = {
    start: { text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
    ongoing: { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    tolerated: { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
    issue: { text: 'text-red-400', bg: 'bg-red-50/70', border: 'border-red-200' },
    current: { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    completed: { text: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' },
  };
  return styleMap[status] || { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
}

/**
 * Format status for display
 * Why this exists: Human-readable status labels for the UI
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
 * TimelineEntryCard - Individual entry in the timeline
 * Why this exists: Renders a single timeline entry with icon, details, and status
 */
function TimelineEntryCard({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const colors = getEntryColor(entry.type);
  const statusStyle = entry.status ? getStatusStyle(entry.status) : null;

  return (
    <div className="flex gap-2">
      {/* Left column: icon and timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
          <MaterialIcon name={getEntryIcon(entry.type)} size="xs" className={colors.icon} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200" />}
      </div>

      {/* Right column: content card */}
      <div className={`flex-1 ${colors.bg} rounded-md border ${colors.border} px-2.5 py-1.5 mb-2`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.time && (
            <span className="text-[10px] font-medium text-text-muted/70">{entry.time}</span>
          )}
          <h3 className="text-[13px] font-semibold text-primary">{entry.title}</h3>

          {statusStyle && entry.status && (
            <span className={`text-[9px] font-medium ${statusStyle.text} ${statusStyle.bg} px-1 py-px rounded flex items-center gap-0.5 border ${statusStyle.border}`}>
              {entry.status === 'tolerated' && <span className="text-teal-500">✓</span>}
              {entry.status === 'issue' && <span className="text-red-400">!</span>}
              {entry.status === 'ongoing' && <span className="text-blue-400">◷</span>}
              {entry.status === 'start' && <span className="text-slate-400">▷</span>}
              {entry.status === 'current' && <span className="text-amber-400">◷</span>}
              {formatStatus(entry.status)}
            </span>
          )}

          {entry.dosage && (
            <span className="text-[9px] font-medium text-slate-500 bg-white/80 px-1 py-px rounded border border-slate-100">
              {entry.dosage}
            </span>
          )}

          {entry.duration && (
            <span className="text-[9px] font-medium text-slate-500 bg-white/80 px-1 py-px rounded border border-slate-100">
              {entry.duration}
            </span>
          )}
        </div>

        {entry.description && (
          <p className="text-[11px] text-text-muted leading-snug">
            {entry.description}
          </p>
        )}
      </div>
    </div>
  );
}

export function TimelineView({ userId }: TimelineViewProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  // Get user ID from Supabase session if not provided
  useEffect(() => {
    if (!userId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
      });
    }
  }, [userId]);

  const getCalendarDays = () => {
    const days = [];
    const curr = new Date(today);
    for (let i = -14; i <= 14; i++) {
      const day = new Date(curr);
      day.setDate(curr.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const getDayLabel = (date: Date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  /** Fetch timeline entries from Supabase for the selected date with user_id filter */
  const fetchEntries = useCallback(async (date: Date) => {
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

      if (data && data.length > 0) {
        setEntries(
          data.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            type: e.type as TimelineEntryType,
            title: e.title as string,
            description: (e.description as string) || undefined,
            time: e.entry_time
              ? new Date(e.entry_time as string).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : undefined,
            status: (e.status as TimelineEntryStatus) || undefined,
            severity: (e.severity as 1 | 2 | 3 | 4 | 5) || undefined,
            dosage: (e.dosage as string) || undefined,
            duration: (e.duration as string) || undefined,
          }))
        );
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate, fetchEntries]);

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const todayButton = calendarRef.current.querySelector('[data-today="true"]');
      if (todayButton) {
        todayButton.scrollIntoView({ inline: 'center', behavior: 'instant' });
      }
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      {/* Calendar strip - scrollable */}
      <div
        ref={calendarRef}
        className="flex gap-1 px-3 pb-3 pt-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {calendarDays.map((day) => (
          <button
            key={day.toISOString()}
            data-today={isToday(day) ? 'true' : undefined}
            onClick={() => setSelectedDate(day)}
            type="button"
            className={`flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              isSelected(day) ? 'bg-pill-selected' : 'hover:bg-pill-hover'
            }`}
          >
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
        ))}
      </div>

      {/* Timeline header */}
      <div className="px-3 pb-2">
        <h2 className="text-[16px] font-semibold text-primary">Timeline of Symptoms & Interventions</h2>
      </div>

      {/* Timeline entries */}
      <div className="flex-1 px-3 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-text-muted text-[13px]">Loading timeline...</div>
          </div>
        ) : entries.length > 0 ? (
          entries.map((entry, index) => (
            <TimelineEntryCard
              key={entry.id}
              entry={entry}
              isLast={index === entries.length - 1}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-text-muted text-center text-[14px]">
              No entries for this day yet.
              <br />
              <span className="text-[12px]">Chat with Clue to start tracking!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
