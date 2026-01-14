'use client';

/**
 * MultiMetricPreview - Multi-symptom dashboard preview for multiple conditions
 *
 * Why this exists: Users managing multiple symptoms/conditions need to see
 * how we track everything in one place. Shows a dashboard-style preview
 * with multiple health metrics.
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
      bgColor: 'rgba(110, 231, 183, 0.1)',
    },
    {
      label: 'Pain',
      value: '--',
      unit: '/10',
      color: '#FDA4AF',
      bgColor: 'rgba(253, 164, 175, 0.1)',
    },
    {
      label: 'Sleep',
      value: '--',
      unit: 'h',
      color: '#A4C8D8',
      bgColor: 'rgba(164, 200, 216, 0.1)',
    },
    {
      label: 'Mood',
      value: '--',
      unit: '',
      color: '#D0BDF4',
      bgColor: 'rgba(208, 189, 244, 0.1)',
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Metric cards grid */}
      <div className="metrics-grid">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`metric-card ${animated ? 'animated' : ''}`}
            style={{
              animationDelay: `${i * 80}ms`,
              background: card.bgColor,
              borderColor: `${card.color}33`,
            }}
          >
            <span className="metric-label">{card.label}</span>
            <div className="metric-value-container">
              <span className="metric-value" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="metric-unit">{card.unit}</span>
            </div>
            <div className="metric-status">
              <span className="status-dot" style={{ background: card.color }} />
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
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .metric-card {
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          opacity: 0;
          transform: scale(0.95);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }

        .metric-card.animated {
          opacity: 1;
          transform: scale(1);
        }

        .metric-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted, #666666);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .metric-value-container {
          display: flex;
          align-items: baseline;
          gap: 0.125rem;
        }

        .metric-value {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1;
        }

        .metric-unit {
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
        }

        .metric-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.5625rem;
          color: var(--text-muted, #666666);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .unified-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(32, 19, 46, 0.04);
          border-radius: 0.75rem;
        }

        .callout-icon {
          flex-shrink: 0;
          color: var(--primary, #20132e);
        }

        .callout-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .callout-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary, #20132e);
        }

        .callout-content p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default MultiMetricPreview;
