/**
 * Insight Agent Module Exports
 *
 * Why this exists: Provides a stable import surface for clue generation during
 * the three-agent migration.
 */

export {
  executeInsightAgent,
  type ExecuteInsightAgentInput,
  type ExecuteInsightAgentResult,
} from './executor';
export { createInsightAgentGraph, INSIGHT_AGENT_NODE_NAMES } from './graph';
export {
  InsightAgentState,
  type InsightAgentStateType,
  type InsightAgentStateUpdate,
  type GeneratedClue,
} from './state';
