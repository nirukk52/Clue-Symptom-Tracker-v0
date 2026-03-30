/**
 * Types for the ClueChat module
 *
 * Why this exists: Defines the data structures for the full-page chat experience.
 * This is the core product interface for Chronic Life symptom tracker.
 * UI design based on aicofounder.com chat interface.
 */

/**
 * Interactive component types that can appear in chat messages.
 * Why this exists: Enables rich interactions beyond plain text.
 * These are triggered by tool calls (e.g. ask_severity) rather than regex detection.
 */
export type ChatInteractiveComponent =
  | { 
      type: 'severity-slider' | 'rating-slider';
      /** The metric being rated (generalized name) */
      metric?: string;
      /** Legacy field for backwards compatibility */
      symptom: string;
      prompt?: string;
      initialValue?: number;
      /** Label preset for the slider (severity, energy, mood, stress, pain, sleep) */
      labels?: string;
    }
  | { type: 'quick-log'; options: string[] };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  /** For system notifications like "Added to canvas" */
  isNotification?: boolean;
  notificationIcon?: string;
  /** Interactive component to render after the message text */
  interactive?: ChatInteractiveComponent;
  /** Whether the interactive component has been completed */
  interactiveCompleted?: boolean;
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
  { id: 'timeline', label: 'Timeline', icon: 'calendar_today' },
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
  | 'note'
  | 'mood';

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

// =============================================================================
// KNOWLEDGE GRAPH TYPES
// =============================================================================

/**
 * Graph node types - categorizes entities in the health knowledge graph.
 * Why this exists: Different node types get different colors and behaviors
 * in the Reagraph visualization. Unknown nodes are tappable to ask questions.
 */
export type GraphNodeType =
  | 'symptom'     // User-reported symptoms (headache, fatigue, pain)
  | 'factor'      // Contributing factors (sleep, stress, diet, activity, weather)
  | 'medication'  // Medications and supplements
  | 'condition'   // Diagnosed conditions (IBS, Fibromyalgia, POTS)
  | 'clue'        // AI-generated insights connecting multiple nodes
  | 'unknown';    // Questions Clue still needs answered (tap to ask)

/**
 * Graph edge relationships - defines how nodes connect in the graph.
 * Why this exists: Edge types determine the visual style (dashed, solid)
 * and inform the insight generation pipeline.
 */
export type GraphEdgeRelationship =
  | 'SUPPORTED_BY'    // Clue/insight is supported by evidence nodes
  | 'ABOUT'           // Node is about another node
  | 'NEEDS_INFO'      // Unknown node needs info from another node
  | 'HAS_SYMPTOM'     // Condition has symptom
  | 'HAS_FACTOR'      // Symptom/condition has contributing factor
  | 'CORRELATES_WITH' // Statistical correlation between nodes
  | 'TRIGGERS'        // Factor triggers symptom/flare
  | 'IMPROVES'        // Factor/medication improves symptom
  | 'CO_OCCURS';      // Symptoms that frequently appear together

/**
 * Node status for lifecycle management.
 * Why this exists: Allows soft-delete and history tracking.
 */
export type GraphNodeStatus = 'active' | 'dismissed' | 'resolved' | 'archived';

/**
 * Confidence levels for clue/insight nodes.
 * Why this exists: Communicates certainty to users and affects display styling.
 */
export type GraphConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

/**
 * GraphNode - A node in the user's health knowledge graph.
 * Why this exists: Represents an entity (symptom, factor, clue, etc.)
 * that can be visualized in the ChatCanvas with Reagraph.
 */
export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subLabel?: string;
  confidence?: GraphConfidenceLevel;
  confidenceScore?: number;
  questionText?: string;      // For unknown nodes - the question to ask
  questionPriority?: number;  // Higher = more important to ask
  data?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * GraphEdge - A relationship between two nodes in the knowledge graph.
 * Why this exists: Defines connections like "factor triggers symptom"
 * or "clue supported by evidence".
 */
export interface GraphEdge {
  id: string;
  source: string;             // Source node ID
  target: string;             // Target node ID
  relationship: GraphEdgeRelationship;
  weight?: number;            // Edge strength (for correlation, confidence)
  pValue?: number;            // Statistical significance
  observationCount?: number;  // Number of data points
  data?: Record<string, unknown>;
}

/**
 * GraphData - The complete graph state returned from /api/graph.
 * Why this exists: Matches the Reagraph GraphCanvas data format.
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Node color mapping for Reagraph visualization.
 * Why this exists: Consistent color coding across the UI.
 */
export const GRAPH_NODE_COLORS: Record<GraphNodeType, string> = {
  clue: '#F6C90E',        // Gold - AI insights, center of graph
  symptom: '#FF6B6B',     // Soft red - symptoms
  factor: '#4ECDC4',      // Teal - factors (sleep, stress, diet)
  medication: '#5B8DEF',  // Blue - medications
  condition: '#9B59B6',   // Purple - conditions
  unknown: '#AAAAAA',     // Gray - questions (pulsing animation)
};

/**
 * Node size mapping for Reagraph visualization.
 * Why this exists: Clue nodes are larger and centered.
 */
export const GRAPH_NODE_SIZES: Record<GraphNodeType, number> = {
  clue: 24,
  symptom: 16,
  factor: 14,
  medication: 14,
  condition: 18,
  unknown: 12,
};
