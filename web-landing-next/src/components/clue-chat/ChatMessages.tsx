'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

import { SeveritySlider } from './SeveritySlider';
import type { ChatMessage, ChatUser, TimelineEntry, TimelineEntryStatus, TimelineEntryType } from './types';

/**
 * ChatMessages - Message display area for ClueChat
 *
 * Why this exists: Renders the conversation between user and AI assistant,
 * or a timeline view when Timeline tab is selected.
 * Matches aicofounder.com design:
 * - AI messages: No bubble, plain text left-aligned
 * - User messages: Light beige bubble with rounded corners, avatar on right
 * - Notifications: Icon + text in muted style
 * Timeline view inspired by medical timeline UIs showing symptoms & interventions.
 */

interface ChatMessagesProps {
  messages: ChatMessage[];
  user: ChatUser;
  isTyping?: boolean;
  activeTab: 'chat' | 'timeline';
  /** Callback when severity slider is submitted */
  onSeveritySubmit?: (messageId: string, severity: number) => void;
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
 * Uses softer, more subtle backgrounds per frontend-design skill guidelines
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
 * Uses softer colors to avoid judgmental appearance per chronic illness UX guidelines
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
        {/* Icon circle */}
        <div className={`w-6 h-6 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
          <MaterialIcon name={getEntryIcon(entry.type)} size="xs" className={colors.icon} />
        </div>
        {/* Timeline connector line */}
        {!isLast && <div className="w-px flex-1 bg-gray-200" />}
      </div>

      {/* Right column: content card */}
      <div className={`flex-1 ${colors.bg} rounded-md border ${colors.border} px-2.5 py-1.5 mb-2`}>
        {/* Single row: time + title + badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.time && (
            <span className="text-[10px] font-medium text-text-muted/70">{entry.time}</span>
          )}
          <h3 className="text-[13px] font-semibold text-primary">{entry.title}</h3>

          {/* Status badge inline */}
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

          {/* Dosage badge */}
          {entry.dosage && (
            <span className="text-[9px] font-medium text-slate-500 bg-white/80 px-1 py-px rounded border border-slate-100">
              {entry.dosage}
            </span>
          )}

          {/* Duration badge */}
          {entry.duration && (
            <span className="text-[9px] font-medium text-slate-500 bg-white/80 px-1 py-px rounded border border-slate-100">
              {entry.duration}
            </span>
          )}
        </div>

        {/* Description */}
        {entry.description && (
          <p className="text-[11px] text-text-muted leading-snug">
            {entry.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Mock timeline data for demo
 * Why this exists: Provides realistic sample data until chat extraction is implemented
 * TODO: Replace with actual data extracted from user chat conversations
 */
const MOCK_TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: '1',
    type: 'test',
    title: 'Initial Breath Test',
    description: 'Diagnosed with IMO - elevated methane levels detected',
    time: '8:00 AM',
    status: 'start',
  },
  {
    id: '2',
    type: 'medication',
    title: 'Allicin Treatment',
    description: 'Completed course of allicin to reduce methane-producing organisms',
    time: '8:30 AM',
    status: 'tolerated',
  },
  {
    id: '3',
    type: 'symptom',
    title: 'Low Mood',
    description: 'Feeling down after waking up, difficulty getting motivated',
    time: '9:00 AM',
    status: 'current',
  },
  {
    id: '4',
    type: 'test',
    title: 'Second Breath Test',
    description: 'Methane still > 10 ppm but significantly reduced compared to first test',
    time: '10:00 AM',
    status: 'tolerated',
  },
  {
    id: '5',
    type: 'symptom',
    title: 'Brain Fog',
    description: 'Hard to concentrate on tasks, feeling mentally sluggish',
    time: '10:30 AM',
    status: 'current',
  },
  {
    id: '6',
    type: 'diet',
    title: 'Low-FODMAP Diet',
    description: 'Strict elimination of fermentable carbohydrates',
    time: '12:00 PM',
    duration: '4 months',
    status: 'ongoing',
  },
  {
    id: '7',
    type: 'supplement',
    title: 'Lactobacillus reuteri',
    description: 'Started probiotic recommended by naturopath for IMO',
    time: '1:00 PM',
    duration: '1 week',
    status: 'tolerated',
  },
  {
    id: '8',
    type: 'supplement',
    title: 'Bacillus coagulans',
    description: 'Added spore-based probiotic',
    time: '2:00 PM',
    dosage: '150mg (2 billion CFU)',
    status: 'tolerated',
  },
  {
    id: '9',
    type: 'symptom',
    title: 'Fatigue Spike',
    description: 'Energy crashed after lunch, needed to rest',
    time: '3:00 PM',
    status: 'current',
  },
  {
    id: '10',
    type: 'supplement',
    title: 'Bifidobacterium lactis HN019',
    description: 'Added third probiotic strain',
    time: '4:00 PM',
    dosage: '57.5mg (17.2 billion CFU)',
    status: 'issue',
  },
  {
    id: '11',
    type: 'reaction',
    title: 'Adverse Reaction',
    description: 'Tension, nervousness, and bloating after starting B. lactis',
    time: '5:00 PM',
    status: 'current',
  },
];

/**
 * TimelineView - Daily timeline of symptoms and interventions
 *
 * Why this exists: Provides a chronological view of the user's day,
 * showing symptoms, medications, supplements, and other health events.
 * Data will be extracted from chat conversations (to be implemented).
 */
function TimelineView() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCalendarDays = () => {
    const days = [];
    const curr = new Date(today);
    // Show 14 days before and 14 days after today (29 days total)
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

  /** Fetch timeline entries from Supabase for the selected date */
  const fetchEntries = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await supabase
        .from('timeline_entries')
        .select('*')
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
  }, []);

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate, fetchEntries]);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Scroll to today on mount
  useEffect(() => {
    if (calendarRef.current) {
      const todayButton = calendarRef.current.querySelector('[data-today="true"]');
      if (todayButton) {
        todayButton.scrollIntoView({ inline: 'center', behavior: 'instant' });
      }
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Calendar strip - scrollable */}
      <div
        ref={calendarRef}
        className="flex gap-1 px-3 pb-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {calendarDays.map((day) => (
          <button
            key={day.toISOString()}
            data-today={isToday(day) ? 'true' : undefined}
            onClick={() => setSelectedDate(day)}
            className={`flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all shrink-0 ${
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
            {/* Tracking indicator dot */}
            <div
              className={`w-1 h-1 rounded-full ${
                day <= today ? 'bg-accent-purple' : 'bg-transparent'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Timeline header - compact */}
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

export function ChatMessages({ messages, user, isTyping, activeTab, onSeveritySubmit }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show timeline view when Timeline tab is active
  if (activeTab === 'timeline') {
    return <TimelineView />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">
      {messages.map((message) => {
        // System notification - icon + text
        if (message.isNotification) {
          return (
            <div
              key={message.id}
              className="flex items-center gap-2 text-text-muted text-[13px] py-1"
            >
              <MaterialIcon
                name={message.notificationIcon || 'auto_stories'}
                size="sm"
                className="text-text-muted/70"
              />
              <span>{message.content}</span>
            </div>
          );
        }

        // User message - beige bubble with avatar
        if (message.role === 'user') {
          return (
            <div key={message.id} className="flex items-end gap-2 justify-end">
              <div className="max-w-[75%] bg-[#f0ede8] text-primary py-3 px-4 rounded-[18px] rounded-br-[5px] text-[15px] font-medium leading-relaxed">
                {message.content}
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-primary flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.initials}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-[10px] font-semibold tracking-wide">
                    {user.initials}
                  </span>
                )}
              </div>
            </div>
          );
        }

        // Assistant message - plain text, no bubble, with optional interactive component
        return (
          <div key={message.id} className="flex flex-col items-start justify-start gap-3">
            <div className="max-w-[90%] text-primary text-[15px] font-normal leading-[1.65] pr-6">
              {message.content}
            </div>
            {/* Render interactive component if present (triggered by ask_severity tool) */}
            {message.interactive?.type === 'severity-slider' && onSeveritySubmit && (
              <SeveritySlider
                symptom={message.interactive.symptom}
                prompt={message.interactive.prompt}
                initialValue={message.interactive.initialValue ?? 5}
                disabled={message.interactiveCompleted}
                onSubmit={(severity) => onSeveritySubmit(message.id, severity)}
              />
            )}
          </div>
        );
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="clue-chat-typing">
          <span className="clue-chat-typing-dot" />
          <span className="clue-chat-typing-dot" />
          <span className="clue-chat-typing-dot" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
