'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * PredictiveInsights Section - Lag Effect Detection Feature
 *
 * Why this exists: This is the core differentiator for the "Flare Forecast" product.
 * Shows how the app detects the 24-48 hour delay between triggers and flares.
 * The timeline visualization is key to communicating the prediction value prop.
 */

interface PredictiveInsightsProps {
  onCtaClick: (ctaId?: string) => void;
}

export function PredictiveInsights({ onCtaClick }: PredictiveInsightsProps) {
  return (
    <section
      id="insights"
      className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24"
      style={{
        background:
          'linear-gradient(180deg, #fdfbf9 0%, rgba(164, 200, 216, 0.1) 100%)',
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="bg-accent-purple/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="psychology" size="sm" />
            Predictive insights
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            Your body has a 24-48 hour delay. We track it.
          </h2>
          <p className="text-text-muted text-lg">
            Most flares don&apos;t appear immediately after a trigger. Chronic
            Life learns your body&apos;s lag effect.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Main Insight Card - Spans 2 columns */}
          <div className="shadow-soft border-primary/5 hover-lift rounded-[2rem] border bg-white p-6 md:col-span-2">
            {/* Card Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-accent-purple/30 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon name="trending_up" className="text-purple-700" />
              </div>
              <div>
                <p className="text-primary font-semibold">
                  Lag Effect Detected
                </p>
                <p className="text-text-muted text-sm">
                  Based on 12 flare episodes
                </p>
              </div>
            </div>

            {/* Insight Message */}
            <div className="bg-bg-cream mb-4 rounded-2xl p-5">
              <p className="text-primary text-lg leading-relaxed">
                <span className="font-semibold">
                  Your flares typically appear 24-48 hours
                </span>{' '}
                after poor sleep + stress, not immediately.
              </p>
            </div>

            {/* Timeline Visual */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-accent-blue size-3 rounded-full" />
                <span className="text-text-muted">Trigger (Day 1)</span>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gray-200 sm:block" />
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-yellow-400" />
                <span className="text-text-muted">Warning (Day 2)</span>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gray-200 sm:block" />
              <div className="flex items-center gap-2">
                <div className="bg-accent-rose size-3 rounded-full" />
                <span className="text-text-muted">Flare (Day 2-3)</span>
              </div>
            </div>
          </div>

          {/* Why This Matters Sidebar */}
          <div
            className="border-accent-purple/30 hover-lift rounded-[2rem] border p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(208, 189, 244, 0.2) 0%, rgba(244, 196, 196, 0.2) 100%)',
            }}
          >
            <h4 className="font-display text-primary mb-4 text-lg font-semibold">
              Why this matters
            </h4>
            <ul className="text-text-muted space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-purple mt-0.5"
                />
                Intervene before symptoms peak
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-purple mt-0.5"
                />
                Prepare rescue strategies
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-purple mt-0.5"
                />
                Reduce flare severity
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-purple mt-0.5"
                />
                Break the boom-bust cycle
              </li>
            </ul>
            <button
              onClick={() => onCtaClick('predictive_insights_cta')}
              className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            >
              See prediction in action
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
