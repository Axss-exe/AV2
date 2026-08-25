'use client';

import { ArrowRight } from 'lucide-react';
import type { AggregatedKnowledge } from '@/lib/investigation-types';

interface InvestigationContextPanelProps {
  aggregated: AggregatedKnowledge;
  onSelectEntity: (name: string) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export function InvestigationContextPanel({ aggregated, onSelectEntity }: InvestigationContextPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Entities */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <SectionLabel>Entities ({aggregated.entities.length})</SectionLabel>
        {aggregated.entities.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            No entities identified yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {aggregated.entities.map((e) => (
              <button
                key={e.entity_name}
                onClick={() => onSelectEntity(e.entity_name)}
                className="flex items-center justify-between gap-2 text-left w-full"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(ev) => {
                  (ev.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(ev) => {
                  (ev.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
                }}
              >
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.entity_name}
                  </div>
                  {e.entity_type && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {e.entity_type}
                    </div>
                  )}
                </div>
                <ArrowRight size={12} color="var(--text-dim)" style={{ flexShrink: 0 }} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Relationships */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <SectionLabel>Relationships ({aggregated.relationships.length})</SectionLabel>
        {aggregated.relationships.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            No relationships mapped yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {aggregated.relationships.map((r, i) => (
              <div
                key={`${r.from}|${r.to}|${r.label}|${i}`}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                  paddingBottom: i === aggregated.relationships.length - 1 ? 0 : 10,
                  borderBottom: i === aggregated.relationships.length - 1 ? 'none' : '1px solid var(--border-default)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{r.from}</span>
                {' '}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>{r.label}</span>
                {' '}
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{r.to}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sources */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <SectionLabel>Sources ({aggregated.sources.length})</SectionLabel>
        {aggregated.sources.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            No sources cited yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {aggregated.sources.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 5,
                  padding: '4px 8px',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Open questions — honest empty state, no fabricated gaps */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <SectionLabel>Open Questions</SectionLabel>
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
          No unresolved questions have been flagged for this investigation yet.
        </p>
      </div>
    </div>
  );
}
