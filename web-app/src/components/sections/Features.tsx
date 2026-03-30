import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Feature } from '@/types';

/**
 * Features - Grid of product features
 *
 * Why this exists: Displays page-specific features passed via props.
 * Previously each page had hardcoded feature HTML.
 */

interface FeaturesProps {
  features: Feature[];
  title?: string;
  subtitle?: string;
}

export function Features({
  features,
  title = 'Built for chronic life',
  subtitle = 'Every feature designed with limited energy in mind',
}: FeaturesProps) {
  return (
    <section id="features" className="gradient-section px-6 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="text-accent-peach bg-accent-peach/10 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <MaterialIcon name="auto_awesome" size="sm" />
            Features
          </span>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="text-text-muted mx-auto max-w-2xl text-lg">
            {subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="shadow-card hover-lift rounded-2xl bg-white p-6"
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="bg-primary/5 flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <MaterialIcon
                    name={feature.icon}
                    size="md"
                    className="text-primary"
                  />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display text-primary mb-1 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
