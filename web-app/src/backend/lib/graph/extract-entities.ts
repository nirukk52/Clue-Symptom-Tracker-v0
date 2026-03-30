/**
 * Entity Extraction for Knowledge Graph
 *
 * Why this exists: Extracts health entities (symptoms, factors, medications,
 * conditions) from conversation exchanges using LLM. These entities become
 * nodes in the user's knowledge graph.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '../ai/providers';
import type { AtomicFact } from '../memory';
import type { GraphNodeType } from '@/components/clue-chat/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * An extracted entity ready to become a graph node.
 */
export interface ExtractedEntity {
  type: GraphNodeType;
  name: string;
  subLabel?: string;
  /** JSON string of structured data, parsed by consumers */
  data?: string | null;
}

// =============================================================================
// SCHEMA
// =============================================================================

const EntitySchema = z.object({
  type: z.enum(['symptom', 'factor', 'medication', 'condition']).describe(
    'The type of health entity'
  ),
  name: z.string().describe('Canonical name for the entity (e.g., "Headache", "Sleep", "Ibuprofen")'),
  subLabel: z.string().nullable().describe('Additional context (e.g., "Severity 7/10", "4 hours"), or null if none'),
  data: z.string().nullable().describe('JSON string of structured data (e.g., {"severity": 7}), or null if none'),
});

const EntitiesSchema = z.object({
  entities: z.array(EntitySchema).describe('Health entities extracted from the conversation'),
});

// =============================================================================
// EXTRACTION PROMPT
// =============================================================================

const ENTITY_EXTRACTION_PROMPT = `You are extracting health entities from a conversation for a knowledge graph.

Extract distinct entities that should be tracked over time. Each entity becomes a node in the user's health graph.

ENTITY TYPES:
- symptom: Physical or mental health symptoms (headache, fatigue, brain fog, joint pain, nausea)
- factor: Contributing factors that may affect health (sleep, stress, diet, activity, weather, menstrual cycle)
- medication: Medications and supplements (ibuprofen, vitamin D, probiotic)
- condition: Diagnosed or suspected conditions (IBS, fibromyalgia, POTS, migraine disorder)

RULES:
1. Use canonical names (capitalize, singular form): "Headache" not "headaches", "Sleep" not "sleeping"
2. Merge duplicates: "bad headache" and "my head hurts" both → "Headache"
3. Include subLabel for context: severity, duration, frequency, dosage
4. Include structured data when available (severity as number, hours, timing)
5. Only extract entities clearly stated by the user
6. Don't extract the same entity twice

EXAMPLES:
"I've been having terrible migraines, about 8/10 pain"
→ [{type: "symptom", name: "Migraine", subLabel: "Severity 8/10", data: {severity: 8}}]

"Only got 4 hours of sleep, feel exhausted"
→ [{type: "factor", name: "Sleep", subLabel: "4 hours", data: {hours: 4}}]
→ [{type: "symptom", name: "Fatigue", subLabel: "Exhausted"}]

"Taking 400mg ibuprofen twice daily for my fibromyalgia"
→ [{type: "medication", name: "Ibuprofen", subLabel: "400mg 2x daily", data: {dosage: "400mg", frequency: "twice daily"}}]
→ [{type: "condition", name: "Fibromyalgia"}]`;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Extracts health entities from conversation messages.
 */
export async function extractEntities(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ExtractedEntity[]> {
  try {
    const conversationText = messages
      .filter((m) => m.role === 'user') // Only extract from user messages
      .map((m) => m.content)
      .join('\n');

    if (!conversationText.trim()) {
      return [];
    }

    const result = await generateObject({
      model: models.extractor,
      schema: EntitiesSchema,
      prompt: `${ENTITY_EXTRACTION_PROMPT}\n\nUSER MESSAGES:\n${conversationText}`,
    });

    return result.object.entities as ExtractedEntity[];
  } catch (error) {
    console.error('[graph] Entity extraction failed:', error);
    return [];
  }
}

/**
 * Converts atomic facts (from memory module) to entities.
 * This is an alternative path when facts are already extracted.
 */
export function factsToEntities(facts: AtomicFact[]): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const fact of facts) {
    // Only process symptom, factor, medication, condition categories
    if (!['symptom', 'factor', 'medication', 'condition'].includes(fact.category)) {
      continue;
    }

    // Use extracted entities from the fact
    for (const entityName of fact.entities) {
      const key = `${fact.category}:${entityName.toLowerCase()}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      entities.push({
        type: fact.category as GraphNodeType,
        name: capitalize(entityName),
        data: JSON.stringify({ sourceFact: fact.fact }),
      });
    }
  }

  return entities;
}

/**
 * Capitalizes the first letter of each word.
 */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
