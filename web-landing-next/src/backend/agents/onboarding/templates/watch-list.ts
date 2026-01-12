/**
 * WatchList Template
 *
 * Why this exists: Provides template configuration for the WatchListPreview
 * component. Combines fake graph data with condition-specific defaults.
 */

import type { WatchListPreviewData } from '../types';
import {
  generateFakeFlareRisk,
  generateFakeMedicationTiming,
  generateFakePatterns,
  getDefaultCTA,
  getDefaultHeadline,
  getDefaultWatchItems,
} from './graphs';

/**
 * Gets complete WatchList template data for a given condition
 * Used when AI generation fails or as base template
 */
export function getWatchListTemplate(
  condition: string,
  painPoint: string = '',
  productOffering: string = 'flare-forecast'
): WatchListPreviewData {
  return {
    headline: getDefaultHeadline(condition, painPoint),
    watchItems: getDefaultWatchItems(condition),
    graphs: {
      flareRisk: generateFakeFlareRisk(),
      symptomPatterns: generateFakePatterns(condition),
      medicationTiming: generateFakeMedicationTiming(),
    },
    cta: {
      text: getDefaultCTA(productOffering),
      action: 'google_signin',
    },
    statusText: 'First insight in ~3 days',
  };
}

/**
 * Merges AI-generated copy with template graph data
 */
export function mergeWithGeneratedCopy(
  template: WatchListPreviewData,
  generatedHeadline: string,
  generatedWatchItems: [string, string, string],
  generatedCTA: string
): WatchListPreviewData {
  return {
    ...template,
    headline: generatedHeadline,
    watchItems: generatedWatchItems,
    cta: {
      text: generatedCTA,
      action: 'google_signin',
    },
  };
}

export default getWatchListTemplate;
