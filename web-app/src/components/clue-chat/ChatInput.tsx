'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { ChatInputSubTab, ChatModelProvider } from './types';

/** Set true to show ChatGPT / Gemini / Claude toggles in the composer again. */
const SHOW_MODEL_PICKER = false;

/**
 * ChatInput - Input area for ClueChat
 *
 * Why this exists: Provides the message input with attachment button,
 * Chat/Quick Entry/Canvas pill sub-tab toggle (only for chat and insights nav tabs),
 * and coral send button. The pill switches between the chat message column
 * plus alternate mobile panels without sending users back to the sidebar.
 */

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileList) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Selected model backend for new turns */
  modelProvider: ChatModelProvider;
  /** Callback when model backend changes */
  onModelProviderChange: (provider: ChatModelProvider) => void;
  /** Currently active sub-tab — only relevant for chat and insights nav tabs */
  activeSubTab: ChatInputSubTab;
  /** Callback when sub-tab changes */
  onSubTabChange: (tab: ChatInputSubTab) => void;
  /** Whether to show the bottom sub-tab pill (only for chat and insights nav) */
  showSubTabPill: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  modelProvider,
  onModelProviderChange,
  activeSubTab,
  onSubTabChange,
  showSubTabPill,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subTabs: ReadonlyArray<{ id: ChatInputSubTab; label: string }> = [
    { id: 'chat', label: 'Chat' },
    { id: 'quick-entry', label: 'Quick Entry' },
    { id: 'canvas', label: 'Canvas' },
  ];
  const modelOptions: ReadonlyArray<{ id: ChatModelProvider; label: string }> = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'claude', label: 'Claude' },
  ];

  // Auto-focus input on mount and when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim(), files);
      setInputValue('');
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [inputValue, disabled, onSendMessage, files]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Only the chat tab needs the freeform composer; alternate tabs show their own UI.
  const isComposerHidden = activeSubTab !== 'chat';
  const activeSubTabIndex = subTabs.findIndex((tab) => tab.id === activeSubTab);

  return (
    <div className="sticky bottom-0 flex flex-col">
      {/* White container attached to bottom with only top corners rounded */}
      <div className="bg-white rounded-t border-t-2 border-[#e8e8e8] px-4 pt-4 pb-5 flex flex-col gap-3">
        {/* Text input container — hidden when canvas is active */}
        {!isComposerHidden && (
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
        )}

        {/* Model picker for selecting response backend before sending. */}
        {SHOW_MODEL_PICKER && !isComposerHidden && (
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <span className="text-[12px] font-medium text-[#666] shrink-0">Model</span>
            <div className="flex items-center gap-1 rounded-full bg-[#f0f0f0] p-1">
              {modelOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                    modelProvider === option.id
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-[#666] hover:text-primary'
                  }`}
                  onClick={() => onModelProviderChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom row: attachment, pill toggle, send */}
        <div className="flex items-center gap-3">
          {/* Hidden file input for attachments */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.txt,.csv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFiles(e.target.files);
              }
            }}
          />
          {/* Attachment button — only useful on the chat composer tab */}
          {!isComposerHidden && (
            <button
              type="button"
              className={`w-10 h-10 flex items-center justify-center cursor-pointer transition-all rounded-xl ${
                files && files.length > 0
                  ? 'text-primary bg-primary/10'
                  : 'text-[#666] hover:text-primary bg-[#f0f0f0]'
              }`}
              aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              <MaterialIcon name="attach_file" size="sm" />
              {files && files.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {files.length}
                </span>
              )}
            </button>
          )}

          {/* Chat/Quick Entry/Canvas sub-tab pill — always visible when showSubTabPill is true */}
          {showSubTabPill ? (
            <div className="flex-1 flex rounded-full bg-[#e8e8e8] p-1 relative">
              {/* Animated slider background */}
              <div
                className="absolute left-1 top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{
                  width: 'calc((100% - 8px) / 3)',
                  transform: `translateX(${Math.max(activeSubTabIndex, 0) * 100}%)`,
                }}
              />
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex-1 py-2 px-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors duration-200 relative z-10 whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? 'text-primary'
                      : 'bg-transparent text-[#666] hover:text-primary/70'
                  }`}
                  onClick={() => onSubTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            /* Spacer so send button stays right-aligned */
            <div className="flex-1" />
          )}

          {/* Send button — only useful on the chat composer tab */}
          {!isComposerHidden && (
            <button
              type="button"
              className="w-10 h-10 rounded-xl border-none bg-accent-peach brightness-95 text-white flex items-center justify-center cursor-pointer hover:brightness-105 hover:shadow-[0_4px_12px_-2px_rgba(232,151,79,0.35)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={handleSend}
              disabled={!inputValue.trim() || disabled}
              aria-label="Send message"
            >
              <MaterialIcon name="arrow_upward" size="sm" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
