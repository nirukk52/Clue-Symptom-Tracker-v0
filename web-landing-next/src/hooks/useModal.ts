'use client';

import { useState, useCallback } from 'react';
import type { ModalResponses } from '@/types';

/**
 * useModal - State management for campaign modal
 *
 * Why this exists: Encapsulates modal open/close state, current step,
 * and question responses. Previously scattered across campaign-modal.js.
 */

export type ModalStep = 'questions' | 'email' | 'success';

interface UseModalReturn {
  isOpen: boolean;
  step: ModalStep;
  questionNumber: number;
  responses: ModalResponses;
  email: string;
  openModal: () => void;
  closeModal: () => void;
  setQuestionNumber: (num: number) => void;
  setResponse: (questionId: string, value: string) => void;
  goToEmail: () => void;
  goToSuccess: (email: string) => void;
  resetModal: () => void;
}

const AUTO_ADVANCE_DELAY = 350; // ms

export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('questions');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [responses, setResponses] = useState<ModalResponses>({});
  const [email, setEmail] = useState('');

  const openModal = useCallback(() => {
    setIsOpen(true);
    // Reset to initial state when opening
    setStep('questions');
    setQuestionNumber(1);
    setResponses({});
    setEmail('');
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setResponse = useCallback((questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance after delay
    setTimeout(() => {
      if (questionNumber < 4) {
        setQuestionNumber((num) => num + 1);
      } else {
        // Move to email step after Q4
        setStep('email');
      }
    }, AUTO_ADVANCE_DELAY);
  }, [questionNumber]);

  const goToEmail = useCallback(() => {
    setStep('email');
  }, []);

  const goToSuccess = useCallback((userEmail: string) => {
    setEmail(userEmail);
    setStep('success');
  }, []);

  const resetModal = useCallback(() => {
    setStep('questions');
    setQuestionNumber(1);
    setResponses({});
    setEmail('');
  }, []);

  return {
    isOpen,
    step,
    questionNumber,
    responses,
    email,
    openModal,
    closeModal,
    setQuestionNumber,
    setResponse,
    goToEmail,
    goToSuccess,
    resetModal,
  };
}
