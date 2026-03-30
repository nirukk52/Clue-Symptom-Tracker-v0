/**
 * Graph Data Generators
 *
 * Why this exists: Generates fake preview data for onboarding graphs.
 * Users haven't logged anything yet, so we show simulated previews
 * of what predictions COULD look like for their condition.
 */

import type { FlareRiskData, PatternData, TimingData } from '../types';

/**
 * Generates fake flare risk data for 7-day preview
 * Shows one "elevated" day to demonstrate the prediction concept
 */
export function generateFakeFlareRisk(): FlareRiskData {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Create a realistic-looking pattern with one elevated day
  const pattern: { risk: 'low' | 'elevated' | 'high'; value: number }[] = [
    { risk: 'low', value: 25 },
    { risk: 'low', value: 30 },
    { risk: 'elevated', value: 65 }, // Wednesday elevated
    { risk: 'low', value: 40 },
    { risk: 'low', value: 20 },
    { risk: 'low', value: 15 },
    { risk: 'low', value: 25 },
  ];

  return {
    days: days.map((day, index) => ({
      date: day,
      risk: pattern[index]!.risk,
      value: pattern[index]!.value,
    })),
  };
}

/**
 * Maps Q1 condition to pattern type
 */
function getPatternTypeForCondition(
  condition: string
): 'energy' | 'pain' | 'migraine' | 'gut' {
  const conditionMap: Record<string, 'energy' | 'pain' | 'migraine' | 'gut'> = {
    fatigue: 'energy',
    energy: 'energy',
    flares: 'pain',
    pain: 'pain',
    migraines: 'migraine',
    headaches: 'migraine',
    ibs: 'gut',
    gut: 'gut',
    digestive: 'gut',
    multiple: 'energy', // Default to energy for multiple conditions
    other: 'energy',
  };

  return conditionMap[condition.toLowerCase()] || 'energy';
}

/**
 * Generates pattern-specific insights
 */
function getPatternInsight(
  patternType: 'energy' | 'pain' | 'migraine' | 'gut'
): string {
  const insights: Record<string, string> = {
    energy: 'Your energy tends to dip mid-week',
    pain: 'Pain levels often increase after activity',
    migraine: 'Migraines may follow sleep disruptions',
    gut: 'Symptoms often spike after stress',
  };

  return insights[patternType] || insights.energy!;
}

/**
 * Generates fake symptom pattern data based on Q1 condition
 */
export function generateFakePatterns(condition: string): PatternData {
  const patternType = getPatternTypeForCondition(condition);

  // Different patterns for different conditions
  const patternValues: Record<string, number[]> = {
    energy: [65, 70, 45, 50, 60, 75, 70], // Mid-week dip
    pain: [30, 35, 55, 60, 45, 35, 30], // Activity spike pattern
    migraine: [20, 60, 40, 25, 20, 30, 25], // Spike after sleep issue
    gut: [40, 45, 70, 55, 40, 35, 45], // Stress spike
  };

  return {
    condition,
    patternType,
    values: patternValues[patternType] || patternValues.energy!,
    insight: getPatternInsight(patternType),
  };
}

/**
 * Generates fake medication timing optimization data
 */
export function generateFakeMedicationTiming(): TimingData {
  return {
    items: [
      {
        name: 'Morning routine',
        currentTime: '7:00 AM',
        suggestedTime: '6:30 AM',
        reason: 'May improve absorption',
      },
      {
        name: 'Evening rest',
        currentTime: '10:00 PM',
        suggestedTime: '9:30 PM',
        reason: 'Better sleep onset',
      },
    ],
  };
}

/**
 * Generates condition-specific watch items when AI is unavailable
 */
export function getDefaultWatchItems(
  condition: string
): [string, string, string] {
  const watchItemsByCondition: Record<string, [string, string, string]> = {
    fatigue: [
      'Energy pattern shifts',
      '48-hour crash predictions',
      'Activity-to-payback timing',
    ],
    flares: [
      'Flare warning signs',
      'Trigger correlations',
      'Recovery pattern tracking',
    ],
    migraines: [
      'Migraine triggers',
      'Weather sensitivity patterns',
      'Sleep-headache connections',
    ],
    ibs: [
      'Food reaction timing',
      'Stress-gut connections',
      'Symptom pattern shifts',
    ],
    multiple: [
      'Cross-condition patterns',
      'Medication timing optimization',
      'Symptom overlap detection',
    ],
    other: [
      'Symptom patterns',
      'Trigger identification',
      'Daily trend tracking',
    ],
  };

  const key = condition.toLowerCase();
  return watchItemsByCondition[key] || watchItemsByCondition.other!;
}

/**
 * Generates a default headline when AI is unavailable
 */
export function getDefaultHeadline(
  condition: string,
  painPoint: string
): string {
  const conditionLabel = condition.toLowerCase();

  // Try to create a personalized headline based on pain point
  if (painPoint.includes('warning') || painPoint.includes('blindsided')) {
    return `Get a 48-hour heads up before your ${conditionLabel} hits`;
  }

  if (painPoint.includes('trigger') || painPoint.includes('cause')) {
    return `Find out what's triggering your ${conditionLabel}`;
  }

  if (painPoint.includes('payback') || painPoint.includes('tomorrow')) {
    return `Stop paying tomorrow for what you do today`;
  }

  // Default headline
  return `Start predicting your ${conditionLabel} patterns`;
}

/**
 * Generates a default first-person CTA
 * Default is "Save my spoons" - the signature CTA for the app
 */
export function getDefaultCTA(productOffering: string): string {
  const ctaByProduct: Record<string, string> = {
    'flare-forecast': 'Start my forecast',
    'top-suspect': 'Find my triggers',
    'crash-prevention': 'Protect my tomorrow',
    'spoon-saver': 'Save my spoons',
  };

  // Default to "Save my spoons" - our signature CTA
  return ctaByProduct[productOffering] || 'Save my spoons';
}
