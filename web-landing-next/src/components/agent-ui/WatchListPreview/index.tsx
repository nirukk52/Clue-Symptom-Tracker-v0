'use client';

/**
 * WatchListPreview Component
 *
 * Why this exists: Shows users a personalized preview of what predictions
 * COULD look like for their condition. Designed to convert visitors by
 * demonstrating immediate value before sign-up.
 *
 * Features:
 * - Personalized headline (no subtitle)
 * - 7-day flare risk graph
 * - "Watching for:" items tailored to their condition
 * - First-person CTA triggering Google sign-in
 */

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { WatchListPreviewData } from '@/backend/agents/onboarding/types';
import { FlareRiskGraph } from './FlareRiskGraph';

interface WatchListPreviewProps {
  data: WatchListPreviewData;
  onCTAClick: () => void;
  isLoading?: boolean;
}

export function WatchListPreview({
  data,
  onCTAClick,
  isLoading = false,
}: WatchListPreviewProps) {
  if (isLoading) {
    return (
      <div className="watch-list-container animate-pulse">
        <div className="bg-primary/10 h-8 w-3/4 rounded-lg" />
        <div className="watch-list-card mt-6">
          <div className="bg-primary/5 h-32 rounded-xl" />
          <div className="mt-4 space-y-2">
            <div className="bg-primary/10 h-4 w-1/2 rounded" />
            <div className="bg-primary/10 h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="watch-list-container visible"
      role="region"
      aria-label="Your personalized watch list"
    >
      {/* Headline - NO subtitle per design */}
      <h2 className="watch-list-headline">{data.headline}</h2>

      {/* Watch Card */}
      <div className="watch-list-card">
        {/* Header */}
        <div className="watch-list-card-header">
          <span className="watch-list-badge">YOUR NEXT 7 DAYS</span>
        </div>

        {/* Flare Risk Graph */}
        <div className="watch-list-graph">
          <FlareRiskGraph data={data.graphs.flareRisk} />
        </div>

        {/* Watch Items */}
        <div className="watch-list-items">
          <p className="watch-list-items-label">
            <MaterialIcon name="visibility" size="sm" className="mr-1.5" />
            Watching for:
          </p>
          <ul className="watch-list-items-list">
            {data.watchItems.map((item, index) => (
              <li key={index} className="watch-list-item">
                <MaterialIcon
                  name="check_circle"
                  size="sm"
                  className="text-accent-mint shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status */}
        <div className="watch-list-status">
          <MaterialIcon
            name="schedule"
            size="sm"
            className="text-accent-purple"
          />
          <span>{data.statusText}</span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="watch-list-cta-section">
        <button
          onClick={onCTAClick}
          className="watch-list-cta"
          aria-label={data.cta.text}
        >
          <span>{data.cta.text}</span>
          <MaterialIcon name="arrow_forward" size="sm" />
        </button>
        <p className="watch-list-privacy">
          <MaterialIcon name="lock" size="xs" />
          Your data stays private. We never share it.
        </p>
      </div>
    </div>
  );
}

export default WatchListPreview;
