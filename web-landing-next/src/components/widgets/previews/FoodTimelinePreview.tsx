'use client';

/**
 * FoodTimelinePreview - Food-symptom timeline preview for IBS/Gut domain
 *
 * Why this exists: IBS/gut issue sufferers need to track the connection
 * between what they eat and how they feel. This preview shows a timeline
 * of food intake and symptom occurrences.
 */

import { useEffect, useState } from 'react';

import { getScreen4LayoutConfig } from '@/lib/onboarding/content';

import type { PreviewComponentProps } from './FlareRiskPreview';

export function FoodTimelinePreview(_props: PreviewComponentProps) {
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
    { time: '8am', type: 'food', label: 'Breakfast', icon: '+' },
    { time: '9am', type: 'neutral', label: 'Normal', icon: null },
    { time: '11am', type: 'symptom', label: 'Bloating', icon: '!' },
    { time: '12pm', type: 'food', label: 'Lunch', icon: '+' },
    { time: '2pm', type: 'symptom', label: 'Cramping', icon: '!' },
    { time: '4pm', type: 'improving', label: 'Better', icon: '*' },
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
          color: white;
          font-weight: bold;
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

export default FoodTimelinePreview;
