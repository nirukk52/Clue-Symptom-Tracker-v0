/**
 * Insights API Route
 *
 * Why this exists: Centralizes insight operations (dismiss, fetch) with proper
 * error handling and user_id filtering. Components should not directly mutate
 * Supabase - they call this API instead.
 */

import { createClient } from '@supabase/supabase-js';

const MAX_INSIGHTS_RESPONSE = 10;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'userId query param is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'dismissed')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(MAX_INSIGHTS_RESPONSE);

    if (error) {
      console.error('[api/insights] Failed to fetch insights:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ insights: data || [] });
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

    const { error } = await supabase
      .from('insights')
      .update({ status: status || 'dismissed' })
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
