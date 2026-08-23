'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle, Code2, Zap, Clock, BookmarkCheck, Download,
  ArrowRight, FileText, Layers, GitBranch, Target, Phone, Mail,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineageTrace {
  source_node?: string;
  extracted_fact?: string;
  target_concept?: string;
  relationship_type?: string;
  logic_justification?: string;
  [key: string]: unknown;
}

interface ThinkingGraph {
  metrics?: Record<string, number>;
  convergence_flow?: {
    tier_1_anchors?: string[];
    tier_2_processing_chunks?: string[];
    tier_3_synthesis_logic?: string;
  };
}

interface ExecuteData {
  files_written?: { roadmap_md?: string; reasoning_json?: string };
  final_roadmap?: string;
  opportunity_id?: string;
  ui_thinking_graph?: string;
  compiled_lineage_traces?: LineageTrace[];
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

interface TimelineStep {
  number: string;
  description: string;
  timing: string;
  verification: string;
}

interface MatrixRow {
  node: string;
  role: string;
  leverage: string;
  contact: string;
}

// ── Parsers ───────────────────────────────────────────────────────────────────

/** Split "### ## HEADING\n body" markdown into a { HEADING: body } map. */
function splitSections(md: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!md) return map;
  const parts = md.split(/#{2,3}\s*#{0,2}\s*(?=[A-Z])/g).filter((p) => p.trim());
  for (const part of parts) {
    const nl = part.indexOf('\n');
    if (nl === -1) continue;
    const title = part.slice(0, nl).trim().replace(/[#*]/g, '').trim();
    const body = part.slice(nl + 1).trim();
    if (title) map[title.toUpperCase()] = body;
  }
  return map;
}

/** Parse "- **Label**: text" bullet lines. */
function parseBullets(body: string): { label: string; text: string }[] {
  if (!body) return [];
  return body
    .split('\n')
    .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*'))
    .map((l) => {
      const clean = l.replace(/^\s*[-*]\s*/, '');
      const m = clean.match(/^\*\*(.+?)\*\*\s*[:：]?\s*(.*)$/);
      if (m) return { label: m[1].trim(), text: m[2].trim() };
      return { label: '', text: clean.replace(/\*\*/g, '').trim() };
    })
    .filter((b) => b.label || b.text);
}

/** Parse <timeline><step number>…</step></timeline> XML into structured steps. */
function parseTimeline(text: string): TimelineStep[] {
  if (!text) return [];
  const steps: TimelineStep[] = [];
  const stepRe = /<step\s+number="?(\d+)"?\s*>([\s\S]*?)<\/step>/g;
  let m: RegExpExecArray | null;
  while ((m = stepRe.exec(text)) !== null) {
    const body = m[2];
    const grab = (tag: string) =>
      (body.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1]?.trim() ?? '';
    steps.push({
      number: m[1],
      description: grab('description'),
      timing: grab('timing'),
      verification: grab('verification'),
    });
  }
  return steps;
}

/** Parse a markdown pipe table (Direct Action Matrix). */
function parseMatrix(body: string): MatrixRow[] {
  if (!body) return [];
  const rows = body.split('\n').filter((l) => l.trim().startsWith('|'));
  if (rows.length < 2) return [];
  const cells = (r: string) =>
    r.split('|').slice(1, -1).map((c) => c.trim());
  // rows[0] = header, rows[1] = separator, rest = data
  return rows.slice(2).map((r) => {
    const c = cells(r);
    return {
      node: c[0] ?? '',
      role: c[1] ?? '',
      leverage: c[2] ?? '',
      contact: c[3] ?? '',
    };
  }).filter((r) => r.node);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

const METRIC_LABELS: Record<string, string> = {
  total_vault_files_scanned: 'Vault Files Scanned',
  nodes_extracted: 'Nodes Extracted',
  map_chunks_processed: 'Map Chunks Processed',
  estimated_manual_hours_saved: 'Manual Hours Saved',
};

// ── Inline markdown (bold) renderer ─────────────────────────────────────────────

function MdText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, count }: { icon: React.ReactNode; title: string; count?: string }) {
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
      <span style={{ color: 'var(--text-dim)', display: 'flex' }} aria-hidden="true">{icon}</span>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h2>
      {count && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', marginLeft: 'auto' }}>
          {count}
        </span>
      )}
    </div>
  );
}

function TimelineCard({ step, index, total }: { step: TimelineStep; index: number; total: number }) {
  const isLast = index === total - 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      className="flex gap-4"
    >
      {/* Rail */}
      <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg-control)', border: '1px solid var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)',
        }} aria-hidden="true">
          {step.number}
        </div>
        {!isLast && <div style={{ width: 1, flex: 1, background: 'var(--border-default)', marginTop: 4, minHeight: 24 }} />}
      </div>

      {/* Body */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18, minWidth: 0 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            {step.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2" style={{ marginTop: 10 }}>
            {step.timing && (
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#007aff' }}>
                <Clock size={11} aria-hidden="true" /> {step.timing}
              </span>
            )}
            {step.verification && (
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-primary)', flex: 1, minWidth: 180 }}>
                <CheckCircle2 size={11} aria-hidden="true" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--text-tertiary)' }}>{step.verification}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MatrixCard({ row, index }: { row: MatrixRow; index: number }) {
  // Split contact into a name/coords blob; detect phone + email
  const phone = (row.contact.match(/\+?[\d][\d\s()-]{6,}/) || [])[0]?.trim();
  const email = (row.contact.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '16px 18px' }}
    >
      <div className="flex items-start justify-between gap-3" style={{ marginBottom: 10 }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
          {row.node}
        </h3>
        {row.role && (
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ff9f0a', background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.2)', borderRadius: 5, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {row.role}
          </span>
        )}
      </div>
      {row.leverage && (
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: '0 0 12px' }}>
          <MdText text={row.leverage} />
        </p>
      )}
      {(phone || email || row.contact) && (
        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
          {phone && (
            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: email ? 4 : 0 }}>
              <Phone size={11} aria-hidden="true" /> {phone}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              <Mail size={11} aria-hidden="true" /> {email}
            </div>
          )}
          {!phone && !email && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)' }}>
              <MdText text={row.contact} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TraceCard({ trace, index }: { trace: LineageTrace; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.035 }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full"
        style={{ padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-primary)' }}>
            {trace.source_node ?? `Trace ${index + 1}`}
          </span>
          <ArrowRight size={13} color="var(--text-dim)" aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: '#007aff', flex: 1, minWidth: 120 }}>
            {trace.target_concept}
          </span>
          {trace.relationship_type && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', background: 'var(--border-default)', borderRadius: 4, padding: '3px 7px', flexShrink: 0 }}>
              {trace.relationship_type}
            </span>
          )}
          {expanded
            ? <ChevronUp size={14} color="var(--text-dim)" aria-hidden="true" style={{ flexShrink: 0 }} />
            : <ChevronDown size={14} color="var(--text-dim)" aria-hidden="true" style={{ flexShrink: 0 }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-default)' }}>
              {trace.extracted_fact && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 4 }}>
                    Extracted Fact
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
                    {trace.extracted_fact}
                  </p>
                </div>
              )}
              {trace.logic_justification && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 4 }}>
                    Logic Justification
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
                    {trace.logic_justification}
                  </p>
                </div>
              )}
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

  // ── Derive structured content from the raw pipeline response ──
  const raw = (record?.raw_response ?? {}) as Record<string, unknown>;
  const data = (raw.data ?? {}) as ExecuteData;
  const pipelineError = !raw.data && (raw.detail || raw.error);
  const elapsed = typeof raw.elapsed_seconds === 'number' ? raw.elapsed_seconds : null;

  const finalRoadmap = data.final_roadmap ?? record?.roadmap_text ?? '';
  const sections = splitSections(finalRoadmap);
  const perimeterKey = Object.keys(sections).find((k) => k.includes('PERIMETER'));
  const roadmapKey = Object.keys(sections).find((k) => k.includes('ROADMAP') || k.includes('OPERATIONAL'));
  const matrixKey = Object.keys(sections).find((k) => k.includes('MATRIX') || k.includes('ACTION'));

  const perimeter = perimeterKey ? parseBullets(sections[perimeterKey]) : [];
  const timeline = roadmapKey ? parseTimeline(sections[roadmapKey]) : [];
  const matrix = matrixKey ? parseMatrix(sections[matrixKey]) : [];

  let thinking: ThinkingGraph = {};
  try {
    thinking = data.ui_thinking_graph ? JSON.parse(data.ui_thinking_graph) : {};
  } catch { thinking = {}; }

  const traces = data.compiled_lineage_traces ?? record?.lineage_traces ?? [];
  const metrics = thinking.metrics ?? {};
  const flow = thinking.convergence_flow;

  const hasStructured = perimeter.length || timeline.length || matrix.length || traces.length || Object.keys(metrics).length;

  return (
    <AppShell>
      {/* Print stylesheet — hides chrome and makes content full-width */}
      <style>{`
        @media print {
          .atis-sidebar, .atis-topbar, .atis-bottomnav, nav, header { display: none !important; }
          .atis-content { margin-left: 0 !important; }
          body { background: var(--text-primary) !important; color: var(--bg-primary) !important; }
          pre { white-space: pre-wrap !important; word-break: break-word !important; }
          button { display: none !important; }
          a[href]::after { content: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#050505', paddingBottom: 80 }}>
        <main className="pt-6 md:pt-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* Back link */}
          <Link href="/opportunities" className="inline-flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', marginBottom: 20 }}>
            <ChevronLeft size={14} aria-hidden="true" /> Opportunities
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--text-primary)" style={{ animation: 'spin 1.4s linear infinite' }} aria-hidden="true" />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>Loading roadmap…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 12 }} role="alert">
              <AlertCircle size={18} color="#ff453a" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#ff453a' }}>{error}</span>
            </div>
          )}

          {record && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {/* ── Header card ── */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, padding: '22px 24px', marginBottom: 28 }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'var(--bg-control-active)', border: '1px solid var(--border-active)', borderRadius: 5, padding: '3px 8px' }}>
                        {pipelineError ? 'Pipeline Error' : 'Roadmap Ready'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                        {record.opportunity_id}
                      </span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
                      {record.opportunity_title ?? 'Strategic Execution Roadmap'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ marginTop: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                        {formatDate(record.executed_at)}
                      </span>
                      {elapsed != null && (
                        <span className="flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                          <Clock size={10} aria-hidden="true" /> {elapsed.toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => window.print()}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', background: 'var(--border-default)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-hover)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)'; }}
                    >
                      <Download size={12} aria-hidden="true" /> Download PDF
                    </button>
                    {record.saved_opportunity_id && (
                      <Link href="/opportunities" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-control)', border: '1px solid var(--border-active)', borderRadius: 8, padding: '7px 12px', textDecoration: 'none' }}>
                        <BookmarkCheck size={12} aria-hidden="true" /> Saved
                      </Link>
                    )}
                    <Link href="/execute" style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', background: 'var(--bg-control)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '7px 12px', textDecoration: 'none' }}>
                      <Zap size={12} aria-hidden="true" /> New
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Pipeline error fallback ── */}
              {pipelineError && (
                <div style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.18)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#ff453a', margin: '0 0 6px' }}>
                    The pipeline returned an error
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
                    {String(raw.detail ?? raw.error ?? 'Unknown error')}
                  </p>
                </div>
              )}

              {/* ── Metrics row ── */}
              {Object.keys(metrics).length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: 28 }}>
                  {Object.entries(metrics).map(([key, val]) => (
                    <div key={key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {val}
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                        {METRIC_LABELS[key] ?? key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col" style={{ gap: 32 }}>

                {/* ── Convergence Flow ── */}
                {flow && (
                  <section>
                    <SectionTitle icon={<GitBranch size={15} />} title="Convergence Flow" />
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, padding: '20px 22px' }}>
                      {/* Tier 1 */}
                      {flow.tier_1_anchors?.length ? (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: 8 }}>
                            Tier 1 · Anchors
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {flow.tier_1_anchors.map((a, i) => (
                              <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-control-active)', border: '1px solid var(--border-active)', borderRadius: 7, padding: '6px 12px' }}>
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Connector */}
                      <div className="flex justify-center" style={{ marginBottom: 16 }}>
                        <ChevronDown size={16} color="var(--border-default)" aria-hidden="true" />
                      </div>

                      {/* Tier 2 */}
                      {flow.tier_2_processing_chunks?.length ? (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#007aff', marginBottom: 8 }}>
                            Tier 2 · Processing
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {flow.tier_2_processing_chunks.map((c, i) => (
                              <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-primary)', background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.25)', borderRadius: 7, padding: '6px 12px' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Connector */}
                      <div className="flex justify-center" style={{ marginBottom: 16 }}>
                        <ChevronDown size={16} color="var(--border-default)" aria-hidden="true" />
                      </div>

                      {/* Tier 3 */}
                      {flow.tier_3_synthesis_logic && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ff9f0a', marginBottom: 8 }}>
                            Tier 3 · Synthesis Logic
                          </div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.7, margin: 0, background: 'var(--bg-control)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '14px 16px' }}>
                            {flow.tier_3_synthesis_logic}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ── Transaction Perimeter ── */}
                {perimeter.length > 0 && (
                  <section>
                    <SectionTitle icon={<Target size={15} />} title="Transaction Perimeter" count={`${perimeter.length} directives`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perimeter.map((b, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '16px 18px', borderLeft: '3px solid #007aff' }}
                        >
                          {b.label && (
                            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)', marginBottom: 6 }}>
                              {b.label}
                            </div>
                          )}
                          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.65, margin: 0 }}>
                            <MdText text={b.text} />
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Operational Roadmap (timeline) ── */}
                {timeline.length > 0 && (
                  <section>
                    <SectionTitle icon={<Layers size={15} />} title="Operational Roadmap" count={`${timeline.length} steps`} />
                    <div>
                      {timeline.map((step, i) => (
                        <TimelineCard key={i} step={step} index={i} total={timeline.length} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Direct Action Matrix ── */}
                {matrix.length > 0 && (
                  <section>
                    <SectionTitle icon={<Target size={15} />} title="Direct Action Matrix" count={`${matrix.length} nodes`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matrix.map((row, i) => (
                        <MatrixCard key={i} row={row} index={i} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Lineage Traces ── */}
                {traces.length > 0 && (
                  <section>
                    <SectionTitle icon={<GitBranch size={15} />} title="Lineage Traces" count={`${traces.length} links`} />
                    {traces.map((trace, i) => (
                      <TraceCard key={i} trace={trace} index={i} />
                    ))}
                  </section>
                )}

                {/* ── Fallback: raw markdown if nothing parsed ── */}
                {!hasStructured && finalRoadmap && (
                  <section>
                    <SectionTitle icon={<FileText size={15} />} title="Strategic Roadmap" />
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '20px 22px' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {finalRoadmap}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* ── Raw JSON output ── */}
              <section style={{ marginTop: 32 }}>
                <button
                  onClick={() => setShowRaw((p) => !p)}
                  className="flex items-center gap-2"
                  style={{ background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', transition: 'border-color 0.15s, color 0.15s', marginBottom: 12 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; }}
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
                          color: 'var(--text-dim)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
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
