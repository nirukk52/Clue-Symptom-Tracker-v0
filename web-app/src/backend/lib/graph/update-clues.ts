/**
 * Clue (Insight) Generation for Knowledge Graph
 *
 * Why this exists: Uses LLM to analyze the user's graph state and generate
 * or update clue nodes. Clues are AI-generated insights that connect multiple
 * evidence nodes (symptoms, factors, medications) to reveal patterns.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '../ai/providers';
import {
  getUserGraph,
  purgeDismissedNodesByType,
  upsertGraphNode,
  upsertGraphEdge,
  updateNodeStatus,
} from './index';
import type { GraphNode, GraphConfidenceLevel } from '@/components/clue-chat/types';

// =============================================================================
// TYPES
// =============================================================================

interface GeneratedClue {
  insight: string;
  confidence: GraphConfidenceLevel;
  confidenceScore: number;
  supportingEntities: string[]; // Names of entities that support this clue
  reasoning: string;
}

// =============================================================================
// SCHEMA
// =============================================================================

const ClueSchema = z.object({
  insight: z.string().describe('The insight expressed as a clear statement'),
  confidence: z.enum(['high', 'medium', 'low', 'uncertain']).describe(
    'Confidence level based on evidence strength'
  ),
  confidenceScore: z.number().min(0).max(1).describe('Numeric confidence 0-1'),
  supportingEntities: z.array(z.string()).describe(
    'Names of entities that support this insight'
  ),
  reasoning: z.string().describe('Brief explanation of why this pattern was identified'),
});

const CluesSchema = z.object({
  clues: z.array(ClueSchema).describe('Generated insights from the graph state'),
});

// =============================================================================
// CLUE GENERATION PROMPT
// =============================================================================

const CLUE_GENERATION_PROMPT = `You are analyzing a health knowledge graph to identify patterns and generate insights.

You will receive:
1. The user's current graph nodes (symptoms, factors, medications, conditions)
2. Existing clues/insights

Your job is to:
1. Identify NEW patterns worth highlighting (don't repeat existing clues)
2. Update confidence if you see stronger evidence for existing patterns
3. Generate actionable, specific insights

CONFIDENCE LEVELS:
- high: Strong pattern with multiple supporting observations (3+ entities, clear relationship)
- medium: Moderate pattern with some evidence (2+ entities, likely relationship)  
- low: Preliminary pattern worth tracking (emerging, needs more data)
- uncertain: Possible pattern but needs validation

INSIGHT RULES:
1. Be specific: "Poor sleep may be triggering your migraines" not "sleep affects headaches"
2. Reference actual entities from the graph
3. Focus on actionable patterns (things the user could investigate or change)
4. Never claim certainty - use "may", "could be", "suggests", "appears to"
5. Maximum 3 new clues per analysis (focus on the strongest patterns)

EXAMPLES:
Graph: [Sleep: 4-5hrs, Headache: severity 7/10, Fatigue, Stress: high]
→ Clue: "Short sleep (under 5 hours) may be contributing to your headaches and fatigue"
→ Supporting: ["Sleep", "Headache", "Fatigue"]
→ Confidence: medium (clear correlation, but needs more data points)

Graph: [Ibuprofen: 400mg, Headache: severity reduced, Stomach Pain: new]
→ Clue: "Ibuprofen helps your headaches but may be causing stomach discomfort"
→ Supporting: ["Ibuprofen", "Headache", "Stomach Pain"]
→ Confidence: low (possible side effect pattern, needs tracking)`;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Analyzes the user's graph and generates/updates clue nodes.
 * Creates SUPPORTED_BY edges from clues to evidence nodes.
 */
export async function updateClues(userId: string): Promise<void> {
  try {
    const graphData = await getUserGraph(userId);
    
    if (graphData.nodes.length === 0) {
      return; // Nothing to analyze
    }

    // Separate clues from evidence nodes
    const existingClues = graphData.nodes.filter((n) => n.type === 'clue');
    const evidenceNodes = graphData.nodes.filter((n) => n.type !== 'clue' && n.type !== 'unknown');

    if (evidenceNodes.length < 2) {
      return; // Need at least 2 evidence nodes to find patterns
    }

    const generatedClues = await generateClues(evidenceNodes, existingClues);
    if (generatedClues.length === 0) {
      return;
    }

    await dismissExistingClues(existingClues);
    await purgeDismissedNodesByType(userId, 'clue');

    // Create or update clue nodes and their edges
    for (const clue of generatedClues) {
      // Upsert the clue node
      const clueNodeId = await upsertGraphNode(userId, {
        type: 'clue',
        name: clue.insight,
        confidence: clue.confidence,
        confidenceScore: clue.confidenceScore,
        data: { reasoning: clue.reasoning },
      });

      if (!clueNodeId) {
        continue;
      }

      // Create SUPPORTED_BY edges to evidence nodes
      for (const entityName of clue.supportingEntities) {
        const evidenceNode = findNodeByName(evidenceNodes, entityName);
        if (evidenceNode) {
          await upsertGraphEdge(userId, {
            sourceNodeId: clueNodeId,
            targetNodeId: evidenceNode.id,
            relationship: 'SUPPORTED_BY',
            weight: clue.confidenceScore,
          });
        }
      }
    }
  } catch (error) {
    console.error('[graph] updateClues failed:', error);
  }
}

/**
 * Generates new clues from evidence nodes using LLM.
 */
async function generateClues(
  evidenceNodes: GraphNode[],
  existingClues: GraphNode[]
): Promise<GeneratedClue[]> {
  const evidenceText = evidenceNodes
    .map((n) => {
      const details = n.subLabel ? `: ${n.subLabel}` : '';
      return `- ${n.type}: ${n.label}${details}`;
    })
    .join('\n');

  const existingCluesText = existingClues.length > 0
    ? `\nEXISTING CLUES (don't repeat):\n${existingClues.map((c) => `- ${c.label}`).join('\n')}`
    : '';

  const result = await generateObject({
    model: models.extractor, // Use extractor for speed, reasoner if needed for quality
    schema: CluesSchema,
    prompt: `${CLUE_GENERATION_PROMPT}\n\nCURRENT GRAPH ENTITIES:\n${evidenceText}${existingCluesText}`,
  });

  return result.object.clues;
}

/**
 * Dismisses the currently active clue set before storing a refreshed one.
 * Why this exists: The post-turn flow may regenerate clues several times during
 * one conversation, so the canvas should show the latest set rather than an
 * ever-growing pile of near-duplicate active insights.
 */
async function dismissExistingClues(existingClues: GraphNode[]): Promise<void> {
  for (const clue of existingClues) {
    await updateNodeStatus(clue.id, 'dismissed');
  }
}

/**
 * Finds a node by name (case-insensitive partial match).
 */
function findNodeByName(nodes: GraphNode[], name: string): GraphNode | undefined {
  const lowerName = name.toLowerCase();
  return nodes.find((n) => n.label.toLowerCase().includes(lowerName));
}
