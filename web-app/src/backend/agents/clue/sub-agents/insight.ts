'use server';

/**
 * Insight Sub-Agent (Clue Generator)
 *
 * Why this exists: Generates evidence-based clues ONLY when data supports them.
 * Every clue must cite exact evidence (row IDs, metric IDs, query fingerprint).
 *
 * Rules:
 * - sample_days >= 6
 * - abs(effect_size) >= 1.0 on 0-10 scale
 * - missing_rate <= 25%
 * - Same clue not repeated within 7 days without new data
 *
 * Output: clue_card, evidence_snapshot, decision_trace, next_best_question
 */

import type {
  ClueCard,
  EvidenceSnapshot,
  MessageContext,
  WidgetSpec,
} from '../types';

// Qualification thresholds (MVP - fixed, not tunable)
const THRESHOLDS = {
  minSampleDays: 6,
  minEffectSize: 1.0,
  maxMissingRate: 0.25,
  highConfidence: 0.7,
  lowConfidence: 0.5,
};

interface MetricResult {
  effectSize: number;
  sampleDays: number;
  missingRate: number;
  consistency: number;
  direction: 'positive' | 'negative' | 'neutral';
}

interface InsightResult {
  clue: ClueCard | null;
  evidence: EvidenceSnapshot | null;
  nextBestQuestion: WidgetSpec | null;
  explanation: string;
}

/**
 * Generate insights based on current data
 */
export async function generateInsight(
  context: MessageContext
): Promise<InsightResult> {
  // If no focus hypothesis, cannot generate clues
  if (!context.focus) {
    return {
      clue: null,
      evidence: null,
      nextBestQuestion: suggestFocusSetup(context),
      explanation: 'No focus hypothesis set - suggest setting one up',
    };
  }

  // Check data sufficiency
  const sufficiencyCheck = checkDataSufficiency(context);
  if (!sufficiencyCheck.sufficient) {
    return {
      clue: null,
      evidence: null,
      nextBestQuestion: sufficiencyCheck.nextWidget,
      explanation: sufficiencyCheck.reason,
    };
  }

  // Compute metrics for focus hypothesis
  const metrics = await computeFocusMetrics(context);

  // Check if metrics qualify for a clue
  const qualification = qualifyForClue(metrics);
  if (!qualification.qualified) {
    return {
      clue: null,
      evidence: null,
      nextBestQuestion: createDataCollectionWidget(context),
      explanation: qualification.reason,
    };
  }

  // Generate the clue
  const clue = generateClueCard(context, metrics, qualification.confidence);

  // Create evidence snapshot
  const evidence = createEvidenceSnapshot(context, metrics);

  return {
    clue,
    evidence,
    nextBestQuestion: null,
    explanation: `Generated ${clue.clueType} clue with ${Math.round(clue.confidence * 100)}% confidence`,
  };
}

/**
 * Check if we have enough data for insights
 */
function checkDataSufficiency(context: MessageContext): {
  sufficient: boolean;
  reason: string;
  nextWidget: WidgetSpec | null;
} {
  const dayCount = context.focus?.dayCount || 0;

  if (dayCount < 3) {
    return {
      sufficient: false,
      reason: `Day ${dayCount}/7 - Still building baseline`,
      nextWidget: {
        widgetId: crypto.randomUUID(),
        type: 'outcome_slider',
        label: `Log today's ${context.focus?.outcomeLabel || 'outcome'}`,
        description: `${3 - dayCount} more days to early signal`,
        writesTo: 'day_observations',
        reason: 'Building baseline for analysis',
      },
    };
  }

  if (context.lastSevenDays.completionRate < 0.5) {
    return {
      sufficient: false,
      reason: `Only ${Math.round(context.lastSevenDays.completionRate * 100)}% completion - need more data`,
      nextWidget: {
        widgetId: crypto.randomUUID(),
        type: 'outcome_slider',
        label: 'Quick check-in',
        description: 'Help us understand your patterns',
        writesTo: 'day_observations',
        reason: 'Improving data completeness',
      },
    };
  }

  return { sufficient: true, reason: '', nextWidget: null };
}

/**
 * Compute metrics for the focus hypothesis
 */
async function computeFocusMetrics(
  context: MessageContext
): Promise<MetricResult> {
  // TODO: Implement actual metric computation from database
  // For now, return placeholder
  return {
    effectSize: 0,
    sampleDays: context.focus?.dayCount || 0,
    missingRate: 1 - context.lastSevenDays.completionRate,
    consistency: 0.5,
    direction: 'neutral',
  };
}

/**
 * Check if metrics qualify for generating a clue
 */
function qualifyForClue(metrics: MetricResult): {
  qualified: boolean;
  confidence: number;
  reason: string;
} {
  // Check hard gates
  if (metrics.sampleDays < THRESHOLDS.minSampleDays) {
    return {
      qualified: false,
      confidence: 0,
      reason: `Need ${THRESHOLDS.minSampleDays - metrics.sampleDays} more days of data`,
    };
  }

  if (Math.abs(metrics.effectSize) < THRESHOLDS.minEffectSize) {
    return {
      qualified: false,
      confidence: 0,
      reason: 'Effect size too small to be meaningful',
    };
  }

  if (metrics.missingRate > THRESHOLDS.maxMissingRate) {
    return {
      qualified: false,
      confidence: 0,
      reason: `Data completeness ${Math.round((1 - metrics.missingRate) * 100)}% - need ${Math.round((1 - THRESHOLDS.maxMissingRate) * 100)}%`,
    };
  }

  // Calculate confidence score
  const sampleScore = Math.min(metrics.sampleDays / 14, 1);
  const effectScore = Math.min(Math.abs(metrics.effectSize) / 3, 1);
  const completenessScore = 1 - metrics.missingRate;
  const consistencyScore = metrics.consistency;

  const confidence =
    sampleScore * 0.3 +
    effectScore * 0.3 +
    completenessScore * 0.2 +
    consistencyScore * 0.2;

  return {
    qualified: confidence >= THRESHOLDS.lowConfidence,
    confidence,
    reason:
      confidence >= THRESHOLDS.highConfidence
        ? 'Strong pattern detected'
        : 'Weak signal detected',
  };
}

/**
 * Generate the clue card
 */
function generateClueCard(
  context: MessageContext,
  metrics: MetricResult,
  confidence: number
): ClueCard {
  const focus = context.focus!;
  const direction = metrics.direction === 'positive' ? '+' : '-';
  const effectText = `${direction}${Math.abs(metrics.effectSize).toFixed(1)}`;

  const text =
    metrics.direction === 'positive'
      ? `After ${focus.featureLabel.toLowerCase()}, your ${focus.outcomeLabel.toLowerCase()} tends to be ${effectText} over ${metrics.sampleDays} days`
      : `${focus.featureLabel} may be affecting your ${focus.outcomeLabel.toLowerCase()} (${effectText} avg over ${metrics.sampleDays} days)`;

  return {
    id: crypto.randomUUID(),
    clueType: 'correlation',
    text,
    confidence,
    evidenceSnapshotId: '', // Will be filled by caller
    decisionTraceId: crypto.randomUUID(),
    status: 'active',
  };
}

/**
 * Create evidence snapshot for traceability
 */
function createEvidenceSnapshot(
  context: MessageContext,
  _metrics: MetricResult
): EvidenceSnapshot {
  return {
    id: crypto.randomUUID(),
    tier: 'A',
    sourceTool: 'recompute.metrics',
    queryId: `focus_correlation_${context.focus?.id}`,
    paramsJson: {
      featureId: context.focus?.featureId,
      outcomeId: context.focus?.outcomeId,
      window: '7d',
    },
    resultHash: crypto.randomUUID(), // Would be actual hash
    rulebookVersion: context.agentState.rulebookVersion,
    items: [], // Would contain actual row references
  };
}

/**
 * Suggest setting up a focus hypothesis
 */
function suggestFocusSetup(_context: MessageContext): WidgetSpec {
  return {
    widgetId: crypto.randomUUID(),
    type: 'outcome_slider',
    label: 'What symptom matters most right now?',
    description: "Let's set up a focus question to track",
    writesTo: 'focus_hypotheses',
    reason: 'Need a focus hypothesis to generate insights',
  };
}

/**
 * Create a widget to collect more data
 */
function createDataCollectionWidget(context: MessageContext): WidgetSpec {
  return {
    widgetId: crypto.randomUUID(),
    type: 'outcome_slider',
    label: `How's your ${context.focus?.outcomeLabel?.toLowerCase() || 'symptom'} today?`,
    description: 'More data helps us find patterns',
    writesTo: 'day_observations',
    reason: 'Collecting data for insight generation',
  };
}
