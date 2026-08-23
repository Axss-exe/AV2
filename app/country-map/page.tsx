'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { CountryCard } from '@/components/country-card';
import { CountryModal } from '@/components/country-modal';
import { ErrorState } from '@/components/error-state';
import { getCountries } from '@/lib/data';
import { STAT_CATEGORIES, countryStatsMock, type StatCategoryKey } from '@/lib/country-stats-mock';
import type { Country } from '@/lib/types';

// Dynamically import the outline map to avoid SSR issues with react-simple-maps
const CountryOutlineMap = dynamic(
  () => import('@/components/country-outline-map').then((m) => m.CountryOutlineMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Loading outline...
        </span>
      </div>
    ),
  }
);

const REGION_FILTERS = ['All', 'East Africa', 'West Africa', 'Southern Africa'];

export default function CountryMapPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'map' | 'cards'>('map');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<StatCategoryKey>('agriculture');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCountries();
      setCountries(data);
      if (data.length > 0) {
        setSelectedId((prev) => prev ?? data[0].id);
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = countries.filter(
    (c) => activeRegion === 'All' || c.region === activeRegion
  );

  // Keep the outline selection valid whenever the region filter changes
  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegion, countries]);

  const activeCountry = useMemo(
    () => countries.find((c) => c.id === selectedId) || null,
    [countries, selectedId]
  );

  const activeStats = activeCountry ? countryStatsMock[activeCountry.id] : undefined;
  const activeMetrics = activeStats ? activeStats[activeCategory] : [];

  const openCountry = (country: Country) => {
    setSelectedCountry(country);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div className="pt-6 md:pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 24,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                Country Map
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              >
                Intelligence profiles for {countries.length || 8} monitored African markets
              </p>
            </div>

            {/* View toggle */}
            <div
              className="flex"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: 3,
              }}
              role="tablist"
              aria-label="Map view toggle"
            >
              {(['map', 'cards'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  role="tab"
                  aria-selected={activeView === v}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                    color: activeView === v ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: activeView === v ? 'var(--border-default)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 32,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Region Filter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {REGION_FILTERS.map((region) => {
            const isActive = activeRegion === region;
            return (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isActive ? 'var(--border-hover)' : 'var(--border-default)',
                  border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`,
                  borderRadius: 8,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: 32,
                }}
              >
                {region}
              </button>
            );
          })}
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : activeView === 'map' ? (
          /* ── SINGLE-COUNTRY OUTLINE + FILTERABLE STATS ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4"
          >
            {/* Outline panel */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Country selector chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {filtered.map((c) => {
                  const isActive = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 11,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        background: isActive ? 'var(--border-hover)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--border-default)' : 'var(--border-default)'}`,
                        borderRadius: 8,
                        padding: '5px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span aria-hidden="true">{c.flag}</span>
                      {c.name}
                    </button>
                  );
                })}
              </div>

              {/* Outline render */}
              <div
                style={{
                  flex: 1,
                  minHeight: 'clamp(260px, 40vw, 420px)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <AnimatePresence mode="wait">
                  {selectedId && activeCountry && (
                    <motion.div
                      key={selectedId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <CountryOutlineMap countryId={activeCountry.id} countryName={activeCountry.name} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected country header */}
              {activeCountry && (
                <div className="flex items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 22 }} aria-hidden="true">{activeCountry.flag}</span>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 16,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {activeCountry.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 400,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {activeCountry.region} &middot; {activeCountry.capital}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openCountry(activeCountry)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      color: 'var(--text-primary)',
                      background: 'var(--border-default)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--border-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--border-default)'; }}
                  >
                    Full Profile
                  </button>
                </div>
              )}
            </div>

            {/* Stats filter panel */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  marginBottom: 12,
                }}
              >
                Filter Statistics
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {STAT_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        background: isActive ? 'var(--border-hover)' : 'var(--border-default)',
                        border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`,
                        borderRadius: 8,
                        padding: '5px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Metrics list */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedId}-${activeCategory}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2"
                >
                  {activeMetrics.length === 0 ? (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 13,
                        color: 'var(--text-dim)',
                      }}
                    >
                      No data available for this category.
                    </p>
                  ) : (
                    activeMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 500,
                              fontSize: 11,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {metric.label}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 700,
                              fontSize: 13,
                              color: 'var(--text-primary)',
                              textAlign: 'right',
                            }}
                          >
                            {metric.value}
                          </span>
                        </div>
                        {metric.note && (
                          <div
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 300,
                              fontSize: 11,
                              color: 'var(--text-dim)',
                              marginTop: 3,
                            }}
                          >
                            {metric.note}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* ── CARD VIEW ── */
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            {loading ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 110,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12,
                      animation: 'pulse-soft 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {filtered.map((country, i) => (
                  <CountryCard
                    key={country.id}
                    country={country}
                    index={i}
                    onClick={() => openCountry(country)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Country Detail Modal */}
      <CountryModal
        country={selectedCountry}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppShell>
  );
}
