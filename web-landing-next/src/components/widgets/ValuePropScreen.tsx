'use client';

import { useEffect, useState } from 'react';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';
import { getMicrocopy } from '@/lib/onboarding/content';

import { getLayoutComponent } from './registry';
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
 * - Carousel in middle (flexible, 3 slides: victory+baseline, promise, preview)
 * - CTA at bottom (fixed)
 */

export interface ValuePropScreenProps {
  data: ValuePropScreenData;
  onCTAClick: () => void;
  isLoading?: boolean;
}

/**
 * Compact BaselineCard for carousel slide 1
 */
function BaselineSlide({
  victory,
}: {
  victory: ValuePropScreenData['victory'];
}) {
  return (
    <div className="carousel-slide-content">
      {/* Progress header */}
      <div className="slide-header">
        <div className="victory-check">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="victory-text">
          <h3 className="slide-title">{victory.victoryMessage}</h3>
          <p className="slide-subtitle">
            {victory.stepsCompleted} of {victory.totalSteps} steps complete
          </p>
        </div>
      </div>

      {/* Baseline captured card */}
      <div className="baseline-card">
        <span className="baseline-condition">{victory.baselineData.condition}</span>
        <p className="baseline-label">{victory.baselineData.label}</p>
        <div className="baseline-value-display">
          <span className="baseline-value">{victory.baselineData.value}</span>
        </div>
        <div className="baseline-captured">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{getMicrocopy('baseline.captured.day1.v1')}</span>
        </div>
      </div>

      <style jsx>{`
        .carousel-slide-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }

        .slide-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
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
        }

        .victory-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .slide-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.3;
        }

        .slide-subtitle {
          font-size: 0.6875rem;
          color: var(--text-muted, #666);
          margin: 0;
        }

        .baseline-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.25rem;
          background: white;
          border-radius: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
        }

        .baseline-condition {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-muted, #666);
          background: rgba(32, 19, 46, 0.06);
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
        }

        .baseline-label {
          font-size: 0.875rem;
          color: var(--text-muted, #666);
          margin: 0;
          text-align: center;
        }

        .baseline-value-display {
          display: flex;
          align-items: baseline;
          gap: 0.125rem;
        }

        .baseline-value {
          font-family: var(--font-display, Georgia, serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--accent-mint, #6ee7b7);
          line-height: 1;
        }

        .baseline-captured {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--accent-mint, #10b981);
          margin-top: 0.25rem;
        }

        .baseline-captured svg {
          color: var(--accent-mint, #6ee7b7);
        }
      `}</style>
    </div>
  );
}

/**
 * Compact PromiseCard for carousel slide 2
 */
function PromiseSlide({ promise }: { promise: ValuePropScreenData['victory']['promise'] }) {
  return (
    <div className="carousel-slide-content">
      <div className="promise-card">
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
          <h3 className="promise-title">{promise.q4Value}</h3>
        </div>

        <ul className="promise-list">
          {promise.watchItems.map((item, index) => (
            <li key={index} className="promise-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .carousel-slide-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .promise-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          border: 2px solid rgba(208, 189, 244, 0.3);
        }

        .promise-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .promise-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(208, 189, 244, 0.2);
          border-radius: 0.625rem;
          color: #8b5cf6;
          flex-shrink: 0;
        }

        .promise-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.4;
        }

        .promise-list {
          list-style: none;
          margin: 0;
          padding: 0;
          padding-left: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .promise-item {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          font-size: 0.875rem;
          color: var(--primary, #20132e);
          line-height: 1.4;
        }

        .promise-item svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--accent-mint, #6ee7b7);
        }
      `}</style>
    </div>
  );
}

/**
 * Layout preview slide using domain-specific layout (simplified)
 */
function PreviewSlide({
  preview,
  badge,
}: {
  preview: ValuePropScreenData['preview'];
  badge: string;
}) {
  return (
    <div className="carousel-slide-content">
      <div className="preview-card">
        <div className="preview-header">
          <span className="preview-badge">{badge}</span>
          <span className="preview-status">
            <span className="status-dot" />
            Preview
          </span>
        </div>

        <h3 className="preview-title">{preview.headline}</h3>

        {/* Simplified graph preview */}
        <div className="preview-graph">
          {preview.graphData.days.map((day, i) => {
            const riskColors = {
              low: 'var(--accent-mint, #6ee7b7)',
              elevated: 'var(--accent-yellow, #fcd34d)',
              high: 'var(--accent-rose, #fda4af)',
            };
            return (
              <div key={i} className="graph-bar-container">
                <div
                  className="graph-bar"
                  style={{
                    height: `${day.value}%`,
                    background: riskColors[day.risk],
                  }}
                />
                <span className="graph-label">{day.date}</span>
              </div>
            );
          })}
        </div>

        <p className="preview-note">
          Your personalized insights will appear here after a week of tracking.
        </p>
      </div>

      <style jsx>{`
        .carousel-slide-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .preview-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-badge {
          font-size: 0.5625rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #7c3aed;
          background: rgba(208, 189, 244, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .preview-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.625rem;
          color: var(--text-muted, #666);
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

        .preview-title {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary, #20132e);
          margin: 0;
          line-height: 1.3;
        }

        .preview-graph {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 0.375rem;
          padding: 0.5rem 0;
          min-height: 80px;
        }

        .graph-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          height: 100%;
        }

        .graph-bar {
          width: 100%;
          border-radius: 4px 4px 2px 2px;
          transition: height 0.6s ease;
          min-height: 8px;
        }

        .graph-label {
          font-size: 0.5625rem;
          color: var(--text-muted, #666);
          font-weight: 500;
        }

        .preview-note {
          font-size: 0.6875rem;
          color: var(--text-muted, #666);
          margin: 0;
          text-align: center;
          line-height: 1.4;
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

  // Carousel slides
  const slides = [
    <BaselineSlide key="baseline" victory={data.victory} />,
    <PromiseSlide key="promise" promise={data.victory.promise} />,
    <PreviewSlide key="preview" preview={data.preview} badge={data.preview.badge} />,
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

        {/* Carousel in Middle */}
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
          opacity: 0.7;
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
          padding: 0.5rem 0;
        }

        .vps-quote-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: 1rem;
          font-weight: 500;
          color: white;
          line-height: 1.5;
          margin: 0;
          text-align: center;
        }

        /* Carousel Wrapper in Middle */
        .vps-carousel-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        /* Fixed CTA Section at Bottom */
        .vps-cta-section {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.25rem;
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
