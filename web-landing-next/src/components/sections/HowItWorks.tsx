import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * HowItWorks - 3-step explanation section
 *
 * Why this exists: Shows the simple tracking flow across all landing pages.
 */

const steps = [
  {
    number: '01',
    icon: 'touch_app',
    title: 'Quick check-in',
    description: 'Answer 3-4 questions about how you\'re feeling. Takes 20 seconds.',
  },
  {
    number: '02',
    icon: 'psychology',
    title: 'We find patterns',
    description: 'Your app learns your body\'s signals and connects the dots.',
  },
  {
    number: '03',
    icon: 'notifications_active',
    title: 'Get ahead of flares',
    description: 'Receive warnings before symptoms hit, so you can prepare.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-bg-cream">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-purple bg-accent-purple/10 px-4 py-2 rounded-full mb-4">
            <MaterialIcon name="play_circle" size="sm" />
            How it works
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary">
            Simple enough for your worst days
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step number */}
              <span className="text-6xl font-display font-bold text-primary/5 absolute -top-4 -left-2">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 bg-accent-purple/10 rounded-2xl flex items-center justify-center mb-4 relative z-10">
                <MaterialIcon name={step.icon} size="lg" className="text-accent-purple" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
