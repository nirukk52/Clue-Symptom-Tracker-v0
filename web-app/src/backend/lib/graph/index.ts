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

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetches the complete graph for a user (nodes + edges).
 * Returns Reagraph-compatible format.
 */
export async function getUserGraph(userId: string): Promise<GraphData> {
  const supabase = getSupabase();

  // Use the database function for optimized retrieval
  const { data, error } = await supabase.rpc('get_user_graph', {
    p_user_id: userId,
  });

  if (error) {
    console.error('[graph] get_user_graph failed:', error);
    return { nodes: [], edges: [] };
  }

  // The RPC returns {nodes: [...], edges: [...]} already
  return data as GraphData;
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

  // Get top unknown questions
  const unknowns = await getTopUnknownNodes(userId, 3);
  const unknownQuestions = unknowns
    .filter((u) => u.questionText)
    .map((u) => `- ${u.questionText}`)
    .join('\n');

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

  if (unknownQuestions) {
    parts.push(`Questions to explore:\n${unknownQuestions}`);
  }

  return parts.join('\n\n');
}
