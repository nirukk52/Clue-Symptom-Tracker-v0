'use client';

import { useEffect, useRef } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import { QuickEntryChatCard } from './quick-entry/QuickEntryChatCard';
import { RatingSlider, RATING_LABEL_PRESETS } from './SeveritySlider';
import { SuggestionPills } from './SuggestionPills';
import type { ChatMessage, ChatSuggestionOption, ChatUser } from './types';
import type { QuickEntrySnapshot } from '@/lib/quick-entry';

/**
 * ChatMessages - Message display area for ClueChat
 *
 * Why this exists: Renders the conversation between user and AI assistant.
 * Timeline view was extracted to TimelineView.tsx and promoted to a top-level nav tab.
 * Matches aicofounder.com design:
 * - AI messages: No bubble, plain text left-aligned
 * - User messages: Light beige bubble with rounded corners, avatar on right
 * - Notifications: Icon + text in muted style
 */

interface ChatMessagesProps {
  messages: ChatMessage[];
  user: ChatUser;
  isTyping?: boolean;
  /** Callback when severity slider is submitted */
  onSeveritySubmit?: (messageId: string, severity: number) => void;
  /** Callback when a suggestion pill is selected */
  onSuggestionSelect?: (messageId: string, option: ChatSuggestionOption) => void;
  /** Callback when an inline quick-entry card is submitted */
  onQuickEntrySubmit?: (messageId: string, snapshot: QuickEntrySnapshot) => Promise<void> | void;
}

export function ChatMessages({
  messages,
  user,
  isTyping,
  onSeveritySubmit,
  onSuggestionSelect,
  onQuickEntrySubmit,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4">
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
            {/* Support both legacy severity-slider and new rating-slider types */}
            {(message.interactive?.type === 'severity-slider' || message.interactive?.type === 'rating-slider') && onSeveritySubmit && (
              <RatingSlider
                metric={message.interactive.metric || message.interactive.symptom}
                prompt={message.interactive.prompt}
                initialValue={message.interactive.initialValue ?? 5}
                disabled={message.interactiveCompleted}
                labels={message.interactive.labels as keyof typeof RATING_LABEL_PRESETS || 'severity'}
                onSubmit={(value) => onSeveritySubmit(message.id, value)}
              />
            )}
            {message.interactive?.type === 'suggestion-pills' && onSuggestionSelect && (
              <SuggestionPills
                options={message.interactive.options}
                disabled={message.interactiveCompleted}
                onSelect={(option) => onSuggestionSelect(message.id, option)}
              />
            )}
            {message.interactive?.type === 'quick-entry-card' && onQuickEntrySubmit && (
              <QuickEntryChatCard
                entryKind={message.interactive.entryKind}
                prompt={message.interactive.prompt}
                disabled={message.interactiveCompleted}
                onSubmit={(snapshot) => onQuickEntrySubmit(message.id, snapshot)}
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
