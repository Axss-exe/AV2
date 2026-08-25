'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { InvestigationQuery } from '@/lib/investigation-types';
import { buildIntelligenceViewModel } from '@/lib/intelligence-view-model';
import { PerspectiveBanner } from '@/components/query/perspective-banner';
import { AnswerPanel } from '@/components/query/answer-panel';
import { ResearchRequiredPanel } from '@/components/query/research-required-panel';
import { FindingsPanel } from '@/components/query/findings-panel';
import { RisksPanel } from '@/components/query/risks-panel';
import { SearchBar } from '@/components/query/search-bar';
import type { DrawerView } from '@/components/query/intel-drawer';

interface InvestigationQueryPanelProps {
  query: InvestigationQuery;
  onPushDrawer: (view: DrawerView) => void;
  onContinue: (question: string) => Promise<boolean>;
  continueLoading: boolean;
  continueError: string | null;
  isLatest: boolean;
}

export function InvestigationQueryPanel({
  query,
  onPushDrawer,
  onContinue,
  continueLoading,
  continueError,
  isLatest,
}: InvestigationQueryPanelProps) {
  const [followUpValue, setFollowUpValue] = useState('');
  const vm = buildIntelligenceViewModel(query.result);

  const handleSubmit = async (value: string) => {
    if (!value.trim() || continueLoading) return;
    const succeeded = await onContinue(value);
    if (succeeded) setFollowUpValue('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PerspectiveBanner
          perspectiveCountry={vm.perspectiveCountry}
          perspectiveCountryCode={vm.perspectiveCountryCode}
          sourceCountries={vm.sourceCountries}
          cached={vm.cached}
          elapsedSeconds={vm.elapsedSeconds}
        />
        <AnswerPanel result={query.result} vm={vm} />
      </div>

      {vm.research.isResearchRequired ? (
        <ResearchRequiredPanel vm={vm} />
      ) : (
        <>
          <FindingsPanel findings={vm.findings} onSelect={(f) => onPushDrawer({ type: 'finding', item: f })} />
          <RisksPanel risks={vm.risks} onSelect={(r) => onPushDrawer({ type: 'risk', item: r })} />
        </>
      )}

      {isLatest && (
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
              marginBottom: 12,
            }}
          >
            Continue Investigation
          </div>

          {continueError && (
            <div
              className="flex items-start gap-3 mb-3"
              style={{
                background: 'rgba(255,69,58,0.08)',
                border: '1px solid rgba(255,69,58,0.25)',
                borderRadius: 10,
                padding: '12px 16px',
              }}
              role="alert"
            >
              <AlertCircle size={15} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <div className="flex-1">
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: '#ff453a', margin: 0, marginBottom: 2 }}>
                  Query could not be completed
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                  {continueError} The investigation has not been modified.
                </p>
              </div>
              <button
                onClick={() => handleSubmit(followUpValue)}
                disabled={continueLoading || !followUpValue.trim()}
                style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 11,
                  color: '#ff453a',
                  background: 'transparent',
                  border: '1px solid rgba(255,69,58,0.35)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          <SearchBar
            value={followUpValue}
            onChange={setFollowUpValue}
            onSubmit={handleSubmit}
            compact
            disabled={continueLoading}
            placeholder="Ask a follow-up question..."
            ariaLabel="Continue investigation with a follow-up query"
          />
        </div>
      )}
    </div>
  );
}
