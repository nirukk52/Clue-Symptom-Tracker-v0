/**
 * Factor Extractor (LLM-based)
 *
 * Why this exists: OpenMed only extracts biomedical entities (symptoms, meds,
 * conditions). Factors like sleep, stress, mood, and energy are not biomedical
 * terms, so we use a lightweight LLM call to extract and normalize them.
 *
 * This complements OpenMed — together they cover all entity types.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models, opusThinkingOptions } from '../ai/providers';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Extracted factor with normalized numeric value.
 */
export interface ExtractedFactor {
  factor: 'sleep' | 'stress' | 'energy' | 'mood';
  value: number;
  rawText: string;
  confidence: number;
}

/**
 * Rasa-compatible entity format.
 */
export interface RasaFactorEntity {
  entity: string;
  value: number;
  confidence: number;
}

// =============================================================================
// SCHEMA
// =============================================================================

const FactorSchema = z.object({
  sleep_hours: z
    .number()
    .min(0)
    .max(24)
    .nullable()
    .describe('Hours of sleep mentioned (0-24), or null if not mentioned'),
  stress_level: z
    .number()
    .min(1)
    .max(10)
    .nullable()
    .describe('Stress level 1-10 (10 = extreme stress), or null if not mentioned'),
  energy_level: z
    .number()
    .min(1)
    .max(10)
    .nullable()
    .describe('Energy level 1-10 (10 = very energetic), or null if not mentioned'),
  mood_rating: z
    .number()
    .min(1)
    .max(10)
    .nullable()
    .describe('Mood rating 1-10 (10 = very happy), or null if not mentioned'),
  severity: z
    .number()
    .min(1)
    .max(10)
    .nullable()
    .describe('Symptom severity 1-10 if mentioned, or null if not mentioned'),
});

type FactorValues = z.infer<typeof FactorSchema>;

// =============================================================================
// EXTRACTION PROMPT
// =============================================================================

const FACTOR_EXTRACTION_PROMPT = `Extract health factors from the user's message. Normalize qualitative descriptions to numeric scales.

NORMALIZATION RULES:
- Sleep: Convert to hours (0-24)
  "slept terribly" → 3-4 hours
  "didn't sleep well" → 4-5 hours  
  "okay sleep" → 6-7 hours
  "slept great" → 8+ hours

- Stress (1-10, higher = more stress):
  "not stressed" → 1-2
  "a little stressed" → 3-4
  "stressed" → 5-6
  "very stressed" → 7-8
  "extremely stressed" → 9-10

- Energy (1-10, higher = more energy):
  "exhausted" → 1-2
  "tired" → 3-4
  "okay energy" → 5-6
  "good energy" → 7-8
  "very energetic" → 9-10

- Mood (1-10, higher = better mood):
  "terrible" → 1-2
  "bad" → 3-4
  "okay" → 5-6
  "good" → 7-8
  "great" → 9-10

- Severity (1-10, higher = worse):
  Direct numbers like "7/10" or "7 out of 10"
  "mild" → 2-3
  "moderate" → 4-6
  "severe" → 7-8
  "unbearable" → 9-10

Only extract values that are CLEARLY mentioned. Return null for factors not discussed.`;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Extracts and normalizes health factors from user text using LLM.
 * Complements OpenMed which handles biomedical entities.
 *
 * @param text User message text
 * @returns Normalized factor values
 */
export async function extractFactors(text: string): Promise<FactorValues> {
  if (!text.trim()) {
    return {
      sleep_hours: null,
      stress_level: null,
      energy_level: null,
      mood_rating: null,
      severity: null,
    };
  }

  try {
    const result = await generateObject({
      model: models.extractor,
      schema: FactorSchema,
      prompt: `${FACTOR_EXTRACTION_PROMPT}\n\nUSER MESSAGE:\n${text}`,
      providerOptions: opusThinkingOptions,
    });

    return result.object;
  } catch (error) {
    console.error('[factor-extractor] Extraction failed:', error);
    return {
      sleep_hours: null,
      stress_level: null,
      energy_level: null,
      mood_rating: null,
      severity: null,
    };
  }
}

/**
 * Converts extracted factors to Rasa entity format.
 * Only includes non-null values.
 *
 * @param factors Extracted factor values
 * @returns Rasa-compatible entities
 */
export function factorsToRasaEntities(factors: FactorValues): RasaFactorEntity[] {
  const entities: RasaFactorEntity[] = [];

  if (factors.sleep_hours !== null) {
    entities.push({
      entity: 'sleep_hours',
      value: factors.sleep_hours,
      confidence: 0.9,
    });
  }

  if (factors.stress_level !== null) {
    entities.push({
      entity: 'stress_level',
      value: factors.stress_level,
      confidence: 0.9,
    });
  }

  if (factors.energy_level !== null) {
    entities.push({
      entity: 'energy_level',
      value: factors.energy_level,
      confidence: 0.9,
    });
  }

  if (factors.mood_rating !== null) {
    entities.push({
      entity: 'mood_rating',
      value: factors.mood_rating,
      confidence: 0.9,
    });
  }

  if (factors.severity !== null) {
    entities.push({
      entity: 'severity',
      value: factors.severity,
      confidence: 0.9,
    });
  }

  return entities;
}

/**
 * Extracts factors and returns them in Rasa entity format.
 * Convenience function combining extractFactors + factorsToRasaEntities.
 */
export async function extractFactorsAsRasaEntities(
  text: string
): Promise<RasaFactorEntity[]> {
  const factors = await extractFactors(text);
  return factorsToRasaEntities(factors);
}
