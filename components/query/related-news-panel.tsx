'use client';

import useSWR from 'swr';
import { ArrowUpRight, Rss } from 'lucide-react';
import type { ArticleListItem } from '@/types/article';

interface RelatedNewsPanelProps {
  countries: string[]; // perspective country + source countries, already deduped by caller
  onSelect: (article: ArticleListItem) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Policy: '#007aff',
  Infrastructure: '#ff9f0a',
  Trade: '#30d158',
  Finance: '#5ac8fa',
  Energy: '#ffd60a',
  Mining: '#bf5af2',
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? 'var(--text-dim)';
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function fetchArticlesForCountries(countries: string[]): Promise<ArticleListItem[]> {
  const results = await Promise.all(
    countries.map(async (country) => {
      const res = await fetch(`/api/articles?${new URLSearchParams({ country }).toString()}`);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.articles) ? (json.articles as ArticleListItem[]) : [];
    })
  );
  const merged = new Map<number, ArticleListItem>();
  for (const list of results) {
    for (const a of list) merged.set(a.id, a);
  }
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export function RelatedNewsPanel({ countries, onSelect }: RelatedNewsPanelProps) {
  const key = countries.length > 0 ? ['related-news', ...countries.slice().sort()] : null;
  const { data: articles, isLoading } = useSWR(key, () => fetchArticlesForCountries(countries), {
    revalidateOnFocus: false,
  });

  if (countries.length === 0) return null;
  if (!isLoading && (!articles || articles.length === 0)) return null;

  const shown = (articles ?? []).slice(0, 4);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <Rss size={12} color="var(--text-dim)" aria-hidden="true" />
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Related News
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                height: 84,
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                animation: 'pulse-soft 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((article) => {
            const color = categoryColor(article.category);
            return (
              <button
                key={article.id}
                onClick={() => onSelect(article)}
                className="flex flex-col gap-2 text-left"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 12,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)';
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 9,
                      color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {article.category}
                  </span>
                  <span style={{ color: 'var(--border-hover)', fontSize: 9 }} aria-hidden="true">·</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--text-dim)',
                    }}
                  >
                    {article.country_tag}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--border-default)',
                      marginLeft: 'auto',
                    }}
                  >
                    {relativeTime(article.published_at)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {article.headline}
                  </h4>
                  <ArrowUpRight size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    margin: 0,
                  }}
                >
                  {article.source}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
