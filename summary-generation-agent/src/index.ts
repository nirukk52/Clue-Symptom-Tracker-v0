/**
 * Summary Generation Agent - Main Entry Point
 *
 * Why this exists: Exports the public API for the summary generation agent.
 * Used by web-landing/campaign-modal.js to generate personalized conversion summaries.
 */

export { assembleContext } from './context-assembler';
export { generateSummary } from './summary-generator';

// Re-export types for consumers
export type {
  AdContext,
  AIGenerationRecord,
  ConversionSummary,
  LandingPageContext,
  ModalResponses,
  PersonaContext,
  QuestionAnswer,
  SummaryGenerationResult,
  UserConversionContext,
  UTMContext,
} from './types';
