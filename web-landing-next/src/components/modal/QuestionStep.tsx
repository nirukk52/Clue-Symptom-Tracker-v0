'use client';

import { useMemo } from 'react';

import { PRODUCT_QUESTIONS, Q1_OPTIONS, Q2_OPTIONS } from '@/content/questions';
import type { ModalResponses, ProductKey } from '@/types';

import { OptionPill } from './OptionPill';

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
  onSelect: (questionId: string, value: string, label: string) => void;
}

export function QuestionStep({
  step,
  product,
  responses,
  onSelect,
}: QuestionStepProps) {
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
      {/* Question text */}
      <h2 className="font-display text-primary text-2xl font-semibold">
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
            onSelect={(value, label) => onSelect(questionId, value, label)}
          />
        ))}
      </div>
    </div>
  );
}
