/**
 * Clue (Insight) Generation for Knowledge Graph
 *
 * Why this exists: Uses LLM to analyze the user's graph state and generate
 * or update clue nodes. Clues are AI-generated insights that connect multiple
 * evidence nodes (symptoms, factors, medications) to reveal patterns.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { graphNodeLlmGenerationAudit, models, opusThinkingOptions } from '../ai/providers';
import {
  getUserGraph,
  purgeDismissedNodesByType,
  upsertGraphNode,
  upsertGraphEdge,
  updateNodeStatus,
} from './index';
import type { GraphNode, GraphConfidenceLevel } from '@/components/clue-chat/types';

const MAX_ACTIVE_CLUES = 3;

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
  clues: z.array(ClueSchema).max(5).describe('Candidate insights from the graph state'),
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
3. Generate specific relationship insights grounded in the graph

CONFIDENCE LEVELS:
- high: Strong pattern with multiple supporting observations (3+ entities, clear relationship)
- medium: Moderate pattern with some evidence (2+ entities, likely relationship)  
- low: Preliminary pattern worth tracking (emerging, needs more data)
- uncertain: Possible pattern but needs validation

INSIGHT RULES:
1. Be specific: "Poor sleep may be triggering your migraines" not "sleep affects headaches"
2. Reference actual entities from the graph
3. Describe the observed relationship itself, not advice or next steps
4. Never claim certainty - use "may", "could be", "suggests", "appears to"
5. Do not introduce new causes, behaviors, foods, treatments, or measurements that are not already present in the graph entities you were given
6. Prefer factor -> symptom patterns over generic wellness advice
7. Return at most 5 candidate clues so the app can rank them

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
        data: {
          reasoning: clue.reasoning,
          ...graphNodeLlmGenerationAudit('extractor'),
        },
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

    await pruneActiveClueSet(userId);
    await purgeDismissedNodesByType(userId, 'clue');
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
    model: models.extractor,
    schema: CluesSchema,
    prompt: `${CLUE_GENERATION_PROMPT}\n\nCURRENT GRAPH ENTITIES:\n${evidenceText}${existingCluesText}`,
    providerOptions: opusThinkingOptions,
  });

  return selectBestClues(result.object.clues, evidenceNodes);
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
 * Selects a small, non-overlapping clue set from the raw LLM output.
 * Why this exists: The model can return redundant or generic patterns, so the
 * graph should keep only the strongest distinct clues for the user-facing canvas.
 */
function selectBestClues(
  clues: GeneratedClue[],
  evidenceNodes: GraphNode[]
): GeneratedClue[] {
  const evidenceTypeLookup = new Map(
    evidenceNodes.map((node) => [node.label.trim().toLowerCase(), node.type])
  );
  const ranked = [...clues].sort((left, right) => {
    const patternScoreDifference =
      getSupportPatternScore(right, evidenceTypeLookup) - getSupportPatternScore(left, evidenceTypeLookup);
    if (patternScoreDifference !== 0) {
      return patternScoreDifference;
    }

    if (right.confidenceScore !== left.confidenceScore) {
      return right.confidenceScore - left.confidenceScore;
    }

    return getConfidenceRank(right.confidence) - getConfidenceRank(left.confidence);
  });
  const selected: GeneratedClue[] = [];

  for (const clue of ranked) {
    if (selected.length >= MAX_ACTIVE_CLUES) {
      break;
    }

    const supportSignature = getSupportSignature(clue);
    if (!supportSignature) {
      continue;
    }

    const isDuplicateSupport = selected.some(
      (existingClue) => getSupportSignature(existingClue) === supportSignature
    );
    if (isDuplicateSupport) {
      continue;
    }

    const isNearDuplicateText = selected.some(
      (existingClue) => getTextSimilarity(existingClue.insight, clue.insight) >= 0.55
    );
    if (isNearDuplicateText) {
      continue;
    }

    selected.push(clue);
  }

  return selected;
}

/**
 * Keeps only the strongest active clue nodes after concurrent post-turn runs.
 * Why this exists: Multiple overlapping clue generations can each persist a top
 * set, so we need one final canonical active set in storage.
 */
async function pruneActiveClueSet(userId: string): Promise<void> {
  const graphData = await getUserGraph(userId);
  const activeClues = graphData.nodes.filter((node) => node.type === 'clue');
  const ranked = [...activeClues].sort((left, right) => {
    const rightScore = right.confidenceScore ?? 0;
    const leftScore = left.confidenceScore ?? 0;
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return getConfidenceRank(right.confidence ?? 'uncertain') - getConfidenceRank(left.confidence ?? 'uncertain');
  });

  for (const clue of ranked.slice(MAX_ACTIVE_CLUES)) {
    await updateNodeStatus(clue.id, 'dismissed');
  }
}

/**
 * Converts confidence labels into a stable numeric ordering.
 * Why this exists: Confidence text alone is not sortable when two clues share
 * the same score, so ranking needs one deterministic tiebreaker.
 */
function getConfidenceRank(confidence: GraphConfidenceLevel): number {
  switch (confidence) {
    case 'high':
      return 4;
    case 'medium':
      return 3;
    case 'low':
      return 2;
    case 'uncertain':
      return 1;
  }
}

/**
 * Builds a normalized support signature for clue deduplication.
 * Why this exists: Two clues with the same evidence set are usually just
 * wording variants and should not both survive ranking.
 */
function getSupportSignature(clue: GeneratedClue): string {
  return clue.supportingEntities
    .map((entity) => entity.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('|');
}

/**
 * Checks whether a clue ties at least one factor to at least one symptom.
 * Why this exists: The most useful user-facing clues explain a likely driver for
 * a concrete symptom, rather than grouping only generic context nodes together.
 */
function hasFactorAndSymptomSupport(
  clue: GeneratedClue,
  evidenceTypeLookup: Map<string, GraphNode['type']>
): boolean {
  const supportTypes = new Set(
    clue.supportingEntities
      .map((entity) => evidenceTypeLookup.get(entity.trim().toLowerCase()))
      .filter(Boolean)
  );

  return supportTypes.has('factor') && supportTypes.has('symptom');
}

/**
 * Scores how useful a clue's support mix is for ranking.
 * Why this exists: We want to prefer factor-to-symptom explanations without
 * dropping otherwise valid clues when the model uses imperfect support labels.
 */
function getSupportPatternScore(
  clue: GeneratedClue,
  evidenceTypeLookup: Map<string, GraphNode['type']>
): number {
  if (hasFactorAndSymptomSupport(clue, evidenceTypeLookup)) {
    return 2;
  }

  const supportTypes = new Set(
    clue.supportingEntities
      .map((entity) => evidenceTypeLookup.get(entity.trim().toLowerCase()))
      .filter(Boolean)
  );

  if (supportTypes.has('symptom') || supportTypes.has('factor')) {
    return 1;
  }

  return 0;
}

/**
 * Computes a simple Jaccard similarity score between two clue texts.
 * Why this exists: Lightweight lexical deduplication is enough to collapse the
 * most obvious near-duplicate clue phrasings without another model call.
 */
function getTextSimilarity(left: string, right: string): number {
  const leftTokens = tokenizeClue(left);
  const rightTokens = tokenizeClue(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersectionSize = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersectionSize += 1;
    }
  }

  const unionSize = new Set([...leftTokens, ...rightTokens]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Tokenizes clue text into comparable content words.
 * Why this exists: Similarity checks should ignore punctuation and filler words
 * so duplicate clue phrasing is easier to detect deterministically.
 */
function tokenizeClue(value: string): Set<string> {
  const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'be',
    'could',
    'during',
    'have',
    'in',
    'is',
    'it',
    'levels',
    'may',
    'might',
    'of',
    'the',
    'to',
    'your',
  ]);

  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

/**
 * Finds a node by name (case-insensitive partial match).
 */
function findNodeByName(nodes: GraphNode[], name: string): GraphNode | undefined {
  const lowerName = name.toLowerCase();
  return nodes.find((n) => n.label.toLowerCase().includes(lowerName));
}
