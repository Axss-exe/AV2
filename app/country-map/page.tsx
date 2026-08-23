'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { CountryCard } from '@/components/country-card';
import { CountryModal } from '@/components/country-modal';
import { ErrorState } from '@/components/error-state';
import { getCountries } from '@/lib/data';
import type { Country } from '@/lib/types';

// Dynamically import the Leaflet map to avoid SSR issues
const AfricaMap = dynamic(
  () => import('@/components/africa-map').then((m) => m.AfricaMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--bg-surface)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Loading map...
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCountries();
      setCountries(data);
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

  const openCountry = (countryNameOrObj: Country | string) => {
    if (typeof countryNameOrObj === 'string') {
      const found = countries.find((c) => c.name === countryNameOrObj);
      if (found) {
        setSelectedCountry(found);
        setModalOpen(true);
      }
    } else {
      setSelectedCountry(countryNameOrObj);
      setModalOpen(true);
    }
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
          /* ── INTERACTIVE LEAFLET MAP ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 16,
              overflow: 'hidden',
              height: 'clamp(300px, 50vw, 520px)',
            }}
          >
            <AfricaMap onCountryClick={openCountry} />
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

        {/* Legend */}
        {activeView === 'map' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-6 mt-4"
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  border: '1.5px solid var(--border-default)',
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                Monitored Market — hover for summary, click for full profile
              </span>
            </div>
          </motion.div>
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
