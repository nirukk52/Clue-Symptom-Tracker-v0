/**
 * Chat Agent ResolveFollowupTurn Node
 *
 * Why this exists: Bare replies like "7", "poor", or "meal and stress" are
 * common in Clue's low-energy flows, so the Chat Agent needs one deterministic
 * place to recover what the user is answering before the model decides on tools.
 */

import type { UIMessage } from 'ai';

import type {
  ChatAgentStateType,
  ChatAgentStateUpdate,
  ResolvedFollowupAction,
} from '../state';

/**
 * Returns the latest user-authored message.
 * Why this exists: Follow-up resolution only applies to the newest user turn.
 */
function getLatestUserMessage(messages: UIMessage[]): UIMessage | null {
  return [...messages].reverse().find((message) => message.role === 'user') ?? null;
}

/**
 * Returns the latest assistant-authored message before the newest user turn.
 * Why this exists: Follow-up replies are interpreted relative to the question
 * Clue asked immediately before the user answered.
 */
function getPreviousAssistantMessage(messages: UIMessage[]): UIMessage | null {
  const latestUserIndex = [...messages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(({ message }) => message.role === 'user')?.index;

  if (latestUserIndex === undefined) {
    return null;
  }

  return [...messages.slice(0, latestUserIndex)]
    .reverse()
    .find((message) => message.role === 'assistant') ?? null;
}

/**
 * Returns the latest user-authored message before the newest user turn.
 * Why this exists: Some low-energy flows insert a generic assistant ack between
 * a user-selected label like "Energy" and the later numeric severity reply.
 */
function getPreviousUserMessage(messages: UIMessage[]): UIMessage | null {
  let seenLatestUser = false;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== 'user') {
      continue;
    }

    if (!seenLatestUser) {
      seenLatestUser = true;
      continue;
    }

    return message;
  }

  return null;
}

/**
 * Extracts plain text from one UI message.
 * Why this exists: Deterministic turn resolution only needs user-visible text.
 */
function getMessageText(message: UIMessage | null): string {
  if (!message) {
    return '';
  }

  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim();
}

/**
 * Parses a bare numeric answer like "7" or "9/10".
 * Why this exists: Numeric severity replies are the most common ambiguous turns
 * in persona evals and flare-mode check-ins.
 */
function parseNumericReply(text: string): number | null {
  const match = text.trim().match(/^([0-9]|10)(?:\s*\/\s*10)?$/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isInteger(value) && value >= 0 && value <= 10 ? value : null;
}

/**
 * Parses a short qualitative slider reply like "poor" or "good".
 * Why this exists: Low-energy follow-ups for sleep and mood often use words
 * instead of numbers, but they still need deterministic context recovery.
 */
function parseQualitativeReply(text: string): string | null {
  const normalized = text.trim().toLowerCase();
  if (['poor', 'fair', 'okay', 'ok', 'good'].includes(normalized)) {
    return normalized === 'ok' ? 'okay' : normalized;
  }

  return null;
}

/**
 * Infers the metric or symptom named in the assistant's previous question.
 * Why this exists: The Chat Agent should bind short answers back to the same
 * symptom/factor the assistant already narrowed down.
 */
function inferQuestionMetric(question: string): string | null {
  const trimmed = question.trim();
  const explicitPatterns = [
    /how bad is your ([a-z][a-z\s-]+?) right now on a [01]-10 scale/i,
    /how strong is the ([a-z][a-z\s-]+?) right now on a [01]-10 scale/i,
    /rate your ([a-z][a-z\s-]+?)\.?$/i,
    /log your ([a-z][a-z\s-]+?)\.?$/i,
  ];

  for (const pattern of explicitPatterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  if (/pain level right now/i.test(trimmed)) return 'pain';
  if (/energy/i.test(trimmed)) return 'energy';
  if (/stress/i.test(trimmed)) return 'stress';
  if (/mood/i.test(trimmed)) return 'mood';
  if (/sleep/i.test(trimmed)) return 'sleep';

  return null;
}

/**
 * Infers a metric from the user's previous short label reply.
 * Why this exists: Some chat paths confirm the label selection first and ask the
 * model to keep going with a generic ack, so the prior user turn is the only target hint.
 */
function inferMetricFromPreviousUserReply(reply: string): string | null {
  const normalized = reply.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (['energy', 'fatigue', 'pain', 'cramping', 'headache', 'dizziness'].includes(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Checks whether the user's previous reply looks like a short follow-up label.
 * Why this exists: Spontaneous numeric severity replies often come right after
 * a brief symptom clarification such as "Energy" or "Maybe migraine".
 */
function isShortFollowupLabel(reply: string): boolean {
  const normalized = reply.trim();
  if (!normalized) {
    return false;
  }

  return normalized.split(/\s+/).length <= 3;
}

/**
 * Replaces the latest user message text with a resolved model-facing sentence.
 * Why this exists: The model should receive the already-resolved meaning of a
 * terse follow-up reply instead of guessing from sparse conversational context.
 */
function replaceLatestUserText(messages: UIMessage[], rewrittenText: string, latestUserId: string): UIMessage[] {
  let replaced = false;

  return messages.map((message) => {
    if (replaced || message.id !== latestUserId) {
      return message;
    }

    replaced = true;

    return {
      ...message,
      parts: message.parts.map((part) =>
        part.type === 'text'
          ? {
              ...part,
              text: rewrittenText,
            }
          : part
      ),
    };
  });
}

/**
 * Resolves the latest follow-up turn into model-ready context.
 * Why this exists: Centralizing this logic in the Chat Agent keeps production
 * behavior out of the route layer and makes persona regressions easier to fix.
 */
export async function resolveFollowupTurnNode(
  state: ChatAgentStateType
): Promise<ChatAgentStateUpdate> {
  try {
    const latestUserMessage = getLatestUserMessage(state.messages);
    const previousAssistantMessage = getPreviousAssistantMessage(state.messages);
    const previousUserMessage = getPreviousUserMessage(state.messages);

    if (!latestUserMessage || !previousAssistantMessage) {
      return {
        modelMessages: state.messages,
        turnResolution: null,
        resolvedFollowupAction: null,
      };
    }

    const latestUserText = getMessageText(latestUserMessage);
    const previousAssistantText = getMessageText(previousAssistantMessage);
    const previousUserText = getMessageText(previousUserMessage);
    const rating = parseNumericReply(latestUserText);
    const qualitativeReply = parseQualitativeReply(latestUserText);
    const assistantLooksLikeRatingQuestion =
      /[01]-10|0-10|1-10|severity|rate|how bad|how strong|pain level/i.test(previousAssistantText);
    const assistantLooksLikeQualitativeQuestion =
      /\bpoor\b|\bfair\b|\bokay\b|\bgood\b/.test(previousAssistantText.toLowerCase());
    const fallbackMetric = inferMetricFromPreviousUserReply(previousUserText);
    const shortFollowupLabel = isShortFollowupLabel(previousUserText);

    if (
      rating === null &&
      qualitativeReply === null
    ) {
      return {
        modelMessages: state.messages,
        turnResolution: null,
        resolvedFollowupAction: null,
      };
    }

    if (
      rating === null &&
      (!assistantLooksLikeQualitativeQuestion || !inferQuestionMetric(previousAssistantText))
    ) {
      return {
        modelMessages: state.messages,
        turnResolution: null,
        resolvedFollowupAction: null,
      };
    }

    if (
      rating !== null &&
      !assistantLooksLikeRatingQuestion &&
      !fallbackMetric &&
      !shortFollowupLabel
    ) {
      return {
        modelMessages: state.messages,
        turnResolution: null,
        resolvedFollowupAction: null,
      };
    }

    const metric = assistantLooksLikeRatingQuestion
      ? inferQuestionMetric(previousAssistantText)
      : fallbackMetric;

    if (qualitativeReply && assistantLooksLikeQualitativeQuestion) {
      const qualitativeMetric = inferQuestionMetric(previousAssistantText);
      if (!qualitativeMetric) {
        return {
          modelMessages: state.messages,
          turnResolution: null,
          resolvedFollowupAction: null,
        };
      }

      const humanizedReply =
        qualitativeMetric.toLowerCase() === 'sleep'
          ? `${qualitativeReply} sleep quality`
          : `${qualitativeReply} ${qualitativeMetric}`;

      return {
        modelMessages: replaceLatestUserText(
          state.messages,
          `My answer to your previous ${qualitativeMetric} follow-up is ${humanizedReply}. This is about ${qualitativeMetric}, not a different symptom or factor.`,
          latestUserMessage.id
        ),
        turnResolution: `The latest short reply means the user's ${qualitativeMetric} should be interpreted as "${humanizedReply}".`,
        resolvedFollowupAction: null,
      };
    }

    if (rating === null) {
      return {
        modelMessages: state.messages,
        turnResolution: null,
        resolvedFollowupAction: null,
      };
    }

    const resolvedSymptomName =
      metric?.toLowerCase() === 'energy'
        ? 'Fatigue'
        : metric && !['stress', 'mood', 'sleep'].includes(metric.toLowerCase())
          ? metric
          : null;
    const resolvedFollowupAction: ResolvedFollowupAction | null = resolvedSymptomName
      ? {
          kind: 'update_symptom_severity',
          symptomName: resolvedSymptomName,
          severity: rating,
        }
      : assistantLooksLikeRatingQuestion || shortFollowupLabel
        ? {
            kind: 'update_latest_unrated_symptom_severity',
            severity: rating,
          }
        : null;
    const rewrittenText =
      metric?.toLowerCase() === 'energy'
        ? `My answer to your previous 0-10 rating question is fatigue severity ${rating}/10. This number is for the same low-energy symptom we were already discussing.`
        : metric
          ? `My answer to your previous 0-10 rating question about ${metric} is ${rating}/10.`
          : `My answer to your previous question "${previousAssistantText}" is ${rating}/10 for the same symptom or metric we were already discussing.`;

    const turnResolution =
      metric?.toLowerCase() === 'energy'
        ? `The latest bare numeric reply is a direct severity answer for the symptom "Fatigue" at ${rating}/10, not a new "Energy Level" symptom or separate factor log.`
        : metric
          ? `The latest bare numeric reply is a direct ${rating}/10 answer for "${metric}" and should update the same symptom or metric already under discussion.`
          : assistantLooksLikeRatingQuestion || shortFollowupLabel
            ? `The latest bare numeric reply is a direct ${rating}/10 answer to the previous severity question and should update the most recent symptom that still lacks a severity value.`
          : `The latest bare numeric reply is a direct ${rating}/10 answer to the immediately previous rating question and should update the same symptom or metric already under discussion.`;

    return {
      modelMessages: replaceLatestUserText(state.messages, rewrittenText, latestUserMessage.id),
      turnResolution,
      resolvedFollowupAction,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resolve follow-up turn';
    console.error('[chat-agent/resolve-followup-turn] Failed:', error);

    return {
      modelMessages: state.messages,
      turnResolution: null,
      resolvedFollowupAction: null,
      errors: [message],
    };
  }
}
