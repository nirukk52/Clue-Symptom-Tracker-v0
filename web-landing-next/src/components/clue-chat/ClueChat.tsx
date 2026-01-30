'use client';

import { useCallback, useState } from 'react';

import { ChatCanvas } from './ChatCanvas';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { ChatSidebar } from './ChatSidebar';
import type { ChatMessage, ChatUser, NavItem } from './types';

/**
 * ClueChat - Full-page chat experience for Chronic Life symptom tracker
 *
 * Why this exists: This is the core product interface. Matches aicofounder.com
 * design with mobile-first chat and desktop two-panel layout (chat + canvas).
 * Users interact with an AI assistant to track symptoms and manage conditions.
 * Supports Chat/Timeline toggle to switch between conversation and timeline view.
 */

interface ClueChatProps {
  /** Initial greeting message from the assistant */
  initialMessage?: string;
  /** User information for avatar display */
  user?: ChatUser;
}

export function ClueChat({
  initialMessage = 'What are you managing today?',
  user = { initials: 'ME' },
}: ClueChatProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavId, setActiveNavId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleNavClick = useCallback((navItem: NavItem) => {
    setActiveNavId(navItem.id);
    setSidebarOpen(false);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // TODO: Call actual AI backend
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I hear you. Let me help you track that. How would you describe the intensity right now?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  }, []);

  return (
    <div className="relative flex min-h-screen min-h-svh bg-bg-cream">
      {/* Sidebar - slides in on mobile, always visible on lg+ */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={user}
        activeNavId={activeNavId}
        onNavClick={handleNavClick}
      />

      {/* Main chat area - full width on mobile, fixed width on desktop */}
      <div className="flex flex-1 flex-col min-h-screen min-h-svh w-full lg:max-w-[420px] lg:flex-none lg:border-r lg:border-primary/6">
        {/* Header with menu - visible on mobile only */}
        <ChatHeader onMenuClick={handleMenuClick} />

        {/* Messages or Timeline view based on active tab */}
        <ChatMessages messages={messages} user={user} isTyping={isTyping} activeTab={activeTab} />

        {/* Input with Chat/Timeline toggle */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Canvas - desktop only, blank for now */}
      <ChatCanvas />
    </div>
  );
}
