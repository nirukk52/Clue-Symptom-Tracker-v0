'use client';

/**
 * FlareRiskPreview - 7-day flare risk forecast visualization
 *
 * Why this exists: Users dealing with unpredictable flares need to see
 * the 7-day forecast visualization prominently. This preview shows
 * risk levels across the week with pattern detection callouts.
 *
 * Visual Identity: Warm amber/orange gradient bars on dark glass with fire glow
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

  const riskStyles = {
    low: {
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      glow: 'rgba(52, 211, 153, 0.4)',
      indicator: null,
    },
    elevated: {
      gradient: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
      glow: 'rgba(251, 191, 36, 0.5)',
      indicator: '●',
    },
    high: {
      gradient: 'linear-gradient(180deg, #F87171 0%, #DC2626 100%)',
      glow: 'rgba(248, 113, 113, 0.6)',
      indicator: '!',
    },
  };

  const copy = getScreen4LayoutConfig<{
    legend_label?: string;
    pattern_callout?: string;
  }>('flares');

  return (
    <div className="forecast-container">
      {/* Ambient glow */}
      <div className="ambient-glow" />

      {/* Risk legend */}
      <div className="risk-legend">
        <span className="legend-label">
          {copy.legend_label ?? '7-Day Risk Forecast'}
        </span>
        <div className="legend-items">
          {(['low', 'elevated', 'high'] as const).map((level) => (
            <div key={level} className={`legend-item ${level}`}>
              <span className="legend-dot" />
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
          const styles = riskStyles[day.risk];
          return (
            <div
              key={i}
              className={`forecast-day ${animated ? 'animated' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="bar-wrapper">
                <div
                  className={`forecast-bar ${day.risk}`}
                  style={{
                    height: `${day.value}%`,
                    background: styles.gradient,
                    boxShadow: `0 0 20px ${styles.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  }}
                >
                  {styles.indicator && (
                    <span className="bar-indicator">{styles.indicator}</span>
                  )}
                </div>
              </div>
              <span className="day-label">{day.date}</span>
            </div>
          );
        })}
      </div>

      {/* Pattern detection callout */}
      <div className="pattern-callout">
        <div className="callout-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p>
          {copy.pattern_callout ??
            "Elevated risk detected mid-week. We'll find out why."}
        </p>
      </div>

      <style jsx>{`
        .forecast-container {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(30, 20, 15, 0.95) 0%,
            rgba(45, 30, 20, 0.9) 50%,
            rgba(30, 20, 15, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
          box-shadow:
            0 0 40px rgba(251, 191, 36, 0.08),
            inset 0 1px 0 rgba(251, 191, 36, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          overflow: hidden;
        }

        .ambient-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            ellipse at 50% 100%,
            rgba(251, 191, 36, 0.1) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .risk-legend {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .legend-label {
          font-size: 0.6875rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .legend-items {
          display: flex;
          gap: 0.625rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item.low .legend-dot {
          background: linear-gradient(135deg, #34D399, #059669);
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
        }

        .legend-item.elevated .legend-dot {
          background: linear-gradient(135deg, #FBBF24, #D97706);
          box-shadow: 0 0 6px rgba(251, 191, 36, 0.5);
        }

        .legend-item.high .legend-dot {
          background: linear-gradient(135deg, #F87171, #DC2626);
          box-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
        }

        .legend-text {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .forecast-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 0.375rem;
          position: relative;
          z-index: 1;
          padding: 0 0.125rem;
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

        .bar-wrapper {
          height: 80px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .forecast-bar {
          width: 85%;
          border-radius: 0.375rem 0.375rem 0.125rem 0.125rem;
          position: relative;
          min-height: 16px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 3px;
          transition: height 0.6s ease;
        }

        .bar-indicator {
          font-size: 0.625rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .day-label {
          font-size: 0.5625rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pattern-callout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(251, 191, 36, 0.12) 0%,
            rgba(217, 119, 6, 0.06) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
          position: relative;
          z-index: 1;
        }

        .callout-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(251, 191, 36, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FBBF24;
        }

        .pattern-callout p {
          margin: 0;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.35;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default FlareRiskPreview;
