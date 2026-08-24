import { ArrowUpRight } from 'lucide-react';
import type { OpportunityCited } from '@/lib/types';

interface OpportunitiesPanelProps {
  opportunities: OpportunityCited[];
  onSelect: (opportunity: OpportunityCited) => void;
}

export function OpportunitiesPanel({ opportunities, onSelect }: OpportunitiesPanelProps) {
  if (opportunities.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 20,
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
        }}
      >
        Opportunities
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {opportunities.map((o) => (
          <button
            key={o.opportunityId ?? o.title}
            onClick={() => onSelect(o)}
            className="flex flex-col gap-3 text-left"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-warning)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {o.title}
              </h4>
              <ArrowUpRight size={14} color="var(--text-dim)" style={{ flexShrink: 0 }} aria-hidden="true" />
            </div>

            {o.pathway && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {o.pathway}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {typeof o.urgencyScore === 'number' && (
                <ScoreTag label="Urgency" value={o.urgencyScore} />
              )}
              {typeof o.feasibilityScore === 'number' && (
                <ScoreTag label="Feasibility" value={o.feasibilityScore} />
              )}
              {o.status && (
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 9,
                    color: 'var(--accent-warning)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: '1px solid var(--accent-warning)',
                    borderRadius: 4,
                    padding: '2px 6px',
                  }}
                >
                  {o.status}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreTag({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 10,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}
