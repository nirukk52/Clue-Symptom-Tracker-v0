'use client';

import { useEffect, useState } from 'react';

import { getCategoryHeadline, getWatchList } from '@/content/watch-list';

/**
 * WatchListPreview - Shows personalized 7-day prediction preview after Q3
 *
 * Why this exists: Turns onboarding into a result, not just setup.
 * Users see a visual 7-day flare risk graph and what we'll watch for them,
 * creating immediate value and anticipation for "first insight in ~3 days".
 *
 * Design principles:
 * - NO EMOJIS (uses minimal iconography)
 * - 7-day flare risk visualization with Low/Elevated/High
 * - Warm cream + accent purple palette
 * - Progressive reveal animation
 * - Trust-building through transparency
 */

interface WatchListPreviewProps {
  q1Domain: string;
  q2PainPoint: string;
  q3Data: {
    condition?: string;
    widgetType?: string;
    widgetValue?: number | string | string[];
  };
  onContinue?: () => void;
}

/**
 * Fake 7-day flare risk data for preview
 * Shows realistic pattern with mid-week elevated risk
 */
const PREVIEW_DAYS = [
  { date: 'Mon', risk: 'low' as const, value: 25 },
  { date: 'Tue', risk: 'low' as const, value: 35 },
  { date: 'Wed', risk: 'elevated' as const, value: 70 },
  { date: 'Thu', risk: 'elevated' as const, value: 65 },
  { date: 'Fri', risk: 'low' as const, value: 40 },
  { date: 'Sat', risk: 'low' as const, value: 30 },
  { date: 'Sun', risk: 'low' as const, value: 20 },
];

/**
 * Gets color classes for risk level
 */
function getRiskColor(risk: 'low' | 'elevated' | 'high'): {
  bar: string;
  label: string;
} {
  const colors = {
    low: {
      bar: 'var(--accent-mint, #6EE7B7)',
      label: 'color: #047857',
    },
    elevated: {
      bar: 'var(--accent-yellow, #FCD34D)',
      label: 'color: #B45309',
    },
    high: {
      bar: 'var(--accent-rose, #FDA4AF)',
      label: 'color: #BE123C',
    },
  };
  return colors[risk];
}

export function WatchListPreview({
  q1Domain: _q1Domain,
  q2PainPoint,
  q3Data,
  onContinue,
}: WatchListPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  const watchList = getWatchList(q2PainPoint, q3Data);
  const categoryHeadline = getCategoryHeadline(watchList.category);

  // Staggered reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      watchList.items.forEach((_, index) => {
        setTimeout(
          () => {
            setItemsVisible((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          },
          400 + index * 150
        );
      });
    }
  }, [isVisible, watchList.items]);

  const maxValue = Math.max(...PREVIEW_DAYS.map((d) => d.value));

  return (
    <div
      className={`watch-list-container ${isVisible ? 'visible' : ''}`}
      role="region"
      aria-label="Your personalized watch list"
    >
      {/* Headline - personalized, no subtitle */}
      <h2 className="watch-list-headline">{categoryHeadline}</h2>

      {/* Watch Card */}
      <div className="watch-list-card">
        {/* Header */}
        <div className="watch-list-card-header">
          <span className="watch-list-badge">YOUR NEXT 7 DAYS</span>
        </div>

        {/* Flare Risk Graph */}
        <div className="flare-risk-graph">
          {/* Legend */}
          <div className="flare-risk-legend">
            <div className="flare-risk-legend-item">
              <span
                className="flare-risk-legend-dot"
                style={{ background: 'var(--accent-mint, #6EE7B7)' }}
              />
              <span>Low</span>
            </div>
            <div className="flare-risk-legend-item">
              <span
                className="flare-risk-legend-dot"
                style={{ background: 'var(--accent-yellow, #FCD34D)' }}
              />
              <span>Elevated</span>
            </div>
            <div className="flare-risk-legend-item">
              <span
                className="flare-risk-legend-dot"
                style={{ background: 'var(--accent-rose, #FDA4AF)' }}
              />
              <span>High</span>
            </div>
          </div>

          {/* Chart */}
          <div className="flare-risk-chart">
            {PREVIEW_DAYS.map((day, index) => {
              const colors = getRiskColor(day.risk);
              const height = (day.value / maxValue) * 100;

              return (
                <div key={index} className="flare-risk-bar-container">
                  {/* Bar */}
                  <div className="flare-risk-bar-wrapper">
                    <div
                      className="flare-risk-bar"
                      style={{
                        height: `${height}%`,
                        background: colors.bar,
                      }}
                    >
                      {/* Elevated indicator */}
                      {day.risk === 'elevated' && (
                        <div className="flare-risk-indicator">
                          <span className="flare-risk-indicator-pulse" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day label */}
                  <span
                    className={`flare-risk-day ${day.risk === 'elevated' ? 'font-semibold' : ''}`}
                  >
                    {day.date}
                  </span>

                  {/* Risk label for elevated days */}
                  {day.risk === 'elevated' && (
                    <span
                      className="flare-risk-label"
                      style={{ color: '#B45309' }}
                    >
                      Watch
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Insight callout */}
          <div className="flare-risk-insight">
            <div className="flare-risk-insight-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <p className="flare-risk-insight-text">
              Pattern detected: elevated risk mid-week based on typical patterns
            </p>
          </div>
        </div>

        {/* Watch Items */}
        <div className="watch-list-items">
          <p className="watch-list-items-label">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: '6px' }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            WATCHING FOR
          </p>
          <ul className="watch-list-items-list" role="list">
            {watchList.items.map((item, index) => (
              <li
                key={index}
                className={`watch-list-item ${itemsVisible[index] ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="var(--accent-mint, #6EE7B7)"
                  stroke="none"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status */}
        <div className="watch-list-status">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-purple, #d0bdf4)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <span>First insight in ~3 days</span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="watch-list-cta-section">
        {onContinue && (
          <button
            className="watch-list-cta"
            onClick={onContinue}
            type="button"
            aria-label="Continue to save your progress"
          >
            <span>Save my progress</span>
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
          </button>
        )}
        <p className="watch-list-privacy">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginRight: '4px' }}
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          Your data stays private. We never share it.
        </p>
      </div>

      <style jsx>{`
        .watch-list-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .watch-list-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .watch-list-headline {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.375rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          line-height: 1.3;
          margin: 0;
        }

        .watch-list-card {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid rgba(32, 19, 46, 0.06);
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -2px rgba(0, 0, 0, 0.05);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .watch-list-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .watch-list-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--primary, #20132e);
          background: rgba(32, 19, 46, 0.06);
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
        }

        /* Flare Risk Graph */
        .flare-risk-graph {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .flare-risk-legend {
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
        }

        .flare-risk-legend-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .flare-risk-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .flare-risk-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 100px;
          padding: 0 0.25rem;
        }

        .flare-risk-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
        }

        .flare-risk-bar-wrapper {
          height: 80px;
          width: 100%;
          max-width: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .flare-risk-bar {
          width: 100%;
          border-radius: 4px 4px 2px 2px;
          position: relative;
          transition: height 0.5s ease-out;
        }

        .flare-risk-indicator {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
        }

        .flare-risk-indicator-pulse {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-yellow, #fcd34d);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        .flare-risk-day {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
        }

        .flare-risk-label {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .flare-risk-insight {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(208, 189, 244, 0.15);
          border-radius: 0.75rem;
          margin-top: 0.5rem;
        }

        .flare-risk-insight-icon {
          color: var(--accent-purple, #d0bdf4);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .flare-risk-insight-text {
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.4;
        }

        /* Watch Items */
        .watch-list-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(32, 19, 46, 0.06);
        }

        .watch-list-items-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted, #666666);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          margin: 0;
        }

        .watch-list-items-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .watch-list-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--primary, #20132e);
          opacity: 0;
          transform: translateX(-8px);
          transition:
            opacity 0.3s ease-out,
            transform 0.3s ease-out;
        }

        .watch-list-item.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* Status */
        .watch-list-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted, #666666);
          padding-top: 0.5rem;
          border-top: 1px solid rgba(32, 19, 46, 0.06);
        }

        /* CTA Section */
        .watch-list-cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .watch-list-cta {
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

        .watch-list-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(32, 20, 46, 0.25);
        }

        .watch-list-cta:active {
          transform: scale(0.98);
        }

        .watch-list-privacy {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          margin: 0;
        }

        @media (min-width: 640px) {
          .watch-list-headline {
            font-size: 1.5rem;
          }

          .watch-list-card {
            padding: 1.5rem;
          }

          .flare-risk-chart {
            height: 120px;
          }

          .flare-risk-bar-wrapper {
            height: 100px;
            max-width: 32px;
          }
        }
      `}</style>
    </div>
  );
}

export default WatchListPreview;
