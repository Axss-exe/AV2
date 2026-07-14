'use client';

import type { Trace } from '@/lib/types';

interface TraceCardProps {
  trace: Trace;
}

const BADGE_STYLES = {
  validated: { color: '#a1a1a6', border: '1px solid #333333' },
  gap: { color: '#ff453a', border: '1px solid #ff453a' },
  external: { color: '#ff9f0a', border: '1px solid #ff9f0a' },
};

export function TraceCard({ trace }: TraceCardProps) {
  const badge = BADGE_STYLES[trace.badge];

  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #1c1c1e',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 8,
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#333333';
        (e.currentTarget as HTMLDivElement).style.background = '#0a0a0a';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c1e';
        (e.currentTarget as HTMLDivElement).style.background = '#000000';
      }}
    >
      {/* Header: Source + Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 12,
            color: '#ffffff',
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
            background: '#1c1c1e',
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
          color: '#525252',
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
          borderLeft: '2px solid #262626',
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 12,
            color: '#a1a1a6',
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
          color: '#737373',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {trace.justification}
      </p>
    </div>
  );
}
