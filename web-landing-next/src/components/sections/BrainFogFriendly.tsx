'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { BrainFogContent } from '@/types';

/**
 * BrainFogFriendly Section - Cognitive accessibility features
 *
 * Why this exists: Brain fog (cognitive dysfunction) is a hallmark of
 * Spoonie conditions. Users describe living with a "rock in my head".
 * They cannot recall if they took meds or when symptoms started.
 * An app that relies on user memory is destined to fail.
 *
 * Design: Card-based feature showcase with large icons, simple language.
 */

interface BrainFogFriendlyProps {
  content: BrainFogContent;
  onCtaClick: () => void;
}

export function BrainFogFriendly({
  content,
  onCtaClick,
}: BrainFogFriendlyProps) {
  return (
    <section
      id="brain-fog"
      className="from-bg-cream to-accent-blue/10 relative overflow-hidden bg-gradient-to-b px-4 py-16 md:px-6 md:py-24"
    >
      {/* Decorative fog effect */}
      <div className="to-accent-blue/5 pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent" />
      <div className="bg-accent-blue/10 pointer-events-none absolute -left-40 top-1/2 size-80 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="bg-accent-blue/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="psychology" size="sm" />
            Cognitive Support
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            {content.headline}
          </h2>
          <p className="text-text-muted mx-auto max-w-2xl text-lg">
            Brain fog makes remembering details impossible. We remember context
            so you don&apos;t have to.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Demo visualization */}
        <div className="mt-12">
          <div className="border-primary/5 shadow-soft mx-auto max-w-2xl rounded-[2rem] border bg-white p-6 md:p-8">
            {/* Memory Stream Demo */}
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-accent-blue/20 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon name="auto_awesome" className="text-blue-600" />
              </div>
              <div>
                <p className="text-primary font-semibold">Clue remembers</p>
                <p className="text-text-muted text-sm">
                  Context from 3 days ago
                </p>
              </div>
            </div>

            {/* Chat-style memory prompt */}
            <div className="border-primary/5 bg-accent-blue/5 rounded-2xl rounded-bl-none border p-4">
              <p className="text-primary leading-relaxed">
                You logged{' '}
                <span className="bg-accent-purple/20 rounded px-1.5 py-0.5 font-medium">
                  Poor Sleep
                </span>{' '}
                on Tuesday. Is today&apos;s{' '}
                <span className="bg-accent-rose/20 rounded px-1.5 py-0.5 font-medium">
                  migraine
                </span>{' '}
                related?
              </p>
            </div>

            {/* Pattern detected badge */}
            <div className="bg-accent-mint/20 mt-4 flex items-center gap-2 rounded-lg p-3">
              <MaterialIcon
                name="insights"
                size="sm"
                className="text-teal-600"
              />
              <span className="text-sm font-medium text-teal-800">
                Pattern Detected: 70% of your migraines follow poor sleep by 48
                hours
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={onCtaClick}
            className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
          >
            Let Clue remember for you
            <MaterialIcon name="arrow_forward" size="sm" />
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Individual feature card
 */
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  // Alternate accent colors for visual variety
  const accentColors = [
    'bg-accent-blue/20 text-blue-700',
    'bg-accent-purple/20 text-purple-700',
    'bg-accent-mint/20 text-teal-700',
    'bg-accent-peach/20 text-orange-700',
    'bg-accent-rose/20 text-red-700',
  ];
  const colorClass = accentColors[index % accentColors.length];

  return (
    <div className="hover-lift border-primary/5 shadow-soft group rounded-2xl border bg-white p-6 transition-all">
      <div
        className={`mb-4 flex size-14 items-center justify-center rounded-xl ${colorClass}`}
      >
        <MaterialIcon name={icon} size="lg" />
      </div>
      <h3 className="text-primary mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}
