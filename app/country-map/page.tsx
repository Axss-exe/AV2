'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { CountryCard } from '@/components/country-card';
import { CountryModal } from '@/components/country-modal';
import { ErrorState } from '@/components/error-state';
import { getCountries } from '@/lib/data';
import type { Country } from '@/lib/types';

const REGION_FILTERS = ['All', 'East Africa', 'West Africa'];

export default function CountryMapPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const openCountry = (country: Country) => {
    setSelectedCountry(country);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div style={{ paddingTop: 40 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: '#ffffff',
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
              color: '#737373',
            }}
          >
            Intelligence profiles for {countries.length} monitored African markets
          </p>
        </motion.div>

        {/* Region Filter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex gap-2 mb-6"
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
                  color: isActive ? '#ffffff' : '#a1a1a6',
                  background: isActive ? '#2c2c2e' : '#1c1c1e',
                  border: `1px solid ${isActive ? '#333333' : 'transparent'}`,
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
        ) : (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #1c1c1e',
              borderRadius: 16,
              padding: 24,
            }}
          >
            {loading ? (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              >
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 110,
                      background: '#000000',
                      border: '1px solid #1c1c1e',
                      borderRadius: 12,
                      animation: 'pulse-soft 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
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
