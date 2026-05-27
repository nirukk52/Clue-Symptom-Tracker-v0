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
    description:
      "Answer 3-4 questions about how you're feeling. Takes 20 seconds.",
  },
  {
    number: '02',
    icon: 'psychology',
    title: 'We find patterns',
    description: "Your app learns your body's signals and connects the dots.",
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
    <section id="how-it-works" className="bg-bg-cream px-6 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="text-accent-purple bg-accent-purple/10 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <MaterialIcon name="play_circle" size="sm" />
            How it works
          </span>
          <h2 className="font-display text-primary text-3xl font-semibold md:text-4xl lg:text-5xl">
            Simple enough for your worst days
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step number */}
              <span className="font-display text-primary/5 absolute -left-2 -top-4 text-6xl font-bold">
                {step.number}
              </span>

              {/* Icon */}
              <div className="bg-accent-purple/10 relative z-10 mb-4 flex size-14 items-center justify-center rounded-2xl">
                <MaterialIcon
                  name={step.icon}
                  size="lg"
                  className="text-accent-purple"
                />
              </div>

              {/* Content */}
              <h3 className="font-display text-primary mb-2 text-xl font-semibold">
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
