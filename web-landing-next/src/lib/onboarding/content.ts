import { z } from 'zod';

import catalogJson from '@/content/onboarding/catalog.json';
import flowJson from '@/content/onboarding/flows/modal_onboarding.v1.json';

/**
 * onboardingContent - JSON-backed onboarding configuration
 *
 * Why this exists: We want to power the web modal onboarding (Screen 1–4) fully
 * via swappable JSON, while keeping analytics stable through IDs and revisions.
 * This module is the single typed entrypoint for reading onboarding JSON.
 */

const CatalogOptionSchema = z.object({
  option_id: z.string(),
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const CatalogQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(CatalogOptionSchema),
});

const CatalogSchema = z.object({
  meta: z.object({
    catalog_id: z.string(),
    revision: z.string(),
  }),
  microcopy: z.record(z.string(), z.string()),
  questions: z.record(z.string(), CatalogQuestionSchema),
  conditions: z.object({
    question_by_domain: z.record(z.string(), z.string()),
    default_by_domain: z.record(z.string(), z.string()),
    by_domain: z.record(
      z.string(),
      z.array(z.object({ value: z.string(), label: z.string() }))
    ),
  }),
  widgets: z.record(
    z.string(),
    z.object({
      type: z.union([z.literal('slider'), z.literal('chips')]),
      prompt: z.string(),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
      gradient: z.tuple([z.string(), z.string(), z.string()]).optional(),
      allowMultiple: z.boolean().optional(),
      options: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .optional(),
    })
  ),
  screen4: z.object({
    headline_template: z.string(),
    victory_message_id: z.string(),
    baseline_label_id: z.string(),
    status_text_id: z.string(),
    default_watch_items: z.tuple([z.string(), z.string(), z.string()]),
    watch_items_by_q2: z.record(
      z.string(),
      z.tuple([z.string(), z.string(), z.string()])
    ),
    preview_badge_by_layout: z.record(z.string(), z.string()),
    layouts: z.record(z.string(), z.unknown()),
  }),
});

const FlowSchema = z.object({
  meta: z.object({
    flow_id: z.string(),
    revision: z.string(),
    catalog_ref: z.string(),
  }),
  screens: z.array(z.unknown()),
  analytics: z.object({
    flow_id: z.string(),
    flow_revision: z.string(),
  }),
});

const catalog = CatalogSchema.parse(catalogJson);
const flow = FlowSchema.parse(flowJson);

export type OnboardingCatalog = z.infer<typeof CatalogSchema>;
export type OnboardingFlow = z.infer<typeof FlowSchema>;

/**
 * getOnboardingCatalog
 *
 * Why this exists: Centralized read of the validated catalog JSON.
 */
export function getOnboardingCatalog(): OnboardingCatalog {
  return catalog;
}

/**
 * getOnboardingFlow
 *
 * Why this exists: Centralized read of the validated flow JSON.
 */
export function getOnboardingFlow(): OnboardingFlow {
  return flow;
}

/**
 * getMicrocopy
 *
 * Why this exists: UI strings (CTA labels, privacy notes, headers) must come
 * from the catalog so swapping JSON doesn't require code changes.
 */
export function getMicrocopy(id: string): string {
  return catalog.microcopy[id] ?? id;
}

/**
 * getQuestion
 *
 * Why this exists: Screen 1–2 question prompts and options must be catalog-driven.
 */
export function getQuestion(questionId: string) {
  const q = catalog.questions[questionId];
  if (!q) {
    throw new Error(`Missing question in onboarding catalog: ${questionId}`);
  }
  return q;
}

/**
 * getConditionConfig
 *
 * Why this exists: Screen 3 condition picker is content, not code.
 */
export function getConditionConfig(domain: string) {
  return {
    question:
      catalog.conditions.question_by_domain[domain] ??
      catalog.conditions.question_by_domain.other ??
      'What condition are you tracking?',
    options:
      catalog.conditions.by_domain[domain] ??
      catalog.conditions.by_domain.other ??
      [],
    defaultValue:
      catalog.conditions.default_by_domain[domain] ??
      catalog.conditions.default_by_domain.other ??
      'other',
  };
}

/**
 * getWidget
 *
 * Why this exists: Screen 3 baseline widgets must be defined in JSON (not hardcoded
 * in React components) so flows can be swapped without code changes.
 */
export function getWidget(widgetId: string) {
  const w = catalog.widgets[widgetId];
  if (!w) {
    throw new Error(`Missing widget in onboarding catalog: ${widgetId}`);
  }
  return w;
}

/**
 * getQ3WidgetIdForPainPoint
 *
 * Why this exists: Screen 3 selects a widget deterministically based on the Q2
 * answer (pain point). This mapping must be flow-controlled so it can be swapped.
 */
export function getQ3WidgetIdForPainPoint(q2Value: string): string {
  const screens = (flowJson as unknown as { screens?: unknown[] }).screens;
  const q3Screen = (screens || []).find((s) => {
    const maybe = s as { screen_id?: string };
    return maybe?.screen_id === 'screen3.q3';
  }) as
    | {
        widget_selector?: {
          map?: Record<string, string>;
        };
      }
    | undefined;

  return q3Screen?.widget_selector?.map?.[q2Value] ?? 'q3.default.v1';
}

/**
 * formatTemplate
 *
 * Why this exists: Some JSON strings need lightweight variable interpolation
 * (e.g., Screen 4 headline includes the user's selected Q1 label).
 */
export function formatTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key) => vars[key] ?? '');
}

/**
 * getScreen4Headline
 *
 * Why this exists: Screen 4 headline must be JSON-driven but still personalized
 * using the user's Q1 selection.
 */
export function getScreen4Headline(q1Label: string): string {
  return formatTemplate(catalog.screen4.headline_template, {
    q1_label_lower: q1Label.toLowerCase(),
  });
}

/**
 * getScreen4WatchItems
 *
 * Why this exists: Screen 4 watch items must be configured via JSON so we can
 * swap flows for A/B tests without touching code.
 */
export function getScreen4WatchItems(
  q2Value: string
): [string, string, string] {
  return (
    catalog.screen4.watch_items_by_q2[q2Value] ??
    catalog.screen4.default_watch_items
  );
}

/**
 * getScreen4PreviewBadge
 *
 * Why this exists: Preview badge is user-facing copy on Screen 4 and must come
 * from JSON.
 */
export function getScreen4PreviewBadge(layoutId: string): string {
  return catalog.screen4.preview_badge_by_layout[layoutId] ?? '7-DAY PREVIEW';
}

/**
 * getScreen4LayoutConfig
 *
 * Why this exists: Each Screen 4 layout has small bits of user-facing copy/data
 * (callouts, labels, preview items) that should be JSON-driven.
 */
export function getScreen4LayoutConfig<T = unknown>(layoutId: string): T {
  return (catalog.screen4.layouts[layoutId] ?? {}) as T;
}
