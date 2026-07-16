'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { HeroArticle } from '@/components/hero-article';
import { ArticleCard } from '@/components/article-card';
import { ArticleModal } from '@/components/article-modal';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { getArticles } from '@/lib/data';
import { processNewsArticle, APIError } from '@/lib/api';
import { useATIS } from '@/lib/context';
import type { Article } from '@/lib/types';
import type { NewsAPIResponse, NewsOpportunity } from '@/lib/api';

const COUNTRIES = ['Kenya', 'Tanzania', 'Nigeria', 'Ghana', 'Ethiopia', 'Rwanda', 'Uganda', 'Zimbabwe'];
const SECTORS = ['Agriculture', 'Energy', 'Logistics', 'Manufacturing', 'Technology', 'Mining'];

// ---- Urgency colour helpers ----
function urgencyColor(urgency?: string): string {
  if (!urgency) return '#737373';
  const u = urgency.toLowerCase();
  if (u.includes('high') || u.includes('critical')) return '#ff453a';
  if (u.includes('medium') || u.includes('moderate')) return '#ff9f0a';
  return '#30d158';
}

// ---- Single news opportunity card ----
function NewsOpportunityCard({ opp, index }: { opp: NewsOpportunity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        padding: 18,
        minWidth: 260,
        maxWidth: 280,
        flexShrink: 0,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#333333';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c1e';
      }}
    >
      {/* Urgency badge */}
      {opp.urgency && (
        <div className="flex items-center gap-2 mb-3">
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 10,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              color: urgencyColor(opp.urgency),
              background: '#1c1c1e',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            {opp.urgency} urgency
          </span>
          {opp.feasibility && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 10,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: '#a1a1a6',
                background: '#1c1c1e',
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {opp.feasibility}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 13,
          color: '#ffffff',
          lineHeight: 1.4,
          marginBottom: 8,
        }}
      >
        {opp.title ?? 'Untitled Opportunity'}
      </h4>

      {/* Description */}
      {opp.description && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 12,
            color: '#a1a1a6',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {opp.description}
        </p>
      )}

      {/* Markets */}
      {opp.markets && opp.markets.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {opp.markets.map((m) => (
            <span
              key={m}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 10,
                color: '#737373',
                background: '#111111',
                borderRadius: 4,
                padding: '2px 6px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---- Opportunity results block ----
function OpportunityResults({
  result,
  articleTitle,
}: {
  result: NewsAPIResponse;
  articleTitle: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const opps = result.opportunities ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {/* Summary header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c1c1e' }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: '#525252',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
          }}
        >
          Intelligence — {articleTitle}
        </div>
        {(result.core_event ?? result.trigger_event) && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 13,
              color: '#ffffff',
              marginBottom: 4,
              lineHeight: 1.45,
            }}
          >
            {result.core_event ?? result.trigger_event}
          </p>
        )}
        {result.market_equilibrium_shift && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 12,
              color: '#737373',
              lineHeight: 1.5,
            }}
          >
            {result.market_equilibrium_shift}
          </p>
        )}
      </div>

      {/* Opportunity cards — horizontal scroll */}
      {opps.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto"
          style={{ padding: '16px 20px', scrollbarWidth: 'none' }}
        >
          {opps.map((opp, i) => (
            <NewsOpportunityCard key={i} opp={opp} index={i} />
          ))}
        </div>
      ) : (
        <p
          style={{
            padding: '16px 20px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 13,
            color: '#525252',
          }}
        >
          No specific opportunities identified in this article.
        </p>
      )}
    </motion.div>
  );
}

// ---- Main page ----
export default function NewsroomPage() {
  const { selectedArticle, setSelectedArticle, articleModalOpen, setArticleModalOpen } = useATIS();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [activeSectors, setActiveSectors] = useState<string[]>([]);

  // Per-article opportunity state: map articleId -> state
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processError, setProcessError] = useState<Record<string, string>>({});
  const [opportunityResults, setOpportunityResults] = useState<Record<string, NewsAPIResponse>>({});
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticles();
      setArticles(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const heroArticle = articles.find((a) => a.is_hero);
  const nonHeroArticles = articles.filter((a) => !a.is_hero);

  const filtered = nonHeroArticles.filter((a) => {
    const matchCountry = activeCountries.length === 0 || activeCountries.includes(a.category_country);
    const matchSector = activeSectors.length === 0 || activeSectors.includes(a.category_sector);
    return matchCountry && matchSector;
  });

  const toggleCountry = (c: string) =>
    setActiveCountries((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const toggleSector = (s: string) =>
    setActiveSectors((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const clearFilters = () => { setActiveCountries([]); setActiveSectors([]); };
  const hasFilters = activeCountries.length > 0 || activeSectors.length > 0;

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setArticleModalOpen(true);
  };

  const handleSelectArticle = (article: Article) => {
    // Toggle expand/collapse for opportunity zone
    setExpandedArticleId((prev) => prev === article.id ? null : article.id);
    setProcessError((prev) => ({ ...prev, [article.id]: '' }));
  };

  const handleFindOpportunities = async (article: Article) => {
    if (processingId === article.id) return;
    if (!article.content || article.content.trim().length < 30) {
      setProcessError((prev) => ({
        ...prev,
        [article.id]: 'Article text is too short to process. Please select a different article.',
      }));
      return;
    }

    setProcessingId(article.id);
    setProcessError((prev) => ({ ...prev, [article.id]: '' }));

    try {
      const result = await processNewsArticle({ article_text: article.content });
      setOpportunityResults((prev) => ({ ...prev, [article.id]: result }));
    } catch (err: unknown) {
      const msg =
        err instanceof APIError
          ? err.message
          : 'Failed to process article. Please try again.';
      setProcessError((prev) => ({ ...prev, [article.id]: msg }));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell>
      <div style={{ paddingTop: 40 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: '#ffffff',
              marginBottom: 4,
            }}
          >
            Newsroom
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: '#737373',
            }}
          >
            Intelligence briefings and market analysis — select an article to detect opportunities
          </p>
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <div>
            <div
              style={{
                height: 320,
                background: '#0a0a0a',
                border: '1px solid #1c1c1e',
                borderRadius: 16,
                marginBottom: 24,
                animation: 'pulse-soft 1.5s infinite',
              }}
            />
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 240,
                    background: '#0a0a0a',
                    border: '1px solid #1c1c1e',
                    borderRadius: 14,
                    animation: 'pulse-soft 1.5s infinite',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Article */}
            {heroArticle && (
              <div
                onClick={() => handleSelectArticle(heroArticle)}
                style={{ cursor: 'pointer' }}
              >
                <HeroArticle
                  article={heroArticle}
                  onClick={() => openArticle(heroArticle)}
                />
              </div>
            )}

            {/* Opportunity results for hero (if expanded) */}
            <AnimatePresence>
              {heroArticle && expandedArticleId === heroArticle.id && (
                <ArticleOpportunityZone
                  article={heroArticle}
                  processingId={processingId}
                  processError={processError}
                  opportunityResults={opportunityResults}
                  onFindOpportunities={handleFindOpportunities}
                />
              )}
            </AnimatePresence>

            {/* Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <button
                onClick={clearFilters}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: !hasFilters ? '#ffffff' : '#a1a1a6',
                  background: !hasFilters ? '#2c2c2e' : '#1c1c1e',
                  border: '1px solid transparent',
                  borderRadius: 8,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: 32,
                }}
              >
                All
              </button>

              {COUNTRIES.map((c) => {
                const active = activeCountries.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      color: active ? '#ffffff' : '#a1a1a6',
                      background: active ? '#2c2c2e' : '#1c1c1e',
                      border: `1px solid ${active ? '#333333' : 'transparent'}`,
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 32,
                    }}
                  >
                    {c}
                  </button>
                );
              })}

              <div style={{ width: 1, height: 20, background: '#1c1c1e', margin: '0 4px' }} />

              {SECTORS.map((s) => {
                const active = activeSectors.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSector(s)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      color: active ? '#ff9f0a' : '#a1a1a6',
                      background: active ? '#2c2c2e' : '#1c1c1e',
                      border: `1px solid ${active ? '#ff9f0a' : 'transparent'}`,
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 32,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </motion.div>

            {/* Article Grid */}
            {filtered.length === 0 ? (
              <EmptyState
                title="No articles match this filter"
                description="Try adjusting your country or sector criteria."
              />
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((article) => (
                  <div key={article.id}>
                    {/* Article card — clicking highlights and reveals opportunity zone */}
                    <div
                      style={{
                        borderRadius: 14,
                        outline: expandedArticleId === article.id ? '2px solid #333333' : 'none',
                        outlineOffset: 2,
                        transition: 'outline 0.2s',
                      }}
                      onClick={() => handleSelectArticle(article)}
                    >
                      <ArticleCard
                        article={article}
                        index={0}
                        onClick={() => openArticle(article)}
                      />
                    </div>

                    {/* Opportunity zone — shown when this article is expanded */}
                    <AnimatePresence>
                      {expandedArticleId === article.id && (
                        <ArticleOpportunityZone
                          article={article}
                          processingId={processingId}
                          processError={processError}
                          opportunityResults={opportunityResults}
                          onFindOpportunities={handleFindOpportunities}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Modal */}
      <ArticleModal
        article={selectedArticle}
        open={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
      />
    </AppShell>
  );
}

// ---- Opportunity zone sub-component ----
interface ArticleOpportunityZoneProps {
  article: Article;
  processingId: string | null;
  processError: Record<string, string>;
  opportunityResults: Record<string, NewsAPIResponse>;
  onFindOpportunities: (article: Article) => void;
}

function ArticleOpportunityZone({
  article,
  processingId,
  processError,
  opportunityResults,
  onFindOpportunities,
}: ArticleOpportunityZoneProps) {
  const isProcessing = processingId === article.id;
  const error = processError[article.id];
  const result = opportunityResults[article.id];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden', marginTop: 8 }}
    >
      <div style={{ paddingBottom: 4 }}>
        {/* Show results if already processed */}
        {result ? (
          <OpportunityResults result={result} articleTitle={article.title} />
        ) : (
          /* Find Opportunities button / processing state */
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #1c1c1e',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 8,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 13,
                    color: '#d1d1d6',
                    marginBottom: 3,
                  }}
                >
                  {isProcessing ? 'Searching for opportunities...' : 'Article selected'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 12,
                    color: '#525252',
                  }}
                >
                  {isProcessing
                    ? 'The intelligence pipeline is analyzing market signals...'
                    : 'Run the intelligence pipeline to extract trade opportunities from this article.'}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFindOpportunities(article);
                }}
                disabled={isProcessing}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 12,
                  color: isProcessing ? '#525252' : '#000000',
                  background: isProcessing ? '#1c1c1e' : '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#d1d1d6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                  }
                }}
                aria-label="Find opportunities in this article"
              >
                {isProcessing ? (
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                ) : (
                  <Zap size={13} aria-hidden="true" />
                )}
                {isProcessing ? 'Processing...' : 'Find Opportunities'}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 mt-4"
                style={{
                  background: 'rgba(255,69,58,0.08)',
                  border: '1px solid rgba(255,69,58,0.25)',
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
                role="alert"
              >
                <AlertCircle size={14} color="#ff453a" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: 12,
                    color: '#ff453a',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
