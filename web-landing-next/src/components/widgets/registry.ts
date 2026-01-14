'use client';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';
/**
 * Screen4 Widget Registry
 *
 * Why this exists: Screen 4 must be able to render a conversion widget instantly
 * from a stable identifier (layoutId today; widgetId later). This centralizes
 * mapping so future LLM selection is a one-line change.
 */
import { FatigueLayout } from '@/components/ValuePropScreen/layouts/FatigueLayout';
import { FlaresLayout } from '@/components/ValuePropScreen/layouts/FlaresLayout';
import { IBSGutLayout } from '@/components/ValuePropScreen/layouts/IBSGutLayout';
import { MigrainesLayout } from '@/components/ValuePropScreen/layouts/MigrainesLayout';
import { MultipleLayout } from '@/components/ValuePropScreen/layouts/MultipleLayout';
import { OtherLayout } from '@/components/ValuePropScreen/layouts/OtherLayout';

export type Screen4LayoutId = ValuePropScreenData['layoutId'];

export type Screen4LayoutComponent = typeof FatigueLayout;

/**
 * getLayoutComponent
 *
 * Why this exists: Central switch for layout selection.
 */
export function getLayoutComponent(layoutId: Screen4LayoutId) {
  switch (layoutId) {
    case 'fatigue':
      return FatigueLayout;
    case 'flares':
      return FlaresLayout;
    case 'migraines':
      return MigrainesLayout;
    case 'ibs_gut':
      return IBSGutLayout;
    case 'multiple':
      return MultipleLayout;
    case 'other':
    default:
      return OtherLayout;
  }
}
