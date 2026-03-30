'use client';

/**
 * EnergyWavePreview - Energy wave visualization for fatigue domain
 *
 * Why this exists: Users managing fatigue (ME/CFS, Long COVID, Fibro) need
 * to see energy patterns - when they crash, when they have capacity.
 * This preview shows daily energy rhythm as a smooth wave graph.
 *
 * Visual Identity: Mint/teal energy waves on dark glass with aurora glow effect
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
  const height = 70;

  // Create smooth curve path
  const points = energyPoints.map((p, i) => ({
    x: i * (260 / (energyPoints.length - 1)) + 30,
    y: height - (p.energy / maxEnergy) * (height - 15),
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
      {/* Aurora background effect */}
      <div className="aurora-bg" />

      <svg viewBox="0 0 320 85" className="energy-wave-svg">
        {/* Grid lines */}
        <line x1="30" y1="15" x2="290" y2="15" className="grid-line" />
        <line x1="30" y1="42" x2="290" y2="42" className="grid-line" />
        <line x1="30" y1="70" x2="290" y2="70" className="grid-line" />

        {/* Y-axis labels */}
        <text x="8" y="19" className="axis-label">
          {copy.axis_high ?? 'High'}
        </text>
        <text x="8" y="74" className="axis-label">
          {copy.axis_low ?? 'Low'}
        </text>

        {/* Energy wave gradient fill */}
        <defs>
          <linearGradient id="energyGradientDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glowEnergy">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Fill area under curve */}
        <path
          d={`${pathD} L ${points[points.length - 1]?.x ?? 290} 70 L 30 70 Z`}
          fill="url(#energyGradientDark)"
          className={`wave-fill ${animated ? 'animated' : ''}`}
        />

        {/* Energy wave line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6EE7B7"
          strokeWidth="3"
          strokeLinecap="round"
          className={`wave-line ${animated ? 'animated' : ''}`}
          filter="url(#glowEnergy)"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#6EE7B7"
              fillOpacity="0.3"
              className={`point-glow ${animated ? 'animated' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#0D1117"
              stroke="#6EE7B7"
              strokeWidth="2"
              className={`point ${animated ? 'animated' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          </g>
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
        <div className="insight-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <p>
          {getMicrocopy(
            copy.preview_insight_id ?? 'layout.fatigue.preview_insight.v1'
          )}
        </p>
      </div>

      <style jsx>{`
        .energy-wave-container {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(13, 17, 23, 0.95) 0%,
            rgba(22, 27, 34, 0.9) 50%,
            rgba(13, 17, 23, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(110, 231, 183, 0.2);
          box-shadow:
            0 0 40px rgba(110, 231, 183, 0.1),
            inset 0 1px 0 rgba(110, 231, 183, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          overflow: hidden;
        }

        .aurora-bg {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: radial-gradient(
            ellipse at 30% 20%,
            rgba(110, 231, 183, 0.15) 0%,
            transparent 50%
          ),
          radial-gradient(
            ellipse at 70% 80%,
            rgba(52, 211, 153, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
          animation: aurora 8s ease-in-out infinite;
        }

        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(5%, 5%) rotate(3deg); }
        }

        .energy-wave-svg {
          position: relative;
          width: 100%;
          height: auto;
          z-index: 1;
        }

        .grid-line {
          stroke: rgba(110, 231, 183, 0.1);
          stroke-dasharray: 4 4;
        }

        .axis-label {
          font-size: 7px;
          fill: rgba(110, 231, 183, 0.6);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .wave-fill {
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .wave-fill.animated {
          opacity: 1;
        }

        .wave-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          transition: stroke-dashoffset 1.2s ease;
        }

        .wave-line.animated {
          stroke-dashoffset: 0;
        }

        .point, .point-glow {
          opacity: 0;
          transform: scale(0);
          transform-origin: center;
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .point.animated, .point-glow.animated {
          opacity: 1;
          transform: scale(1);
        }

        .day-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: relative;
          z-index: 1;
        }

        .day-label {
          font-size: 0.625rem;
          color: rgba(110, 231, 183, 0.7);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .preview-insight {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(110, 231, 183, 0.12) 0%,
            rgba(52, 211, 153, 0.06) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(110, 231, 183, 0.2);
          position: relative;
          z-index: 1;
        }

        .insight-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(110, 231, 183, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6EE7B7;
        }

        .preview-insight p {
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

export default EnergyWavePreview;
