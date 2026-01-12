'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * DoctorPack Section - Doctor-ready summary exports
 *
 * Why this exists: Shows that tracking leads to actionable output
 * that doctors will actually read. Key trust builder for medical validation.
 */

interface DoctorPackProps {
  onCtaClick: () => void;
}

export function DoctorPack({ onCtaClick }: DoctorPackProps) {
  return (
    <section
      id="doctor-pack"
      className="to-accent-peach/5 relative overflow-hidden bg-gradient-to-b from-white px-4 py-16 md:px-6 md:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Text Content - Left side */}
          <div>
            <div className="bg-accent-peach/30 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <MaterialIcon name="description" size="sm" />
              Doctor-ready summaries
            </div>
            <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
              Scan in 30 seconds.
            </h2>
            <p className="text-text-muted mb-8 text-lg">
              Export something your doctor will actually read. Designed by
              physicians, for physicians.
            </p>
            <button
              onClick={onCtaClick}
              className="bg-accent-peach hover:bg-accent-peach/90 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all hover:shadow-lg active:scale-95"
            >
              <MaterialIcon name="download" size="sm" />
              Export Doctor Pack
            </button>
          </div>

          {/* Doctor Summary Card - Right side */}
          <div className="relative">
            <div className="bg-bg-cream shadow-soft border-primary/5 hover-lift rounded-[2.5rem] border p-6 md:p-8">
              <div className="shadow-card rounded-2xl bg-white p-6">
                {/* Card Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-primary font-semibold">
                      Doctor Summary
                    </p>
                    <p className="text-text-muted text-sm">Dec 10-24, 2024</p>
                  </div>
                  <div className="bg-accent-peach/20 flex size-10 items-center justify-center rounded-xl">
                    <MaterialIcon
                      name="picture_as_pdf"
                      className="text-accent-peach"
                    />
                  </div>
                </div>

                {/* Bar Chart Visualization */}
                <div className="mb-4 flex h-24 items-end gap-1">
                  <div className="bg-accent-mint/30 h-2/5 flex-1 rounded-t" />
                  <div className="bg-accent-mint/30 h-3/5 flex-1 rounded-t" />
                  <div className="bg-accent-rose/30 h-[85%] flex-1 rounded-t" />
                  <div className="bg-accent-rose/30 h-3/4 flex-1 rounded-t" />
                  <div className="h-[50%] flex-1 rounded-t bg-yellow-200/50" />
                  <div className="bg-accent-mint/30 h-[35%] flex-1 rounded-t" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-bg-cream rounded-xl p-3">
                    <p className="text-text-muted">Flare episodes</p>
                    <p className="text-primary font-semibold">2 in 14 days</p>
                  </div>
                  <div className="bg-bg-cream rounded-xl p-3">
                    <p className="text-text-muted">Avg duration</p>
                    <p className="text-primary font-semibold">1.5 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
