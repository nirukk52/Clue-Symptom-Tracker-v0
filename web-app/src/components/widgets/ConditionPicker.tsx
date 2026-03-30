'use client';

import { getConditionConfig } from '@/lib/onboarding/content';

/**
 * ConditionPicker - Confirms specific condition for Q3
 *
 * Why this exists: Before capturing baseline data, we need to know
 * which specific condition the user is tracking. This allows for
 * personalized questions and clinical-grade data capture.
 *
 * Design Philosophy:
 * - Pre-suggests based on Q1 domain
 * - Simple tap selection (max 7 options)
 * - Includes "Other" for unlisted conditions
 * - NO EMOJIS (per frontend-design skill)
 */

interface ConditionPickerProps {
  /** Q1 domain (fatigue, flares, migraines, etc.) */
  domain: string;
  /** Currently selected condition */
  selected: string;
  /** Callback when selection changes */
  onChange: (condition: string) => void;
}

export function ConditionPicker({
  domain,
  selected,
  onChange,
}: ConditionPickerProps) {
  const {
    options: conditions,
    question,
    defaultValue,
  } = getConditionConfig(domain);

  // If no selection yet, use default
  const currentValue = selected || defaultValue;

  return (
    <div className="condition-picker-container">
      <h3 className="condition-picker-question">{question}</h3>

      <div className="condition-picker-grid">
        {conditions.map((condition) => (
          <button
            key={condition.value}
            type="button"
            className={`condition-picker-option ${
              currentValue === condition.value ? 'selected' : ''
            }`}
            onClick={() => onChange(condition.value)}
          >
            {condition.label}
          </button>
        ))}
      </div>
    </div>
  );
}
