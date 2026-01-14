'use client';

/**
 * MigrainesLayout - Trigger correlation-focused value prop layout
 *
 * Why this exists: Migraine sufferers need to understand their triggers -
 * weather, food, sleep, hormones. This layout shows correlations between
 * tracked factors and migraine occurrences.
 *
 * Visual focus: Trigger correlation cards with confidence indicators
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import { VictorySection } from '../shared/VictorySection';

interface MigrainesLayoutProps {
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
 * Trigger correlation preview showing what we'll track
 */
function TriggerPreview() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const copy = getScreen4LayoutConfig<{
    triggers?: { name: string; icon: string }[];
    status_label?: string;
    callout_title?: string;
    callout_body?: string;
  }>('migraines');

  const triggers = copy.triggers ?? [
    { name: 'Weather', icon: '🌧️' },
    { name: 'Sleep', icon: '🌙' },
    { name: 'Food', icon: '🍷' },
    { name: 'Cycle', icon: '🔄' },
  ];

  return (
    <div className="trigger-preview">
      <div className="trigger-grid">
        {triggers.map((trigger, i) => (
          <div
            key={trigger.name}
            className={`trigger-card ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="trigger-icon">{trigger.icon}</span>
            <span className="trigger-name">{trigger.name}</span>
            <span className="trigger-status">
              <span className="status-dot" />
              {copy.status_label ?? getMicrocopy('layout.common.tracking.v1')}
            </span>
          </div>
        ))}
      </div>

      {/* Correlation discovery callout */}
      <div className="correlation-callout">
        <div className="callout-header">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span className="callout-title">
            {copy.callout_title ?? 'Pattern Discovery'}
          </span>
        </div>
        <p>{copy.callout_body ?? "We'll find correlations you might miss."}</p>
      </div>

      <style jsx>{`
        .trigger-preview {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .trigger-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .trigger-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          background: rgba(164, 200, 216, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(164, 200, 216, 0.2);
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }

        .trigger-card.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .trigger-icon {
          font-size: 1.25rem;
        }

        .trigger-name {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--primary, #20132e);
        }

        .trigger-status {
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
          background: var(--accent-mint, #6ee7b7);
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

        .correlation-callout {
          padding: 0.75rem;
          background: rgba(164, 200, 216, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(164, 200, 216, 0.2);
        }

        .callout-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.375rem;
          color: var(--primary, #20132e);
        }

        .callout-title {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .correlation-callout p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export function MigrainesLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: MigrainesLayoutProps) {
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
    <div className={`migraines-layout ${isVisible ? 'visible' : ''}`}>
      {/* Victory Section */}
      <VictorySection
        stepsCompleted={victory.stepsCompleted}
        totalSteps={victory.totalSteps}
        baselineData={victory.baselineData}
        promise={promiseData}
        victoryMessage={victory.victoryMessage}
      />

      {/* Trigger Preview Card */}
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{preview.badge}</span>
        </div>

        <TriggerPreview />
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
        .migraines-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .migraines-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card {
          background: rgba(164, 200, 216, 0.08);
          border-radius: 1.25rem;
          border: 1px solid rgba(164, 200, 216, 0.2);
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
          color: #0891b2;
          background: rgba(164, 200, 216, 0.3);
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

export default MigrainesLayout;
