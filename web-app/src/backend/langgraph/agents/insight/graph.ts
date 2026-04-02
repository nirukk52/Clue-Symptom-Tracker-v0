/**
 * Insight Agent LangGraph
 *
 * Why this exists: Defines the dedicated insight workflow so clue generation
 * can evolve separately from chat orchestration and graph reconciliation.
 */

import { END, START, StateGraph } from '@langchain/langgraph';

import { computeInfoGainNode } from './nodes/compute-info-gain';
import { readGraphNode } from './nodes/read-graph';
import { scoreConditionsNode } from './nodes/score-conditions';
import { storeClueNode } from './nodes/store-clue';
import { InsightAgentState } from './state';

/**
 * Insight Agent node names.
 * Why this exists: Gives the new graph a stable vocabulary for tracing and
 * executor wiring.
 */
export const INSIGHT_AGENT_NODE_NAMES = {
  READ_GRAPH: 'ReadGraph',
  SCORE_CONDITIONS: 'ScoreConditions',
  COMPUTE_INFO_GAIN: 'ComputeInfoGain',
  STORE_CLUE: 'StoreClue',
} as const;

/**
 * Builds the Insight Agent workflow.
 * Why this exists: The insight pass should stay linear and explicit: read graph,
 * score conditions, compute the clue, then persist it.
 */
export function createInsightAgentGraph() {
  return new StateGraph(InsightAgentState)
    .addNode(INSIGHT_AGENT_NODE_NAMES.READ_GRAPH, readGraphNode)
    .addNode(INSIGHT_AGENT_NODE_NAMES.SCORE_CONDITIONS, scoreConditionsNode)
    .addNode(INSIGHT_AGENT_NODE_NAMES.COMPUTE_INFO_GAIN, computeInfoGainNode)
    .addNode(INSIGHT_AGENT_NODE_NAMES.STORE_CLUE, storeClueNode)
    .addEdge(START, INSIGHT_AGENT_NODE_NAMES.READ_GRAPH)
    .addEdge(INSIGHT_AGENT_NODE_NAMES.READ_GRAPH, INSIGHT_AGENT_NODE_NAMES.SCORE_CONDITIONS)
    .addEdge(INSIGHT_AGENT_NODE_NAMES.SCORE_CONDITIONS, INSIGHT_AGENT_NODE_NAMES.COMPUTE_INFO_GAIN)
    .addEdge(INSIGHT_AGENT_NODE_NAMES.COMPUTE_INFO_GAIN, INSIGHT_AGENT_NODE_NAMES.STORE_CLUE)
    .addEdge(INSIGHT_AGENT_NODE_NAMES.STORE_CLUE, END);
}
