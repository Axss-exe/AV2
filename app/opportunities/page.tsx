'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Trash2, Zap, BookmarkX, RefreshCw,
  Newspaper, Clock, Hash, BookmarkCheck, Loader2, AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { OpportunityCard } from '@/components/opportunity-card';
import { useATIS } from '@/lib/context';
import { executeOpportunity, APIError } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedRow {
  id: number;
  opportunity_id: string;
  title: string;
  type?: string;
  urgency_score: number;
  feasibility_score: number;
  justification?: string;
  required_missing_nodes: string[];
  capital_flow?: { likely_funder?: string; beneficiary?: string };
  dashboard_json: Record<string, unknown>;
  intelligence_id?: string;
  trigger_event?: string;
  source_article_id?: number;
  source_article_headline?: string;
  saved_at: string;
  latest_roadmap_id?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.28 } }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

function urgencyColor(score: number): string {
  if (score >= 9.0) return '#ff453a';
  if (score >= 7.0) return '#ff9f0a';
  if (score >= 5.0) return '#ffd60a';
  return 'var(--text-primary)';
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ts; }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--border-default)', borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ height: 14, width: '70%', background: 'var(--border-default)', borderRadius: 4, animation: 'pulse-soft 1.5s infinite' }} />
      <div style={{ height: 3, width: '100%', background: 'var(--border-default)', borderRadius: 2, animation: 'pulse-soft 1.5s infinite' }} />
      <div style={{ height: 48, width: '100%', background: 'var(--bg-control)', borderRadius: 6, animation: 'pulse-soft 1.5s infinite' }} />
    </div>
  );
}

function IntelligenceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '18px 20px' }}>
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 12px' }}>{title}</h3>
      {children}
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OpportunitiesPage() {
  const router = useRouter();
  const {
    currentDashboard,
    analysisPartial,
    currentNewsArticle,
    clearAnalysis,
    perspectiveCountry,
    perspectiveCountryCode,
  } = useATIS();

  // Saved opportunities from DB
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'urgency_score' | 'saved_at'>('urgency_score');

  // Track which in-memory opp_ids have been saved this session
  const [justSaved, setJustSaved] = useState<Set<string>>(new Set());

  // Execute pipeline inline then redirect to roadmap dashboard
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingSaved(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/saved-opportunities');
      const data = await res.json();
      if (data.status === 'ok') setSaved(data.data);
      else setLoadError('Failed to load saved opportunities.');
    } catch {
      setLoadError('Network error loading saved opportunities.');
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savedIds = new Set(saved.map((r) => r.opportunity_id));

  const sortedSaved = [...saved].sort((a, b) =>
    sortBy === 'urgency_score'
      ? b.urgency_score - a.urgency_score
      : new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
  );

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/saved-opportunities/${id}`, { method: 'DELETE' });
      setSaved((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('[delete saved]', err);
    } finally {
      setDeletingId(null);
    }
  }

  const handleExecute = useCallback(async (opportunityId: string) => {
    if (executingId) return;
    setExecutingId(opportunityId);
    setExecuteError(null);

    // Find the matching opportunity from the saved list or the in-memory dashboard
    const savedRow = saved.find((r) => r.opportunity_id === opportunityId);
    const dashboardJson = savedRow
      ? savedRow.dashboard_json
      : (currentDashboard ?? {}) as Record<string, unknown>;

    // The opportunity's own perspective (from the backend) is authoritative.
    // Fall back to the user's currently selected perspective only if absent.
    const oppPerspective = (dashboardJson as Record<string, unknown>)?.perspective_country as string | undefined;

    try {
      const res = await executeOpportunity({
        dashboard_json: dashboardJson,
        opportunity_id: opportunityId,
        perspective_country: oppPerspective ?? perspectiveCountry,
        perspective_country_code:
          ((dashboardJson as Record<string, unknown>)?.perspective_country_code as string | undefined)
          ?? perspectiveCountryCode,
      });

      // Auto-save roadmap and navigate to its dashboard
      const saveRes = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          opportunity_title: savedRow?.title ?? (dashboardJson as Record<string, unknown>)?.trigger_event ?? opportunityId,
          saved_opportunity_id: savedRow?.id ?? null,
          roadmap_text: res.roadmap ?? null,
          lineage_traces: res.lineage_traces ?? [],
          raw_response: res,
        }),
      });
      const saved_ = await saveRes.json();
      const roadmapId = saved_?.id;

      if (roadmapId) {
        router.push(`/execute/roadmap/${roadmapId}`);
      }
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Pipeline execution failed. Please try again.';
      setExecuteError(msg);
      setExecutingId(null);
    }
  }, [executingId, saved, currentDashboard, router, perspectiveCountry, perspectiveCountryCode]);

  // ── View: no analysis and no saved items ──────────────────────────────────
  const showEmpty = !loadingSaved && saved.length === 0 && !currentDashboard;

  return (
    <AppShell>
      {/* ── Full-screen execute overlay ── */}
      <AnimatePresence>
        {executingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20,
              backdropFilter: 'blur(8px)',
            }}
            role="status"
            aria-live="polite"
          >
            <div style={{ width: 56, height: 56, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={26} color="var(--text-primary)" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Running Intelligence Pipeline
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: 0, maxWidth: 340, lineHeight: 1.4 }}>
                {saved.find((r) => r.opportunity_id === executingId)?.title ?? executingId}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
                Generating strategic roadmap &amp; lineage traces…
              </p>
            </div>
            {/* Animated progress bar */}
            <div style={{ width: 240, height: 2, background: 'var(--border-default)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,var(--text-primary),transparent)', borderRadius: 2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 80 }}>
        <main className="pt-6 md:pt-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 980, margin: '0 auto' }}>

          {/* ── Page header ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4" style={{ marginBottom: 28 }}>
            <div>
              <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
                <Link href="/atis-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-tertiary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'; }}>
                  <ChevronLeft size={12} aria-hidden="true" /> Home
                </Link>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--border-default)' }}>/</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--border-default)' }}>Opportunities</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Opportunities
              </h1>
              {!loadingSaved && saved.length > 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', margin: '6px 0 0' }}>
                  {saved.length} saved &middot; sort: {sortBy === 'urgency_score' ? 'urgency' : 'date'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['urgency_score', 'saved_at'] as const).map((opt) => (
                  <button key={opt} onClick={() => setSortBy(opt)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: sortBy === opt ? 'var(--border-default)' : 'transparent', color: sortBy === opt ? 'var(--text-primary)' : 'var(--text-dim)', transition: 'all 0.15s' }}>
                    {opt === 'urgency_score' ? 'Urgency' : 'Recent'}
                  </button>
                ))}
              </div>
              <button onClick={load} aria-label="Refresh" style={{ background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; }}>
                <RefreshCw size={13} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── In-memory analysis panel ──────────────────────────────────── */}
          {currentDashboard && (
            <>
            {analysisPartial && (
              <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.24)', borderRadius: 8, color: 'var(--text-dim)', fontSize: 12 }}>
                <AlertCircle size={14} aria-hidden="true" />
                Analysis returned partial intelligence. Missing sections are shown as empty rather than inferred.
              </div>
            )}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
              {/* Analysis header card */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, padding: '20px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#007aff,#5ac8fa)' }} aria-hidden="true" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Current Analysis &middot; {currentDashboard.intelligence_id as string}
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {currentDashboard.trigger_event as string}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                      {(currentDashboard.market_equilibrium_shift as string)?.slice(0, 160)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {currentNewsArticle && (
                      <Link href={`/news/${currentNewsArticle.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#007aff', background: 'rgba(0,122,255,0.08)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>
                        <Newspaper size={10} aria-hidden="true" /> Source
                      </Link>
                    )}
                    <button onClick={() => { clearAnalysis(); }} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Meta row */}
                {currentDashboard.pipeline_metadata && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {currentDashboard.pipeline_metadata.extracted_entities_count != null && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', background: 'var(--bg-control)', border: '1px solid var(--border-default)', borderRadius: 5, padding: '3px 8px' }}>
                        <Hash size={9} aria-hidden="true" /> {currentDashboard.pipeline_metadata.extracted_entities_count} entities
                      </span>
                    )}
                    {(currentDashboard.pipeline_metadata as Record<string, unknown>).processed_at && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', background: 'var(--bg-control)', border: '1px solid var(--border-default)', borderRadius: 5, padding: '3px 8px' }}>
                        <Clock size={9} aria-hidden="true" /> {formatTimestamp((currentDashboard.pipeline_metadata as Record<string, unknown>).processed_at as string)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Canonical News intelligence sections */}
              <div className="flex flex-col gap-4" style={{ marginBottom: 20 }}>
                {(currentDashboard.executive_summary || currentDashboard.trigger_event || currentDashboard.market_equilibrium_shift) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(currentDashboard.executive_summary || currentDashboard.trigger_event) && <IntelligenceSection title="Executive Summary">
                      <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.65 }}>{(currentDashboard.executive_summary as string) || (currentDashboard.trigger_event as string)}</p>
                    </IntelligenceSection>}
                    {currentDashboard.trigger_event && <IntelligenceSection title="Trigger Event">
                      <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.65 }}>{currentDashboard.trigger_event as string}</p>
                      <p style={{ margin: '10px 0 0', color: 'var(--text-dim)', fontSize: 11 }}>Source country: {(currentDashboard.source_country as string) || 'Not specified'} · Event country: {(currentDashboard.event_country as string) || 'Not specified'}</p>
                    </IntelligenceSection>}
                  </div>
                )}
                {currentDashboard.market_equilibrium_shift && <IntelligenceSection title="Market Equilibrium Shift"><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.65 }}>{currentDashboard.market_equilibrium_shift as string}</p></IntelligenceSection>}
                {Array.isArray(currentDashboard.findings) && currentDashboard.findings.length > 0 && <IntelligenceSection title="Findings"><div className="flex flex-col gap-3">{currentDashboard.findings.map((item: { text?: string; source_nodes?: string[] }, i: number) => <div key={i}><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>{item.text}</p>{item.source_nodes?.length ? <p style={{ margin: '5px 0 0', color: 'var(--text-dim)', fontSize: 10 }}>Evidence: {item.source_nodes.join(', ')}</p> : null}</div>)}</div></IntelligenceSection>}
                {Array.isArray(currentDashboard.structured_intelligence) && currentDashboard.structured_intelligence.length > 0 && <IntelligenceSection title="Structured Intelligence"><div className="flex flex-col gap-3">{currentDashboard.structured_intelligence.map((item: { claim?: string; evidence?: string; impact?: string }, i: number) => <div key={i}><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}><strong>{item.claim}</strong>{item.impact ? ` — ${item.impact}` : ''}</p>{item.evidence ? <p style={{ margin: '5px 0 0', color: 'var(--text-dim)', fontSize: 11 }}>{item.evidence}</p> : null}</div>)}</div></IntelligenceSection>}
                {Array.isArray(currentDashboard.risks) && currentDashboard.risks.length > 0 && <IntelligenceSection title="Risks"><div className="flex flex-col gap-3">{currentDashboard.risks.map((item: { text?: string; source_nodes?: string[] }, i: number) => <div key={i}><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>{item.text}</p>{item.source_nodes?.length ? <p style={{ margin: '5px 0 0', color: 'var(--text-dim)', fontSize: 10 }}>Evidence: {item.source_nodes.join(', ')}</p> : null}</div>)}</div></IntelligenceSection>}
                {Array.isArray(currentDashboard.opportunities) && currentDashboard.opportunities.length === 0 && <IntelligenceSection title="Opportunities"><p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>No validated opportunities identified.</p></IntelligenceSection>}
              </div>

              {/* Opportunity cards from analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
                {(Array.isArray(currentDashboard.opportunities) ? currentDashboard.opportunities : [])
                  .sort((a, b) => b.urgency_score - a.urgency_score)
                  .map((opp, i) => (
                    <motion.div key={(opp.opportunity_id as string) ?? i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                      <OpportunityCard
                        opportunity={opp as Parameters<typeof OpportunityCard>[0]['opportunity']}
                        initialSaved={savedIds.has(opp.opportunity_id as string) || justSaved.has(opp.opportunity_id as string)}
                        onSaved={(dbId) => {
                          setJustSaved((prev) => new Set([...prev, opp.opportunity_id as string]));
                          load(); // refresh saved list
                          void dbId;
                        }}
                        onExecute={handleExecute}
                      />
                    </motion.div>
                  ))}
              </div>
              </motion.section>
            </>
            )}

          {/* ── Saved from DB ─────────────────────────────────────────────── */}
          {!currentDashboard && saved.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
                Saved Pipeline
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--border-default)' }}>{saved.length} opportunities</span>
            </div>
          )}

          {currentDashboard && saved.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
                Saved Pipeline
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--border-default)' }}>{saved.length} saved</span>
            </div>
          )}

          {/* Stats bar */}
          {!loadingSaved && saved.length > 0 && (
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 20 }}>
              {[
                { label: 'Total Saved', value: saved.length, color: 'var(--text-tertiary)' },
                { label: 'Avg Urgency', value: (saved.reduce((s, r) => s + r.urgency_score, 0) / saved.length).toFixed(1), color: urgencyColor(saved.reduce((s, r) => s + r.urgency_score, 0) / saved.length) },
                { label: 'With Roadmap', value: saved.filter((r) => r.latest_roadmap_id).length, color: 'var(--text-primary)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color, lineHeight: 1, marginBottom: 5 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Execute error */}
          {executeError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }} role="alert">
              <AlertCircle size={14} color="#ff453a" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#ff453a', flex: 1 }}>{executeError}</span>
              <button onClick={() => setExecuteError(null)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ff453a', background: 'transparent', border: '1px solid rgba(255,69,58,0.25)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>Dismiss</button>
            </motion.div>
          )}

          {/* Load error */}
          {loadError && (
            <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '14px 18px', fontFamily: 'var(--font-sans)', fontSize: 13, color: '#ff453a', marginBottom: 24 }} role="alert">
              {loadError}
              <button onClick={load} style={{ marginLeft: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff453a', background: 'transparent', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {/* Skeleton */}
          {loadingSaved && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16, textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookmarkX size={22} color="var(--border-default)" aria-hidden="true" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-dim)', margin: '0 0 6px' }}>No saved opportunities</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: 'var(--border-default)', margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
                  Run an ATIS analysis on a news article, then bookmark the opportunities you want to track here.
                </p>
              </div>
              <Link href="/news" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', marginTop: 4 }}>
                Browse news &rarr; run analysis
              </Link>
            </motion.div>
          )}

          {/* Saved cards grid */}
          {!loadingSaved && saved.length > 0 && (
            <AnimatePresence>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
                {sortedSaved.map((row, i) => {
                  const opp = {
                    ...(row.dashboard_json as object),
                    opportunity_id: row.opportunity_id,
                    title: row.title,
                    type: row.type ?? (row.dashboard_json as Record<string, unknown>)?.type,
                    urgency_score: row.urgency_score,
                    feasibility_score: row.feasibility_score,
                    justification: row.justification,
                    required_missing_nodes: row.required_missing_nodes ?? [],
                    capital_flow: row.capital_flow ?? (row.dashboard_json as Record<string, unknown>)?.capital_flow,
                    intelligence_id: row.intelligence_id,
                    trigger_event: row.trigger_event,
                    source_article_id: row.source_article_id,
                    source_article_headline: row.source_article_headline,
                  } as Parameters<typeof OpportunityCard>[0]['opportunity'];

                  return (
                    <motion.div key={row.id} custom={i} variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                      style={{ opacity: deletingId === row.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                      {/* Row toolbar */}
                      <div className="flex items-center justify-between" style={{ marginBottom: 6, paddingLeft: 3 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)' }}>
                          Saved {formatRelative(row.saved_at)}
                        </span>
                        <div className="flex items-center gap-2">
                          {row.latest_roadmap_id && (
                            <Link href={`/execute/roadmap/${row.latest_roadmap_id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', background: 'var(--bg-control)', border: '1px solid var(--border-active)', borderRadius: 5, padding: '3px 8px', textDecoration: 'none' }}>
                              <BookmarkCheck size={9} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />Roadmap
                            </Link>
                          )}
                          <button onClick={() => router.push(`/execute?opportunity_id=${encodeURIComponent(row.opportunity_id)}&saved_id=${row.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>
                            <Zap size={10} aria-hidden="true" /> Execute
                          </button>
                          <button onClick={() => handleDelete(row.id)} disabled={deletingId === row.id}
                            aria-label={`Remove ${row.title}`} title="Remove from saved"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', color: 'var(--text-dim)', transition: 'color 0.15s, border-color 0.15s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff453a'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.3)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; }}>
                            <Trash2 size={11} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <OpportunityCard
                        opportunity={opp}
                        initialSaved={true}
                        savedDbId={row.id}
                        onDeleted={() => setSaved((prev) => prev.filter((r) => r.id !== row.id))}
                        onExecute={handleExecute}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

        </main>
      </div>
    </AppShell>
  );
}
