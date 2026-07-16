'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon } from 'lucide-react';
import { fetchEntityProfile, APIError } from '@/lib/api';
import type { EntityAPIItem } from '@/lib/api';

interface EntityProfileProps {
  entityId: string | null;
  entityName?: string;
  open: boolean;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  regulatory: '#a1a1a6',
  infrastructure: '#30d158',
  logistics: '#ff9f0a',
  legal: '#d1d1d6',
  partner: '#ffffff',
  risk: '#ff453a',
};

function Skeleton({ width, height }: { width?: number | string; height: number }) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height,
        background: '#1c1c1e',
        borderRadius: 6,
        animation: 'pulse-soft 1.5s infinite',
      }}
    />
  );
}

export function EntityProfile({ entityId, entityName, open, onClose }: EntityProfileProps) {
  const [profile, setProfile] = useState<EntityAPIItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) return;
    setProfile(null);
    setError(null);
    setLoading(true);

    fetchEntityProfile(entityId)
      .then((data) => setProfile(data))
      .catch((err: unknown) => {
        setError(
          err instanceof APIError
            ? err.message
            : 'Failed to load entity profile.'
        );
      })
      .finally(() => setLoading(false));
  }, [entityId, open]);

  if (!open) return null;

  const typeColor = profile ? (TYPE_COLORS[profile.type] ?? '#a1a1a6') : '#a1a1a6';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          zIndex: 48,
        }}
        aria-hidden="true"
      />

      {/* Left slide-over panel */}
      <motion.div
        initial={{ opacity: 0, x: '-100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '-100%' }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 520,
          background: '#0a0a0a',
          borderRight: '1px solid #1c1c1e',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={entityName ?? 'Entity Profile'}
      >
        {/* Header */}
        <div
          className="flex-shrink-0"
          style={{ padding: '24px 28px 20px', borderBottom: '1px solid #1c1c1e' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton width={80} height={16} />
                  <Skeleton height={24} />
                  <Skeleton width={120} height={14} />
                </div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 10,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.06em',
                        color: typeColor,
                        background: '#1c1c1e',
                        borderRadius: 4,
                        padding: '2px 8px',
                      }}
                    >
                      {profile.type}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: '#525252',
                      }}
                    >
                      {profile.id}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {profile.name}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#737373',
                    }}
                  >
                    {profile.country}
                  </p>
                </>
              ) : error ? (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#ff453a',
                  }}
                >
                  {error}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#525252',
                  }}
                >
                  {entityName ?? 'Loading profile...'}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close entity profile"
              style={{
                width: 32,
                height: 32,
                background: '#1c1c1e',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#737373',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                (e.currentTarget as HTMLButtonElement).style.color = '#737373';
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton width={100} height={12} />
                <Skeleton height={60} />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton width={100} height={12} />
                <Skeleton height={40} />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton width={140} height={12} />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} height={36} />
                ))}
              </div>
            </div>
          ) : profile ? (
            <div className="flex flex-col gap-6">
              {/* Description / Summary */}
              {(profile.description ?? profile.summary) && (
                <section>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      color: '#525252',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    Overview
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 13,
                      color: '#a1a1a6',
                      lineHeight: 1.65,
                    }}
                  >
                    {profile.description ?? profile.summary}
                  </p>
                </section>
              )}

              {/* Metadata */}
              {profile.metadata && Object.keys(profile.metadata).length > 0 && (
                <section>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      color: '#525252',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    Metadata
                  </h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(profile.metadata).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-start gap-3"
                        style={{
                          background: '#111111',
                          border: '1px solid #1c1c1e',
                          borderRadius: 8,
                          padding: '10px 14px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            fontSize: 10,
                            color: '#525252',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            flexShrink: 0,
                            width: 100,
                            paddingTop: 1,
                          }}
                        >
                          {k}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 400,
                            fontSize: 12,
                            color: '#d1d1d6',
                            lineHeight: 1.4,
                          }}
                        >
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Relationships */}
              {profile.relationships && profile.relationships.length > 0 && (
                <section>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      color: '#525252',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    Relationships
                  </h3>
                  <div className="flex flex-col gap-2">
                    {profile.relationships.map((rel, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3"
                        style={{
                          background: '#111111',
                          border: '1px solid #1c1c1e',
                          borderRadius: 8,
                          padding: '10px 14px',
                        }}
                      >
                        <LinkIcon size={12} color="#525252" aria-hidden="true" />
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            fontSize: 12,
                            color: '#d1d1d6',
                          }}
                        >
                          {rel.entity}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: '#525252',
                            marginLeft: 'auto',
                          }}
                        >
                          {rel.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Connected Entities */}
              {profile.connected_entities && profile.connected_entities.length > 0 && (
                <section>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      color: '#525252',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 10,
                    }}
                  >
                    Connected Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.connected_entities.map((ent) => (
                      <span
                        key={ent}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 400,
                          fontSize: 11,
                          color: '#a1a1a6',
                          background: '#1c1c1e',
                          border: '1px solid #262626',
                          borderRadius: 6,
                          padding: '4px 10px',
                        }}
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
