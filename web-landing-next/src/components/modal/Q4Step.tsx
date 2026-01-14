'use client';

import { WatchListPreview } from '@/components/widgets/WatchListPreview';

/**
 * Q4Step - Shows immediate value preview after Q3 baseline capture
 *
 * Why this exists: Turns onboarding into a "result" not just setup.
 * After Q3, users see what Clue will watch for them in the next 7 days.
 * This creates:
 * - Immediate gratification (output from input)
 * - Future promise (anticipation for insights)
 * - Commitment device (don't lose your starting point)
 *
 * Design:
 * - NO EMOJIS
 * - Warm cream + accent purple palette
 * - Progressive reveal animation
 * - Trust-building transparency
 */

interface Q4StepProps {
  q1Domain: string;
  q2PainPoint: string;
  q3Data: {
    condition?: string;
    widgetType?: string;
    widgetValue?: number | string | string[];
  };
  onContinue: () => void;
}

export function Q4Step({
  q1Domain,
  q2PainPoint,
  q3Data,
  onContinue,
}: Q4StepProps) {
  return (
    <WatchListPreview
      q1Domain={q1Domain}
      q2PainPoint={q2PainPoint}
      q3Data={q3Data}
      onContinue={onContinue}
    />
  );
}

export default Q4Step;
