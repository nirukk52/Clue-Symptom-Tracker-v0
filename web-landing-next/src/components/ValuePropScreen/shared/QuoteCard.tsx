'use client';

/**
 * QuoteCard - Hero-styled gradient card with social proof quote
 *
 * Why this exists: Shows a single, AI-selected testimonial quote at the top
 * of the ValuePropScreen to immediately establish social proof and emotional
 * connection. Uses the EXACT same gradient styling as Hero.tsx.
 *
 * AI selects the quote based on:
 * - Q1 domain (condition match)
 * - Q2 pain point (problem match)
 * - Whether it's a "flipped" positive or raw pain quote
 */

import { useEffect, useState } from 'react';

export interface QuoteCardProps {
  /** The testimonial quote text */
  quote: string;
  /** Source attribution (e.g., "r/ChronicIllness", "Clue user") */
  source: string;
  /** Condition tag (e.g., "Long COVID", "POTS") */
  condition?: string;
  /** Whether this is a Clue insight (different styling) */
  isClueInsight?: boolean;
}

export function QuoteCard({
  quote,
  source,
  condition,
  isClueInsight = false,
}: QuoteCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`quote-card ${isVisible ? 'visible' : ''}`}>
      {/* Quote mark */}
      <div className="quote-mark">&quot;</div>

      {/* Quote text */}
      <blockquote className="quote-text">{quote}</blockquote>

      {/* Attribution */}
      <div className="quote-attribution">
        {condition && <span className="quote-condition">{condition}</span>}
        <span className="quote-source">— {source}</span>
      </div>

      {/* Clue insight badge */}
      {isClueInsight && (
        <div className="clue-badge">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Clue insight</span>
        </div>
      )}

      <style jsx>{`
        .quote-card {
          position: relative;
          border-radius: 1.25rem;
          padding: 1.5rem 1.5rem 1.25rem;
          overflow: hidden;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.5s ease,
            transform 0.5s ease;
          min-height: 100px;
        }

        .quote-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* EXACT Hero gradient from globals.css - evening sky */
        .quote-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(
            circle at 50% 95%,
            #6d8ba0 0%,
            rgba(140, 130, 150, 0.85) 50%,
            rgba(160, 120, 140, 0.8) 55%,
            rgba(140, 90, 120, 0.85) 60%,
            rgba(90, 60, 100, 0.9) 68%,
            rgba(50, 35, 70, 0.95) 85%,
            rgba(32, 19, 46, 0.98) 100%
          );
        }

        .quote-mark {
          position: relative;
          z-index: 1;
          font-family: Georgia, serif;
          font-size: 3rem;
          line-height: 1;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: -0.75rem;
        }

        .quote-text {
          position: relative;
          z-index: 1;
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.0625rem;
          font-weight: 500;
          color: white;
          line-height: 1.5;
          margin: 0 0 0.875rem 0;
          padding: 0;
        }

        .quote-attribution {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        .quote-condition {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: white;
          background: rgba(255, 255, 255, 0.15);
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .quote-source {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }

        .clue-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
        }

        .clue-badge svg {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

export default QuoteCard;
