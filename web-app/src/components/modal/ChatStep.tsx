'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  buildChatContext,
  createChatConversation,
  generateChatResponse,
  generateLLMGreeting,
  getFollowUpChips,
  saveChatMessage,
  storeUserContext,
} from '@/lib/chat';
import { getStoredUTM, trackRedditEvent } from '@/lib/tracking';
import type {
  ChatMessage,
  ModalResponsesStructured,
  ProductKey,
} from '@/types';

/**
 * ChatStep - Post-signup conversational flow
 *
 * Why this exists: After signup, engages user in a brief conversation to
 * capture initial symptom data and make them feel understood. This creates
 * immediate value and increases engagement likelihood.
 */

interface ChatStepProps {
  product: ProductKey;
  responses: ModalResponsesStructured;
  userEmail: string | null;
  modalSessionId: string | null;
  onClose: () => void;
}

export function ChatStep({
  product,
  responses,
  userEmail,
  modalSessionId,
  onClose,
}: ChatStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat on mount
  useEffect(() => {
    async function initChat() {
      setIsLoading(true);

      try {
        // Create conversation in Supabase
        const utm = getStoredUTM();
        const convId = await createChatConversation(
          modalSessionId,
          userEmail,
          product,
          {
            source: utm.utm_source,
            medium: utm.utm_medium,
            campaign: utm.utm_campaign,
            content: utm.utm_content,
          }
        );
        setConversationId(convId);

        // Store user context for cross-session persistence
        if (userEmail) {
          await storeUserContext(
            userEmail,
            responses,
            product,
            convId || undefined
          );
        }

        // Generate LLM greeting
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
        const context = buildChatContext(
          responses,
          product,
          0,
          convId || undefined,
          userEmail || undefined
        );
        const { greeting, chips: initialChips } = await generateLLMGreeting(
          context,
          apiKey
        );

        // Add greeting message
        const greetingMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: greeting,
          createdAt: new Date().toISOString(),
        };
        setMessages([greetingMessage]);
        setChips(initialChips);

        // Save to Supabase
        if (convId) {
          await saveChatMessage(convId, 'assistant', greeting);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        // Fallback greeting
        const fallbackMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Great to have you here! Since you mentioned dealing with ${responses.q1.answerLabel.toLowerCase()}, let's get your first data point. How are you feeling right now?`,
          createdAt: new Date().toISOString(),
        };
        setMessages([fallbackMessage]);
        setChips(['Not great', 'Okay', 'Pretty good']);
      } finally {
        setIsLoading(false);
      }
    }

    initChat();
  }, [product, responses, userEmail, modalSessionId]);

  // Handle chip click
  const handleChipClick = useCallback(async (chipText: string) => {
    await handleUserMessage(chipText, true);
  }, []);

  // Handle user message (from input or chip)
  const handleUserMessage = useCallback(
    async (text: string, wasChip = false) => {
      if (!text.trim() || isSending) return;

      setIsSending(true);

      // Add user message to UI
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text,
        selectedChip: wasChip ? text : undefined,
        wasChipSelection: wasChip,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');

      // Save to Supabase
      if (conversationId) {
        await saveChatMessage(
          conversationId,
          'user',
          text,
          wasChip ? text : undefined
        );
      }

      // Increment message count
      messageCountRef.current += 1;
      const currentCount = messageCountRef.current;

      // Track Reddit Lead on first message
      if (currentCount === 1) {
        trackRedditEvent('Lead');
      }

      // Hide chips after first response
      setChips([]);

      // Show typing indicator
      const typingId = `typing_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        } as ChatMessage & { isTyping: true },
      ]);

      // Generate LLM response
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
        const context = buildChatContext(
          responses,
          product,
          currentCount,
          conversationId || undefined,
          userEmail || undefined
        );

        // Filter out typing indicator for context
        const historyForContext = messages.filter((m) => m.content !== '');

        const response = await generateChatResponse(
          text,
          historyForContext,
          context,
          apiKey
        );

        // Remove typing indicator and add response
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== typingId);
          return [
            ...filtered,
            {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: response,
              createdAt: new Date().toISOString(),
            },
          ];
        });

        // Save to Supabase
        if (conversationId) {
          await saveChatMessage(conversationId, 'assistant', response);
        }

        // Show done button after 2+ exchanges
        if (currentCount >= 2) {
          setShowDone(true);
        }

        // Update chips for next round
        const followUpChips = getFollowUpChips(currentCount);
        if (followUpChips) {
          setChips(followUpChips);
        }
      } catch (err) {
        console.error('Error generating response:', err);
        // Remove typing indicator
        setMessages((prev) => prev.filter((m) => m.id !== typingId));
      } finally {
        setIsSending(false);
      }
    },
    [messages, conversationId, product, responses, userEmail, isSending]
  );

  // Handle send button click
  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      handleUserMessage(inputText, false);
    }
  }, [inputText, handleUserMessage]);

  // Handle enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="chat-container">
      {/* Messages area */}
      <div className="chat-messages">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="chat-bubble assistant typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) =>
              message.content === '' ? (
                // Typing indicator
                <div key={message.id} className="chat-bubble assistant typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              ) : (
                <div key={message.id} className={`chat-bubble ${message.role}`}>
                  {message.content}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick reply chips */}
      {chips.length > 0 && (
        <div className="chat-chips">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isSending}
              className="chat-chip"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Chat input */}
      <div className="chat-input-wrapper">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Or type your own..."
          className="chat-input"
          disabled={isSending}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
          className="chat-send"
        >
          <MaterialIcon name="send" size="sm" />
        </button>
      </div>

      {/* Done button */}
      {showDone && (
        <button type="button" onClick={onClose} className="chat-done">
          Got it, thanks!
          <MaterialIcon name="check" size="sm" />
        </button>
      )}
    </div>
  );
}
