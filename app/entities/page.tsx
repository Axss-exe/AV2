'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { EntityProfile } from '@/components/entity-profile';
import { fetchEntities, APIError } from '@/lib/api';
import { getEntities } from '@/lib/data';
import type { Entity } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  regulatory: '#a1a1a6',
  infrastructure: '#30d158',
  logistics: '#ff9f0a',
  legal: '#d1d1d6',
  partner: '#ffffff',
  risk: '#ff453a',
};

const ALL_TYPES: Entity['type'][] = [
  'regulatory',
  'infrastructure',
  'logistics',
  'legal',
  'partner',
  'risk',
];

interface DisplayEntity {
  id: string;
  name: string;
  type: Entity['type'];
  country: string;
  description: string;
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<DisplayEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<Entity['type'] | 'all'>('all');
  const [countrySearch, setCountrySearch] = useState('');

  // Profile sheet state
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEntityName, setSelectedEntityName] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try backend first, fall back to mock data
      try {
        const backendData = await fetchEntities();
        setEntities(
          backendData.map((e) => ({
            id: e.id,
            name: e.name,
            type: (ALL_TYPES.includes(e.type as Entity['type']) ? e.type : 'partner') as Entity['type'],
            country: e.country,
            description: e.description ?? e.summary ?? '',
          }))
        );
      } catch (backendErr: unknown) {
        if (backendErr instanceof APIError && (backendErr.status === 404 || backendErr.status === 405)) {
          // Fall back to mock data
          const mockData = await getEntities();
          setEntities(mockData);
        } else {
          throw backendErr;
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load entities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = entities.filter((e) => {
    const matchesType = activeType === 'all' || e.type === activeType;
    const matchesCountry = !countrySearch || e.country.toLowerCase().includes(countrySearch.toLowerCase());
    return matchesType && matchesCountry;
  });

  const openProfile = (entity: DisplayEntity) => {
    setSelectedEntityId(entity.id);
    setSelectedEntityName(entity.name);
    setProfileOpen(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] as number[] },
    }),
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
            Entity Directory
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: '#737373',
            }}
          >
            Regulatory bodies, infrastructure operators, and key market participants
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {(['all', ...ALL_TYPES] as const).map((t) => {
              const isActive = activeType === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 10,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                    color: isActive ? (t === 'all' ? '#ffffff' : TYPE_COLORS[t as Entity['type']]) : '#a1a1a6',
                    background: isActive ? '#2c2c2e' : '#1c1c1e',
                    border: `1px solid ${isActive ? '#333333' : 'transparent'}`,
                    borderRadius: 6,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 32,
                  }}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              );
            })}
          </div>

          {/* Country search */}
          <div className="relative" style={{ marginLeft: 'auto' }}>
            <Search
              size={13}
              color="#525252"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Filter by country..."
              style={{
                height: 34,
                background: '#0a0a0a',
                border: '1px solid #1c1c1e',
                borderRadius: 8,
                paddingLeft: 30,
                paddingRight: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 12,
                color: '#ffffff',
                outline: 'none',
                width: 180,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#333333'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1c1c1e'; }}
              aria-label="Filter entities by country"
            />
          </div>
        </motion.div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 140,
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 14,
                  animation: 'pulse-soft 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No entities match your filters"
            description="Try adjusting your type or country filter."
          />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            <AnimatePresence>
              {filtered.map((entity, i) => (
                <motion.div
                  key={entity.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #1c1c1e',
                    borderRadius: 14,
                    padding: 18,
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => openProfile(entity)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#262626';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c1e';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${entity.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openProfile(entity);
                  }}
                >
                  {/* Top row: type badge + id */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 10,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.06em',
                        color: TYPE_COLORS[entity.type] ?? '#a1a1a6',
                        background: '#1c1c1e',
                        borderRadius: 4,
                        padding: '2px 8px',
                      }}
                    >
                      {entity.type}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: '#333333',
                      }}
                    >
                      {entity.id}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 13,
                      color: '#ffffff',
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {entity.name}
                  </h3>

                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 11,
                      color: '#737373',
                      marginBottom: 10,
                    }}
                  >
                    {entity.country}
                  </p>

                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 12,
                      color: '#a1a1a6',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}
                  >
                    {entity.description}
                  </p>

                  {/* Click hint */}
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 10,
                      color: '#525252',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    View profile →
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Entity Profile Side Panel */}
      <AnimatePresence>
        {profileOpen && (
          <EntityProfile
            entityId={selectedEntityId}
            entityName={selectedEntityName}
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
