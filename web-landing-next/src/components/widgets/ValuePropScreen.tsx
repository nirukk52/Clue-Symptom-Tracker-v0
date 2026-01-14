'use client';

import { useEffect, useState } from 'react';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';
import { getMicrocopy } from '@/lib/onboarding/content';

import { getPreviewComponent, type Screen4LayoutId } from './registry';
import { ValuePropCarousel } from './ValuePropCarousel';

/**
 * ValuePropScreen (Screen 4)
 *
 * Why this exists: This is the post-Q3 conversion screen (onboarding step 4).
 * It renders instantly with deterministic data and uses a carousel to show
 * value props without requiring scroll inside the modal.
 *
 * Layout structure:
 * - Quote at top (fixed)
 * - Carousel in middle (flexible, 2 slides: victory+baseline+promise merged, domain-specific preview)
 * - CTA at bottom (fixed)
 */

export interface ValuePropScreenProps {
  data: ValuePropScreenData;
  onCTAClick: () => void;
  isLoading?: boolean;
}

/**
 * VictorySlide - Unified progress + baseline + promise + personalized value in one glass card
 *
 * Why this exists: Creates a stunning, compact glass card that shows
 * progress, baseline captured, promise items, and the personalized q4Value promise.
 * The q4Value is integrated here for better visual cohesion and conversion.
 */
function VictorySlide({
  victory,
}: {
  victory: ValuePropScreenData['victory'];
}) {
  return (
    <div className="unified-glass-card">
      {/* Top: Progress row */}
      <div className="progress-row">
        <div className="check-orb">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="progress-info">
          <span className="progress-title">{victory.victoryMessage}</span>
          <span className="progress-meta">{victory.stepsCompleted}/{victory.totalSteps} complete</span>
        </div>
      </div>

      {/* Divider with glow */}
      <div className="glass-divider" />

      {/* Center: Condition + Day captured */}
      <div className="baseline-row">
        <span className="condition-pill">{victory.baselineData.condition}</span>
        <div className="day-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{getMicrocopy('baseline.captured.day1.v1')}</span>
        </div>
      </div>

      {/* Promise items as horizontal pills */}
      <div className="promise-row">
        {victory.promise.watchItems.slice(0, 3).map((item, idx) => (
          <div key={idx} className="promise-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Personalized Promise - integrated into victory slide */}
      {victory.promise.q4Value && (
        <>
          <div className="glass-divider" />
          <div className="personalized-promise-integrated">
            <div className="promise-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="promise-text-integrated">{victory.promise.q4Value}</p>
          </div>
        </>
      )}

      <style jsx>{`
        .unified-glass-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 1.125rem;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.12) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05);
          height: 100%;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .check-orb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399 0%, #6ee7b7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow:
            0 4px 16px rgba(52, 211, 153, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .progress-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .progress-meta {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.65);
          font-weight: 500;
        }

        .glass-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 20%,
            rgba(255, 255, 255, 0.3) 80%,
            transparent 100%
          );
          margin: 0 -0.5rem;
        }

        .baseline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .condition-pill {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: white;
          background: rgba(255, 255, 255, 0.12);
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
        }

        .day-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6ee7b7;
          text-shadow: 0 0 12px rgba(110, 231, 183, 0.5);
        }

        .day-badge svg {
          filter: drop-shadow(0 0 4px rgba(110, 231, 183, 0.6));
        }

        .promise-row {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .promise-pill {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.35;
        }

        .promise-pill svg {
          flex-shrink: 0;
          margin-top: 0.25rem;
          color: rgba(110, 231, 183, 0.8);
          filter: drop-shadow(0 0 3px rgba(110, 231, 183, 0.5));
        }

        .promise-pill span {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Integrated Personalized Promise */
        .personalized-promise-integrated {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(110, 231, 183, 0.15) 0%,
            rgba(52, 211, 153, 0.1) 50%,
            rgba(110, 231, 183, 0.12) 100%
          );
          border-radius: 0.875rem;
          border: 1px solid rgba(110, 231, 183, 0.3);
        }

        .promise-icon {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(110, 231, 183, 0.35) 0%, rgba(52, 211, 153, 0.25) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6ee7b7;
          margin-top: 1px;
        }

        .promise-text-integrated {
          font-family: var(--font-display, Georgia, serif);
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.4;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

/**
 * Domain-specific preview slide using registry to select the right component
 *
 * Why this exists: Each domain (fatigue, flares, migraines, etc.) has a unique
 * visualization that best represents the value proposition. The registry maps
 * layoutId to the appropriate preview component. Styled with glass morphism.
 */
function PreviewSlide({
  preview,
  badge,
  layoutId,
}: {
  preview: ValuePropScreenData['preview'];
  badge: string;
  layoutId: Screen4LayoutId;
}) {
  // Get the domain-specific preview component from the registry
  const PreviewComponent = getPreviewComponent(layoutId);

  return (
    <div className="preview-glass-card">
      {/* Header row */}
      <div className="preview-header">
        <span className="preview-badge">{badge}</span>
        <span className="preview-status">
          <span className="status-dot" />
          Preview
        </span>
      </div>

      {/* Title */}
      <h3 className="preview-title">{preview.headline}</h3>

      {/* Domain-specific preview visualization */}
      <div className="preview-content">
        <PreviewComponent data={preview.graphData} />
      </div>

      <style jsx>{`
        .preview-glass-card {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          padding: 0.5rem 1.125rem;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.12) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05);
          height: 100%;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-badge {
          font-size: 0.5625rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: white;
          background: linear-gradient(135deg, rgba(208, 189, 244, 0.4) 0%, rgba(167, 139, 250, 0.3) 100%);
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(208, 189, 244, 0.3);
        }

        .preview-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
          box-shadow: 0 0 8px rgba(110, 231, 183, 0.6);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(110, 231, 183, 0.6);
          }
          50% {
            opacity: 0.5;
            box-shadow: 0 0 4px rgba(110, 231, 183, 0.3);
          }
        }

        .preview-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          margin: 0;
          line-height: 1.35;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        .preview-content {
          flex: 1;
          min-height: 0;
          overflow: visible;
        }
      `}</style>
    </div>
  );
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

  // Carousel slides: 2 slides (merged victory+baseline+promise, then preview)
  const slides = [
    <VictorySlide key="victory" victory={data.victory} />,
    <PreviewSlide
      key="preview"
      preview={data.preview}
      badge={data.preview.badge}
      layoutId={data.layoutId}
    />,
  ];

  return (
    <div className={`vps-fullbleed ${isVisible ? 'visible' : ''}`}>
      <div className="vps-hero">
        {/* Fixed Quote at Top */}
        {quote?.quote ? (
          <div className="vps-quote-section">
            <blockquote className="vps-quote-text">
              &quot;{quote.quote}&quot;
            </blockquote>
          </div>
        ) : null}

        {/* Carousel in Middle - expanded height for better preview visibility */}
        <div className="vps-carousel-wrapper">
          <ValuePropCarousel>{slides}</ValuePropCarousel>
        </div>

        {/* Fixed CTA at Bottom */}
        <div className="vps-cta-section">
          <button
            className="vps-cta-button"
            onClick={onCTAClick}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="vps-spinner" />
                {getMicrocopy('cta.connecting.v1')}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {data.cta.text}
              </>
            )}
          </button>
          <p className="vps-cta-privacy">
            <svg
              width="12"
              height="12"
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
        /* Full bleed container with hero gradient */
        .vps-fullbleed {
          margin: 0;
          width: 100%;
          height: 100%;
          min-height: 0;
          max-height: 100%;
          overflow: hidden;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
          border-radius: 2rem;
          position: relative;
        }

        .vps-fullbleed.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Hero gradient background */
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

        /* Persona image at bottom */
        .vps-fullbleed::after {
          content: '';
          position: absolute;
          bottom: -24px;
          left: 0;
          right: 0;
          height: 45%;
          min-height: 200px;
          z-index: 0;
          background-image: url('/personas/heroImage-all-persona.png');
          background-size: cover;
          background-position: center 70%;
          background-repeat: no-repeat;
          pointer-events: none;
          opacity: 0.75;
        }

        .vps-hero {
          position: relative;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          z-index: 1;
          gap: 0.75rem;
        }

        /* Fixed Quote Section at Top */
        .vps-quote-section {
          flex-shrink: 0;
          padding: 0.25rem 0;
        }

        .vps-quote-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: 0.9375rem;
          font-weight: 500;
          color: white;
          line-height: 1.5;
          margin: 0;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Carousel Wrapper in Middle - expanded height for better preview visibility */
        .vps-carousel-wrapper {
          flex: 1 1 auto;
          min-height: 280px;
          max-height: 380px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
          /* Ensure dots appear 16px above persona image */
          margin-bottom: 16px;
        }

        /* Fixed CTA Section at Bottom - pushed to absolute bottom */
        .vps-cta-section {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .vps-cta-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, #e8974f 0%, #d4792e 100%);
          color: white;
          font-family: var(--font-body, system-ui);
          font-size: 0.9375rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px -2px rgba(232, 151, 79, 0.4);
        }

        .vps-cta-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px -4px rgba(232, 151, 79, 0.5);
          background: linear-gradient(135deg, #f0a35f 0%, #e8974f 100%);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .vps-cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .vps-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .vps-cta-privacy {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default ValuePropScreen;
