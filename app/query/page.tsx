'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { EntityGraph } from '@/components/entity-graph';
import { IntelTable } from '@/components/intel-table';
import { PerspectiveBanner } from '@/components/query/perspective-banner';
import { AnswerPanel } from '@/components/query/answer-panel';
import { ResearchRequiredPanel } from '@/components/query/research-required-panel';
import { FindingsPanel } from '@/components/query/findings-panel';
import { RelatedNewsPanel } from '@/components/query/related-news-panel';
import { RisksPanel } from '@/components/query/risks-panel';
import { IntelDrawer, type DrawerView } from '@/components/query/intel-drawer';
import { useATIS } from '@/lib/context';
import { queryAPI, APIError } from '@/lib/api';
import { buildIntelligenceViewModel } from '@/lib/intelligence-view-model';
import type { QueryResult, IntelTableRow, GraphNode, GraphEdge, KeyEntity } from '@/lib/types';

const SUGGESTIONS = [
  'What are the opportunities in Zimbabwe?',
  'Show me risks in Southern Africa',
  'Zimbabwe agriculture market analysis',
  'Cross-border logistics opportunities',
  'Zimbabwe mining sector intelligence',
];

// Map backend API response to the existing QueryResult type.
// The backend returns { status, elapsed_seconds, data: { ... } } — the
// queryAPI() function in lib/api.ts already unwraps this so `res` is the
// flat `data` object here.
function mapAPIResponseToQueryResult(query: string, res: Awaited<ReturnType<typeof queryAPI>>): QueryResult {
  // Derive stats from res.stats (real) or res.statistics (legacy fallback)
  const s = res.stats ?? {};
  const leg = res.statistics ?? {};
  const stats = {
    traces:    typeof s.traces === 'number'    ? s.traces    : typeof leg.traces === 'number'    ? leg.traces    : 0,
    nodes:     typeof s.total_entities === 'number' ? s.total_entities : typeof leg.nodes === 'number' ? leg.nodes : 0,
    concepts:  typeof s.commodities_tracked === 'number' ? s.commodities_tracked : typeof leg.concepts === 'number' ? leg.concepts : 0,
    entities:  typeof s.total_entities === 'number' ? s.total_entities : typeof leg.entities === 'number' ? leg.entities : 0,
    validated: typeof s.validated === 'string'   ? s.validated
             : typeof s.validated === 'number'   ? `${s.validated}%`
             : typeof leg.validated === 'string' ? leg.validated
             : typeof leg.validated === 'number' ? `${leg.validated}%`
             : '—',
  };

  // Map structured intelligence rows (real fields: entity, type, relationship, status, priority, insight, source_node)
  const intelRows = Array.isArray(res.structured_intelligence) ? res.structured_intelligence : [];
  const tableRows: IntelTableRow[] = intelRows.map((row) => {
    // Normalise status: backend sends e.g. "Operational", map to badge values
    const rawStatus = row.status ?? '';
    const status: IntelTableRow['status'] =
      rawStatus === 'Validated' ? 'Validated'
      : rawStatus === 'Gap' ? 'Gap'
      : 'External';
    return {
      source:       row.entity ?? row.source ?? 'Unknown',
      relationship: row.relationship ?? row.type ?? '',
      confidence:   row.priority ?? row.confidence ?? '—',
      status,
      last_updated: row.insight ?? row.last_updated ?? row.source_node ?? '',
    };
  });

  // Map entity graph nodes — use x/y from backend if provided, otherwise distribute
  const graphNodeData = Array.isArray(res.entity_graph?.nodes) ? res.entity_graph!.nodes : [];
  const FALLBACK_X = [280, 50, 520, 50, 520, 280, 160, 420];
  const FALLBACK_Y = [114, 50, 50, 180, 180, 10,  230, 230];
  const graphNodes: GraphNode[] = graphNodeData.map((n, i) => ({
    id:    n.id    ?? `n${i}`,
    label: n.label ?? n.id ?? `Node ${i}`,
    type:  (['hub', 'entity', 'risk', 'partner'].includes(n.type ?? '') ? n.type : 'entity') as GraphNode['type'],
    x:     typeof n.x === 'number' ? n.x : FALLBACK_X[i % FALLBACK_X.length],
    y:     typeof n.y === 'number' ? n.y : FALLBACK_Y[i % FALLBACK_Y.length],
  }));

  // Map entity graph edges
  const graphEdgeData = Array.isArray(res.entity_graph?.edges) ? res.entity_graph!.edges : [];
  const graphEdges: GraphEdge[] = graphEdgeData.map((e) => ({
    from:  e.from ?? e.source ?? '',
    to:    e.to   ?? e.target ?? '',
    label: e.label ?? '',
  }));

  // Map key_entities (new field in real response)
  const keyEntities: KeyEntity[] = Array.isArray(res.key_entities)
    ? res.key_entities.map((ke) => ({
        entity_name:       ke.entity_name ?? 'Unknown',
        entity_type:       ke.entity_type,
        country:           ke.country,
        sector:            ke.sector,
        significance_score: ke.significance_score,
        related_count:     ke.related_count,
        summary:           ke.summary,
        source_node:       ke.source_node,
      }))
    : [];

  // Real cited fields — see lib/intelligence-view-model.ts for how these are
  // consumed. Additive; camelCase mirrors the rest of QueryResult.
  const findingsCited = Array.isArray(res.findings_cited)
    ? res.findings_cited
        .filter((f) => typeof f.text === 'string')
        .map((f) => ({ text: f.text as string, sourceNodes: Array.isArray(f.source_nodes) ? f.source_nodes : [] }))
    : undefined;

  const risksCited = Array.isArray(res.risks_cited)
    ? res.risks_cited
        .filter((r) => typeof r.text === 'string')
        .map((r) => ({ text: r.text as string, sourceNodes: Array.isArray(r.source_nodes) ? r.source_nodes : [] }))
    : undefined;

  const opportunitiesCited = Array.isArray(res.opportunities_cited)
    ? res.opportunities_cited.map((o) => ({
        opportunityId: o.opportunity_id,
        title: o.title,
        type: o.type,
        perspectiveCountry: o.perspective_country,
        perspectiveCountryCode: o.perspective_country_code,
        sourceCountry: o.source_country,
        eventCountry: o.event_country,
        opportunityCountry: o.opportunity_country,
        crossBorder: o.cross_border,
        crossBorderCountries: o.cross_border_countries,
        perspectiveActor: o.perspective_actor,
        perspectiveCapability: o.perspective_capability,
        pathway: o.pathway,
        urgencyScore: o.urgency_score,
        feasibilityScore: o.feasibility_score,
        requiredMissingNodes: o.required_missing_nodes,
        capitalFlow: o.capital_flow
          ? { beneficiary: o.capital_flow.beneficiary, likelyFunder: o.capital_flow.likely_funder }
          : undefined,
        justification: o.justification,
        sourceNodes: Array.isArray(o.source_nodes) ? o.source_nodes : [],
        status: o.status,
      }))
    : undefined;

  const intent = res.intent
    ? {
        type: res.intent.type,
        entities: res.intent.entities ?? [],
        entityTypes: res.intent.entity_types ?? [],
        countries: res.intent.countries ?? [],
        sectors: res.intent.sectors ?? [],
        perspectiveCountry: res.intent.perspective_country,
        perspectiveCountryCode: res.intent.perspective_country_code,
      }
    : undefined;

  const filterStats = res.filter_stats
    ? {
        vaultTotal: res.filter_stats.vault_total,
        candidatesAfterBroadFilter: res.filter_stats.candidates_after_broad_filter,
        rankedByLlm: res.filter_stats.ranked_by_llm,
      }
    : undefined;

  return {
    query,
    summary:      res.executive_summary ?? res.summary ?? 'Intelligence analysis complete.',
    stats,
    graphNodes,
    graphEdges,
    tableRows,
    findings:     Array.isArray(res.findings)     ? res.findings     : [],
    opportunities: Array.isArray(res.opportunities) ? res.opportunities : [],
    riskFactors:  Array.isArray(res.risks)        ? res.risks        : [],
    keyEntities,
    findingsCited,
    opportunitiesCited,
    risksCited,
    perspective: res.perspective ? { country: res.perspective.country, countryCode: res.perspective.country_code } : undefined,
    intent,
    filterStats,
    cached: res.cached,
    elapsedSeconds: res.elapsed_seconds,
    entityGraphRaw: res.entity_graph,
  };
}

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
      setCurrentQueryResult(result);
      addQueryToHistory(result);
      setHasResult(true);
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

/* ── Reusable Search Bar ── */
interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  compact?: boolean;
  disabled?: boolean;
}

function SearchBar({ inputRef, value, onChange, onSubmit, compact, disabled }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative" style={{ width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        <Search size={16} color="var(--text-dim)" />
      </div>
      <input
        ref={inputRef}
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            onSubmit(value);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask anything about African trade..."
        style={{
          width: '100%',
          height: compact ? 44 : 56,
          background: 'var(--bg-surface)',
          border: `1px solid ${focused ? 'var(--text-primary)' : 'var(--border-default)'}`,
          borderRadius: 12,
          paddingLeft: 44,
          paddingRight: 48,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: compact ? 13 : 15,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxShadow: focused ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
        }}
        aria-label="Intelligence query search"
        autoComplete="off"
      />
      {value && !disabled && (
        <button
          onClick={() => onSubmit(value)}
          tabIndex={0}
          aria-label="Submit query"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--text-primary)',
            border: 'none',
            borderRadius: 6,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-primary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ArrowRight size={13} color="var(--bg-primary)" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
