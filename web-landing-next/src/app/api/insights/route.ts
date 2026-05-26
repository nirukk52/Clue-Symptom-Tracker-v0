/**
 * Insights API Route
 *
 * Why this exists: Centralizes insight operations (dismiss, fetch) with proper
 * error handling and user_id filtering. Components should not directly mutate
 * Supabase - they call this API instead.
 */

import { createClient } from '@supabase/supabase-js';

const MAX_INSIGHTS_RESPONSE = 10;

type GraphInsightNodeType = 'clue' | 'unknown';
type ApiInsightType = 'pattern' | 'next_question';
type GraphNodeStatus = 'active' | 'dismissed' | 'resolved' | 'archived';

interface GraphInsightNodeRow {
  id: string;
  type: GraphInsightNodeType;
  name: string;
  question_text: string | null;
  question_priority: number | null;
  status: GraphNodeStatus;
  data_json: Record<string, unknown> | null;
  created_at: string;
}

/**
 * parseInsightLimit clamps user-provided limits so the endpoint stays bounded.
 * Why this exists: The chat rail only needs a few ranked suggestions, while the
 * broader insights view still wants a safe upper limit.
 */
function parseInsightLimit(rawLimit: string | null): number {
  const parsedLimit = Number(rawLimit);

  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return MAX_INSIGHTS_RESPONSE;
  }

  return Math.min(Math.floor(parsedLimit), MAX_INSIGHTS_RESPONSE);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Maps API-facing insight types onto canonical graph node types.
 * Why this exists: The UI still requests `pattern` and `next_question`, but the
 * unified storage model now persists those concepts as clue and unknown nodes.
 */
function toGraphNodeType(rawType: string | null): GraphInsightNodeType {
  return rawType === 'next_question' ? 'unknown' : 'clue';
}

/**
 * Converts a graph node lifecycle state into the legacy insight status field.
 * Why this exists: Existing components expect a `status` property even though
 * graph nodes use lifecycle states rather than the old insights table enum.
 */
function toInsightStatus(status: GraphNodeStatus): string {
  return status === 'active' ? 'pending' : status;
}

/**
 * Shapes a clue or queued-question node into the API contract used by the UI.
 * Why this exists: The insights panel and suggestion rail should not care that
 * their backing store moved from `insights` rows to `graph_nodes`.
 */
function mapGraphNodeToInsightRow(row: GraphInsightNodeRow): Record<string, unknown> {
  const content = row.type === 'unknown' ? row.question_text?.trim() || row.name : row.name;
  const apiType: ApiInsightType = row.type === 'unknown' ? 'next_question' : 'pattern';

  return {
    id: row.id,
    type: apiType,
    content,
    reasoning: typeof row.data_json?.reasoning === 'string' ? row.data_json.reasoning : null,
    priority: row.type === 'unknown' ? (row.question_priority ?? 0) : null,
    status: toInsightStatus(row.status),
    metadata: row.data_json ?? {},
    created_at: row.created_at,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const insightType = searchParams.get('type');
    const limit = parseInsightLimit(searchParams.get('limit'));

    if (!userId) {
      return Response.json(
        { error: 'userId query param is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const graphNodeType = toGraphNodeType(insightType);

    let query = supabase
      .from('graph_nodes')
      .select('id, type, name, question_text, question_priority, status, data_json, created_at')
      .eq('user_id', userId)
      .eq('type', graphNodeType)
      .neq('status', 'dismissed');

    if (graphNodeType === 'unknown') {
      query = query.order('question_priority', { ascending: false });
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

    if (error) {
      console.error('[api/insights] Failed to fetch insights:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      insights: ((data as GraphInsightNodeRow[] | null) ?? []).map(mapGraphNodeToInsightRow),
    });
  } catch (err) {
    console.error('[api/insights] Unexpected error:', err);
    return Response.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { insightId, userId, status } = await req.json();

    if (!insightId || !userId) {
      return Response.json(
        { error: 'insightId and userId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const nextStatus: GraphNodeStatus =
      status === 'active' || status === 'resolved' || status === 'archived' || status === 'dismissed'
        ? status
        : 'dismissed';

    const { error } = await supabase
      .from('graph_nodes')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', insightId)
      .eq('user_id', userId);

    if (error) {
      console.error('[api/insights] Failed to update insight:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/insights] Unexpected error:', err);
    return Response.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}
