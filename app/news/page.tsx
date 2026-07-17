'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Rss,
} from 'lucide-react';
import type { ArticleListItem } from '@/types/article';

/* ─────────────────────────────── helpers ─── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CATEGORY_COLORS: Record<string, { fg: string; bg: string; border: string }> = {
  Policy:         { fg: '#007aff', bg: 'rgba(0,122,255,0.1)',   border: 'rgba(0,122,255,0.25)' },
  Infrastructure: { fg: '#ff9f0a', bg: 'rgba(255,159,10,0.1)',  border: 'rgba(255,159,10,0.25)' },
  Trade:          { fg: '#30d158', bg: 'rgba(48,209,88,0.1)',   border: 'rgba(48,209,88,0.25)' },
  Finance:        { fg: '#5ac8fa', bg: 'rgba(90,200,250,0.1)',  border: 'rgba(90,200,250,0.25)' },
  Energy:         { fg: '#ffd60a', bg: 'rgba(255,214,10,0.1)',  border: 'rgba(255,214,10,0.25)' },
  Mining:         { fg: '#bf5af2', bg: 'rgba(191,90,242,0.1)',  border: 'rgba(191,90,242,0.25)' },
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { fg: '#737373', bg: 'rgba(115,115,115,0.1)', border: 'rgba(115,115,115,0.25)' };
}

/* ─────────────────────────────── badges ─── */

function CategoryBadge({ label }: { label: string }) {
  const c = categoryColor(label);
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: c.fg, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  );
}

function CountryBadge({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#a1a1a6', background: '#1c1c1e', border: '1px solid #2c2c2e', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  );
}

/* ─────────────────────────────── carousel ─── */

const CAROUSEL_INTERVAL = 5000;

function CarouselHero({ articles }: { articles: ArticleListItem[] }) {
  const top5 = articles.slice(0, 5);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setActive((idx + top5.length) % top5.length);
    setProgress(0);
  }, [top5.length]);

  // Auto-advance + progress bar
  useEffect(() => {
    if (top5.length <= 1) return;

    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    const TICK = 50; // ms per progress tick
    const steps = CAROUSEL_INTERVAL / TICK;

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / steps, 100));
    }, TICK);

    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % top5.length);
      setProgress(0);
    }, CAROUSEL_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [active, top5.length]);

  if (top5.length === 0) return null;

  const article = top5[active];
  const cc = categoryColor(article.category);

  return (
    <div
      style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
      }}
      role="region"
      aria-label="Featured articles carousel"
      aria-roledescription="carousel"
    >
      {/* Category accent stripe */}
      <div style={{ height: 3, background: cc.fg, transition: 'background 0.4s ease' }} aria-hidden="true" />

      {/* Progress bar */}
      <div style={{ height: 2, background: '#1c1c1e', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            background: cc.fg,
            opacity: 0.5,
            transition: 'width 0.05s linear',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8" aria-live="polite" aria-atomic="true">
        {/* Label row */}
        <div className="flex items-center gap-2 mb-4">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 600,
              color: '#525252',
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            FEATURED · {active + 1} / {top5.length}
          </span>
          <div style={{ flex: 1, height: 1, background: '#1c1c1e' }} aria-hidden="true" />
          <CategoryBadge label={article.category} />
          <CountryBadge label={article.country_tag} />
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 'clamp(18px, 3vw, 26px)',
            color: '#f5f5f7',
            lineHeight: 1.3,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            maxWidth: 720,
          }}
        >
          {article.headline}
        </h2>

        {/* Summary */}
        {article.summary && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: '#737373',
              lineHeight: 1.6,
              margin: '0 0 24px 0',
              maxWidth: 640,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
            }}
          >
            {article.summary}
          </p>
        )}

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#525252', fontWeight: 400 }}>
              {article.source}
            </span>
            <span style={{ color: '#2c2c2e' }} aria-hidden="true">·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>
              {relativeTime(article.published_at)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel position">
              {top5.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Article ${i + 1}`}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === active ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === active ? cc.fg : '#2c2c2e',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.3s ease, background 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(active - 1)}
                aria-label="Previous article"
                style={{ width: 30, height: 30, borderRadius: 8, background: '#1c1c1e', border: '1px solid #2c2c2e', cursor: 'pointer', color: '#a1a1a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <button
                onClick={() => goTo(active + 1)}
                aria-label="Next article"
                style={{ width: 30, height: 30, borderRadius: 8, background: '#1c1c1e', border: '1px solid #2c2c2e', cursor: 'pointer', color: '#a1a1a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>

            {/* Read button */}
            <Link
              href={`/news/${article.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: cc.fg,
                color: '#000000',
                borderRadius: 8,
                padding: '7px 14px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 12,
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
              aria-label={`Read article: ${article.headline}`}
            >
              Read
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── stats bar ─── */

function StatsBar({ articles }: { articles: ArticleListItem[] }) {
  const categories = new Set(articles.map((a) => a.category)).size;
  const countries  = new Set(articles.map((a) => a.country_tag)).size;

  return (
    <div
      className="grid grid-cols-3 gap-px mb-8"
      style={{ background: '#1c1c1e', borderRadius: 12, overflow: 'hidden', border: '1px solid #1c1c1e' }}
      aria-label="News summary statistics"
    >
      {[
        { label: 'Articles',   value: articles.length },
        { label: 'Categories', value: categories },
        { label: 'Countries',  value: countries },
      ].map(({ label, value }) => (
        <div
          key={label}
          style={{ background: '#0a0a0a', padding: '16px 20px' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: '#f5f5f7', lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 11, color: '#525252', marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── article card ─── */

function ArticleCard({ article }: { article: ArticleListItem }) {
  const cc = categoryColor(article.category);
  return (
    <Link href={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          background: '#0a0a0a',
          border: '1px solid #1c1c1e',
          borderLeft: `3px solid ${cc.fg}`,
          borderRadius: 12,
          padding: '18px 20px',
          cursor: 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#111111';
          (e.currentTarget as HTMLElement).style.borderColor = '#2c2c2e';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#0a0a0a';
          (e.currentTarget as HTMLElement).style.borderColor = '#1c1c1e';
        }}
      >
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 10 }}>
          <CategoryBadge label={article.category} />
          <CountryBadge label={article.country_tag} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333333', marginLeft: 'auto' }}>
            {relativeTime(article.published_at)}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 13,
            color: '#f5f5f7',
            lineHeight: 1.45,
            margin: '0 0 8px 0',
          }}
        >
          {article.headline}
        </h3>

        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#525252' }}>
            {article.source}
          </span>
          <ArrowUpRight size={12} color="#333333" aria-hidden="true" />
        </div>
      </article>
    </Link>
  );
}

/* ─────────────────────────────── filter select ─── */

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ appearance: 'none', background: '#0a0a0a', border: '1px solid #2c2c2e', borderRadius: 8, padding: '7px 32px 7px 12px', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: value ? '#f5f5f7' : '#525252', cursor: 'pointer', outline: 'none' }}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} color="#525252" style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} aria-hidden="true" />
    </div>
  );
}

/* ─────────────────────────────── skeleton ─── */

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Carousel skeleton */}
      <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 16, height: 260, animation: 'pulse-soft 1.5s ease-in-out infinite' }} />
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-px" style={{ borderRadius: 12, overflow: 'hidden', height: 72, background: '#1c1c1e' }}>
        {[1, 2, 3].map((i) => <div key={i} style={{ background: '#0a0a0a', animation: 'pulse-soft 1.5s ease-in-out infinite' }} />)}
      </div>
      {/* Cards skeleton */}
      <div style={{ height: 24, marginTop: 12 }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 12, height: 120, animation: 'pulse-soft 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── constants ─── */

const COUNTRIES = ['Zimbabwe', 'DRC', 'Kenya', 'Nigeria', 'Rwanda', 'Tanzania', 'Uganda', 'South Africa'];
const CATEGORIES = ['Policy', 'Infrastructure', 'Trade', 'Finance', 'Energy', 'Mining'];

/* ─────────────────────────────── page ─── */

export default function NewsPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [country, setCountry]   = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (country)  params.set('country', country);
      if (category) params.set('category', category);
      const res  = await fetch(`/api/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail ?? 'Failed to load articles');
      setArticles(Array.isArray(json.articles) ? json.articles : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [country, category]);

  useEffect(() => { load(); }, [load]);

  // Filtered list used below the carousel
  const filtered = articles.filter((a) => {
    if (country  && a.country_tag !== country)  return false;
    if (category && a.category    !== category) return false;
    return true;
  });

  const hasFilters = !!(country || category);

  return (
    <AppShell>
      <div className="pt-6 md:pt-8" style={{ minHeight: '100vh', background: '#050505' }}>
        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div
              style={{ width: 32, height: 32, background: '#1c1c1e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-hidden="true"
            >
              <Rss size={14} color="#737373" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#f5f5f7', margin: 0, letterSpacing: '-0.01em' }}>
                News Dashboard
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: '#525252', margin: 0 }}>
                Live intelligence from monitored markets
              </p>
            </div>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2"
            style={{ background: 'transparent', border: '1px solid #2c2c2e', borderRadius: 8, padding: '7px 14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: '#737373', transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.borderColor = '#525252'; (e.currentTarget as HTMLElement).style.color = '#a1a1a6'; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2c2c2e'; (e.currentTarget as HTMLElement).style.color = '#737373'; }}
            aria-label="Refresh articles"
          >
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="flex items-start gap-3 mb-6"
            style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '14px 16px' }}
            role="alert"
          >
            <AlertCircle size={14} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: '#ff453a', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <Skeleton />}

        {/* ── Dashboard content ── */}
        {!loading && !error && (
          <>
            {/* Hero carousel — always uses unfiltered top 5 */}
            {articles.length > 0 && <CarouselHero articles={articles} />}

            {/* Stats bar */}
            <StatsBar articles={articles} />

            {/* Section header + filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#a1a1a6', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
                  All Articles
                </h2>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#333333' }}>
                  {filtered.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect label="All Countries" value={country}  options={COUNTRIES}  onChange={setCountry} />
                <FilterSelect label="All Categories" value={category} options={CATEGORIES} onChange={setCategory} />
                {hasFilters && (
                  <button
                    onClick={() => { setCountry(''); setCategory(''); }}
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: '#525252', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#333333', padding: '4px 0' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--font-sans)', color: '#525252', fontSize: 13 }}>
                No articles match the selected filters.
              </div>
            )}

            {/* Cards grid */}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-10">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
