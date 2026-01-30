'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * ChatInput - Input area for ClueChat
 *
 * Why this exists: Provides the message input with attachment button,
 * Chat/Calendar tab toggle, and coral send button. Matches aicofounder.com
 * design with text input on top and controls row below.
 */

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  activeTab: 'chat' | 'calendar';
  onTabChange: (tab: 'chat' | 'calendar') => void;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  activeTab,
  onTabChange,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      // Small delay to ensure DOM is ready after hydration
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, disabled, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="sticky bottom-0 flex flex-col">
      {/* White container attached to bottom with only top corners rounded */}
      <div className="bg-white rounded-t-[12px] border-t-2 border-[#e8e8e8] px-4 pt-4 pb-5 flex flex-col gap-3">
        {/* Text input container with always-visible blinking cursor */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full py-3 px-0 bg-transparent text-[15px] text-primary outline-none placeholder:text-[#999] transition-all disabled:cursor-not-allowed caret-transparent"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
          />
          {/* Custom blinking cursor - always visible when input is empty */}
          {!inputValue && !disabled && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary animate-[blink_1s_ease-in-out_infinite]" />
          )}
        </div>

        {/* Bottom row: attachment, tabs, send */}
        <div className="flex items-center gap-3">
          {/* Attachment button - rounded square (squircle) background */}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center cursor-pointer text-[#666] hover:text-primary transition-all bg-[#f0f0f0] rounded-[16px]"
            aria-label="Attach file"
          >
            <MaterialIcon name="attach_file" size="sm" />
          </button>

          {/* Chat/Calendar tabs - gray pill with animated white slider */}
          <div className="flex-1 flex rounded-full bg-[#e8e8e8] p-1 relative">
            {/* Animated slider background */}
            <div
              className="absolute inset-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'chat' ? '4px' : 'calc(50% + 0px)',
              }}
            />
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-full text-[14px] font-medium cursor-pointer transition-colors duration-200 relative z-10 ${
                activeTab === 'chat'
                  ? 'text-primary'
                  : 'bg-transparent text-[#666] hover:text-primary/70'
              }`}
              onClick={() => onTabChange('chat')}
            >
              Chat
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-full text-[14px] font-medium cursor-pointer transition-colors duration-200 relative z-10 ${
                activeTab === 'calendar'
                  ? 'text-primary'
                  : 'bg-transparent text-[#666] hover:text-primary/70'
              }`}
              onClick={() => onTabChange('calendar')}
            >
              Calendar
            </button>
          </div>

          {/* Send button - coral/peach colored squircle */}
          <button
            type="button"
            className="w-10 h-10 rounded-[16px] border-none bg-accent-peach text-white flex items-center justify-center cursor-pointer hover:brightness-105 hover:shadow-[0_4px_12px_-2px_rgba(232,151,79,0.35)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            aria-label="Send message"
          >
            <MaterialIcon name="arrow_upward" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
