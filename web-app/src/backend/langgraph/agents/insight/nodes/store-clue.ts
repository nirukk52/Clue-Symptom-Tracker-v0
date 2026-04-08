/**
 * Insight Agent StoreClue Node
 *
 * Why this exists: Persists the selected next-question clue so the Chat Agent
 * can inject it on the following turn without recomputing clinical logic.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { purgeDismissedNodesByType, upsertGraphNode } from '@/backend/lib/graph';
import { canonicalizeSymptomName } from '@/backend/lib/graph/health-kg';
import type { InsightAgentStateType, InsightAgentStateUpdate } from '../state';

const MAX_ACTIVE_NEXT_QUESTIONS = 10;

/**
 * Creates a privileged Supabase client for clue persistence.
 * Why this exists: The Insight Agent writes background-generated follow-up
 * questions to the graph outside of a direct user request.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface ExistingInsightRow {
  id: string;
  question_text: string | null;
  question_priority?: number | null;
  created_at?: string | null;
  data_json: { relatedSymptom?: string | null } | null;
}

/**
 * Normalizes a tracked follow-up label for lifecycle comparisons.
 * Why this exists: Stored clue metadata and parsed question text should compare
 * against the current graph using the same canonical symptom vocabulary.
 */
function normalizeTrackedLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (['sleep', 'stress', 'energy', 'mood'].includes(lower)) {
    return lower;
  }

  return canonicalizeSymptomName(trimmed).toLowerCase();
}

/**
 * Extracts the target label from a stored next-question node.
 * Why this exists: Older clue nodes may lack structured metadata, so cleanup must
 * recover the intended symptom or factor from the question text when possible.
 */
function inferTrackedLabelFromQuestion(question: string | null | undefined): string | null {
  if (!question) {
    return null;
  }

  const trimmed = question.trim();
  const symptomMatch =
    trimmed.match(/^Have you been experiencing (.+)\?$/i) ??
    trimmed.match(/^Have you noticed any (.+)\?$/i) ??
    trimmed.match(/^Are you having any (.+)\?$/i);

  if (symptomMatch?.[1]) {
    return normalizeTrackedLabel(symptomMatch[1]);
  }

  if (/sleep/i.test(trimmed)) return 'sleep';
  if (/stress/i.test(trimmed)) return 'stress';
  if (/energy/i.test(trimmed)) return 'energy';
  if (/mood/i.test(trimmed)) return 'mood';

  return null;
}

/**
 * Dismisses stale answered or duplicate next-question nodes before storing a new one.
 * Why this exists: The latest clue should reflect the current graph, not keep
 * resurfacing symptoms or factors the user already answered.
 */
async function dismissObsoleteClues(
  supabase: SupabaseClient,
  state: InsightAgentStateType
): Promise<void> {
  const knownLabels = new Set<string>([
    ...Array.from(state.knownSymptoms).map((symptom) => normalizeTrackedLabel(symptom)).filter(Boolean),
    ...state.factorNodes.map((node) => normalizeTrackedLabel(node.label)).filter(Boolean),
  ] as string[]);
  const newQuestion = state.clue?.question.trim().toLowerCase();
  const newTrackedLabel = normalizeTrackedLabel(state.clue?.relatedSymptom ?? null);

  const { data, error } = await supabase
    .from('graph_nodes')
    .select('id, question_text, data_json')
    .eq('user_id', state.userId)
    .eq('type', 'unknown')
    .eq('status', 'active');

  if (error) {
    console.error('[insight/store-clue] Failed to load existing queued questions for cleanup:', error);
    return;
  }

  const clueNodeIdsToDismiss = ((data as ExistingInsightRow[] | null) ?? [])
    .filter((row) => {
      const trackedLabel =
        normalizeTrackedLabel(row.data_json?.relatedSymptom) ??
        inferTrackedLabelFromQuestion(row.question_text);
      const normalizedQuestion = row.question_text?.trim().toLowerCase() ?? null;

      return (
        (trackedLabel !== null && knownLabels.has(trackedLabel)) ||
        (newQuestion !== null && normalizedQuestion === newQuestion) ||
        (newTrackedLabel !== null && trackedLabel === newTrackedLabel)
      );
    })
    .map((row) => row.id);

  if (clueNodeIdsToDismiss.length === 0) {
    return;
  }

  const { error: dismissError } = await supabase
    .from('graph_nodes')
    .update({ status: 'dismissed', updated_at: new Date().toISOString() })
    .in('id', clueNodeIdsToDismiss);

  if (dismissError) {
    console.error('[insight/store-clue] Failed to dismiss obsolete queued questions:', dismissError);
  }
}

/**
 * Dismisses low-ranked overflow clues beyond the active queue cap.
 * Why this exists: The next-question backlog should stay bounded so stale clues
 * do not accumulate indefinitely and crowd out better ranked follow-ups.
 */
async function pruneClueBacklog(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('graph_nodes')
    .select('id, question_priority, created_at')
    .eq('user_id', userId)
    .eq('type', 'unknown')
    .eq('status', 'active')
    .order('question_priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[insight/store-clue] Failed to load queued-question backlog for pruning:', error);
    return;
  }

  const rows = (data as ExistingInsightRow[] | null) ?? [];
  if (rows.length <= MAX_ACTIVE_NEXT_QUESTIONS) {
    return;
  }

  const clueNodeIdsToDismiss = rows.slice(MAX_ACTIVE_NEXT_QUESTIONS).map((row) => row.id);
  const { error: dismissError } = await supabase
    .from('graph_nodes')
    .update({ status: 'dismissed', updated_at: new Date().toISOString() })
    .in('id', clueNodeIdsToDismiss);

  if (dismissError) {
    console.error('[insight/store-clue] Failed to prune queued-question backlog:', dismissError);
  }
}

/**
 * Stores the latest clue as a graph-backed unknown node.
 * Why this exists: The next-turn question should share the same canonical graph
 * storage model as the rest of the chat canvas.
 */
export async function storeClueNode(
  state: InsightAgentStateType
): Promise<InsightAgentStateUpdate> {
  if (!state.clue) {
    return {};
  }

  try {
    const supabase = getSupabase();
    await dismissObsoleteClues(supabase, state);
    await purgeDismissedNodesByType(state.userId, 'unknown');
    const topConditions = state.topConditions.slice(0, 3).map((condition) => ({
      condition: condition.condition,
      probability: condition.probability,
      matchedSymptoms: condition.matchedSymptoms,
    }));

    const clueNodeId = await upsertGraphNode(state.userId, {
      type: 'unknown',
      name: truncate(state.clue.question, 50),
      subLabel: 'Tap to answer',
      questionText: state.clue.question,
      questionPriority: state.clue.priority,
      data: {
        topConditions,
        method: state.topConditions.length > 0 ? 'info_gain' : 'fallback',
        relatedSymptom: state.clue.relatedSymptom ?? null,
        reasoning: state.clue.reasoning,
      },
    });

    if (!clueNodeId) {
      return {
        errors: ['Failed to store clue node.'],
      };
    }

    await pruneClueBacklog(supabase, state.userId);
    await purgeDismissedNodesByType(state.userId, 'unknown');

    return {
      insightId: clueNodeId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to store clue';
    console.error('[insight/store-clue] Failed:', error);

    return {
      errors: [message],
    };
  }
}

/**
 * Shortens queued-question labels for graph display.
 * Why this exists: Full question text lives in `question_text`, while the node
 * label on the canvas should stay compact and readable.
 */
function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}
