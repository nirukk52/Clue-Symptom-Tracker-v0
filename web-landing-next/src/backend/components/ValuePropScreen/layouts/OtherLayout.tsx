'use client';

/**
 * OtherLayout - Pattern discovery focused layout
 *
 * Why this exists: Users who selected "Other" need reassurance that
 * we can still help them discover patterns in whatever they're tracking.
 * Focuses on general pattern discovery and learning capabilities.
 *
 * Visual focus: Pattern visualization with "learning" state
 */

import { useEffect, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import { VictorySection } from '../shared/VictorySection';

interface OtherLayoutProps {
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
 * Pattern learning visualization
 */
function PatternLearning() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const copy = getScreen4LayoutConfig<{
    areas?: { icon: string; label: string; status: string }[];
    callout_title?: string;
    callout_body?: string;
  }>('other');

  const areas = copy.areas ?? [
    { icon: '📊', label: 'Your patterns', status: 'Learning starts with you' },
    {
      icon: '🔍',
      label: 'Hidden connections',
      status: "We'll find what you miss",
    },
    {
      icon: '💡',
      label: 'Personal insights',
      status: 'Tailored to your experience',
    },
  ];

  return (
    <div className="learning-container">
      {/* Learning areas */}
      <div className="learning-areas">
        {areas.map((area, i) => (
          <div
            key={area.label}
            className={`learning-area ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <span className="area-icon">{area.icon}</span>
            <div className="area-content">
              <span className="area-label">{area.label}</span>
              <span className="area-status">{area.status}</span>
            </div>
            <div className="learning-indicator">
              <div className="indicator-bar">
                <div
                  className={`indicator-fill ${animated ? 'animated' : ''}`}
                  style={{ animationDelay: `${i * 150 + 300}ms` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adaptable callout */}
      <div className="adaptable-callout">
        <div className="callout-glow" />
        <div className="callout-content">
          <div className="callout-header">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <span className="callout-title">
              {copy.callout_title ?? 'Built to adapt'}
            </span>
          </div>
          <p>
            {copy.callout_body ??
              "We learn YOUR patterns - whatever you're tracking. The more you log, the smarter it gets."}
          </p>
        </div>
      </div>

      <style jsx>{`
        .learning-container {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .learning-areas {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .learning-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(208, 189, 244, 0.08);
          border-radius: 0.75rem;
          opacity: 0;
          transform: translateX(-10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .learning-area.animated {
          opacity: 1;
          transform: translateX(0);
        }

        .area-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .area-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .area-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary, #20132e);
        }

        .area-status {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
        }

        .learning-indicator {
          width: 60px;
          flex-shrink: 0;
        }

        .indicator-bar {
          height: 4px;
          background: rgba(32, 19, 46, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .indicator-fill {
          height: 100%;
          width: 0%;
          background: var(--accent-purple, #d0bdf4);
          border-radius: 2px;
          transition: width 1s ease;
        }

        .indicator-fill.animated {
          width: 100%;
        }

        .adaptable-callout {
          position: relative;
          padding: 1rem;
          background: linear-gradient(
            135deg,
            rgba(208, 189, 244, 0.15),
            rgba(164, 200, 216, 0.15)
          );
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .callout-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(208, 189, 244, 0.3) 0%,
            transparent 70%
          );
          animation: slowRotate 10s linear infinite;
        }

        @keyframes slowRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .callout-content {
          position: relative;
          z-index: 1;
        }

        .callout-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: var(--primary, #20132e);
        }

        .callout-title {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .callout-content p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export function OtherLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: OtherLayoutProps) {
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
    <div className={`other-layout ${isVisible ? 'visible' : ''}`}>
      {/* Victory Section */}
      <VictorySection
        stepsCompleted={victory.stepsCompleted}
        totalSteps={victory.totalSteps}
        baselineData={victory.baselineData}
        promise={promiseData}
        victoryMessage={victory.victoryMessage}
      />

      {/* Pattern Learning Card */}
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{preview.badge}</span>
        </div>

        <PatternLearning />
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
        .other-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .other-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card {
          background: linear-gradient(
            135deg,
            rgba(208, 189, 244, 0.08),
            rgba(164, 200, 216, 0.08)
          );
          border-radius: 1.25rem;
          border: 1px solid rgba(208, 189, 244, 0.15);
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
          color: #7c3aed;
          background: rgba(208, 189, 244, 0.3);
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

export default OtherLayout;
