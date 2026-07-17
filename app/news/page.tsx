'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import type { ArticleListItem } from '@/types/article';

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  Policy: '#007aff',
  Infrastructure: '#ff9f0a',
  Trade: '#30d158',
  Finance: '#5ac8fa',
  Energy: '#ffd60a',
  Mining: '#bf5af2',
};

function CategoryBadge({ label }: { label: string }) {
  const color = CATEGORY_COLORS[label] ?? '#737373';
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color,
        background: `${color}1a`,
        border: `1px solid ${color}33`,
        borderRadius: 4,
        padding: '2px 7px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
    </span>
  );
}

function CountryBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#a1a1a6',
        background: '#1c1c1e',
        border: '1px solid #2c2c2e',
        borderRadius: 4,
        padding: '2px 7px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {label}
    </span>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/news/${article.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        style={{
          background: '#0a0a0a',
          border: '1px solid #1c1c1e',
          borderRadius: 12,
          padding: '20px 22px',
          cursor: 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
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
        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 15,
            color: '#f5f5f7',
            lineHeight: 1.4,
            margin: '0 0 10px 0',
          }}
        >
          {article.headline}
        </h2>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 11,
              color: '#525252',
            }}
          >
            {article.source}
          </span>
          <span style={{ color: '#2c2c2e', fontSize: 11 }}>•</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#525252',
            }}
          >
            {relativeTime(article.published_at)}
          </span>
          <span style={{ color: '#2c2c2e', fontSize: 11 }}>•</span>
          <CountryBadge label={article.country_tag} />
          <CategoryBadge label={article.category} />
        </div>

        {/* Summary */}
        {article.summary && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 12,
              color: '#737373',
              lineHeight: 1.55,
              margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {article.summary}
          </p>
        )}
      </article>
    </Link>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          background: '#0a0a0a',
          border: '1px solid #2c2c2e',
          borderRadius: 8,
          padding: '7px 32px 7px 12px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 12,
          color: value ? '#f5f5f7' : '#525252',
          cursor: 'pointer',
          outline: 'none',
        }}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        color="#525252"
        style={{ position: 'absolute', right: 10, pointerEvents: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}

const COUNTRIES = ['Zimbabwe', 'DRC', 'Kenya', 'Nigeria', 'Rwanda', 'Tanzania', 'Uganda', 'South Africa'];
const CATEGORIES = ['Policy', 'Infrastructure', 'Trade', 'Finance', 'Energy', 'Mining'];

export default function NewsPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (country) params.set('country', country);
      if (category) params.set('category', category);
      const res = await fetch(`/api/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail ?? 'Failed to load articles');
      setArticles(Array.isArray(json.articles) ? json.articles : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [country, category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <main
        style={{
          minHeight: '100vh',
          background: '#050505',
          padding: '32px 28px',
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: 28 }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: 22,
                color: '#f5f5f7',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              News Feed
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 13,
                color: '#525252',
                margin: '4px 0 0 0',
              }}
            >
              Live intelligence from monitored markets
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid #2c2c2e',
              borderRadius: 8,
              padding: '7px 14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              color: '#737373',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.borderColor = '#525252';
                (e.currentTarget as HTMLElement).style.color = '#a1a1a6';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2c2c2e';
              (e.currentTarget as HTMLElement).style.color = '#737373';
            }}
            aria-label="Refresh articles"
          >
            <RefreshCw
              size={12}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
          <FilterSelect
            label="All Countries"
            value={country}
            options={COUNTRIES}
            onChange={setCountry}
          />
          <FilterSelect
            label="All Categories"
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
          />
          {(country || category) && (
            <button
              onClick={() => { setCountry(''); setCategory(''); }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 12,
                color: '#525252',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                textDecoration: 'underline',
                textDecorationColor: '#333333',
              }}
            >
              Clear filters
            </button>
          )}
          {!loading && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#333333',
                marginLeft: 'auto',
              }}
            >
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-3"
            style={{
              background: 'rgba(255,69,58,0.08)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 20,
            }}
            role="alert"
          >
            <AlertCircle size={14} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontSize: 13,
                color: '#ff453a',
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 12,
                  padding: '20px 22px',
                  animation: 'pulse-soft 1.5s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    height: 16,
                    width: `${70 + (i % 3) * 10}%`,
                    background: '#1c1c1e',
                    borderRadius: 4,
                    marginBottom: 10,
                  }}
                />
                <div className="flex gap-2" style={{ marginBottom: 10 }}>
                  <div style={{ height: 10, width: 60, background: '#1c1c1e', borderRadius: 3 }} />
                  <div style={{ height: 10, width: 40, background: '#1c1c1e', borderRadius: 3 }} />
                  <div style={{ height: 14, width: 55, background: '#1c1c1e', borderRadius: 4 }} />
                </div>
                <div style={{ height: 10, width: '90%', background: '#1c1c1e', borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 10, width: '70%', background: '#1c1c1e', borderRadius: 3 }} />
              </div>
            ))}
          </div>
        )}

        {/* Article list */}
        {!loading && !error && articles.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-sans)',
              color: '#525252',
              fontSize: 13,
            }}
          >
            No articles found for the selected filters.
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="flex flex-col gap-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
