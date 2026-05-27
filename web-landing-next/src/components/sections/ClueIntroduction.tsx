'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * ClueIntroduction Section - Chat Agent showcase
 *
 * Why this exists: Shows what makes a chat-based symptom tracker different.
 * Users with chronic illness need to understand: this isn't another form app.
 * It's a conversational companion that remembers context and adapts.
 *
 * Key differentiators from other trackers:
 * - Chat-first (not form-first)
 * - Voice notes when typing is hard
 * - Context/memory remembering
 * - Quick-tap widgets (one tap logging)
 * - Adapts to energy levels (flare mode)
 */

interface ClueIntroductionProps {
  onCtaClick: (ctaId?: string) => void;
}

export function ClueIntroduction({ onCtaClick }: ClueIntroductionProps) {
  return (
    <section
      id="meet-clue"
      className="from-bg-cream to-accent-purple/10 relative overflow-hidden bg-gradient-to-b px-4 py-16 md:px-6 md:py-24"
    >
      {/* Decorative elements */}
      <div className="to-accent-purple/5 pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent" />
      <div className="bg-accent-purple/10 pointer-events-none absolute -right-40 top-1/3 size-80 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="bg-accent-purple/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <MaterialIcon name="chat_bubble" size="sm" />
            Meet Your Symptom Companion
          </div>
          <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
            Chat, don&apos;t fill forms.
          </h2>
          <p className="text-text-muted mx-auto max-w-2xl text-lg">
            Clue is a conversational tracker that remembers your patterns,
            adapts to your energy, and lets you log with a tap or your voice.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mb-12 grid gap-6">
          {/* Chat Demo Card - Full width now */}
          <div className="shadow-soft border-primary/5 hover-lift rounded-[2rem] border bg-white p-6">
            {/* Card Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent-purple/30 flex size-10 items-center justify-center rounded-xl">
                <MaterialIcon name="smart_toy" className="text-purple-700" />
              </div>
              <div>
                <p className="text-primary font-semibold">Chat with Clue</p>
                <p className="text-text-muted text-sm">
                  Like texting a friend who never forgets
                </p>
              </div>
            </div>

            {/* Chat Demo UI */}
            <div className="bg-bg-cream space-y-4 rounded-2xl p-4">
              {/* Voice Note from User */}
              <div className="flex justify-end">
                <div className="bg-primary max-w-[80%] rounded-3xl rounded-br-none px-5 py-3">
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      name="mic"
                      size="sm"
                      className="text-white/80"
                    />
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '10px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '16px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '8px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '14px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '18px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '12px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '9px' }}
                      />
                      <div
                        className="w-1 rounded-full bg-white/60"
                        style={{ height: '15px' }}
                      />
                    </div>
                    <span className="text-xs text-white/70">0:04</span>
                  </div>
                  <p className="mt-2 text-sm italic text-white/90">
                    &quot;Woke up with a headache, feeling wiped...&quot;
                  </p>
                </div>
              </div>

              {/* Clue Response with Context */}
              <div className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                  {/* Memory indicator */}
                  <div className="text-text-muted flex items-center gap-2 text-xs">
                    <MaterialIcon
                      name="history"
                      size="sm"
                      className="text-accent-purple"
                    />
                    <span>Remembering last 3 days...</span>
                  </div>

                  <div className="border-primary/5 rounded-3xl rounded-bl-none border bg-white px-5 py-4 shadow-sm">
                    <p className="text-primary leading-relaxed">
                      Got it. You logged{' '}
                      <span className="bg-accent-blue/20 rounded px-1.5 py-0.5 font-medium">
                        poor sleep
                      </span>{' '}
                      last night and{' '}
                      <span className="bg-accent-peach/30 rounded px-1.5 py-0.5 font-medium">
                        high stress
                      </span>{' '}
                      yesterday. Let me capture today:
                    </p>
                  </div>

                  {/* Quick Widgets */}
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-pill-selected border-primary text-primary flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium">
                      <MaterialIcon name="check" size="sm" />
                      Headache
                    </button>
                    <button className="text-text-muted flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm">
                      Fatigue
                    </button>
                    <button className="text-text-muted flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm">
                      Brain fog
                    </button>
                    <button className="text-primary border-primary/30 flex items-center gap-1 rounded-full border border-dashed bg-white px-4 py-2 text-sm">
                      <MaterialIcon name="add" size="sm" />
                      Other
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Severity slider - Full width, outside chat bubble */}
            <div className="from-accent-mint/20 via-accent-peach/20 to-accent-rose/30 mt-4 rounded-2xl bg-gradient-to-r p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-primary text-sm font-medium">
                  How bad is the headache?
                </p>
                <span className="text-primary rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm">
                  6/10
                </span>
              </div>

              {/* Visual slider track */}
              <div className="relative">
                {/* Background track with gradient */}
                <div className="from-accent-mint via-accent-peach to-accent-rose h-3 w-full rounded-full bg-gradient-to-r" />

                {/* Filled portion */}
                <div
                  className="from-accent-mint via-accent-peach to-accent-peach absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r"
                  style={{ width: '60%' }}
                />

                {/* Thumb */}
                <div
                  className="bg-accent-peach absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                  style={{ left: 'calc(60% - 10px)' }}
                />
              </div>

              {/* Labels */}
              <div className="text-text-muted mt-2 flex justify-between text-xs">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-text-muted flex items-center gap-2 text-sm">
                <MaterialIcon
                  name="auto_awesome"
                  size="sm"
                  className="text-accent-purple"
                />
                Clue extracts structure from natural language
              </div>
            </div>
          </div>

          {/* Key Features Card - Hidden for now */}
          {/* <div className="from-accent-purple/20 to-accent-blue/20 border-accent-purple/30 hover-lift space-y-4 rounded-[2rem] border bg-gradient-to-br p-6">
            <h4 className="font-display text-primary text-lg font-semibold">
              Not your typical tracker
            </h4>

            <div className="space-y-4">
              <FeatureItem
                icon="touch_app"
                title="One-tap logging"
                description="Widgets adapt to your data. Just tap."
                color="text-purple-700"
              />
              <FeatureItem
                icon="mic"
                title="Voice notes"
                description="Talk when typing feels impossible."
                color="text-blue-700"
              />
              <FeatureItem
                icon="psychology"
                title="Context memory"
                description="Clue connects yesterday to today."
                color="text-teal-700"
              />
              <FeatureItem
                icon="tune"
                title="Adapts to you"
                description="Flare mode = less questions, more care."
                color="text-orange-700"
              />
            </div>

            <button
              onClick={() => onCtaClick('clue_intro_sidebar_cta')}
              className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            >
              Try chatting with Clue
              <MaterialIcon name="arrow_forward" size="sm" />
            </button>
          </div> */}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onCtaClick('clue_intro_cta')}
            className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
          >
            Start your first conversation
            <MaterialIcon name="arrow_forward" size="sm" />
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature item for the sidebar card
 */
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  color: string;
}

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${color}`}>
        <MaterialIcon name={icon} size="sm" />
      </div>
      <div>
        <p className="text-primary text-sm font-semibold">{title}</p>
        <p className="text-text-muted text-xs">{description}</p>
      </div>
    </div>
  );
}
