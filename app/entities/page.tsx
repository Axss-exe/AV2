'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EntityProfile } from '@/components/entity-profile';
import { fetchEntities, APIError } from '@/lib/api';
import type { EntityListItem } from '@/lib/api';

// ---------------------------------------------------------------------------
// Sector colour map — used for badges when profile has loaded
// ---------------------------------------------------------------------------

const SECTOR_COLORS: Record<string, string> = {
  energy: '#30d158',
  mining: '#64d2ff',
  agriculture: '#ffd60a',
  finance: '#ff9f0a',
  banking: '#ff9f0a',
  logistics: '#ff9f0a',
  infrastructure: '#30d158',
  legal: '#d1d1d6',
  regulatory: '#a1a1a6',
  technology: '#0a84ff',
  telecoms: '#0a84ff',
  manufacturing: '#ff6b35',
  retail: '#ff2d55',
  government: '#bf5af2',
};

function sectorColor(s: string | undefined) {
  if (!s) return '#525252';
  return SECTOR_COLORS[s.toLowerCase()] ?? '#a1a1a6';
}

// Derive a human-readable "category" hint from the entity path
function categoryFromPath(path: string): string {
  const parts = path.split('/');
  if (parts.length >= 3) return parts[parts.length - 2];
  return 'Entity';
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        height: 130,
        background: '#111111',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        animation: 'pulse-soft 1.5s infinite',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Entity card
// ---------------------------------------------------------------------------

interface EntityCardProps {
  entity: EntityListItem;
  index: number;
  onOpen: (entity: EntityListItem) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] as number[] },
  }),
};

function EntityCard({ entity, index, onOpen }: EntityCardProps) {
  const category = categoryFromPath(entity.path);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={() => onOpen(entity)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(entity); }}
      role="button"
      tabIndex={0}
      aria-label={`View profile for ${entity.name}`}
      style={{
        background: '#111111',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#2c2c2e';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c1e';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: icon + category badge */}
      <div className="flex items-center justify-between">
        <div
          style={{
            width: 32,
            height: 32,
            background: '#1c1c1e',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Building2 size={15} color="#525252" aria-hidden="true" />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 9,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            color: sectorColor(category),
            background: `${sectorColor(category)}15`,
            border: `1px solid ${sectorColor(category)}30`,
            borderRadius: 5,
            padding: '3px 8px',
          }}
        >
          {category}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 13,
          color: '#ffffff',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}
      >
        {entity.name}
      </h3>

      {/* ID (mono, muted) */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#333333',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entity.id}
      </p>

      {/* Footer hint */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 4,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 10,
          color: '#333333',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        View profile →
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EntitiesPage() {
  const [entities, setEntities] = useState<EntityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Profile drawer state
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntities();
      // fetchEntities already guarantees an array (see lib/api.ts)
      setEntities(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      if (e instanceof APIError && e.status === 404) {
        setEntities([]);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load entities.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = entities.filter((e) =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const openProfile = (entity: EntityListItem) => {
    setSelectedId(entity.id);
    setSelectedName(entity.name);
    setProfileOpen(true);
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
              color: '#525252',
            }}
          >
            {loading
              ? 'Loading entities...'
              : `${entities.length} entities across the Zimbabwe vault`}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="relative mb-6"
          style={{ maxWidth: 360 }}
        >
          <Search
            size={13}
            color="#525252"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entities..."
            style={{
              width: '100%',
              height: 36,
              background: '#111111',
              border: '1px solid #1c1c1e',
              borderRadius: 8,
              paddingLeft: 32,
              paddingRight: 12,
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 12,
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#333333'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1c1c1e'; }}
            aria-label="Search entities"
          />
        </motion.div>

        {/* Content */}
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(255,69,58,0.08)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#ff453a' }}>
              {error}
            </p>
            <button
              onClick={load}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 11,
                color: '#ff453a',
                background: 'rgba(255,69,58,0.12)',
                border: '1px solid rgba(255,69,58,0.25)',
                borderRadius: 6,
                padding: '6px 14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Retry
            </button>
          </motion.div>
        ) : loading ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
          >
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#525252' }}>
              {search ? `No entities matching "${search}"` : 'No entities found.'}
            </p>
          </motion.div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
          >
            <AnimatePresence>
              {filtered.map((entity, i) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  index={i}
                  onOpen={openProfile}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Entity Profile Drawer */}
      <AnimatePresence>
        {profileOpen && (
          <EntityProfile
            entityId={selectedId}
            entityName={selectedName}
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
