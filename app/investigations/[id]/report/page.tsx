'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { ArrowDown, ArrowLeft, ChevronDown, FileText, Loader2, MoveDown, Network, Search, ShieldAlert } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { fetchInvestigation } from '@/lib/api'
import type { EvidenceSource, ImportantEntity, InvestigationReport, KeyFinding, Relationship } from '@/lib/investigation-types'

const mono = { fontFamily: 'var(--font-mono)' } as const
const body = { color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75 } as const
const eyebrow = { ...mono, color: 'var(--text-dim)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' as const }

function Rule() { return <div aria-hidden="true" style={{ borderTop: '1px solid var(--border-default)' }} /> }

function Section({ id, number, label, children, className = '' }: { id: string; number: string; label: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={className} style={{ scrollMarginTop: 92 }}>
    <div className="flex items-center gap-3 mb-6"><span style={{ ...eyebrow, color: 'var(--text-primary)' }}>{number}</span><span style={eyebrow}>{label}</span><div className="flex-1"><Rule /></div></div>
    {children}
  </section>
}

function Empty({ children = 'No entries returned.' }: { children?: string }) { return <p style={{ ...body, color: 'var(--text-dim)', margin: 0 }}>{children}</p> }
function Evidence({ queries = [], nodes = [] }: { queries?: string[]; nodes?: string[] }) {
  if (!queries.length && !nodes.length) return <Empty>No provenance recorded.</Empty>
  return <div className="flex flex-wrap gap-2 mt-4">{[...queries.map(q => `QUERY ${q}`), ...nodes.map(n => `SOURCE ${n}`)].map((item, i) => <span key={`${item}-${i}`} style={{ ...mono, border: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 10, padding: '4px 7px' }}>{item}</span>)}</div>
}

function Finding({ item, index }: { item: KeyFinding; index: number }) {
  return <article className="grid grid-cols-[40px_1fr] gap-4 py-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
    <span style={{ ...mono, color: 'var(--text-dim)', fontSize: 12 }}>{String(index + 1).padStart(2, '0')}</span>
    <div><div className="flex flex-wrap items-start justify-between gap-3"><p className="text-pretty" style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'clamp(17px, 2.2vw, 23px)', lineHeight: 1.35, fontWeight: 550 }}>{item.finding}</p><span style={{ ...mono, color: 'var(--text-primary)', fontSize: 10, letterSpacing: '0.1em', borderBottom: '2px solid var(--text-primary)', paddingBottom: 3 }}>{item.confidence.toUpperCase()}</span></div><Evidence queries={item.evidence_queries} nodes={item.source_nodes} /></div>
  </article>
}

function Entity({ item }: { item: ImportantEntity }) {
  return <article className="py-5" style={{ borderBottom: '1px solid var(--border-default)' }}><div className="flex items-baseline justify-between gap-3"><h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>{item.name}</h3><span style={eyebrow}>{item.type}</span></div><p style={{ ...body, margin: '8px 0 0' }}>{item.significance}</p><Evidence queries={item.evidence_queries} /></article>
}

function Relationship({ item }: { item: Relationship }) {
  return <details className="group py-5" style={{ borderBottom: '1px solid var(--border-default)' }}><summary className="flex cursor-pointer list-none items-center gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{item.from_entity}</strong><MoveDown size={14} style={{ color: 'var(--text-dim)', transform: 'rotate(-90deg)' }} aria-hidden="true" /><strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{item.to_entity}</strong></div><span style={{ ...eyebrow, display: 'inline-block', marginTop: 7 }}>{item.relationship_type}</span></div><ChevronDown size={16} className="transition-transform group-open:rotate-180" style={{ color: 'var(--text-dim)' }} aria-hidden="true" /></summary><p style={{ ...body, margin: '14px 0 0', paddingLeft: 0 }}>{item.insight}</p><Evidence queries={item.evidence_queries} /></details>
}

function Sources({ items }: { items: EvidenceSource[] }) {
  return items.length ? <div style={{ borderTop: '1px solid var(--border-default)' }}>{items.map((item, i) => <div key={`${item.source_id}-${i}`} className="grid grid-cols-[36px_1fr] gap-3 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}><span style={{ ...mono, color: 'var(--text-dim)', fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span><div><div className="flex flex-wrap items-center gap-3"><strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{item.source_id}</strong><span style={eyebrow}>{item.type}</span></div><p style={{ ...body, margin: '5px 0 0' }}>{item.relevance}</p></div></div>)}</div> : <Empty />
}

function ReportContent({ report }: { report: InvestigationReport }) {
  const findings = report.key_findings ?? [], entities = report.important_entities ?? [], relationships = report.important_relationships ?? [], sources = report.evidence_and_sources ?? [], unresolved = report.unresolved_questions ?? [], research = report.research_required ?? []
  return <div className="flex flex-col gap-16">
    <Section id="question" number="01" label="The question"><blockquote className="max-w-4xl text-pretty" style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'clamp(28px, 5vw, 56px)', lineHeight: 1.08, letterSpacing: '-0.035em', fontWeight: 550 }}>“{report.original_question}”</blockquote></Section>
    <Section id="findings" number="02" label="What we found"><div className="max-w-4xl"><p className="text-pretty" style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'clamp(22px, 3vw, 34px)', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{report.executive_summary || <Empty />}</p></div><div className="mt-10"><h3 style={{ ...eyebrow, margin: 0 }}>Key findings</h3>{findings.length ? findings.map((item, i) => <Finding key={`${item.finding}-${i}`} item={item} index={i} />) : <div className="mt-4"><Empty /></div>}</div></Section>
    <Section id="connections" number="03" label="How the pieces connect"><div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]"><div><h3 style={{ ...eyebrow, margin: 0 }}>Important entities</h3>{entities.length ? entities.map((item, i) => <Entity key={`${item.name}-${i}`} item={item} />) : <div className="mt-4"><Empty /></div>}</div><div><h3 style={{ ...eyebrow, margin: 0 }}>Relationships</h3>{relationships.length ? relationships.map((item, i) => <Relationship key={`${item.from_entity}-${item.to_entity}-${i}`} item={item} />) : <div className="mt-4"><Empty /></div>}</div></div></Section>
    <Section id="narrative" number="04" label="How we got here"><div className="max-w-3xl flex gap-5"><div className="flex flex-col items-center"><div style={{ width: 8, height: 8, background: 'var(--text-primary)', marginTop: 9 }} /><div className="flex-1" style={{ borderLeft: '1px solid var(--border-active)' }} /></div><p className="text-pretty" style={{ ...body, color: 'var(--text-primary)', fontSize: 17, margin: 0, paddingBottom: 24 }}>{report.investigation_narrative || <Empty />}</p></div></Section>
    <Section id="implications" number="05" label="So what?"><div className="max-w-4xl"><p className="text-pretty" style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'clamp(24px, 3.6vw, 42px)', lineHeight: 1.2, letterSpacing: '-0.025em', fontWeight: 550 }}>{report.implications || <Empty />}</p></div></Section>
    <Section id="uncertainty" number="06" label="What remains uncertain"><div className="grid grid-cols-1 gap-10 lg:grid-cols-2"><div><div className="flex items-center gap-2 mb-4"><ShieldAlert size={15} style={{ color: 'var(--text-dim)' }} aria-hidden="true" /><h3 style={{ ...eyebrow, margin: 0 }}>Confidence & limitations</h3></div><p className="text-pretty" style={{ ...body, margin: 0 }}>{report.confidence_and_limitations || <Empty />}</p></div><div><h3 style={{ ...eyebrow, margin: 0 }}>Unresolved questions</h3><div className="mt-4">{unresolved.length ? <ul style={{ ...body, margin: 0, paddingLeft: 20 }}>{unresolved.map((q, i) => <li key={`${q}-${i}`} style={{ marginBottom: 10 }}>{q}</li>)}</ul> : <Empty />}</div></div></div></Section>
    <Section id="research" number="07" label="Research required"><div className="max-w-3xl">{research.length ? <ul style={{ ...body, margin: 0, paddingLeft: 20 }}>{research.map((q, i) => <li key={`${q}-${i}`} style={{ marginBottom: 12 }}>{q}</li>)}</ul> : <Empty />}</div></Section>
    <Section id="sources" number="08" label="Evidence inventory"><Sources items={sources} /></Section>
  </div>
}

export default function InvestigationReportPage() {
  const { id } = useParams<{ id: string }>()
  const investigationId = Number(id)
  const { data: investigation, error, isLoading } = useSWR(Number.isFinite(investigationId) ? `/api/investigations/${investigationId}` : null, () => fetchInvestigation(investigationId))
  const report = investigation?.report
  return <AppShell><div className="mx-auto max-w-6xl pt-6 md:pt-10"><Link href={`/investigations/${id}`} className="inline-flex items-center gap-2" style={{ ...mono, color: 'var(--text-dim)', fontSize: 10, letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase' }}><ArrowLeft size={14} aria-hidden="true" /> Back to investigation</Link>
    <header className="py-10 md:py-16"><div className="flex flex-wrap items-center gap-3" style={eyebrow}><FileText size={14} aria-hidden="true" /> Investigation report <span style={{ color: 'var(--border-active)' }}>·</span> {report ? 'Report available' : 'Awaiting report'}</div><h1 className="max-w-5xl text-balance" style={{ margin: '18px 0 0', color: 'var(--text-primary)', fontSize: 'clamp(34px, 7vw, 78px)', lineHeight: 0.98, letterSpacing: '-0.055em', fontWeight: 600 }}>{report?.title ?? investigation?.title ?? 'Investigation report'}</h1><div className="mt-8 flex flex-wrap gap-x-6 gap-y-2" style={{ ...mono, color: 'var(--text-dim)', fontSize: 10, letterSpacing: '0.04em' }}>{report?.based_on_queries != null && <span>{report.based_on_queries} QUERIES</span>}{report && <span>{report.evidence_sources_count} SOURCES</span>}{report && <span>{report.evidence_entities_count} ENTITIES</span>}{report?.generated_at && <time dateTime={report.generated_at}>GENERATED {new Date(report.generated_at).toLocaleDateString('en-GB')}</time>}</div></header><Rule />
    {report && <nav className="sticky top-0 z-10 flex gap-5 overflow-x-auto py-4" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)' }} aria-label="Report sections">{[['question','Question'],['findings','Findings'],['connections','Connections'],['narrative','Narrative'],['implications','Implications'],['uncertainty','Uncertainty'],['sources','Sources']].map(([href, label]) => <a key={href} href={`#${href}`} style={{ ...mono, color: 'var(--text-dim)', fontSize: 10, textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</a>)}</nav>}
    <div className={report ? 'py-10 md:py-14' : 'py-10'}>{isLoading && <div className="flex items-center gap-2" style={body}><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Loading report…</div>}{error && !isLoading && <p role="alert" style={body}>The investigation could not be loaded.</p>}{investigation && !report && <p style={body}>This investigation does not have a generated report yet.</p>}{report && <ReportContent report={report} />}</div>
    {report && <footer className="pb-16 pt-8"><Rule /><div className="flex flex-wrap items-center justify-between gap-4 pt-5" style={{ ...mono, color: 'var(--text-dim)', fontSize: 10 }}><span><Search size={12} style={{ display: 'inline', marginRight: 6 }} aria-hidden="true" /> ATIS INTELLIGENCE DOSSIER</span><span>BACKEND COUNTS ARE AUTHORITATIVE</span></div></footer>}
  </div></AppShell>
}
