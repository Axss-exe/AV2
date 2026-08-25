import { SearchX } from 'lucide-react';
import type { IntelligenceViewModel } from '@/lib/intelligence-view-model';

interface ResearchRequiredPanelProps {
  vm: IntelligenceViewModel;
}

export function ResearchRequiredPanel({ vm }: ResearchRequiredPanelProps) {
  const fs = vm.filterStats;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 32,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'color-mix(in srgb, var(--accent-warning) 14%, transparent)',
            border: '1px solid var(--accent-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <SearchX size={16} color="var(--accent-warning)" />
        </div>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            Research Required
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 13,
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            No vault entities matched this query with sufficient confidence. The pipeline searched the
            available intelligence but could not assemble validated{' '}
            {vm.research.emptyCategories.join(', ')} for this question.
          </p>
        </div>
      </div>

      {fs && (
        <div
          className="grid grid-cols-3 gap-3"
          style={{ borderTop: '1px solid var(--border-default)', paddingTop: 20 }}
        >
          <StatCell label="Vault Entities" value={fs.vaultTotal} />
          <StatCell label="Candidates Matched" value={fs.candidatesAfterBroadFilter} />
          <StatCell label="Ranked by Analyst" value={fs.rankedByLlm} />
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--text-primary)',
        }}
      >
        {typeof value === 'number' ? value : '—'}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
