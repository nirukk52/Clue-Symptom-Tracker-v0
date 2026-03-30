'use client';

import { useCallback, useState } from 'react';

/**
 * RatingSlider - Generalized interactive rating picker for health tracking
 *
 * Why this exists: Provides a visual, touch-friendly way for users to
 * rate various health metrics (1-10 scale). Appears inline in chat when
 * the AI asks about symptom severity, energy, mood, etc. Uses gradient
 * colors from mint (low) to rose (high) matching the design system.
 *
 * Label presets enable context-appropriate vocabulary:
 * - Severity: Mild / Moderate / Severe (default)
 * - Energy: Low / Medium / High
 * - Mood: Poor / Okay / Good
 */

/** Label configuration for the three rating zones (1-3, 4-6, 7-10) */
export interface RatingLabels {
  low: string;
  mid: string;
  high: string;
}

/** Preset label configurations for common health metrics */
export const RATING_LABEL_PRESETS: Record<string, RatingLabels> = {
  severity: { low: 'Mild', mid: 'Moderate', high: 'Severe' },
  energy: { low: 'Low', mid: 'Medium', high: 'High' },
  mood: { low: 'Poor', mid: 'Okay', high: 'Good' },
  stress: { low: 'Low', mid: 'Moderate', high: 'High' },
  pain: { low: 'Mild', mid: 'Moderate', high: 'Severe' },
  sleep: { low: 'Poor', mid: 'Fair', high: 'Good' },
};

interface RatingSliderProps {
  /** The metric being rated (e.g., "headache", "energy level") */
  metric: string;
  /** Optional custom prompt text from the AI */
  prompt?: string;
  /** Initial value (1-10) */
  initialValue?: number;
  /** Called when user confirms their selection */
  onSubmit: (value: number) => void;
  /** Whether the slider is disabled (already submitted) */
  disabled?: boolean;
  /** Custom labels for low/mid/high zones, or a preset name */
  labels?: RatingLabels | keyof typeof RATING_LABEL_PRESETS;
}

export function RatingSlider({
  metric,
  prompt,
  initialValue = 5,
  onSubmit,
  disabled = false,
  labels = 'severity',
}: RatingSliderProps) {
  const [value, setValue] = useState(initialValue);
  const [isSubmitted, setIsSubmitted] = useState(disabled);

  // Resolve labels from preset or custom object
  const resolvedLabels: RatingLabels = typeof labels === 'string'
    ? RATING_LABEL_PRESETS[labels] || RATING_LABEL_PRESETS.severity
    : labels;

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

  const getRatingLabel = (val: number): string => {
    if (val <= 3) return resolvedLabels.low;
    if (val <= 6) return resolvedLabels.mid;
    return resolvedLabels.high;
  };

  const getRatingColor = (val: number): string => {
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
          {prompt || `Rate your ${metric}.`}
        </p>
        <span
          className={`rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm ${getRatingColor(value)}`}
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
          aria-label={`Rating of ${metric}`}
        />
      </div>

      {/* Labels */}
      <div className="text-text-muted mt-2 flex justify-between text-xs">
        <span>{resolvedLabels.low}</span>
        <span>{resolvedLabels.mid}</span>
        <span>{resolvedLabels.high}</span>
      </div>

      {/* Submit button - only show if not yet submitted */}
      {!isSubmitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-3 w-full py-2.5 px-4 bg-primary text-white rounded-xl font-medium text-[14px] hover:bg-primary/90 transition-all cursor-pointer"
        >
          Confirm {getRatingLabel(value)} ({value}/10)
        </button>
      )}

      {/* Submitted state indicator */}
      {isSubmitted && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-text-muted">
          <span className="text-teal-500">✓</span>
          Logged as {getRatingLabel(value)} ({value}/10)
        </div>
      )}
    </div>
  );
}

/**
 * SeveritySlider - Backwards-compatible alias for RatingSlider
 * Why: Maintains existing API while using the generalized component
 */
export function SeveritySlider(props: Omit<RatingSliderProps, 'labels'> & { symptom: string }) {
  return (
    <RatingSlider
      {...props}
      metric={props.symptom}
      labels="severity"
    />
  );
}
