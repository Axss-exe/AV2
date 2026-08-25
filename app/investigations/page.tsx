'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigations } from '@/lib/api';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InvestigationsPage() {
  const { data: investigations, error, isLoading, mutate } = useSWR(
    '/api/investigations',
    fetchInvestigations,
  );

  return (
    <AppShell>
      <div className="pt-6 md:pt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p
              style={{
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Investigation workspace
            </p>
            <h1
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                marginTop: 6,
              }}
            >
              Investigations
            </h1>
          </div>
          <span
            style={{
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            {investigations?.length ?? 0} total
          </span>
        </div>

        {isLoading && (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 size={20} color="var(--text-dim)" className="animate-spin" aria-label="Loading investigations" />
          </div>
        )}

        {error && !isLoading && (
          <div
            className="flex flex-col items-center gap-3 py-16 text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Investigations could not be loaded.</p>
            <button
              type="button"
              onClick={() => mutate()}
              style={{
                background: 'var(--border-default)',
                border: 0,
                borderRadius: 8,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                padding: '8px 16px',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && investigations?.length === 0 && (
          <div
            className="py-16 text-center"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 14 }}
          >
            No investigations yet.
          </div>
        )}

        {!isLoading && !error && investigations && investigations.length > 0 && (
          <div className="flex flex-col gap-3">
            {investigations.map((investigation) => (
              <Link
                key={investigation.id}
                href={`/investigations/${investigation.id}`}
                className="group flex items-center justify-between gap-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  color: 'inherit',
                  padding: '18px 20px',
                  textDecoration: 'none',
                }}
              >
                <div className="min-w-0">
                  <h2
                    className="truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600 }}
                  >
                    {investigation.title || investigation.rootQuestion}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {investigation.queriesCount} {investigation.queriesCount === 1 ? 'query' : 'queries'}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      Updated {formatDate(investigation.updatedAt)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={18} color="var(--text-dim)" aria-hidden="true" className="shrink-0 transition-colors group-hover:text-text-primary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
