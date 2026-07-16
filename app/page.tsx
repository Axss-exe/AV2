'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { ErrorState } from '@/components/error-state';
import { queryAPI } from '@/lib/api';
import { getQueryHistory } from '@/lib/data';
import type { QueryHistory } from '@/lib/types';

// ---- Zimbabwean intelligence data (realistic mock) ----
const ZIMBABWE_STATS = [
  { label: 'Head of State', value: 'E. Mnangagwa' },
  { label: 'Population', value: '16.3M' },
  { label: 'GDP (USD)', value: '$26.7B' },
  { label: 'Currency', value: 'ZiG / USD' },
];

const ZIMBABWE_PROFILE = {
  capital: 'Harare',
  official_languages: ['English', 'Shona', 'Ndebele'],
  gdp_growth: '+3.4%',
  primary_sectors: ['Mining', 'Agriculture', 'Tourism'],
  key_exports: 'Gold, Tobacco, Diamonds, Chrome',
  major_risk: 'Hyperinflation legacy & currency instability',
  AfCFTA_status: 'Signatory — tariff phase-in ongoing',
};

function getGreeting(h: number): string {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d: Date): string {
  return d
    .toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase();
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function HomePage() {
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-only time values to avoid hydration mismatch
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Attempt a lightweight backend sweep; fall back gracefully
  const [backendSummary, setBackendSummary] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDateStr(formatDate(now));
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await getQueryHistory();
      setQueryHistory(history);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }

    // Non-blocking backend ping for a Zimbabwe briefing summary
    try {
      const res = await queryAPI({ question: 'Zimbabwe intelligence overview' });
      const summary = res.executive_summary ?? res.summary ?? null;
      if (summary) setBackendSummary(summary);
    } catch {
      // Silently ignore — dashboard should not crash on backend unavailability
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <div style={{ paddingTop: 40 }}>
        {/* Hero greeting */}
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
            {greeting || 'Welcome back'}, Analyst
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
            Here&apos;s your Zimbabwe intelligence briefing for today
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
            {dateStr}
          </p>
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            {/* Zimbabwe key metrics */}
            <div
              className="grid gap-4 mb-8"
              style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              aria-label="Zimbabwe intelligence metrics"
            >
              {ZIMBABWE_STATS.map((stat, i) => (
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
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#ffffff',
                      marginBottom: 6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stat.value}
                  </div>
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
              {/* Zimbabwe Country Profile */}
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
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c1c1e' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#ffffff',
                    }}
                  >
                    Zimbabwe — Country Profile
                  </h2>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {backendSummary && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 12,
                        color: '#a1a1a6',
                        lineHeight: 1.6,
                        marginBottom: 16,
                        borderLeft: '2px solid #333333',
                        paddingLeft: 12,
                      }}
                    >
                      {backendSummary.slice(0, 260)}
                      {backendSummary.length > 260 ? '...' : ''}
                    </p>
                  )}
                  {(
                    [
                      ['Capital', ZIMBABWE_PROFILE.capital],
                      ['Languages', ZIMBABWE_PROFILE.official_languages.join(', ')],
                      ['GDP Growth', ZIMBABWE_PROFILE.gdp_growth],
                      ['Key Sectors', ZIMBABWE_PROFILE.primary_sectors.join(', ')],
                      ['Key Exports', ZIMBABWE_PROFILE.key_exports],
                      ['AfCFTA', ZIMBABWE_PROFILE.AfCFTA_status],
                      ['Primary Risk', ZIMBABWE_PROFILE.major_risk],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-start gap-3"
                      style={{ marginBottom: 10 }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 10,
                          color: '#525252',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          flexShrink: 0,
                          width: 80,
                          paddingTop: 1,
                        }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 400,
                          fontSize: 12,
                          color: '#d1d1d6',
                          lineHeight: 1.4,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Intelligence */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c1c1e' }}>
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
                    queryHistory.slice(0, 6).map((item, i) => (
                      <motion.div
                        key={item.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        style={{
                          padding: '12px 20px',
                          borderBottom:
                            i < Math.min(queryHistory.length, 6) - 1
                              ? '1px solid #1c1c1e'
                              : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
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
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
