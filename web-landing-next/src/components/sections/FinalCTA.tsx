'use client';

import { Button } from '@/components/ui/Button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * FinalCTA - Bottom section with final call to action
 *
 * Why this exists: Consistent CTA section at the bottom of all landing pages.
 */

interface FinalCTAProps {
  onCtaClick: () => void;
  headline?: string;
  subheadline?: string;
}

export function FinalCTA({
  onCtaClick,
  headline = 'Ready to stop guessing?',
  subheadline = 'Join the waitlist and be first to know when we launch.',
}: FinalCTAProps) {
  return (
    <section className="py-20 px-6 bg-primary text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MaterialIcon name="rocket_launch" size="lg" className="text-accent-yellow" />
        </div>

        {/* Content */}
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
          {headline}
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          {subheadline}
        </p>

        {/* CTA */}
        <Button
          variant="hero"
          onClick={onCtaClick}
          icon="arrow_forward"
          data-modal-trigger
          data-cta-id="final_cta"
          data-cta-text="Get early access"
        >
          Get early access
        </Button>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <MaterialIcon name="lock" size="sm" />
            Your data stays yours
          </span>
          <span className="flex items-center gap-2">
            <MaterialIcon name="mail" size="sm" />
            No spam, ever
          </span>
          <span className="flex items-center gap-2">
            <MaterialIcon name="favorite" size="sm" />
            Built with chronic illness
          </span>
        </div>
      </div>
    </section>
  );
}
