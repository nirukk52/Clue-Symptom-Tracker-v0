import type { ChatInteractiveComponent, ChatSuggestionOption } from './types';

interface InsightSuggestionMetadata {
  relatedSymptom?: string | null;
}

/**
 * InsightSuggestionRow captures just the fields the chat UI needs from the
 * insights API so suggestion rendering stays decoupled from the full DB row.
 */
export interface InsightSuggestionRow {
  id: string;
  content: string | null;
  metadata?: InsightSuggestionMetadata | null;
}

const FACTOR_LABELS = new Set(['sleep', 'stress', 'mood', 'energy', 'hydration', 'diet']);

/**
 * buildSuggestionPrompt converts an insight target into a user-authored
 * starter message so tapping a pill feels like continuing the conversation.
 */
export function buildSuggestionPrompt(target: string | null | undefined, fallback: string): string {
  const normalizedTarget = target?.trim().toLowerCase();
  if (!normalizedTarget) {
    return fallback;
  }

  if (FACTOR_LABELS.has(normalizedTarget)) {
    return `I want to tell you more about my ${normalizedTarget}.`;
  }

  return `I'm also experiencing ${normalizedTarget}.`;
}

/**
 * buildSuggestionOptions reshapes ranked next-question insights into compact UI
 * affordances sized for the chat rail.
 */
export function buildSuggestionOptions(rows: InsightSuggestionRow[]): ChatSuggestionOption[] {
  return rows
    .filter((row): row is InsightSuggestionRow & { content: string } => Boolean(row.content?.trim()))
    .slice(0, 4)
    .map((row) => {
      const relatedTarget = row.metadata?.relatedSymptom?.trim() || null;
      const label = relatedTarget ? `More about ${relatedTarget}` : row.content;

      return {
        id: row.id,
        label,
        prompt: buildSuggestionPrompt(relatedTarget, row.content),
        description: row.content,
      };
    });
}

/**
 * buildSuggestionInteractive wraps ranked options in the shared interactive
 * message contract used by the chat renderer.
 */
export function buildSuggestionInteractive(
  rows: InsightSuggestionRow[]
): Extract<ChatInteractiveComponent, { type: 'suggestion-pills' }> | undefined {
  const options = buildSuggestionOptions(rows);

  if (options.length === 0) {
    return undefined;
  }

  return {
    type: 'suggestion-pills',
    options,
  };
}
