/**
 * Insight Agent ComputeInfoGain Node
 *
 * Why this exists: Selects the single best next clue from a clean graph using
 * deterministic info-gain math first, then falls back to an LLM only when the
 * deterministic path has no useful candidate.
 */

import { generateObject } from 'ai';
import { z } from 'zod';

import { models } from '@/backend/lib/ai/providers';
import { pickNextQuestion } from '@/backend/lib/graph/info-gain';

import type { GraphEdge, GraphNode } from '@/backend/lib/graph';
import type { InsightAgentStateType, InsightAgentStateUpdate, GeneratedClue } from '../state';

const FallbackClueSchema = z.object({
  question: z.string().describe('One natural follow-up question for the user'),
  reasoning: z.string().describe('Why this question is the most useful next clue'),
});

/**
 * Gets recent clue texts so the Insight Agent avoids asking the same thing again.
 * Why this exists: The deterministic picker already supports recent-question
 * decay, but the fallback LLM path needs the same conversational memory.
 */
async function getRecentClueTexts(userId: string): Promise<string[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('insights')
    .select('content')
    .eq('user_id', userId)
    .eq('type', 'next_question')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('[insight/compute-info-gain] Failed to load recent clues:', error);
    return [];
  }

  return ((data as Array<{ content: string | null }> | null) ?? [])
    .map((row) => row.content ?? '')
    .filter(Boolean);
}

/**
 * Builds a graph summary for fallback clue generation.
 * Why this exists: The fallback LLM should only see a compact, clinically useful
 * snapshot rather than the entire graph payload.
 */
function summarizeNodes(nodes: GraphNode[]): string {
  if (nodes.length === 0) {
    return 'none';
  }

  return nodes
    .map((node) => `${node.label}${node.subLabel ? ` (${node.subLabel})` : ''}`)
    .join(', ');
}

/**
 * Builds a readable edge summary for fallback clue generation.
 * Why this exists: Relationship context helps the fallback clue stay grounded in
 * the graph instead of asking a generic symptom question.
 */
function summarizeEdges(edges: GraphEdge[], nodes: GraphNode[]): string {
  if (edges.length === 0) {
    return 'none';
  }

  const labelById = new Map(nodes.map((node) => [node.id, node.label]));

  return edges
    .slice(0, 20)
    .map((edge) => {
      const source = labelById.get(edge.source) ?? edge.source;
      const target = labelById.get(edge.target) ?? edge.target;
      return `${source} -> ${target} (${edge.relationship})`;
    })
    .join(', ');
}

/**
 * Generates a fallback clue when deterministic info-gain does not produce one.
 * Why this exists: Novel or poorly matched symptom sets should still yield a
 * useful next question without blocking the conversation.
 */
async function generateFallbackClue(params: {
  symptomNodes: GraphNode[];
  factorNodes: GraphNode[];
  conditionNodes: GraphNode[];
  medicationNodes: GraphNode[];
  edges: GraphEdge[];
  recentQuestions: string[];
}): Promise<GeneratedClue> {
  const { symptomNodes, factorNodes, conditionNodes, medicationNodes, edges, recentQuestions } = params;

  const result = await generateObject({
    model: models.reasoner,
    schema: FallbackClueSchema,
    prompt: `You are the clinical reasoning layer for Clue, a chronic illness symptom tracker.

Choose exactly one follow-up question that would be the most clinically useful next clue.

Known symptoms: ${summarizeNodes(symptomNodes)}
Known factors: ${summarizeNodes(factorNodes)}
Known conditions: ${summarizeNodes(conditionNodes)}
Known medications: ${summarizeNodes(medicationNodes)}
Known relationships: ${summarizeEdges(edges, [
      ...symptomNodes,
      ...factorNodes,
      ...conditionNodes,
      ...medicationNodes,
    ])}
Recently asked questions: ${recentQuestions.join(' | ') || 'none'}

Rules:
- Ask one sentence only
- Be warm and natural
- Do not mention conditions, info gain, or clinical reasoning in the question
- Do not repeat a recent question
- Prefer timing, pattern, severity, or missing-context questions
- Avoid vague prompts like "How are you feeling?"
`,
  });

  return {
    question: result.object.question,
    reasoning: `LLM fallback: ${result.object.reasoning}`,
    priority: 1,
  };
}

/**
 * Computes the next clue from the clean graph state.
 * Why this exists: Insight selection should happen only after graph
 * reconciliation, not during the live conversation turn.
 */
export async function computeInfoGainNode(
  state: InsightAgentStateType
): Promise<InsightAgentStateUpdate> {
  try {
    const knownSymptoms = Array.from(state.knownSymptoms);
    const knownFactors = state.factorNodes.map((node) => node.label);
    const recentQuestions = await getRecentClueTexts(state.userId);

    const infoGainQuestion = pickNextQuestion({
      knownSymptoms,
      knownFactors,
      recentQuestions,
    });

    if (infoGainQuestion) {
      return {
        clue: {
          question: infoGainQuestion.question,
          reasoning: infoGainQuestion.reasoning,
          priority: infoGainQuestion.priority,
        },
      };
    }

    const clue =
      state.symptomNodes.length === 0
        ? {
            question: 'What symptoms have been bothering you most lately?',
            reasoning: 'No symptom nodes exist yet, so the next clue should establish the core symptom picture.',
            priority: 1,
          }
        : await generateFallbackClue({
            symptomNodes: state.symptomNodes,
            factorNodes: state.factorNodes,
            conditionNodes: state.conditionNodes,
            medicationNodes: state.medicationNodes,
            edges: state.edges,
            recentQuestions,
          });

    return {
      clue,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to compute next clue';
    console.error('[insight/compute-info-gain] Failed:', error);

    return {
      errors: [message],
    };
  }
}
