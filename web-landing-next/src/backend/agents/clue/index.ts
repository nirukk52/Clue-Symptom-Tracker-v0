/**
 * Clue Agent - Public API
 *
 * Why this exists: Single entry point for all Clue agent interactions.
 * The Clue agent is the main orchestrator that routes to specialized
 * sub-agents based on context and user message.
 */

// Types
export type {
  AgentMode,
  AgentState,
  ChatMessage,
  ClueCard,
  MessageContext,
  Next3Actions,
  WidgetSpec,
} from './types';

// Main router
export { processMessage, routeMessage } from './router';

// Context assembly
export { assembleMessageContext } from './context/assembler';

// Sub-agents (for direct access when needed)
// export { intakeAgent } from './sub-agents/intake';
// export { insightAgent } from './sub-agents/insight';
// export { widgetPlannerAgent } from './sub-agents/widget-planner';
