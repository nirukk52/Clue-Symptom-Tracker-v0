'use client';

import { useEffect, useState } from 'react';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';

import { getLayoutComponent } from './registry';

/**
 * ValuePropScreen (Screen 4)
 *
 * Why this exists: This is the post-Q3 conversion screen (onboarding step 4).
 * It renders instantly with deterministic data and selects a render-ready
 * widget/layout from a centralized registry (future: LLM can choose IDs only).
 *
 * Design notes:
 * - No loading gate (shell renders immediately)
 * - Quote is always shown in double quotes
 * - Full-bleed hero gradient matches landing page hero
 */

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

  const Layout = getLayoutComponent(data.layoutId);
  const quote = data.socialProofQuote;

  return (
    <div className={`vps-fullbleed ${isVisible ? 'visible' : ''}`}>
      <div className="vps-hero">
        {/* Quote Section */}
        {quote?.quote ? (
          <div className="vps-quote-section">
            <blockquote className="vps-quote-text">
              &quot;{quote.quote}&quot;
            </blockquote>
          </div>
        ) : null}

        {/* Domain layout / conversion widget */}
        <div className="vps-layout">
          <Layout
            victory={data.victory}
            preview={data.preview}
            cta={data.cta}
            onCTAClick={onCTAClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      <style jsx>{`
        /* Full bleed container (matches legacy ValuePropScreen background) */
        .vps-fullbleed {
          margin: 0;
          width: 100%;
          /* Why: This screen renders inside a modal. Using 100vh here makes it
             escape the modal on shorter viewports. The modal itself sets height;
             this should just fill it. */
          height: 100%;
          min-height: 0;
          max-height: 100%;
          overflow: hidden;
          overflow-y: auto;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
          border-radius: 2rem;
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

        .vps-fullbleed::before {
          content: '';
          position: absolute;
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

        .vps-fullbleed::after {
          content: '';
          position: absolute;
          bottom: -24px;
          left: 0;
          right: 0;
          height: 52%;
          min-height: 250px;
          z-index: 0;
          background-image: url('/personas/heroImage-all-persona.png');
          background-size: cover;
          background-position: center 70%;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .vps-hero {
          position: relative;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 1;
          gap: 1rem;
        }

        .vps-quote-section {
          /* Why: The quote should stay pinned while the carousel content and CTA
             move beneath it. This also helps keep the whole layout inside the modal. */
          position: sticky;
          top: 0;
          z-index: 5;
          margin: -1.5rem -1.5rem 0;
          padding: 1.25rem 1.5rem 1rem;
          background: linear-gradient(
            180deg,
            rgba(32, 19, 46, 0.72) 0%,
            rgba(32, 19, 46, 0.35) 55%,
            rgba(32, 19, 46, 0) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .vps-quote-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.125rem;
          font-weight: 500;
          color: white;
          line-height: 1.5;
          margin: 0;
          text-align: center;
        }

        .vps-layout {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}

export default ValuePropScreen;
