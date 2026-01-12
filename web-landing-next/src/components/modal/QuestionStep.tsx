'use client';

import { useMemo } from 'react';

import { Q1_OPTIONS, Q2_OPTIONS, Q2_QUESTIONS } from '@/content/questions';
import type { ModalResponses, ProductKey } from '@/types';

import { OptionPill } from './OptionPill';
import { type Q3Data, Q3Step } from './Q3Step';
import { Q4Step } from './Q4Step';

/**
 * QuestionStep - Renders Q1-Q4 with auto-advance on selection
 *
 * Why this exists: Handles the 4-question flow with contextual
 * Q2 options (based on Q1) and product-specific Q3/Q4.
 *
 * Design:
 * - Q1: Short punchy label + description subtext
 * - Q2: Long descriptive text (lived experience)
 * - Q3: Condition picker + baseline widget (max 3 taps)
 * - Q4: Watch list preview (immediate value from Q3 data)
 * - NO EMOJIS (per frontend-design skill)
 */

interface QuestionStepProps {
  step: number;
  _product?: ProductKey; // Reserved for future product-specific customization
  responses: ModalResponses;
  onSelect: (questionId: string, value: string, label: string) => void;
}

export function QuestionStep({ step, responses, onSelect }: QuestionStepProps) {
  // Get question text and options based on step (must be before any early returns)
  const { questionText, options, questionId } = useMemo(() => {
    switch (step) {
      case 1:
        return {
          questionText: 'What has been the hardest to manage lately?',
          options: Q1_OPTIONS,
          questionId: 'q1',
        };
      case 2: {
        const q1Value = responses.q1 || 'other';
        return {
          questionText: Q2_QUESTIONS[q1Value] || Q2_QUESTIONS.other,
          options: Q2_OPTIONS[q1Value] || Q2_OPTIONS.other,
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
      condition: data.condition,
      widgetType: data.widgetType,
      widgetValue: data.widgetValue,
    });
    const label = `${data.condition}: ${data.widgetType === 'slider' ? data.widgetValue : Array.isArray(data.widgetValue) ? data.widgetValue.join(', ') : data.widgetValue}`;
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

  // For Q4, render the WatchListPreview (immediate value)
  if (step === 4) {
    // Parse Q3 data if available
    let q3Data = {
      condition: undefined as string | undefined,
      widgetType: undefined as string | undefined,
      widgetValue: undefined as number | string | string[] | undefined,
    };

    if (responses.q3) {
      try {
        const parsed = JSON.parse(responses.q3);
        q3Data = {
          condition: parsed.condition,
          widgetType: parsed.widgetType,
          widgetValue: parsed.widgetValue,
        };
      } catch {
        // Invalid JSON, use defaults
      }
    }

    return (
      <Q4Step
        q1Domain={responses.q1 || 'other'}
        q2PainPoint={responses.q2 || 'no_focus'}
        q3Data={q3Data}
        onContinue={() => onSelect('q4', 'continue', 'Watch list acknowledged')}
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
