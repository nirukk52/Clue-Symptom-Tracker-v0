'use client';

import { useCallback, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import {
  getDeviceType,
  getPersona,
  getSessionId,
  getStoredUTM,
  getVisitId,
  trackRedditEvent,
} from '@/lib/tracking';
import type { ModalResponse, ModalSession, ProductKey } from '@/types';

/**
 * useModalTracking - Tracks modal sessions and responses
 *
 * Why this exists: Tracks detailed funnel analytics - when users open modal,
 * which questions they answer, how long each takes, and where they drop off.
 * Previously 300+ lines in campaign-modal.js.
 */

const TOTAL_QUESTIONS = 4;

interface UseModalTrackingOptions {
  product: ProductKey;
}

export function useModalTracking({ product }: UseModalTrackingOptions) {
  const modalSessionId = useRef<string | null>(null);
  const startTime = useRef<number | null>(null);
  const questionStartTime = useRef<number | null>(null);

  /**
   * Starts a new modal session when user opens the modal
   */
  const startModalSession = useCallback(async () => {
    const { persona } = getPersona();
    const sessionId = getSessionId();
    const visitId = getVisitId();
    const utm = getStoredUTM();
    const deviceType = getDeviceType();

    startTime.current = Date.now();
    questionStartTime.current = Date.now();

    try {
      const sessionData: Partial<ModalSession> = {
        visit_id: visitId || undefined,
        session_id: sessionId,
        product_offering: product,
        persona_shown: persona,
        utm_content: utm.utm_content,
        device_type: deviceType,
        step_reached: 1,
        total_steps: TOTAL_QUESTIONS,
      };

      const { data, error } = await supabase
        .from('modal_sessions')
        .insert(sessionData)
        .select('id')
        .single();

      if (error) {
        console.error('Error starting modal session:', error);
        return null;
      }

      if (data?.id) {
        modalSessionId.current = data.id;
        return data.id;
      }
    } catch (err) {
      console.error('Error starting modal session:', err);
    }

    return null;
  }, [product]);

  /**
   * Updates modal session progress (step reached)
   * Only sets step_reached - abandonment is tracked separately in abandonModalSession
   */
  const updateModalSession = useCallback(
    async (currentStep: number, completed = false) => {
      if (!modalSessionId.current) return;

      try {
        const updateData: Partial<ModalSession> = {
          step_reached: currentStep,
          updated_at: new Date().toISOString(),
        };

        if (completed) {
          updateData.completed = true;
          updateData.completed_at = new Date().toISOString();
          updateData.time_to_complete_ms = startTime.current
            ? Date.now() - startTime.current
            : undefined;

          // Track Reddit conversion on completion
          trackRedditEvent('Lead');
        }
        // Note: We no longer set abandoned_at_step here
        // Abandonment is only tracked when user explicitly closes the modal

        await supabase
          .from('modal_sessions')
          .update(updateData)
          .eq('id', modalSessionId.current);
      } catch (err) {
        console.error('Error updating modal session:', err);
      }
    },
    []
  );

  /**
   * Logs an individual question response
   */
  const logResponse = useCallback(
    async (
      questionNumber: number,
      questionKey: string,
      questionText: string,
      answerValue: string,
      answerLabel: string,
      previousAnswer?: string
    ) => {
      if (!modalSessionId.current) return;

      const timeToAnswer = questionStartTime.current
        ? Date.now() - questionStartTime.current
        : undefined;

      // Reset timer for next question
      questionStartTime.current = Date.now();

      try {
        const responseData: Partial<ModalResponse> = {
          modal_session_id: modalSessionId.current,
          question_number: questionNumber,
          question_key: questionKey,
          question_text: questionText,
          step_number: questionNumber,
          answer_value: answerValue,
          answer_label: answerLabel,
          previous_answer_value: previousAnswer,
          product_offering: product,
          time_to_answer_ms: timeToAnswer,
        };

        await supabase.from('modal_responses').insert(responseData);

        // Update session step reached
        await updateModalSession(questionNumber);
      } catch (err) {
        console.error('Error logging response:', err);
      }
    },
    [product, updateModalSession]
  );

  /**
   * Marks the modal session as completed (after email signup)
   */
  const completeModalSession = useCallback(async () => {
    await updateModalSession(TOTAL_QUESTIONS + 1, true);
  }, [updateModalSession]);

  /**
   * Called when modal is closed without completing
   */
  const abandonModalSession = useCallback(async (lastStep: number) => {
    if (!modalSessionId.current) return;

    try {
      await supabase
        .from('modal_sessions')
        .update({
          abandoned_at_step: lastStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', modalSessionId.current);
    } catch (err) {
      console.error('Error marking session abandoned:', err);
    }
  }, []);

  /**
   * Resets tracking state (e.g., when modal reopens)
   */
  const resetTracking = useCallback(() => {
    modalSessionId.current = null;
    startTime.current = null;
    questionStartTime.current = null;
  }, []);

  return {
    startModalSession,
    updateModalSession,
    logResponse,
    completeModalSession,
    abandonModalSession,
    resetTracking,
    getSessionId: () => modalSessionId.current,
  };
}
