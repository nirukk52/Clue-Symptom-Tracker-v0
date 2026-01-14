'use client';

/**
 * IBSGutLayout - Food-symptom correlation focused layout
 *
 * Why this exists: IBS/gut issue sufferers need to track the connection
 * between what they eat and how they feel. This layout emphasizes
 * food-symptom timelines and gut health patterns.
 *
 * Visual focus: Food diary correlation with gut symptoms
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  FlareRiskData,
  PromiseData,
  VictoryProps,
} from '@/backend/agents/onboarding/types';
import {
  formatTemplate,
  getMicrocopy,
  getScreen4LayoutConfig,
} from '@/lib/onboarding/content';

import { BaselineCard } from '../shared/BaselineCard';
import { PromiseCard } from '../shared/PromiseCard';

interface IBSGutLayoutProps {
  victory: VictoryProps;
  preview: {
    headline: string;
    watchItems: [string, string, string];
    graphData: FlareRiskData;
    badge: string;
  };
  cta: {
    text: string;
    action: 'google_signin';
  };
  onCTAClick: () => void;
  isLoading?: boolean;
}

/**
 * IBSGutCarousel - Compact 3-step carousel for Screen 4 (IBS/Gut)
 *
 * Why this exists: The summary modal has a fixed height. The IBS layout has
 * multiple "proof" cards (progress, baseline, promise, preview). A horizontal
 * carousel keeps everything inside the modal while still letting users see all
 * the content with a low-effort swipe.
 */
function IBSGutCarousel({
  victory,
  promise,
  previewBadge,
}: {
  victory: VictoryProps;
  promise: PromiseData;
  previewBadge: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Why this exists: Converts horizontal scroll position into a stable slide
   * index so we can render subtle progress indicators.
   */
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    const nextIndex = Math.max(
      0,
      Math.min(2, Math.round(el.scrollLeft / width))
    );
    setActiveIndex(nextIndex);
  }, []);

  /**
   * Why this exists: Allows tapping a dot to navigate without requiring drag.
   */
  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    el.scrollTo({ left: index * width, behavior: 'smooth' });
  }, []);

  return (
    <div className="ibs-carousel">
      <div
        className="ibs-carousel-track"
        ref={scrollerRef}
        onScroll={handleScroll}
        role="region"
        aria-label="Your setup summary"
      >
        {/* Slide 1: progress + baseline */}
        <div className="ibs-slide">
          <div className="ibs-card">
            <div className="victory-header">
              <div className="victory-check" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
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
              <div className="victory-text">
                <h2 className="victory-title">{victory.victoryMessage}</h2>
                <p className="victory-steps">
                  {formatTemplate(
                    getMicrocopy('screen4.steps_complete_template.v1'),
                    {
                      done: String(victory.stepsCompleted),
                      total: String(victory.totalSteps),
                    }
                  )}
                </p>
              </div>
            </div>

            <BaselineCard baseline={victory.baselineData} />
          </div>
        </div>

        {/* Slide 2: promise */}
        <div className="ibs-slide">
          <div className="ibs-card">
            <PromiseCard promise={promise} />
          </div>
        </div>

        {/* Slide 3: IBS preview */}
        <div className="ibs-slide">
          <div className="ibs-card preview-card">
            <div className="preview-header">
              <span className="preview-badge">{previewBadge}</span>
            </div>
            <FoodSymptomTimeline />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div
        className="ibs-carousel-dots"
        role="tablist"
        aria-label="Carousel steps"
      >
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            className={`ibs-dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to step ${idx + 1}`}
            aria-current={idx === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>

      <style jsx>{`
        .ibs-carousel {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 0;
        }

        .ibs-carousel-track {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          border-radius: 1.25rem;
        }

        .ibs-carousel-track::-webkit-scrollbar {
          display: none;
        }

        .ibs-slide {
          flex: 0 0 100%;
          scroll-snap-align: start;
          padding: 0.125rem;
        }

        .ibs-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ibs-carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.375rem;
        }

        .ibs-dot {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 9999px;
          border: none;
          background: rgba(255, 255, 255, 0.35);
          transition:
            width 0.25s ease,
            background 0.25s ease;
          cursor: pointer;
        }

        .ibs-dot.active {
          width: 1.25rem;
          background: rgba(255, 255, 255, 0.75);
        }

        /* Victory header (compact, reused from VictorySection visual language) */
        .victory-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 0.75rem 0.625rem;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.06);
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
          min-width: 0;
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

        /* Keep the existing badge styling for continuity */
        .preview-card {
          background: rgba(232, 151, 79, 0.08);
          border-radius: 1.25rem;
          border: 1px solid rgba(232, 151, 79, 0.2);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-badge {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #c2410c;
          background: rgba(232, 151, 79, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        @media (prefers-reduced-motion: reduce) {
          .ibs-dot,
          .ibs-dot.active {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Food-symptom timeline preview
 */
function FoodSymptomTimeline() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const copy = getScreen4LayoutConfig<{
    timeline_events?: {
      time: string;
      type: string;
      label: string;
      icon: string | null;
    }[];
    callout_title?: string;
    callout_body?: string;
  }>('ibs_gut');

  const events = copy.timeline_events ?? [
    { time: '8am', type: 'food', label: 'Breakfast', icon: '🥣' },
    { time: '9am', type: 'neutral', label: 'Normal', icon: null },
    { time: '11am', type: 'symptom', label: 'Bloating', icon: '⚡' },
    { time: '12pm', type: 'food', label: 'Lunch', icon: '🥗' },
    { time: '2pm', type: 'symptom', label: 'Cramping', icon: '⚡' },
    { time: '4pm', type: 'improving', label: 'Better', icon: '✓' },
  ];

  return (
    <div className="timeline-container">
      {/* Timeline track */}
      <div className="timeline-track">
        {events.map((event, i) => (
          <div
            key={i}
            className={`timeline-event ${event.type} ${animated ? 'animated' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`event-dot ${event.type}`}>
              {event.icon && <span className="event-icon">{event.icon}</span>}
            </div>
            <div className="event-details">
              <span className="event-time">{event.time}</span>
              <span className="event-label">{event.label}</span>
            </div>
          </div>
        ))}

        {/* Connecting line */}
        <div className={`timeline-line ${animated ? 'animated' : ''}`} />
      </div>

      {/* Insight callout */}
      <div className="insight-callout">
        <div className="callout-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8" />
            <path d="M3 16.2V21h4.8" />
            <path d="M21 7.8V3h-4.8" />
            <path d="M3 3l6 6" />
            <path d="M3 7.8V3h4.8" />
          </svg>
        </div>
        <div className="callout-content">
          <span className="callout-title">
            {copy.callout_title ?? 'Food-symptom connections'}
          </span>
          <p>
            {copy.callout_body ??
              "We'll help you spot which foods trigger reactions"}
          </p>
        </div>
      </div>

      <style jsx>{`
        .timeline-container {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(32, 19, 46, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-track {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
          padding-left: 1.25rem;
        }

        .timeline-line {
          position: absolute;
          left: 6px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            var(--accent-mint, #6ee7b7),
            var(--accent-yellow, #fcd34d),
            var(--accent-rose, #fda4af),
            var(--accent-mint, #6ee7b7)
          );
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.8s ease;
        }

        .timeline-line.animated {
          transform: scaleY(1);
        }

        .timeline-event {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateX(-10px);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }

        .timeline-event.animated {
          opacity: 1;
          transform: translateX(0);
        }

        .event-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -1.25rem;
        }

        .event-dot.food {
          background: var(--accent-mint, #6ee7b7);
        }

        .event-dot.symptom {
          background: var(--accent-rose, #fda4af);
        }

        .event-dot.neutral {
          background: rgba(32, 19, 46, 0.1);
        }

        .event-dot.improving {
          background: var(--accent-mint, #6ee7b7);
        }

        .event-icon {
          font-size: 0.5rem;
        }

        .event-details {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .event-time {
          font-size: 0.6875rem;
          color: var(--text-muted, #666666);
          min-width: 32px;
        }

        .event-label {
          font-size: 0.75rem;
          color: var(--primary, #20132e);
          font-weight: 500;
        }

        .insight-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(232, 151, 79, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(232, 151, 79, 0.2);
        }

        .callout-icon {
          flex-shrink: 0;
          color: #c2410c;
        }

        .callout-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .callout-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--primary, #20132e);
        }

        .callout-content p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted, #666666);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export function IBSGutLayout({
  victory,
  preview,
  cta,
  onCTAClick,
  isLoading,
}: IBSGutLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Build promise data from preview
  const promiseData: PromiseData = {
    headline: preview.headline,
    q4Value: victory.promise.q4Value,
    watchItems: preview.watchItems,
  };

  return (
    <div className={`ibs-gut-layout ${isVisible ? 'visible' : ''}`}>
      {/* Carousel: the three "proof" items above the CTA */}
      <div className="content-area">
        <IBSGutCarousel
          victory={victory}
          promise={promiseData}
          previewBadge={preview.badge}
        />
      </div>

      {/* CTA */}
      <div className="cta-section">
        <button
          className="cta-button"
          onClick={onCTAClick}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              {getMicrocopy('cta.connecting.v1')}
            </>
          ) : (
            <>
              {cta.text}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p className="privacy-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          {getMicrocopy('privacy_note.v1')}
        </p>
      </div>

      <style jsx>{`
        .ibs-gut-layout {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
        }

        .ibs-gut-layout.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .content-area {
          flex: 1;
          min-height: 0;
        }

        .cta-section {
          /* Why: Pin CTA + privacy to the bottom of the modal content so the
             carousel can be browsed without the primary action moving around. */
          position: sticky;
          bottom: 0;
          z-index: 5;
          margin: 0 -1.5rem;
          padding: 1.25rem 1.5rem 1rem; /* bottom = 16px above modal bottom */
          background: linear-gradient(
            to top,
            rgba(32, 19, 46, 0.85) 0%,
            rgba(32, 19, 46, 0.55) 45%,
            rgba(32, 19, 46, 0) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem; /* CTA is 8px above privacy note */
        }

        .cta-button {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 9999px;
          background: var(--primary, #20132e);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px -2px rgba(32, 20, 46, 0.2);
        }

        .cta-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(32, 20, 46, 0.25);
        }

        .cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
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

        .privacy-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default IBSGutLayout;
