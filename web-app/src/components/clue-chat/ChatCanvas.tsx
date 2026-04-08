'use client';

/**
 * ChatCanvas - Interactive Knowledge Graph Visualization
 *
 * Why this exists: Displays the user's health knowledge graph using Reagraph.
 * Shows symptoms, factors, medications, conditions as colored nodes,
 * AI-generated clues in the center, and unknown questions as tappable nodes.
 * Tapping an unknown node sends the question into the chat.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { lightTheme, type Theme } from 'reagraph';
import type { GraphData, GraphNode, GraphNodeType } from './types';
import { GRAPH_NODE_COLORS, GRAPH_NODE_SIZES } from './types';

// Dynamic import reagraph to avoid SSR issues with Three.js/R3F
const GraphCanvas = dynamic(
  () => import('reagraph').then((mod) => mod.GraphCanvas),
  { ssr: false }
);

/**
 * Keeps the graph panel visually aligned with the surrounding cream surface.
 * Reagraph expects an opaque Three.js color here, so the dotted layer is drawn above it.
 */
const GRAPH_CANVAS_THEME: Theme = {
  ...lightTheme,
  canvas: {
    ...(lightTheme.canvas ?? {}),
    background: '#fdfbf9',
  },
};

// =============================================================================
// TYPES
// =============================================================================

interface ChatCanvasProps {
  userId?: string;
  onAskQuestion?: (question: string) => void;
  refreshTrigger?: number; // Increment to force refresh
}

interface ReagraphNode {
  id: string;
  label?: string;
  fill?: string;
  size?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

interface ReagraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChatCanvas({ userId, onAskQuestion, refreshTrigger }: ChatCanvasProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/graph?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch graph');
      }
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      console.error('[ChatCanvas] Failed to fetch graph:', err);
      setError('Failed to load your health graph');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch and refresh on trigger change
  useEffect(() => {
    fetchGraph();
  }, [fetchGraph, refreshTrigger]);

  // Convert our GraphData to Reagraph format with colors and sizes
  // Uses clue-centric sizing: clue nodes are largest, unknown nodes are smallest
  const { reagraphNodes, reagraphEdges } = useMemo(() => {
    if (!graphData) {
      return { reagraphNodes: [], reagraphEdges: [] };
    }

    // Size hierarchy: clue=20, symptom/factor=12, medication/condition=10, unknown=8
    const sizeOverrides: Record<GraphNodeType, number> = {
      clue: 20,
      symptom: 12,
      factor: 12,
      medication: 10,
      condition: 10,
      unknown: 8,
    };

    const nodes: ReagraphNode[] = graphData.nodes.map((node) => {
      // For unknown nodes, always show "Tap to answer" as sublabel
      const subLabel = node.type === 'unknown'
        ? 'Tap to answer'
        : node.subLabel;

      return {
        id: node.id,
        label: node.label + (subLabel ? `\n${subLabel}` : ''),
        fill: GRAPH_NODE_COLORS[node.type],
        size: sizeOverrides[node.type] ?? GRAPH_NODE_SIZES[node.type],
        data: {
          ...node,
          nodeType: node.type,
        },
      };
    });

    const edges: ReagraphEdge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relationship.replace(/_/g, ' ').toLowerCase(),
      data: edge,
    }));

    return { reagraphNodes: nodes, reagraphEdges: edges };
  }, [graphData]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: ReagraphNode) => {
      const nodeData = node.data as GraphNode | undefined;
      if (nodeData?.type === 'unknown' && nodeData.questionText && onAskQuestion) {
        onAskQuestion(nodeData.questionText);
      }
    },
    [onAskQuestion]
  );

  // Empty state - no user
  if (!userId) {
    return (
      <div className="flex flex-1 bg-bg-cream relative overflow-hidden items-center justify-center">
        <EmptyState message="Sign in to see your health graph" />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 bg-bg-cream relative overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#20132e] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#20132e]/60">Loading your health graph...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 bg-bg-cream relative overflow-hidden items-center justify-center">
        <EmptyState message={error} isError />
      </div>
    );
  }

  // Empty graph state
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-1 bg-bg-cream relative overflow-hidden items-center justify-center">
        <EmptyState
          message="Start chatting to build your health graph"
          subMessage="As you share symptoms, medications, and factors, Clue will visualize patterns here."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-bg-cream relative overflow-hidden">
      {/* Legend */}
      <Legend />

      {/* Graph canvas - radial layout creates hierarchy with clues near center */}
      <GraphCanvas
        nodes={reagraphNodes}
        edges={reagraphEdges}
        layoutType="radialOut2d"
        labelType="all"
        theme={GRAPH_CANVAS_THEME}
        draggable
        onNodeClick={handleNodeClick}
        edgeArrowPosition="end"
      />

      {/* Dotted grid overlay sits above the canvas so the pattern remains visible. */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(32, 19, 46, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Legend showing node type colors with visual hints.
 * Unknown nodes pulse to invite interaction.
 */
function Legend() {
  const items: Array<{ type: GraphNodeType; label: string }> = [
    { type: 'clue', label: 'Insights' },
    { type: 'symptom', label: 'Symptoms' },
    { type: 'factor', label: 'Factors' },
    { type: 'medication', label: 'Medications' },
    { type: 'condition', label: 'Conditions' },
    { type: 'unknown', label: 'Tap to answer' },
  ];

  return (
    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-full ${type === 'unknown' ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: GRAPH_NODE_COLORS[type],
                border: type === 'unknown' ? '2px dashed #888' : undefined,
                boxShadow: type === 'clue' ? '0 0 8px rgba(245, 158, 11, 0.5)' : undefined,
              }}
            />
            <span className={`text-xs ${type === 'unknown' ? 'text-[#20132e]/50 italic' : 'text-[#20132e]/70'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state display.
 */
function EmptyState({
  message,
  subMessage,
  isError,
}: {
  message: string;
  subMessage?: string;
  isError?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center px-8">
      {/* Dotted grid background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(32, 19, 46, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Empty graph icon */}
      <div className="relative z-10 mb-2">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={isError ? '#FF6B6B' : '#20132e'}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.3"
          />
          <circle cx="32" cy="20" r="6" fill={GRAPH_NODE_COLORS.clue} opacity="0.5" />
          <circle cx="20" cy="40" r="5" fill={GRAPH_NODE_COLORS.symptom} opacity="0.5" />
          <circle cx="44" cy="40" r="5" fill={GRAPH_NODE_COLORS.factor} opacity="0.5" />
          <line x1="32" y1="26" x2="20" y2="35" stroke="#888" strokeWidth="1" opacity="0.3" />
          <line x1="32" y1="26" x2="44" y2="35" stroke="#888" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      <p className={`relative z-10 text-sm font-medium ${isError ? 'text-red-600' : 'text-[#20132e]'}`}>
        {message}
      </p>
      {subMessage && (
        <p className="relative z-10 text-xs text-[#20132e]/60 max-w-[200px]">{subMessage}</p>
      )}
    </div>
  );
}
