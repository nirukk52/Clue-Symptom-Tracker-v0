'use client';

/**
 * ChatCanvas - Interactive Knowledge Graph Visualization
 *
 * Why this exists: Displays the user's health knowledge graph and keeps both
 * canvas variants available so product testing can switch between the classic
 * force/radial graph and the newer structured lane view without code churn.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { lightTheme, type Theme } from 'reagraph';
import type { GraphCanvasRef } from 'reagraph';

import { StructuredCanvas } from './chat-canvas/StructuredCanvas';
import type { GraphData, GraphNode, GraphNodeType } from './types';
import { GRAPH_NODE_COLORS, GRAPH_NODE_SIZES } from './types';

/**
 * Why this exists: Dynamic loading avoids SSR mismatches from Three.js while
 * preserving the original graph renderer users are used to.
 */
const GraphCanvas = dynamic(
  () => import('reagraph').then((mod) => mod.GraphCanvas),
  { ssr: false }
);

/**
 * Why this exists: Reagraph needs an opaque canvas color while the dotted
 * texture layer is rendered above the scene.
 */
const GRAPH_CANVAS_THEME: Theme = {
  ...lightTheme,
  canvas: {
    ...(lightTheme.canvas ?? {}),
    background: '#fdfbf9',
  },
};

const CANVAS_VARIANT_STORAGE_KEY = 'clue_canvas_variant';

type CanvasVariant = 'classic' | 'structured';

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
  data?: GraphNode;
}

interface ReagraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/**
 * Why this exists: Canvas mode persistence lets product testing move back and
 * forth between variants without re-editing code.
 */
function readStoredCanvasVariant(): CanvasVariant {
  if (typeof window === 'undefined') {
    return 'classic';
  }

  const queryVariant = new URLSearchParams(window.location.search).get('canvas');
  if (queryVariant === 'classic' || queryVariant === 'structured') {
    return queryVariant;
  }

  const storedVariant = window.localStorage.getItem(CANVAS_VARIANT_STORAGE_KEY);
  return storedVariant === 'structured' ? 'structured' : 'classic';
}

export function ChatCanvas({ userId, onAskQuestion, refreshTrigger }: ChatCanvasProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [canvasVariant, setCanvasVariant] = useState<CanvasVariant>('classic');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphCanvasRef = useRef<GraphCanvasRef | null>(null);

  useEffect(() => {
    /**
     * Why this exists: The graph needs a denser layout treatment on phone-sized
     * screens so long clue labels do not push the visible graph out of frame.
     */
    const updateViewportFlag = () => {
      setIsNarrowViewport(window.innerWidth < 768);
    };

    updateViewportFlag();
    window.addEventListener('resize', updateViewportFlag);
    return () => window.removeEventListener('resize', updateViewportFlag);
  }, []);

  useEffect(() => {
    setCanvasVariant(readStoredCanvasVariant());
  }, []);

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

  /**
   * Why this exists: We map backend graph nodes into Reagraph's render format
   * so the classic canvas keeps its original layout behavior.
   */
  const { reagraphNodes, reagraphEdges } = useMemo(() => {
    if (!graphData) {
      return { reagraphNodes: [], reagraphEdges: [] };
    }

    const sizeOverrides: Record<GraphNodeType, number> = {
      clue: isNarrowViewport ? 15 : 20,
      symptom: isNarrowViewport ? 9 : 12,
      factor: isNarrowViewport ? 9 : 12,
      medication: isNarrowViewport ? 8 : 10,
      condition: isNarrowViewport ? 8 : 10,
      unknown: isNarrowViewport ? 7 : 8,
    };

    const nodes: ReagraphNode[] = graphData.nodes.map((node) => ({
      id: node.id,
      label: node.label + (node.type === 'unknown' ? '\nTap to answer' : node.subLabel ? `\n${node.subLabel}` : ''),
      fill: GRAPH_NODE_COLORS[node.type],
      size: sizeOverrides[node.type] ?? GRAPH_NODE_SIZES[node.type],
      data: node,
    }));

    const edges: ReagraphEdge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relationship.replace(/_/g, ' ').toLowerCase(),
    }));

    return { reagraphNodes: nodes, reagraphEdges: edges };
  }, [graphData, isNarrowViewport]);

  const accessibleNodeLabels = useMemo(
    () =>
      graphData?.nodes.map((node) =>
        node.subLabel ? `${node.label} (${node.type}) — ${node.subLabel}` : `${node.label} (${node.type})`
      ) ?? [],
    [graphData]
  );

  /**
   * Why this exists: Unknown nodes remain tappable and every selected node can
   * open a richer card overlay while staying in the classic graph view.
   */
  const handleNodeClick = useCallback(
    (node: ReagraphNode) => {
      const nodeData = node.data;
      if (!nodeData) {
        return;
      }

      setSelectedNode(nodeData);
      if (nodeData.type === 'unknown' && onAskQuestion) {
        onAskQuestion(nodeData.questionText ?? nodeData.label);
      }
    },
    [onAskQuestion]
  );

  useEffect(() => {
    if (!graphCanvasRef.current || reagraphNodes.length === 0 || canvasVariant !== 'classic') {
      return;
    }

    /**
     * Why this exists: Classic canvas occasionally settles with nodes partially
     * off-screen on first paint, so we fit camera bounds after mount/update.
     */
    const fitGraphInView = () => {
      graphCanvasRef.current?.fitNodesInView(
        reagraphNodes.map((node) => node.id),
        { animated: false, fitOnlyIfNodesNotInView: false }
      );
    };

    const timeoutId = window.setTimeout(fitGraphInView, 80);
    return () => window.clearTimeout(timeoutId);
  }, [reagraphNodes, reagraphEdges, refreshTrigger, canvasVariant]);

  const toggleCanvasVariant = useCallback(() => {
    const nextVariant: CanvasVariant = canvasVariant === 'classic' ? 'structured' : 'classic';
    setCanvasVariant(nextVariant);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CANVAS_VARIANT_STORAGE_KEY, nextVariant);
    }
  }, [canvasVariant]);

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
      {canvasVariant === 'structured' ? (
        graphData ? (
          <StructuredCanvas
            graphData={graphData}
            isNarrowViewport={isNarrowViewport}
            onAskQuestion={(node) => {
              setSelectedNode(node);
              if (node.type === 'unknown' && onAskQuestion) {
                onAskQuestion(node.questionText ?? node.label);
              }
            }}
          />
        ) : null
      ) : (
        <>
          <Legend />
          <GraphCanvas
            ref={graphCanvasRef}
            key={`${userId ?? 'anonymous'}:${reagraphNodes.length}:${reagraphEdges.length}:${refreshTrigger ?? 0}`}
            nodes={reagraphNodes}
            edges={reagraphEdges}
            layoutType={isNarrowViewport ? 'forceDirected2d' : 'radialOut2d'}
            labelType={isNarrowViewport ? 'nodes' : 'all'}
            theme={GRAPH_CANVAS_THEME}
            animated={false}
            draggable
            onNodeClick={handleNodeClick}
            edgeArrowPosition="end"
          />
        </>
      )}

      <button
        type="button"
        onClick={toggleCanvasVariant}
        className="absolute right-3 top-3 z-20 rounded-full border border-primary/12 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-sm"
      >
        {canvasVariant === 'classic' ? 'Switch to structured' : 'Switch to classic'}
      </button>

      {canvasVariant === 'classic' && selectedNode ? (
        <SelectedNodeCard
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAskQuestion={onAskQuestion}
        />
      ) : null}

      <ul className="sr-only" aria-label="Canvas nodes">
        {accessibleNodeLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>

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

/**
 * Legend showing node type colors with visual hints.
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
 * Why this exists: Mirrors the new NodeCard visual treatment in classic mode
 * so node content is testable without abandoning the old graph layout.
 */
function SelectedNodeCard({
  node,
  onClose,
  onAskQuestion,
}: {
  node: GraphNode;
  onClose: () => void;
  onAskQuestion?: (question: string) => void;
}) {
  const description = node.type === 'unknown'
    ? node.questionText ?? 'Tap to answer this question in chat.'
    : node.subLabel ?? 'This is a working insight built from the signals Clue has seen so far.';
  const confidence = node.type === 'clue' && node.confidence ? `${node.confidence} confidence` : 'Context node';

  return (
    <article className="absolute left-4 top-20 z-30 max-w-[280px] overflow-hidden rounded-2xl border border-white/80 bg-white/95 text-left shadow-[0_18px_28px_rgba(32,19,46,0.08)] transition">
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: GRAPH_NODE_COLORS[node.type] }} />
      <div className="flex h-full flex-col px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#20132e]/40">
              {getNodeTypeLabel(node.type)}
            </p>
            <h4 className="mt-1 text-[15px] font-semibold leading-snug text-[#20132e]">{node.label}</h4>
          </div>
          <button
            type="button"
            className="rounded-full border border-primary/18 bg-primary/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[#20132e]/60">{description}</p>

        <div className="mt-3 flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] font-medium text-[#20132e]/45">{confidence}</span>
          {node.type === 'unknown' ? (
            <button
              type="button"
              className="rounded-full border border-primary/12 bg-primary/6 px-3 py-1.5 text-[11px] font-semibold text-primary"
              onClick={() => onAskQuestion?.(node.questionText ?? node.label)}
            >
              Ask in chat
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Why this exists: Keeps the node type copy readable and user-facing.
 */
function getNodeTypeLabel(type: GraphNodeType): string {
  switch (type) {
    case 'clue':
      return 'Insight';
    case 'symptom':
      return 'Symptom';
    case 'factor':
      return 'Factor';
    case 'medication':
      return 'Medication';
    case 'condition':
      return 'Condition';
    case 'unknown':
      return 'Question';
  }
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

