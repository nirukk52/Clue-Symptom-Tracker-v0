/**
 * Memory Service (mem0 integration with atomic fact extraction)
 *
 * Why this exists: Provides per-user persistent memory so the Clue agent
 * remembers conditions, preferences, and patterns across sessions.
 * Extracts atomic facts from conversations before storing to improve
 * retrieval precision and feed the knowledge graph.
 *
 * Based on MediQ research: decompose conversations into categorized atomic statements.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models, opusThinkingOptions } from '../ai/providers';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Fact categories that map to graph node types.
 * Why this exists: Each fact category feeds a different node type in the graph.
 */
export type FactCategory =
  | 'symptom'     // User-reported symptoms (headache, fatigue, pain)
  | 'factor'      // Contributing factors (sleep, stress, diet, activity)
  | 'medication'  // Medications and supplements
  | 'condition'   // Diagnosed conditions
  | 'preference'  // User preferences and goals
  | 'context';    // Background context (lifestyle, history)

/**
 * An atomic fact extracted from conversation.
 * Why this exists: Granular facts improve retrieval and graph construction.
 */
export interface AtomicFact {
  fact: string;           // The statement itself
  category: FactCategory; // Which node type this maps to
  confidence: number;     // 0-1, how confident we are in this extraction
  entities: string[];     // Named entities mentioned (symptom names, meds, etc.)
}

/**
 * Result from memory storage including extracted facts.
 * Why this exists: Allows the graph pipeline to use the extracted facts.
 */
export interface StoreMemoryResult {
  success: boolean;
  facts: AtomicFact[];
}

// =============================================================================
// SCHEMA
// =============================================================================

const AtomicFactSchema = z.object({
  fact: z.string().describe('A single atomic statement about the user'),
  category: z.enum([
    'symptom',
    'factor',
    'medication',
    'condition',
    'preference',
    'context',
  ]).describe('What type of health information this is'),
  confidence: z.number().min(0).max(1).describe('Confidence in this extraction, 0-1'),
  entities: z.array(z.string()).describe('Named entities mentioned (symptom names, med names, etc.)'),
});

const AtomicFactsSchema = z.object({
  facts: z.array(AtomicFactSchema).describe('Atomic facts extracted from the conversation'),
});

// =============================================================================
// EXTRACTION PROMPT
// =============================================================================

const EXTRACTION_PROMPT = `You are extracting atomic health facts from a conversation between a user and their health tracking assistant.

Your job is to decompose the conversation into granular, categorized statements.

RULES:
1. Each fact should be a single, atomic statement (not compound)
2. Preserve specifics: numbers, timing, severity, medication names
3. Categorize accurately:
   - symptom: User-reported symptoms or health issues (headache, fatigue, pain, nausea)
   - factor: Contributing factors (sleep hours, stress level, diet, activity, weather)
   - medication: Medications or supplements (names, dosages, timing, effects)
   - condition: Diagnosed conditions or suspected diagnoses
   - preference: User preferences, goals, tracking priorities
   - context: Background context (lifestyle, work, history)
4. Extract entity names: specific symptom names, medication names, condition names
5. Set confidence based on how explicit the information is (higher for direct statements)

EXAMPLES:
User: "I've been having bad headaches for 3 days, maybe a 7 out of 10"
→ {"fact": "User reports headaches for 3 days", "category": "symptom", "confidence": 0.95, "entities": ["headache"]}
→ {"fact": "Headache severity is 7/10", "category": "symptom", "confidence": 0.95, "entities": ["headache"]}

User: "I only slept 4 hours last night and my fibro is flaring"
→ {"fact": "User slept 4 hours last night", "category": "factor", "confidence": 0.95, "entities": ["sleep"]}
→ {"fact": "User is experiencing a fibromyalgia flare", "category": "symptom", "confidence": 0.9, "entities": ["fibromyalgia", "flare"]}
→ {"fact": "User has fibromyalgia", "category": "condition", "confidence": 0.85, "entities": ["fibromyalgia"]}

User: "I take 200mg ibuprofen when it gets really bad, it helps a bit"
→ {"fact": "User takes ibuprofen 200mg for severe symptoms", "category": "medication", "confidence": 0.9, "entities": ["ibuprofen"]}
→ {"fact": "Ibuprofen provides partial relief", "category": "medication", "confidence": 0.8, "entities": ["ibuprofen"]}

DO NOT extract:
- Generic pleasantries or filler
- Assistant's responses (only extract user information)
- Speculation not grounded in what the user said`;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Retrieves memories relevant to the current conversation context.
 * Called BEFORE generating a response to inject user context into the system prompt.
 */
export async function getRelevantMemories(
  userId: string,
  query: string
): Promise<string> {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) {
    return '';
  }

  try {
    const { MemoryClient } = await import('mem0ai');
    const client = new MemoryClient({ apiKey });

    const { results } = await client.search(query, {
      filters: { user_id: userId },
    });

    if (!results || results.length === 0) {
      return '';
    }

    return results
      .slice(0, 10)
      .map((m) => `- ${m.memory ?? ''}`)
      .filter((line: string) => line !== '- ')
      .join('\n');
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    return '';
  }
}

/**
 * Extracts atomic facts from a conversation exchange using LLM.
 * Why this exists: Decomposing into atomic facts improves retrieval precision
 * and provides structured data for the knowledge graph.
 */
export async function extractAtomicFacts(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AtomicFact[]> {
  try {
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const result = await generateObject({
      model: models.extractor,
      schema: AtomicFactsSchema,
      prompt: `${EXTRACTION_PROMPT}\n\nCONVERSATION:\n${conversationText}`,
      providerOptions: opusThinkingOptions,
    });

    return result.object.facts;
  } catch (error) {
    console.error('Atomic fact extraction failed:', error);
    return [];
  }
}

/**
 * Stores new memories from a conversation exchange with atomic fact extraction.
 * Called AFTER a response is generated to persist learnings about the user.
 * Returns extracted facts for use by the graph update pipeline.
 */
export async function storeMemory(
  userId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<StoreMemoryResult> {
  const apiKey = process.env.MEM0_API_KEY;
  
  // Extract atomic facts regardless of mem0 availability
  const facts = await extractAtomicFacts(messages);

  if (!apiKey) {
    return { success: false, facts };
  }

  try {
    const { MemoryClient } = await import('mem0ai');
    const client = new MemoryClient({ apiKey });

    // Store each atomic fact as a separate memory with category metadata
    // This improves retrieval since mem0 can filter by metadata
    for (const fact of facts) {
      if (fact.confidence >= 0.7) {
        // Only store high-confidence facts
        await client.add(
          [{ role: 'user' as const, content: fact.fact }],
          {
            userId,
            metadata: {
              category: fact.category,
              entities: fact.entities,
              confidence: fact.confidence,
            },
          }
        );
      }
    }

    // Also store the raw exchange for full context
    await client.add(messages, { userId });

    return { success: true, facts };
  } catch (error) {
    console.error('Memory storage failed:', error);
    return { success: false, facts };
  }
}

/**
 * Retrieves memories filtered by category.
 * Why this exists: Allows graph pipeline to fetch category-specific memories.
 */
export async function getMemoriesByCategory(
  userId: string,
  category: FactCategory,
  limit: number = 20
): Promise<string[]> {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const { MemoryClient } = await import('mem0ai');
    const client = new MemoryClient({ apiKey });

    // Search with category as part of the query for better relevance
    const { results } = await client.search(`${category} information`, {
      filters: { user_id: userId },
    });

    if (!results || results.length === 0) {
      return [];
    }

    return results
      .slice(0, limit)
      .map((m) => m.memory ?? '')
      .filter((memory: string) => memory !== '');
  } catch (error) {
    console.error('Category memory retrieval failed:', error);
    return [];
  }
}
