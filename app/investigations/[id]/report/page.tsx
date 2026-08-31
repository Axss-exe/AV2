'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigation } from '@/lib/api';

function ClaimList({ title, claims }: { title: string; claims: string[] }) {
  return (
    <section className="border-t border-[var(--border-default)] py-6">
      <h2 className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-dim)]">{title}</h2>
      {claims.length ? <div className="space-y-3">{claims.map((claim, index) => <div key={`${claim}-${index}`} className="flex gap-3"><span className="font-mono text-xs text-[var(--text-dim)]">{String(index + 1).padStart(2, '0')}</span><p className="font-sans text-sm leading-6 text-[var(--text-secondary)]">{claim}</p></div>)}</div> : <p className="font-sans text-sm text-[var(--text-tertiary)]">No supported items were identified.</p>}
    </section>
  );
}

export default function InvestigationReportPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: investigation, error, isLoading } = useSWR(Number.isFinite(id) ? `/api/investigations/${id}` : null, () => fetchInvestigation(id));
  const report = investigation?.report;

  return <AppShell><main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
    <Link href={`/investigations/${id}`} className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)] hover:text-[var(--text-primary)]"><ArrowLeft size={13} aria-hidden="true" /> Back to investigation</Link>
    {isLoading && <div className="flex min-h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--text-dim)]" aria-label="Loading report" /></div>}
    {error && <p className="font-sans text-sm text-[var(--text-secondary)]">Report could not be loaded.</p>}
    {!isLoading && !error && !report && <div className="border-t border-[var(--border-default)] py-12"><FileText size={22} className="mb-4 text-[var(--text-dim)]" aria-hidden="true" /><h1 className="font-sans text-xl font-semibold text-[var(--text-primary)]">No report generated</h1><p className="mt-2 font-sans text-sm leading-6 text-[var(--text-tertiary)]">Return to the investigation and generate a report after adding enough evidence.</p></div>}
    {report && <article><div className="mb-8 border-b border-[var(--border-default)] pb-8"><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]"><FileText size={13} aria-hidden="true" /> Knowledge report</div><h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">Knowledge Report</h1><p className="mt-5 font-sans text-base leading-7 text-[var(--text-secondary)]">{report.executiveAssessment}</p></div><ClaimList title="Key findings" claims={report.keyFindings} /><ClaimList title="Opportunities" claims={report.opportunities} /><ClaimList title="Risks" claims={report.risks} /><ClaimList title="Open questions" claims={report.knowledgeGaps} /><section className="border-t border-[var(--border-default)] py-6"><h2 className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-dim)]">Source trail</h2><div className="flex flex-wrap gap-2">{report.sourceTrail.map((source) => <span key={source} className="rounded-full border border-[var(--border-default)] px-3 py-1.5 font-sans text-xs text-[var(--text-secondary)]">{source}</span>)}</div></section></article>}
  </main></AppShell>;
}
