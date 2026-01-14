'use client';

/**
 * ValuePropScreen - Hero-styled value prop screen for onboarding step 4
 *
 * Why this exists: Shows a compelling, hero-styled summary after user completes
 * Q1-Q3. Uses the EXACT same gradient styling as Hero.tsx to create visual
 * continuity with the landing page. Breaks out of modal padding for full bleed.
 */

import { useEffect, useState } from 'react';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';
import { formatTemplate, getMicrocopy } from '@/lib/onboarding/content';

export interface ValuePropScreenProps {
  data: ValuePropScreenData;
  onCTAClick: () => void;
  isLoading?: boolean;
}

export function ValuePropScreen({
  data,
  onCTAClick,
  isLoading = false,
}: ValuePropScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const quote = data.socialProofQuote;

  return (
    <div className={`vps-fullbleed ${isVisible ? 'visible' : ''}`}>
      <div className="vps-hero">
        {/* Quote Section */}
        {quote && (
          <div className="vps-quote-section">
            <blockquote className="vps-quote-text">{quote.quote}</blockquote>
          </div>
        )}

        {/* Victory Section */}
        <div className="vps-victory-section" style={{ display: 'none' }}>
          <div className="vps-victory-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="vps-victory-text">
            <h2 className="vps-victory-title">Your starting point is set</h2>
            <p className="vps-victory-subtitle">
              {formatTemplate(
                getMicrocopy('screen4.steps_complete_template.v1'),
                {
                  done: String(data.victory.stepsCompleted),
                  total: String(data.victory.totalSteps),
                }
              )}
            </p>
          </div>
        </div>

        {/* Baseline Card */}
        <div className="vps-baseline-card" style={{ display: 'none' }}>
          <span className="vps-baseline-label">
            {data.victory.baselineData.condition}
          </span>
          <span className="vps-baseline-sublabel">
            {data.victory.baselineData.label}
          </span>
          <span className="vps-baseline-value">
            {data.victory.baselineData.value}
          </span>
          <div className="vps-baseline-captured">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{getMicrocopy('baseline.captured.day1.v1')}</span>
          </div>
        </div>

        {/* Promise Card */}
        <div className="vps-promise-card" style={{ display: 'none' }}>
          <div className="vps-promise-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h3 className="vps-promise-title">{data.preview.headline}</h3>
          <ul className="vps-promise-list">
            {data.preview.watchItems.map((item, index) => (
              <li key={index} className="vps-promise-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section */}
        <div className="vps-cta-section">
          <button
            className="vps-cta-button"
            onClick={onCTAClick}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {data.cta.text}
          </button>
          <p className="vps-cta-privacy">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {getMicrocopy('privacy_note.v1')}
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Full bleed - breaks out of modal padding */
        .vps-fullbleed {
          /* Summary modal removes padding, so this can be true full-bleed */
          margin: 0;
          width: 100%;
          height: calc(100vh - 2rem);
          min-height: calc(100vh - 4rem);
          max-height: calc(100vh - 2rem);
          /* Why: hide any subpixel overflow from pseudo-element backgrounds so
             we don't get 1px seams on rounded corners (retina + transforms). */
          overflow: hidden;
          overflow-y: auto;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
          border-radius: 2rem; /* Match modal border-radius */
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          position: relative;
        }

        .vps-fullbleed::-webkit-scrollbar {
          display: none;
        }

        .vps-fullbleed.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* EXACT Hero gradient from globals.css - evening sky */
        /* Background fixed to fullbleed container - doesn't scroll */
        .vps-fullbleed::before {
          content: '';
          position: absolute;
          /* Why: slightly overpaint to avoid antialias seams against rounded
             corners when the modal is transformed (scale/translate). */
          inset: -1px;
          z-index: 0;
          border-radius: 2rem;
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
          pointer-events: none;
        }

        /* Personas image fixed at the bottom of fullbleed container */
        .vps-fullbleed::after {
          content: '';
          position: absolute;
          /* Nudge image down slightly to free up more visual space above */
          bottom: -24px;
          left: 0;
          right: 0;
          height: 52%;
          min-height: 250px;
          z-index: 0;
          border-radius: 0;
          background-image: url('/personas/heroImage-all-persona.png');
          background-size: cover;
          /* Keep it anchored near the bottom, but reveal more of the top (avoid head clipping) */
          background-position: center 70%;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .vps-hero {
          position: relative;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 1;
        }

        /* Quote Section */
        .vps-quote-section {
          position: relative;
          z-index: 1;
          margin-bottom: 1.5rem;
        }

        .vps-quote-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.125rem;
          font-weight: 500;
          color: white;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }

        /* Victory Section */
        .vps-victory-section {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
        }

        .vps-victory-badge {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #10b981;
          border-radius: 50%;
          color: white;
          flex-shrink: 0;
        }

        .vps-victory-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--color-primary, #20132e);
          margin: 0;
        }

        .vps-victory-subtitle {
          font-size: 0.8125rem;
          color: var(--color-text-muted, #666);
          margin: 0;
        }

        /* Baseline Card */
        .vps-baseline-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          margin-bottom: 1rem;
          background: white;
          border-radius: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .vps-baseline-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-muted, #666);
          background: rgba(0, 0, 0, 0.04);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          margin-bottom: 0.5rem;
        }

        .vps-baseline-sublabel {
          font-size: 0.875rem;
          color: var(--color-text-muted, #666);
          margin-bottom: 0.25rem;
        }

        .vps-baseline-value {
          font-family: var(--font-display, Georgia, serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: #10b981;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .vps-baseline-captured {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: #10b981;
        }

        /* Promise Card */
        .vps-promise-card {
          position: relative;
          z-index: 1;
          padding: 1rem;
          margin-bottom: 1rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          border: 2px solid rgba(167, 139, 250, 0.3);
        }

        .vps-promise-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 0.5rem;
          color: #8b5cf6;
          margin-bottom: 0.5rem;
        }

        .vps-promise-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-primary, #20132e);
          margin: 0 0 0.75rem 0;
        }

        .vps-promise-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .vps-promise-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted, #554b66);
        }

        .vps-promise-item svg {
          color: #10b981;
          flex-shrink: 0;
        }

        /* CTA Section */
        .vps-cta-section {
          position: relative;
          z-index: 1;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding-top: 0.5rem;
        }

        .vps-cta-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #e8974f 0%, #d4792e 100%);
          color: white;
          font-family: var(--font-body, system-ui);
          font-size: 1rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px -2px rgba(232, 151, 79, 0.4);
        }

        .vps-cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px -4px rgba(232, 151, 79, 0.5);
          background: linear-gradient(135deg, #f0a35f 0%, #e8974f 100%);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .vps-cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .vps-cta-privacy {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default ValuePropScreen;

// Re-export types for convenience
export type {
  LayoutId,
  SelectedQuote,
  ValuePropScreenData,
} from '@/backend/agents/onboarding/types';

// Re-export shared components (for backwards compat)
export { BaselineCard, PromiseCard, QuoteCard, VictorySection } from './shared';

// Re-export layouts (for backwards compat)
export {
  FatigueLayout,
  FlaresLayout,
  IBSGutLayout,
  MigrainesLayout,
  MultipleLayout,
  OtherLayout,
} from './layouts';
