'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * EnergyPacing - Crash prevention focus section
 *
 * Why it exists: Shows the energy budget/pacing feature that helps users
 * know when to push vs rest. Specific to crash-prevention landing page.
 */

interface EnergyPacingProps {
  onCtaClick: (ctaId?: string) => void;
}

export function EnergyPacing({ onCtaClick }: EnergyPacingProps) {
  return (
    <section
      id="pacing"
      className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24"
      style={{
        background:
          'linear-gradient(180deg, #fdfbf9 0%, rgba(164, 200, 216, 0.1) 100%)',
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="bg-accent-mint/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="battery_horiz_075" size="sm" />
            Energy pacing
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            Stop paying tomorrow for what you did today.
          </h2>
          <p className="text-text-muted text-lg">
            Wake up knowing if today is a push day or a rest day. The app reads
            your patterns.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Energy Budget Card - Spans 2 columns */}
          <div className="shadow-soft border-primary/5 hover-lift rounded-[2rem] border bg-white p-6 md:col-span-2">
            {/* Card Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent-mint/30 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon
                  name="battery_horiz_075"
                  className="text-teal-700"
                />
              </div>
              <div>
                <p className="text-primary font-semibold">
                  Today&apos;s Energy Budget
                </p>
                <p className="text-text-muted text-sm">
                  Based on your recent patterns
                </p>
              </div>
            </div>

            {/* Energy Gauge */}
            <div className="bg-bg-cream mb-6 rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-primary font-semibold">
                  Current Level
                </span>
                <span className="rounded-full bg-yellow-200/50 px-3 py-1 text-sm font-bold text-yellow-700">
                  58%
                </span>
              </div>
              <div className="relative mb-3 h-4 overflow-hidden rounded-lg bg-black/10">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: '58%',
                    background:
                      'linear-gradient(90deg, #b8e3d6 0%, #f5e6a3 70%, #f4c4c4 100%)',
                  }}
                />
              </div>
              <div className="text-text-muted flex justify-between text-xs">
                <span>Rest needed</span>
                <span>Careful</span>
                <span>Good to go</span>
              </div>
            </div>

            {/* Today's Recommendation */}
            <div className="rounded-2xl border border-yellow-200/50 bg-yellow-50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <MaterialIcon name="info" className="text-yellow-600" />
                <span className="text-primary font-semibold">
                  Today is a REST day
                </span>
              </div>
              <p className="text-text-muted mb-4 text-sm">
                Based on: Poor sleep last night + high activity yesterday
              </p>
              <div className="space-y-2">
                <div className="text-text-muted flex items-center gap-2 text-sm">
                  <MaterialIcon
                    name="check_circle"
                    size="sm"
                    className="text-accent-mint"
                  />
                  Light activity only
                </div>
                <div className="text-text-muted flex items-center gap-2 text-sm">
                  <MaterialIcon
                    name="check_circle"
                    size="sm"
                    className="text-accent-mint"
                  />
                  Cancel non-essential plans
                </div>
                <div className="text-text-muted flex items-center gap-2 text-sm">
                  <MaterialIcon
                    name="check_circle"
                    size="sm"
                    className="text-accent-mint"
                  />
                  Early bedtime tonight
                </div>
              </div>
            </div>
          </div>

          {/* Break the cycle sidebar */}
          <div
            className="border-accent-mint/30 hover-lift rounded-[2rem] border p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(184, 227, 214, 0.2) 0%, rgba(164, 200, 216, 0.2) 100%)',
            }}
          >
            <h4 className="font-display text-primary mb-4 text-lg font-semibold">
              Break the cycle
            </h4>
            <ul className="text-text-muted space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-mint mt-0.5"
                />
                Know your limits before you crash
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-mint mt-0.5"
                />
                Daily push/rest recommendations
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-mint mt-0.5"
                />
                Learn your personal patterns
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon
                  name="check"
                  size="sm"
                  className="text-accent-mint mt-0.5"
                />
                Reduce post-exertional crashes
              </li>
            </ul>
            <button
              onClick={() => onCtaClick('energy_pacing_cta')}
              className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            >
              See my energy budget
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
