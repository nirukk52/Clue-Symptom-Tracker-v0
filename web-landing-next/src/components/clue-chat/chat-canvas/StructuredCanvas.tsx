'use client';

/**
 * StructuredCanvas renders the deterministic lane-based graph presentation used
 * by ChatCanvas so the fetch/state shell can stay small and focused.
 */

import { useMemo, useState } from 'react';

import type { GraphData, GraphEdge, GraphNode, GraphNodeType } from '../types';
import { GRAPH_NODE_COLORS } from '../types';

interface StructuredCanvasProps {
  graphData: GraphData;
  isNarrowViewport: boolean;
  onAskQuestion: (node: GraphNode) => void;
}

interface LaneConfig {
  type: GraphNodeType;
  title: string;
  subtitle: string;
}

interface PositionedNode {
  node: GraphNode;
  laneIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  connectionCount: number;
}

interface PositionedLane {
  config: LaneConfig;
  x: number;
  width: number;
  nodes: PositionedNode[];
}

interface RenderableEdge {
  edge: GraphEdge;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasLayout {
  lanes: PositionedLane[];
  edges: RenderableEdge[];
  canvasWidth: number;
  canvasHeight: number;
}

const LANE_CONFIGS: LaneConfig[] = [
  { type: 'clue', title: 'Insights', subtitle: 'What Clue suspects' },
  { type: 'symptom', title: 'Symptoms', subtitle: 'What you are feeling' },
  { type: 'factor', title: 'Factors', subtitle: 'What may influence it' },
  { type: 'medication', title: 'Medications', subtitle: 'What you are taking' },
  { type: 'condition', title: 'Conditions', subtitle: 'What it may relate to' },
  { type: 'unknown', title: 'Tap to answer', subtitle: 'Questions that sharpen the picture' },
];

/**
 * StructuredCanvas keeps the right-side surface focused on presentation so the
 * deterministic lane layout is isolated from the fetch/auth state machine.
 */
export function StructuredCanvas({
  graphData,
  isNarrowViewport,
  onAskQuestion,
}: StructuredCanvasProps) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  /**
   * Why this exists: The expanded card lives in parent state so lane positions
   * can be recalculated and cards never overlap when one card is opened.
   */
  const handleToggleNodeExpansion = (nodeId: string) => {
    setExpandedNodeId((current) => (current === nodeId ? null : nodeId));
  };

  /**
   * Why this exists: The layout is derived in one memoized pass so the lanes,
   * cards, and connector SVG stay in sync as the graph changes.
   */
  const layout = useMemo(
    () => buildCanvasLayout(graphData, isNarrowViewport, expandedNodeId),
    [graphData, isNarrowViewport, expandedNodeId]
  );

  return (
    <>
      <Legend />

      <div className="relative z-2 flex-1 overflow-auto px-3 pb-4 pt-20 sm:px-4">
        <div
          className="relative"
          style={{
            minWidth: `${layout.canvasWidth}px`,
            minHeight: `${layout.canvasHeight}px`,
          }}
        >
          <ConnectorLayer layout={layout} />
          {layout.lanes.map((lane) => (
            <LaneColumn
              key={lane.config.type}
              lane={lane}
              canvasHeight={layout.canvasHeight}
              isNarrowViewport={isNarrowViewport}
            />
          ))}
          {layout.lanes.flatMap((lane) =>
            lane.nodes.map((positionedNode) => (
              <NodeCard
                key={positionedNode.node.id}
                positionedNode={positionedNode}
                isExpanded={expandedNodeId === positionedNode.node.id}
                onToggleExpand={handleToggleNodeExpansion}
                onAskQuestion={onAskQuestion}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

/**
 * buildCanvasLayout keeps every lane and connector deterministic so the graph
 * reads left-to-right on first paint without layout jitter.
 */
function buildCanvasLayout(
  graphData: GraphData,
  isNarrowViewport: boolean,
  expandedNodeId: string | null
): CanvasLayout {
  const laneWidth = isNarrowViewport ? 208 : 244;
  const laneGap = isNarrowViewport ? 14 : 20;
  const laneInnerPadding = isNarrowViewport ? 12 : 16;
  const canvasPadding = isNarrowViewport ? 4 : 8;
  const headerHeight = isNarrowViewport ? 82 : 96;
  const cardGap = isNarrowViewport ? 12 : 16;
  const laneBottomPadding = 18;
  const laneEmptyHeight = 132;

  const connectionCounts = getNodeConnectionCounts(graphData.edges);
  const nodesByLane = new Map<GraphNodeType, GraphNode[]>(
    LANE_CONFIGS.map((config) => [config.type, []])
  );

  for (const node of graphData.nodes) {
    nodesByLane.get(node.type)?.push(node);
  }

  const lanes: PositionedLane[] = [];
  const positionedNodesById = new Map<string, PositionedNode>();
  let maxLaneHeight = headerHeight + laneEmptyHeight;

  for (const [index, config] of LANE_CONFIGS.entries()) {
    const nodes = [...(nodesByLane.get(config.type) ?? [])].sort((leftNode, rightNode) =>
      compareLaneNodes(leftNode, rightNode, connectionCounts)
    );
    const x = canvasPadding + index * (laneWidth + laneGap);
    let nextY = headerHeight + 18;

    const positionedNodes = nodes.map((node) => {
      const height = getNodeCardHeight(node.type, isNarrowViewport, expandedNodeId === node.id);
      const positionedNode: PositionedNode = {
        node,
        laneIndex: index,
        x: x + laneInnerPadding,
        y: nextY,
        width: laneWidth - laneInnerPadding * 2,
        height,
        connectionCount: connectionCounts.get(node.id) ?? 0,
      };
      nextY += height + cardGap;
      positionedNodesById.set(node.id, positionedNode);
      return positionedNode;
    });

    maxLaneHeight = Math.max(
      maxLaneHeight,
      positionedNodes.length > 0 ? nextY + laneBottomPadding - cardGap : headerHeight + laneEmptyHeight
    );

    lanes.push({
      config,
      x,
      width: laneWidth,
      nodes: positionedNodes,
    });
  }

  return {
    lanes,
    edges: selectRenderableEdges(graphData.edges, positionedNodesById, isNarrowViewport),
    canvasWidth: canvasPadding * 2 + LANE_CONFIGS.length * laneWidth + (LANE_CONFIGS.length - 1) * laneGap,
    canvasHeight: maxLaneHeight,
  };
}

/**
 * getNodeConnectionCounts gives lane sorting a stable density signal so related
 * nodes rise toward the top without hard-coding domain-specific rankings.
 */
function getNodeConnectionCounts(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const edge of edges) {
    counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
  }

  return counts;
}

/**
 * compareLaneNodes keeps each lane understandable by applying the product's
 * chosen priority rules before falling back to stable alphabetical ordering.
 */
function compareLaneNodes(
  leftNode: GraphNode,
  rightNode: GraphNode,
  connectionCounts: Map<string, number>
): number {
  if (leftNode.type === 'unknown' && rightNode.type === 'unknown') {
    return (
      (rightNode.questionPriority ?? 0) - (leftNode.questionPriority ?? 0) ||
      (connectionCounts.get(rightNode.id) ?? 0) - (connectionCounts.get(leftNode.id) ?? 0) ||
      leftNode.label.localeCompare(rightNode.label)
    );
  }

  if (leftNode.type === 'clue' && rightNode.type === 'clue') {
    return (
      (rightNode.confidenceScore ?? 0) - (leftNode.confidenceScore ?? 0) ||
      getConfidenceRank(rightNode.confidence) - getConfidenceRank(leftNode.confidence) ||
      getTimestampRank(rightNode.updatedAt, rightNode.createdAt) -
        getTimestampRank(leftNode.updatedAt, leftNode.createdAt) ||
      leftNode.label.localeCompare(rightNode.label)
    );
  }

  return (
    (connectionCounts.get(rightNode.id) ?? 0) - (connectionCounts.get(leftNode.id) ?? 0) ||
    leftNode.label.localeCompare(rightNode.label)
  );
}

/**
 * getConfidenceRank turns clue confidence labels into a sortable score.
 */
function getConfidenceRank(confidence: GraphNode['confidence']): number {
  switch (confidence) {
    case 'high':
      return 4;
    case 'medium':
      return 3;
    case 'low':
      return 2;
    case 'uncertain':
      return 1;
    default:
      return 0;
  }
}

/**
 * getTimestampRank gives clue sorting a consistent recency fallback when
 * explicit confidence scores are tied or missing.
 */
function getTimestampRank(updatedAt?: string, createdAt?: string): number {
  const timestamp = Date.parse(updatedAt ?? createdAt ?? '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

/**
 * getNodeCardHeight keeps the lane math predictable so connector paths can be
 * computed without reading DOM measurements after render.
 */
function getNodeCardHeight(type: GraphNodeType, isNarrowViewport: boolean, isExpanded: boolean): number {
  if (isExpanded) {
    if (type === 'unknown') {
      return isNarrowViewport ? 196 : 224;
    }

    if (type === 'clue') {
      return isNarrowViewport ? 216 : 244;
    }

    return isNarrowViewport ? 176 : 198;
  }

  if (type === 'clue') {
    return isNarrowViewport ? 116 : 128;
  }

  if (type === 'unknown') {
    return isNarrowViewport ? 124 : 138;
  }

  return isNarrowViewport ? 96 : 108;
}

/**
 * selectRenderableEdges trims noisy cross-links so the pane layout emphasizes
 * the strongest story through the graph instead of recreating the original mess.
 */
function selectRenderableEdges(
  edges: GraphEdge[],
  positionedNodesById: Map<string, PositionedNode>,
  isNarrowViewport: boolean
): RenderableEdge[] {
  const maxEdges = isNarrowViewport ? 14 : 22;
  const perNodeCap = isNarrowViewport ? 2 : 3;
  const usageByNode = new Map<string, number>();

  return edges
    .filter((edge) => {
      const sourceNode = positionedNodesById.get(edge.source);
      const targetNode = positionedNodesById.get(edge.target);
      return Boolean(sourceNode && targetNode && sourceNode.laneIndex !== targetNode.laneIndex);
    })
    .sort((leftEdge, rightEdge) => getEdgePriority(rightEdge) - getEdgePriority(leftEdge))
    .flatMap((edge) => {
      if ((usageByNode.get(edge.source) ?? 0) >= perNodeCap || (usageByNode.get(edge.target) ?? 0) >= perNodeCap) {
        return [];
      }

      const sourceNode = positionedNodesById.get(edge.source);
      const targetNode = positionedNodesById.get(edge.target);
      if (!sourceNode || !targetNode) {
        return [];
      }

      usageByNode.set(edge.source, (usageByNode.get(edge.source) ?? 0) + 1);
      usageByNode.set(edge.target, (usageByNode.get(edge.target) ?? 0) + 1);

      const startNode = sourceNode.laneIndex <= targetNode.laneIndex ? sourceNode : targetNode;
      const endNode = sourceNode.laneIndex <= targetNode.laneIndex ? targetNode : sourceNode;

      return [
        {
          edge,
          startX: startNode.x + startNode.width,
          startY: startNode.y + startNode.height / 2,
          endX: endNode.x,
          endY: endNode.y + endNode.height / 2,
        },
      ];
    })
    .slice(0, maxEdges);
}

/**
 * getEdgePriority biases the reduced connector set toward question links and
 * higher-signal health relationships before generic associations.
 */
function getEdgePriority(edge: GraphEdge): number {
  const relationshipScores: Record<GraphEdge['relationship'], number> = {
    NEEDS_INFO: 9,
    SUPPORTED_BY: 8,
    TRIGGERS: 7,
    IMPROVES: 7,
    HAS_SYMPTOM: 6,
    HAS_FACTOR: 6,
    ABOUT: 5,
    CORRELATES_WITH: 4,
    CO_OCCURS: 3,
  };

  return (
    relationshipScores[edge.relationship] +
    (edge.weight ?? 0) * 0.5 +
    (edge.observationCount ?? 0) * 0.05 -
    Math.abs((edge.pValue ?? 0.5) - 0.05)
  );
}

/**
 * Legend shows the semantic meaning of each lane color so the structured layout
 * still feels easy to decode at a glance.
 */
function Legend() {
  const items: Array<{ type: GraphNodeType; label: string }> = LANE_CONFIGS.map((config) => ({
    type: config.type,
    label: config.title,
  }));

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
 * ConnectorLayer renders the reduced set of SVG links behind the cards so the
 * lane structure stays readable while still showing relationships.
 */
function ConnectorLayer({ layout }: { layout: CanvasLayout }) {
  return (
    <svg
      className="absolute inset-0 z-2 overflow-visible pointer-events-none"
      width={layout.canvasWidth}
      height={layout.canvasHeight}
      viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
      aria-hidden="true"
    >
      {layout.edges.map(({ edge, startX, startY, endX, endY }) => {
        const distance = Math.max(48, (endX - startX) * 0.45);
        const dashArray =
          edge.relationship === 'NEEDS_INFO' ||
          edge.relationship === 'CORRELATES_WITH' ||
          edge.relationship === 'CO_OCCURS'
            ? '6 8'
            : undefined;

        return (
          <path
            key={edge.id}
            d={`M ${startX} ${startY} C ${startX + distance} ${startY}, ${endX - distance} ${endY}, ${endX} ${endY}`}
            fill="none"
            stroke="rgba(32, 19, 46, 0.18)"
            strokeWidth={edge.relationship === 'SUPPORTED_BY' || edge.relationship === 'NEEDS_INFO' ? 2.5 : 2}
            strokeDasharray={dashArray}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/**
 * LaneColumn gives each node family a visible home so users understand the
 * reading order before scanning the individual node cards.
 */
function LaneColumn({
  lane,
  canvasHeight,
  isNarrowViewport,
}: {
  lane: PositionedLane;
  canvasHeight: number;
  isNarrowViewport: boolean;
}) {
  return (
    <section
      className="absolute top-0 z-1 rounded-[28px] border border-white/70 bg-white/50 backdrop-blur-[2px] shadow-[0_10px_30px_rgba(32,19,46,0.06)]"
      style={{
        left: `${lane.x}px`,
        width: `${lane.width}px`,
        height: `${canvasHeight}px`,
      }}
    >
      <div className="border-b border-primary/8 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`block rounded-full ${lane.config.type === 'unknown' ? 'animate-pulse' : ''}`}
              style={{
                width: isNarrowViewport ? '10px' : '12px',
                height: isNarrowViewport ? '10px' : '12px',
                backgroundColor: GRAPH_NODE_COLORS[lane.config.type],
                border: lane.config.type === 'unknown' ? '2px dashed rgba(32, 19, 46, 0.35)' : undefined,
                boxShadow: lane.config.type === 'clue' ? '0 0 12px rgba(246, 201, 14, 0.45)' : undefined,
              }}
            />
            <h3 className="text-sm font-semibold text-[#20132e]">{lane.config.title}</h3>
          </div>
          <span className="rounded-full bg-primary/6 px-2.5 py-1 text-[11px] font-medium text-[#20132e]/65">
            {lane.nodes.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#20132e]/55">{lane.config.subtitle}</p>
      </div>

      {lane.nodes.length === 0 ? (
        <div className="px-4 py-6 text-xs leading-relaxed text-[#20132e]/45">
          Nothing has landed here yet.
        </div>
      ) : null}
    </section>
  );
}

/**
 * NodeCard turns a graph node into a compact, legible card that fits its lane
 * while keeping unknown nodes clearly actionable.
 */
function NodeCard({
  positionedNode,
  isExpanded,
  onToggleExpand,
  onAskQuestion,
}: {
  positionedNode: PositionedNode;
  isExpanded: boolean;
  onToggleExpand: (nodeId: string) => void;
  onAskQuestion: (node: GraphNode) => void;
}) {
  const { node } = positionedNode;
  const description = getNodeDescription(node, positionedNode.connectionCount);
  const secondaryMeta = getNodeSecondaryMeta(node, positionedNode.connectionCount);
  const isUnknown = node.type === 'unknown';

  const commonProps = {
    className: `absolute z-3 overflow-hidden rounded-2xl border bg-white/95 text-left shadow-[0_18px_28px_rgba(32,19,46,0.08)] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      isUnknown
        ? 'border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_22px_32px_rgba(32,19,46,0.12)]'
        : 'border-white/80'
    }`,
    style: {
      left: `${positionedNode.x}px`,
      top: `${positionedNode.y}px`,
      width: `${positionedNode.width}px`,
      height: `${positionedNode.height}px`,
    },
  };

  const cardContent = (
    <>
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: GRAPH_NODE_COLORS[node.type] }}
      />
      <div className="flex h-full flex-col px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#20132e]/40">
              {getNodeTypeLabel(node.type)}
            </p>
            <h4
              className="mt-1 text-[15px] font-semibold leading-snug text-[#20132e]"
              style={isExpanded ? undefined : getLineClampStyle(isUnknown ? 3 : 2)}
            >
              {node.label}
            </h4>
          </div>
          <button
            type="button"
            className="mt-0.5 shrink-0 rounded-full border border-primary/18 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[#20132e]/60" style={isExpanded ? undefined : getLineClampStyle(isUnknown ? 3 : 2)}>
          {description}
        </p>

        <div className={`flex items-center justify-between gap-3 pt-3 ${isExpanded ? 'mt-3' : 'mt-auto'}`}>
          <span className="text-[11px] font-medium text-[#20132e]/45">{secondaryMeta}</span>
          {isUnknown ? (
            <button
              type="button"
              className="rounded-full border border-primary/12 bg-primary/6 px-3 py-1.5 text-[11px] font-semibold text-primary"
              onClick={(event) => {
                event.stopPropagation();
                onAskQuestion(node);
              }}
            >
              Ask in chat
            </button>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <article
      {...commonProps}
      role="button"
      tabIndex={0}
      onClick={() => onToggleExpand(node.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggleExpand(node.id);
        }
      }}
    >
      {cardContent}
    </article>
  );
}

/**
 * getNodeDescription keeps every card informative even when the backend has not
 * enriched the node with a fresh sublabel yet.
 */
function getNodeDescription(node: GraphNode, connectionCount: number): string {
  if (node.type === 'unknown') {
    return node.questionText ?? 'Tap this question to answer it in chat.';
  }

  if (node.subLabel) {
    return node.subLabel;
  }

  if (node.type === 'clue') {
    return 'This is a working insight built from the signals Clue has seen so far.';
  }

  return connectionCount > 0
    ? `Connected to ${connectionCount} part${connectionCount === 1 ? '' : 's'} of your graph.`
    : 'Waiting for more evidence from your logs and conversations.';
}

/**
 * getNodeSecondaryMeta adds a small summary line that helps users compare cards
 * without turning each card into a dense block of metadata.
 */
function getNodeSecondaryMeta(node: GraphNode, connectionCount: number): string {
  if (node.type === 'unknown') {
    return node.questionPriority ? `Priority ${node.questionPriority}` : 'Needs more info';
  }

  if (node.type === 'clue' && node.confidence) {
    return `${capitalizeLabel(node.confidence)} confidence`;
  }

  return `${connectionCount} link${connectionCount === 1 ? '' : 's'}`;
}

/**
 * getNodeTypeLabel keeps the card eyebrow copy user-facing even though the
 * graph model stores more technical node type names.
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
 * getLineClampStyle avoids layout blowups from long health phrases while
 * preserving enough text for the lane cards to stay understandable.
 */
function getLineClampStyle(lineCount: number) {
  return {
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitLineClamp: lineCount,
    WebkitBoxOrient: 'vertical' as const,
  };
}

/**
 * capitalizeLabel keeps confidence badges polished without introducing another
 * formatting dependency for a tiny bit of display text.
 */
function capitalizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
