import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { CitedItem } from '@/lib/intelligence-view-model';

interface RisksPanelProps {
  risks: CitedItem[];
  onSelect: (risk: CitedItem) => void;
}

export function RisksPanel({ risks, onSelect }: RisksPanelProps) {
  if (risks.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={13} color="#ff453a" aria-hidden="true" />
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Risks
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {risks.map((r, i) => {
          const clickable = r.sourceNodes.length > 0;
          return (
            <button
              key={i}
              onClick={() => clickable && onSelect(r)}
              disabled={!clickable}
              className="flex items-start gap-3 text-left w-full"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid rgba(255,69,58,0.2)',
                borderRadius: 10,
                padding: '12px 14px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (clickable) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.2)';
              }}
            >
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
                {r.text}
              </p>
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
