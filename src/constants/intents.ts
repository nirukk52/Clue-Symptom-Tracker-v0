/**
 * Intent mode options for Screen 2 "What brings you here today?"
 * 
 * Why it exists: Defines the 4 user intent modes with their representative quotes.
 * This tunes the app's first week behavior and widget/prompt configuration.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 4
 */

import type { IntentId, IntentMode } from '@/types/onboarding';

/** All available intent modes with their quotes */
export const INTENT_MODES: IntentMode[] = [
  {
    id: 'awareness',
    title: 'Awareness',
    icon: '🔍',
    quotes: [
      'Why am I so exhausted again?',
      'My pain is back with a vengeance.',
      'Everything hurts and no one sees it.',
      "I can't think straight; my brain is mush.",
      'This flare came out of nowhere.',
    ],
  },
  {
    id: 'tracking',
    title: 'Tracking',
    icon: '📝',
    quotes: [
      "I need to log this flare, but I'm so tired.",
      'When did this start last time?',
      'Did I take my meds on time yesterday?',
      "I've had five flares this month; I'm losing count.",
      'I wish I could remember what triggered this.',
    ],
  },
  {
    id: 'insight',
    title: 'Insight',
    icon: '🔎',
    quotes: [
      'Is stress making this worse?',
      'Could it be the weather or the food I ate?',
      'Every time I skip lunch, my fatigue spikes.',
      "Maybe it's that new medicine.",
      "I'm trying to connect the dots, but it's overwhelming.",
    ],
  },
  {
    id: 'action',
    title: 'Action',
    icon: '⚡',
    quotes: [
      'Should I call my doctor or wait it out?',
      'How can I prevent this from happening again?',
      'What can I try to feel better today?',
      "I need to show my doctor what's been happening.",
      'I want to prepare for my appointment.',
    ],
  },
];

/** Get intent mode by ID */
export const getIntentById = (id: IntentId): IntentMode | undefined =>
  INTENT_MODES.find((i) => i.id === id);

/** Get intent title for display */
export const getIntentTitle = (id: IntentId): string =>
  getIntentById(id)?.title ?? 'Unknown';

/** Short tagline for each intent mode */
export const INTENT_TAGLINES: Record<IntentId, string> = {
  awareness: 'Something is wrong',
  tracking: 'I need history',
  insight: "What's causing this?",
  action: 'What do I do next?',
};

