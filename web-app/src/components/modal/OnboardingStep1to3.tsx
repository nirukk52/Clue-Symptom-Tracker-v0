'use client';

import { useMemo } from 'react';

import { getQuestion } from '@/lib/onboarding/content';
import type { ModalResponses, ProductKey } from '@/types';

import { OptionPill } from './OptionPill';
import { type Q3Data, Q3Step } from './Q3Step';

/**
 * OnboardingStep1to3 - Renders Q1-Q3 with auto-advance on selection
 *
 * Why this exists: Phase 1 onboarding is 3 interactive questions (Q1-Q3).
 * After Q3, we immediately transition to onboarding Screen 4 (conversion screen)
 * which lives in the modal "summary" step.
 *
 * Design:
 * - Q1: Short punchy label + description subtext
 * - Q2: Long descriptive text (lived experience)
 * - Q3: Condition picker + baseline widget (max 3 taps)
 * - NO EMOJIS (per frontend-design skill)
 */

interface OnboardingStep1to3Props {
  step: number;
  _product?: ProductKey; // Reserved for future product-specific customization
  responses: ModalResponses;
  onSelect: (questionId: string, value: string, label: string) => void;
}

export function OnboardingStep1to3({
  step,
  responses,
  onSelect,
}: OnboardingStep1to3Props) {
  // Get question text and options based on step (must be before any early returns)
  const { questionText, options, questionId } = useMemo(() => {
    switch (step) {
      case 1: {
        const q1 = getQuestion('q1.primary.v1');
        return {
          questionText: q1.prompt,
          options: q1.options,
          questionId: 'q1',
        };
      }
      case 2: {
        const q1Value = responses.q1 || 'other';
        const q2Id = `q2.${q1Value}.v1`;
        const q2 = getQuestion(q2Id === 'q2..v1' ? 'q2.other.v1' : q2Id);
        return {
          questionText: q2.prompt,
          options: q2.options,
          questionId: 'q2',
        };
      }
      default:
        return {
          questionText: '',
          options: [],
          questionId: '',
        };
    }
  }, [step, responses.q1]);

  // Handle Q3 completion - convert Q3Data to expected format
  const handleQ3Complete = (data: Q3Data) => {
    // Convert Q3Data to value/label for tracking
    const value = JSON.stringify({
      conditionId: data.conditionId,
      widgetId: data.widgetId,
      widgetType: data.widgetType,
      widgetValue: data.widgetValue,
    });
    const label = `${data.conditionId}: ${
      data.widgetType === 'slider'
        ? data.widgetValue
        : Array.isArray(data.widgetValue)
          ? data.widgetValue.join(', ')
          : data.widgetValue
    }`;
    onSelect('q3', value, label);
  };

  // For Q3, render the specialized Q3Step component
  if (step === 3) {
    return (
      <Q3Step
        q1Domain={responses.q1 || 'other'}
        q2PainPoint={responses.q2 || 'no_focus'}
        onComplete={handleQ3Complete}
      />
    );
  }

  // For Q1/Q2, render the standard pill selection
  const currentValue = responses[questionId as keyof ModalResponses];

  return (
    <div className="space-y-6">
      {/* Question text */}
      <h2 className="font-display text-primary text-2xl font-semibold">
        {questionText}
      </h2>

      {/* Options - Q1 has label+description, Q2+ has long text only */}
      <div className="space-y-3">
        {options.map((option) => (
          <OptionPill
            key={option.value}
            label={option.label}
            description={option.description}
            value={option.value}
            isSelected={currentValue === option.value}
            onSelect={(value, label) => onSelect(questionId, value, label)}
          />
        ))}
      </div>
    </div>
  );
}
