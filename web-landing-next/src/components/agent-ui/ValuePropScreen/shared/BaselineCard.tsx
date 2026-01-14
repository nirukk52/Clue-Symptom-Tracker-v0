'use client';

/**
 * BaselineCard - Displays the Q3 baseline data captured
 *
 * Why this exists: Shows users their "Day 1" data point as proof of progress.
 * Creates ownership ("this is MY data") and immediate value from onboarding.
 *
 * Design: Warm cream background, condition badge, value display
 */

import type { BaselineData } from '@/backend/agents/onboarding/types';
import { getMicrocopy } from '@/lib/onboarding/content';

interface BaselineCardProps {
  baseline: BaselineData;
}

/**
 * Formats the baseline value for display based on widget type
 */
function formatValue(
  value: string | number,
  widgetType: string
): { display: string; suffix?: string } {
  // Slider values are percentages
  if (
    widgetType === 'slider' ||
    widgetType === 'gradient_slider' ||
    widgetType === 'dual_slider'
  ) {
    const numValue = typeof value === 'number' ? value : parseInt(value, 10);
    return { display: String(numValue), suffix: '%' };
  }

  // Time segments
  if (widgetType === 'time_segment_selector') {
    const timeLabels: Record<string, string> = {
      early_morning: '6-9am',
      late_morning: '9am-12pm',
      afternoon: '12-5pm',
      evening: '5-9pm',
      varies: 'Varies',
      none: 'Rarely',
    };
    return {
      display: timeLabels[String(value)] || String(value),
    };
  }

  // Multi-select chips
  if (Array.isArray(value)) {
    if (value.length === 0) return { display: 'None' };
    if (value.length <= 2) return { display: value.join(', ') };
    return { display: `${value[0]}, +${value.length - 1}` };
  }

  // Default string display
  return { display: String(value) };
}

/**
 * Gets appropriate gradient colors based on value (for sliders)
 */
function getValueColor(value: string | number, widgetType: string): string {
  if (widgetType !== 'slider' && widgetType !== 'gradient_slider') {
    return 'var(--accent-mint, #6EE7B7)';
  }

  const numValue =
    typeof value === 'number' ? value : parseInt(value, 10) || 50;

  if (numValue <= 30) return 'var(--accent-rose, #FDA4AF)';
  if (numValue <= 60) return 'var(--accent-yellow, #FCD34D)';
  return 'var(--accent-mint, #6EE7B7)';
}

export function BaselineCard({ baseline }: BaselineCardProps) {
  const { display, suffix } = formatValue(baseline.value, baseline.widgetType);
  const valueColor = getValueColor(baseline.value, baseline.widgetType);

  return (
    <div className="baseline-card">
      {/* Condition badge */}
      <span className="baseline-condition-badge">{baseline.condition}</span>

      {/* Label */}
      <p className="baseline-label">{baseline.label}</p>

      {/* Value display */}
      <div className="baseline-value-container">
        <span className="baseline-value" style={{ color: valueColor }}>
          {display}
        </span>
        {suffix && <span className="baseline-suffix">{suffix}</span>}
      </div>

      {/* Captured indicator */}
      <div className="baseline-captured">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: 'var(--accent-mint, #6EE7B7)' }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>{getMicrocopy('baseline.captured.day1.v1')}</span>
      </div>

      <style jsx>{`
        .baseline-card {
          background: white;
          border-radius: 0.875rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          padding: 0.875rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          box-shadow:
            0 2px 4px -1px rgba(0, 0, 0, 0.04),
            0 1px 2px -1px rgba(0, 0, 0, 0.04);
        }

        .baseline-condition-badge {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-muted, #666666);
          background: rgba(32, 19, 46, 0.06);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .baseline-label {
          font-size: 0.8125rem;
          color: var(--text-muted, #666666);
          margin: 0;
          text-align: center;
        }

        .baseline-value-container {
          display: flex;
          align-items: baseline;
          gap: 0.125rem;
        }

        .baseline-value {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1;
        }

        .baseline-suffix {
          font-size: 1.125rem;
          color: var(--text-muted, #666666);
          font-weight: 500;
        }

        .baseline-captured {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default BaselineCard;
