'use client';

import { useMemo } from 'react';
import type { ModalResponses, ProductKey } from '@/types';
import { Q1_OPTIONS, Q2_OPTIONS, PRODUCT_QUESTIONS } from '@/content/questions';
import { OptionPill } from './OptionPill';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * QuestionStep - Renders Q1-Q4 with auto-advance on selection
 *
 * Why this exists: Handles the 4-question flow with contextual
 * Q2 options (based on Q1) and product-specific Q3/Q4.
 */

interface QuestionStepProps {
  step: number;
  product: ProductKey;
  responses: ModalResponses;
  onSelect: (questionId: string, value: string) => void;
}

export function QuestionStep({ step, product, responses, onSelect }: QuestionStepProps) {
  // Get question text and options based on step
  const { questionText, options, questionId } = useMemo(() => {
    switch (step) {
      case 1:
        return {
          questionText: "What's your biggest struggle right now?",
          options: Q1_OPTIONS,
          questionId: 'q1',
        };
      case 2: {
        const q1Value = responses.q1 || 'other';
        return {
          questionText: 'What makes it hardest?',
          options: Q2_OPTIONS[q1Value] || Q2_OPTIONS.other,
          questionId: 'q2',
        };
      }
      case 3: {
        const productQ = PRODUCT_QUESTIONS[product] || PRODUCT_QUESTIONS.home;
        return {
          questionText: productQ.q3.text,
          options: productQ.q3.options,
          questionId: 'q3',
        };
      }
      case 4: {
        const productQ = PRODUCT_QUESTIONS[product] || PRODUCT_QUESTIONS.home;
        return {
          questionText: productQ.q4.text,
          options: productQ.q4.options,
          questionId: 'q4',
        };
      }
      default:
        return { questionText: '', options: [], questionId: '' };
    }
  }, [step, product, responses.q1]);

  const currentValue = responses[questionId as keyof ModalResponses];

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              num <= step ? 'bg-accent-purple' : 'bg-primary/10'
            }`}
          />
        ))}
      </div>

      {/* Question number badge */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <MaterialIcon name="chat_bubble" size="sm" />
        <span>Question {step} of 4</span>
      </div>

      {/* Question text */}
      <h2 className="font-display text-2xl font-semibold text-primary">
        {questionText}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => (
          <OptionPill
            key={option.value}
            label={option.label}
            value={option.value}
            isSelected={currentValue === option.value}
            onSelect={(value) => onSelect(questionId, value)}
          />
        ))}
      </div>
    </div>
  );
}
