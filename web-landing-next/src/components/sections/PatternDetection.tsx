'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * PatternDetection Section - Top Suspects Feature
 *
 * Why this exists: This is the core differentiator for the "Top Suspect" product.
 * Shows how the app detects correlations between triggers and symptoms.
 * The ranked suspects list with confidence percentages is key to the value prop.
 */

interface PatternDetectionProps {
  onCtaClick: () => void;
}

/** Suspect data for the visualization */
const SUSPECTS = [
  { emoji: '🌙', name: 'Poor Sleep', correlation: 78, severity: 'high' },
  { emoji: '😰', name: 'High Stress', correlation: 65, severity: 'medium' },
  { emoji: '🍕', name: 'Food (Dairy)', correlation: 23, severity: 'low' },
] as const;

/** Get color classes based on correlation severity */
function getCorrelationStyles(severity: 'high' | 'medium' | 'low') {
  const styles = {
    high: {
      badge: 'bg-accent-rose/30 text-red-700',
      bar: 'bg-accent-rose',
    },
    medium: {
      badge: 'bg-yellow-200/50 text-yellow-700',
      bar: 'bg-yellow-400',
    },
    low: {
      badge: 'bg-accent-mint/30 text-teal-700',
      bar: 'bg-accent-mint',
    },
  };
  return styles[severity];
}

export function PatternDetection({ onCtaClick }: PatternDetectionProps) {
  return (
    <section
      id="patterns"
      className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24"
      style={{
        background:
          'linear-gradient(180deg, #fdfbf9 0%, rgba(164, 200, 216, 0.1) 100%)',
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="bg-accent-peach/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="search" size="sm" />
            Pattern detection
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            Connect the dots your brain can&apos;t.
          </h2>
          <p className="text-text-muted text-lg">
            Track sleep, stress, food, and cycle. Let the app find the hidden
            connections.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Top Suspects Card - Spans 2 columns */}
          <div className="shadow-soft border-primary/5 hover-lift rounded-[2rem] border bg-white p-6 md:col-span-2">
            {/* Card Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent-peach/30 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon name="search" className="text-orange-700" />
              </div>
              <div>
                <p className="text-primary font-semibold">
                  This Week&apos;s Top Suspects
                </p>
                <p className="text-text-muted text-sm">
                  Based on 14 days of tracking
                </p>
              </div>
            </div>

            {/* Suspects List */}
            <div className="mb-6 space-y-4">
              {SUSPECTS.map((suspect) => {
                const styles = getCorrelationStyles(suspect.severity);
                return (
                  <div
                    key={suspect.name}
                    className="bg-bg-cream rounded-2xl p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{suspect.emoji}</span>
                        <span className="text-primary font-semibold">
                          {suspect.name}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${styles.badge}`}
                      >
                        {suspect.correlation}%
                      </span>
                    </div>
                    {/* Correlation Bar */}
                    <div className="h-2 overflow-hidden rounded-full bg-white/50">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{ width: `${suspect.correlation}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight Quote */}
            <div className="bg-accent-purple/10 border-accent-purple/20 rounded-2xl border p-4">
              <p className="text-primary text-sm leading-relaxed">
                <span className="font-semibold">
                  &quot;Your fatigue spikes 40%
                </span>{' '}
                on days after less than 6 hours of sleep.&quot;
              </p>
            </div>
          </div>

          {/* Evidence Sidebar */}
          <div
            className="border-accent-peach/30 hover-lift rounded-[2rem] border p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(232, 151, 79, 0.2) 0%, rgba(208, 189, 244, 0.2) 100%)',
            }}
          >
            <h4 className="font-display text-primary mb-4 text-lg font-semibold">
              Evidence, not guessing
            </h4>
            <ul className="text-text-muted space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Rank triggers by correlation strength
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Spot patterns across weeks
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Test your theories with data
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-peach mt-0.5"
                />
                Share evidence with doctors
              </li>
            </ul>
            <button
              onClick={onCtaClick}
              className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            >
              Find my triggers
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
