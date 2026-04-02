/**
 * Insight Agent ReadGraph Node
 *
 * Why this exists: Loads the clean graph snapshot produced by the Graph Agent so
 * the Insight Agent can reason over a single reconciled source of truth.
 */

import { getUserGraph } from '@/backend/lib/graph';

import type { InsightAgentStateType, InsightAgentStateUpdate } from '../state';

/**
 * Reads the user's current clean graph and splits it by node type.
 * Why this exists: Downstream insight nodes should not need to repeatedly filter
 * the same graph payload when computing scores and selecting clues.
 */
export async function readGraphNode(
  state: InsightAgentStateType
): Promise<InsightAgentStateUpdate> {
  const userId = state.userId;

  if (userId === 'anonymous') {
    return {
      symptomNodes: [],
      factorNodes: [],
      conditionNodes: [],
      medicationNodes: [],
      edges: [],
      knownSymptoms: new Set<string>(),
    };
  }

  try {
    const graph = await getUserGraph(userId);
    const symptomNodes = graph.nodes.filter((node) => node.type === 'symptom');
    const factorNodes = graph.nodes.filter((node) => node.type === 'factor');
    const conditionNodes = graph.nodes.filter((node) => node.type === 'condition');
    const medicationNodes = graph.nodes.filter((node) => node.type === 'medication');

    return {
      symptomNodes,
      factorNodes,
      conditionNodes,
      medicationNodes,
      edges: graph.edges,
      knownSymptoms: new Set(symptomNodes.map((node) => node.label.toLowerCase().trim())),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read insight graph';
    console.error('[insight/read-graph] Failed:', error);

    return {
      errors: [message],
    };
  }
}
