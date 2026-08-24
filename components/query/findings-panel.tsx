import { ChevronRight } from 'lucide-react';
import type { CitedItem } from '@/lib/intelligence-view-model';

const SEVERITY_COLOR: Record<string, string> = {
  Critical: 'var(--accent-warning)',
  High: '#ff9f0a',
  Medium: 'var(--text-tertiary)',
  Low: 'var(--text-dim)',
};

interface FindingsPanelProps {
  findings: CitedItem[];
  onSelect: (finding: CitedItem) => void;
}

export function FindingsPanel({ findings, onSelect }: FindingsPanelProps) {
  if (findings.length === 0) return null;

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
        Key Findings
      </div>
      <div className="flex flex-col gap-2">
        {findings.map((f, i) => {
          const clickable = f.sourceNodes.length > 0;
          return (
            <button
              key={i}
              onClick={() => clickable && onSelect(f)}
              disabled={!clickable}
              className="flex items-start gap-3 text-left w-full"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 10,
                padding: '12px 14px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (clickable) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  flexShrink: 0,
                  marginTop: 1,
                }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {f.text}
              </p>
              {f.severity && (
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 9,
                    color: SEVERITY_COLOR[f.severity],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: `1px solid ${SEVERITY_COLOR[f.severity]}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    marginTop: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.severity}
                </span>
              )}
              {clickable && (
                <ChevronRight size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
