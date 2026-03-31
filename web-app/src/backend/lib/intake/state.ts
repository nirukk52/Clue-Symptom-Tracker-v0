/**
 * Dynamic intake state persistence
 *
 * Why this exists: Persists the canonical active intake question and problem
 * threads in Supabase so intake ownership does not depend on prompts or graph
 * nodes.
 */

import { createClient } from '@supabase/supabase-js';

import type { ActiveIntakeQuestion, IntakeState, ProblemThread } from './types';

/**
 * Builds a service-role Supabase client for server-side intake state access.
 * Why this exists: Intake state is backend-owned and should not depend on
 * client session credentials.
 */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Returns the persisted intake state for a user.
 * Why this exists: The pipeline needs a single canonical place to read the
 * active structured question before interpreting terse replies.
 */
export async function getIntakeState(userId: string): Promise<IntakeState> {
  const supabase = getSupabase();
  const fallback: IntakeState = {
    flareMode: false,
    activeProblemThreadId: null,
    problemThreads: [],
    activeQuestion: null,
  };

  const { data, error } = await supabase
    .from('user_preferences')
    .select('flare_mode, active_problem_thread_id, intake_problem_threads, active_intake_question')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('[intake/state] Failed to load intake state:', error);
    }
    return fallback;
  }

  return {
    flareMode: data.flare_mode ?? false,
    activeProblemThreadId: typeof data.active_problem_thread_id === 'string'
      ? data.active_problem_thread_id
      : null,
    problemThreads: normalizeProblemThreads(data.intake_problem_threads),
    activeQuestion: normalizeActiveQuestion(data.active_intake_question),
  };
}

/**
 * Persists the latest dynamic intake state for a user.
 * Why this exists: The next turn must see the exact active question and problem
 * thread chosen during the previous turn.
 */
export async function saveIntakeState(
  userId: string,
  state: Pick<IntakeState, 'activeProblemThreadId' | 'problemThreads' | 'activeQuestion'>
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        active_problem_thread_id: state.activeProblemThreadId,
        intake_problem_threads: state.problemThreads,
        active_intake_question: state.activeQuestion,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[intake/state] Failed to save intake state:', error);
  }
}

/**
 * Narrows arbitrary JSON into a valid problem-thread array.
 * Why this exists: User preferences store JSONB, so runtime code must defend
 * itself against malformed or partially migrated rows.
 */
function normalizeProblemThreads(value: unknown): ProblemThread[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
      title: typeof item.title === 'string' ? item.title : 'General intake',
      symptomName: typeof item.symptomName === 'string' ? item.symptomName : undefined,
      conditionName: typeof item.conditionName === 'string' ? item.conditionName : undefined,
      status: item.status === 'background' ? 'background' : 'active',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    }));
}

/**
 * Narrows arbitrary JSON into a valid active intake question.
 * Why this exists: The route must not treat malformed stored JSON as a real
 * pending question.
 */
function normalizeActiveQuestion(value: unknown): ActiveIntakeQuestion | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const question = value as Record<string, unknown>;
  if (
    typeof question.id !== 'string' ||
    typeof question.kind !== 'string' ||
    typeof question.prompt !== 'string' ||
    typeof question.inputType !== 'string' ||
    typeof question.threadId !== 'string' ||
    typeof question.slotName !== 'string' ||
    typeof question.metric !== 'string' ||
    typeof question.askedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: question.id,
    kind: question.kind as ActiveIntakeQuestion['kind'],
    prompt: question.prompt,
    inputType: question.inputType as ActiveIntakeQuestion['inputType'],
    threadId: question.threadId,
    slotName: question.slotName as ActiveIntakeQuestion['slotName'],
    metric: question.metric,
    labelPreset: typeof question.labelPreset === 'string'
      ? (question.labelPreset as ActiveIntakeQuestion['labelPreset'])
      : undefined,
    askedAt: question.askedAt,
  };
}

