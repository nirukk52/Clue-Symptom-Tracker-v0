import type { Feature } from '@/types';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

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
    <section id="features" className="py-20 px-6 gradient-section">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-peach bg-accent-peach/10 px-4 py-2 rounded-full mb-4">
            <MaterialIcon name="auto_awesome" size="sm" />
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-card hover-lift"
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MaterialIcon name={feature.icon} size="md" className="text-primary" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-1">
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
