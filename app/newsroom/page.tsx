'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { HeroArticle } from '@/components/hero-article';
import { ArticleCard } from '@/components/article-card';
import { ArticleModal } from '@/components/article-modal';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { getArticles } from '@/lib/data';
import { useATIS } from '@/lib/context';
import type { Article } from '@/lib/types';

const COUNTRIES = ['Kenya', 'Tanzania', 'Nigeria', 'Ghana', 'Ethiopia', 'Rwanda', 'Uganda'];
const SECTORS = ['Agriculture', 'Energy', 'Logistics', 'Manufacturing', 'Technology'];

export default function NewsroomPage() {
  const { selectedArticle, setSelectedArticle, articleModalOpen, setArticleModalOpen } = useATIS();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [activeSectors, setActiveSectors] = useState<string[]>([]);

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

  const toggleCountry = (c: string) => {
    setActiveCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };
  const toggleSector = (s: string) => {
    setActiveSectors((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setArticleModalOpen(true);
  };

  const clearFilters = () => {
    setActiveCountries([]);
    setActiveSectors([]);
  };

  const hasFilters = activeCountries.length > 0 || activeSectors.length > 0;

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
            Intelligence briefings and market analysis from across Africa
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
              <HeroArticle article={heroArticle} onClick={() => openArticle(heroArticle)} />
            )}

            {/* Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              {/* All chip */}
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

              {/* Country chips */}
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

              {/* Sector chips */}
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
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
              >
                {filtered.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={i}
                    onClick={() => openArticle(article)}
                  />
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
