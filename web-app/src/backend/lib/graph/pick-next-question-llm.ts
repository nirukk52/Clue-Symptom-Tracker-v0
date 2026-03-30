/**
 * LLM-based Question Picker (Fallback)
 *
 * Why this exists: Fallback question picker when the deterministic info-gain
 * approach (info-gain.ts) doesn't find good candidates (e.g., novel symptoms
 * not in the 157-disease vocabulary). Uses LLM to generate questions.
 *
 * Primary path is info-gain.ts — this is secondary.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '../ai/providers';
import { getUserGraph, upsertGraphNode, upsertGraphEdge, getNodesByType } from './index';
import type { GraphNode } from '@/components/clue-chat/types';

// =============================================================================
// TYPES
// =============================================================================

interface GeneratedQuestion {
  question: string;
  priority: number; // 1-10, higher = more important
  relatedEntity: string | null; // Name of entity this question is about
  reasoning: string;
}

// =============================================================================
// SCHEMA
// =============================================================================

const QuestionSchema = z.object({
  question: z.string().describe('The question to ask the user'),
  priority: z.number().min(1).max(10).describe('Priority 1-10, higher = more important'),
  relatedEntity: z.string().nullable().describe('Name of entity this question relates to, or null if none'),
  reasoning: z.string().describe('Why this question would help'),
});

const QuestionsSchema = z.object({
  questions: z.array(QuestionSchema).describe('Questions to ask the user'),
});

// =============================================================================
// QUESTION GENERATION PROMPT
// =============================================================================

const QUESTION_GENERATION_PROMPT = `You are identifying information gaps in a health knowledge graph.

You will receive the user's current graph (symptoms, factors, medications, conditions, clues).

Your job is to suggest questions that would most reduce uncertainty about:
1. Potential triggers (what causes symptoms to worsen?)
2. Helpful interventions (what relieves symptoms?)
3. Patterns over time (when do symptoms occur?)
4. Missing context (sleep, stress, diet, activity)

PRIORITY RULES:
- 10: Critical for safety (new severe symptom, medication interaction)
- 8-9: Would unlock a strong insight (fill in a clear pattern gap)
- 5-7: Would improve understanding (common contributing factor missing)
- 3-4: Nice to know (additional context)
- 1-2: Low value (already have similar info)

QUESTION RULES:
1. Be conversational and natural (not clinical)
2. Make questions easy to answer (yes/no or simple scale)
3. Focus on actionable information
4. Don't ask about things already in the graph
5. Maximum 5 questions per analysis
6. Reference specific entities when relevant

EXAMPLES:
Graph: [Headache: severity 8, Stress: high] (no sleep data)
→ "How many hours did you sleep last night?" (priority: 8, related: Sleep)
→ Reasoning: Sleep is a common headache trigger, missing from graph

Graph: [Fatigue, Poor Sleep, Fibromyalgia] (no activity data)  
→ "Have you been more or less active than usual lately?" (priority: 6, related: Activity)
→ Reasoning: Activity level affects fibromyalgia symptoms

Graph: [Migraine, Ibuprofen] (no effectiveness data)
→ "Does the ibuprofen help with your migraines?" (priority: 7, related: Ibuprofen)
→ Reasoning: Understanding medication effectiveness is important`;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Analyzes the graph and creates/updates unknown (question) nodes.
 * Creates NEEDS_INFO edges from questions to related nodes.
 */
export async function pickNextQuestions(userId: string): Promise<void> {
  try {
    const graphData = await getUserGraph(userId);

    // Even with an empty graph, we can ask baseline questions
    const generatedQuestions = await generateQuestions(graphData.nodes);

    // Get existing unknown nodes to avoid duplicates
    const existingUnknowns = await getNodesByType(userId, 'unknown');
    const existingQuestionTexts = new Set(
      existingUnknowns.map((u) => u.questionText?.toLowerCase() ?? '')
    );

    for (const question of generatedQuestions) {
      // Skip if we already have a similar question
      if (existingQuestionTexts.has(question.question.toLowerCase())) {
        continue;
      }

      // Create the unknown node
      const unknownNodeId = await upsertGraphNode(userId, {
        type: 'unknown',
        name: truncate(question.question, 50), // Short name for display
        subLabel: 'Tap to answer',
        questionText: question.question,
        questionPriority: question.priority,
        data: { reasoning: question.reasoning },
      });

      if (!unknownNodeId) {
        continue;
      }

      // Create NEEDS_INFO edge to related entity if specified
      if (question.relatedEntity) {
        const relatedNode = findNodeByName(graphData.nodes, question.relatedEntity);
        if (relatedNode) {
          await upsertGraphEdge(userId, {
            sourceNodeId: unknownNodeId,
            targetNodeId: relatedNode.id,
            relationship: 'NEEDS_INFO',
            weight: question.priority / 10,
          });
        }
      }
    }
  } catch (error) {
    console.error('[graph] pickNextQuestions failed:', error);
  }
}

/**
 * Generates questions based on current graph state.
 */
async function generateQuestions(nodes: GraphNode[]): Promise<GeneratedQuestion[]> {
  const graphText = nodes.length > 0
    ? nodes
        .filter((n) => n.type !== 'unknown') // Don't include existing questions
        .map((n) => {
          const details = n.subLabel ? `: ${n.subLabel}` : '';
          return `- ${n.type}: ${n.label}${details}`;
        })
        .join('\n')
    : '(Empty graph - user just started)';

  const existingQuestionsText = nodes
    .filter((n) => n.type === 'unknown')
    .map((n) => `- ${n.questionText}`)
    .join('\n');

  const existingContext = existingQuestionsText
    ? `\nEXISTING QUESTIONS (don't repeat):\n${existingQuestionsText}`
    : '';

  const result = await generateObject({
    model: models.extractor,
    schema: QuestionsSchema,
    prompt: `${QUESTION_GENERATION_PROMPT}\n\nCURRENT GRAPH:\n${graphText}${existingContext}`,
  });

  // Sort by priority descending
  return result.object.questions.sort((a, b) => b.priority - a.priority);
}

/**
 * Finds a node by name (case-insensitive partial match).
 */
function findNodeByName(nodes: GraphNode[], name: string): GraphNode | undefined {
  const lowerName = name.toLowerCase();
  return nodes.find((n) => n.label.toLowerCase().includes(lowerName));
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Gets baseline questions for a new user with no graph data.
 * These don't need LLM generation - they're standard onboarding questions.
 */
export function getBaselineQuestions(): GeneratedQuestion[] {
  return [
    {
      question: 'What symptoms bother you the most?',
      priority: 10,
      relatedEntity: null,
      reasoning: 'Core symptom tracking is essential',
    },
    {
      question: 'Have you been diagnosed with any chronic conditions?',
      priority: 9,
      relatedEntity: null,
      reasoning: 'Conditions help contextualize symptoms',
    },
    {
      question: 'How did you sleep last night?',
      priority: 8,
      relatedEntity: 'Sleep',
      reasoning: 'Sleep is a universal health factor',
    },
    {
      question: 'Are you taking any medications or supplements?',
      priority: 7,
      relatedEntity: null,
      reasoning: 'Medications can cause or relieve symptoms',
    },
    {
      question: 'How would you rate your stress level today?',
      priority: 6,
      relatedEntity: 'Stress',
      reasoning: 'Stress commonly affects chronic conditions',
    },
  ];
}
