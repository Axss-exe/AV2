'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowRight, GitBranch, Loader2, Plus } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigations } from '@/lib/api';
import type { InvestigationSummary } from '@/lib/investigation-types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function InvestigationsPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR<InvestigationSummary[]>('/api/investigations', fetchInvestigations);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-default)] pb-6">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
              <GitBranch size={13} aria-hidden="true" /> Investigation workspace
            </div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">Investigations</h1>
            <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-[var(--text-tertiary)]">
              Follow questions across multiple queries, accumulate evidence, and synthesize a knowledge report.
            </p>
          </div>
          <button
            onClick={() => router.push('/query')}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--text-primary)] px-4 font-sans text-xs font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-80"
          >
            <Plus size={14} aria-hidden="true" /> Start from query
          </button>
        </header>

        {isLoading && (
          <div className="flex min-h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--text-dim)]" aria-label="Loading investigations" /></div>
        )}
        {error && !isLoading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="font-sans text-sm text-[var(--text-secondary)]">Investigations could not be loaded.</p>
            <button onClick={() => mutate()} className="rounded-lg bg-[var(--border-default)] px-4 py-2 font-sans text-xs font-medium text-[var(--text-primary)]">Retry</button>
          </div>
        )}
        {!isLoading && !error && data?.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center border-b border-[var(--border-default)] text-center">
            <GitBranch size={24} className="mb-4 text-[var(--text-dim)]" aria-hidden="true" />
            <h2 className="font-sans text-base font-semibold text-[var(--text-secondary)]">No investigations yet</h2>
            <p className="mt-2 max-w-sm font-sans text-sm leading-6 text-[var(--text-tertiary)]">Run a query first, then choose Start Investigation to preserve the question and its evidence.</p>
            <Link href="/query" className="mt-5 inline-flex items-center gap-2 font-sans text-xs font-medium text-[var(--text-primary)] underline underline-offset-4">Open Query <ArrowRight size={13} aria-hidden="true" /></Link>
          </div>
        )}
        <div className="divide-y divide-[var(--border-default)]">
          {data?.map((item) => (
            <Link key={item.id} href={`/investigations/${item.id}`} className="group flex items-center justify-between gap-4 py-5 transition-opacity hover:opacity-75">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                  <span>{item.status}</span><span aria-hidden="true">·</span><span>{item.queryCount} {item.queryCount === 1 ? 'query' : 'queries'}</span>{item.hasReport && <><span aria-hidden="true">·</span><span>report ready</span></>}
                </div>
                <h2 className="truncate font-sans text-base font-semibold text-[var(--text-primary)]">{item.title}</h2>
                <p className="mt-1 truncate font-sans text-sm text-[var(--text-tertiary)]">{item.rootQuestion}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-right">
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-dim)] sm:block">{formatDate(item.updatedAt)}</span>
                <ArrowRight size={16} className="text-[var(--text-dim)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
