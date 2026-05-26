/**
 * Insight Agent Executor
 *
 * Why this exists: Runs the post-reconciliation insight workflow so route-level
 * orchestration can later trigger clue generation only after graph success.
 */

import { createThreadConfig, generateThreadId, getCheckpointer } from '../../checkpointer';
import { createInsightAgentGraph } from './graph';
import type { InsightAgentStateType } from './state';

/**
 * Insight Agent execution input.
 * Why this exists: The insight pass only needs the user identifier because it
 * derives all reasoning inputs from the persisted clean graph.
 */
export interface ExecuteInsightAgentInput {
  userId: string;
}

/**
 * Insight Agent execution result.
 * Why this exists: Route orchestration needs to know whether clue generation
 * succeeded before the next chat turn attempts to load it.
 */
export interface ExecuteInsightAgentResult {
  success: boolean;
  state: InsightAgentStateType;
  errors: string[];
}

let compiledInsightAgent:
  | ReturnType<ReturnType<typeof createInsightAgentGraph>['compile']>
  | null = null;

/**
 * Returns a cached compiled Insight Agent graph.
 * Why this exists: Background clue generation should reuse the compiled graph
 * instead of rebuilding it on every post-turn execution.
 */
async function getCompiledInsightAgent() {
  if (compiledInsightAgent) {
    return compiledInsightAgent;
  }

  const workflow = createInsightAgentGraph();

  try {
    const checkpointer = await getCheckpointer();
    compiledInsightAgent = workflow.compile({ checkpointer });
  } catch (error) {
    console.warn('[insight/executor] Checkpointer unavailable, compiling without persistence:', error);
    compiledInsightAgent = workflow.compile();
  }

  return compiledInsightAgent;
}

/**
 * Executes the Insight Agent once.
 * Why this exists: The Insight Agent is already deterministic except for its
 * fallback question phrasing, so it does not need the Graph Agent's retry loop.
 */
export async function executeInsightAgent(
  input: ExecuteInsightAgentInput
): Promise<ExecuteInsightAgentResult> {
  try {
    const graph = await getCompiledInsightAgent();
    const result = await graph.invoke(
      { userId: input.userId },
      createThreadConfig(generateThreadId(input.userId), 'insight-agent')
    );

    return {
      success: !(result.errors?.length > 0),
      state: result as InsightAgentStateType,
      errors: result.errors || [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Insight Agent execution failed';
    console.error('[insight/executor] Failed:', error);

    return {
      success: false,
      state: {} as InsightAgentStateType,
      errors: [message],
    };
  }
}
