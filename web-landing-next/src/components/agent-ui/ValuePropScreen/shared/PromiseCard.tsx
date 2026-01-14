'use client';

/**
 * PromiseCard - Displays the q4_value promise and watch items
 *
 * Why this exists: Reinforces the value proposition with personalized promises.
 * Shows what we'll do with their data (the q4_value from widget definition)
 * and the AI-generated watch items specific to their condition.
 *
 * Design: Purple accent, watch icon, animated reveal
 */

import { useEffect, useState } from 'react';

import type { PromiseData } from '@/backend/agents/onboarding/types';

interface PromiseCardProps {
  promise: PromiseData;
}

export function PromiseCard({ promise }: PromiseCardProps) {
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  // Staggered reveal animation for watch items
  useEffect(() => {
    promise.watchItems.forEach((_, index) => {
      setTimeout(
        () => {
          setItemsVisible((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
          });
        },
        300 + index * 150
      );
    });
  }, [promise.watchItems]);

  return (
    <div className="promise-card">
      {/* Promise headline (q4_value) */}
      <div className="promise-header">
        <div className="promise-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h3 className="promise-headline">{promise.q4Value}</h3>
      </div>

      {/* Watch items */}
      <ul className="watch-items-list" role="list">
        {promise.watchItems.map((item, index) => (
          <li
            key={index}
            className={`watch-item ${itemsVisible[index] ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="var(--accent-mint, #6EE7B7)"
              stroke="none"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .promise-card {
          background: rgba(208, 189, 244, 0.12);
          border-radius: 0.875rem;
          border: 1px solid rgba(208, 189, 244, 0.3);
          padding: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .promise-header {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
        }

        .promise-icon {
          color: var(--accent-purple, #d0bdf4);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .promise-headline {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.4;
        }

        .watch-items-list {
          list-style: none;
          margin: 0;
          padding: 0;
          padding-left: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .watch-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--primary, #20132e);
          opacity: 0;
          transform: translateX(-8px);
          transition:
            opacity 0.3s ease-out,
            transform 0.3s ease-out;
        }

        .watch-item.visible {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}

export default PromiseCard;
