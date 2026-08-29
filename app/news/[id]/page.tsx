'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { AnalysisLoader } from '@/components/analysis-loader';
import { useATIS } from '@/lib/context';
import { AlertCircle, ChevronRight, Zap } from 'lucide-react';
import type { Article } from '@/types/article';
import NewsIntelligencePanel from '@/components/news-intelligence-panel';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  Policy: '#007aff',
  Infrastructure: '#ff9f0a',
  Trade: '#30d158',
  Finance: '#5ac8fa',
  Energy: '#ffd60a',
  Mining: '#bf5af2',
};

function Badge({ label, color }: { label: string; color: string }) {
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
        padding: '3px 8px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
    </span>
  );
}

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    runAnalysis,
    clearAnalysis,
    analysisLoading,
    analysisProgress,
    analysisStatusText,
    analysisError,
    currentDashboard,
  } = useATIS();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/articles?id=${id}`);
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? 'Article not found');
        setArticle(json.article);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);


  const handleAnalyze = async () => {
    if (!article) return;
    await runAnalysis(article);
  };

  const categoryColor = article
    ? (CATEGORY_COLORS[article.category] ?? 'var(--text-muted)')
    : 'var(--text-muted)';

  return (
    <AppShell>
      {/* Full-screen analysis overlay */}
      {(analysisLoading || !!analysisError) && (
        <AnalysisLoader
          progress={analysisProgress}
          statusText={analysisStatusText}
          error={analysisError}
          onCancel={clearAnalysis}
          onRetry={handleAnalyze}
        />
      )}

      <main
        className="pt-6 md:pt-8"
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1"
          style={{ marginBottom: 28 }}
          aria-label="Breadcrumb"
        >
          <Link
            href="/news"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              color: 'var(--text-dim)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
          >
            News
          </Link>
          {article && (
            <>
              <ChevronRight size={12} color="var(--border-default)" aria-hidden="true" />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 12,
                  color: 'var(--text-dim)',
                }}
              >
                {article.category}
              </span>
              <ChevronRight size={12} color="var(--border-default)" aria-hidden="true" />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {article.headline}
              </span>
            </>
          )}
        </nav>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ animation: 'pulse-soft 1.5s ease-in-out infinite' }}>
            <div
              style={{
                height: 32,
                width: '85%',
                background: 'var(--border-default)',
                borderRadius: 6,
                marginBottom: 14,
              }}
            />
            <div
              style={{
                height: 32,
                width: '60%',
                background: 'var(--border-default)',
                borderRadius: 6,
                marginBottom: 24,
              }}
            />
            <div className="flex gap-2" style={{ marginBottom: 32 }}>
              {[80, 55, 70, 60].map((w, i) => (
                <div
                  key={i}
                  style={{ height: 20, width: w, background: 'var(--border-default)', borderRadius: 4 }}
                />
              ))}
            </div>
            {[100, 95, 88, 100, 80, 92].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 13,
                  width: `${w}%`,
                  background: 'var(--border-default)',
                  borderRadius: 3,
                  marginBottom: 8,
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="flex items-start gap-3"
            style={{
              background: 'rgba(255,69,58,0.08)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: 10,
              padding: '16px 18px',
            }}
            role="alert"
          >
            <AlertCircle size={14} color="#ff453a" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#ff453a',
                  margin: '0 0 4px 0',
                }}
              >
                Failed to load article
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Article content */}
        {!loading && !error && article && (
          <>
            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: 26,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: '0 0 16px 0',
              }}
            >
              {article.headline}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 32 }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 12,
                  color: 'var(--text-dim)',
                }}
              >
                {article.source}
              </span>
              <span style={{ color: 'var(--border-hover)', fontSize: 12 }}>•</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                }}
              >
                {formatDate(article.published_at)}
              </span>
              <Badge label={article.country_tag} color="var(--text-tertiary)" />
              <Badge label={article.category} color={categoryColor} />
            </div>

            {/* Article body */}
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--text-tertiary)',
                marginBottom: 48,
                whiteSpace: 'pre-wrap',
              }}
            >
              {article.article_text}
            </div>

            {/* ATIS Analysis CTA */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 14,
                padding: '24px 26px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle accent line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #007aff, #5ac8fa)',
                }}
                aria-hidden="true"
              />

              <div
                className="flex items-start justify-between gap-4"
                style={{ flexWrap: 'wrap' }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#007aff',
                      margin: '0 0 6px 0',
                    }}
                  >
                    ATIS Intelligence Analysis
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 15,
                      color: 'var(--text-primary)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Analyze this article for market opportunities
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 12,
                      color: 'var(--text-dim)',
                      margin: 0,
                      maxWidth: 380,
                      lineHeight: 1.55,
                    }}
                  >
                    Extract structural market opportunities, supply chain gaps, and
                    investment openings using the ATIS constraint analysis pipeline.
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analysisLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#007aff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 22px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    cursor: analysisLoading ? 'not-allowed' : 'pointer',
                    opacity: analysisLoading ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!analysisLoading)
                      (e.currentTarget as HTMLElement).style.background = '#0062cc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#007aff';
                  }}
                >
                  <Zap size={14} aria-hidden="true" />
                  Run Opportunity Analysis
                </button>
              </div>
            </div>

            {currentDashboard && <NewsIntelligencePanel dashboard={currentDashboard} />}
          </>
        )}
      </main>
    </AppShell>
  );
}
