'use client';

/**
 * VictorySection - Combined celebration moment after onboarding
 *
 * Why this exists: Users need to feel accomplished after completing onboarding.
 * This creates the "victory" moment by combining:
 * 1. Progress celebration (you did it!)
 * 2. Baseline captured (your data is recorded)
 * 3. Promise card (here's what we'll do for you)
 *
 * Design: Celebratory but calm, no confetti - just acknowledgment
 */

import { useEffect, useState } from 'react';

import type { VictoryProps } from '@/backend/agents/onboarding/types';
import { formatTemplate, getMicrocopy } from '@/lib/onboarding/content';

import { BaselineCard } from './BaselineCard';
import { PromiseCard } from './PromiseCard';

interface VictorySectionProps extends VictoryProps {
  className?: string;
}

export function VictorySection({
  stepsCompleted,
  totalSteps,
  baselineData,
  promise,
  victoryMessage,
  className = '',
}: VictorySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [showPromise, setShowPromise] = useState(false);

  // Staggered entrance animation
  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowBaseline(true), 400);
    const timer3 = setTimeout(() => setShowPromise(true), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      className={`victory-section ${className} ${isVisible ? 'visible' : ''}`}
    >
      {/* Progress celebration header */}
      <div className="victory-header">
        {/* Checkmark circle */}
        <div className="victory-check">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Victory message */}
        <div className="victory-text">
          <h2 className="victory-title">{victoryMessage}</h2>
          <p className="victory-steps">
            {formatTemplate(
              getMicrocopy('screen4.steps_complete_template.v1'),
              {
                done: String(stepsCompleted),
                total: String(totalSteps),
              }
            )}
          </p>
        </div>
      </div>

      {/* Stacked layout for baseline + promise */}
      <div className="victory-cards">
        {/* Baseline captured */}
        <div
          className={`victory-card-wrapper ${showBaseline ? 'visible' : ''}`}
        >
          <BaselineCard baseline={baselineData} />
        </div>

        {/* Promise card */}
        <div
          className={`victory-card-wrapper promise-wrapper ${showPromise ? 'visible' : ''}`}
        >
          <PromiseCard promise={promise} />
        </div>
      </div>

      <style jsx>{`
        .victory-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .victory-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .victory-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid rgba(32, 19, 46, 0.08);
        }

        .victory-check {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-mint, #6ee7b7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          animation: checkPop 0.4s ease 0.2s both;
        }

        @keyframes checkPop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .victory-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .victory-title {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.3;
        }

        .victory-steps {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
          margin: 0;
        }

        .victory-cards {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .victory-card-wrapper {
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .victory-card-wrapper.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .promise-wrapper {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default VictorySection;
