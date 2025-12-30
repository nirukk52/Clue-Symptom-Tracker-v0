/**
 * Template-based first message generator (NO LLM call)
 * 
 * Why it exists: Generates the first chat message deterministically from
 * onboarding context. This is a core constitution requirement - first messages
 * must be template-based, not LLM-generated.
 * 
 * Reference: context/Agent-Architecture-Technical.md §2A Intake Agent
 */

import { getConditionById } from '@/constants/conditions';
import { getFeatureLabel, getOutcomeLabel } from '@/constants/impact-options';
import { getIntentTitle, INTENT_TAGLINES } from '@/constants/intents';
import { getPriorityLabel } from '@/constants/priorities';
import type { OnboardingState } from '@/types/onboarding';

/** Context needed to generate the first message */
export interface FirstMessageContext {
  conditions: string[];
  priority: OnboardingState['priority'];
  impactQuestion: OnboardingState['impactQuestion'];
  intent: OnboardingState['intent'];
  baseline: OnboardingState['baseline'];
}

/**
 * Generates a personalized first chat message from onboarding context
 * 
 * This is deterministic and does NOT call any LLM. The message acknowledges
 * the user's conditions, priority, and sets up the Focus Hypothesis tracking.
 */
export function generateFirstMessage(context: FirstMessageContext): string {
  const { conditions, priority, impactQuestion, intent, baseline } = context;

  // Build condition acknowledgment
  let conditionText = '';
  if (conditions.length > 0) {
    const conditionLabels = conditions
      .map((id) => getConditionById(id)?.label)
      .filter(Boolean);
    
    if (conditionLabels.length === 1) {
      conditionText = `I see you're managing ${conditionLabels[0]}. `;
    } else if (conditionLabels.length === 2) {
      conditionText = `I see you're managing ${conditionLabels[0]} and ${conditionLabels[1]}. `;
    } else if (conditionLabels.length > 2) {
      const last = conditionLabels.pop();
      conditionText = `I see you're managing ${conditionLabels.join(', ')}, and ${last}. `;
    }
  }

  // Build priority acknowledgment
  let priorityText = '';
  if (priority) {
    const label = getPriorityLabel(priority);
    priorityText = `Your focus is on "${label.toLowerCase()}". `;
  }

  // Build hypothesis text
  let hypothesisText = '';
  if (impactQuestion) {
    hypothesisText = `We're tracking: "${impactQuestion.questionText}"\n\n`;
  }

  // Build intent-aware prompt based on mode
  let promptText = 'How are you feeling right now?';
  if (intent) {
    const modePrompts: Record<string, string> = {
      awareness: "What's going on with your body right now?",
      tracking: "Let's log how you're doing today.",
      insight: 'Notice anything different today compared to yesterday?',
      action: 'What would help you feel better right now?',
    };
    promptText = modePrompts[intent] ?? promptText;
  }

  // Build baseline acknowledgment if present
  let baselineText = '';
  if (baseline) {
    baselineText = `I've captured your baseline (severity: ${baseline.severity}/10). `;
    if (baseline.isFlare) {
      baselineText += "I see you marked this as a flare – I'll keep that in mind. ";
    }
    baselineText += '\n\n';
  }

  return `${conditionText}${priorityText}${hypothesisText}${baselineText}${promptText}`;
}

/**
 * Generates follow-up suggestions based on user mode
 * 
 * These are contextual quick-reply options shown after messages.
 */
export function generateSuggestions(intent: OnboardingState['intent']): string[] {
  if (!intent) {
    return ['Log a symptom', 'How am I doing?', 'What should I track?'];
  }

  const suggestions: Record<string, string[]> = {
    awareness: [
      "What's happening to me?",
      'Is this normal?',
      'Something feels off',
    ],
    tracking: [
      'Log a check-in',
      'Did I take my meds?',
      'When did this start?',
    ],
    insight: [
      'Show me patterns',
      'What triggers this?',
      'Compare to last week',
    ],
    action: [
      'What can I try?',
      'Should I see a doctor?',
      'Prepare for appointment',
    ],
  };

  return suggestions[intent] ?? ['Log a symptom', 'How am I doing?', 'What should I track?'];
}

