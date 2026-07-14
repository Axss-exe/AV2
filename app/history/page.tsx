'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { getQueryHistory } from '@/lib/data';
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
  const [seedHistory, setSeedHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQueryHistory();
      setSeedHistory(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Merge context history (new queries) with seed history
  const allHistory: (QueryHistory & { fromContext?: boolean })[] = [
    ...contextHistory.map((r) => ({
      id: r.query,
      query: r.query,
      summary: r.summary,
      stats: r.stats,
      created_at: new Date().toISOString(),
      fromContext: true as const,
    })),
    ...seedHistory,
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
      setSeedHistory((prev) => prev.filter((h) => h.id !== item.id));
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
      <div style={{ paddingTop: 40 }}>
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
              color: '#ffffff',
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
              color: '#737373',
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
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
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
              background: '#0a0a0a',
              border: '1px solid #1c1c1e',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: '3fr 2fr 160px 100px',
                padding: '10px 20px',
                borderBottom: '1px solid #1c1c1e',
              }}
            >
              {['Query', 'Summary', 'Date', 'Actions'].map((h) => (
                <div
                  key={h}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: '#737373',
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
                  className="grid"
                  style={{
                    gridTemplateColumns: '3fr 2fr 160px 100px',
                    padding: '14px 20px',
                    borderBottom: i < allHistory.length - 1 ? '1px solid #1c1c1e' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: deletingId === item.id ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#111111';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                  onClick={() => handleView(item)}
                >
                  {/* Query */}
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 13,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingRight: 16,
                    }}
                  >
                    {item.query}
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 12,
                      color: '#525252',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingRight: 16,
                    }}
                  >
                    {item.summary.slice(0, 90)}...
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#525252',
                    }}
                  >
                    {formatDate(item.created_at)}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleView(item)}
                      aria-label={`View query: ${item.query}`}
                      title="View result"
                      style={{
                        background: 'transparent',
                        border: '1px solid #262626',
                        borderRadius: 6,
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#a1a1a6',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
                      }}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete query: ${item.query}`}
                      title="Delete"
                      style={{
                        background: 'transparent',
                        border: '1px solid #262626',
                        borderRadius: 6,
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#a1a1a6',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.1)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ff453a';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                      }}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
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
