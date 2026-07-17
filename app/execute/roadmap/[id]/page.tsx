'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle, Code2, Zap, Clock, BookmarkCheck,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineageTrace {
  id?: string;
  step?: string;
  source?: string;
  reasoning?: string;
  confidence?: string;
  [key: string]: unknown;
}

interface RoadmapRecord {
  id: number;
  saved_opportunity_id?: number;
  opportunity_id: string;
  opportunity_title?: string;
  roadmap_text?: string;
  lineage_traces: LineageTrace[];
  raw_response: Record<string, unknown>;
  executed_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

/**
 * Parse roadmap text into numbered steps where possible.
 * Handles:
 *  - "1. Step title: description"
 *  - "**Step 1:** ..."
 *  - Plain paragraphs as a fallback
 */
function parseRoadmapSteps(text: string): { title: string; body: string }[] {
  if (!text) return [];

  // Try numbered list: lines starting with "1." / "**1.**" / "Step 1:"
  const numbered = text.match(/(?:^|\n)(?:\*\*)?(?:Step\s+)?\d+[.)]\s*\*?\*?([^\n]+)\*?\*?(?:\n([\s\S]*?))?(?=(?:\n(?:\*\*)?(?:Step\s+)?\d+[.)]\s)|$)/gi);
  if (numbered && numbered.length >= 2) {
    return numbered.map((block) => {
      const [titleLine, ...rest] = block.trim().split('\n');
      const title = titleLine.replace(/^(?:\*\*)?(?:Step\s+)?\d+[.)]\s*\*?\*?/, '').replace(/\*\*/g, '').trim();
      const body = rest.join('\n').trim();
      return { title, body };
    });
  }

  // Fallback: split on double newlines as paragraphs
  const paras = text.split(/\n{2,}/).filter(Boolean);
  if (paras.length > 1) {
    return paras.map((p, i) => {
      const lines = p.split('\n');
      const title = lines[0].replace(/\*\*/g, '').trim() || `Phase ${i + 1}`;
      const body = lines.slice(1).join('\n').trim();
      return { title, body };
    });
  }

  // Last resort: entire text as single card
  return [{ title: 'Strategic Roadmap', body: text.trim() }];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoadmapStep({ step, index, total }: { step: { title: string; body: string }; index: number; total: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const pct = Math.round(((index + 1) / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4"
        style={{ padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
      >
        {/* Step index circle */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: expanded ? '#1c1c1e' : '#111111',
          border: `1px solid ${expanded ? '#333333' : '#1c1c1e'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10, color: expanded ? '#f5f5f7' : '#525252',
          transition: 'all 0.2s',
        }} aria-hidden="true">
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#f5f5f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {step.title}
          </div>
          {!expanded && step.body && (
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: '#525252', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {step.body.slice(0, 80)}
            </div>
          )}
        </div>

        {/* Progress pct */}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333', flexShrink: 0 }}>
          {pct}%
        </span>

        {expanded
          ? <ChevronUp size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} />
          : <ChevronDown size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} />
        }
      </button>

      <AnimatePresence>
        {expanded && step.body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 16px 60px', borderTop: '1px solid #111111' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#a1a1a6', lineHeight: 1.7, marginTop: 12, whiteSpace: 'pre-wrap' }}>
                {step.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TraceRow({ trace, index }: { trace: LineageTrace; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = confidenceColor(trace.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4"
        style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
      >
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1c1c1e', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10, color: '#737373' }} aria-hidden="true">
          {index + 1}
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: '#ffffff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {trace.step ?? `Trace Step ${index + 1}`}
        </span>
        {trace.source && (
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#737373', background: '#1c1c1e', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
            {trace.source}
          </span>
        )}
        {trace.confidence && (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, color, flexShrink: 0 }}>
            {trace.confidence}
          </span>
        )}
        {expanded ? <ChevronUp size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} /> : <ChevronDown size={14} color="#525252" aria-hidden="true" style={{ flexShrink: 0 }} />}
      </button>

      <AnimatePresence>
        {expanded && trace.reasoning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px 56px', borderTop: '1px solid #1c1c1e' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: '#a1a1a6', lineHeight: 1.65, marginTop: 12 }}>
                {trace.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoadmapDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [record, setRecord] = useState<RoadmapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roadmaps/${id}`);
      const data = await res.json();
      if (data.status === 'ok' && data.data) {
        setRecord(data.data as RoadmapRecord);
      } else {
        setError(data.error ?? 'Roadmap not found.');
      }
    } catch {
      setError('Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const steps = record?.roadmap_text ? parseRoadmapSteps(record.roadmap_text) : [];
  const traces: LineageTrace[] = record?.lineage_traces ?? [];

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#050505', paddingBottom: 80 }}>
        <main className="pt-6 md:pt-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* ── Breadcrumb ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Execute', href: '/execute' },
              { label: 'Roadmap', href: null },
            ].map((crumb, i, arr) => (
              <span key={crumb.label} className="flex items-center gap-2">
                {crumb.href
                  ? <Link href={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1a6'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#525252'; }}>
                      {i === 0 && <ChevronLeft size={12} aria-hidden="true" />}{crumb.label}
                    </Link>
                  : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>{crumb.label}</span>
                }
                {i < arr.length - 1 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1c1c1e' }}>/</span>}
              </span>
            ))}
          </div>

          {/* ── Loading state ──────────────────────────────────────────── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 56, background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 12, animation: 'pulse-soft 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-3" style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 12, padding: '16px 20px' }} role="alert">
              <AlertCircle size={16} color="#ff453a" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#ff453a' }}>{error}</span>
              <button onClick={load} style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff453a', background: 'transparent', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* ── Dashboard ──────────────────────────────────────────────── */}
          {record && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

              {/* Header card */}
              <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 16, padding: '22px 26px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#30d158,#007aff)' }} aria-hidden="true" />

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={15} color="#30d158" aria-hidden="true" />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#30d158', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Pipeline Complete
                      </span>
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 20, color: '#f5f5f7', margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                      {record.opportunity_title ?? record.opportunity_id}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                        <Clock size={9} aria-hidden="true" /> {formatDate(record.executed_at)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                        ID: {record.opportunity_id}
                      </span>
                      {steps.length > 0 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                          {steps.length} roadmap steps
                        </span>
                      )}
                      {traces.length > 0 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                          {traces.length} lineage traces
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {record.saved_opportunity_id && (
                      <Link href="/opportunities" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#30d158', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8, padding: '7px 12px', textDecoration: 'none', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(48,209,88,0.15)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(48,209,88,0.08)'; }}>
                        <BookmarkCheck size={12} aria-hidden="true" /> Opportunities
                      </Link>
                    )}
                    <Link href="/execute" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a1a1a6', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 8, padding: '7px 12px', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1c1c1e'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#111111'; }}>
                      <Zap size={12} aria-hidden="true" /> New Execution
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Two-column layout: Roadmap + Traces ── */}
              <div className={steps.length > 0 && traces.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'}>

                {/* Strategic Roadmap */}
                {steps.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#a1a1a6', margin: 0 }}>
                        Strategic Roadmap
                      </h2>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333' }}>
                        {steps.length} steps
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: '#1c1c1e', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#007aff,#30d158)', borderRadius: 2 }}
                      />
                    </div>

                    {steps.map((step, i) => (
                      <RoadmapStep key={i} step={step} index={i} total={steps.length} />
                    ))}
                  </section>
                )}

                {/* No roadmap but has raw text */}
                {!steps.length && record.roadmap_text && (
                  <section>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#a1a1a6', margin: '0 0 14px' }}>
                      Strategic Roadmap
                    </h2>
                    <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 12, padding: '20px 22px' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#a1a1a6', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {record.roadmap_text}
                      </p>
                    </div>
                  </section>
                )}

                {/* Lineage Traces */}
                {traces.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#a1a1a6', margin: 0 }}>
                        Lineage Traces
                      </h2>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333' }}>
                        {traces.length} steps
                      </span>
                    </div>
                    {traces.map((trace, i) => (
                      <TraceRow key={trace.id ?? i} trace={trace} index={i} />
                    ))}
                  </section>
                )}
              </div>

              {/* ── Raw JSON output ── */}
              <section style={{ marginTop: 32 }}>
                <button
                  onClick={() => setShowRaw((p) => !p)}
                  className="flex items-center gap-2"
                  style={{ background: 'transparent', border: '1px solid #1c1c1e', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252', transition: 'border-color 0.15s, color 0.15s', marginBottom: 12 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#333333'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1c1c1e'; (e.currentTarget as HTMLButtonElement).style.color = '#525252'; }}
                >
                  <Code2 size={12} aria-hidden="true" />
                  {showRaw ? 'Hide' : 'Show'} Raw Pipeline Output
                  {showRaw ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
                </button>

                <AnimatePresence>
                  {showRaw && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <pre
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: '#525252',
                          background: '#0a0a0a',
                          border: '1px solid #1c1c1e',
                          borderRadius: 12,
                          padding: '18px 20px',
                          overflowX: 'auto',
                          maxHeight: 480,
                          overflowY: 'auto',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {JSON.stringify(record.raw_response, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

            </motion.div>
          )}

        </main>
      </div>
    </AppShell>
  );
}
