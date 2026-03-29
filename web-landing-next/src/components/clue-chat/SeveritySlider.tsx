'use client';

import { useCallback, useState } from 'react';

/**
 * SeveritySlider - Interactive severity picker for symptom logging
 *
 * Why this exists: Provides a visual, touch-friendly way for users to
 * indicate symptom severity (1-10 scale). Appears inline in chat when
 * the AI asks about symptom intensity. Uses gradient colors from
 * mint (mild) to rose (severe) matching the design system.
 */

interface SeveritySliderProps {
  /** The symptom being rated (e.g., "headache", "fatigue") */
  symptom: string;
  /** Optional custom prompt text from the AI */
  prompt?: string;
  /** Initial severity value (1-10) */
  initialValue?: number;
  /** Called when user confirms their selection */
  onSubmit: (severity: number) => void;
  /** Whether the slider is disabled (already submitted) */
  disabled?: boolean;
}

export function SeveritySlider({
  symptom,
  prompt,
  initialValue = 5,
  onSubmit,
  disabled = false,
}: SeveritySliderProps) {
  const [value, setValue] = useState(initialValue);
  const [isSubmitted, setIsSubmitted] = useState(disabled);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isSubmitted) {
      setIsSubmitted(true);
      onSubmit(value);
    }
  }, [value, isSubmitted, onSubmit]);

  const percentage = ((value - 1) / 9) * 100;

  const getSeverityLabel = (val: number): string => {
    if (val <= 3) return 'Mild';
    if (val <= 6) return 'Moderate';
    return 'Severe';
  };

  const getSeverityColor = (val: number): string => {
    if (val <= 3) return 'text-accent-mint';
    if (val <= 6) return 'text-accent-peach';
    return 'text-accent-rose';
  };

  return (
    <div
      className={`from-accent-mint/20 via-accent-peach/20 to-accent-rose/30 rounded-2xl bg-gradient-to-r p-4 max-w-sm ${
        isSubmitted ? 'opacity-80' : ''
      }`}
    >
      {/* Header with question and value display */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-primary text-sm font-medium">
          {prompt || `How bad is the ${symptom}?`}
        </p>
        <span
          className={`rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm ${getSeverityColor(value)}`}
        >
          {value}/10
        </span>
      </div>

      {/* Slider track container */}
      <div className="relative">
        {/* Background track with gradient */}
        <div className="from-accent-mint via-accent-peach to-accent-rose h-3 w-full rounded-full bg-gradient-to-r opacity-40" />

        {/* Filled portion */}
        <div
          className="from-accent-mint via-accent-peach to-accent-rose absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-all duration-150"
          style={{
            left: `calc(${percentage}% - 10px)`,
            backgroundColor:
              value <= 3
                ? 'var(--color-accent-mint)'
                : value <= 6
                  ? 'var(--color-accent-peach)'
                  : 'var(--color-accent-rose)',
          }}
        />

        {/* Invisible range input for interaction */}
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={handleChange}
          disabled={isSubmitted}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
          aria-label={`Severity of ${symptom}`}
        />
      </div>

      {/* Labels */}
      <div className="text-text-muted mt-2 flex justify-between text-xs">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>

      {/* Submit button - only show if not yet submitted */}
      {!isSubmitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-3 w-full py-2.5 px-4 bg-primary text-white rounded-xl font-medium text-[14px] hover:bg-primary/90 transition-all cursor-pointer"
        >
          Confirm {getSeverityLabel(value)} ({value}/10)
        </button>
      )}

      {/* Submitted state indicator */}
      {isSubmitted && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-text-muted">
          <span className="text-teal-500">✓</span>
          Logged as {getSeverityLabel(value)} ({value}/10)
        </div>
      )}
    </div>
  );
}
