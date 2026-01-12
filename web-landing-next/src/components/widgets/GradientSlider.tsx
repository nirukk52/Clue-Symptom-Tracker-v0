'use client';

import { useCallback, useState } from 'react';

/**
 * GradientSlider - Visual slider with gradient track
 *
 * Why this exists: Primary input for intensity/severity/energy scales.
 * The gradient provides immediate visual feedback without judgment.
 *
 * Design Philosophy:
 * - Large touch target (56px thumb)
 * - Gradient colors: mint (good) → yellow (caution) → rose (high intensity)
 * - No numerical labels by default (reduces anxiety)
 * - Haptic-like visual feedback on drag
 */

interface GradientSliderProps {
  /** Label shown above slider */
  label: string;
  /** Current value (0-100) */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Left end label */
  minLabel?: string;
  /** Right end label */
  maxLabel?: string;
  /** Custom gradient colors [low, mid, high] */
  gradient?: [string, string, string];
  /** Show percentage value */
  showValue?: boolean;
}

export function GradientSlider({
  label,
  value,
  onChange,
  minLabel = 'Low',
  maxLabel = 'High',
  gradient = ['#b8e3d6', '#fcd34d', '#f87171'],
  showValue = false,
}: GradientSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  // Calculate gradient position for thumb color
  const thumbColor =
    value < 33 ? gradient[0] : value < 66 ? gradient[1] : gradient[2];

  return (
    <div className="gradient-slider-container">
      <label className="gradient-slider-label">{label}</label>

      <div className="gradient-slider-track-wrapper">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="gradient-slider-input"
          style={
            {
              '--slider-gradient': `linear-gradient(to right, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`,
              '--thumb-color': thumbColor,
              '--thumb-scale': isDragging ? '1.15' : '1',
            } as React.CSSProperties
          }
        />
      </div>

      <div className="gradient-slider-labels">
        <span className="gradient-slider-min">{minLabel}</span>
        {showValue && (
          <span className="gradient-slider-value">{Math.round(value)}%</span>
        )}
        <span className="gradient-slider-max">{maxLabel}</span>
      </div>
    </div>
  );
}
