'use client';

/**
 * FlaresLayout - Prediction-focused value prop layout
 *
 * Why this exists: Users dealing with unpredictable flares need to see
 * the 7-day forecast visualization prominently. This is the PRIMARY
 * value prop - knowing when a flare is coming.
 *
 * Visual focus: 7-day risk forecast with prominent risk indicators
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import { VictorySection } from '../shared/VictorySection';

interface FlaresLayoutProps {
  victory: VictoryProps;
  preview: {
    headline: string;
    watchItems: [string, string, string];
    graphData: FlareRiskData;
    badge: string;
  };
  cta: {
    text: string;
    action: 'google_signin';
  };
  onCTAClick: () => void;
  isLoading?: boolean;
}

/**
 * 7-day flare risk forecast visualization
 */
function FlareRiskForecast({ data }: { data: FlareRiskData }) {
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
        {data.days.map((day, i) => {
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
                    {day.risk === 'high' ? '⚠' : '●'}
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

export function FlaresLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: FlaresLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Build promise data from preview
  const promiseData: PromiseData = {
    headline: preview.headline,
    q4Value: victory.promise.q4Value,
    watchItems: preview.watchItems,
  };

  return (
    <div className={`flares-layout ${isVisible ? 'visible' : ''}`}>
      {/* Victory Section */}
      <VictorySection
        stepsCompleted={victory.stepsCompleted}
        totalSteps={victory.totalSteps}
        baselineData={victory.baselineData}
        promise={promiseData}
        victoryMessage={victory.victoryMessage}
      />

      {/* 7-Day Forecast Card */}
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{preview.badge}</span>
        </div>

        <FlareRiskForecast data={preview.graphData} />
      </div>

      {/* CTA */}
      <div className="cta-section">
        <button
          className="cta-button"
          onClick={onCTAClick}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              {getMicrocopy('cta.connecting.v1')}
            </>
          ) : (
            <>
              {cta.text}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p className="privacy-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          {getMicrocopy('privacy_note.v1')}
        </p>
      </div>

      <style jsx>{`
        .flares-layout {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .flares-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card {
          background: rgba(208, 189, 244, 0.08);
          border-radius: 1rem;
          border: 1px solid rgba(208, 189, 244, 0.2);
          padding: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-badge {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #7c3aed;
          background: rgba(208, 189, 244, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          margin-top: 0.25rem;
        }

        .cta-button {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 9999px;
          background: var(--primary, #20132e);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px -2px rgba(32, 20, 46, 0.2);
        }

        .cta-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(32, 20, 46, 0.25);
        }

        .cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .privacy-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default FlaresLayout;
