'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

import { ChatCanvas } from './ChatCanvas';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { ChatSidebar } from './ChatSidebar';
import { DoctorSummaryPanel } from './DoctorSummaryPanel';
import { FlareModePanel } from './FlareModePanel';
import { InsightsPanel } from './InsightsPanel';
import { QuickEntryPanel } from './QuickEntryPanel';
import type { ChatInteractiveComponent, ChatMessage, ChatUser, NavItem } from './types';

/**
 * ClueChat - Full-page chat experience for Chronic Life symptom tracker
 *
 * Why this exists: This is the core product interface. Matches aicofounder.com
 * design with mobile-first chat and desktop two-panel layout (chat + canvas).
 * Users interact with an AI assistant to track symptoms and manage conditions.
 * Supports Chat/Timeline toggle to switch between conversation and timeline view.
 */

/**
 * Structured result from the ask_severity tool.
 * Why this exists: Type-safe access to the tool's return value.
 */
interface AskSeverityResult {
  interactive?: boolean;
  type?: string;
  symptom?: string;
  prompt?: string;
  initialValue?: number;
}

/**
 * Extracts an interactive component config from ask_severity tool invocations.
 * Why this exists: Tool-based detection is deterministic and doesn't depend on
 * prompt phrasing or regex matching. When the AI calls ask_severity, we extract
 * the structured result to render the severity slider.
 */
function extractSeverityToolResult(
  parts: UIMessage['parts']
): ChatInteractiveComponent | undefined {
  if (!parts) return undefined;

  for (const part of parts) {
    // AI SDK v6: tool parts have state 'output-available' or 'done' when result is ready
    if (
      part.type.startsWith('tool-') &&
      'state' in part &&
      (part.state === 'output-available' || part.state === 'done')
    ) {
      // Cast to access output property which contains the tool result
      const toolPart = part as { output?: unknown };
      const output = toolPart.output as AskSeverityResult | undefined;
      if (output?.interactive && output.type === 'severity-slider' && output.symptom) {
        return {
          type: 'severity-slider',
          symptom: output.symptom,
          prompt: output.prompt,
          initialValue: output.initialValue ?? 5,
        };
      }
    }
  }

  return undefined;
}

interface ClueChatProps {
  /** Initial greeting message from the assistant */
  initialMessage?: string;
  /** User information for avatar display */
  user?: ChatUser;
}

export function ClueChat({
  initialMessage = "Hey, I'm Clue -- your symptom tracking companion. I'm here to help you log how you're feeling, spot patterns, and make sense of your health data. No pressure, go at your own pace. How are you doing today?",
  user = { initials: 'ME' },
}: ClueChatProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavId, setActiveNavId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline'>('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Auth gate: track user message count
  const userMessageCount = useRef(0);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<ChatUser | null>(null);

  // Conversation persistence -- stored in localStorage to survive refresh
  const conversationId = useRef<string | null>(null);

  // Interactive components state (severity sliders, quick-log, etc.)
  const [interactiveState, setInteractiveState] = useState<
    Record<string, { interactive?: ChatInteractiveComponent; completed?: boolean }>
  >({});

  // Transport for AI SDK v6 with conversation ID support
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: () => ({ conversationId: conversationId.current }),
  }), []);

  // Initial messages for the chat
  const initialMessages: UIMessage[] = useMemo(() => [
    {
      id: 'initial',
      role: 'assistant',
      parts: [{ type: 'text', text: initialMessage }],
    },
  ], [initialMessage]);

  // AI chat via useChat hook (Vercel AI SDK best practice)
  const {
    messages: aiMessages,
    sendMessage,
    setMessages: setAiMessages,
    status,
  } = useChat<UIMessage>({
    transport,
    messages: initialMessages,
    onFinish: ({ message }) => {
      // Check if the assistant called the ask_severity tool
      const interactive = extractSeverityToolResult(message.parts);
      if (interactive) {
        setInteractiveState((prev) => ({
          ...prev,
          [message.id]: { interactive },
        }));
      }
    },
  });

  const isTyping = status === 'streaming' || status === 'submitted';

  // Convert AI SDK messages to our ChatMessage format for rendering
  const messages: ChatMessage[] = aiMessages.map((m) => {
    const text = m.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '';
    const state = interactiveState[m.id];
    return {
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: text,
      timestamp: new Date(),
      interactive: state?.interactive,
      interactiveCompleted: state?.completed,
    };
  });

  /**
   * Check session on mount - determines if user is logged in and syncs conversation
   * Why: Handles OAuth redirect return and ongoing session persistence
   */
  useEffect(() => {
    async function checkSessionAndSync() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsLoggedIn(true);
          setShowAuthGate(false);
          
          // Extract user info from Google session (Google uses 'picture', Supabase may use 'avatar_url')
          const meta = session.user.user_metadata;
          const initials = (meta?.full_name || meta?.name || '')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'ME';
          setLoggedInUser({
            initials,
            avatarUrl: meta?.avatar_url || meta?.picture,
            email: session.user.email ?? undefined,
          });
          
          // Check if returning from OAuth (user email stored in sessionStorage)
          const oauthEmail = sessionStorage.getItem('oauth_user_email');
          if (oauthEmail) {
            sessionStorage.removeItem('oauth_user_email');
            sessionStorage.removeItem('pending_chat_redirect');
            sessionStorage.removeItem('pending_chat_return_url');
            
            // Sync existing conversation to the logged-in user
            const storedConvId = localStorage.getItem('clue_conversation_id');
            if (storedConvId) {
              await supabase
                .from('chat_conversations')
                .update({ user_id: session.user.id })
                .eq('id', storedConvId);
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    }

    checkSessionAndSync();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoggedIn(true);
          setShowAuthGate(false);
          
          // Extract user info from Google session (Google uses 'picture', Supabase may use 'avatar_url')
          const meta = session.user.user_metadata;
          const initials = (meta?.full_name || meta?.name || '')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'ME';
          setLoggedInUser({
            initials,
            avatarUrl: meta?.avatar_url || meta?.picture,
            email: session.user.email ?? undefined,
          });
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setLoggedInUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Handle Google Sign In - triggers OAuth flow directly from auth gate
   * Why: Users should be able to sign in without opening the sidebar
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsAuthLoading(true);

    try {
      sessionStorage.setItem('pending_chat_redirect', 'true');
      sessionStorage.setItem('pending_chat_return_url', window.location.pathname);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });

      if (oauthError) {
        console.error('Google auth error:', oauthError);
        setIsAuthLoading(false);
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setIsAuthLoading(false);
    }
  }, []);

  /** Load previous conversation from Supabase on mount */
  useEffect(() => {
    async function loadConversation() {
      try {
        // Check localStorage for existing conversation
        const storedConvId = localStorage.getItem('clue_conversation_id');
        if (!storedConvId) {
          setIsLoadingHistory(false);
          return;
        }

        conversationId.current = storedConvId;

        const { supabase } = await import('@/lib/supabase');
        const { data: chatMessages } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', storedConvId)
          .order('created_at', { ascending: true });

        if (chatMessages && chatMessages.length > 0) {
          // Convert to AI SDK UIMessage format
          const loadedMessages: UIMessage[] = chatMessages.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            parts: [{ type: 'text' as const, text: m.content }],
          }));

          // Prepend the greeting, then loaded messages
          const allMessages: UIMessage[] = [
            {
              id: 'initial',
              role: 'assistant',
              parts: [{ type: 'text', text: initialMessage }],
            },
            ...loadedMessages,
          ];
          setAiMessages(allMessages);

          // Update user message count for auth gate
          userMessageCount.current = loadedMessages.filter((m) => m.role === 'user').length;
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadConversation();
  }, [initialMessage, setAiMessages]);

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

  /**
   * Send a message to the AI backend via useChat's sendMessage
   * Why: Uses Vercel AI SDK v6 best practices for streaming chat
   */
  const handleSendMessage = useCallback(
    async (content: string, files?: FileList) => {
      // Auth gate check
      userMessageCount.current++;
      if (!isLoggedIn && userMessageCount.current >= 3 && !showAuthGate) {
        setShowAuthGate(true);
      }

      // Create a conversation on the first user message
      if (!conversationId.current) {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data: conv } = await supabase
            .from('chat_conversations')
            .insert({})
            .select('id')
            .single();
          if (conv?.id) {
            conversationId.current = conv.id;
            localStorage.setItem('clue_conversation_id', conv.id);
          }
        } catch (e) {
          console.error('Failed to create conversation:', e);
        }
      }

      // Use AI SDK v6 sendMessage with text + optional files
      await sendMessage({ text: content, files: files || undefined });
    },
    [sendMessage, isLoggedIn, showAuthGate]
  );

  // Dismiss auth gate on sidebar login
  useEffect(() => {
    if (isLoggedIn) {
      setShowAuthGate(false);
    }
  }, [isLoggedIn]);

  /**
   * Handle severity slider submission
   * Why: Marks the interactive component as completed and sends the severity as a user message
   */
  const handleSeveritySubmit = useCallback(
    async (messageId: string, severity: number) => {
      // Mark the interactive component as completed in our state
      setInteractiveState((prev) => ({
        ...prev,
        [messageId]: { ...prev[messageId], completed: true },
      }));

      // Find the symptom from the interactive state
      const state = interactiveState[messageId];
      const symptom = state?.interactive?.type === 'severity-slider' 
        ? state.interactive.symptom 
        : 'symptom';

      // Send the severity as a user message to continue the conversation
      const severityLabel =
        severity <= 3 ? 'mild' : severity <= 6 ? 'moderate' : 'severe';
      await handleSendMessage(
        `${severity}/10 - ${severityLabel} ${symptom}`
      );
    },
    [interactiveState, handleSendMessage]
  );

  /** Renders the right panel based on active sidebar nav */
  function renderRightPanel() {
    switch (activeNavId) {
      case 'insights':
        return <InsightsPanel />;
      case 'doctor-pack':
        return <DoctorSummaryPanel />;
      case 'quick-entry':
        return <QuickEntryPanel />;
      case 'flare-mode':
        return <FlareModePanel />;
      default:
        return <ChatCanvas />;
    }
  }

  return (
    <div className="relative flex min-h-screen min-h-svh bg-bg-cream">
      {/* Auth gate overlay */}
      {showAuthGate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm shadow-xl text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Save your progress
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Sign in to save your data and unlock personalized insights, timelines, and doctor summaries.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthLoading}
              className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthLoading ? (
                <>
                  <MaterialIcon
                    name="progress_activity"
                    size="sm"
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                'Sign in with Google'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={loggedInUser ?? user}
        activeNavId={activeNavId}
        onNavClick={handleNavClick}
        isLoggedIn={isLoggedIn}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-h-screen min-h-svh w-full lg:max-w-[420px] lg:flex-none lg:border-r lg:border-primary/6">
        <ChatHeader onMenuClick={handleMenuClick} />
        <ChatMessages 
          messages={messages} 
          user={user} 
          isTyping={isTyping || isLoadingHistory} 
          activeTab={activeTab}
          onSeveritySubmit={handleSeveritySubmit}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Right panel - contextual based on nav */}
      {renderRightPanel()}
    </div>
  );
}
