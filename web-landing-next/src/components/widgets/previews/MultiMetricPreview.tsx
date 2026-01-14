'use client';

/**
 * MultiMetricPreview - Multi-symptom dashboard preview for multiple conditions
 *
 * Why this exists: Users managing multiple symptoms/conditions need to see
 * how we track everything in one place. Shows a dashboard-style preview
 * with multiple health metrics.
 *
 * Visual Identity: Multi-color gradient cards on dark glass with holographic effect
 */

import { useEffect, useState } from 'react';

import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import type { PreviewComponentProps } from './FlareRiskPreview';

export function MultiMetricPreview(_props: PreviewComponentProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const copy = getScreen4LayoutConfig<{
    metrics?: {
      label: string;
      unit: string;
      color: string;
      bgColor: string;
      value?: string;
    }[];
    status_label?: string;
    callout_title?: string;
    callout_body?: string;
  }>('multiple');

  const cards = copy.metrics?.map((m) => ({
    ...m,
    value: m.value ?? '--',
  })) ?? [
    {
      label: 'Energy',
      value: '--',
      unit: '%',
      color: '#6EE7B7',
      bgColor: 'rgba(110, 231, 183, 0.15)',
    },
    {
      label: 'Pain',
      value: '--',
      unit: '/10',
      color: '#F472B6',
      bgColor: 'rgba(244, 114, 182, 0.15)',
    },
    {
      label: 'Sleep',
      value: '--',
      unit: 'h',
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
    },
    {
      label: 'Mood',
      value: '--',
      unit: '',
      color: '#A78BFA',
      bgColor: 'rgba(167, 139, 250, 0.15)',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Holographic effect */}
      <div className="holo-effect" />

      {/* Metric cards grid */}
      <div className="metrics-grid">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`metric-card ${animated ? 'animated' : ''}`}
            style={{
              animationDelay: `${i * 80}ms`,
              '--card-color': card.color,
              '--card-bg': card.bgColor,
            } as React.CSSProperties}
          >
            <span className="metric-label">{card.label}</span>
            <div className="metric-value-container">
              <span className="metric-value" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="metric-unit">{card.unit}</span>
            </div>
            <div className="metric-status">
              <span className="status-dot" style={{
                background: card.color,
                boxShadow: `0 0 8px ${card.color}`
              }} />
              <span>
                {copy.status_label ?? getMicrocopy('layout.common.tracking.v1')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Unified view callout */}
      <div className="unified-callout">
        <div className="callout-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div className="callout-content">
          <span className="callout-title">
            {copy.callout_title ?? 'One place for everything'}
          </span>
          <p>
            {copy.callout_body ??
              'Track all your symptoms and see how they connect'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(20, 20, 30, 0.95) 0%,
            rgba(30, 30, 45, 0.9) 50%,
            rgba(20, 20, 30, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(167, 139, 250, 0.15);
          box-shadow:
            0 0 40px rgba(167, 139, 250, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow: hidden;
        }

        .holo-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            linear-gradient(
              125deg,
              transparent 0%,
              rgba(110, 231, 183, 0.05) 25%,
              transparent 50%,
              rgba(167, 139, 250, 0.05) 75%,
              transparent 100%
            );
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.5; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.375rem;
          position: relative;
          z-index: 1;
        }

        .metric-card {
          padding: 0.625rem;
          border-radius: 0.75rem;
          background: linear-gradient(
            145deg,
            var(--card-bg) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          border: 1px solid color-mix(in srgb, var(--card-color) 30%, transparent);
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          opacity: 0;
          transform: scale(0.9);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .metric-card.animated {
          opacity: 1;
          transform: scale(1);
        }

        .metric-label {
          font-size: 0.5625rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value-container {
          display: flex;
          align-items: baseline;
          gap: 0.125rem;
        }

        .metric-value {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.375rem;
          font-weight: 600;
          line-height: 1;
          text-shadow: 0 0 20px currentColor;
        }

        .metric-unit {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .metric-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.5rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .unified-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.1) 0%,
            rgba(110, 231, 183, 0.05) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(167, 139, 250, 0.15);
          position: relative;
          z-index: 1;
        }

        .callout-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(110, 231, 183, 0.1) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A78BFA;
        }

        .callout-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .callout-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }

        .callout-content p {
          margin: 0;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default MultiMetricPreview;
