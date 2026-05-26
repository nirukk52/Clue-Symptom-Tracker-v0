/**
 * Graph Reconciler LangGraph
 *
 * Why this exists: Defines the dedicated post-turn graph workflow so graph
 * mutation can evolve independently from chat and insight generation.
 */

import { END, START, StateGraph } from '@langchain/langgraph';

import { extractEntitiesNode } from './nodes/extract-entities';
import { readStateNode } from './nodes/read-state';
import { reconcileGraphNode } from './nodes/reconcile-graph';
import { GraphReconcilerState } from './state';

/**
 * Graph Reconciler node names.
 * Why this exists: Keeps executor tracing and graph wiring aligned with the
 * architecture plan and soul document.
 */
export const GRAPH_RECONCILER_NODE_NAMES = {
  READ_STATE: 'ReadState',
  EXTRACT_ENTITIES: 'ExtractEntities',
  RECONCILE_GRAPH: 'ReconcileGraph',
} as const;

/**
 * Builds the Graph Reconciler workflow.
 * Why this exists: The Graph Agent has one job: read recent state, recover
 * entities, and write a clean graph snapshot.
 */
export function createGraphReconcilerGraph() {
  return new StateGraph(GraphReconcilerState)
    .addNode(GRAPH_RECONCILER_NODE_NAMES.READ_STATE, readStateNode)
    .addNode(GRAPH_RECONCILER_NODE_NAMES.EXTRACT_ENTITIES, extractEntitiesNode)
    .addNode(GRAPH_RECONCILER_NODE_NAMES.RECONCILE_GRAPH, reconcileGraphNode)
    .addEdge(START, GRAPH_RECONCILER_NODE_NAMES.READ_STATE)
    .addEdge(GRAPH_RECONCILER_NODE_NAMES.READ_STATE, GRAPH_RECONCILER_NODE_NAMES.EXTRACT_ENTITIES)
    .addEdge(GRAPH_RECONCILER_NODE_NAMES.EXTRACT_ENTITIES, GRAPH_RECONCILER_NODE_NAMES.RECONCILE_GRAPH)
    .addEdge(GRAPH_RECONCILER_NODE_NAMES.RECONCILE_GRAPH, END);
}
