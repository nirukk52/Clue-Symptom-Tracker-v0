/**
 * Onboarding Agent - Main Entry Point
 *
 * Why this exists: Exports the public API for the onboarding agent.
 * Used by web-landing-next modal for pre-conversion and Clue Agent for post-conversion.
 *
 * Two main interfaces:
 * 1. generateWatchListPreview - Pre-conversion (modal)
 * 2. getConversionContext - Post-conversion (mobile app)
 */

// Server Actions (entry points)
export {
  generateValuePropScreen,
  generateWatchListPreview,
  getConversionContext,
  storeConversionContext,
} from './actions';

// Context Assembly
export { assembleContext, assembleEnhancedContext } from './context/assembler';

// Copy Generation
export {
  determinePromiseCategory,
  generateCopy,
  generateCopyAndLayout,
  getDefaultPreviewBadge,
} from './generators/copy';

// Templates
export {
  generateFakeFlareRisk,
  generateFakeMedicationTiming,
  generateFakePatterns,
  getDefaultCTA,
  getDefaultHeadline,
  getDefaultWatchItems,
} from './templates/graphs';
export {
  getWatchListTemplate,
  mergeWithGeneratedCopy,
} from './templates/watch-list';

// Re-export types for consumers
export type {
  AdContext,
  AIGeneratedUI,
  AIGenerationResult,
  BaselineData,
  ConversionContextResponse,
  CopyGenerationResult,
  EnhancedUserContext,
  FlareRiskData,
  GeneratedCopy,
  GenerationMetadata,
  LandingPageContext,
  LayoutId,
  ModalResponses,
  PatternData,
  PersonaContext,
  PromiseCategory,
  PromiseData,
  QuestionAnswer,
  SelectedQuote,
  StoredConversionContext,
  TimingData,
  UserConversionContext,
  UTMContext,
  ValuePropScreenData,
  VictoryProps,
  WatchListPreviewData,
  WidgetContext,
} from './types';
