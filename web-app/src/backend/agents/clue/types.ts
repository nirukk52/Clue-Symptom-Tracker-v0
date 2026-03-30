/**
 * TypeScript interfaces for the Clue Agent System
 *
 * Why this exists: Defines shared types across all sub-agents,
 * context assembly, and tool interactions. Based on Agent-Requirements.md
 */

// =============================================================================
// AGENT STATE
// =============================================================================

/**
 * Agent mode determines tone and feature emphasis
 * Inferred from message/context but can be manually overridden
 */
export type AgentMode = 'awareness' | 'tracking' | 'insight' | 'action';

/**
 * Energy state affects what we show/ask
 * When low, we suppress insights and reduce questions
 */
export type EnergyState = 'normal' | 'low_energy' | 'flare';

/**
 * Main agent state object (authoritative per session)
 */
export interface AgentState {
  userId: string;
  sessionId: string;
  mode: AgentMode;
  energyState: EnergyState;
  focusHypothesisId: string | null;
  todayDayId: string | null;
  rulebookVersion: string;
  toolCursorIds: Record<string, string>;
}

// =============================================================================
// CONTEXT (assembled per message)
// =============================================================================

/**
 * User profile loaded from database
 */
export interface UserProfile {
  id: string;
  primaryCondition: string;
  conditions: string[];
  createdAt: Date;
}

/**
 * Conversion context from onboarding (why they signed up)
 */
export interface ConversionContext {
  conditionLabel: string;
  painPoint: string;
  desiredOutcome: string;
  promiseCategory:
    | 'prediction'
    | 'trigger_discovery'
    | 'validation'
    | 'pattern_finding';
  generatedHeadline: string;
  watchItems: string[];
}

/**
 * Focus hypothesis - the pinned question user is tracking
 */
export interface FocusHypothesis {
  id: string;
  featureId: string; // "poor_sleep"
  featureLabel: string; // "Poor Sleep"
  outcomeId: string; // "fatigue"
  outcomeLabel: string; // "Fatigue Level"
  startedAt: Date;
  dayCount: number; // How many days into experiment
  state: 'active' | 'completed' | 'paused' | 'archived';
}

/**
 * Today's observation data
 */
export interface TodayContext {
  dayId: string;
  date: string;
  severitySummary: Record<string, number>;
  completionScore: number;
  isFlare: boolean;
  meds: {
    taken: boolean;
    timingLogged: boolean;
  };
  symptoms: string[];
  drivers: string[];
}

/**
 * Missing fields that need to be collected
 */
export interface MissingFieldsQueue {
  fields: {
    fieldId: string;
    fieldLabel: string;
    priority: number;
    reason: string;
  }[];
}

/**
 * Complete context assembled for each message
 */
export interface MessageContext {
  user: UserProfile;
  conversion: ConversionContext | null;
  focus: FocusHypothesis | null;
  today: TodayContext | null;
  missingFields: MissingFieldsQueue;
  lastSevenDays: {
    completionRate: number;
    avgSeverity: number;
    flareCount: number;
  };
  agentState: AgentState;
}

// =============================================================================
// ACTIONS & WIDGETS
// =============================================================================

/**
 * Widget types from the catalog (MVP fixed list)
 */
export type WidgetType =
  | 'outcome_slider' // 0-10 for priority outcome
  | 'severity_slider' // 0-10 for specific symptom
  | 'flare_toggle' // Yes/No
  | 'start_time_picker' // For flare onset
  | 'drivers_chips' // Multi-select suspects
  | 'meds_taken' // Yes/No/Changed
  | 'meds_time_picker' // When taken
  | 'sleep_quality' // 0-10
  | 'short_note' // 10-200 chars
  | 'symptom_8char'; // OPQRST structured capture

/**
 * Widget specification
 */
export interface WidgetSpec {
  widgetId: string;
  type: WidgetType;
  label: string;
  description: string;
  options?: Record<string, unknown>;
  writesTo: string; // Table it writes to
  reason: string; // Why this widget now
  evidenceSnapshotId?: string;
}

/**
 * Action candidate for "Next 3 Actions"
 */
export interface ActionCandidate {
  id: string;
  widget: WidgetSpec;
  scores: {
    value: number; // How much clarity it unlocks (0-1)
    effort: number; // Taps/time required, lower is better (0-1)
    focusRelevance: number; // Direct tie to hypothesis (0-1)
    novelty: number; // Not repeated recently (0-1)
    confidence: number; // Likelihood it improves understanding (0-1)
  };
  totalScore: number; // Weighted sum
  rank: number;
}

/**
 * Output from Widget Planner sub-agent
 */
export interface Next3Actions {
  actions: [ActionCandidate, ActionCandidate, ActionCandidate];
  diagnosis: string; // "Cannot evaluate sleep→pain without meds timing"
  decisionTraceId: string;
}

// =============================================================================
// CLUES & EVIDENCE
// =============================================================================

/**
 * Evidence snapshot - proves where data came from
 */
export interface EvidenceSnapshot {
  id: string;
  tier: 'A' | 'B'; // A=SQL exact rows, B=RAG narrative
  sourceTool: string;
  queryId: string;
  paramsJson: Record<string, unknown>;
  resultHash: string;
  rulebookVersion: string;
  metricRunId?: string;
  items: EvidenceItem[];
}

/**
 * Single evidence item
 */
export interface EvidenceItem {
  type: 'row_ref' | 'metric_ref' | 'blob';
  refTable: string;
  refPk: string;
  refColumn?: string;
  metricId?: string;
}

/**
 * Clue card output
 */
export interface ClueCard {
  id: string;
  clueType: 'correlation' | 'trend' | 'comparison' | 'warning';
  text: string; // "After poor sleep, fatigue +2.1 avg over 6 days"
  confidence: number; // 0-1
  evidenceSnapshotId: string;
  decisionTraceId: string;
  status: 'active' | 'dismissed' | 'superseded';
}

// =============================================================================
// DECISION TRACE (for debugging/reproducibility)
// =============================================================================

/**
 * Decision trace for every clue/action/widget
 */
export interface DecisionTrace {
  id: string;
  agentName: string;
  inputsJson: Record<string, unknown>;
  evidenceSnapshotIds: string[];
  ruleEvalsJson: Record<string, boolean>;
  scoresJson: Record<string, number>;
  outputPks: string[];
  determinismHash: string;
  createdAt: Date;
}

// =============================================================================
// ROUTER TYPES
// =============================================================================

/**
 * Sub-agent names
 */
export type SubAgentName =
  | 'intake' // Chat → Structured Data
  | 'timeline' // Episodes → Day Cards
  | 'trend' // Metrics computation
  | 'insight' // Clue generation
  | 'widget_planner' // Next 3 actions/logs
  | 'doctor_pack'; // Export generation

/**
 * Router decision
 */
export interface RouterDecision {
  primaryAgent: SubAgentName;
  parallelAgents?: SubAgentName[];
  reason: string;
}

// =============================================================================
// CHAT TYPES
// =============================================================================

/**
 * Chat message roles
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  widgets?: WidgetSpec[];
  clue?: ClueCard;
  timestamp: Date;
}
