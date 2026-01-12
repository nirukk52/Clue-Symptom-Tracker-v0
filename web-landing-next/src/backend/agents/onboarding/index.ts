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
  generateWatchListPreview,
  getConversionContext,
  storeConversionContext,
} from './actions';

// Context Assembly
export { assembleContext } from './context/assembler';

// Copy Generation
export { determinePromiseCategory, generateCopy } from './generators/copy';

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
  ConversionContextResponse,
  CopyGenerationResult,
  FlareRiskData,
  GeneratedCopy,
  GenerationMetadata,
  LandingPageContext,
  ModalResponses,
  PatternData,
  PersonaContext,
  PromiseCategory,
  QuestionAnswer,
  StoredConversionContext,
  TimingData,
  UserConversionContext,
  UTMContext,
  WatchListPreviewData,
} from './types';
