'use client';

import { useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { ChatMessage, ChatUser } from './types';

/**
 * ChatMessages - Message display area for ClueChat
 *
 * Why this exists: Renders the conversation between user and AI assistant,
 * or a calendar view when Calendar tab is selected.
 * Matches aicofounder.com design:
 * - AI messages: No bubble, plain text left-aligned
 * - User messages: Light beige bubble with rounded corners, avatar on right
 * - Notifications: Icon + text in muted style
 * Calendar view inspired by Bearable app with week strip and tracking cards.
 */

interface ChatMessagesProps {
  messages: ChatMessage[];
  user: ChatUser;
  isTyping?: boolean;
  activeTab: 'chat' | 'calendar';
}

/**
 * CalendarView - Weekly calendar strip
 *
 * Why this exists: Provides a quick-glance view of the week with
 * day selection for viewing/logging entries on specific dates.
 */
function CalendarView() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  // Generate days of current week (Mon-Sun)
  const getWeekDays = () => {
    const curr = new Date(today);
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDateHeader = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Date header */}
      <div className="flex items-center justify-center px-4 py-3">
        <div className="flex items-center gap-2">
          <MaterialIcon name="calendar_today" size="sm" className="text-text-muted" />
          <span className="text-primary font-medium">{formatDateHeader(selectedDate)}</span>
          <MaterialIcon name="expand_more" size="sm" className="text-text-muted" />
        </div>
      </div>

      {/* Week strip */}
      <div className="flex justify-between px-4 pb-4">
        {weekDays.map((day, index) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all ${
              isSelected(day) ? 'bg-pill-selected' : 'hover:bg-pill-hover'
            }`}
          >
            <span className="text-text-muted text-[11px] font-medium">{dayLabels[index]}</span>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium transition-all ${
                isToday(day)
                  ? 'bg-primary text-white'
                  : isSelected(day)
                    ? 'text-primary'
                    : 'text-text-muted'
              }`}
            >
              {day.getDate()}
            </div>
            {/* Tracking indicator dot - shows if day has entries */}
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                day.getDate() <= today.getDate() ? 'bg-accent-purple' : 'bg-transparent'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Placeholder content area */}
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-text-muted text-center text-[15px]">
          Select a date to view or log entries
        </p>
      </div>
    </div>
  );
}

export function ChatMessages({ messages, user, isTyping, activeTab }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show calendar view when Calendar tab is active
  if (activeTab === 'calendar') {
    return <CalendarView />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
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
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center">
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

        // Assistant message - plain text, no bubble
        return (
          <div key={message.id} className="flex items-start justify-start">
            <div className="max-w-[90%] text-primary text-[15px] font-normal leading-[1.65] pr-6">
              {message.content}
            </div>
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
