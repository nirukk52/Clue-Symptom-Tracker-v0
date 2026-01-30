/**
 * Types for the ClueChat module
 *
 * Why this exists: Defines the data structures for the full-page chat experience.
 * This is the core product interface for Chronic Life symptom tracker.
 * UI design based on aicofounder.com chat interface.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  /** For system notifications like "Added to canvas" */
  isNotification?: boolean;
  notificationIcon?: string;
}

export interface ChatUser {
  initials: string;
  avatarUrl?: string;
  email?: string;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
};

/** Navigation items for Clue symptom tracker sidebar */
export const CLUE_NAV_ITEMS: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: 'chat_bubble' },
  { id: 'insights', label: 'Insights', icon: 'auto_awesome' },
  { id: 'doctor-pack', label: 'Doctor\nSummary', icon: 'stethoscope' },
  { id: 'quick-entry', label: 'Quick\nEntry', icon: 'add_circle' },
  { id: 'flare-mode', label: 'Flare\nMode', icon: 'local_fire_department' },
];

/**
 * Timeline entry type - categorizes different kinds of health events
 * Why this exists: Different entry types need different icons and styling
 */
export type TimelineEntryType =
  | 'symptom'
  | 'medication'
  | 'supplement'
  | 'diet'
  | 'test'
  | 'reaction'
  | 'note';

/**
 * Timeline entry status - indicates the state of an intervention or symptom
 * Why this exists: Provides quick visual feedback on whether something helped or caused issues
 */
export type TimelineEntryStatus =
  | 'start'
  | 'ongoing'
  | 'tolerated'
  | 'issue'
  | 'current'
  | 'completed';

/**
 * TimelineEntry - A single entry in the user's daily timeline
 * Why this exists: Represents health events extracted from chat conversations,
 * displayed chronologically to help users track patterns throughout the day.
 */
export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  title: string;
  description?: string;
  time?: string; // e.g., "2:00 PM" - optional for long-running interventions
  status?: TimelineEntryStatus;
  duration?: string; // e.g., "4 months", "1 week"
  dosage?: string; // e.g., "150mg (2 billion CFU)"
  intensity?: 1 | 2 | 3 | 4 | 5; // For symptoms
}

/**
 * InsightStatus - Indicates the review state of an AI insight
 * Why this exists: Tracks whether insights have been validated by practitioners
 */
export type InsightStatus = 'pending' | 'validated' | 'correcting';

/**
 * Insight - An AI-generated health insight or suggestion
 * Why this exists: Represents actionable insights derived from chat conversations
 * and symptom tracking data. Users can validate, correct, or delete these.
 */
export interface Insight {
  id: string;
  content: string;
  status: InsightStatus;
  validatedAt?: Date;
  validatedBy?: string;
}
