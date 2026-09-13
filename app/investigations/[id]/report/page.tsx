'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigation } from '@/lib/api';

export default function InvestigationReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const investigationId = params.id;
  const { data: investigation, error, isLoading } = useSWR(
    investigationId ? `/api/investigations/${investigationId}` : null,
    () => fetchInvestigation(investigationId)
  );

  return (
    <AppShell>
      <main className="pt-6 md:pt-10" style={{ maxWidth: 860, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => router.push(`/investigations/${params.id}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, background: 'transparent', border: 0, color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}
        >
          <ArrowLeft size={13} aria-hidden="true" /> Back to investigation
        </button>

        {isLoading && (
          <div className="flex items-center justify-center" style={{ minHeight: 240 }}>
            <Loader2 size={20} color="var(--text-dim)" className="animate-spin" aria-label="Loading report" />
          </div>
        )}

        {error && !isLoading && (
          <p role="alert" style={{ color: '#ff453a', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            Investigation report could not be loaded.
          </p>
        )}

        {investigation && !isLoading && (
          <article>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Knowledge report
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              {investigation.report?.title ?? investigation.title}
            </h1>
            {investigation.report && (
              <div className="report-copy" style={{ marginBottom: 18 }}>
                <div>Original question: {investigation.report.original_question}</div>
                <div>Generated: {investigation.report.generated_at}</div>
                <div>Based on {investigation.report.based_on_queries} queries</div>
              </div>
            )}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 28px' }}>
              Based on {investigation.queries.length} persisted quer{investigation.queries.length === 1 ? 'y' : 'ies'} and the accumulated investigation context.
            </p>

            {!investigation.report ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                No report has been generated for this investigation.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                <section>
                  <h2 className="report-heading">Executive Summary</h2>
                  <p className="report-copy">{investigation.report.executive_summary}</p>
                </section>
                <section>
                  <h2 className="report-heading">Implications</h2>
                  <p className="report-copy">{investigation.report.implications}</p>
                </section>
                <section>
                  <h2 className="report-heading">Key Findings</h2>
                  <ReportList items={(investigation.report.key_findings ?? []).map((item) => String(item.finding ?? ''))} />
                </section>
                <section>
                  <h2 className="report-heading">Important Entities</h2>
                  <ReportList items={(investigation.report.important_entities ?? []).map((item) => String(item.name ?? ''))} />
                </section>
                <section>
                  <h2 className="report-heading">Important Relationships</h2>
                  <ReportList items={(investigation.report.important_relationships ?? []).map((item) => String(item.insight ?? `${item.from_entity ?? ''} ${item.relationship_type ?? ''} ${item.to_entity ?? ''}`))} />
                </section>
                <section>
                  <h2 className="report-heading">Research Required</h2>
                  <ReportList items={investigation.report.research_required ?? []} />
                </section>
                <section>
                  <h2 className="report-heading">Evidence &amp; Sources</h2>
                  <ReportList items={(investigation.report.evidence_and_sources ?? []).map((item) => String(item.source_id ?? ''))} />
                </section>
                <section>
                  <h2 className="report-heading">Unresolved Questions</h2>
                  <ReportList items={investigation.report.unresolved_questions ?? []} />
                </section>
                <section>
                  <h2 className="report-heading">Investigation Narrative</h2>
                  <p className="report-copy">{investigation.report.investigation_narrative}</p>
                </section>
                <section>
                  <h2 className="report-heading">Confidence &amp; Limitations</h2>
                  <p className="report-copy">{investigation.report.confidence_and_limitations}</p>
                </section>
              </div>
            )}
          </article>
        )}
      </main>
      <style jsx>{`
        .report-heading { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }
        .report-copy { font-family: var(--font-sans); font-size: 13px; line-height: 1.7; color: var(--text-tertiary); margin: 0; }
      `}</style>
    </AppShell>
  );
}

function ReportList({ items }: { items: string[] }) {
  if (!items.length) return <p className="report-copy">No items returned.</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7 }}>
      {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  );
}
