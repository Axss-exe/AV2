'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { OpportunityCard } from '@/components/opportunity-card';
import { ErrorState } from '@/components/error-state';
import { getOpportunities, getQueryHistory } from '@/lib/data';
import type { Opportunity, QueryHistory } from '@/lib/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statsConfig = [
  { key: 'opportunities', label: 'Active Opportunities' },
  { key: 'countries', label: 'Countries Monitored' },
  { key: 'entities', label: 'Entities Tracked' },
  { key: 'validation', label: 'Avg. Validation Score' },
];

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [opps, history] = await Promise.all([getOpportunities(), getQueryHistory()]);
      setOpportunities(opps);
      setQueryHistory(history);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeOpportunities = opportunities.filter((o) => o.status === 'active');
  const validationAvg = opportunities.length
    ? Math.round(
        opportunities.reduce((acc, o) => acc + parseInt(o.validation_score), 0) / opportunities.length
      )
    : 0;

  const stats = [
    { label: 'Active Opportunities', value: activeOpportunities.length.toString() },
    { label: 'Countries Monitored', value: '7' },
    { label: 'Entities Tracked', value: '6' },
    { label: 'Avg. Validation Score', value: `${validationAvg}%` },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <AppShell>
      <div style={{ paddingTop: 40 }}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 28,
              color: '#ffffff',
              marginBottom: 6,
            }}
          >
            {getGreeting()}, Analyst
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 14,
              color: '#737373',
              marginBottom: 4,
            }}
          >
            Here&apos;s your intelligence briefing for today
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: 11,
              color: '#525252',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {formatDate()}
          </p>
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            {/* Stats Row */}
            <div
              className="grid gap-4 mb-8"
              style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              aria-label="Quick statistics"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #1c1c1e',
                    borderRadius: 14,
                    padding: 20,
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        width: 60,
                        height: 22,
                        background: '#1c1c1e',
                        borderRadius: 4,
                        marginBottom: 8,
                        animation: 'pulse-soft 1.5s infinite',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 22,
                        color: '#ffffff',
                        marginBottom: 6,
                      }}
                    >
                      {stat.value}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 10,
                      color: '#737373',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
              {/* Recent Intelligence */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #1c1c1e',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#ffffff',
                    }}
                  >
                    Recent Intelligence
                  </h2>
                </div>
                <div>
                  {loading ? (
                    <div className="p-5 flex flex-col gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            height: 48,
                            background: '#111111',
                            borderRadius: 8,
                            animation: 'pulse-soft 1.5s infinite',
                          }}
                        />
                      ))}
                    </div>
                  ) : queryHistory.length === 0 ? (
                    <p
                      style={{
                        padding: 20,
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 13,
                        color: '#525252',
                      }}
                    >
                      No queries yet. Start by asking a question in the Query dashboard.
                    </p>
                  ) : (
                    queryHistory.slice(0, 5).map((item, i) => (
                      <motion.div
                        key={item.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        style={{
                          padding: '12px 20px',
                          borderBottom: i < Math.min(queryHistory.length, 5) - 1 ? '1px solid #1c1c1e' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = '#111111';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            fontSize: 12,
                            color: '#d1d1d6',
                            marginBottom: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.query}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <p
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 300,
                              fontSize: 11,
                              color: '#525252',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {item.summary.slice(0, 80)}...
                          </p>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              color: '#333333',
                              flexShrink: 0,
                            }}
                          >
                            {formatTime(item.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Featured Opportunities */}
              <div>
                <div
                  style={{
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#ffffff',
                    }}
                  >
                    Featured Opportunities
                  </h2>
                  <a
                    href="/query"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 11,
                      color: '#a1a1a6',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = '#a1a1a6'; }}
                  >
                    View all
                  </a>
                </div>
                {loading ? (
                  <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: 100,
                          background: '#0a0a0a',
                          border: '1px solid #1c1c1e',
                          borderRadius: 14,
                          animation: 'pulse-soft 1.5s infinite',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {opportunities.slice(0, 3).map((opp, i) => (
                      <OpportunityCard key={opp.id} opportunity={opp} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
