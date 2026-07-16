'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { executeOpportunity, APIError } from '@/lib/api';
import type { ExecuteAPIResponse, LineageTrace } from '@/lib/api';

// Predefined opportunity choices for the analyst
const OPPORTUNITIES = [
  {
    id: 'opp-001',
    title: 'Zimbabwe Agricultural Export Corridor',
    description: 'Expanding tobacco and maize export routes via Beira Port to Asian markets.',
    sector: 'Agriculture',
    markets: ['Zimbabwe', 'Mozambique', 'China'],
  },
  {
    id: 'opp-002',
    title: 'Cross-Border Lithium Mining JV',
    description: 'Joint venture for lithium extraction targeting EV battery supply chains in EU.',
    sector: 'Mining',
    markets: ['Zimbabwe', 'South Africa', 'Germany'],
  },
  {
    id: 'opp-003',
    title: 'East Africa Logistics Technology Platform',
    description: 'Digital freight-matching platform to reduce empty-truck runs in the EAC corridor.',
    sector: 'Logistics',
    markets: ['Kenya', 'Tanzania', 'Uganda'],
  },
  {
    id: 'opp-004',
    title: 'Nigerian Fintech Regulatory Sandbox',
    description: 'Operating a licensed fintech product within the CBN sandbox for cross-border remittances.',
    sector: 'Technology',
    markets: ['Nigeria', 'Ghana', 'UK'],
  },
  {
    id: 'opp-005',
    title: 'Rwanda Green Energy Infrastructure Bond',
    description: 'Structuring a green bond for 100MW solar PV capacity expansion in the Lake Kivu corridor.',
    sector: 'Energy',
    markets: ['Rwanda', 'DRC', 'Burundi'],
  },
];

function confidenceColor(val?: string): string {
  if (!val) return '#737373';
  const n = parseFloat(val);
  if (!isNaN(n)) {
    if (n >= 0.75) return '#30d158';
    if (n >= 0.5) return '#ff9f0a';
    return '#ff453a';
  }
  const v = val.toLowerCase();
  if (v.includes('high')) return '#30d158';
  if (v.includes('medium') || v.includes('moderate')) return '#ff9f0a';
  return '#ff453a';
}

function TraceRow({ trace, index }: { trace: LineageTrace; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = confidenceColor(trace.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      {/* Row header — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4"
        style={{
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={expanded}
        aria-label={`Trace step: ${trace.step ?? 'unknown'}`}
      >
        {/* Step number */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1c1c1e',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 10,
            color: '#737373',
          }}
          aria-hidden="true"
        >
          {index + 1}
        </div>

        {/* Step label */}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 13,
            color: '#ffffff',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {trace.step ?? `Trace Step ${index + 1}`}
        </span>

        {/* Source tag */}
        {trace.source && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#737373',
              background: '#1c1c1e',
              borderRadius: 4,
              padding: '2px 8px',
              flexShrink: 0,
            }}
          >
            {trace.source}
          </span>
        )}

        {/* Confidence */}
        {trace.confidence && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 11,
              color,
              flexShrink: 0,
            }}
          >
            {trace.confidence}
          </span>
        )}

        {expanded ? (
          <ChevronUp size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} />
        )}
      </button>

      {/* Expandable reasoning */}
      <AnimatePresence>
        {expanded && trace.reasoning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 16px 14px 56px',
                borderTop: '1px solid #1c1c1e',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                  fontSize: 12,
                  color: '#a1a1a6',
                  lineHeight: 1.65,
                  marginTop: 12,
                }}
              >
                {trace.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExecutePage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof OPPORTUNITIES[0] | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecuteAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!selectedOpportunity || running) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await executeOpportunity({
        dashboard_json: {
          opportunity_title: selectedOpportunity.title,
          opportunity_description: selectedOpportunity.description,
          sector: selectedOpportunity.sector,
          markets: selectedOpportunity.markets,
        },
        opportunity_id: selectedOpportunity.id,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg =
        err instanceof APIError
          ? err.message
          : 'Failed to execute the intelligence pipeline. Please try again.';
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setSelectedOpportunity(null);
    setResult(null);
    setError(null);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] as number[] },
    }),
  };

  const traces: LineageTrace[] = result?.lineage_traces ?? [];

  return (
    <AppShell>
      <AnalystLoading isVisible={running} durationMs={120_000} />

      <div style={{ paddingTop: 40 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 24,
                color: '#ffffff',
                marginBottom: 6,
              }}
            >
              Tactical Execution
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 13,
                color: '#737373',
              }}
            >
              Select an opportunity and run the intelligence pipeline to generate a strategic roadmap
            </p>
          </div>

          {result && (
            <button
              onClick={handleReset}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 12,
                color: '#a1a1a6',
                background: '#1c1c1e',
                border: '1px solid #262626',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
              }}
            >
              New Execution
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            /* ── SELECTION STATE ── */
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Opportunity selection grid */}
              <div
                className="grid gap-3 mb-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                role="radiogroup"
                aria-label="Select an opportunity to execute"
              >
                {OPPORTUNITIES.map((opp, i) => {
                  const isSelected = selectedOpportunity?.id === opp.id;
                  return (
                    <motion.button
                      key={opp.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      onClick={() => setSelectedOpportunity(opp)}
                      role="radio"
                      aria-checked={isSelected}
                      style={{
                        background: isSelected ? '#111111' : '#0a0a0a',
                        border: `1px solid ${isSelected ? '#333333' : '#1c1c1e'}`,
                        borderRadius: 14,
                        padding: 18,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: isSelected ? '1px solid #ffffff20' : 'none',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#1c1c1e';
                        }
                      }}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#737373',
                            background: '#1c1c1e',
                            borderRadius: 4,
                            padding: '2px 8px',
                          }}
                        >
                          {opp.sector}
                        </span>
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            color="#30d158"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#ffffff',
                          lineHeight: 1.4,
                          marginBottom: 6,
                        }}
                      >
                        {opp.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 12,
                          color: '#737373',
                          lineHeight: 1.55,
                          marginBottom: 10,
                        }}
                      >
                        {opp.description}
                      </p>

                      {/* Market tags */}
                      <div className="flex flex-wrap gap-1">
                        {opp.markets.map((m) => (
                          <span
                            key={m}
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 500,
                              fontSize: 10,
                              color: '#525252',
                              background: '#111111',
                              borderRadius: 4,
                              padding: '2px 6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
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
                    <AlertCircle
                      size={15}
                      color="#ff453a"
                      style={{ flexShrink: 0, marginTop: 1 }}
                      aria-hidden="true"
                    />
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 400,
                        fontSize: 13,
                        color: '#ff453a',
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Execute button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: selectedOpportunity ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={handleExecute}
                  disabled={!selectedOpportunity || running}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#000000',
                    background: selectedOpportunity ? '#ffffff' : '#333333',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    cursor: selectedOpportunity && !running ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    opacity: selectedOpportunity && !running ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOpportunity && !running) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#d1d1d6';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = selectedOpportunity ? '#ffffff' : '#333333';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }}
                  aria-label={
                    selectedOpportunity
                      ? `Execute: ${selectedOpportunity.title}`
                      : 'Select an opportunity first'
                  }
                >
                  <Zap size={15} aria-hidden="true" />
                  Run Intelligence Pipeline
                </button>

                {selectedOpportunity && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#525252',
                    }}
                  >
                    Selected: <strong style={{ color: '#a1a1a6' }}>{selectedOpportunity.title}</strong>
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* ── RESULTS STATE ── */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              {/* Selected opportunity recap */}
              {selectedOpportunity && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #1c1c1e',
                    borderRadius: 14,
                    padding: 20,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#1c1c1e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <CheckCircle2 size={18} color="#30d158" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 10,
                        color: '#30d158',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 3,
                      }}
                    >
                      Pipeline Complete
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#ffffff',
                      }}
                    >
                      {selectedOpportunity.title}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid gap-6" style={{ gridTemplateColumns: result?.roadmap ? '1fr 1fr' : '1fr' }}>
                {/* Roadmap */}
                {result?.roadmap && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
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
                        Strategic Roadmap
                      </h2>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 13,
                          color: '#a1a1a6',
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {result.roadmap}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Lineage Traces */}
                {traces.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
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
                        Lineage Traces
                      </h2>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: 11,
                          color: '#737373',
                          background: '#1c1c1e',
                          borderRadius: 4,
                          padding: '2px 8px',
                        }}
                      >
                        {traces.length} steps
                      </span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      {traces.map((trace, i) => (
                        <TraceRow key={trace.id ?? i} trace={trace} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Raw output if no structured data */}
                {!result.roadmap && traces.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid #1c1c1e',
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle size={16} color="#ff9f0a" aria-hidden="true" />
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#ff9f0a',
                        }}
                      >
                        Pipeline returned unstructured output
                      </span>
                    </div>
                    <pre
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: '#737373',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        background: '#111111',
                        border: '1px solid #1c1c1e',
                        borderRadius: 8,
                        padding: 16,
                        maxHeight: 400,
                        overflowY: 'auto',
                      }}
                    >
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
