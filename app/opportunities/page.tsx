'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Trash2, Zap, BookmarkX, RefreshCw,
  Newspaper, ArrowLeft, Clock, Hash, BookmarkCheck,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { OpportunityCard } from '@/components/opportunity-card';
import { useATIS } from '@/lib/context';
import { executeOpportunity } from '@/lib/api';

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
  return '#30d158';
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
    <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderLeft: '4px solid #1c1c1e', borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ height: 14, width: '70%', background: '#1c1c1e', borderRadius: 4, animation: 'pulse-soft 1.5s infinite' }} />
      <div style={{ height: 3, width: '100%', background: '#1c1c1e', borderRadius: 2, animation: 'pulse-soft 1.5s infinite' }} />
      <div style={{ height: 48, width: '100%', background: '#111111', borderRadius: 6, animation: 'pulse-soft 1.5s infinite' }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OpportunitiesPage() {
  const router = useRouter();
  const { currentDashboard, currentNewsArticle, clearAnalysis } = useATIS();

  // Saved opportunities from DB
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'urgency_score' | 'saved_at'>('urgency_score');

  // Track which in-memory opp_ids have been saved this session
  const [justSaved, setJustSaved] = useState<Set<string>>(new Set());

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
    if (!currentDashboard) return;
    await executeOpportunity({ dashboard_json: currentDashboard, opportunity_id: opportunityId });
  }, [currentDashboard]);

  // ── View: no analysis and no saved items ──────────────────────────────────
  const showEmpty = !loadingSaved && saved.length === 0 && !currentDashboard;

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', background: '#050505', paddingBottom: 80 }}>
        <main className="pt-6 md:pt-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 980, margin: '0 auto' }}>

          {/* ── Page header ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4" style={{ marginBottom: 28 }}>
            <div>
              <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1a6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#525252'; }}>
                  <ChevronLeft size={12} aria-hidden="true" /> Home
                </Link>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1c1c1e' }}>/</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>Opportunities</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 22, color: '#f5f5f7', margin: 0, letterSpacing: '-0.01em' }}>
                Opportunities
              </h1>
              {!loadingSaved && saved.length > 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252', margin: '6px 0 0' }}>
                  {saved.length} saved &middot; sort: {sortBy === 'urgency_score' ? 'urgency' : 'date'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['urgency_score', 'saved_at'] as const).map((opt) => (
                  <button key={opt} onClick={() => setSortBy(opt)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: sortBy === opt ? '#1c1c1e' : 'transparent', color: sortBy === opt ? '#f5f5f7' : '#525252', transition: 'all 0.15s' }}>
                    {opt === 'urgency_score' ? 'Urgency' : 'Recent'}
                  </button>
                ))}
              </div>
              <button onClick={load} aria-label="Refresh" style={{ background: 'transparent', border: '1px solid #1c1c1e', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#525252', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#525252'; }}>
                <RefreshCw size={13} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── In-memory analysis panel ──────────────────────────────────── */}
          {currentDashboard && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
              {/* Analysis header card */}
              <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 14, padding: '20px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#007aff,#5ac8fa)' }} aria-hidden="true" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Current Analysis &middot; {currentDashboard.intelligence_id as string}
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: '#f5f5f7', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {currentDashboard.trigger_event as string}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: '#525252', margin: 0, lineHeight: 1.5 }}>
                      {(currentDashboard.market_equilibrium_shift as string)?.slice(0, 160)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {currentNewsArticle && (
                      <Link href={`/news/${currentNewsArticle.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#007aff', background: 'rgba(0,122,255,0.08)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>
                        <Newspaper size={10} aria-hidden="true" /> Source
                      </Link>
                    )}
                    <button onClick={() => { clearAnalysis(); }} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: 'transparent', border: '1px solid #1c1c1e', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Meta row */}
                {currentDashboard.pipeline_metadata && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {(currentDashboard.pipeline_metadata as Record<string, unknown>).extracted_entities_count != null && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                        <Hash size={9} aria-hidden="true" /> {(currentDashboard.pipeline_metadata as Record<string, unknown>).extracted_entities_count as number} entities
                      </span>
                    )}
                    {(currentDashboard.pipeline_metadata as Record<string, unknown>).processed_at && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#111111', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px' }}>
                        <Clock size={9} aria-hidden="true" /> {formatTimestamp((currentDashboard.pipeline_metadata as Record<string, unknown>).processed_at as string)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Opportunity cards from analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
                {(Array.isArray(currentDashboard.opportunities) ? currentDashboard.opportunities : [])
                  .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.urgency_score as number) - (a.urgency_score as number))
                  .map((opp: Record<string, unknown>, i: number) => (
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
          )}

          {/* ── Saved from DB ─────────────────────────────────────────────── */}
          {!currentDashboard && saved.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#a1a1a6', margin: 0 }}>
                Saved Pipeline
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>{saved.length} opportunities</span>
            </div>
          )}

          {currentDashboard && saved.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#a1a1a6', margin: 0 }}>
                Saved Pipeline
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>{saved.length} saved</span>
            </div>
          )}

          {/* Stats bar */}
          {!loadingSaved && saved.length > 0 && (
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 20 }}>
              {[
                { label: 'Total Saved', value: saved.length, color: '#a1a1a6' },
                { label: 'Avg Urgency', value: (saved.reduce((s, r) => s + r.urgency_score, 0) / saved.length).toFixed(1), color: urgencyColor(saved.reduce((s, r) => s + r.urgency_score, 0) / saved.length) },
                { label: 'With Roadmap', value: saved.filter((r) => r.latest_roadmap_id).length, color: '#30d158' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color, lineHeight: 1, marginBottom: 5 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
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
              <div style={{ width: 52, height: 52, background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookmarkX size={22} color="#333333" aria-hidden="true" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: '#525252', margin: '0 0 6px' }}>No saved opportunities</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#333333', margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
                  Run an ATIS analysis on a news article, then bookmark the opportunities you want to track here.
                </p>
              </div>
              <Link href="/news" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#a1a1a6', background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', marginTop: 4 }}>
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
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333' }}>
                          Saved {formatRelative(row.saved_at)}
                        </span>
                        <div className="flex items-center gap-2">
                          {row.latest_roadmap_id && (
                            <Link href={`/execute/roadmap/${row.latest_roadmap_id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#30d158', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 5, padding: '3px 8px', textDecoration: 'none' }}>
                              <BookmarkCheck size={9} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />Roadmap
                            </Link>
                          )}
                          <button onClick={() => router.push(`/execute?opportunity_id=${encodeURIComponent(row.opportunity_id)}&saved_id=${row.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#a1a1a6', background: 'transparent', border: '1px solid #1c1c1e', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>
                            <Zap size={10} aria-hidden="true" /> Execute
                          </button>
                          <button onClick={() => handleDelete(row.id)} disabled={deletingId === row.id}
                            aria-label={`Remove ${row.title}`} title="Remove from saved"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1c1c1e', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', color: '#525252', transition: 'color 0.15s, border-color 0.15s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ff453a'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,58,0.3)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#525252'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1c1c1e'; }}>
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
