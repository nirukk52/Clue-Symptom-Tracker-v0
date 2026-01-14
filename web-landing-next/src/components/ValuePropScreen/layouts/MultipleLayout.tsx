'use client';

/**
 * MultipleLayout - Multi-symptom dashboard preview layout
 *
 * Why this exists: Users managing multiple symptoms/conditions need to see
 * how we track everything in one place. Shows a dashboard-style preview
 * with multiple symptom indicators.
 *
 * Visual focus: Dashboard cards showing multiple health metrics
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import { VictorySection } from '../shared/VictorySection';

interface MultipleLayoutProps {
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
 * Multi-symptom dashboard preview
 */
function DashboardPreview() {
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

export function MultipleLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: MultipleLayoutProps) {
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
    <div className={`multiple-layout ${isVisible ? 'visible' : ''}`}>
      {/* Victory Section */}
      <VictorySection
        stepsCompleted={victory.stepsCompleted}
        totalSteps={victory.totalSteps}
        baselineData={victory.baselineData}
        promise={promiseData}
        victoryMessage={victory.victoryMessage}
      />

      {/* Dashboard Preview Card */}
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{preview.badge}</span>
        </div>

        <DashboardPreview />
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
        .multiple-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .multiple-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card {
          background: rgba(32, 19, 46, 0.04);
          border-radius: 1.25rem;
          border: 1px solid rgba(32, 19, 46, 0.1);
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
          color: var(--primary, #20132e);
          background: rgba(32, 19, 46, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
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

export default MultipleLayout;
