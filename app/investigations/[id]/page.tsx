'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ChevronDown, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { InvestigationHeader } from '@/components/investigation/investigation-header';
import { InvestigationTimeline } from '@/components/investigation/investigation-timeline';
import { InvestigationQueryPanel } from '@/components/investigation/investigation-query-panel';
import { InvestigationContextPanel } from '@/components/investigation/investigation-context-panel';
import { IntelDrawer, type DrawerView } from '@/components/query/intel-drawer';
import {
  fetchInvestigation,
  addInvestigationQuery,
  generateInvestigationReport,
  queryAPI,
  APIError,
} from '@/lib/api';
import { mapAPIResponseToQueryResult } from '@/lib/query-mapping';

export default function InvestigationWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const investigationId = Number(params.id);

  const { data: investigation, error, isLoading, mutate } = useSWR(
    Number.isFinite(investigationId) ? `/api/investigations/${investigationId}` : null,
    () => fetchInvestigation(investigationId)
  );

  const [selectedSequence, setSelectedSequence] = useState<number | null>(null);
  const [drawerStack, setDrawerStack] = useState<DrawerView[]>([]);
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const pushDrawer = (view: DrawerView) => setDrawerStack((prev) => [...prev, view]);
  const popDrawer = () => setDrawerStack((prev) => prev.slice(0, -1));
  const closeDrawer = () => setDrawerStack([]);

  const activeSequence = useMemo(() => {
    if (!investigation) return null;
    if (selectedSequence !== null && investigation.queries.some((q) => q.sequence === selectedSequence)) {
      return selectedSequence;
    }
    return investigation.queries[investigation.queries.length - 1]?.sequence ?? null;
  }, [investigation, selectedSequence]);

  const selectedQuery = investigation?.queries.find((q) => q.sequence === activeSequence) ?? null;
  const isLatest = !!selectedQuery && selectedQuery.sequence === investigation?.queries[investigation.queries.length - 1]?.sequence;

  const handleContinue = async (question: string): Promise<boolean> => {
    if (!investigation) return false;
    setContinueLoading(true);
    setContinueError(null);
    try {
      const res = await queryAPI({
        question,
        perspective_country: investigation.perspectiveCountry,
        perspective_country_code: investigation.perspectiveCountryCode,
      });
      const result = mapAPIResponseToQueryResult(question, res);
      const updated = await addInvestigationQuery(investigation.id, { question, result });
      await mutate(updated);
      setSelectedSequence(updated.queries[updated.queries.length - 1]?.sequence ?? null);
      return true;
    } catch (err: unknown) {
      setContinueError(
        err instanceof APIError ? err.message : 'Failed to reach the intelligence pipeline.'
      );
      return false;
    } finally {
      setContinueLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!investigation || generatingReport) return;
    setGeneratingReport(true);
    setReportError(null);
    try {
      await generateInvestigationReport(investigation.id);
      router.push(`/investigations/${investigation.id}/report`);
    } catch (err: unknown) {
      setReportError(
        err instanceof APIError ? err.message : 'Failed to generate the report. Please try again.'
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <AppShell>
      <AnalystLoading isVisible={continueLoading} durationMs={120_000} />

      <div className="pt-6 md:pt-10">
        {isLoading && (
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Loader2 size={20} color="var(--text-dim)" className="animate-spin" aria-hidden="true" />
          </div>
        )}

        {error && !isLoading && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Investigation could not be loaded.
            </p>
            <button
              onClick={() => mutate()}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 12,
                color: 'var(--text-primary)',
                background: 'var(--border-default)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {investigation && selectedQuery && (
          <>
            <InvestigationHeader
              investigation={investigation}
              onGenerateReport={handleGenerateReport}
              generatingReport={generatingReport}
              reportError={reportError}
            />

            {/* Mobile timeline disclosure */}
            <details className="md:hidden mb-4" style={{ border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
              <summary
                className="flex items-center justify-between"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  listStyle: 'none',
                }}
              >
                Timeline ({investigation.queries.length})
                <ChevronDown size={14} color="var(--text-dim)" aria-hidden="true" />
              </summary>
              <div style={{ padding: '0 4px 12px' }}>
                <InvestigationTimeline
                  queries={investigation.queries}
                  selectedSequence={activeSequence ?? 0}
                  onSelect={setSelectedSequence}
                />
              </div>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_280px] gap-4 items-start">
              <div className="hidden md:block" style={{ position: 'sticky', top: 24 }}>
                <InvestigationTimeline
                  queries={investigation.queries}
                  selectedSequence={activeSequence ?? 0}
                  onSelect={setSelectedSequence}
                />
              </div>

              <InvestigationQueryPanel
                query={selectedQuery}
                onPushDrawer={pushDrawer}
                onContinue={handleContinue}
                continueLoading={continueLoading}
                continueError={continueError}
                isLatest={isLatest}
              />

              <div className="hidden md:block" style={{ position: 'sticky', top: 24 }}>
                <InvestigationContextPanel
                  aggregated={investigation.aggregated}
                  onSelectEntity={(name) => pushDrawer({ type: 'entity', name })}
                />
              </div>
            </div>

            {/* Mobile context disclosure */}
            <details className="md:hidden mt-4" style={{ border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
              <summary
                className="flex items-center justify-between"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  listStyle: 'none',
                }}
              >
                Accumulated Knowledge
                <ChevronDown size={14} color="var(--text-dim)" aria-hidden="true" />
              </summary>
              <div style={{ padding: '0 12px 16px' }}>
                <InvestigationContextPanel
                  aggregated={investigation.aggregated}
                  onSelectEntity={(name) => pushDrawer({ type: 'entity', name })}
                />
              </div>
            </details>
          </>
        )}

        <IntelDrawer stack={drawerStack} onClose={closeDrawer} onPush={pushDrawer} onPop={popDrawer} />
      </div>
    </AppShell>
  );
}
