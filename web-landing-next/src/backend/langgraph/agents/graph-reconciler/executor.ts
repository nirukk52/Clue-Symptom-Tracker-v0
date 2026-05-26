/**
 * Graph Reconciler Executor
 *
 * Why this exists: Runs the post-turn Graph Agent with retry semantics so the
 * future route integration can hand off graph repair without blocking the user.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { createThreadConfig, generateThreadId, getCheckpointer } from '../../checkpointer';
import { createGraphReconcilerGraph } from './graph';
import type { GraphReconcilerStateType } from './state';

/**
 * Graph Agent execution input.
 * Why this exists: The Graph Agent only needs the user identifier because it
 * rebuilds its working set from persisted logs and messages.
 */
export interface ExecuteGraphReconcilerInput {
  userId: string;
}

/**
 * Graph Agent execution result.
 * Why this exists: Future route orchestration needs to know whether the graph
 * pass succeeded before kicking off the Insight Agent.
 */
export interface ExecuteGraphReconcilerResult {
  success: boolean;
  state: GraphReconcilerStateType;
  errors: string[];
}

/**
 * Minimal cursor row shape used to preserve the reconciliation watermark.
 * Why this exists: Retry bookkeeping must not advance the cursor when a run
 * fails, otherwise the Graph Agent could silently skip data.
 */
interface AgentCursorRow {
  cursor_at: string;
}

let compiledGraphReconciler:
  | ReturnType<ReturnType<typeof createGraphReconcilerGraph>['compile']>
  | null = null;

/**
 * Creates a privileged Supabase client for cursor flags.
 * Why this exists: The executor owns the running flag that prevents overlapping
 * Graph Agent runs for the same user.
 */
function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Returns a cached compiled Graph Reconciler graph.
 * Why this exists: Post-turn processing should avoid recompiling the workflow on
 * every request once the graph structure is stable.
 */
async function getCompiledGraphReconciler() {
  if (compiledGraphReconciler) {
    return compiledGraphReconciler;
  }

  const workflow = createGraphReconcilerGraph();

  try {
    const checkpointer = await getCheckpointer();
    compiledGraphReconciler = workflow.compile({ checkpointer });
  } catch (error) {
    console.warn('[graph-reconciler/executor] Checkpointer unavailable, compiling without persistence:', error);
    compiledGraphReconciler = workflow.compile();
  }

  return compiledGraphReconciler;
}

/**
 * Updates the Graph Agent running flag.
 * Why this exists: The future route integration should not launch overlapping
 * reconciliations for the same user.
 */
async function setRunning(userId: string, isRunning: boolean): Promise<void> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data: currentCursor } = await supabase
    .from('agent_cursors')
    .select('cursor_at')
    .eq('user_id', userId)
    .eq('agent_name', 'graph_reconciler')
    .maybeSingle<AgentCursorRow>();

  const { error } = await supabase.from('agent_cursors').upsert({
    user_id: userId,
    agent_name: 'graph_reconciler',
    cursor_at: currentCursor?.cursor_at ?? new Date(0).toISOString(),
    is_running: isRunning,
    updated_at: now,
  });

  if (error) {
    console.error('[graph-reconciler/executor] Failed to update running flag:', error);
  }
}

/**
 * Sleeps between retry attempts.
 * Why this exists: Retries should back off briefly so transient DB or network
 * issues do not immediately fail the whole post-turn chain.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes the Graph Reconciler once.
 * Why this exists: Separates the pure graph invocation from the retry loop.
 */
async function runGraphReconcilerOnce(
  input: ExecuteGraphReconcilerInput
): Promise<ExecuteGraphReconcilerResult> {
  try {
    const graph = await getCompiledGraphReconciler();
    const result = await graph.invoke(
      { userId: input.userId },
      createThreadConfig(generateThreadId(input.userId), 'graph-reconciler')
    );

    return {
      success: !(result.errors?.length > 0),
      state: result as GraphReconcilerStateType,
      errors: result.errors || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Graph Reconciler execution failed';
    console.error('[graph-reconciler/executor] Failed:', error);

    return {
      success: false,
      state: {} as GraphReconcilerStateType,
      errors: [message],
    };
  }
}

/**
 * Executes the Graph Reconciler with retry semantics.
 * Why this exists: The architecture calls for retries before giving up and
 * skipping downstream insight generation.
 */
export async function executeGraphReconciler(
  input: ExecuteGraphReconcilerInput
): Promise<ExecuteGraphReconcilerResult> {
  const delays = [0, 1000, 2000];
  await setRunning(input.userId, true);

  try {
    for (let index = 0; index < delays.length; index += 1) {
      if (delays[index] > 0) {
        await sleep(delays[index]);
      }

      const result = await runGraphReconcilerOnce(input);
      if (result.success) {
        await setRunning(input.userId, false);
        return result;
      }
    }

    await setRunning(input.userId, false);
    return {
      success: false,
      state: {} as GraphReconcilerStateType,
      errors: ['Graph Reconciler failed after 3 attempts'],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Graph Reconciler retry loop failed';
    await setRunning(input.userId, false);

    return {
      success: false,
      state: {} as GraphReconcilerStateType,
      errors: [message],
    };
  }
}
