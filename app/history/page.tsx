'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { fetchHistory, APIError } from '@/lib/api';
import { useATIS } from '@/lib/context';
import { useRouter } from 'next/navigation';
import type { QueryHistory } from '@/lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const { queryHistory: contextHistory, removeQueryFromHistory, setCurrentQueryResult } = useATIS();
  const [backendHistory, setBackendHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchHistory();
      // Backend may return { status, data: [...] } or a raw array — unwrap either
      const data: typeof raw = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as unknown as { data: typeof raw }).data)
          ? (raw as unknown as { data: typeof raw }).data
          : [];
      // Normalize backend history items to QueryHistory shape
      const normalized: QueryHistory[] = data.map((item) => ({
        id: item.id,
        query: item.query,
        summary: item.summary ?? (item.output && typeof item.output === 'object'
          ? (item.output as Record<string, unknown>)?.executive_summary as string ?? 'No summary available.'
          : 'No summary available.'),
        stats: {
          traces: typeof item.stats?.traces === 'number' ? item.stats.traces : 0,
          nodes: typeof item.stats?.nodes === 'number' ? item.stats.nodes : 0,
          concepts: typeof item.stats?.concepts === 'number' ? item.stats.concepts : 0,
          entities: typeof item.stats?.entities === 'number' ? item.stats.entities : 0,
          validated: typeof item.stats?.validated === 'string' ? item.stats.validated : '—',
        },
        created_at: item.created_at,
      }));
      setBackendHistory(normalized);
    } catch (e: unknown) {
      // If the backend history endpoint doesn't exist yet, silently degrade
      if (e instanceof APIError && (e.status === 404 || e.status === 405)) {
        setBackendHistory([]);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load query history.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Merge context history (new queries from this session) with backend history
  const allHistory: (QueryHistory & { fromContext?: boolean })[] = [
    ...contextHistory.map((r) => ({
      id: r.query,
      query: r.query,
      summary: r.summary,
      stats: r.stats,
      created_at: new Date().toISOString(),
      fromContext: true as const,
    })),
    ...backendHistory,
  ];

  const handleView = (item: typeof allHistory[0]) => {
    if (item.fromContext) {
      const found = contextHistory.find((r) => r.query === item.query);
      if (found) {
        setCurrentQueryResult(found);
        router.push('/query');
      }
    } else {
      router.push('/query');
    }
  };

  const handleDelete = (item: typeof allHistory[0]) => {
    setDeletingId(item.id);
    if (item.fromContext) {
      removeQueryFromHistory(item.query);
    } else {
      setBackendHistory((prev) => prev.filter((h) => h.id !== item.id));
    }
    setTimeout(() => setDeletingId(null), 400);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] as number[] },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
  };

  return (
    <AppShell>
      <div className="pt-6 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            Query History
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            All past intelligence queries and results
          </p>
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  animation: 'pulse-soft 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : allHistory.length === 0 ? (
          <EmptyState
            title="No queries yet"
            description="Start by asking a question in the Query dashboard."
            actionLabel="Go to Query"
            actionHref="/query"
          />
        ) : (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {/* Desktop table header — hidden on mobile */}
            <div
              className="hidden sm:grid"
              style={{
                gridTemplateColumns: '3fr 2fr 160px 100px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              {['Query', 'Summary', 'Date', 'Actions'].map((h) => (
                <div
                  key={h}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <AnimatePresence>
              {allHistory.map((item, i) => (
                <motion.div
                  key={item.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  style={{
                    borderBottom: i < allHistory.length - 1 ? '1px solid var(--border-default)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: deletingId === item.id ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  onClick={() => handleView(item)}
                >
                  {/* Mobile card layout */}
                  <div className="sm:hidden flex items-start justify-between gap-3" style={{ padding: '14px 16px' }}>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.query}
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.summary.slice(0, 80)}...
                      </p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)' }}>
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleView(item)} aria-label={`View: ${item.query}`} style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <ExternalLink size={13} aria-hidden="true" />
                      </button>
                      <button onClick={() => handleDelete(item)} aria-label={`Delete: ${item.query}`} style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop row layout */}
                  <div
                    className="hidden sm:grid"
                    style={{ gridTemplateColumns: '3fr 2fr 160px 100px', padding: '14px 20px', alignItems: 'center' }}
                  >
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>
                      {item.query}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>
                      {item.summary.slice(0, 90)}...
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      {formatDate(item.created_at)}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleView(item)}
                        aria-label={`View query: ${item.query}`}
                        title="View result"
                        style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'background 0.2s, color 0.2s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        aria-label={`Delete query: ${item.query}`}
                        title="Delete"
                        style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'background 0.2s, color 0.2s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ff453a'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.3)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; }}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
