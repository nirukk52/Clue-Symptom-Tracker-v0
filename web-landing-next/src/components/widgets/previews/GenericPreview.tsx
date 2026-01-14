'use client';

/**
 * GenericPreview - Pattern learning visualization for "other" domain
 *
 * Why this exists: Users who selected "Other" need reassurance that
 * we can still help them discover patterns in whatever they're tracking.
 * Focuses on general pattern discovery and learning capabilities.
 *
 * Visual Identity: Soft purple/lavender theme on dark glass with neural network effect
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
    { icon: '🔍', label: 'Your patterns', status: 'Learning starts with you' },
    { icon: '🔗', label: 'Hidden connections', status: "We'll find what you miss" },
    { icon: '✨', label: 'Personal insights', status: 'Tailored to your experience' },
  ];

  return (
    <div className="learning-container">
      {/* Neural network background */}
      <svg className="neural-bg" viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D0BDF4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D0BDF4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <g className={`neural-lines ${animated ? 'animated' : ''}`}>
          <line x1="20" y1="30" x2="80" y2="60" stroke="url(#lineGrad)" strokeWidth="1" />
          <line x1="80" y1="60" x2="140" y2="40" stroke="url(#lineGrad)" strokeWidth="1" />
          <line x1="140" y1="40" x2="180" y2="70" stroke="url(#lineGrad)" strokeWidth="1" />
          <line x1="40" y1="80" x2="100" y2="50" stroke="url(#lineGrad)" strokeWidth="1" />
          <line x1="100" y1="50" x2="160" y2="90" stroke="url(#lineGrad)" strokeWidth="1" />
        </g>
        <g className={`neural-nodes ${animated ? 'animated' : ''}`}>
          <circle cx="20" cy="30" r="4" fill="#D0BDF4" />
          <circle cx="80" cy="60" r="5" fill="#A78BFA" />
          <circle cx="140" cy="40" r="4" fill="#D0BDF4" />
          <circle cx="180" cy="70" r="3" fill="#C4B5FD" />
          <circle cx="40" cy="80" r="3" fill="#C4B5FD" />
          <circle cx="100" cy="50" r="5" fill="#A78BFA" />
          <circle cx="160" cy="90" r="4" fill="#D0BDF4" />
        </g>
      </svg>

      {/* Learning areas */}
      <div className="learning-areas">
        {areas.map((area, i) => (
          <div
            key={area.label}
            className={`learning-area ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="area-icon-wrapper">
              <span className="area-icon">{area.icon}</span>
            </div>
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
        <div className="callout-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </div>
        <div className="callout-content">
          <span className="callout-title">
            {copy.callout_title ?? 'Built to adapt'}
          </span>
          <p>
            {copy.callout_body ??
              "We learn YOUR patterns - whatever you're tracking."}
          </p>
        </div>
      </div>

      <style jsx>{`
        .learning-container {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(25, 20, 35, 0.95) 0%,
            rgba(35, 28, 50, 0.9) 50%,
            rgba(25, 20, 35, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(208, 189, 244, 0.2);
          box-shadow:
            0 0 40px rgba(208, 189, 244, 0.08),
            inset 0 1px 0 rgba(208, 189, 244, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          overflow: hidden;
        }

        .neural-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          opacity: 0.4;
          pointer-events: none;
        }

        .neural-lines {
          opacity: 0;
          transition: opacity 1s ease;
        }

        .neural-lines.animated {
          opacity: 1;
        }

        .neural-nodes circle {
          opacity: 0;
          transform-origin: center;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .neural-nodes.animated circle {
          opacity: 1;
          animation: nodePulse 3s ease-in-out infinite;
        }

        @keyframes nodePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .learning-areas {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          position: relative;
          z-index: 1;
        }

        .learning-area {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5rem 0.625rem;
          background: linear-gradient(
            135deg,
            rgba(208, 189, 244, 0.1) 0%,
            rgba(167, 139, 250, 0.05) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(208, 189, 244, 0.15);
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

        .area-icon-wrapper {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgba(208, 189, 244, 0.2) 0%,
            rgba(167, 139, 250, 0.1) 100%
          );
          border-radius: 0.5rem;
          flex-shrink: 0;
        }

        .area-icon {
          font-size: 0.875rem;
        }

        .area-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.0625rem;
          min-width: 0;
        }

        .area-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }

        .area-status {
          font-size: 0.625rem;
          color: rgba(208, 189, 244, 0.8);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .learning-indicator {
          width: 50px;
          flex-shrink: 0;
        }

        .indicator-bar {
          height: 3px;
          background: rgba(208, 189, 244, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .indicator-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(
            90deg,
            #D0BDF4 0%,
            #A78BFA 100%
          );
          border-radius: 2px;
          transition: width 1s ease;
          box-shadow: 0 0 8px rgba(208, 189, 244, 0.6);
        }

        .indicator-fill.animated {
          width: 100%;
        }

        .adaptable-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(208, 189, 244, 0.12) 0%,
            rgba(167, 139, 250, 0.06) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(208, 189, 244, 0.2);
          position: relative;
          z-index: 1;
        }

        .callout-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(208, 189, 244, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D0BDF4;
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

export default GenericPreview;
