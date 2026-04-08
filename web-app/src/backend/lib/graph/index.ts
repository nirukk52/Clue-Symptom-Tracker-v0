/**
 * Knowledge Graph Service
 *
 * Why this exists: Provides CRUD operations for the user's health knowledge graph
 * stored in Supabase. The graph powers the ChatCanvas visualization and tracks
 * symptoms, factors, medications, conditions, AI-generated clues, and unknown questions.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphNodeType,
  GraphEdgeRelationship,
  GraphConfidenceLevel,
} from '@/components/clue-chat/types';

// Re-export types for convenience
export type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphNodeType,
  GraphEdgeRelationship,
  GraphConfidenceLevel,
};

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// =============================================================================
// DATABASE TYPES (matching Supabase schema)
// =============================================================================

interface DbGraphNode {
  id: string;
  user_id: string;
  type: GraphNodeType;
  status: 'active' | 'dismissed' | 'resolved' | 'archived';
  name: string;
  sub_label: string | null;
  confidence: GraphConfidenceLevel | null;
  confidence_score: number | null;
  question_text: string | null;
  question_priority: number;
  data_json: Record<string, unknown>;
  source_memory_id: string | null;
  source_message_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbGraphEdge {
  id: string;
  user_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship: GraphEdgeRelationship;
  weight: number;
  p_value: number | null;
  observation_count: number;
  data_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface DbInsightRow {
  id: string;
  type: string | null;
  content: string | null;
  reasoning: string | null;
  priority: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

// =============================================================================
// CONVERTERS
// =============================================================================

function dbNodeToGraphNode(dbNode: DbGraphNode): GraphNode {
  return {
    id: dbNode.id,
    type: dbNode.type,
    label: dbNode.name,
    subLabel: dbNode.sub_label ?? undefined,
    confidence: dbNode.confidence ?? undefined,
    confidenceScore: dbNode.confidence_score ?? undefined,
    questionText: dbNode.question_text ?? undefined,
    questionPriority: dbNode.question_priority,
    data: dbNode.data_json,
    createdAt: dbNode.created_at,
    updatedAt: dbNode.updated_at,
  };
}

function dbEdgeToGraphEdge(dbEdge: DbGraphEdge): GraphEdge {
  return {
    id: dbEdge.id,
    source: dbEdge.source_node_id,
    target: dbEdge.target_node_id,
    relationship: dbEdge.relationship,
    weight: dbEdge.weight,
    pValue: dbEdge.p_value ?? undefined,
    observationCount: dbEdge.observation_count,
    data: dbEdge.data_json,
  };
}

/**
 * Normalizes a graph payload returned by the RPC.
 * Why this exists: The canvas should stay resilient if the RPC returns null-ish
 * arrays while we layer in synthetic nodes from the active insight queue.
 */
function normalizeGraphData(data: unknown): GraphData {
  const candidate = (data ?? {}) as Partial<GraphData>;

  return {
    nodes: Array.isArray(candidate.nodes) ? candidate.nodes : [],
    edges: Array.isArray(candidate.edges) ? candidate.edges : [],
  };
}

/**
 * Builds a stable dedupe key for graph nodes.
 * Why this exists: The current architecture can source canvas nodes from both
 * graph tables and insight rows, so we need one comparison strategy.
 */
function getNodeDedupKey(node: GraphNode): string {
  const rawValue =
    node.type === 'unknown'
      ? (node.questionText ?? node.label)
      : node.label;

  return `${node.type}:${rawValue.trim().toLowerCase()}`;
}

/**
 * Shortens long insight text for node labels.
 * Why this exists: The canvas needs compact labels even when the durable clue
 * text in the insights queue is a full natural-language question.
 */
function truncateNodeLabel(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

/**
 * Converts active insight rows into synthetic graph nodes.
 * Why this exists: The three-agent architecture stores follow-up clues in the
 * insights table, but the canvas still renders from graph nodes.
 */
function mapInsightsToGraphNodes(
  insightRows: DbInsightRow[],
  existingNodes: GraphNode[]
): GraphNode[] {
  const seenKeys = new Set(existingNodes.map(getNodeDedupKey));

  return insightRows.flatMap((row) => {
    const content = row.content?.trim();
    if (!content) {
      return [];
    }

    if (row.type === 'next_question') {
      const node: GraphNode = {
        id: `insight-next-question-${row.id}`,
        type: 'unknown',
        label: truncateNodeLabel(content, 50),
        subLabel: 'Tap to answer',
        questionText: content,
        questionPriority: row.priority ?? 0,
        data: {
          source: 'insights',
          insightId: row.id,
          insightType: row.type,
          reasoning: row.reasoning ?? null,
          metadata: row.metadata ?? {},
        },
        createdAt: row.created_at ?? undefined,
        updatedAt: row.created_at ?? undefined,
      };
      const dedupKey = getNodeDedupKey(node);
      if (seenKeys.has(dedupKey)) {
        return [];
      }
      seenKeys.add(dedupKey);
      return [node];
    }

    if (row.type === 'pattern') {
      const node: GraphNode = {
        id: `insight-pattern-${row.id}`,
        type: 'clue',
        label: content,
        subLabel: 'Insight',
        data: {
          source: 'insights',
          insightId: row.id,
          insightType: row.type,
          reasoning: row.reasoning ?? null,
          metadata: row.metadata ?? {},
        },
        createdAt: row.created_at ?? undefined,
        updatedAt: row.created_at ?? undefined,
      };
      const dedupKey = getNodeDedupKey(node);
      if (seenKeys.has(dedupKey)) {
        return [];
      }
      seenKeys.add(dedupKey);
      return [node];
    }

    return [];
  });
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetches the complete graph for a user (nodes + edges).
 * Returns Reagraph-compatible format.
 */
export async function getUserGraph(userId: string): Promise<GraphData> {
  const supabase = getSupabase();

  const [graphResult, insightResult] = await Promise.all([
    supabase.rpc('get_user_graph', {
      p_user_id: userId,
    }),
    supabase
      .from('insights')
      .select('id, type, content, reasoning, priority, metadata, created_at')
      .eq('user_id', userId)
      .neq('status', 'dismissed')
      .in('type', ['next_question', 'pattern'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  const { data, error } = graphResult;

  if (error) {
    console.error('[graph] get_user_graph failed:', error);
    return { nodes: [], edges: [] };
  }

  if (insightResult.error) {
    console.error('[graph] Failed to load active insights for graph hydration:', insightResult.error);
  }

  const graphData = normalizeGraphData(data);
  const hydratedInsightNodes = mapInsightsToGraphNodes(
    (insightResult.data as DbInsightRow[] | null) ?? [],
    graphData.nodes
  );

  return {
    nodes: [...graphData.nodes, ...hydratedInsightNodes],
    edges: graphData.edges,
  };
}

/**
 * Upserts a node in the graph. Creates if not exists, updates if exists.
 * Deduplicates by user_id + type + name.
 */
export async function upsertGraphNode(
  userId: string,
  node: {
    type: GraphNodeType;
    name: string;
    subLabel?: string;
    confidence?: GraphConfidenceLevel;
    confidenceScore?: number;
    questionText?: string;
    questionPriority?: number;
    data?: Record<string, unknown>;
    sourceMemoryId?: string;
    sourceMessageId?: string;
  }
): Promise<string | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('upsert_graph_node', {
    p_user_id: userId,
    p_type: node.type,
    p_name: node.name,
    p_sub_label: node.subLabel ?? null,
    p_confidence: node.confidence ?? null,
    p_confidence_score: node.confidenceScore ?? null,
    p_question_text: node.questionText ?? null,
    p_question_priority: node.questionPriority ?? 0,
    p_data_json: node.data ?? {},
    p_source_memory_id: node.sourceMemoryId ?? null,
    p_source_message_id: node.sourceMessageId ?? null,
  });

  if (error) {
    console.error('[graph] upsert_graph_node failed:', error);
    return null;
  }

  return data as string;
}

/**
 * Upserts an edge in the graph. Creates if not exists, updates if exists.
 * Deduplicates by source_node_id + target_node_id + relationship.
 */
export async function upsertGraphEdge(
  userId: string,
  edge: {
    sourceNodeId: string;
    targetNodeId: string;
    relationship: GraphEdgeRelationship;
    weight?: number;
    pValue?: number;
    observationCount?: number;
    data?: Record<string, unknown>;
  }
): Promise<string | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('upsert_graph_edge', {
    p_user_id: userId,
    p_source_node_id: edge.sourceNodeId,
    p_target_node_id: edge.targetNodeId,
    p_relationship: edge.relationship,
    p_weight: edge.weight ?? 1.0,
    p_p_value: edge.pValue ?? null,
    p_observation_count: edge.observationCount ?? 0,
    p_data_json: edge.data ?? {},
  });

  if (error) {
    console.error('[graph] upsert_graph_edge failed:', error);
    return null;
  }

  return data as string;
}

/**
 * Gets all active nodes of a specific type for a user.
 */
export async function getNodesByType(
  userId: string,
  type: GraphNodeType
): Promise<GraphNode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[graph] getNodesByType failed:', error);
    return [];
  }

  return (data as DbGraphNode[]).map(dbNodeToGraphNode);
}

/**
 * Gets a node by ID.
 */
export async function getNodeById(
  nodeId: string
): Promise<GraphNode | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('graph_nodes')
    .select('*')
    .eq('id', nodeId)
    .single();

  if (error) {
    console.error('[graph] getNodeById failed:', error);
    return null;
  }

  return dbNodeToGraphNode(data as DbGraphNode);
}

/**
 * Gets edges connected to a node (either as source or target).
 */
export async function getEdgesForNode(
  nodeId: string
): Promise<GraphEdge[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('graph_edges')
    .select('*')
    .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);

  if (error) {
    console.error('[graph] getEdgesForNode failed:', error);
    return [];
  }

  return (data as DbGraphEdge[]).map(dbEdgeToGraphEdge);
}

/**
 * Updates a node's status (dismiss, resolve, archive).
 */
export async function updateNodeStatus(
  nodeId: string,
  status: 'active' | 'dismissed' | 'resolved' | 'archived'
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('graph_nodes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', nodeId);

  if (error) {
    console.error('[graph] updateNodeStatus failed:', error);
    return false;
  }

  return true;
}

/**
 * Deletes a graph node by ID.
 * Used to remove resolved Unknown nodes when slots are filled.
 */
export async function deleteGraphNode(
  userId: string,
  nodeId: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('graph_nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (error) {
    console.error('[graph] deleteGraphNode failed:', error);
    return false;
  }

  return true;
}

/**
 * Gets the top N unknown nodes (questions) ordered by priority.
 */
export async function getTopUnknownNodes(
  userId: string,
  limit: number = 5
): Promise<GraphNode[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'unknown')
    .eq('status', 'active')
    .order('question_priority', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[graph] getTopUnknownNodes failed:', error);
    return [];
  }

  return (data as DbGraphNode[]).map(dbNodeToGraphNode);
}

/**
 * Gets clue nodes with their supporting evidence counts.
 */
export async function getCluesWithEvidence(
  userId: string
): Promise<Array<GraphNode & { evidenceCount: number }>> {
  const supabase = getSupabase();

  // Get all clue nodes
  const { data: clues, error: cluesError } = await supabase
    .from('graph_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'clue')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (cluesError) {
    console.error('[graph] getCluesWithEvidence failed:', cluesError);
    return [];
  }

  // Get evidence counts for each clue
  const clueIds = (clues as DbGraphNode[]).map((c) => c.id);
  const { data: edges, error: edgesError } = await supabase
    .from('graph_edges')
    .select('source_node_id')
    .eq('relationship', 'SUPPORTED_BY')
    .in('source_node_id', clueIds);

  if (edgesError) {
    console.error('[graph] getCluesWithEvidence edges failed:', edgesError);
    return (clues as DbGraphNode[]).map((c) => ({
      ...dbNodeToGraphNode(c),
      evidenceCount: 0,
    }));
  }

  // Count evidence per clue
  const evidenceCounts = new Map<string, number>();
  for (const edge of edges as Array<{ source_node_id: string }>) {
    const count = evidenceCounts.get(edge.source_node_id) ?? 0;
    evidenceCounts.set(edge.source_node_id, count + 1);
  }

  return (clues as DbGraphNode[]).map((c) => ({
    ...dbNodeToGraphNode(c),
    evidenceCount: evidenceCounts.get(c.id) ?? 0,
  }));
}

/**
 * Gets a summary of the graph state for system prompt injection.
 */
export async function getGraphSummary(userId: string): Promise<string> {
  const supabase = getSupabase();

  // Count nodes by type
  const { data: nodes, error: nodesError } = await supabase
    .from('graph_nodes')
    .select('type')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (nodesError || !nodes) {
    return '';
  }

  const typeCounts = new Map<string, number>();
  for (const node of nodes as Array<{ type: string }>) {
    const count = typeCounts.get(node.type) ?? 0;
    typeCounts.set(node.type, count + 1);
  }

  // Get recent clues
  const clues = await getCluesWithEvidence(userId);
  const recentClues = clues
    .slice(0, 3)
    .map((c) => `- ${c.label} (${c.evidenceCount} supporting facts)`)
    .join('\n');

  const parts: string[] = [];

  if (typeCounts.size > 0) {
    const summary = Array.from(typeCounts.entries())
      .map(([type, count]) => `${count} ${type}(s)`)
      .join(', ');
    parts.push(`Known: ${summary}`);
  }

  if (recentClues) {
    parts.push(`Recent insights:\n${recentClues}`);
  }

  return parts.join('\n\n');
}
