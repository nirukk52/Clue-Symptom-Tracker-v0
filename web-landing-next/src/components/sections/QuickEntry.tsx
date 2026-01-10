'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * QuickEntry Section - The signature "20 seconds" feature showcase
 *
 * Why this exists: This is the hero feature for energy-conscious users.
 * It demonstrates the core value prop with an interactive-looking demo.
 */

interface QuickEntryProps {
  onCtaClick: () => void;
}

export function QuickEntry({ onCtaClick }: QuickEntryProps) {
  return (
    <section
      id="quick-checkins"
      className="gradient-section relative overflow-hidden px-4 py-16 md:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="bg-accent-peach/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="bolt" size="sm" />
            Energy-conscious design
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            20 seconds. That&apos;s it.
          </h2>
          <p className="text-text-muted text-lg">
            When brain fog hits, the last thing you need is a complex form. We
            keep it simple.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Quick Entry Demo Card - Takes 2 columns on desktop */}
          <div className="shadow-soft border-primary/5 hover-lift rounded-[2rem] border bg-white p-6 md:col-span-2">
            {/* Card Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent-peach/30 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon name="bolt" className="text-orange-700" />
              </div>
              <div>
                <p className="text-primary font-semibold">Quick Entry</p>
                <p className="text-text-muted text-sm">
                  Everything important, one screen
                </p>
              </div>
            </div>

            {/* Demo UI */}
            <div className="bg-bg-cream mb-6 rounded-2xl p-5">
              {/* Energy Question */}
              <p className="text-text-muted mb-4 text-sm font-semibold">
                How&apos;s your energy today?
              </p>
              <div className="mb-6 flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`size-10 rounded-xl text-sm font-bold transition-all ${
                      num === 4
                        ? 'bg-pill-selected border-primary text-primary border-2'
                        : 'text-text-muted hover:bg-pill-hover bg-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Top Suspects */}
              <p className="text-text-muted mb-3 text-sm font-semibold">
                Top suspects?
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-pill-selected border-primary text-primary flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-semibold">
                  Poor sleep
                  <MaterialIcon name="check" size="sm" />
                </span>
                <span className="bg-pill-selected border-primary text-primary flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-semibold">
                  Stress
                  <MaterialIcon name="check" size="sm" />
                </span>
                <span className="text-text-muted rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
                  Food
                </span>
                <span className="text-text-muted rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
                  Weather
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-text-muted flex items-center gap-2 text-sm">
                <MaterialIcon
                  name="check_circle"
                  size="sm"
                  className="text-accent-mint"
                />
                Defaults remember your patterns
              </div>
              <div className="bg-accent-mint flex items-center gap-2 rounded-xl px-4 py-2">
                <MaterialIcon name="timer" className="text-teal-800" />
                <span className="font-display font-bold text-teal-900">
                  18 sec
                </span>
              </div>
            </div>
          </div>

          {/* Why It Feels Easy Card */}
          <div className="from-accent-peach/20 to-accent-mint/20 border-accent-peach/30 hover-lift rounded-[2rem] border bg-gradient-to-br p-6">
            <h4 className="font-display text-primary mb-4 text-lg font-semibold">
              Why it feels easy
            </h4>
            <ul className="text-text-muted space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Everything important is one screen
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Defaults remember your patterns
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                No &quot;form bloat&quot; over time
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Works even on brain fog days
              </li>
            </ul>
            <button
              onClick={onCtaClick}
              className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            >
              Try Quick Entry
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
