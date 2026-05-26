/**
 * OpenMed Module Exports
 *
 * Why this exists: Clean re-exports for the OpenMed integration.
 * Combines biomedical NER (OpenMed) with factor extraction (LLM).
 */

export {
  extractBiomedicalEntities,
  isOpenMedHealthy,
  type OpenMedEntity,
  type NormalizedEntity,
} from './client';

export {
  extractFactors,
  extractFactorsAsRasaEntities,
  factorsToRasaEntities,
  type ExtractedFactor,
  type RasaFactorEntity,
} from './factor-extractor';
