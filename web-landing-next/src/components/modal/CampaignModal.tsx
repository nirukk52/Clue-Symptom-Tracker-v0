'use client';

import { useEffect } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type {
  ModalResponses,
  ModalResponsesStructured,
  ProductKey,
} from '@/types';

import { ChatStep } from './ChatStep';
import { QuestionStep } from './QuestionStep';
import { SummaryStep } from './SummaryStep';

/**
 * CampaignModal - Main modal component for lead capture
 *
 * Why this exists: Consolidates the 2600-line campaign-modal.js into
 * a React component with proper state management and type safety.
 *
 * Flow:
 * 1. Q1: Universal entry point (what's your struggle?)
 * 2. Q2: Contextual pain point (based on Q1)
 * 3. Q3: Product-specific question
 * 4. Q4: Product-specific question
 * 5. Summary: AI-generated personalized summary + auth (Google / email)
 * 6. Chat: Post-signup conversational flow
 */

interface CampaignModalProps {
  product: ProductKey;
  isOpen: boolean;
  step: 'questions' | 'summary' | 'chat';
  questionNumber: number;
  responses: ModalResponses;
  structuredResponses: ModalResponsesStructured;
  email: string;
  modalSessionId: string | null;
  onClose: () => void;
  onSelectAnswer: (questionId: string, value: string, label: string) => void;
  onGoToChat: (email: string) => void;
}

export function CampaignModal({
  product,
  isOpen,
  step,
  questionNumber,
  responses,
  structuredResponses,
  email,
  modalSessionId,
  onClose,
  onSelectAnswer,
  onGoToChat,
}: CampaignModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Check for OAuth return (show_chat=true in URL)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const showChat = urlParams.get('show_chat');

    if (showChat === 'true') {
      const oauthEmail = sessionStorage.getItem('oauth_user_email');

      // Clean up sessionStorage
      sessionStorage.removeItem('pending_chat_redirect');
      sessionStorage.removeItem('pending_chat_return_url');
      sessionStorage.removeItem('oauth_user_email');

      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      // Trigger chat with the email
      if (oauthEmail) {
        onGoToChat(oauthEmail);
      }
    }
  }, [onGoToChat]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-overlay active"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="modal-container active" role="dialog" aria-modal="true">
        <div className="modal-content">
          {/* Close button */}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <MaterialIcon name="close" size="sm" />
          </button>

          {/* Progress dots (only for questions step) */}
          {step === 'questions' && (
            <div className="modal-progress">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`modal-dot ${
                    num < questionNumber ? 'completed' : ''
                  } ${num === questionNumber ? 'active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Step content */}
          {step === 'questions' && (
            <QuestionStep
              step={questionNumber}
              product={product}
              responses={responses}
              onSelect={onSelectAnswer}
            />
          )}

          {step === 'summary' && (
            <SummaryStep
              product={product}
              responses={structuredResponses}
              modalSessionId={modalSessionId}
              onGoogleSuccess={onGoToChat}
              onEmailSuccess={onGoToChat}
            />
          )}

          {step === 'chat' && (
            <ChatStep
              product={product}
              responses={structuredResponses}
              userEmail={email}
              modalSessionId={modalSessionId}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
