'use client';

import { useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import type { Insight, InsightStatus } from './types';

/**
 * InsightsPanel - AI-generated insights and suggestions panel
 *
 * Why this exists: Displays AI-generated health insights derived from chat
 * conversations and symptom tracking. Users can validate, correct, or delete
 * insights. Validated insights gain practitioner approval status.
 */

interface InsightsPanelProps {
  insights?: Insight[];
  onValidate?: (id: string) => void;
  onCorrect?: (id: string, correction: string) => void;
  onDelete?: (id: string) => void;
}

/** Demo insights for initial display - shows the range of insight types */
const DEMO_INSIGHTS: Insight[] = [
  {
    id: '1',
    content:
      'Stop B. lactis HN019 for 5-7 days. The tension/nervousness symptoms suggest it\'s causing too much fermentation too quickly.',
    status: 'validated',
    validatedAt: new Date('2026-01-26'),
    validatedBy: 'the practitioner',
  },
  {
    id: '2',
    content:
      'Continue L. reuteri + B. coagulans as these were well tolerated and appropriate for IMO.',
    status: 'pending',
  },
  {
    id: '3',
    content:
      'Prioritize motility and transit support during recovery. With IMO, slow transit makes fermentation symptoms worse.',
    status: 'pending',
  },
  {
    id: '4',
    content:
      "Consider starting FODMAP reintroduction with microdoses even without probiotics. You don't need probiotics to reintroduce FODMAPs successfully.",
    status: 'correcting',
  },
  {
    id: '5',
    content:
      'If retrying HN019, use a microdose protocol: start at 1/8 capsule every other day and increase slowly over 10-14 days.',
    status: 'validated',
    validatedAt: new Date('2026-01-26'),
    validatedBy: 'the practitioner',
  },
  {
    id: '6',
    content:
      "Alternative to consider: Saccharomyces boulardii may be better tolerated as it's a beneficial yeast that tends to cause less gas.",
    status: 'pending',
  },
];

export function InsightsPanel({
  insights = DEMO_INSIGHTS,
  onValidate,
  onCorrect,
  onDelete,
}: InsightsPanelProps) {
  const [localInsights, setLocalInsights] = useState<Insight[]>(insights);

  const handleValidate = (id: string) => {
    setLocalInsights((prev) =>
      prev.map((insight) =>
        insight.id === id
          ? {
              ...insight,
              status: 'validated' as InsightStatus,
              validatedAt: new Date(),
              validatedBy: 'you',
            }
          : insight
      )
    );
    onValidate?.(id);
  };

  const handleStartCorrect = (id: string) => {
    setLocalInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, status: 'correcting' as InsightStatus } : insight
      )
    );
  };

  const handleCancelCorrect = (id: string) => {
    setLocalInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, status: 'pending' as InsightStatus } : insight
      )
    );
  };

  const handleDelete = (id: string) => {
    setLocalInsights((prev) => prev.filter((insight) => insight.id !== id));
    onDelete?.(id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="hidden lg:flex flex-1 flex-col bg-[#f5f3f0] relative overflow-hidden">
      {/* Subtle dotted grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(32, 19, 46, 0.04) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content container with scroll */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        {/* Header */}
        <h1 className="font-display text-3xl font-semibold text-primary mb-6">
          AI Insights & Suggestions
        </h1>

        {/* Warning banner - warm and non-alarming per design system */}
        <div className="flex items-start gap-3 rounded-2xl bg-accent-peach/15 border border-accent-peach/20 px-5 py-4 mb-8">
          <div className="shrink-0 mt-0.5">
            <MaterialIcon name="info" size="sm" className="text-accent-peach" />
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            These insights are AI-generated and should be reviewed by a healthcare professional
            before acting on them.
          </p>
        </div>

        {/* Insights grid - 2 columns on xl, 1 column on smaller */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {localInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onValidate={() => handleValidate(insight.id)}
              onCorrect={() => handleStartCorrect(insight.id)}
              onCancelCorrect={() => handleCancelCorrect(insight.id)}
              onDelete={() => handleDelete(insight.id)}
            />
          ))}
        </div>

        {/* Empty state */}
        {localInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 flex items-center justify-center mb-4">
              <MaterialIcon name="lightbulb" size="lg" className="text-accent-purple" />
            </div>
            <h3 className="font-semibold text-primary mb-2">No insights yet</h3>
            <p className="text-sm text-text-muted max-w-xs">
              Keep tracking your symptoms and chatting with Clue. Insights will appear here as
              patterns emerge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InsightCard - Individual insight card with actions
 *
 * Why this exists: Encapsulates the card UI and action buttons for a single insight.
 * Handles the three states: pending, validated, and correcting.
 */
interface InsightCardProps {
  insight: Insight;
  onValidate: () => void;
  onCorrect: () => void;
  onCancelCorrect: () => void;
  onDelete: () => void;
}

function InsightCard({
  insight,
  onValidate,
  onCorrect,
  onCancelCorrect,
  onDelete,
}: InsightCardProps) {
  const isValidated = insight.status === 'validated';
  const isCorrecting = insight.status === 'correcting';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-2xl border border-primary/8 bg-white p-5 shadow-soft flex flex-col">
      {/* Insight content */}
      <p className="text-primary leading-relaxed flex-1 mb-4">{insight.content}</p>

      {/* Validation badge - only show when validated */}
      {isValidated && insight.validatedAt && (
        <div className="flex items-center gap-2 mb-4">
          <MaterialIcon name="check_circle" size="sm" className="text-accent-mint" />
          <span className="text-sm text-accent-mint font-medium">
            Validated by {insight.validatedBy} on {formatDate(insight.validatedAt)}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {isCorrecting ? (
          <>
            {/* Correcting state - show as active/selected */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-peach text-white text-sm font-medium transition-all hover:bg-accent-peach/90"
              onClick={onCancelCorrect}
            >
              <MaterialIcon name="edit" size="xs" />
              Correct
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/15 bg-white text-text-muted text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary"
              onClick={onValidate}
            >
              <MaterialIcon name="check" size="xs" />
              Validate
            </button>
          </>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/15 bg-white text-text-muted text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary"
            onClick={onCorrect}
          >
            <MaterialIcon name="edit" size="xs" />
            Correct
          </button>
        )}

        {/* Validate button - only show when not already validated */}
        {!isValidated && !isCorrecting && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/15 bg-white text-text-muted text-sm font-medium transition-all hover:bg-accent-mint/10 hover:text-teal-700 hover:border-accent-mint/30"
            onClick={onValidate}
          >
            <MaterialIcon name="check" size="xs" />
            Validate
          </button>
        )}

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/15 bg-white text-text-muted text-sm font-medium transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          onClick={onDelete}
        >
          <MaterialIcon name="delete" size="xs" />
          Delete
        </button>
      </div>
    </div>
  );
}
