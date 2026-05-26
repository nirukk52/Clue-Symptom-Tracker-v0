/**
 * Graph Reconciler ReconcileGraph Node
 *
 * Why this exists: Turns the current reconciliation snapshot into graph node
 * and edge writes, making the Graph Agent the single owner of graph mutation.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { canonicalizeSymptomName } from '@/backend/lib/graph/health-kg';
import {
  upsertGraphEdge,
  upsertGraphNode,
  type GraphEdge,
  type GraphEdgeRelationship,
  type GraphNode,
  type GraphNodeType,
} from '@/backend/lib/graph';

import type {
  GraphReconcilerStateType,
  GraphReconcilerStateUpdate,
  ReconciledEntity,
} from '../state';

/**
 * Creates a privileged Supabase client for cursor updates.
 * Why this exists: The Graph Agent owns the reconciliation watermark and must
 * persist it once graph writes succeed.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Normalizes an entity name against the existing graph.
 * Why this exists: The Graph Agent should not create duplicate active nodes when
 * a user alternates between shorthand and canonical labels.
 */
function normalizeEntityName(entity: ReconciledEntity, existingNodes: GraphNode[]): string {
  const rawName =
    entity.type === 'symptom' ? canonicalizeSymptomName(entity.name) : entity.name.trim();
  const lowerRawName = rawName.toLowerCase();

  const sameTypeNodes = existingNodes.filter((node) => node.type === entity.type);
  const exactMatch = sameTypeNodes.find((node) => node.label.trim().toLowerCase() === lowerRawName);
  if (exactMatch) {
    return exactMatch.label;
  }

  const containsMatch = sameTypeNodes.find((node) => {
    const label = node.label.trim().toLowerCase();
    return label.includes(lowerRawName) || lowerRawName.includes(label);
  });
  if (containsMatch) {
    return containsMatch.label;
  }

  return rawName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a graph sub-label from structured entity metadata.
 * Why this exists: The graph should preserve the most recent user-facing value
 * for severity and factor levels without creating duplicate nodes.
 */
function buildSubLabel(entity: ReconciledEntity): string | undefined {
  if (entity.type === 'symptom' && entity.severity && entity.severity > 0) {
    return `Severity ${entity.severity}/10`;
  }

  if (entity.type === 'factor' && entity.value !== undefined && entity.value !== null) {
    if (entity.name === 'Sleep') {
      return `${entity.value} hours`;
    }

    return `${entity.value}/10`;
  }

  return undefined;
}

/**
 * Builds a lookup key for a normalized graph entity.
 * Why this exists: Node IDs are reused across node upserts and edge creation.
 */
function entityKey(type: GraphNodeType, name: string): string {
  return `${type}:${name.trim().toLowerCase()}`;
}

/**
 * Groups reconciled entities by graph node type after normalization.
 * Why this exists: Edge creation operates on normalized, deduplicated names.
 */
function groupEntitiesByType(
  entities: ReconciledEntity[],
  existingNodes: GraphNode[]
): Map<GraphNodeType, ReconciledEntity[]> {
  const grouped = new Map<GraphNodeType, ReconciledEntity[]>();
  const seen = new Set<string>();

  for (const entity of entities) {
    const normalizedName = normalizeEntityName(entity, existingNodes);
    const normalizedEntity: ReconciledEntity = { ...entity, name: normalizedName };
    const key = entityKey(normalizedEntity.type, normalizedEntity.name);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    const current = grouped.get(normalizedEntity.type) ?? [];
    current.push(normalizedEntity);
    grouped.set(normalizedEntity.type, current);
  }

  return grouped;
}

/**
 * Upserts normalized graph nodes and returns an ID map.
 * Why this exists: Edge creation needs stable node IDs for every entity touched
 * in the reconciliation run.
 */
async function upsertEntities(
  userId: string,
  entities: ReconciledEntity[],
  existingNodes: GraphNode[]
): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();

  for (const node of existingNodes) {
    idMap.set(entityKey(node.type, node.label), node.id);
  }

  for (const entity of entities) {
    const normalizedName = normalizeEntityName(entity, existingNodes);
    const key = entityKey(entity.type, normalizedName);
    const nodeId = await upsertGraphNode(userId, {
      type: entity.type,
      name: normalizedName,
      subLabel: buildSubLabel(entity),
      data: {
        source: entity.source,
        occurredAt: entity.timestamp ?? null,
        notes: entity.notes ?? null,
        confidence: entity.confidence ?? null,
        provisional: entity.provisional ?? false,
        rawText: entity.rawText ?? null,
      },
    });

    if (nodeId) {
      idMap.set(key, nodeId);
    }
  }

  return idMap;
}

/**
 * Upserts a relationship edge for every source/target pair in the turn.
 * Why this exists: The Graph Agent should turn co-occurring entities from the
 * same reconciled window into graph structure without duplicate edges.
 */
async function upsertPairwiseEdges(params: {
  userId: string;
  sources: ReconciledEntity[];
  targets: ReconciledEntity[];
  relationship: GraphEdgeRelationship;
  nodeIds: Map<string, string>;
  existingEdges: GraphEdge[];
}): Promise<number> {
  const { userId, sources, targets, relationship, nodeIds, existingEdges } = params;
  let edgesUpserted = 0;

  for (const source of sources) {
    const sourceId = nodeIds.get(entityKey(source.type, source.name));
    if (!sourceId) {
      continue;
    }

    for (const target of targets) {
      const targetId = nodeIds.get(entityKey(target.type, target.name));
      if (!targetId || targetId === sourceId) {
        continue;
      }

      const existingEdge = existingEdges.find(
        (edge) =>
          edge.source === sourceId &&
          edge.target === targetId &&
          edge.relationship === relationship
      );

      const edgeId = await upsertGraphEdge(userId, {
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        relationship,
        weight: 1,
        observationCount: (existingEdge?.observationCount ?? 0) + 1,
      });

      if (edgeId) {
        edgesUpserted += 1;
      }
    }
  }

  return edgesUpserted;
}

/**
 * Advances the Graph Agent cursor after a successful reconciliation.
 * Why this exists: Failed runs must be replayable, so the watermark only moves
 * once node and edge upserts have completed.
 */
async function advanceCursor(userId: string): Promise<void> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { error } = await supabase.from('agent_cursors').upsert({
    user_id: userId,
    agent_name: 'graph_reconciler',
    cursor_at: now,
    is_running: false,
    updated_at: now,
  });

  if (error) {
    console.error('[graph-reconciler/reconcile-graph] Failed to advance cursor:', error);
  }
}

/**
 * Reconciles structured log entities and recovered gap entities into the graph.
 * Why this exists: This is the single graph-writing phase in the new
 * architecture, removing dual-writer ambiguity from the live conversation turn.
 */
export async function reconcileGraphNode(
  state: GraphReconcilerStateType
): Promise<GraphReconcilerStateUpdate> {
  try {
    const userId = state.userId;
    const allEntities = [...state.logEntities, ...state.gapEntities];
    const normalizedGroups = groupEntitiesByType(allEntities, state.currentGraph.nodes);
    const nodeIds = await upsertEntities(userId, allEntities, state.currentGraph.nodes);

    const symptomEntities = normalizedGroups.get('symptom') ?? [];
    const factorEntities = normalizedGroups.get('factor') ?? [];
    const medicationEntities = normalizedGroups.get('medication') ?? [];
    const conditionEntities = normalizedGroups.get('condition') ?? [];

    const conditionEdges = await upsertPairwiseEdges({
      userId,
      sources: conditionEntities,
      targets: symptomEntities,
      relationship: 'HAS_SYMPTOM',
      nodeIds,
      existingEdges: state.currentGraph.edges,
    });

    const factorEdges = await upsertPairwiseEdges({
      userId,
      sources: factorEntities,
      targets: symptomEntities,
      relationship: 'TRIGGERS',
      nodeIds,
      existingEdges: state.currentGraph.edges,
    });

    const medicationEdges = await upsertPairwiseEdges({
      userId,
      sources: medicationEntities,
      targets: symptomEntities,
      relationship: 'IMPROVES',
      nodeIds,
      existingEdges: state.currentGraph.edges,
    });

    await advanceCursor(userId);

    return {
      nodesUpserted: allEntities.length,
      edgesUpserted: conditionEdges + factorEdges + medicationEdges,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reconcile graph';
    console.error('[graph-reconciler/reconcile-graph] Failed:', error);

    return {
      errors: [message],
    };
  }
}
