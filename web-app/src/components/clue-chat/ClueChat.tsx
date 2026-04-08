'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { deserializeStoredChatMessage, extractTextFromUIMessage } from '@/lib/chat-ui-messages';
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
import { TimelineView } from './TimelineView';
import { buildSuggestionInteractive, type InsightSuggestionRow } from './chat-suggestions';
import type {
  ChatInteractiveComponent,
  ChatModelProvider,
  ChatInputSubTab,
  ChatMessage,
  ChatSuggestionOption,
  ChatUser,
  NavItem,
} from './types';

/**
 * ClueChat - Full-page chat experience for Chronic Life symptom tracker
 *
 * Why this exists: Core product interface. Rearchitected so every feature is
 * accessible on both mobile and desktop:
 * - Chat and Insights nav tabs: bottom sub-tab layout (Chat | Quick Entry | Canvas).
 *   On desktop the primary panels stay visible side-by-side; on mobile the pill
 *   switches between them.
 *   Chat and Insights share the same canvas panel.
 * - Timeline and Doctor Summary: full-width standalone views on all screen sizes.
 * - Quick Entry and Flare Mode: modal pop-ups triggered by FAB buttons.
 */

/**
 * Structured result from the ask_severity tool (now generalized as rating-slider).
 * Why this exists: Type-safe access to the tool's return value.
 */
interface AskRatingResult {
  interactive?: boolean;
  type?: string;
  /** New generalized metric name */
  metric?: string;
  /** Legacy symptom field for backwards compatibility */
  symptom?: string;
  prompt?: string;
  initialValue?: number;
  /** Label preset name (severity, energy, mood, etc.) */
  labels?: string;
}

/**
 * Extracts an interactive component config from ask_severity tool invocations.
 * Why this exists: Tool-based detection is deterministic and doesn't depend on
 * prompt phrasing or regex matching. Supports both legacy severity-slider and
 * new rating-slider types.
 */
function extractSeverityToolResult(
  parts: UIMessage['parts']
): ChatInteractiveComponent | undefined {
  if (!parts) return undefined;

  for (const part of parts) {
    if (
      part.type.startsWith('tool-') &&
      'state' in part &&
      (part.state === 'output-available' || part.state === 'done')
    ) {
      const toolPart = part as { output?: unknown };
      const output = toolPart.output as AskRatingResult | undefined;
      // Support both legacy severity-slider and new rating-slider types
      if (output?.interactive && (output.type === 'severity-slider' || output.type === 'rating-slider')) {
        const metric = output.metric || output.symptom || 'symptom';
        return {
          type: output.type as 'severity-slider' | 'rating-slider',
          metric,
          symptom: metric, // Backwards compat
          prompt: output.prompt,
          initialValue: output.initialValue ?? 5,
          labels: output.labels,
        };
      }
    }
  }

  return undefined;
}

/**
 * Narrows a chat interactive payload to the rating slider variants.
 * Why this exists: Rehydration updates should only write `initialValue` onto
 * slider payloads and must leave other interactive unions untouched.
 */
function isRatingInteractiveComponent(
  interactive: ChatInteractiveComponent | undefined
): interactive is Extract<ChatInteractiveComponent, { type: 'severity-slider' | 'rating-slider' }> {
  return interactive?.type === 'severity-slider' || interactive?.type === 'rating-slider';
}

/**
 * Extracts the numeric rating from a stored slider follow-up reply.
 * Why this exists: Reloaded conversations need the submitted slider value so
 * answered sliders can render the persisted choice instead of the default `5`.
 */
function extractSubmittedRating(message: UIMessage | undefined): number | null {
  if (!message) {
    return null;
  }

  const text = extractTextFromUIMessage(message).trim();
  const slashMatch = text.match(/\b(10|[0-9])\s*\/\s*10\b/);
  if (slashMatch?.[1]) {
    return Number(slashMatch[1]);
  }

  const bareMatch = text.match(/^\s*(10|[0-9])\s*$/);
  if (bareMatch?.[1]) {
    return Number(bareMatch[1]);
  }

  return null;
}

/**
 * wait delays suggestion hydration long enough for the post-turn insight agent
 * to persist the latest ranked suggestions.
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
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
  // Default to 'chat' nav tab
  const [activeNavId, setActiveNavId] = useState<string>('chat');
  // Sub-tab within chat/insights tabs for the mobile switcher and desktop input state.
  const [activeSubTab, setActiveSubTab] = useState<ChatInputSubTab>('chat');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Modal visibility state for pop-up panels
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showFlareMode, setShowFlareMode] = useState(false);

  // Auth gate: track user message count
  const userMessageCount = useRef(0);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<ChatUser | null>(null);

  // Conversation persistence — stored in localStorage to survive refresh
  const conversationId = useRef<string | null>(null);

  // Interactive components state (severity sliders, quick-log, etc.)
  const [interactiveState, setInteractiveState] = useState<
    Record<string, { interactive?: ChatInteractiveComponent; completed?: boolean }>
  >({});
  const [modelProvider, setModelProvider] = useState<ChatModelProvider>('chatgpt');

  // Graph refresh trigger - increment to force graph refetch
  const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);

  // Ref to track Supabase user ID for API calls (survives re-renders)
  const supabaseUserId = useRef<string | null>(null);
  const latestSuggestionMessageId = useRef<string | null>(null);
  const modelProviderRef = useRef<ChatModelProvider>('chatgpt');

  useEffect(() => {
    modelProviderRef.current = modelProvider;
  }, [modelProvider]);

  /**
   * applySuggestionPills keeps suggestion chips bound to only the latest
   * assistant turn so the rail does not accumulate stale prompts.
   */
  const applySuggestionPills = useCallback(
    (
      messageId: string,
      interactive?: Extract<ChatInteractiveComponent, { type: 'suggestion-pills' }>
    ) => {
      setInteractiveState((prev) => {
        if (prev[messageId]?.interactive && prev[messageId].interactive.type !== 'suggestion-pills') {
          return prev;
        }

        const nextState: typeof prev = {};

        for (const [id, state] of Object.entries(prev)) {
          if (state.interactive?.type === 'suggestion-pills' && id !== messageId) {
            continue;
          }
          nextState[id] = state;
        }

        if (!interactive) {
          if (nextState[messageId]?.interactive?.type === 'suggestion-pills') {
            delete nextState[messageId];
          }
          return nextState;
        }

        nextState[messageId] = {
          interactive,
          completed: false,
        };

        return nextState;
      });
    },
    []
  );

  /**
   * loadSuggestionPills reads the top-ranked queued insights after a chat turn
   * and hydrates them into pill affordances for the latest assistant message.
   */
  const loadSuggestionPills = useCallback(
    async (messageId: string, retryDelays: number[] = [1200, 3000]) => {
      const userId = supabaseUserId.current;
      if (!userId) {
        return;
      }

      for (const delayMs of retryDelays) {
        if (delayMs > 0) {
          await wait(delayMs);
        }

        if (latestSuggestionMessageId.current !== messageId) {
          return;
        }

        try {
          const response = await fetch(
            `/api/insights?userId=${encodeURIComponent(userId)}&type=next_question&limit=4`,
            { cache: 'no-store' }
          );

          if (!response.ok) {
            continue;
          }

          const data = (await response.json()) as { insights?: InsightSuggestionRow[] };
          const interactive = buildSuggestionInteractive(data.insights ?? []);

          if (latestSuggestionMessageId.current !== messageId) {
            return;
          }

          applySuggestionPills(messageId, interactive);

          if (interactive?.options.length) {
            return;
          }
        } catch (error) {
          console.error('[ClueChat] Failed to load suggestion pills:', error);
        }
      }
    },
    [applySuggestionPills]
  );

  // Transport for AI SDK v6 with conversation ID and user ID support
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: () => ({
      conversationId: conversationId.current,
      userId: supabaseUserId.current,
      modelProvider: modelProviderRef.current,
    }),
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
      const interactive = extractSeverityToolResult(message.parts);
      if (interactive) {
        setInteractiveState((prev) => ({
          ...prev,
          [message.id]: { interactive },
        }));
      } else {
        latestSuggestionMessageId.current = message.id;
        void loadSuggestionPills(message.id);
      }
      // Trigger graph refresh after each message to show updated nodes/edges
      setGraphRefreshTrigger((prev) => prev + 1);
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
   * Rehydrates suggestions when an existing conversation is loaded so returning
   * users still see the current top four prompts in the latest assistant turn.
   */
  useEffect(() => {
    if (!isLoggedIn || isLoadingHistory) {
      return;
    }

    const latestAssistantMessage = [...aiMessages].reverse().find((message) => message.role === 'assistant');
    if (!latestAssistantMessage) {
      return;
    }

    const existingInteractive = interactiveState[latestAssistantMessage.id]?.interactive;
    if (existingInteractive?.type && existingInteractive.type !== 'suggestion-pills') {
      return;
    }

    if (existingInteractive?.type === 'suggestion-pills' && existingInteractive.options.length > 0) {
      return;
    }

    latestSuggestionMessageId.current = latestAssistantMessage.id;
    void loadSuggestionPills(latestAssistantMessage.id, [0]);
  }, [aiMessages, interactiveState, isLoadingHistory, isLoggedIn, loadSuggestionPills]);

  /**
   * Check session on mount — determines if user is logged in and syncs conversation
   * Why: Handles OAuth redirect return and ongoing session persistence
   */
  useEffect(() => {
    async function checkSessionAndSync() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[ClueChat] Session check:', session?.user?.id ?? 'no session');

        if (session?.user) {
          supabaseUserId.current = session.user.id;
          console.log('[ClueChat] Set supabaseUserId.current to:', session.user.id);
          setIsLoggedIn(true);
          setShowAuthGate(false);

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

          const oauthEmail = sessionStorage.getItem('oauth_user_email');
          if (oauthEmail) {
            sessionStorage.removeItem('oauth_user_email');
            sessionStorage.removeItem('pending_chat_redirect');
            sessionStorage.removeItem('pending_chat_return_url');

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          supabaseUserId.current = session.user.id;
          setIsLoggedIn(true);
          setShowAuthGate(false);

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
          supabaseUserId.current = null;
          // Clear stale conversation ID to prevent FK errors on next login
          localStorage.removeItem('clue_conversation_id');
          conversationId.current = null;
        }
      }
    );

    return () => { subscription.unsubscribe(); };
  }, []);

  /**
   * Handle Google Sign In — triggers OAuth flow directly from auth gate
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

  /**
   * Load previous conversation from Supabase
   * For authenticated users: query via API to find their conversation
   * For anonymous users: fallback to localStorage conversation ID
   */
  useEffect(() => {
    async function loadConversation() {
      try {
        let convIdToLoad: string | null = null;

        // For authenticated users, fetch conversation via API
        if (supabaseUserId.current) {
          try {
            const res = await fetch(`/api/conversations?userId=${supabaseUserId.current}`);
            const data = await res.json();
            if (data.conversationId) {
              convIdToLoad = data.conversationId as string;
              conversationId.current = convIdToLoad;
              localStorage.setItem('clue_conversation_id', convIdToLoad);
            }
          } catch (e) {
            console.error('Failed to fetch conversation:', e);
          }
        }

        // Fallback to localStorage for anonymous users — but verify it exists first
        if (!convIdToLoad) {
          const storedConvId = localStorage.getItem('clue_conversation_id');
          if (storedConvId) {
            // Verify the conversation still exists in the database
            const { supabase: sb } = await import('@/lib/supabase');
            const { data: convExists } = await sb
              .from('chat_conversations')
              .select('id')
              .eq('id', storedConvId)
              .maybeSingle();
            
            if (convExists) {
              convIdToLoad = storedConvId;
              conversationId.current = storedConvId;
            } else {
              // Stale ID — clear it
              console.log('[ClueChat] Cleared stale conversation ID from localStorage');
              localStorage.removeItem('clue_conversation_id');
            }
          }
        }

        if (!convIdToLoad) {
          setIsLoadingHistory(false);
          return;
        }

        // Load chat messages (read-only, can stay as direct Supabase call)
        const { supabase } = await import('@/lib/supabase');
        const { data: chatMessages } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', convIdToLoad)
          .order('created_at', { ascending: true });

        if (chatMessages && chatMessages.length > 0) {
          const loadedMessages: UIMessage[] = chatMessages.map((message) =>
            deserializeStoredChatMessage({
              id: message.id,
              role: message.role as 'user' | 'assistant',
              content: message.content,
            })
          );

          const restoredInteractiveState = loadedMessages.reduce<
            Record<string, { interactive?: ChatInteractiveComponent; completed?: boolean }>
          >((acc, message, index) => {
            const interactive = extractSeverityToolResult(message.parts);
            if (!interactive) {
              return acc;
            }

            const nextUserMessage = loadedMessages
              .slice(index + 1)
              .find((laterMessage) => laterMessage.role === 'user');
            const submittedRating = extractSubmittedRating(nextUserMessage);
            const hydratedInteractive =
              submittedRating !== null && isRatingInteractiveComponent(interactive)
                ? {
                    ...interactive,
                    initialValue: submittedRating,
                  }
                : interactive;

            acc[message.id] = {
              interactive: hydratedInteractive,
              completed: submittedRating !== null || Boolean(nextUserMessage),
            };
            return acc;
          }, {});

          setAiMessages(loadedMessages);
          setInteractiveState(restoredInteractiveState);
          userMessageCount.current = loadedMessages.filter((m) => m.role === 'user').length;
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadConversation();
  }, [initialMessage, setAiMessages, isLoggedIn]);

  const handleMenuClick = useCallback(() => { setSidebarOpen(true); }, []);
  const handleCloseSidebar = useCallback(() => { setSidebarOpen(false); }, []);

  const handleNavClick = useCallback((navItem: NavItem) => {
    // Quick Entry and Flare Mode open as modals — they don't change the active view
    if (navItem.id === 'quick-entry') {
      setShowQuickEntry(true);
      setSidebarOpen(false);
      return;
    }
    if (navItem.id === 'flare-mode') {
      setShowFlareMode(true);
      setSidebarOpen(false);
      return;
    }
    setActiveNavId(navItem.id);
    setSidebarOpen(false);
    // Reset sub-tab to 'chat' when switching nav items
    setActiveSubTab('chat');
  }, []);

  /**
   * Send a message to the AI backend via useChat's sendMessage
   * Why: Uses Vercel AI SDK v6 best practices for streaming chat
   */
  const handleSendMessage = useCallback(
    async (content: string, files?: FileList) => {
      userMessageCount.current++;
      if (!isLoggedIn && userMessageCount.current >= 3 && !showAuthGate) {
        setShowAuthGate(true);
      }

      // Create conversation via API if not already created
      // Note: supabaseUserId.current is set by checkSessionAndSync effect on mount
      if (!conversationId.current && supabaseUserId.current) {
        console.log('[ClueChat] Creating conversation for user:', supabaseUserId.current);
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: supabaseUserId.current }),
          });
          const data = await res.json();
          if (data.conversationId) {
            conversationId.current = data.conversationId;
            localStorage.setItem('clue_conversation_id', data.conversationId);
            console.log('[ClueChat] Created conversation:', data.conversationId);
          } else if (data.error) {
            console.error('[ClueChat] Failed to create conversation:', data.error);
          }
        } catch (e) {
          console.error('[ClueChat] Failed to create conversation:', e);
        }
      } else if (!conversationId.current && !supabaseUserId.current) {
        console.log('[ClueChat] Skipping conversation creation - no userId (anonymous user)');
      }

      await sendMessage({ text: content, files: files || undefined });
    },
    [sendMessage, isLoggedIn, showAuthGate]
  );

  useEffect(() => {
    if (isLoggedIn) { setShowAuthGate(false); }
  }, [isLoggedIn]);

  /**
   * Handle severity slider submission
   * Why: Marks the interactive component as completed and sends the severity as a user message
   */
  const handleSeveritySubmit = useCallback(
    async (messageId: string, severity: number) => {
      setInteractiveState((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          interactive: isRatingInteractiveComponent(prev[messageId]?.interactive)
            ? {
                ...prev[messageId].interactive,
                initialValue: severity,
              }
            : prev[messageId]?.interactive,
          completed: true,
        },
      }));

      const state = interactiveState[messageId];
      const metric =
        state?.interactive && 'symptom' in state.interactive
          ? state.interactive.metric || state.interactive.symptom
          : 'symptom';

      const severityLabel = severity <= 3 ? 'mild' : severity <= 6 ? 'moderate' : 'severe';
      await handleSendMessage(`${severity}/10 - ${severityLabel} ${metric}`);
    },
    [interactiveState, handleSendMessage]
  );

  /**
   * Handle question from graph unknown node tap
   * Why: Sends the question into the chat and switches to chat view on mobile
   */
  const handleAskQuestion = useCallback(
    async (question: string) => {
      // Switch to chat sub-tab on mobile so user sees the question being answered
      setActiveSubTab('chat');
      // Send the question as a user message
      await handleSendMessage(question);
    },
    [handleSendMessage]
  );

  /**
   * handleSuggestionSelect turns a ranked insight pill into a natural follow-up
   * user message so suggestion taps continue the same chat stream.
   */
  const handleSuggestionSelect = useCallback(
    async (messageId: string, option: ChatSuggestionOption) => {
      setActiveSubTab('chat');
      setInteractiveState((prev) => ({
        ...prev,
        [messageId]: { ...prev[messageId], completed: true },
      }));
      await handleSendMessage(option.prompt);
    },
    [handleSendMessage]
  );

  /**
   * Determines whether the current nav tab uses the split chat+canvas layout.
   * Why: Only 'chat' and 'insights' tabs show the two-panel layout.
   * 'timeline' and 'doctor-pack' are full-width standalone views.
   */
  const isSplitLayout = activeNavId === 'chat' || activeNavId === 'insights';

  /**
   * Renders the right-side canvas panel content based on the active nav tab.
   * Why: Chat tab shows the knowledge graph; Insights tab shows the
   * InsightsPanel. Both share the same canvas slot.
   */
  function renderCanvas() {
    if (activeNavId === 'insights') {
      return <InsightsPanel />;
    }
    return (
      <ChatCanvas
        userId={supabaseUserId.current ?? undefined}
        onAskQuestion={handleAskQuestion}
        refreshTrigger={graphRefreshTrigger}
      />
    );
  }

  /**
   * Renders the full-width view for non-split nav tabs (Timeline, Doctor Summary).
   * Why: These views need the full viewport width to be useful on all screen sizes.
   */
  function renderFullWidthView() {
    if (activeNavId === 'timeline') {
      return (
        <div className="flex flex-1 flex-col min-h-screen min-h-svh w-full overflow-hidden">
          <ChatHeader onMenuClick={handleMenuClick} />
          <TimelineView userId={supabaseUserId.current ?? undefined} />
        </div>
      );
    }
    if (activeNavId === 'doctor-pack') {
      return (
        <div className="flex flex-1 flex-col min-h-screen min-h-svh w-full overflow-hidden">
          <ChatHeader onMenuClick={handleMenuClick} />
          <DoctorSummaryPanel />
        </div>
      );
    }
    return null;
  }

  const activeUser = loggedInUser ?? user;

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
                  <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Google'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Entry modal */}
      <QuickEntryPanel isOpen={showQuickEntry} onClose={() => setShowQuickEntry(false)} />

      {/* Flare Mode modal */}
      <FlareModePanel isOpen={showFlareMode} onClose={() => setShowFlareMode(false)} />

      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        user={activeUser}
        activeNavId={activeNavId}
        onNavClick={handleNavClick}
        isLoggedIn={isLoggedIn}
      />

      {/* Full-width views: Timeline and Doctor Summary */}
      {!isSplitLayout && renderFullWidthView()}

      {/* Split layout: Chat and Insights tabs */}
      {isSplitLayout && (
        <>
          {/* Mobile: single column with swappable content area + fixed pill at bottom */}
          <div className="flex flex-col min-h-svh w-full lg:hidden">
            <ChatHeader
              onMenuClick={handleMenuClick}
              showCanvasPattern={activeSubTab === 'canvas'}
            />
            {/* Content area: chat messages, quick entry, or canvas */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeSubTab === 'chat' ? (
                <ChatMessages
                  messages={messages}
                  user={activeUser}
                  isTyping={isTyping || isLoadingHistory}
                  onSeveritySubmit={handleSeveritySubmit}
                  onSuggestionSelect={handleSuggestionSelect}
                />
              ) : activeSubTab === 'quick-entry' ? (
                <QuickEntryPanel isOpen={true} onClose={() => setActiveSubTab('chat')} variant="inline" />
              ) : (
                renderCanvas()
              )}
            </div>
            {/* Input area with pill — always at bottom */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
              showSubTabPill={true}
              modelProvider={modelProvider}
              onModelProviderChange={setModelProvider}
            />
          </div>

          {/* Desktop: two-column layout (chat left, canvas right) */}
          <div className="hidden w-full flex-col lg:flex lg:h-svh lg:min-h-0 lg:max-w-[420px] lg:flex-none lg:overflow-hidden lg:border-r lg:border-primary/6">
            <ChatHeader onMenuClick={handleMenuClick} />
            <ChatMessages
              messages={messages}
              user={activeUser}
              isTyping={isTyping || isLoadingHistory}
              onSeveritySubmit={handleSeveritySubmit}
              onSuggestionSelect={handleSuggestionSelect}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              activeSubTab="chat"
              onSubTabChange={setActiveSubTab}
              showSubTabPill={false}
              modelProvider={modelProvider}
              onModelProviderChange={setModelProvider}
            />
          </div>

          {/* Desktop: canvas panel — always visible */}
          <div className="hidden flex-1 overflow-hidden lg:flex lg:h-svh lg:min-h-0">
            {renderCanvas()}
          </div>
        </>
      )}

    </div>
  );
}
