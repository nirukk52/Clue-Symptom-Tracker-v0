/**
 * Insight Agent ScoreConditions Node
 *
 * Why this exists: Runs deterministic HealthKG scoring on the reconciled
 * symptom set so clue generation stays grounded in stable clinical priors.
 */

import { scoreConditions } from '@/backend/lib/graph/health-kg';

import type { InsightAgentStateType, InsightAgentStateUpdate } from '../state';

/**
 * Scores the user's candidate conditions from known symptoms.
 * Why this exists: The Insight Agent should compute likely conditions only from
 * the clean graph, never from partially processed turn state.
 */
export async function scoreConditionsNode(
  state: InsightAgentStateType
): Promise<InsightAgentStateUpdate> {
  try {
    const knownSymptoms = Array.from(state.knownSymptoms);
    const topConditions = knownSymptoms.length > 0 ? scoreConditions(knownSymptoms, 5) : [];

    return {
      topConditions,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to score conditions';
    console.error('[insight/score-conditions] Failed:', error);

    return {
      topConditions: [],
      errors: [message],
    };
  }
}
