'use server';

/**
 * Message Context Assembler
 *
 * Why this exists: Assembles complete context for every message processed
 * by the Clue agent. This includes user profile, conversion context,
 * focus hypothesis, today's data, and missing fields.
 *
 * Called at the start of every message processing to ensure agents
 * have full context for decision-making.
 */

import { createClient } from '@supabase/supabase-js';

import type {
  AgentState,
  ConversionContext,
  FocusHypothesis,
  MessageContext,
  MissingFieldsQueue,
  TodayContext,
  UserProfile,
} from '../types';

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Assembles complete message context for agent processing
 */
export async function assembleMessageContext(
  state: AgentState
): Promise<MessageContext> {
  // Fetch all context in parallel for performance
  const [user, conversion, focus, today, lastSevenDays, missingFields] =
    await Promise.all([
      fetchUserProfile(state.userId),
      fetchConversionContext(state.userId),
      fetchFocusHypothesis(state.userId, state.focusHypothesisId),
      fetchTodayContext(state.userId, state.todayDayId),
      fetchLastSevenDays(state.userId),
      fetchMissingFields(state.userId),
    ]);

  return {
    user,
    conversion,
    focus,
    today,
    missingFields,
    lastSevenDays,
    agentState: state,
  };
}

/**
 * Fetch user profile from database
 */
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('id, primary_condition, conditions, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Return minimal profile if not found
    return {
      id: userId,
      primaryCondition: 'unknown',
      conditions: [],
      createdAt: new Date(),
    };
  }

  return {
    id: data.id,
    primaryCondition: data.primary_condition || 'unknown',
    conditions: data.conditions || [],
    createdAt: new Date(data.created_at),
  };
}

/**
 * Fetch conversion context (why they signed up)
 */
async function fetchConversionContext(
  userId: string
): Promise<ConversionContext | null> {
  const { data, error } = await supabase
    .from('user_conversion_context')
    .select('*')
    .eq('user_id', userId)
    .order('converted_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    conditionLabel: data.condition_label as string,
    painPoint: data.pain_point_label as string,
    desiredOutcome: (data.desired_outcome as string) || '',
    promiseCategory:
      data.promise_category as ConversionContext['promiseCategory'],
    generatedHeadline: data.generated_headline as string,
    watchItems: data.generated_watch_items as string[],
  };
}

/**
 * Fetch active focus hypothesis
 */
async function fetchFocusHypothesis(
  userId: string,
  hypothesisId: string | null
): Promise<FocusHypothesis | null> {
  if (!hypothesisId) {
    // Try to find active hypothesis
    const { data } = await supabase
      .from('focus_hypotheses')
      .select('*')
      .eq('user_id', userId)
      .eq('state', 'active')
      .limit(1)
      .single();

    if (!data) return null;
    hypothesisId = data.id;
  }

  const { data, error } = await supabase
    .from('focus_hypotheses')
    .select('*')
    .eq('id', hypothesisId)
    .single();

  if (error || !data) {
    return null;
  }

  // Calculate day count
  const startDate = new Date(data.started_at);
  const dayCount = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    id: data.id,
    featureId: data.feature_id,
    featureLabel: data.feature_label,
    outcomeId: data.outcome_id,
    outcomeLabel: data.outcome_label,
    startedAt: startDate,
    dayCount: Math.min(dayCount + 1, 7), // Cap at 7
    state: data.state,
  };
}

/**
 * Fetch today's observation data
 */
async function fetchTodayContext(
  userId: string,
  _dayId: string | null
): Promise<TodayContext | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data: dayCard } = await supabase
    .from('day_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('date_local', today)
    .single();

  if (!dayCard) {
    return null;
  }

  // Fetch related data
  const [medsData, symptomsData, driversData] = await Promise.all([
    supabase
      .from('med_logs')
      .select('status, time_ts')
      .eq('user_id', userId)
      .eq('day_id', dayCard.id),
    supabase
      .from('symptom_logs')
      .select('symptom_id')
      .eq('user_id', userId)
      .eq('day_id', dayCard.id),
    supabase
      .from('day_observations')
      .select('value_json')
      .eq('user_id', userId)
      .eq('day_id', dayCard.id)
      .eq('field_id', 'drivers'),
  ]);

  const meds = medsData.data?.[0];
  const symptoms = symptomsData.data?.map((s) => s.symptom_id) || [];
  const drivers = (driversData.data?.[0]?.value_json as string[]) || [];

  return {
    dayId: dayCard.id,
    date: today,
    severitySummary: dayCard.severity_summary_json || {},
    completionScore: dayCard.completion_score || 0,
    isFlare: dayCard.is_flare || false,
    meds: {
      taken: meds?.status === 'taken',
      timingLogged: !!meds?.time_ts,
    },
    symptoms,
    drivers,
  };
}

/**
 * Fetch last 7 days statistics
 */
async function fetchLastSevenDays(userId: string): Promise<{
  completionRate: number;
  avgSeverity: number;
  flareCount: number;
}> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];

  const { data } = await supabase
    .from('day_cards')
    .select('completion_score, is_flare, severity_summary_json')
    .eq('user_id', userId)
    .gte('date_local', startDate);

  if (!data || data.length === 0) {
    return { completionRate: 0, avgSeverity: 0, flareCount: 0 };
  }

  const completionRate = data.filter((d) => d.completion_score > 0).length / 7;
  const flareCount = data.filter((d) => d.is_flare).length;

  // Calculate average severity from all severity summaries
  let totalSeverity = 0;
  let severityCount = 0;
  for (const day of data) {
    const summary = day.severity_summary_json as Record<string, number> | null;
    if (summary) {
      const values = Object.values(summary);
      totalSeverity += values.reduce((a, b) => a + b, 0);
      severityCount += values.length;
    }
  }

  return {
    completionRate,
    avgSeverity: severityCount > 0 ? totalSeverity / severityCount : 0,
    flareCount,
  };
}

/**
 * Fetch missing fields queue
 */
async function fetchMissingFields(userId: string): Promise<MissingFieldsQueue> {
  const { data } = await supabase
    .from('missing_fields_queue')
    .select('field_id, field_label, priority, reason')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .limit(5);

  return {
    fields:
      data?.map((f) => ({
        fieldId: f.field_id,
        fieldLabel: f.field_label,
        priority: f.priority,
        reason: f.reason,
      })) || [],
  };
}
