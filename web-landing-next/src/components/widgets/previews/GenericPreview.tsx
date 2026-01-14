'use client';

/**
 * GenericPreview - Pattern learning visualization for "other" domain
 *
 * Why this exists: Users who selected "Other" need reassurance that
 * we can still help them discover patterns in whatever they're tracking.
 * Focuses on general pattern discovery and learning capabilities.
 */

import { useEffect, useState } from 'react';

import { getScreen4LayoutConfig } from '@/lib/onboarding/content';

import type { PreviewComponentProps } from './FlareRiskPreview';

export function GenericPreview(_props: PreviewComponentProps) {
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
    { icon: '#', label: 'Your patterns', status: 'Learning starts with you' },
    {
      icon: '?',
      label: 'Hidden connections',
      status: "We'll find what you miss",
    },
    {
      icon: '*',
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
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(208, 189, 244, 0.2);
          border-radius: 0.5rem;
          color: var(--primary, #20132e);
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

export default GenericPreview;
