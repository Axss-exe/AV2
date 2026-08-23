'use client';

import Link from 'next/link';
import type { EntityListItem } from '@/lib/api';
import { resolveEntityType, entityTypeMeta } from '@/lib/entity-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^---[\s\S]*?---/m, '')         // Remove frontmatter
    .replace(/^#{1,6}\s+/gm, '')             // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1')         // Bold
    .replace(/\*(.+?)\*/g, '$1')             // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')      // Links
    .replace(/\[\[(.+?)\]\]/g, '$1')         // WikiLinks
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // Code
    .replace(/^[-*+]\s+/gm, '')              // List items
    .replace(/^>\s+/gm, '')                  // Blockquotes
    .replace(/\n{2,}/g, ' ')                 // Collapse whitespace
    .replace(/\n/g, ' ')
    .trim();
}

/** Deterministic color from entity id — avoids random colors on re-render */
function hashToColor(str: string): string {
  const COLORS = [
    '#30d158', // green
    '#64d2ff', // blue
    '#ffd60a', // yellow
    '#ff9f0a', // orange
    '#ff453a', // red
    '#bf5af2', // purple
    '#ff6b35', // coral
    '#0a84ff', // bright blue
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Highlight helper — wraps first match in a <mark>
// ---------------------------------------------------------------------------

interface HighlightedTextProps {
  text: string;
  query: string;
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: 'rgba(255,214,10,0.25)',
          color: '#ffd60a',
          borderRadius: 2,
          padding: '0 1px',
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EntityCardProps {
  entity: EntityListItem;
  variant?: 'compact' | 'full';
  onClick?: () => void;
  searchQuery?: string;
  /** When true, card renders as an <a> link to /entities/[id] */
  asLink?: boolean;
}

// ---------------------------------------------------------------------------
// Compact variant
// ---------------------------------------------------------------------------

function CompactCard({ entity, onClick }: Pick<EntityCardProps, 'entity' | 'onClick'>) {
  const color = hashToColor(entity.id);
  const size = entity.size_bytes != null ? formatBytes(entity.size_bytes) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={`View ${entity.name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'var(--bg-control)',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'border-color 0.18s, transform 0.18s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 11,
          color,
          letterSpacing: '0.02em',
        }}
      >
        {initials(entity.name)}
      </div>

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 12,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entity.name}
      </span>

      {/* Size */}
      {size && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-dim)',
            flexShrink: 0,
          }}
        >
          {size}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full variant
// ---------------------------------------------------------------------------

function FullCard({ entity, onClick, searchQuery, asLink }: EntityCardProps) {
  const type = resolveEntityType(entity.entity_type, entity.path);
  const meta = entityTypeMeta(type);
  const TypeIcon = meta.icon;
  const color = meta.color;
  const size = entity.size_bytes != null ? formatBytes(entity.size_bytes) : null;
  const rawContent = entity.content ?? '';
  const stripped = stripMarkdown(rawContent);

  // Build content snippet — show excerpt around first match if searching
  let snippet = stripped.slice(0, 120);
  if (searchQuery && stripped) {
    const q = searchQuery.toLowerCase();
    const idx = stripped.toLowerCase().indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(stripped.length, idx + q.length + 60);
      snippet = (start > 0 ? '...' : '') + stripped.slice(start, end) + (end < stripped.length ? '...' : '');
    }
  } else {
    snippet = stripped.slice(0, 120) + (stripped.length > 120 ? '...' : '');
  }

  const inner = (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top: Avatar + category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 12,
            color,
            letterSpacing: '0.02em',
          }}
        >
          {initials(entity.name)}
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 9,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            color,
            background: `${color}1a`,
            border: `1px solid ${color}40`,
            borderRadius: 5,
            padding: '3px 8px',
            flexShrink: 0,
          }}
        >
          <TypeIcon size={10} aria-hidden="true" />
          {meta.label}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}
      >
        {entity.name}
      </h3>

      {/* Filename (mono) */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--border-default)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginTop: -4,
        }}
      >
        {entity.filename}
      </p>

      {/* Content preview */}
      {snippet && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 11,
            color: 'var(--text-dim)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          <HighlightedText text={snippet} query={searchQuery ?? ''} />
        </p>
      )}

      {/* Footer: size + view link */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        {size ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--border-default)',
            }}
          >
            {size}
          </span>
        ) : (
          <span />
        )}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}
        >
          View Profile →
        </span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={`/entities/${entity.slug}`}
        style={{ display: 'block', height: '100%', textDecoration: 'none' }}
        aria-label={`View profile for ${entity.name}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={`View profile for ${entity.name}`}
      style={{ height: '100%' }}
    >
      {inner}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function EntityCard({ variant = 'full', ...props }: EntityCardProps) {
  if (variant === 'compact') return <CompactCard entity={props.entity} onClick={props.onClick} />;
  return <FullCard {...props} />;
}
