'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * FlareMode Section - "I'm wiped" one-tap logging feature
 *
 * Why this exists: Shows users they can still track on their worst days
 * with minimal effort. Key differentiator for energy-conscious users.
 */

interface FlareModeProps {
  onCtaClick: (ctaId?: string) => void;
}

export function FlareMode({ onCtaClick }: FlareModeProps) {
  return (
    <section
      id="flare-mode"
      className="from-bg-cream to-accent-rose/10 relative overflow-hidden bg-gradient-to-b px-4 py-16 md:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Demo Card - Left on desktop, bottom on mobile */}
          <div className="order-2 md:order-1">
            <div className="shadow-soft border-accent-rose/20 hover-lift rounded-[2.5rem] border bg-white p-6 md:p-8">
              {/* Card Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-rose/30 flex size-12 items-center justify-center rounded-xl">
                    <MaterialIcon
                      name="battery_0_bar"
                      className="text-red-600"
                    />
                  </div>
                  <div>
                    <p className="text-primary font-semibold">
                      &quot;I&apos;m wiped&quot; Mode
                    </p>
                    <p className="text-text-muted text-sm">One tap logging</p>
                  </div>
                </div>
                {/* Toggle Switch (decorative) */}
                <div className="bg-accent-rose relative h-6 w-12 rounded-full">
                  <div className="absolute right-1 top-1 size-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              {/* Flare Button Demo */}
              <div className="space-y-4">
                <button className="bg-accent-rose/20 w-full rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-3">
                    <MaterialIcon
                      name="battery_0_bar"
                      className="text-red-600"
                    />
                    <div>
                      <p className="text-primary font-semibold">
                        I&apos;m wiped
                      </p>
                      <p className="text-text-muted text-sm">
                        Log it in one tap
                      </p>
                    </div>
                  </div>
                </button>

                {/* Response Message */}
                <div className="shadow-card border-primary/5 rounded-2xl rounded-bl-none border bg-white p-4">
                  <p className="text-primary text-sm leading-relaxed">
                    Got it. I&apos;ve logged a low-energy day. Rest up — we can
                    add details later if you want.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Right on desktop, top on mobile */}
          <div className="order-1 md:order-2">
            <div className="bg-accent-rose/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <MaterialIcon name="battery_0_bar" size="sm" />
              Flare Mode
            </div>
            <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
              Log the flare without explaining your whole life.
            </h2>
            <p className="text-text-muted mb-8 text-lg">
              Designed for bad days. One tap to capture what matters — details
              can wait until you have the bandwidth.
            </p>
            <button
              onClick={() => onCtaClick('flare_mode_cta')}
              className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            >
              Turn on Flare Mode
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
