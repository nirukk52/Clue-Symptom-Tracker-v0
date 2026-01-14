'use client';

/**
 * FatigueLayout - Energy-focused value prop layout
 *
 * Why this exists: Users managing fatigue (ME/CFS, Long COVID, Fibro) need
 * to see energy patterns - when they crash, when they have capacity.
 * This layout emphasizes energy timeline and crash prevention.
 *
 * Visual focus: Energy wave graph showing daily rhythm
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import { VictorySection } from '../shared/VictorySection';

interface FatigueLayoutProps {
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
 * Energy wave visualization - shows daily energy patterns
 */
function EnergyWaveGraph({ data }: { data: FlareRiskData }) {
  const [animated, setAnimated] = useState(false);
  const copy = getScreen4LayoutConfig<{
    axis_high?: string;
    axis_low?: string;
  }>('fatigue');

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Convert risk levels to energy percentages
  const energyPoints = data.days.map((d) => {
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

      <style jsx>{`
        .energy-wave-container {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
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
          padding: 0.5rem 1rem 0;
        }

        .day-label {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
        }
      `}</style>
    </div>
  );
}

export function FatigueLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: FatigueLayoutProps) {
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
    <div className={`fatigue-layout ${isVisible ? 'visible' : ''}`}>
      {/* Victory Section */}
      <VictorySection
        stepsCompleted={victory.stepsCompleted}
        totalSteps={victory.totalSteps}
        baselineData={victory.baselineData}
        promise={promiseData}
        victoryMessage={victory.victoryMessage}
      />

      {/* Energy Preview Card */}
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{preview.badge}</span>
        </div>

        <EnergyWaveGraph data={preview.graphData} />

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
            {(() => {
              const c = getScreen4LayoutConfig<{ preview_insight_id?: string }>(
                'fatigue'
              );
              return getMicrocopy(
                c.preview_insight_id ?? 'layout.fatigue.preview_insight.v1'
              );
            })()}
          </p>
        </div>
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
        .fatigue-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .fatigue-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card {
          background: rgba(110, 231, 183, 0.08);
          border-radius: 1.25rem;
          border: 1px solid rgba(110, 231, 183, 0.2);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          color: #047857;
          background: rgba(110, 231, 183, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .preview-insight {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.75rem;
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
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

        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
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

export default FatigueLayout;
