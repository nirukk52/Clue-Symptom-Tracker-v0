'use client';

/**
 * FoodTimelinePreview - Food-symptom timeline preview for IBS/Gut domain
 *
 * Why this exists: IBS/gut issue sufferers need to track the connection
 * between what they eat and how they feel. This preview shows a timeline
 * of food intake and symptom occurrences.
 *
 * Visual Identity: Purple/violet theme on dark glass with timeline glow effect
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
    { time: '8am', type: 'food', label: 'Breakfast', icon: '🥣' },
    { time: '9am', type: 'neutral', label: 'Normal', icon: null },
    { time: '11am', type: 'symptom', label: 'Bloating', icon: '⚡' },
    { time: '12pm', type: 'food', label: 'Lunch', icon: '🥗' },
    { time: '2pm', type: 'symptom', label: 'Cramping', icon: '⚡' },
    { time: '4pm', type: 'improving', label: 'Better', icon: '✓' },
  ];

  return (
    <div className="timeline-container">
      {/* Ambient glow */}
      <div className="ambient-glow" />

      {/* Timeline track */}
      <div className="timeline-track">
        {/* Connecting line */}
        <div className={`timeline-line ${animated ? 'animated' : ''}`} />

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
      </div>

      {/* Insight callout */}
      <div className="insight-callout">
        <div className="callout-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(25, 15, 35, 0.95) 0%,
            rgba(40, 25, 55, 0.9) 50%,
            rgba(25, 15, 35, 0.95) 100%
          );
          border-radius: 1rem;
          padding: 0.875rem;
          border: 1px solid rgba(167, 139, 250, 0.2);
          box-shadow:
            0 0 40px rgba(167, 139, 250, 0.08),
            inset 0 1px 0 rgba(167, 139, 250, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow: hidden;
        }

        .ambient-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            ellipse at 0% 50%,
            rgba(167, 139, 250, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
        }

        .timeline-track {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          position: relative;
          padding-left: 1.5rem;
          z-index: 1;
        }

        .timeline-line {
          position: absolute;
          left: 9px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            #34D399,
            #A78BFA,
            #F472B6,
            #34D399
          );
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.8s ease;
          border-radius: 1px;
          box-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
        }

        .timeline-line.animated {
          transform: scaleY(1);
        }

        .timeline-event {
          display: flex;
          align-items: center;
          gap: 0.625rem;
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
          width: 20px;
          height: 20px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -1.5rem;
          font-size: 0.625rem;
        }

        .event-dot.food {
          background: linear-gradient(135deg, #34D399 0%, #059669 100%);
          box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
        }

        .event-dot.symptom {
          background: linear-gradient(135deg, #F472B6 0%, #DB2777 100%);
          box-shadow: 0 0 12px rgba(244, 114, 182, 0.5);
        }

        .event-dot.neutral {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
          border: 1px solid rgba(167, 139, 250, 0.4);
        }

        .event-dot.improving {
          background: linear-gradient(135deg, #34D399 0%, #059669 100%);
          box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
        }

        .event-icon {
          font-size: 0.625rem;
          line-height: 1;
        }

        .event-details {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .event-time {
          font-size: 0.625rem;
          color: rgba(167, 139, 250, 0.8);
          min-width: 28px;
          font-weight: 600;
        }

        .event-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .insight-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(167, 139, 250, 0.12) 0%,
            rgba(139, 92, 246, 0.06) 100%
          );
          border-radius: 0.625rem;
          border: 1px solid rgba(167, 139, 250, 0.2);
          position: relative;
          z-index: 1;
        }

        .callout-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(167, 139, 250, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A78BFA;
        }

        .callout-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .callout-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
        }

        .callout-content p {
          margin: 0;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default FoodTimelinePreview;
