'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { EntityGraph } from '@/components/entity-graph';
import { IntelTable } from '@/components/intel-table';
import { PerspectiveBanner } from '@/components/query/perspective-banner';
import { SearchBar } from '@/components/query/search-bar';
import { AnswerPanel } from '@/components/query/answer-panel';
import { ResearchRequiredPanel } from '@/components/query/research-required-panel';
import { FindingsPanel } from '@/components/query/findings-panel';
import { RelatedNewsPanel } from '@/components/query/related-news-panel';
import { RisksPanel } from '@/components/query/risks-panel';
import { IntelDrawer, type DrawerView } from '@/components/query/intel-drawer';
import { useATIS } from '@/lib/context';
import { queryAPI, APIError, createInvestigation } from '@/lib/api';
import { hasQueryIntelligence, mapAPIResponseToQueryResult } from '@/lib/query-mapping';
import { buildIntelligenceViewModel } from '@/lib/intelligence-view-model';

const SUGGESTIONS = [
  'What are the opportunities in Zimbabwe?',
  'Show me risks in Southern Africa',
  'Zimbabwe agriculture market analysis',
  'Cross-border logistics opportunities',
  'Zimbabwe mining sector intelligence',
];

export default function QueryPage() {
  const router = useRouter();
  const {
    currentQueryResult,
    setCurrentQueryResult,
    addQueryToHistory,
    perspectiveCountry,
    perspectiveCountryCode,
  } = useATIS();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(!!currentQueryResult);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drawerStack, setDrawerStack] = useState<DrawerView[]>([]);
  const [startingInvestigation, setStartingInvestigation] = useState(false);
  const [investigationError, setInvestigationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushDrawer = (view: DrawerView) => setDrawerStack((prev) => [...prev, view]);
  const popDrawer = () => setDrawerStack((prev) => prev.slice(0, -1));
  const closeDrawer = () => setDrawerStack([]);

  useEffect(() => {
    if (currentQueryResult) setHasResult(true);
  }, [currentQueryResult]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || loading) return;
    setInputValue(query);
    setLoading(true);
    setApiError(null);
    setDrawerStack([]);

    try {
      const res = await queryAPI({
        question: query || undefined,
        perspective_country: perspectiveCountry,
        perspective_country_code: perspectiveCountryCode,
      });
      const result = mapAPIResponseToQueryResult(query, res);
      if (res.backendError && !hasQueryIntelligence(res)) {
        throw new APIError(res.backendError);
      }
      setCurrentQueryResult(result);
      addQueryToHistory(result);
      setHasResult(true);
      if (res.backendError) {
        setApiError(`Some analysis components could not be finalized: ${res.backendError}`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof APIError
          ? err.message
          : 'Failed to reach the intelligence pipeline. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInvestigation = async () => {
    if (!currentQueryResult || startingInvestigation) return;
    setStartingInvestigation(true);
    setInvestigationError(null);
    try {
      const { id } = await createInvestigation({
        question: currentQueryResult.query,
        result: currentQueryResult,
        perspectiveCountry,
        perspectiveCountryCode,
      });
      router.push(`/investigations/${id}`);
    } catch (err: unknown) {
      setInvestigationError(
        err instanceof APIError ? err.message : 'Failed to start the investigation. Please try again.'
      );
    } finally {
      setStartingInvestigation(false);
    }
  };

  const handleReset = () => {
    setHasResult(false);
    setCurrentQueryResult(null);
    setInputValue('');
    setApiError(null);
    setDrawerStack([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] as number[] },
    }),
  };

  return (
    <AppShell>
      <AnalystLoading isVisible={loading} durationMs={120_000} />

      <div className="pt-6 md:pt-10">
        <AnimatePresence mode="wait">
          {!hasResult ? (
            /* ── INITIAL SEARCH STATE ── */
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center justify-center"
              style={{ minHeight: 'calc(100vh - 180px)' }}
            >
              <div style={{ width: '100%', maxWidth: 640 }}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="mb-8 text-center"
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      marginBottom: 10,
                    }}
                  >
                    Intelligence Query
                  </div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 26,
                      color: 'var(--text-primary)',
                      marginBottom: 10,
                      lineHeight: 1.25,
                    }}
                  >
                    Africa Trade Intelligence System
                  </h1>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 14,
                      color: 'var(--text-muted)',
                    }}
                  >
                    Ask anything about African trade, markets, and opportunities
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative mb-4"
                >
                  <SearchBar
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    disabled={loading}
                  />
                </motion.div>

                {/* Error banner */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 mb-4"
                      style={{
                        background: 'rgba(255,69,58,0.08)',
                        border: '1px solid rgba(255,69,58,0.25)',
                        borderRadius: 10,
                        padding: '12px 16px',
                      }}
                      role="alert"
                    >
                      <AlertCircle size={15} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: '#ff453a', lineHeight: 1.5 }}>
                        {apiError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="flex flex-wrap gap-2 justify-center"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSubmit(s)}
                      disabled={loading}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 400,
                        fontSize: 12,
                        color: 'var(--text-tertiary)',
                        background: 'var(--border-default)',
                        border: '1px solid transparent',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background 0.2s, color 0.2s',
                        minHeight: 44,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-hover)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ── RESULTS STATE ── */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <SearchBar
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    compact
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    background: 'var(--border-default)',
                    border: '1px solid var(--border-hover)',
                    borderRadius: 8,
                    padding: '10px 16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    minHeight: 44,
                    opacity: loading ? 0.5 : 1,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-hover)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                  }}
                >
                  New Query
                </button>
              </div>

              {/* Error banner on re-query */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 mb-4"
                    style={{
                      background: 'rgba(255,69,58,0.08)',
                      border: '1px solid rgba(255,69,58,0.25)',
                      borderRadius: 10,
                      padding: '12px 16px',
                    }}
                    role="alert"
                  >
                    <AlertCircle size={15} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: '#ff453a', lineHeight: 1.5 }}>
                      {apiError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentQueryResult && (() => {
                const vm = buildIntelligenceViewModel(currentQueryResult);
                return (
                  <div className="flex flex-col gap-4">
                    <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                      <PerspectiveBanner
                        perspectiveCountry={vm.perspectiveCountry}
                        perspectiveCountryCode={vm.perspectiveCountryCode}
                        sourceCountries={vm.sourceCountries}
                        cached={vm.cached}
                        elapsedSeconds={vm.elapsedSeconds}
                      />
                      <AnswerPanel result={currentQueryResult} vm={vm} />
                    </motion.div>

                    {vm.research.isResearchRequired ? (
                      <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                        <ResearchRequiredPanel vm={vm} />
                      </motion.div>
                    ) : (
                      <>
                        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                          <FindingsPanel
                            findings={vm.findings}
                            onSelect={(f) => pushDrawer({ type: 'finding', item: f })}
                          />
                        </motion.div>

                        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                          <RelatedNewsPanel
                            countries={Array.from(
                              new Set(
                                [vm.perspectiveCountry, ...vm.sourceCountries].filter(
                                  (c): c is string => !!c && c.trim().length > 0
                                )
                              )
                            )}
                            onSelect={(article) => router.push(`/news/${article.id}`)}
                          />
                        </motion.div>

                        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
                          <RisksPanel
                            risks={vm.risks}
                            onSelect={(r) => pushDrawer({ type: 'risk', item: r })}
                          />
                        </motion.div>
                      </>
                    )}

                    <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: 12,
                        }}
                      >
                        Explore the Network
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
                        <EntityGraph
                          nodes={(currentQueryResult.graphNodes ?? []).filter(Boolean)}
                          edges={(currentQueryResult.graphEdges ?? [])
                            .filter((e): e is NonNullable<typeof e> => !!e)
                            .map((e) => ({
                              from: e.from,
                              to: e.to,
                              label: e.label ?? '',
                            }))}
                          title="Entity Network"
                          onNodeClick={(name) => pushDrawer({ type: 'entity', name })}
                        />
                        <IntelTable
                          rows={currentQueryResult.tableRows ?? []}
                          onRowClick={(name) => pushDrawer({ type: 'entity', name })}
                        />
                      </div>
                    </motion.div>

                    {!vm.research.isResearchRequired && (
                      <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}>
                        <div
                          className="flex items-center justify-between gap-4 flex-wrap"
                          style={{
                            border: '1px solid var(--border-default)',
                            borderRadius: 10,
                            padding: '16px 20px',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 500,
                                fontSize: 10,
                                color: 'var(--text-dim)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                marginBottom: 4,
                              }}
                            >
                              This question may lead somewhere
                            </div>
                            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: 'var(--text-tertiary)' }}>
                              Track this line of inquiry across follow-up queries and synthesize a knowledge report.
                            </p>
                          </div>
                          <button
                            onClick={handleStartInvestigation}
                            disabled={startingInvestigation}
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 500,
                              fontSize: 12,
                              color: 'var(--bg-primary)',
                              background: 'var(--text-primary)',
                              border: 'none',
                              borderRadius: 8,
                              padding: '10px 18px',
                              cursor: startingInvestigation ? 'not-allowed' : 'pointer',
                              opacity: startingInvestigation ? 0.6 : 1,
                              whiteSpace: 'nowrap',
                              minHeight: 40,
                            }}
                          >
                            {startingInvestigation ? 'Starting…' : 'Start Investigation'}
                          </button>
                        </div>
                        {investigationError && (
                          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: '#ff453a', marginTop: 8 }} role="alert">
                            {investigationError}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        <IntelDrawer stack={drawerStack} onClose={closeDrawer} onPush={pushDrawer} onPop={popDrawer} />
      </div>
    </AppShell>
  );
}
