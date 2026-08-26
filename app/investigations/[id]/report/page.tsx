'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigation } from '@/lib/api';
import type { InvestigationReport } from '@/lib/investigation-types';

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        background: 'var(--bg-surface)',
        padding: 20,
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: 12,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 650,
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ReportList({ items }: { items?: string[] }) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.65 }}>
      {safeItems.length > 0 ? safeItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>) : <li>No entries returned.</li>}
    </ul>
  );
}

function ReportContent({ report }: { report: InvestigationReport }) {
  return (
    <div className="flex flex-col gap-4">
      <ReportSection title="Executive assessment">
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7 }}>{report.executiveAssessment}</p>
      </ReportSection>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSection title="Key findings"><ReportList items={report.keyFindings} /></ReportSection>
        <ReportSection title="Actor landscape"><p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7 }}>{report.actorLandscape}</p></ReportSection>
        <ReportSection title="Relationships"><p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7 }}>{report.relationshipsNarrative}</p></ReportSection>
        <ReportSection title="Risks"><ReportList items={report.risks} /></ReportSection>
        <ReportSection title="Opportunities"><ReportList items={report.opportunities} /></ReportSection>
        <ReportSection title="Knowledge gaps"><ReportList items={report.knowledgeGaps} /></ReportSection>
      </div>
      <ReportSection title="Source trail"><ReportList items={report.sourceTrail} /></ReportSection>
    </div>
  );
}

export default function InvestigationReportPage() {
  const { id } = useParams<{ id: string }>();
  const investigationId = Number(id);
  const { data: investigation, error, isLoading } = useSWR(
    Number.isFinite(investigationId) ? `/api/investigations/${investigationId}` : null,
    () => fetchInvestigation(investigationId)
  );

  return (
    <AppShell>
      <div className="pt-6 md:pt-10">
        <Link href={`/investigations/${id}`} className="inline-flex items-center gap-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-sans)', fontSize: 12, textDecoration: 'none' }}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to investigation
        </Link>
        <header className="flex items-start justify-between gap-4 mt-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <FileText size={14} aria-hidden="true" /> Knowledge report
            </div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 650, letterSpacing: '-0.03em' }}>
              {investigation?.title ?? 'Investigation report'}
            </h1>
          </div>
          {investigation?.report?.generatedAt && <time dateTime={investigation.report.generatedAt} style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Generated {new Date(investigation.report.generatedAt).toLocaleDateString('en-GB')}</time>}
        </header>
        {isLoading && <div className="flex items-center gap-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-sans)', fontSize: 13 }}><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Loading report…</div>}
        {error && !isLoading && <p role="alert" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>The investigation could not be loaded.</p>}
        {investigation && !investigation.report && <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>This investigation does not have a generated report yet.</p>}
        {investigation?.report && <ReportContent report={investigation.report} />}
      </div>
    </AppShell>
  );
}
