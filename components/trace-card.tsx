'use client';

import type { Trace } from '@/lib/types';

interface TraceCardProps {
  trace: Trace;
}

const BADGE_STYLES = {
  validated: { color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' },
  gap: { color: '#ff453a', border: '1px solid #ff453a' },
  external: { color: '#ff9f0a', border: '1px solid #ff9f0a' },
};

export function TraceCard({ trace }: TraceCardProps) {
  const badge = BADGE_STYLES[trace.badge];

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 8,
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-primary)';
      }}
    >
      {/* Header: Source + Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          {trace.source}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            color: badge.color,
            background: 'var(--border-default)',
            border: badge.border,
            borderRadius: 4,
            padding: '2px 8px',
            flexShrink: 0,
          }}
          aria-label={`Status: ${trace.badge}`}
        >
          {trace.badge}
        </span>
      </div>

      {/* Relationship code */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 10,
          color: 'var(--text-dim)',
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {trace.relationship}
      </div>

      {/* Fact block */}
      <div
        style={{
          paddingLeft: 10,
          borderLeft: '2px solid var(--border-hover)',
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {trace.fact}
        </p>
      </div>

      {/* Justification */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {trace.justification}
      </p>
    </div>
  );
}
