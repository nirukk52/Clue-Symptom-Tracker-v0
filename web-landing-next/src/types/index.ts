/**
 * Type definitions for Chronic Life / Clue
 *
 * Why this exists: Provides type safety for the Clue chat agent,
 * knowledge graph, and related features.
 */

// ============================================
// CHAT TYPES
// ============================================

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/**
 * Chat conversation record
 */
export interface ChatConversation {
  id?: string;
  user_id?: string;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// GRAPH TYPES (shared with clue-chat/types.ts)
// ============================================

export type GraphNodeType =
  | 'symptom'
  | 'factor'
  | 'medication'
  | 'condition'
  | 'clue'
  | 'unknown';

export type GraphEdgeType =
  | 'TRIGGERS'
  | 'CORRELATES_WITH'
  | 'SUPPORTED_BY'
  | 'NEEDS_INFO'
  | 'ABOUT'
  | 'IMPROVES';

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface ButtonVariant {
  variant?: 'hero' | 'nav' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
