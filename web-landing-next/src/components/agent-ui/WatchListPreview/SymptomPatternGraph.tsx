'use client';

/**
 * SymptomPatternGraph Component
 *
 * Why this exists: Visual representation of symptom patterns based on
 * user's Q1 condition. Shows fake preview data during onboarding.
 */

import type { PatternData } from '@/backend/agents/onboarding/types';

interface SymptomPatternGraphProps {
  data: PatternData;
}

/**
 * Gets pattern-specific styling
 */
function getPatternColor(
  patternType: 'energy' | 'pain' | 'migraine' | 'gut'
): string {
  const colors = {
    energy: 'bg-accent-purple',
    pain: 'bg-accent-rose',
    migraine: 'bg-accent-peach',
    gut: 'bg-accent-mint',
  };
  return colors[patternType];
}

export function SymptomPatternGraph({ data }: SymptomPatternGraphProps) {
  const maxValue = Math.max(...data.values);
  const barColor = getPatternColor(data.patternType);

  return (
    <div className="symptom-pattern-graph">
      {/* Mini bar chart */}
      <div className="symptom-pattern-chart">
        {data.values.map((value, index) => {
          const height = (value / maxValue) * 100;

          return (
            <div key={index} className="symptom-pattern-bar-container">
              <div
                className={`symptom-pattern-bar ${barColor}`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <p className="symptom-pattern-insight">{data.insight}</p>
    </div>
  );
}

export default SymptomPatternGraph;
