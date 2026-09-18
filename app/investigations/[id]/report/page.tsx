'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft, Loader2, FileText, Users, Link2, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigation } from '@/lib/api';
import type { Investigation, InvestigationReport } from '@/lib/investigation-types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function pick(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

export default function InvestigationReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const investigationId = params.id;
  const { data: investigation, error, isLoading } = useSWR(
    investigationId ? `/api/investigations/${investigationId}` : null,
    () => fetchInvestigation(investigationId)
  );

  const report = investigation?.report ?? null;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[1040px] pt-6 pb-24 md:pt-10">
        <button
          type="button"
          onClick={() => router.push(`/investigations/${params.id}`)}
          className="mb-8 inline-flex items-center gap-1.5 border-0 bg-transparent font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-dim)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={13} aria-hidden="true" /> Back to investigation
        </button>

        {isLoading && (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 size={20} color="var(--text-dim)" className="animate-spin" aria-label="Loading report" />
          </div>
        )}

        {error && !isLoading && (
          <p role="alert" className="font-sans text-[13px] text-[var(--accent-danger)]">
            Investigation report could not be loaded.
          </p>
        )}

        {investigation && !isLoading && !report && (
          <p className="font-sans text-[13px] text-[var(--text-muted)]">
            No report has been generated for this investigation.
          </p>
        )}

        {investigation && !isLoading && report && (
          <ReportStory investigation={investigation} report={report} />
        )}
      </main>
    </AppShell>
  );
}

function ReportStory({
  investigation,
  report,
}: {
  investigation: Investigation;
  report: InvestigationReport;
}) {
  const keyFindings = (report.key_findings ?? []).map((item) => ({
    finding: pick(item, ['finding', 'summary', 'text']),
    detail: pick(item, ['detail', 'explanation', 'context']),
  })).filter((item) => item.finding);

  const entities = (report.important_entities ?? []).map((item) => ({
    name: pick(item, ['name', 'entity']),
    type: pick(item, ['type', 'category']),
    description: pick(item, ['description', 'summary', 'context']),
  })).filter((item) => item.name);

  const relationships = (report.important_relationships ?? []).map((item) => ({
    insight: pick(item, ['insight']),
    from: pick(item, ['from_entity']),
    relation: pick(item, ['relationship_type']),
    to: pick(item, ['to_entity']),
  })).filter((item) => item.insight || item.from || item.to);

  const evidence = (report.evidence_and_sources ?? []).map((item) => ({
    id: pick(item, ['source_id']),
    title: pick(item, ['title', 'name']),
    summary: pick(item, ['summary', 'description', 'excerpt']),
  })).filter((item) => item.id || item.title);

  const stats = [
    { label: 'Queries analyzed', value: report.based_on_queries ?? investigation.queries.length, icon: FileText },
    { label: 'Key findings', value: keyFindings.length, icon: ShieldCheck },
    { label: 'Entities identified', value: entities.length, icon: Users },
    { label: 'Evidence sources', value: evidence.length, icon: Link2 },
  ];

  return (
    <article className="flex flex-col gap-14">
      {/* Hero */}
      <header className="border-b border-[var(--border-default)] pb-10">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent-brass)]">
          Knowledge report &middot; {report.generated_at}
        </p>
        <h1 className="mb-4 max-w-[760px] font-display text-[32px] leading-[1.15] text-[var(--text-primary)] text-balance md:text-[40px]">
          {report.title ?? investigation.title}
        </h1>
        <p className="max-w-[640px] font-sans text-[14px] leading-relaxed text-[var(--text-muted)]">
          {report.original_question}
        </p>
      </header>

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
          >
            <Icon size={16} className="text-[var(--accent-brass)]" aria-hidden="true" />
            <div className="font-display text-[26px] leading-none text-[var(--text-primary)]">{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-dim)]">{label}</div>
          </div>
        ))}
      </section>

      {/* Executive summary */}
      <section className="grid gap-10 md:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="report-heading">Executive Summary</h2>
          <p className="report-copy">{report.executive_summary}</p>
        </div>
        <div>
          <h2 className="report-heading">Implications</h2>
          <p className="report-copy">{report.implications}</p>
        </div>
      </section>

      {/* Key findings carousel */}
      {keyFindings.length > 0 && (
        <StorySection title="Key Findings" eyebrow={`${keyFindings.length} findings`}>
          <Carousel opts={{ align: 'start' }} className="px-1">
            <CarouselContent>
              {keyFindings.map((item, index) => (
                <CarouselItem key={`${item.finding}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                  <StoryCard index={index} title={item.finding} body={item.detail} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </StorySection>
      )}

      {/* Entities carousel */}
      {entities.length > 0 && (
        <StorySection title="Important Entities" eyebrow={`${entities.length} entities`}>
          <Carousel opts={{ align: 'start' }} className="px-1">
            <CarouselContent>
              {entities.map((item, index) => (
                <CarouselItem key={`${item.name}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                  <StoryCard index={index} title={item.name} tag={item.type} body={item.description} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </StorySection>
      )}

      {/* Relationships carousel */}
      {relationships.length > 0 && (
        <StorySection title="Important Relationships" eyebrow={`${relationships.length} relationships`}>
          <Carousel opts={{ align: 'start' }} className="px-1">
            <CarouselContent>
              {relationships.map((item, index) => (
                <CarouselItem key={`${item.insight}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                  <StoryCard
                    index={index}
                    title={item.insight || [item.from, item.relation, item.to].filter(Boolean).join(' \u2192 ')}
                    tag={item.relation}
                    body={item.from && item.to ? `${item.from} \u2192 ${item.to}` : ''}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </StorySection>
      )}

      {/* Evidence carousel */}
      {evidence.length > 0 && (
        <StorySection title="Evidence & Sources" eyebrow={`${evidence.length} sources`}>
          <Carousel opts={{ align: 'start' }} className="px-1">
            <CarouselContent>
              {evidence.map((item, index) => (
                <CarouselItem key={`${item.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                  <StoryCard index={index} title={item.title || item.id} tag={item.title ? item.id : ''} body={item.summary} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </StorySection>
      )}

      {/* Open questions */}
      <section className="grid gap-10 border-t border-[var(--border-default)] pt-10 md:grid-cols-2">
        <div>
          <h2 className="report-heading">Research Required</h2>
          <ReportList items={report.research_required} />
        </div>
        <div>
          <h2 className="report-heading">Unresolved Questions</h2>
          <ReportList items={report.unresolved_questions} />
        </div>
      </section>

      {/* Narrative close */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-8">
        <h2 className="report-heading">Investigation Narrative</h2>
        <p className="report-copy mb-6">{report.investigation_narrative}</p>
        <h2 className="report-heading">Confidence &amp; Limitations</h2>
        <p className="report-copy">{report.confidence_and_limitations}</p>
      </section>

      <style jsx>{`
        .report-heading { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }
        .report-copy { font-family: var(--font-sans); font-size: 13px; line-height: 1.7; color: var(--text-tertiary); margin: 0; }
      `}</style>
    </article>
  );
}

function StorySection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-sans text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-dim)]">{eyebrow}</span>
      </div>
      {children}
    </section>
  );
}

function StoryCard({
  index,
  title,
  tag,
  body,
}: {
  index: number;
  title: string;
  tag?: string;
  body?: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-[var(--accent-brass)]">{String(index + 1).padStart(2, '0')}</span>
        {tag && (
          <span className="rounded-full border border-[var(--border-default)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--text-dim)]">
            {tag}
          </span>
        )}
      </div>
      <p className="font-sans text-[13px] font-medium leading-snug text-[var(--text-primary)] text-pretty">{title}</p>
      {body && <p className="font-sans text-[12px] leading-relaxed text-[var(--text-muted)]">{body}</p>}
    </div>
  );
}

function ReportList({ items }: { items: string[] }) {
  if (!items?.length) return <p className="report-copy">No items returned.</p>;
  return (
    <ul className="m-0 flex flex-col gap-2 pl-5 font-sans text-[13px] leading-relaxed text-[var(--text-tertiary)]">
      {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  );
}
