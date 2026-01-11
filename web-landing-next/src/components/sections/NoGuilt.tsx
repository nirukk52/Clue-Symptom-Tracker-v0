'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { NoGuiltContent } from '@/types';

/**
 * NoGuilt Section - "We don't judge your bad days"
 *
 * Why this exists: Key differentiator from competitors. Addresses the
 * emotional toll of tracking - anxiety, guilt, feeling judged by app.
 * Users report apps with sad faces and streaks make mental health worse.
 *
 * Design: Split comparison showing "them" vs "us" approach visually.
 */

interface NoGuiltProps {
  content: NoGuiltContent;
  onCtaClick: () => void;
}

export function NoGuilt({ content, onCtaClick }: NoGuiltProps) {
  return (
    <section
      id="no-guilt"
      className="from-accent-purple/5 to-bg-cream relative overflow-hidden bg-gradient-to-b px-4 py-16 md:px-6 md:py-24"
    >
      {/* Decorative background */}
      <div className="bg-accent-purple/10 pointer-events-none absolute -right-32 top-0 size-96 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Visual Comparison - Left side */}
          <div className="order-2 md:order-1">
            <div className="grid gap-4">
              {/* "Other Apps" Card - The problem */}
              <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-600">
                  Other Apps
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">😢</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">
                          Pain Level: 8/10
                        </span>
                        <span className="text-xs text-red-500">AWFUL</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-red-200">
                        <div className="h-full w-4/5 rounded-full bg-red-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-red-100 p-2 text-sm text-red-700">
                    <MaterialIcon
                      name="warning"
                      size="sm"
                      className="text-red-500"
                    />
                    You broke your 14-day streak! 😞
                  </div>
                </div>
              </div>

              {/* "Clue" Card - Our approach */}
              <div className="border-accent-mint bg-accent-mint/10 shadow-soft rounded-2xl border-2 p-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Chronic Life
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-purple/20 flex size-8 items-center justify-center rounded-full">
                      <MaterialIcon
                        name="circle"
                        size="sm"
                        className="text-primary/60"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-primary text-sm font-medium">
                          Intensity: 8/10
                        </span>
                        <span className="text-text-muted text-xs">
                          High intensity
                        </span>
                      </div>
                      <div className="bg-accent-purple/20 h-2 w-full rounded-full">
                        <div className="bg-accent-purple h-full w-4/5 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-accent-mint/30 flex items-center gap-2 rounded-lg p-2 text-sm text-teal-800">
                    <MaterialIcon
                      name="check_circle"
                      size="sm"
                      className="text-teal-600"
                    />
                    Logged. Tough day — hope you can rest.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Right side */}
          <div className="order-1 md:order-2">
            <div className="bg-accent-purple/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <MaterialIcon name="favorite" size="sm" />
              Empathy First
            </div>

            <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
              {content.headline}
            </h2>

            <p className="text-text-muted mb-8 text-xl font-medium">
              {content.subheadline}
            </p>

            {/* Feature list */}
            <ul className="mb-8 space-y-4">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-accent-mint/40 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <MaterialIcon
                      name="check"
                      size="sm"
                      className="text-teal-700"
                    />
                  </div>
                  <span className="text-primary leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={onCtaClick}
              className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            >
              Experience guilt-free tracking
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
