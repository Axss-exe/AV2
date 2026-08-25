'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import type { GraphNode } from '@/lib/types';

interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

interface EntityGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  title?: string;
  /** Optional — when provided, nodes become clickable and pass their label. */
  onNodeClick?: (label: string) => void;
}

type SimNode = SimulationNodeDatum & {
  id: string;
  label: string;
  type: GraphNode['type'];
  degree: number;
};

type SimLink = SimulationLinkDatum<SimNode> & { label: string };

const VIEW_W = 700;
const VIEW_H = 380;

const nodeColor: Record<GraphNode['type'], string> = {
  hub: '#e8e6e3',
  entity: '#7c9cff',
  partner: '#6bd88a',
  risk: '#ff6b5e',
};

export function EntityGraph({ nodes: nodesProp, edges: edgesProp, title, onNodeClick }: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const dragState = useRef<{ id: string; sx: number; sy: number } | null>(null);
  const panState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  // Defensive guards — never call .map() on undefined, and strip out any
  // null/malformed entries (e.g. a graph API response with holes) before
  // touching .id/.from/.to on them.
  const nodes = (Array.isArray(nodesProp) ? nodesProp : []).filter(
    (n): n is GraphNode => !!n && typeof n.id === 'string' && n.id.length > 0
  );
  const edges = (Array.isArray(edgesProp) ? edgesProp : []).filter(
    (e): e is GraphEdge => !!e && typeof e.from === 'string' && typeof e.to === 'string'
  );

  const connectionSet = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!e.from || !e.to) continue;
      if (!map.has(e.from)) map.set(e.from, new Set());
      if (!map.has(e.to)) map.set(e.to, new Set());
      map.get(e.from)!.add(e.to);
      map.get(e.to)!.add(e.from);
    }
    return map;
  }, [edges]);

  // Run the force simulation whenever the underlying data changes.
  useEffect(() => {
    if (nodes.length === 0) {
      setSimNodes([]);
      setSimLinks([]);
      return;
    }

    const degree = new Map<string, number>();
    for (const e of edges) {
      if (!e.from || !e.to) continue;
      degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
      degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
    }

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const dNodes: SimNode[] = nodes.map((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        degree: degree.get(n.id) ?? 0,
        x: VIEW_W / 2 + Math.cos(angle) * 120,
        y: VIEW_H / 2 + Math.sin(angle) * 120,
      };
    });

    const dLinks: SimLink[] = edges
      .filter((e) => nodeById.has(e.from) && nodeById.has(e.to))
      .map((e) => ({ source: e.from, target: e.to, label: e.label ?? '' }));

    const sim = forceSimulation(dNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(dLinks)
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            return s.type === 'hub' || t.type === 'hub' ? 110 : 90;
          })
          .strength(0.5)
      )
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(VIEW_W / 2, VIEW_H / 2))
      .force(
        'collide',
        forceCollide<SimNode>().radius((d) => radiusFor(d) + 14)
      )
      .stop();

    // Run synchronously to a settled state, then hand off the final
    // positions to React state — this mirrors the "settle" animation of
    // Obsidian's graph view without needing a continuous ticking loop.
    const TICKS = 220;
    for (let i = 0; i < TICKS; i++) sim.tick();

    setSimNodes(dNodes.map((d) => ({ ...d })));
    setSimLinks(dLinks.map((l) => ({ ...l })));

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, nodes.map((n) => n.id).join(','), edges.map((e) => `${e.from}-${e.to}`).join(',')]);

  function radiusFor(n: { type: GraphNode['type']; degree: number }) {
    const base = n.type === 'hub' ? 14 : 8;
    return base + Math.min(n.degree, 6) * 1.6;
  }

  function resolveNode(link: SimLink, which: 'source' | 'target'): SimNode | undefined {
    const val = link[which];
    if (typeof val === 'object' && val !== null) return val as SimNode;
    return simNodes.find((n) => n.id === val);
  }

  // ── Pan & zoom ──────────────────────────────────────────────────────────
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform((t) => ({ ...t, k: Math.min(2.4, Math.max(0.5, t.k * delta)) }));
  }

  function onBackgroundPointerDown(e: React.PointerEvent) {
    if (dragState.current) return;
    panState.current = { sx: e.clientX, sy: e.clientY, ox: transform.x, oy: transform.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragState.current) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const scaleX = VIEW_W / svgRect.width / transform.k;
      const scaleY = VIEW_H / svgRect.height / transform.k;
      const dx = (e.clientX - dragState.current.sx) * scaleX;
      const dy = (e.clientY - dragState.current.sy) * scaleY;
      dragState.current.sx = e.clientX;
      dragState.current.sy = e.clientY;
      setSimNodes((prev) =>
        prev.map((n) => (n.id === dragState.current!.id ? { ...n, x: (n.x ?? 0) + dx, y: (n.y ?? 0) + dy, fx: (n.x ?? 0) + dx, fy: (n.y ?? 0) + dy } : n))
      );
      return;
    }
    if (panState.current) {
      const dx = e.clientX - panState.current.sx;
      const dy = e.clientY - panState.current.sy;
      setTransform((t) => ({ ...t, x: panState.current!.ox + dx, y: panState.current!.oy + dy }));
    }
  }

  function onPointerUp() {
    dragState.current = null;
    panState.current = null;
  }

  return (
    <div
      style={{
        background: '#0a0a0c',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 20,
        position: 'relative',
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          {title}
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{ width: '100%', height: VIEW_H, overflow: 'hidden', cursor: panState.current ? 'grabbing' : 'grab', touchAction: 'none' }}
          role="img"
          aria-label="Entity network graph showing relationships between key nodes, displayed as a node graph"
          onWheel={onWheel}
          onPointerDown={onBackgroundPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <radialGradient id="graph-bg-glow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#141418" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </radialGradient>
            <filter id="node-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#graph-bg-glow)" />

          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
            {/* Edges */}
            <g>
              {simLinks.map((link, i) => {
                const s = resolveNode(link, 'source');
                const t = resolveNode(link, 'target');
                if (!s || !t) return null;
                const isDim = hovered && !(hovered === s.id || hovered === t.id);
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke="#3a3a40"
                    strokeWidth={hovered === s.id || hovered === t.id ? 1.4 : 0.9}
                    style={{ opacity: isDim ? 0.12 : 0.65, transition: 'opacity 0.2s, stroke-width 0.2s' }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {simNodes.map((node) => {
                const r = radiusFor(node);
                const color = nodeColor[node.type] ?? nodeColor.entity;
                const isHovered = hovered === node.id;
                const isConnected = hovered ? connectionSet.get(hovered)?.has(node.id) : false;
                const isDim = hovered && !isHovered && !isConnected;

                return (
                  <g
                    key={node.id}
                    role={onNodeClick ? 'button' : undefined}
                    tabIndex={onNodeClick ? 0 : undefined}
                    aria-label={onNodeClick ? `View entity ${node.label}` : node.label}
                    style={{ cursor: 'pointer', opacity: isDim ? 0.28 : 1, transition: 'opacity 0.2s' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      dragState.current = { id: node.id, sx: e.clientX, sy: e.clientY };
                    }}
                    onClick={() => onNodeClick?.(node.label)}
                    onKeyDown={(e) => {
                      if (onNodeClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onNodeClick(node.label);
                      }
                    }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered((h) => (h === node.id ? null : h))}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={color}
                      opacity={node.type === 'hub' ? 1 : 0.92}
                      filter={isHovered ? 'url(#node-glow)' : undefined}
                      stroke={isHovered ? '#ffffff' : 'transparent'}
                      strokeWidth={isHovered ? 1.5 : 0}
                      style={{ transition: 'r 0.15s' }}
                    />
                    <text
                      x={node.x}
                      y={(node.y ?? 0) + r + 13}
                      textAnchor="middle"
                      fill={isHovered ? '#f2f2f2' : '#9a9aa0'}
                      fontSize={node.type === 'hub' ? 10.5 : 9.5}
                      fontWeight={node.type === 'hub' ? 600 : 500}
                      fontFamily="var(--font-sans)"
                      style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                    >
                      {node.label.length > 22 ? node.label.slice(0, 22) + '…' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Legend */}
        <div
          className="flex items-center gap-4 flex-wrap"
          style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1c1c20' }}
        >
          {(['hub', 'entity', 'partner', 'risk'] as const).map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: nodeColor[t], display: 'inline-block' }} aria-hidden="true" />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  color: '#75757c',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </span>
            </div>
          ))}
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              color: '#4a4a50',
              marginLeft: 'auto',
            }}
          >
            Scroll to zoom · drag to pan · drag a node to reposition
          </span>
        </div>
      </div>
    </div>
  );
}
