'use client';

import { useRef, useState } from 'react';
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

const NODE_W_HUB = 140;
const NODE_H_HUB = 52;
const NODE_W = 120;
const NODE_H = 44;

const nodeColors: Record<GraphNode['type'], { fill: string; stroke: string; text: string }> = {
  hub: { fill: 'var(--border-default)', stroke: 'var(--text-primary)', text: 'var(--text-primary)' },
  entity: { fill: 'var(--bg-primary)', stroke: 'var(--border-default)', text: 'var(--text-tertiary)' },
  partner: { fill: 'var(--bg-primary)', stroke: 'var(--border-default)', text: 'var(--text-secondary)' },
  risk: { fill: 'var(--bg-primary)', stroke: '#ff453a', text: '#ff453a' },
};

export function EntityGraph({ nodes: nodesProp, edges: edgesProp, title, onNodeClick }: EntityGraphProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Defensive guards — never call .map() on undefined
  const nodes = Array.isArray(nodesProp) ? nodesProp : [];
  const edges = Array.isArray(edgesProp) ? edgesProp : [];

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const getCenterX = (node: GraphNode) =>
    node.type === 'hub' ? node.x + NODE_W_HUB / 2 : node.x + NODE_W / 2;
  const getCenterY = (node: GraphNode) =>
    node.type === 'hub' ? node.y + NODE_H_HUB / 2 : node.y + NODE_H / 2;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 20,
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

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 700 280"
          style={{ width: '100%', height: 280, overflow: 'visible' }}
          role="img"
          aria-label="Entity network graph showing relationships between key nodes"
        >
          <defs>
            <style>{`
              @keyframes edgeFlow {
                to { stroke-dashoffset: -12; }
              }
            `}</style>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = getNodeById(edge.from);
            const toNode = getNodeById(edge.to);
            if (!fromNode || !toNode) return null;
            const x1 = getCenterX(fromNode);
            const y1 = getCenterY(fromNode);
            const x2 = getCenterX(toNode);
            const y2 = getCenterY(toNode);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const isRisk = toNode.type === 'risk' || fromNode.type === 'risk';

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isRisk ? '#ff453a' : 'var(--border-hover)'}
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  style={{
                    animation: 'edgeFlow 3s linear infinite',
                  }}
                />
                {edge.label && (
                  <g>
                    <rect
                      x={mx - 24}
                      y={my - 7}
                      width={48}
                      height={14}
                      fill="var(--bg-primary)"
                      rx={3}
                    />
                    <text
                      x={mx}
                      y={my + 4}
                      textAnchor="middle"
                      fill="var(--text-dim)"
                      fontSize="7"
                      fontFamily="var(--font-mono)"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHub = node.type === 'hub';
            const w = isHub ? NODE_W_HUB : NODE_W;
            const h = isHub ? NODE_H_HUB : NODE_H;
            const colors = nodeColors[node.type] ?? nodeColors.entity;

            return (
              <g
                key={node.id}
                role={onNodeClick ? 'button' : undefined}
                tabIndex={onNodeClick ? 0 : undefined}
                aria-label={onNodeClick ? `View entity ${node.label}` : undefined}
                style={{ cursor: 'pointer' }}
                onClick={() => onNodeClick?.(node.label)}
                onKeyDown={(e) => {
                  if (onNodeClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onNodeClick(node.label);
                  }
                }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as SVGGElement).querySelector('rect');
                  if (rect) rect.style.filter = 'brightness(1.4)';
                  const svgRect = svgRef.current?.getBoundingClientRect();
                  if (svgRect) {
                    setTooltip({
                      x: node.x + w / 2,
                      y: node.y,
                      label: node.label,
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const rect = (e.currentTarget as SVGGElement).querySelector('rect');
                  if (rect) rect.style.filter = 'none';
                  setTooltip(null);
                }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={w}
                  height={h}
                  rx={isHub ? 12 : 10}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="1"
                  style={{ transition: 'filter 0.3s ease' }}
                />
                <text
                  x={node.x + w / 2}
                  y={node.y + h / 2 + 3}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={isHub ? '9.5' : '9'}
                  fontWeight={isHub ? '600' : '500'}
                  fontFamily="var(--font-sans)"
                >
                  {node.label.length > 18 ? node.label.slice(0, 18) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: `${(tooltip.x / 700) * 100}%`,
              top: tooltip.y - 10,
              transform: 'translate(-50%, -100%)',
              background: 'var(--border-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              padding: '4px 10px',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-primary)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {tooltip.label}
          </div>
        )}
      </div>
    </div>
  );
}
