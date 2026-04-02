/**
 * Insight Agent StoreClue Node
 *
 * Why this exists: Persists the selected next-question clue so the Chat Agent
 * can inject it on the following turn without recomputing clinical logic.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { InsightAgentStateType, InsightAgentStateUpdate } from '../state';

/**
 * Creates a privileged Supabase client for clue persistence.
 * Why this exists: The Insight Agent writes background-generated clues to the
 * shared insights table outside of a direct user request.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Stores the latest clue in the insights table.
 * Why this exists: The clue is the durable handoff from the Insight Agent to
 * the next Chat Agent run.
 */
export async function storeClueNode(
  state: InsightAgentStateType
): Promise<InsightAgentStateUpdate> {
  if (!state.clue) {
    return {};
  }

  try {
    const supabase = getSupabase();
    const topConditions = state.topConditions.slice(0, 3).map((condition) => ({
      condition: condition.condition,
      probability: condition.probability,
      matchedSymptoms: condition.matchedSymptoms,
    }));

    const { data, error } = await supabase
      .from('insights')
      .insert({
        user_id: state.userId,
        type: 'next_question',
        content: state.clue.question,
        reasoning: state.clue.reasoning,
        priority: state.clue.priority,
        status: 'pending',
        metadata: {
          topConditions,
          method: state.topConditions.length > 0 ? 'info_gain' : 'fallback',
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('[insight/store-clue] Failed to store clue:', error);
      return {
        errors: [error.message],
      };
    }

    return {
      insightId: (data as { id: string } | null)?.id ?? null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to store clue';
    console.error('[insight/store-clue] Failed:', error);

    return {
      errors: [message],
    };
  }
}
