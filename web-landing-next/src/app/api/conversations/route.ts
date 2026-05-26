/**
 * Conversations API Route
 *
 * Why this exists: Centralizes conversation creation with proper error handling.
 * Components should not directly insert into Supabase - they call this API instead.
 * This ensures conversations are always created correctly with user_id.
 */

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (error) {
      console.error('[api/conversations] Failed to create conversation:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ conversationId: data.id });
  } catch (err) {
    console.error('[api/conversations] Unexpected error:', err);
    return Response.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
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
      .from('chat_conversations')
      .select('id, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[api/conversations] Failed to fetch conversation:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      conversationId: data?.id || null,
      updatedAt: data?.updated_at || null,
    });
  } catch (err) {
    console.error('[api/conversations] Unexpected error:', err);
    return Response.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
