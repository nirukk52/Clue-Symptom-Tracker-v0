'use client';

/**
 * TriggerPreview - Trigger correlation preview for migraines domain
 *
 * Why this exists: Migraine sufferers need to understand their triggers -
 * weather, food, sleep, hormones. This preview shows what factors we'll
 * track to find correlations.
 *
 * Visual Identity: Cool blue/cyan theme on dark glass with radar-like effect
 */

import { useEffect, useState } from 'react';

import { getMicrocopy, getScreen4LayoutConfig } from '@/lib/onboarding/content';

import type { PreviewComponentProps } from './FlareRiskPreview';

export function TriggerPreview(_props: PreviewComponentProps) {
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
    { name: 'Weather', icon: '☁️' },
    { name: 'Sleep', icon: '😴' },
    { name: 'Food', icon: '🍽️' },
    { name: 'Cycle', icon: '🔄' },
  ];

  return (
    <div className="trigger-preview">
      {/* Radar sweep effect */}
      <div className="radar-sweep" />

      <div className="trigger-grid">
        {triggers.map((trigger, i) => (
          <div
            key={trigger.name}
            className={`trigger-card ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="trigger-icon-wrapper">
              <span className="trigger-icon">{trigger.icon}</span>
            </div>
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
        <div className="callout-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <div className="callout-content">
          <span className="callout-title">
            {copy.callout_title ?? 'Pattern Discovery'}
          </span>
          <p>{copy.callout_body ?? "We'll find correlations you might miss."}</p>
        </div>
      </div>

      <style jsx>{`
        .trigger-preview {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(30, 41, 59, 0.9) 50%,
            rgba(15, 23, 42, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
          box-shadow:
            0 0 40px rgba(56, 189, 248, 0.08),
            inset 0 1px 0 rgba(56, 189, 248, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow: hidden;
        }

        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          transform: translate(-50%, -50%);
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(56, 189, 248, 0.1) 30deg,
            transparent 60deg
          );
          animation: sweep 4s linear infinite;
          pointer-events: none;
        }

        @keyframes sweep {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .trigger-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.375rem;
          position: relative;
          z-index: 1;
        }

        .trigger-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.625rem 0.375rem;
          background: linear-gradient(
            145deg,
            rgba(56, 189, 248, 0.1) 0%,
            rgba(14, 165, 233, 0.05) 100%
          );
          border-radius: 0.75rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
          opacity: 0;
          transform: scale(0.9);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .trigger-card.animated {
          opacity: 1;
          transform: scale(1);
        }

        .trigger-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.2) 0%,
            rgba(14, 165, 233, 0.1) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
        }

        .trigger-icon {
          font-size: 1rem;
        }

        .trigger-name {
          font-size: 0.625rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .trigger-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.5rem;
          color: rgba(56, 189, 248, 0.8);
          font-weight: 500;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #38BDF8;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
          }
          50% {
            opacity: 0.4;
            box-shadow: 0 0 4px rgba(56, 189, 248, 0.3);
          }
        }

        .correlation-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.12) 0%,
            rgba(14, 165, 233, 0.06) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
          position: relative;
          z-index: 1;
        }

        .callout-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38BDF8;
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

        .correlation-callout p {
          margin: 0;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default TriggerPreview;
