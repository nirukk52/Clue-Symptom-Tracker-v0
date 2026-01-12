'use client';

import { useEffect, useState } from 'react';

import { getCategoryHeadline, getWatchList } from '@/content/watch-list';

/**
 * WatchListPreview - Shows personalized "what we'll watch" after Q3
 *
 * Why this exists: Turns onboarding into a result, not just setup.
 * Users see concrete output from their input, creating immediate value
 * and anticipation for "first insight in ~3 days".
 *
 * Design principles:
 * - NO EMOJIS (uses minimal iconography)
 * - Warm cream + accent purple palette
 * - Progressive reveal animation
 * - Trust-building through transparency
 */

interface WatchListPreviewProps {
  q1Domain: string;
  q2PainPoint: string;
  q3Data: {
    condition?: string;
    widgetType?: string;
    widgetValue?: number | string | string[];
  };
  onContinue?: () => void;
}

export function WatchListPreview({
  q1Domain: _q1Domain, // Reserved for future domain-specific customization
  q2PainPoint,
  q3Data,
  onContinue,
}: WatchListPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  const watchList = getWatchList(q2PainPoint, q3Data);
  const categoryHeadline = getCategoryHeadline(watchList.category);

  // Staggered reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      watchList.items.forEach((_, index) => {
        setTimeout(
          () => {
            setItemsVisible((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          },
          200 + index * 150
        );
      });
    }
  }, [isVisible, watchList.items]);

  return (
    <div
      className={`watch-list-container ${isVisible ? 'visible' : ''}`}
      role="region"
      aria-label="Your personalized watch list"
    >
      {/* Headline */}
      <div className="watch-list-headline">
        <p className="watch-list-subtitle">Based on what you told us</p>
        <h2 className="watch-list-title">{categoryHeadline}</h2>
      </div>

      {/* Watch List Card */}
      <div className="watch-list-card">
        <div className="watch-list-card-header">
          <span className="watch-list-card-title">Your next 7 days</span>
        </div>

        <div className="watch-list-card-label">Watching for:</div>

        <ul className="watch-list-items" role="list">
          {watchList.items.map((item, index) => (
            <li
              key={index}
              className={`watch-list-item ${itemsVisible[index] ? 'visible' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className="watch-list-bullet" aria-hidden="true" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        {/* Baseline Summary */}
        <div className="watch-list-baseline">
          <div className="watch-list-baseline-row">
            <span className="watch-list-baseline-label">
              {watchList.baselineLabel}:
            </span>
            <span className="watch-list-baseline-value">
              {watchList.baseline}
            </span>
          </div>
          <div className="watch-list-baseline-row">
            <span className="watch-list-baseline-label">Condition:</span>
            <span className="watch-list-baseline-value">
              {watchList.condition}
            </span>
          </div>
        </div>

        {/* ETA */}
        <div className="watch-list-eta">
          <span className="watch-list-eta-icon" aria-hidden="true">
            ○
          </span>
          <span>First insight in ~3 days</span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="watch-list-cta-section">
        <p className="watch-list-cta-text">
          Save your progress to start learning
        </p>

        {onContinue && (
          <button
            className="watch-list-cta-button"
            onClick={onContinue}
            type="button"
          >
            Continue
          </button>
        )}
      </div>

      {/* Trust Signal */}
      <p className="watch-list-trust">
        Your data stays on your device until you choose to sync
      </p>

      <style jsx>{`
        .watch-list-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 24px 16px;
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity 0.4s ease-out,
            transform 0.4s ease-out;
        }

        .watch-list-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .watch-list-headline {
          text-align: center;
        }

        .watch-list-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted, #666666);
          margin-bottom: 8px;
        }

        .watch-list-title {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.3;
        }

        .watch-list-card {
          background: linear-gradient(
            135deg,
            var(--bg-cream, #fdfbf9) 0%,
            rgba(208, 189, 244, 0.15) 100%
          );
          border: 2px solid var(--accent-purple, #d0bdf4);
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 360px;
        }

        .watch-list-card-header {
          margin-bottom: 16px;
        }

        .watch-list-card-title {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .watch-list-card-label {
          font-size: 0.875rem;
          color: var(--text-muted, #666666);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(32, 19, 46, 0.1);
        }

        .watch-list-items {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .watch-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.9375rem;
          color: var(--primary, #20132e);
          opacity: 0;
          transform: translateX(-8px);
          transition:
            opacity 0.3s ease-out,
            transform 0.3s ease-out;
        }

        .watch-list-item.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .watch-list-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-peach, #e8974f);
          margin-top: 6px;
          flex-shrink: 0;
        }

        .watch-list-baseline {
          background: rgba(32, 19, 46, 0.05);
          border-radius: 12px;
          padding: 12px 16px;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .watch-list-baseline-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .watch-list-baseline-label {
          color: var(--text-muted, #666666);
        }

        .watch-list-baseline-value {
          color: var(--primary, #20132e);
          font-weight: 500;
        }

        .watch-list-eta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          color: var(--text-muted, #666666);
          font-size: 0.8125rem;
        }

        .watch-list-eta-icon {
          color: var(--accent-purple, #d0bdf4);
        }

        .watch-list-cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          max-width: 360px;
        }

        .watch-list-cta-text {
          font-size: 1rem;
          color: var(--primary, #20132e);
          font-weight: 500;
          text-align: center;
          margin: 0;
        }

        .watch-list-cta-button {
          width: 100%;
          padding: 16px 24px;
          background: var(--primary, #20132e);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .watch-list-cta-button:hover {
          background: var(--primary-hover, #2d1d40);
          transform: translateY(-1px);
        }

        .watch-list-cta-button:active {
          transform: translateY(0);
        }

        .watch-list-trust {
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          text-align: center;
          max-width: 280px;
          line-height: 1.5;
          margin: 0;
        }

        @media (min-width: 640px) {
          .watch-list-title {
            font-size: 1.75rem;
          }

          .watch-list-card {
            padding: 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default WatchListPreview;
