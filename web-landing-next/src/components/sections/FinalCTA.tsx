'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * FinalCTA - "Save your spoons for living" closing section
 *
 * Why this exists: Powerful closing CTA that reinforces the
 * energy-conscious value prop with trust signals.
 */

interface FinalCTAProps {
  onCtaClick: (ctaId?: string) => void;
}

export function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section
      id="cta"
      className="bg-primary relative overflow-hidden px-4 py-16 md:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-white/10">
          <MaterialIcon name="bolt" size="lg" className="text-white" />
        </div>

        {/* Headline */}
        <h2 className="font-display mb-6 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
          Save your spoons for living.
        </h2>

        {/* Description */}
        <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
          Chronic Life is designed for people who measure energy in limited
          units. Log in 20 seconds, not 20 minutes.
        </p>

        {/* Secondary text */}
        <p className="mx-auto mb-10 max-w-xl text-base text-white/60 md:text-lg">
          Stop spending spoons on tracking. Start saving them for what matters.
        </p>

        {/* CTA Button */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => onCtaClick('final_cta')}
            className="text-primary flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-lg font-bold shadow-lg transition-all hover:bg-white/95 hover:shadow-xl active:scale-95 sm:w-auto"
          >
            Start a 20-second check-in
            <MaterialIcon name="arrow_forward" />
          </button>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-6 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <MaterialIcon name="lock" size="sm" />
            Your data stays private
          </span>
          <span className="flex items-center gap-2">
            <MaterialIcon name="cloud_off" size="sm" />
            Works offline
          </span>
        </div>
      </div>
    </section>
  );
}
