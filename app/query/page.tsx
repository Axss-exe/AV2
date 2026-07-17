'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { QueryHero } from '@/components/query-hero';
import { EntityGraph } from '@/components/entity-graph';
import { IntelTable } from '@/components/intel-table';
import { InfoCards } from '@/components/info-cards';
import { useATIS } from '@/lib/context';
import { queryAPI, APIError } from '@/lib/api';
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
  };
}

export default function QueryPage() {
  const { currentQueryResult, setCurrentQueryResult, addQueryToHistory } = useATIS();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(!!currentQueryResult);
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentQueryResult) setHasResult(true);
  }, [currentQueryResult]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || loading) return;
    setInputValue(query);
    setLoading(true);
    setApiError(null);

    try {
      const res = await queryAPI({ question: query || undefined });
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
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 28,
                      color: '#ffffff',
                      marginBottom: 8,
                    }}
                  >
                    Intelligence Query
                  </h1>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 14,
                      color: '#737373',
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
                        color: '#a1a1a6',
                        background: '#1c1c1e',
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
                          (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                          (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
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
                    color: '#a1a1a6',
                    background: '#1c1c1e',
                    border: '1px solid #262626',
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
                      (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                      (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                    (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
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

              {currentQueryResult && (
                <div className="flex flex-col gap-4">
                  <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <QueryHero result={currentQueryResult} />
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
                    <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                      <EntityGraph
                        nodes={currentQueryResult.graphNodes ?? []}
                        edges={(currentQueryResult.graphEdges ?? []).map((e) => ({
                          from: e.from,
                          to: e.to,
                          label: e.label ?? '',
                        }))}
                        title="Entity Network"
                      />
                    </motion.div>
                    <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                      <IntelTable rows={currentQueryResult.tableRows ?? []} />
                    </motion.div>
                  </div>

                  <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
                    <InfoCards
                      findings={currentQueryResult.findings ?? []}
                      opportunities={currentQueryResult.opportunities ?? []}
                      riskFactors={currentQueryResult.riskFactors ?? []}
                      keyEntities={currentQueryResult.keyEntities ?? []}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
        <Search size={16} color="#525252" />
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
          background: '#0a0a0a',
          border: `1px solid ${focused ? '#ffffff' : '#1c1c1e'}`,
          borderRadius: 12,
          paddingLeft: 44,
          paddingRight: 48,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: compact ? 13 : 15,
          color: '#ffffff',
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
            background: '#ffffff',
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
            (e.currentTarget as HTMLButtonElement).style.background = '#d1d1d6';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ArrowRight size={13} color="#000000" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
