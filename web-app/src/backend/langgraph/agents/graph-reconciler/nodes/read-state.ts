/**
 * Graph Reconciler ReadState Node
 *
 * Why this exists: Loads the exact logs, messages, and cursor watermark that
 * the Graph Agent needs to reconcile new user activity into the knowledge graph.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getUserGraph } from '@/backend/lib/graph';
import { extractTextFromStoredChatMessage } from '@/lib/chat-ui-messages';

import type {
  ConversationMessage,
  GraphReconcilerStateType,
  GraphReconcilerStateUpdate,
  MedicationLogRecord,
  MoodLogRecord,
  RecentLogs,
  SymptomLogRecord,
} from '../state';

/**
 * Minimal cursor row shape used by the Graph Agent.
 * Why this exists: Reconciliation only needs the last success watermark and
 * current running flag from the cursor table.
 */
interface AgentCursorRow {
  cursor_at: string;
  is_running: boolean;
}

/**
 * Minimal conversation row shape for message fan-out.
 * Why this exists: chat_messages are keyed by conversation_id, so we first need
 * the user's conversation IDs before reading recent messages.
 */
interface ConversationRow {
  id: string;
}

/**
 * Minimal raw chat message row shape from Supabase.
 * Why this exists: Message persistence now stores serialized `UIMessage` JSON in
 * a text column, while legacy rows may still be plain text.
 */
interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string | null;
  created_at: string;
}

/**
 * Minimal raw medication row from Supabase.
 * Why this exists: The database column name differs from the state model name,
 * so we normalize it in one place.
 */
interface MedicationLogRow {
  id: string;
  med_name: string;
  dosage: string | null;
  notes: string | null;
  logged_at: string;
}

/**
 * Minimal raw mood row from Supabase.
 * Why this exists: The database uses note singular while the agent state uses
 * notes for consistency with other log records.
 */
interface MoodLogRow {
  id: string;
  rating: number;
  note: string | null;
  logged_at: string;
}

/**
 * Creates a privileged Supabase client for server-side reconciliation.
 * Why this exists: The Graph Agent runs outside user requests and needs service
 * role access to read across the user's stored logs and conversations.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fetches the last successful Graph Agent cursor for a user.
 * Why this exists: The Graph Agent must only reconcile new activity and leave
 * the cursor untouched when a run fails.
 */
async function getCursorAt(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('agent_cursors')
    .select('cursor_at, is_running')
    .eq('user_id', userId)
    .eq('agent_name', 'graph_reconciler')
    .maybeSingle<AgentCursorRow>();

  if (error) {
    console.error('[graph-reconciler/read-state] Failed to load cursor:', error);
  }

  return data?.cursor_at ?? new Date(0).toISOString();
}

/**
 * Fetches all recent chat messages after the cursor watermark.
 * Why this exists: Entity extraction needs the user and assistant exchange,
 * including confirmations that may not have been logged as tools.
 */
async function getRecentMessages(
  supabase: SupabaseClient,
  userId: string,
  cursorAt: string
): Promise<ConversationMessage[]> {
  const { data: conversations, error: conversationError } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (conversationError) {
    console.error('[graph-reconciler/read-state] Failed to load conversations:', conversationError);
    return [];
  }

  const conversationIds = (conversations as ConversationRow[] | null)?.map((row) => row.id) ?? [];
  if (conversationIds.length === 0) {
    return [];
  }

  const { data: messages, error: messageError } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .in('conversation_id', conversationIds)
    .gt('created_at', cursorAt)
    .order('created_at', { ascending: true });

  if (messageError) {
    console.error('[graph-reconciler/read-state] Failed to load messages:', messageError);
    return [];
  }

  return ((messages as ChatMessageRow[] | null) ?? []).map((message) => ({
    id: message.id,
    role: message.role,
    content: extractTextFromStoredChatMessage(message),
    created_at: message.created_at,
  }));
}

/**
 * Reads the recent structured log tables in parallel.
 * Why this exists: These logs are the Graph Agent's primary source of truth and
 * should be fetched together from a single cursor watermark.
 */
async function getRecentLogs(
  supabase: SupabaseClient,
  userId: string,
  cursorAt: string
): Promise<RecentLogs> {
  const [symptomResult, medicationResult, moodResult] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('id, symptom_name, severity, notes, logged_at')
      .eq('user_id', userId)
      .gt('logged_at', cursorAt)
      .order('logged_at', { ascending: true }),
    supabase
      .from('medication_logs')
      .select('id, med_name, dosage, notes, logged_at')
      .eq('user_id', userId)
      .gt('logged_at', cursorAt)
      .order('logged_at', { ascending: true }),
    supabase
      .from('mood_logs')
      .select('id, rating, note, logged_at')
      .eq('user_id', userId)
      .gt('logged_at', cursorAt)
      .order('logged_at', { ascending: true }),
  ]);

  if (symptomResult.error) {
    console.error('[graph-reconciler/read-state] Failed to load symptom logs:', symptomResult.error);
  }

  if (medicationResult.error) {
    console.error('[graph-reconciler/read-state] Failed to load medication logs:', medicationResult.error);
  }

  if (moodResult.error) {
    console.error('[graph-reconciler/read-state] Failed to load mood logs:', moodResult.error);
  }

  const symptomLogs: SymptomLogRecord[] =
    ((symptomResult.data as SymptomLogRecord[] | null) ?? []).map((row) => ({
      id: row.id,
      symptom_name: row.symptom_name,
      severity: row.severity,
      notes: row.notes,
      logged_at: row.logged_at,
    }));

  const medicationLogs: MedicationLogRecord[] =
    ((medicationResult.data as MedicationLogRow[] | null) ?? []).map((row) => ({
      id: row.id,
      medication_name: row.med_name,
      dosage: row.dosage,
      notes: row.notes,
      logged_at: row.logged_at,
    }));

  const moodLogs: MoodLogRecord[] =
    ((moodResult.data as MoodLogRow[] | null) ?? []).map((row) => ({
      id: row.id,
      rating: row.rating,
      notes: row.note,
      logged_at: row.logged_at,
    }));

  return {
    symptomLogs,
    medicationLogs,
    moodLogs,
  };
}

/**
 * Loads the reconciliation snapshot for the Graph Agent.
 * Why this exists: Centralizes cursor, log, message, and graph reads so later
 * nodes operate on one consistent state view.
 */
export async function readStateNode(
  state: GraphReconcilerStateType
): Promise<GraphReconcilerStateUpdate> {
  const userId = state.userId;
  if (userId === 'anonymous') {
    return {
      cursorAt: new Date(0).toISOString(),
      recentLogs: {
        symptomLogs: [],
        medicationLogs: [],
        moodLogs: [],
      },
      recentMessages: [],
      currentGraph: { nodes: [], edges: [] },
    };
  }

  try {
    const supabase = getSupabase();
    const cursorAt = await getCursorAt(supabase, userId);

    const [recentLogs, recentMessages, currentGraph] = await Promise.all([
      getRecentLogs(supabase, userId, cursorAt),
      getRecentMessages(supabase, userId, cursorAt),
      getUserGraph(userId),
    ]);

    return {
      cursorAt,
      recentLogs,
      recentMessages,
      currentGraph,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read graph reconciler state';
    console.error('[graph-reconciler/read-state] Failed:', error);

    return {
      errors: [message],
    };
  }
}
