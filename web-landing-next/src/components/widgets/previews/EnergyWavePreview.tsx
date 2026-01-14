'use client';

/**
 * EnergyWavePreview - Energy wave visualization for fatigue domain
 *
 * Why this exists: Users managing fatigue (ME/CFS, Long COVID, Fibro) need
 * to see energy patterns - when they crash, when they have capacity.
 * This preview shows daily energy rhythm as a smooth wave graph.
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PatternData,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import type { PreviewComponentProps } from './FlareRiskPreview';

export function EnergyWavePreview({ data }: PreviewComponentProps) {
  // Type guard to ensure we have FlareRiskData with days array
  const flareData =
    data && 'days' in data
      ? data
      : {
          days: [
            { date: 'Mon', risk: 'low' as const, value: 75 },
            { date: 'Tue', risk: 'elevated' as const, value: 55 },
            { date: 'Wed', risk: 'high' as const, value: 25 },
            { date: 'Thu', risk: 'elevated' as const, value: 45 },
            { date: 'Fri', risk: 'low' as const, value: 70 },
            { date: 'Sat', risk: 'low' as const, value: 80 },
            { date: 'Sun', risk: 'low' as const, value: 65 },
          ],
        };
  const [animated, setAnimated] = useState(false);
  const copy = getScreen4LayoutConfig<{
    axis_high?: string;
    axis_low?: string;
    preview_insight_id?: string;
  }>('fatigue');

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Convert risk levels to energy percentages
  const energyPoints = flareData.days.map((d) => {
    const baseEnergy = d.risk === 'high' ? 20 : d.risk === 'elevated' ? 45 : 75;
    return { ...d, energy: baseEnergy + (d.value / 100) * 20 };
  });

  const maxEnergy = 100;
  const height = 80;

  // Create smooth curve path
  const points = energyPoints.map((p, i) => ({
    x: i * (280 / (energyPoints.length - 1)) + 20,
    y: height - (p.energy / maxEnergy) * (height - 10),
  }));

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1]!;
    const cpX1 = prev.x + (point.x - prev.x) / 3;
    const cpX2 = prev.x + (2 * (point.x - prev.x)) / 3;
    return `${acc} C ${cpX1} ${prev.y} ${cpX2} ${point.y} ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="energy-wave-container">
      <svg viewBox="0 0 320 100" className="energy-wave-svg">
        {/* Grid lines */}
        <line x1="20" y1="20" x2="300" y2="20" className="grid-line" />
        <line x1="20" y1="50" x2="300" y2="50" className="grid-line" />
        <line x1="20" y1="80" x2="300" y2="80" className="grid-line" />

        {/* Y-axis labels */}
        <text x="10" y="24" className="axis-label">
          {copy.axis_high ?? 'High'}
        </text>
        <text x="10" y="84" className="axis-label">
          {copy.axis_low ?? 'Low'}
        </text>

        {/* Energy wave gradient fill */}
        <defs>
          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--accent-mint, #6EE7B7)"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="var(--accent-mint, #6EE7B7)"
              stopOpacity="0.05"
            />
          </linearGradient>
        </defs>

        {/* Fill area under curve */}
        <path
          d={`${pathD} L ${points[points.length - 1]?.x ?? 300} 80 L 20 80 Z`}
          fill="url(#energyGradient)"
          className={`wave-fill ${animated ? 'animated' : ''}`}
        />

        {/* Energy wave line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-mint, #6EE7B7)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`wave-line ${animated ? 'animated' : ''}`}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="white"
            stroke="var(--accent-mint, #6EE7B7)"
            strokeWidth="2"
            className={`point ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </svg>

      {/* Day labels */}
      <div className="day-labels">
        {energyPoints.map((d, i) => (
          <span key={i} className="day-label">
            {d.date}
          </span>
        ))}
      </div>

      {/* Insight callout */}
      <div className="preview-insight">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p>
          {getMicrocopy(
            copy.preview_insight_id ?? 'layout.fatigue.preview_insight.v1'
          )}
        </p>
      </div>

      <style jsx>{`
        .energy-wave-container {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .energy-wave-svg {
          width: 100%;
          height: auto;
        }

        .grid-line {
          stroke: rgba(32, 19, 46, 0.08);
          stroke-dasharray: 2 2;
        }

        .axis-label {
          font-size: 8px;
          fill: var(--text-muted, #666666);
        }

        .wave-fill {
          opacity: 0;
          transition: opacity 0.6s ease;
        }

        .wave-fill.animated {
          opacity: 1;
        }

        .wave-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          transition: stroke-dashoffset 1s ease;
        }

        .wave-line.animated {
          stroke-dashoffset: 0;
        }

        .point {
          opacity: 0;
          transform: scale(0);
          transform-origin: center;
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }

        .point.animated {
          opacity: 1;
          transform: scale(1);
        }

        .day-labels {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 1rem 0;
        }

        .day-label {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
        }

        .preview-insight {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(110, 231, 183, 0.1);
          border-radius: 0.75rem;
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
          margin-top: 0.25rem;
        }

        .preview-insight svg {
          flex-shrink: 0;
          color: var(--accent-mint, #6ee7b7);
          margin-top: 1px;
        }

        .preview-insight p {
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default EnergyWavePreview;
