'use client';

import { sourceLinks } from '@/content/blog/spoonies-data';

/**
 * SourcesSection - List of all sources with citations
 *
 * Why this exists: Provides full attribution and easy access
 * to all sources used in the research article.
 */

export function SourcesSection() {
  return (
    <div className="space-y-4">
      <p className="text-text-muted mb-6 text-sm">
        Personal experiences and tips from Spoonies on Reddit threads
        (r/ChronicIllness, r/POTS, r/BearableApp, etc.), app store reviews of
        symptom trackers, chronic illness blogs and community sites, internal
        community research and personas, and the Spoon Theory framework.
      </p>

      <div className="space-y-3">
        {sourceLinks.map((source, index) => (
          <div
            key={index}
            className="border-primary/10 hover:border-accent-purple/30 rounded-xl border bg-white p-4 transition-colors"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {source.citations.map((c) => (
                <span
                  key={c}
                  className="bg-accent-purple/10 text-accent-purple inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold"
                >
                  [{c}]
                </span>
              ))}
            </div>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent-purple text-sm font-medium transition-colors"
            >
              {source.title}
            </a>
            <p className="text-text-muted mt-1 break-all text-xs">
              {source.url}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 mt-8 rounded-xl p-6">
        <p className="text-text-muted text-sm">
          All these sources converge on the same message:{' '}
          <strong className="text-primary">
            Spoonies need symptom tracking tools that truly understand the spoon
            theory life — simplifying tasks, respecting limitations, and
            empowering them with insights without adding burden.
          </strong>{' '}
          By learning from their lived experiences, we can prioritize the
          features and design choices that matter most to this community.
        </p>
      </div>
    </div>
  );
}
