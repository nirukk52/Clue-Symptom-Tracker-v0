'use client';

/**
 * Screen4 Preview Registry
 *
 * Why this exists: Screen 4 must be able to render a domain-specific preview
 * instantly based on the user's Q1 selection. This centralizes the mapping
 * from layoutId to the appropriate preview component.
 */

import type { ComponentType } from 'react';

import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';

import { EnergyWavePreview } from './previews/EnergyWavePreview';
import { FlareRiskPreview } from './previews/FlareRiskPreview';
import type { PreviewComponentProps } from './previews/FlareRiskPreview';
import { FoodTimelinePreview } from './previews/FoodTimelinePreview';
import { GenericPreview } from './previews/GenericPreview';
import { MultiMetricPreview } from './previews/MultiMetricPreview';
import { TriggerPreview } from './previews/TriggerPreview';

export type Screen4LayoutId = ValuePropScreenData['layoutId'];

export type Screen4PreviewComponent = ComponentType<PreviewComponentProps>;

/**
 * getPreviewComponent
 *
 * Why this exists: Central switch for domain-specific preview selection.
 * Each domain has a unique visualization that shows the value proposition
 * tailored to that user segment.
 */
export function getPreviewComponent(
  layoutId: Screen4LayoutId
): Screen4PreviewComponent {
  switch (layoutId) {
    case 'fatigue':
      return EnergyWavePreview;
    case 'flares':
      return FlareRiskPreview;
    case 'migraines':
      return TriggerPreview;
    case 'ibs_gut':
      return FoodTimelinePreview;
    case 'multiple':
      return MultiMetricPreview;
    case 'other':
    default:
      return GenericPreview;
  }
}
