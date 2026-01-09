'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * MultipleConditions Section - Managing multiple chronic conditions
 *
 * Why this exists: Many users have comorbidities. This shows the app
 * handles complexity without becoming chaotic.
 */

interface MultipleConditionsProps {
  onCtaClick: () => void;
}

const CONDITIONS = [
  'Endometriosis',
  'PCOS',
  'Long COVID',
  'Chronic Fatigue',
  'Fibromyalgia',
];

export function MultipleConditions({ onCtaClick }: MultipleConditionsProps) {
  return (
    <section className="from-accent-peach/5 to-bg-cream relative overflow-hidden bg-gradient-to-b px-4 py-16 md:px-6 md:py-24">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="bg-accent-purple/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
          <MaterialIcon name="category" size="sm" />
          Multiple Conditions
        </div>

        {/* Heading */}
        <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
          One system, many conditions—
          <br />
          without chaos.
        </h2>

        {/* Description */}
        <p className="text-text-muted mb-10 text-lg">
          Separate symptom sets per condition. Shared drivers. One timeline that
          still makes sense.
        </p>

        {/* Condition Pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {CONDITIONS.map((condition) => (
            <span
              key={condition}
              className="shadow-card border-primary/5 text-primary cursor-pointer rounded-full border bg-white px-5 py-3 font-semibold transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {condition}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCtaClick}
          className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
        >
          Set up your first focus question
          <MaterialIcon name="arrow_forward" size="sm" />
        </button>
      </div>
    </section>
  );
}
