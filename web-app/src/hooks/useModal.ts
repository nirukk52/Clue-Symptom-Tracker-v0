'use client';

import { useCallback, useRef, useState } from 'react';

import { PRODUCT_QUESTIONS } from '@/content/questions';
import type {
  ModalResponses,
  ModalResponsesStructured,
  ProductKey,
} from '@/types';

import { useModalTracking } from './useModalTracking';

/**
 * useModal - State management and tracking for campaign modal
 *
 * Why this exists: Encapsulates modal open/close state, current step,
 * question responses, AND tracking to Supabase. Previously scattered
 * across 2600 lines of campaign-modal.js.
 *
 * Flow: questions → summary (AI + auth) → chat
 */

export type ModalStep = 'questions' | 'summary' | 'chat';

interface UseModalOptions {
  product: ProductKey;
}

interface UseModalReturn {
  isOpen: boolean;
  step: ModalStep;
  questionNumber: number;
  responses: ModalResponses;
  structuredResponses: ModalResponsesStructured;
  email: string;
  modalSessionId: string | null;
  openModal: () => void;
  closeModal: () => void;
  setQuestionNumber: (num: number) => void;
  setResponse: (questionId: string, value: string, label: string) => void;
  goToSummary: () => void;
  goToChat: (email: string) => void;
  resetModal: () => void;
}

const AUTO_ADVANCE_DELAY = 350; // ms

export function useModal({ product }: UseModalOptions): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('questions');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [responses, setResponses] = useState<ModalResponses>({});
  const [email, setEmail] = useState('');

  // Track previous answers for change detection
  const previousResponses = useRef<ModalResponses>({});

  // Modal tracking hook
  const {
    startModalSession,
    logResponse,
    completeModalSession,
    abandonModalSession,
    resetTracking,
    getSessionId: getModalSessionId,
  } = useModalTracking({ product });

  const openModal = useCallback(async () => {
    setIsOpen(true);
    // Reset to initial state when opening
    setStep('questions');
    setQuestionNumber(1);
    setResponses({});
    setEmail('');
    previousResponses.current = {};

    // Start tracking session
    await startModalSession();
  }, [startModalSession]);

  const closeModal = useCallback(() => {
    // Track abandonment if not completed
    if (step !== 'chat') {
      abandonModalSession(questionNumber);
    }
    setIsOpen(false);
  }, [step, questionNumber, abandonModalSession]);

  const setResponse = useCallback(
    (questionId: string, value: string, label: string) => {
      // Get question text for tracking
      const questionKey = `q${questionNumber}_${getQuestionKey(questionNumber)}`;
      const questionText = getQuestionText(questionNumber, product, responses);
      const previousAnswer =
        previousResponses.current[questionId as keyof ModalResponses];

      // Log response to Supabase
      logResponse(
        questionNumber,
        questionKey,
        questionText,
        value,
        label,
        previousAnswer
      );

      // Update state with both value and label
      setResponses((prev) => ({
        ...prev,
        [questionId]: value,
        [`${questionId}_label`]: label,
      }));
      previousResponses.current = {
        ...previousResponses.current,
        [questionId]: value,
        [`${questionId}_label`]: label,
      };

      // Auto-advance after delay
      // Skip Q4 - go directly to ValuePropScreen (summary) after Q3
      setTimeout(() => {
        if (questionNumber < 3) {
          setQuestionNumber((num) => num + 1);
        } else {
          // Move to summary step after Q3 (with AI-driven ValuePropScreen)
          setStep('summary');
        }
      }, AUTO_ADVANCE_DELAY);
    },
    [questionNumber, product, responses, logResponse]
  );

  const goToSummary = useCallback(() => {
    setStep('summary');
  }, []);

  const goToChat = useCallback(
    (userEmail: string) => {
      // Ensure modal is open (important for OAuth return flow)
      setIsOpen(true);
      setEmail(userEmail);

      // Restore responses from sessionStorage (important for OAuth return)
      // These are stored before OAuth redirect in SummaryStep.tsx
      if (typeof window !== 'undefined') {
        const storedResponses = sessionStorage.getItem(
          'pending_chat_responses'
        );
        if (storedResponses) {
          try {
            const parsed = JSON.parse(storedResponses);
            // Convert structured responses back to flat format
            const flatResponses: ModalResponses = {};
            if (parsed.q1) {
              flatResponses.q1 = parsed.q1.answerValue;
              flatResponses.q1_label = parsed.q1.answerLabel;
            }
            if (parsed.q2) {
              flatResponses.q2 = parsed.q2.answerValue;
              flatResponses.q2_label = parsed.q2.answerLabel;
            }
            if (parsed.q3) {
              flatResponses.q3 = parsed.q3.answerValue;
              flatResponses.q3_label = parsed.q3.answerLabel;
            }
            if (parsed.q4) {
              flatResponses.q4 = parsed.q4.answerValue;
              flatResponses.q4_label = parsed.q4.answerLabel;
            }
            setResponses(flatResponses);
          } catch {
            console.warn('Failed to parse stored responses');
          }
          // Clean up after restoring
          sessionStorage.removeItem('pending_chat_responses');
        }
      }

      setStep('chat');
      // Mark session as completed
      completeModalSession();
    },
    [completeModalSession]
  );

  const resetModal = useCallback(() => {
    setStep('questions');
    setQuestionNumber(1);
    setResponses({});
    setEmail('');
    previousResponses.current = {};
    resetTracking();
  }, [resetTracking]);

  // Build structured responses for summary generation
  const structuredResponses: ModalResponsesStructured = {
    q1: {
      questionKey: 'q1_entry',
      questionText: 'What brings you here today?',
      answerValue: responses.q1 || '',
      answerLabel: responses.q1_label || responses.q1 || '',
    },
    q2: {
      questionKey: 'q2_pain_point',
      questionText: "What's been hardest about managing this?",
      answerValue: responses.q2 || '',
      answerLabel: responses.q2_label || responses.q2 || '',
    },
    q3: {
      questionKey: 'q3_product_specific',
      questionText: getQuestionText(3, product, responses),
      answerValue: responses.q3 || '',
      answerLabel: responses.q3_label || responses.q3 || '',
    },
    q4: {
      questionKey: 'q4_product_specific',
      questionText: getQuestionText(4, product, responses),
      answerValue: responses.q4 || '',
      answerLabel: responses.q4_label || responses.q4 || '',
    },
  };

  return {
    isOpen,
    step,
    questionNumber,
    responses,
    structuredResponses,
    email,
    modalSessionId: getModalSessionId(),
    openModal,
    closeModal,
    setQuestionNumber,
    setResponse,
    goToSummary,
    goToChat,
    resetModal,
  };
}

// Helper functions for question tracking

function getQuestionKey(questionNumber: number): string {
  const keys = ['entry', 'pain_point', 'product_specific', 'product_specific'];
  return keys[questionNumber - 1] || 'unknown';
}

function getQuestionText(
  questionNumber: number,
  product: ProductKey,
  _responses: ModalResponses
): string {
  if (questionNumber === 1) {
    return 'What brings you here today?';
  }
  if (questionNumber === 2) {
    return "What's been hardest about managing this?";
  }
  // Q3 and Q4 are product-specific
  const productQuestions = PRODUCT_QUESTIONS[product];
  if (questionNumber === 3 && productQuestions?.q3) {
    return productQuestions.q3.text;
  }
  if (questionNumber === 4 && productQuestions?.q4) {
    return productQuestions.q4.text;
  }
  return `Question ${questionNumber}`;
}
