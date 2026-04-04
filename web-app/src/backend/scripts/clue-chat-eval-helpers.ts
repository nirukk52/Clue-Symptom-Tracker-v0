/**
 * Clue Chat Eval Helpers
 *
 * Why this exists: The regression workflow now needs one reusable place for
 * purge, replay, stored-state snapshot, and rendered-graph reads so scenario
 * evals can score the same durable state that the canvas and insight flow use.
 */

import type { UIMessage } from 'ai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { deserializeStoredChatMessage, extractTextFromStoredChatMessage } from '@/lib/chat-ui-messages';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zvpudxinbcsrfyojrhhv.supabase.co';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Stored chat message preview used by replay diagnostics.
 * Why this exists: Scenario evals need compact message text for readable output
 * without forcing developers to inspect the raw UIMessage JSON.
 */
export interface StoredConversationMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
}

/**
 * Conversation snapshot used by state-based chat evals.
 * Why this exists: Final reports should show whether the tested turn sequence
 * was actually persisted before graph and insight assertions run.
 */
export interface StoredConversationSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredConversationMessage[];
}

/**
 * Graph node snapshot from the persistent graph tables.
 * Why this exists: The evaluator needs type, label, and lifecycle state when
 * checking whether reconciliation produced the intended knowledge graph.
 */
export interface PersistedGraphNodeSnapshot {
  id: string;
  type: string;
  label: string;
  status: string;
  subLabel: string | null;
  confidence: string | null;
  confidenceScore: number | null;
  questionText: string | null;
  questionPriority: number;
}

/**
 * Graph edge snapshot from the persistent graph tables.
 * Why this exists: Some regressions only appear as relationship bugs rather
 * than missing nodes, so evals need direct edge visibility too.
 */
export interface PersistedGraphEdgeSnapshot {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: string;
  weight: number;
  observationCount: number;
}

/**
 * Symptom log snapshot used during state assertions.
 * Why this exists: The chat agent contract is partly measured through durable
 * structured logs, not just the graph that gets rendered later.
 */
export interface SymptomLogSnapshot {
  symptomName: string;
  severity: number | null;
  notes: string | null;
  loggedAt: string;
}

/**
 * Medication log snapshot used during state assertions.
 * Why this exists: Medication mentions are stored outside the graph first, so
 * replay evals need a stable view of those rows as well.
 */
export interface MedicationLogSnapshot {
  medName: string;
  dosage: string | null;
  taken: boolean;
  timing: string | null;
  notes: string | null;
  loggedAt: string;
}

/**
 * Mood log snapshot used during state assertions.
 * Why this exists: Mood data has its own table and timeline behavior, so the
 * eval runner needs direct access when scenarios cover emotional state.
 */
export interface MoodLogSnapshot {
  rating: number;
  note: string | null;
  loggedAt: string;
}

/**
 * Timeline snapshot used during state assertions.
 * Why this exists: The user-facing timeline is one of the main proof points
 * that the logging tools persisted the turn in a useful format.
 */
export interface TimelineEntrySnapshot {
  type: string;
  title: string;
  description: string | null;
  severity: number | null;
  dosage: string | null;
  status: string | null;
  entryTime: string;
}

/**
 * Insight snapshot used during state assertions.
 * Why this exists: The insight agent's durable handoff is stored in `insights`,
 * so evals need the latest clue metadata and lifecycle state.
 */
export interface InsightSnapshot {
  id: string;
  type: string;
  content: string;
  reasoning: string | null;
  priority: number | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Rendered graph snapshot from `/api/graph`.
 * Why this exists: The user asked to validate the final graph state that the
 * canvas renders, so the eval runner reads that exact payload too.
 */
export interface RenderedGraphSnapshot {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    subLabel?: string;
    questionText?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    relationship: string;
  }>;
}

/**
 * Full stored-state snapshot for one replay run.
 * Why this exists: Scenario evals need one deterministic structure that can be
 * compared against expectations and reported back to developers.
 */
export interface UserStateSnapshot {
  userId: string;
  email: string;
  conversations: StoredConversationSnapshot[];
  graphNodes: PersistedGraphNodeSnapshot[];
  graphEdges: PersistedGraphEdgeSnapshot[];
  symptomLogs: SymptomLogSnapshot[];
  medicationLogs: MedicationLogSnapshot[];
  moodLogs: MoodLogSnapshot[];
  timelineEntries: TimelineEntrySnapshot[];
  insights: InsightSnapshot[];
  renderedGraph: RenderedGraphSnapshot;
}

/**
 * Resolved auth identity for a replay target.
 * Why this exists: The eval loop begins from an email or lookup hint, but the
 * app and graph APIs operate on the underlying Supabase auth user ID.
 */
export interface ResolvedUser {
  userId: string;
  email: string;
  matchedBy: 'exact' | 'partial';
}

/**
 * Creates the privileged Supabase client for regression tooling.
 * Why this exists: The replay and snapshot scripts need auth admin lookup and
 * unrestricted table access, which are only available with service-role access.
 */
export function getAdminSupabase(): SupabaseClient {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from your env file.');
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Pauses between replay steps and post-turn settlement checks.
 * Why this exists: Chat completion and the background graph/insight agents do
 * not finish synchronously with the HTTP request.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves an email or unique partial hint to one auth user.
 * Why this exists: Local regression loops often start from a short lookup hint,
 * but the replay code needs an exact user ID to mimic real app behavior.
 */
export async function resolveUserIdentifier(emailOrHint: string): Promise<ResolvedUser> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const users = data.users ?? [];
  const exactMatch = users.find((user) => user.email === emailOrHint);
  if (exactMatch?.email) {
    return {
      userId: exactMatch.id,
      email: exactMatch.email,
      matchedBy: 'exact',
    };
  }

  const lowerHint = emailOrHint.toLowerCase();
  const partialMatches = users.filter((user) => user.email?.toLowerCase().includes(lowerHint));

  if (partialMatches.length === 1 && partialMatches[0]?.email) {
    return {
      userId: partialMatches[0].id,
      email: partialMatches[0].email,
      matchedBy: 'partial',
    };
  }

  if (partialMatches.length > 1) {
    throw new Error(
      `Multiple users matched "${emailOrHint}":\n${partialMatches
        .map((user) => `- ${user.email}`)
        .join('\n')}`
    );
  }

  const knownEmails = users
    .map((user) => user.email)
    .filter(Boolean)
    .join('\n');

  throw new Error(`No user found for "${emailOrHint}".\nExisting users:\n${knownEmails}`);
}

/**
 * Deletes rows from a user-owned table.
 * Why this exists: Scenario evals should start from clean state so graph and
 * insight assertions reflect only the replay that just ran.
 */
async function purgeByUserId(table: string, userId: string): Promise<number> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache')) {
      return 0;
    }

    throw new Error(`Failed to purge ${table}: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Deletes chat messages by looking up the user's conversations first.
 * Why this exists: `chat_messages` does not store `user_id`, so scenario purges
 * need an FK-safe path through `chat_conversations`.
 */
async function purgeChatMessages(userId: string): Promise<number> {
  const supabase = getAdminSupabase();
  const { data: conversations, error: conversationError } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('user_id', userId);

  if (conversationError) {
    throw new Error(`Failed to fetch conversations: ${conversationError.message}`);
  }

  if (!conversations?.length) {
    return 0;
  }

  const conversationIds = conversations.map((conversation) => conversation.id);
  const { data, error } = await supabase
    .from('chat_messages')
    .delete()
    .in('conversation_id', conversationIds)
    .select('id');

  if (error) {
    throw new Error(`Failed to purge chat_messages: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Clears all app state for one user while preserving the auth account.
 * Why this exists: Each scenario should evaluate a fresh graph and clue queue
 * instead of inheriting rows from an earlier replay.
 */
export async function purgeUserState(userId: string): Promise<number> {
  let totalDeleted = 0;

  for (const table of [
    'graph_edges',
    'graph_nodes',
    'symptom_logs',
    'medication_logs',
    'mood_logs',
    'timeline_entries',
    'insights',
    'agent_cursors',
    'user_preferences',
    'doctor_summaries',
  ]) {
    totalDeleted += await purgeByUserId(table, userId);
  }

  totalDeleted += await purgeChatMessages(userId);
  totalDeleted += await purgeByUserId('chat_conversations', userId);

  return totalDeleted;
}

/**
 * Creates a fresh conversation through the local app API.
 * Why this exists: The replay should exercise the same conversation creation
 * path that the browser uses before it sends chat turns.
 */
export async function createConversation(baseUrl: string, userId: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Conversation creation failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { conversationId?: string };
  if (!payload.conversationId) {
    throw new Error(`Conversation creation returned no conversationId: ${JSON.stringify(payload)}`);
  }

  return payload.conversationId;
}

/**
 * Loads the persisted conversation history as `UIMessage[]`.
 * Why this exists: The live app sends accumulated chat history on every turn, so
 * eval replays must do the same or numeric follow-ups lose their prior context.
 */
async function loadConversationMessages(conversationId: string): Promise<UIMessage[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load conversation history for ${conversationId}: ${error.message}`);
  }

  return (data ?? []).map((message) =>
    deserializeStoredChatMessage({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: message.content as string | null,
    })
  );
}

/**
 * Sends one user turn through the live chat route.
 * Why this exists: State-based evals are only meaningful if they drive the same
 * `/api/chat` path and accumulated message history that production chat uses.
 */
export async function sendChatTurn(
  baseUrl: string,
  userId: string,
  conversationId: string,
  text: string
): Promise<string> {
  const history = await loadConversationMessages(conversationId);
  const nextUserMessage: UIMessage = {
    id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'user',
    parts: [{ type: 'text', text }],
  };

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...history, nextUserMessage],
      userId,
      conversationId,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Chat request failed for "${text}" with status ${response.status}: ${raw}`);
  }

  return raw;
}

/**
 * Fetches the graph payload that the canvas would render.
 * Why this exists: The eval should validate the final user-facing graph state,
 * not only the raw graph tables behind it.
 */
export async function fetchRenderedGraph(
  baseUrl: string,
  userId: string
): Promise<RenderedGraphSnapshot> {
  const response = await fetch(`${baseUrl}/api/graph?userId=${encodeURIComponent(userId)}`);
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Graph API request failed with status ${response.status}: ${raw}`);
  }

  return JSON.parse(raw) as RenderedGraphSnapshot;
}

/**
 * Builds a full stored-state snapshot after a replay run.
 * Why this exists: One snapshot object lets the eval runner compare logs, graph,
 * insights, and rendered canvas data without repeated ad-hoc queries.
 */
export async function buildUserStateSnapshot(
  userId: string,
  email: string,
  baseUrl: string
): Promise<UserStateSnapshot> {
  const supabase = getAdminSupabase();
  const [conversationResult, nodeResult, edgeResult, symptomResult, medicationResult, moodResult, timelineResult, insightResult, renderedGraph] =
    await Promise.all([
      supabase
        .from('chat_conversations')
        .select('id, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('graph_nodes')
        .select('id, type, name, status, sub_label, confidence, confidence_score, question_text, question_priority')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('graph_edges')
        .select('id, source_node_id, target_node_id, relationship, weight, observation_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('symptom_logs')
        .select('symptom_name, severity, notes, logged_at')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false }),
      supabase
        .from('medication_logs')
        .select('med_name, dosage, taken, timing, notes, logged_at')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false }),
      supabase
        .from('mood_logs')
        .select('rating, note, logged_at')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false }),
      supabase
        .from('timeline_entries')
        .select('type, title, description, severity, dosage, status, entry_time')
        .eq('user_id', userId)
        .order('entry_time', { ascending: false }),
      supabase
        .from('insights')
        .select('id, type, content, reasoning, priority, status, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      fetchRenderedGraph(baseUrl, userId),
    ]);

  if (conversationResult.error) {
    throw new Error(`Failed to load conversations: ${conversationResult.error.message}`);
  }

  const conversations = await Promise.all(
    (conversationResult.data ?? []).map(async (conversation) => {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to load messages for ${conversation.id}: ${error.message}`);
      }

      return {
        id: conversation.id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        messages: (messages ?? []).map((message) => ({
          role: message.role as 'user' | 'assistant' | 'system',
          createdAt: message.created_at,
          text: extractTextFromStoredChatMessage({
            id: `${conversation.id}:${message.created_at}`,
            role: message.role as 'user' | 'assistant',
            content: message.content as string | null,
          }),
        })),
      } satisfies StoredConversationSnapshot;
    })
  );

  if (nodeResult.error) {
    throw new Error(`Failed to load graph nodes: ${nodeResult.error.message}`);
  }

  if (edgeResult.error) {
    throw new Error(`Failed to load graph edges: ${edgeResult.error.message}`);
  }

  if (symptomResult.error) {
    throw new Error(`Failed to load symptom logs: ${symptomResult.error.message}`);
  }

  if (medicationResult.error) {
    throw new Error(`Failed to load medication logs: ${medicationResult.error.message}`);
  }

  if (moodResult.error) {
    throw new Error(`Failed to load mood logs: ${moodResult.error.message}`);
  }

  if (timelineResult.error) {
    throw new Error(`Failed to load timeline entries: ${timelineResult.error.message}`);
  }

  if (insightResult.error) {
    throw new Error(`Failed to load insights: ${insightResult.error.message}`);
  }

  return {
    userId,
    email,
    conversations,
    graphNodes: (nodeResult.data ?? []).map((node) => ({
      id: node.id,
      type: node.type,
      label: node.name,
      status: node.status,
      subLabel: node.sub_label,
      confidence: node.confidence,
      confidenceScore: node.confidence_score,
      questionText: node.question_text,
      questionPriority: node.question_priority,
    })),
    graphEdges: (edgeResult.data ?? []).map((edge) => ({
      id: edge.id,
      sourceNodeId: edge.source_node_id,
      targetNodeId: edge.target_node_id,
      relationship: edge.relationship,
      weight: edge.weight,
      observationCount: edge.observation_count,
    })),
    symptomLogs: (symptomResult.data ?? []).map((log) => ({
      symptomName: log.symptom_name,
      severity: log.severity,
      notes: log.notes,
      loggedAt: log.logged_at,
    })),
    medicationLogs: (medicationResult.data ?? []).map((log) => ({
      medName: log.med_name,
      dosage: log.dosage,
      taken: log.taken,
      timing: log.timing,
      notes: log.notes,
      loggedAt: log.logged_at,
    })),
    moodLogs: (moodResult.data ?? []).map((log) => ({
      rating: log.rating,
      note: log.note,
      loggedAt: log.logged_at,
    })),
    timelineEntries: (timelineResult.data ?? []).map((entry) => ({
      type: entry.type,
      title: entry.title,
      description: entry.description,
      severity: entry.severity,
      dosage: entry.dosage,
      status: entry.status,
      entryTime: entry.entry_time,
    })),
    insights: (insightResult.data ?? []).map((insight) => ({
      id: insight.id,
      type: insight.type,
      content: insight.content,
      reasoning: insight.reasoning,
      priority: insight.priority,
      status: insight.status,
      metadata: (insight.metadata as Record<string, unknown> | null) ?? null,
      createdAt: insight.created_at,
    })),
    renderedGraph,
  };
}
