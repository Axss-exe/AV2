'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigation } from '@/lib/api';
import type { EvidenceSource, ImportantEntity, InvestigationReport, KeyFinding, Relationship } from '@/lib/investigation-types';

const textStyle = { margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7 } as const;

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ border: '1px solid var(--border-default)', borderRadius: 14, background: 'var(--bg-surface)', padding: 20 }}>
    <h2 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 650 }}>{title}</h2>
    {children}
  </section>;
}

function Strings({ items }: { items: string[] }) {
  return items.length ? <ul style={{ ...textStyle, marginTop: 0, paddingLeft: 18 }}>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p style={textStyle}>No entries returned.</p>;
}

function Findings({ items }: { items: KeyFinding[] }) {
  return items.length ? <div className="flex flex-col gap-4">{items.map((item, index) => <article key={`${item.finding}-${index}`}><p style={{ ...textStyle, color: 'var(--text-primary)', fontWeight: 550 }}>{item.finding}</p><p style={textStyle}>Confidence: {item.confidence}</p><Strings items={item.evidence_queries} /></article>)}</div> : <p style={textStyle}>No findings returned.</p>;
}

function Entities({ items }: { items: ImportantEntity[] }) {
  return items.length ? <div className="flex flex-col gap-4">{items.map((item, index) => <article key={`${item.name}-${index}`}><p style={{ ...textStyle, color: 'var(--text-primary)', fontWeight: 550 }}>{item.name} <span style={{ color: 'var(--text-dim)' }}>· {item.type}</span></p><p style={textStyle}>{item.significance}</p><Strings items={item.evidence_queries} /></article>)}</div> : <p style={textStyle}>No entities returned.</p>;
}

function Relationships({ items }: { items: Relationship[] }) {
  return items.length ? <div className="flex flex-col gap-4">{items.map((item, index) => <article key={`${item.from_entity}-${item.to_entity}-${index}`}><p style={{ ...textStyle, color: 'var(--text-primary)', fontWeight: 550 }}>{item.from_entity} → {item.to_entity}</p><p style={textStyle}>{item.relationship_type}: {item.insight}</p><Strings items={item.evidence_queries} /></article>)}</div> : <p style={textStyle}>No relationships returned.</p>;
}

function Sources({ items }: { items: EvidenceSource[] }) {
  return items.length ? <div className="flex flex-col gap-3">{items.map((item, index) => <p key={`${item.source_id}-${index}`} style={textStyle}><strong>{item.source_id}</strong> · {item.type} · {item.relevance}</p>)}</div> : <p style={textStyle}>No sources returned.</p>;
}

function ReportContent({ report }: { report: InvestigationReport }) {
  return <div className="flex flex-col gap-4">
    <ReportSection title="Executive summary"><p style={{ ...textStyle, fontSize: 14 }}>{report.executive_summary}</p></ReportSection>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ReportSection title="Key findings"><Findings items={report.key_findings} /></ReportSection>
      <ReportSection title="Important entities"><Entities items={report.important_entities} /></ReportSection>
      <ReportSection title="Important relationships"><Relationships items={report.important_relationships} /></ReportSection>
      <ReportSection title="Evidence and sources"><Sources items={report.evidence_and_sources} /></ReportSection>
      <ReportSection title="Research required"><Strings items={report.research_required} /></ReportSection>
      <ReportSection title="Unresolved questions"><Strings items={report.unresolved_questions} /></ReportSection>
    </div>
    <ReportSection title="Investigation narrative"><p style={textStyle}>{report.investigation_narrative}</p></ReportSection>
    <ReportSection title="Strategic implications"><p style={textStyle}>{report.implications}</p></ReportSection>
    <ReportSection title="Confidence and limitations"><p style={textStyle}>{report.confidence_and_limitations}</p></ReportSection>
  </div>;
}

export default function InvestigationReportPage() {
  const { id } = useParams<{ id: string }>();
  const investigationId = Number(id);
  const { data: investigation, error, isLoading } = useSWR(Number.isFinite(investigationId) ? `/api/investigations/${investigationId}` : null, () => fetchInvestigation(investigationId));
  const report = investigation?.report;

  return <AppShell><div className="pt-6 md:pt-10">
    <Link href={`/investigations/${id}`} className="inline-flex items-center gap-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-sans)', fontSize: 12, textDecoration: 'none' }}><ArrowLeft size={14} aria-hidden="true" /> Back to investigation</Link>
    <header className="flex items-start justify-between gap-4 mt-6 mb-6"><div><div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}><FileText size={14} aria-hidden="true" /> Knowledge report</div><h1 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 650 }}>{report?.title ?? investigation?.title ?? 'Investigation report'}</h1><p style={{ ...textStyle, marginTop: 8 }}>{report?.original_question}</p></div>{report?.generated_at && <time dateTime={report.generated_at} style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Generated {new Date(report.generated_at).toLocaleDateString('en-GB')}</time>}</header>
    {isLoading && <div className="flex items-center gap-2" style={textStyle}><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Loading report…</div>}
    {error && !isLoading && <p role="alert" style={textStyle}>The investigation could not be loaded.</p>}
    {investigation && !report && <p style={textStyle}>This investigation does not have a generated report yet.</p>}
    {report && <ReportContent report={report} />}
  </div></AppShell>;
}
