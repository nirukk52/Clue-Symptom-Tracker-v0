'use client';

/**
 * FlareRiskGraph Component
 *
 * Why this exists: Visual representation of 7-day flare risk prediction.
 * Shows fake preview data during onboarding to demonstrate the value
 * of the prediction feature before user has logged any data.
 */

import type { FlareRiskData } from '../../agents/onboarding/types';

interface FlareRiskGraphProps {
  data: FlareRiskData;
}

/**
 * Gets color classes for risk level
 */
function getRiskColor(risk: 'low' | 'elevated' | 'high'): {
  bar: string;
  dot: string;
  label: string;
} {
  const colors = {
    low: {
      bar: 'bg-accent-mint',
      dot: 'bg-accent-mint',
      label: 'text-teal-700',
    },
    elevated: {
      bar: 'bg-accent-yellow',
      dot: 'bg-accent-yellow',
      label: 'text-amber-700',
    },
    high: {
      bar: 'bg-accent-rose',
      dot: 'bg-accent-rose',
      label: 'text-red-700',
    },
  };
  return colors[risk];
}

export function FlareRiskGraph({ data }: FlareRiskGraphProps) {
  const maxValue = Math.max(...data.days.map((d) => d.value));

  return (
    <div className="flare-risk-graph">
      {/* Legend */}
      <div className="flare-risk-legend">
        <div className="flare-risk-legend-item">
          <span className="flare-risk-legend-dot bg-accent-mint" />
          <span>Low</span>
        </div>
        <div className="flare-risk-legend-item">
          <span className="flare-risk-legend-dot bg-accent-yellow" />
          <span>Elevated</span>
        </div>
        <div className="flare-risk-legend-item">
          <span className="flare-risk-legend-dot bg-accent-rose" />
          <span>High</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flare-risk-chart">
        {data.days.map((day, index) => {
          const colors = getRiskColor(day.risk);
          const height = (day.value / maxValue) * 100;

          return (
            <div key={index} className="flare-risk-bar-container">
              {/* Bar */}
              <div className="flare-risk-bar-wrapper">
                <div
                  className={`flare-risk-bar ${colors.bar}`}
                  style={{ height: `${height}%` }}
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
                <span className={`flare-risk-label ${colors.label}`}>
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
  );
}

export default FlareRiskGraph;
