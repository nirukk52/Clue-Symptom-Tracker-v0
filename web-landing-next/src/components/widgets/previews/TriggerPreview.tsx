'use client';

/**
 * TriggerPreview - Trigger correlation preview for migraines domain
 *
 * Why this exists: Migraine sufferers need to understand their triggers -
 * weather, food, sleep, hormones. This preview shows what factors we'll
 * track to find correlations.
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
    { name: 'Weather', icon: '~' },
    { name: 'Sleep', icon: '*' },
    { name: 'Food', icon: '+' },
    { name: 'Cycle', icon: 'o' },
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
          color: var(--primary, #20132e);
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

export default TriggerPreview;
