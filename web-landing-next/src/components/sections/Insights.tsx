'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * Insights Section - "No vibes. Only receipts." evidence-backed patterns
 *
 * Why this exists: Differentiates from vague wellness apps by showing
 * that all claims are backed by actual user data. Builds trust.
 */

interface InsightsProps {
  onCtaClick: () => void;
}

export function Insights({ onCtaClick }: InsightsProps) {
  return (
    <section
      id="insights"
      className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Text Content - Left side */}
          <div>
            <div className="bg-accent-purple/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <MaterialIcon name="psychology" size="sm" />
              Evidence-backed insights
            </div>
            <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
              No vibes. Only receipts.
            </h2>
            <p className="text-text-muted mb-8 text-lg">
              Chronic Life only calls a pattern when it can show the data behind
              it. No vague claims.
            </p>
            <button
              onClick={onCtaClick}
              className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            >
              See an example insight
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>

          {/* Pattern Card - Right side */}
          <div className="relative">
            <div className="bg-bg-cream shadow-soft border-primary/5 hover-lift rounded-[2.5rem] border p-6 md:p-8">
              <div className="shadow-card rounded-2xl bg-white p-6">
                {/* Card Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-accent-purple/30 flex size-10 items-center justify-center rounded-xl">
                    <MaterialIcon
                      name="trending_up"
                      className="text-purple-700"
                    />
                  </div>
                  <div>
                    <p className="text-primary font-semibold">
                      Pattern Detected
                    </p>
                    <p className="text-text-muted text-sm">
                      Based on 14 data points
                    </p>
                  </div>
                </div>

                {/* Insight Content */}
                <div className="bg-bg-cream mb-4 rounded-xl p-4">
                  <p className="text-primary leading-relaxed">
                    <span className="font-semibold">
                      &quot;Your fatigue increases 40%
                    </span>{' '}
                    on days following less than 6 hours of sleep.&quot;
                  </p>
                </div>

                {/* Meta Info */}
                <div className="text-text-muted flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <MaterialIcon name="calendar_month" size="sm" />
                    Dec 10-24, 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <MaterialIcon name="verified" size="sm" />
                    High confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
