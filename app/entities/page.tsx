'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EntityCard } from '@/components/entity-card';
import { EntitySearch } from '@/components/entity-search';
import { useEntities } from '@/components/entity-provider';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        height: 190,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        animation: 'pulse-soft 1.5s infinite',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EntitiesPage() {
  const { entities, isLoading, error, searchEntities, refetch } = useEntities();
  const [query, setQuery] = useState('');

  const filtered = searchEntities(query);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, delay: Math.min(i * 0.03, 0.5), ease: [0.4, 0, 0.2, 1] as number[] },
    }),
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
  };

  return (
    <AppShell>
      <div className="pt-6 md:pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 24 }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            Entity Directory
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            {isLoading
              ? 'Loading vault profiles...'
              : error
              ? 'Failed to load entity vault'
              : `Zimbabwe vault — ${entities.length} entity profiles`}
          </p>
        </motion.div>

        {/* Search bar */}
        {!error && !isLoading && entities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{ marginBottom: 28 }}
          >
            <EntitySearch
              total={entities.length}
              resultCount={filtered.length}
              onSearch={handleSearch}
            />
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(255,69,58,0.07)',
              border: '1px solid rgba(255,69,58,0.18)',
              borderRadius: 12,
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#ff453a',
                  marginBottom: 4,
                }}
              >
                Failed to load entity vault
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 300,
                  fontSize: 11,
                  color: 'var(--text-dim)',
                }}
              >
                {error.message}
              </p>
            </div>
            <button
              onClick={refetch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 11,
                color: '#ff453a',
                background: 'rgba(255,69,58,0.12)',
                border: '1px solid rgba(255,69,58,0.25)',
                borderRadius: 7,
                padding: '7px 14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <RefreshCw size={11} aria-hidden="true" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}
          >
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && entities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--text-dim)',
              }}
            >
              No profiles found in vault.
            </p>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && !error && entities.length > 0 && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--text-dim)',
              }}
            >
              No entities matching &ldquo;{query}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((entity, i) => (
                <motion.div
                  key={entity.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  layout
                  style={{ height: '100%' }}
                >
                  <EntityCard
                    entity={entity}
                    variant="full"
                    searchQuery={query}
                    asLink
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
