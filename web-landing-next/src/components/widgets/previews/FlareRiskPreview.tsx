'use client';

/**
 * FlareRiskPreview - 7-day flare risk forecast visualization
 *
 * Why this exists: Users dealing with unpredictable flares need to see
 * the 7-day forecast visualization prominently. This preview shows
 * risk levels across the week with pattern detection callouts.
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PatternData,
} from '@/backend/agents/onboarding/types';
import { getScreen4LayoutConfig } from '@/lib/onboarding/content';

export interface PreviewComponentProps {
  data?: FlareRiskData | PatternData;
}

export function FlareRiskPreview({ data }: PreviewComponentProps) {
  // Type guard to ensure we have FlareRiskData with days array
  const flareData =
    data && 'days' in data
      ? data
      : {
          days: [
            { date: 'Mon', risk: 'low' as const, value: 30 },
            { date: 'Tue', risk: 'low' as const, value: 35 },
            { date: 'Wed', risk: 'elevated' as const, value: 65 },
            { date: 'Thu', risk: 'high' as const, value: 85 },
            { date: 'Fri', risk: 'elevated' as const, value: 55 },
            { date: 'Sat', risk: 'low' as const, value: 40 },
            { date: 'Sun', risk: 'low' as const, value: 25 },
          ],
        };
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const riskColors = {
    low: {
      bg: 'rgba(110, 231, 183, 0.2)',
      border: 'rgba(110, 231, 183, 0.4)',
      text: '#047857',
    },
    elevated: {
      bg: 'rgba(252, 211, 77, 0.2)',
      border: 'rgba(252, 211, 77, 0.4)',
      text: '#B45309',
    },
    high: {
      bg: 'rgba(253, 164, 175, 0.2)',
      border: 'rgba(253, 164, 175, 0.4)',
      text: '#BE123C',
    },
  };

  const copy = getScreen4LayoutConfig<{
    legend_label?: string;
    pattern_callout?: string;
  }>('flares');

  return (
    <div className="forecast-container">
      {/* Risk legend */}
      <div className="risk-legend">
        <span className="legend-label">
          {copy.legend_label ?? 'Risk Level:'}
        </span>
        <div className="legend-items">
          {(['low', 'elevated', 'high'] as const).map((level) => (
            <div key={level} className="legend-item">
              <span
                className="legend-dot"
                style={{
                  background: riskColors[level].bg,
                  borderColor: riskColors[level].border,
                }}
              />
              <span className="legend-text">
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day forecast bars */}
      <div className="forecast-bars">
        {flareData.days.map((day, i) => {
          const colors = riskColors[day.risk];
          return (
            <div
              key={i}
              className={`forecast-day ${animated ? 'animated' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="forecast-bar"
                style={{
                  height: `${day.value}%`,
                  background: colors.bg,
                  borderColor: colors.border,
                }}
              >
                {day.risk !== 'low' && (
                  <span
                    className="bar-indicator"
                    style={{ color: colors.text }}
                  >
                    {day.risk === 'high' ? '!' : '●'}
                  </span>
                )}
              </div>
              <span className="day-label">{day.date}</span>
            </div>
          );
        })}
      </div>

      {/* Pattern detection callout */}
      <div className="pattern-callout">
        <div className="callout-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <p>
          {copy.pattern_callout ??
            "Elevated risk detected mid-week. With your data, we'll find out why."}
        </p>
      </div>

      <style jsx>{`
        .forecast-container {
          background: white;
          border-radius: 0.875rem;
          padding: 0.875rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .risk-legend {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .legend-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted, #666666);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .legend-items {
          display: flex;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid;
        }

        .legend-text {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
        }

        .forecast-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 100px;
          gap: 0.375rem;
          padding: 0 0.25rem;
        }

        .forecast-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .forecast-day.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .forecast-bar {
          width: 100%;
          border-radius: 0.5rem 0.5rem 0.25rem 0.25rem;
          border: 1px solid;
          position: relative;
          min-height: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          transition: height 0.6s ease;
        }

        .bar-indicator {
          font-size: 0.75rem;
        }

        .day-label {
          font-size: 0.625rem;
          color: var(--text-muted, #666666);
          font-weight: 500;
        }

        .pattern-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(252, 211, 77, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(252, 211, 77, 0.2);
        }

        .callout-icon {
          flex-shrink: 0;
          color: #b45309;
        }

        .pattern-callout p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default FlareRiskPreview;
