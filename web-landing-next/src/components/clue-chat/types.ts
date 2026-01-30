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

/** Navigation items matching aicofounder design (lightbulb, target, beaker, monitor, rocket icons) */
export const CLUE_NAV_ITEMS: NavItem[] = [
  { id: 'ideation', label: 'Ideation', icon: 'lightbulb' },
  { id: 'research', label: 'Research', icon: 'my_location' },
  { id: 'solution', label: 'Solution', icon: 'science' },
  { id: 'website', label: 'Website', icon: 'desktop_windows' },
  { id: 'marketing', label: 'Marketing', icon: 'rocket_launch' },
];
