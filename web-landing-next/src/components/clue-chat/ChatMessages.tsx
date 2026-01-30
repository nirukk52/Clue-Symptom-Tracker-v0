'use client';

import { useEffect, useRef } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { ChatMessage, ChatUser } from './types';

/**
 * ChatMessages - Message display area for ClueChat
 *
 * Why this exists: Renders the conversation between user and AI assistant.
 * Matches aicofounder.com design:
 * - AI messages: No bubble, plain text left-aligned
 * - User messages: Light beige bubble with rounded corners, avatar on right
 * - Notifications: Icon + text in muted style
 */

interface ChatMessagesProps {
  messages: ChatMessage[];
  user: ChatUser;
  isTyping?: boolean;
}

export function ChatMessages({ messages, user, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
