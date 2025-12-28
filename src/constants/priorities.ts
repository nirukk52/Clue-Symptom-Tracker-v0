/**
 * Priority outcome options for Screen 1B "What matters most right now?"
 * 
 * Why it exists: Defines the 5 priority focus areas users can choose from.
 * This drives the first month's tracking focus and default charts.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 2
 */

import type { Priority, PriorityId } from '@/types/onboarding';

/** Re-export types for convenience */
export type { Priority, PriorityId } from '@/types/onboarding';

/** All available priority options */
export const PRIORITIES: Priority[] = [
  {
    id: 'energy-crashes',
    label: 'Energy crashes',
    description: 'Fatigue, stamina, spoon theory',
    icon: '⚡',
    color: '#FCD34D', // Yellow
  },
  {
    id: 'pain-inflammation',
    label: 'Pain & Inflammation',
    description: 'Joint pain, headaches, flare-ups',
    icon: '🩹',
    color: '#F87171', // Red
  },
  {
    id: 'mood-anxiety',
    label: 'Mood & Anxiety',
    description: 'Depression, brain fog, stress',
    icon: '🧠',
    color: '#D0BDF4', // Purple
  },
  {
    id: 'sleep-quality',
    label: 'Sleep Quality',
    description: 'Insomnia, restfulness, vivid dreams',
    icon: '🌙',
    color: '#A4C8D8', // Blue
  },
  {
    id: 'digestion-gut',
    label: 'Digestion & Gut',
    description: 'Bloating, nausea, appetite',
    icon: '🌿',
    color: '#B8E3D6', // Green/Mint
  },
];

/** Get priority by ID */
export const getPriorityById = (id: PriorityId): Priority | undefined =>
  PRIORITIES.find((p) => p.id === id);

/** Get priority label for display */
export const getPriorityLabel = (id: PriorityId): string =>
  getPriorityById(id)?.label ?? 'Unknown';

