'use client';

import type { InvestigationQuery } from '@/lib/investigation-types';

interface InvestigationTimelineProps {
  queries: InvestigationQuery[];
  selectedSequence: number;
  onSelect: (sequence: number) => void;
}

export function InvestigationTimeline({ queries, selectedSequence, onSelect }: InvestigationTimelineProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
          paddingLeft: 4,
        }}
      >
        Timeline
      </div>

      <div className="flex flex-col">
        {queries.map((q, i) => {
          const isSelected = q.sequence === selectedSequence;
          const isLast = i === queries.length - 1;
          const findingsCount = q.result.findingsCited?.length ?? q.result.findings?.length ?? 0;
          const entitiesCount = q.result.keyEntities?.length ?? 0;
          const sourcesCount = q.result.tableRows?.length ?? 0;

          return (
            <div key={q.id} className="flex gap-3">
              {/* Node + connecting line */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-hover)'}`,
                    background: isSelected ? 'var(--text-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: 9,
                      color: isSelected ? 'var(--bg-primary)' : 'var(--text-dim)',
                    }}
                  >
                    {String(q.sequence).padStart(2, '0')}
                  </span>
                </div>
                {!isLast && (
                  <div style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--border-default)' }} aria-hidden="true" />
                )}
              </div>

              {/* Query summary button */}
              <button
                onClick={() => onSelect(q.sequence)}
                className="text-left"
                style={{
                  flex: 1,
                  background: isSelected ? 'var(--bg-primary)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--border-hover)' : 'transparent'}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  marginBottom: isLast ? 0 : 12,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                aria-current={isSelected ? 'true' : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      fontSize: 9,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Query {String(q.sequence).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--text-primary)' : 'var(--text-dim)',
                    }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      fontSize: 9,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {isSelected ? 'Current' : 'Completed'}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: 12,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    lineHeight: 1.4,
                    margin: 0,
                    marginBottom: 6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {q.question}
                </p>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    fontSize: 9,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {findingsCount} FIND · {entitiesCount} ENT · {sourcesCount} SRC
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
