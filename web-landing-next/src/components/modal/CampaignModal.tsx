'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ProductKey, ModalResponses } from '@/types';
import { supabase } from '@/lib/supabase';
import { getStoredUTM, getSessionId, pushToDataLayer } from '@/lib/tracking';
import { QuestionStep } from './QuestionStep';
import { EmailStep } from './EmailStep';
import { SuccessStep } from './SuccessStep';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

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
 * 5. Email capture
 * 6. Success confirmation
 */

interface CampaignModalProps {
  product: ProductKey;
  isOpen: boolean;
  step: 'questions' | 'email' | 'success';
  questionNumber: number;
  responses: ModalResponses;
  email: string;
  onClose: () => void;
  onSelectAnswer: (questionId: string, value: string) => void;
  onGoToSuccess: (email: string) => void;
}

export function CampaignModal({
  product,
  isOpen,
  step,
  questionNumber,
  responses,
  email,
  onClose,
  onSelectAnswer,
  onGoToSuccess,
}: CampaignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle email submission
  const handleEmailSubmit = useCallback(async (userEmail: string) => {
    setIsSubmitting(true);

    try {
      const utm = getStoredUTM();
      const sessionId = getSessionId();

      // Insert to beta_signups table
      await supabase.from('beta_signups').insert({
        email: userEmail,
        session_id: sessionId,
        product_offering: product,
        responses: responses,
        landing_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
      });

      // Track signup event
      await supabase.from('marketing_events').insert({
        event_type: 'signup_complete',
        session_id: sessionId,
        element_id: 'modal_email_submit',
        element_text: userEmail,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
      });

      // Push to GTM for conversion tracking
      pushToDataLayer('signup_complete', {
        product_offering: product,
        email: userEmail,
      });

      // Trigger Reddit conversion pixel
      if (typeof window !== 'undefined' && window.rdt) {
        window.rdt('track', 'SignUp');
      }

      onGoToSuccess(userEmail);
    } catch (error) {
      console.error('Signup error:', error);
      // Still show success to user - we don't want to lose them
      onGoToSuccess(userEmail);
    } finally {
      setIsSubmitting(false);
    }
  }, [product, responses, onGoToSuccess]);

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

          {/* Step content */}
          {step === 'questions' && (
            <QuestionStep
              step={questionNumber}
              product={product}
              responses={responses}
              onSelect={onSelectAnswer}
            />
          )}

          {step === 'email' && (
            <EmailStep
              onSubmit={handleEmailSubmit}
              isLoading={isSubmitting}
            />
          )}

          {step === 'success' && (
            <SuccessStep
              email={email}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
