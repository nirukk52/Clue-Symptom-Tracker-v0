import onboardingFlow from '@/content/onboarding-flow.json';

/**
 * Screen 4 deterministic selectors (Phase 1)
 *
 * Why this exists: Screen 4 must render instantly with deterministic data.
 * `onboarding-flow.json` is the SSOT that maps Q2 → widget definition (including q4_value).
 * This file centralizes that logic so later phases can swap in LLM selection cleanly.
 */

export interface Screen4WidgetSelection {
  widgetId: string;
  q4Value: string;
}

/**
 * selectScreen4WidgetFromQ2
 *
 * Why this exists: Deterministically maps `q2.answerValue` to a Q3 widget,
 * and uses that widget's `q4_value` promise for Screen 4.
 */
export function selectScreen4WidgetFromQ2(
  q2Value: string
): Screen4WidgetSelection {
  // onboarding-flow.json keys: q3_widgets[q2Value] = { id, q4_value, ... }
  // We keep this flexible so new widgets can be added without code changes.
  const widgets = (
    onboardingFlow as unknown as {
      q3_widgets?: Record<string, { id: string; q4_value: string }>;
    }
  ).q3_widgets;

  const def = widgets?.[q2Value];

  if (def?.id && def?.q4_value) {
    return { widgetId: def.id, q4Value: def.q4_value };
  }

  // Safe fallback (must never block Screen 4 render)
  return {
    widgetId: 'w5_open_baseline',
    q4Value: 'We will start noticing what you might have missed',
  };
}
