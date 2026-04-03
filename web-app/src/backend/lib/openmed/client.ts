/**
 * OpenMed HTTP Client
 *
 * Why this exists: Provides type-safe access to OpenMed biomedical NER service.
 * OpenMed extracts symptoms, medications, and conditions from user text using
 * pretrained clinical models — more accurate than LLM extraction for medical terms.
 *
 * Models used:
 * - disease_detection_superclinical: Symptoms and conditions
 * - pharma_detection_superclinical: Medications and supplements
 */

import { canonicalizeSymptomName } from '@/backend/lib/graph/health-kg';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Entity extracted by OpenMed's NER models.
 */
export interface OpenMedEntity {
  /** Entity type label (e.g., "DISEASE", "DRUG") */
  label: string;
  /** Extracted text span */
  text: string;
  /** Model confidence score (0-1) */
  confidence: number;
  /** Character offset start in original text */
  start?: number;
  /** Character offset end in original text */
  end?: number;
}

/**
 * Response from OpenMed /analyze endpoint.
 * Matches OpenMed analyze_text(..., output_format="dict") shape.
 */
export interface OpenMedAnalyzeResponse {
  text: string;
  model_name: string;
  entities: OpenMedEntity[];
  processing_time_ms?: number;
  config?: Record<string, unknown>;
}

/**
 * Normalized entity with type mapped to our graph node types.
 */
export interface NormalizedEntity {
  type: 'symptom' | 'medication' | 'condition';
  name: string;
  confidence: number;
  rawText: string;
}

// =============================================================================
// CLIENT
// =============================================================================

const OPENMED_URL = process.env.OPENMED_URL || 'http://localhost:8080';

/**
 * Analyzes text using a specific OpenMed model.
 */
async function analyzeWithModel(
  text: string,
  modelName: string
): Promise<OpenMedEntity[]> {
  try {
    const response = await fetch(`${OPENMED_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_name: modelName,
        confidence_threshold: 0.5,
        group_entities: false,
        aggregation_strategy: 'simple',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[openmed] ${modelName} returned ${response.status}:`, errorText);
      return [];
    }

    const data: OpenMedAnalyzeResponse = await response.json();
    return data.entities || [];
  } catch (error) {
    console.error(`[openmed] Failed to call ${modelName}:`, error);
    return [];
  }
}

/**
 * Extracts biomedical entities from text using OpenMed.
 * Calls multiple models in parallel and merges results.
 *
 * @param text User message text
 * @returns Normalized entities ready for graph insertion
 */
export async function extractBiomedicalEntities(
  text: string
): Promise<NormalizedEntity[]> {
  if (!text.trim()) {
    return [];
  }

  // Call both models in parallel
  const [diseaseEntities, pharmaEntities] = await Promise.all([
    analyzeWithModel(text, 'disease_detection_superclinical'),
    analyzeWithModel(text, 'pharma_detection_superclinical'),
  ]);

  const normalized: NormalizedEntity[] = [];
  const seen = new Set<string>();

  // Process disease/symptom entities
  for (const entity of diseaseEntities) {
    const key = `${entity.label}:${entity.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({
      type: mapDiseaseLabel(entity.label),
      name:
        mapDiseaseLabel(entity.label) === 'symptom'
          ? canonicalizeSymptomName(entity.text)
          : capitalizeWords(entity.text),
      confidence: entity.confidence,
      rawText: entity.text,
    });
  }

  // Process medication entities
  for (const entity of pharmaEntities) {
    const key = `medication:${entity.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({
      type: 'medication',
      name: capitalizeWords(entity.text),
      confidence: entity.confidence,
      rawText: entity.text,
    });
  }

  return normalized;
}

/**
 * Maps OpenMed disease labels to our graph node types.
 * OpenMed uses labels like "DISEASE", "SYMPTOM", "CONDITION".
 */
function mapDiseaseLabel(label: string): 'symptom' | 'condition' {
  const upperLabel = label.toUpperCase();
  
  // OpenMed's disease_detection model primarily returns "DISEASE" label
  // We map to "symptom" for symptoms and "condition" for diagnosed conditions
  // Heuristic: if it ends in common condition suffixes, it's a condition
  if (
    upperLabel === 'CONDITION' ||
    upperLabel === 'DIAGNOSIS' ||
    upperLabel.includes('DISORDER')
  ) {
    return 'condition';
  }
  
  // Default to symptom since most user-reported issues are symptoms
  return 'symptom';
}

/**
 * Capitalizes the first letter of each word.
 */
function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Health check for OpenMed service.
 */
export async function isOpenMedHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${OPENMED_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
