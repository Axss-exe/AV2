'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { fetchEntityProfile } from '@/lib/api';
import type { EntityProfileResponse } from '@/lib/api';

interface EntityProfileProps {
  entityId: string | null;
  entityName?: string;
  open: boolean;
  onClose: () => void;
}

// ---- Colors ----------------------------------------------------------------

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

const TYPE_COLORS: Record<string, string> = {
  holding_company: '#ffd60a',
  state_owned_enterprise: '#30d158',
  private_company: '#64d2ff',
  regulatory_body: '#a1a1a6',
  government_ministry: '#bf5af2',
  parastatal: '#ff9f0a',
  ngo: '#ff6b35',
};

function sectorColor(sector: string | undefined) {
  if (!sector) return '#a1a1a6';
  return SECTOR_COLORS[sector.toLowerCase()] ?? '#a1a1a6';
}

function typeColor(type: string | undefined) {
  if (!type) return '#a1a1a6';
  const key = type.split(';')[0].toLowerCase().replace(/\s+/g, '_');
  return TYPE_COLORS[key] ?? '#a1a1a6';
}

// ---- WikiLink parser -------------------------------------------------------

function parseWikiLinks(raw: string[]): string[] {
  return raw.map((s) => s.replace(/^\[\[|\]\]$/g, '').trim());
}

function entityIdFromName(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[()&,./]/g, '');
}

// ---- Skeleton --------------------------------------------------------------

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

// ---- Badge -----------------------------------------------------------------

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        color,
        background: `${color}18`,
        border: `1px solid ${color}33`,
        borderRadius: 5,
        padding: '3px 8px',
        display: 'inline-block',
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

// ---- WikiLink chip (clickable) --------------------------------------------

interface WikiChipProps {
  label: string;
  onClick: (id: string, name: string) => void;
}

function WikiChip({ label, onClick }: WikiChipProps) {
  return (
    <button
      onClick={() => onClick(entityIdFromName(label), label)}
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        fontSize: 11,
        color: '#64d2ff',
        background: 'rgba(100,210,255,0.08)',
        border: '1px solid rgba(100,210,255,0.2)',
        borderRadius: 6,
        padding: '4px 10px',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        display: 'inline-block',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,210,255,0.18)';
        (e.currentTarget as HTMLButtonElement).style.color = '#a0e4ff';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,210,255,0.08)';
        (e.currentTarget as HTMLButtonElement).style.color = '#64d2ff';
      }}
    >
      {label}
    </button>
  );
}

// ---- Section heading -------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        color: '#525252',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: 8,
      }}
    >
      {children}
    </h3>
  );
}

// ---- WikiLink field row ----------------------------------------------------

interface WikiFieldProps {
  label: string;
  values: string[];
  onChipClick: (id: string, name: string) => void;
}

function WikiField({ label, values, onChipClick }: WikiFieldProps) {
  const parsed = parseWikiLinks(values);
  if (parsed.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap gap-1">
        {parsed.map((v) => (
          <WikiChip key={v} label={v} onClick={onChipClick} />
        ))}
      </div>
    </div>
  );
}

// ---- String tag field ------------------------------------------------------

function TagField({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap gap-1">
        {values.map((v) => (
          <span
            key={v}
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 11,
              color: '#a1a1a6',
              background: '#1c1c1e',
              border: '1px solid #262626',
              borderRadius: 6,
              padding: '4px 10px',
              display: 'inline-block',
            }}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Body section text block -----------------------------------------------

function BodySection({ label, text }: { label: string; text: string }) {
  if (!text?.trim()) return null;
  // Strip any remaining markdown headers from the text
  const cleaned = text.replace(/^#+\s.+$/gm, '').trim();
  if (!cleaned) return null;
  return (
    <section style={{ marginBottom: 20 }}>
      <SectionLabel>{label}</SectionLabel>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: 13,
          color: '#a1a1a6',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}
      >
        {cleaned}
      </p>
    </section>
  );
}

// ---- Loading skeleton -------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4" style={{ padding: '24px 28px' }}>
      <div className="flex flex-col gap-2">
        <Skeleton width={80} height={16} />
        <Skeleton height={26} />
        <Skeleton width={140} height={14} />
      </div>
      <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
        <Skeleton width={60} height={10} />
        <Skeleton height={64} />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton width={90} height={10} />
        <div className="flex flex-wrap gap-2">
          {[72, 100, 84].map((w) => <Skeleton key={w} width={w} height={26} />)}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton width={110} height={10} />
        {[...Array(3)].map((_, i) => <Skeleton key={i} height={26} />)}
      </div>
    </div>
  );
}

// ---- Main component --------------------------------------------------------

export function EntityProfile({ entityId, entityName, open, onClose }: EntityProfileProps) {
  const [profile, setProfile] = useState<EntityProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navStack, setNavStack] = useState<{ id: string; name: string }[]>([]);

  const loadProfile = useCallback(async (id: string) => {
    if (!id) return;
    setProfile(null);
    setError(null);
    setLoading(true);
    try {
      const data = await fetchEntityProfile(id);
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load entity profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on open or entityId change
  useEffect(() => {
    if (!open || !entityId) return;
    setNavStack([]);
    loadProfile(entityId);
  }, [entityId, open, loadProfile]);

  // Navigate into a linked entity
  const handleChipClick = (id: string, name: string) => {
    if (!profile) return;
    const currentId = profile.id ?? entityId ?? '';
    const currentName = profile.frontmatter?.entity ?? entityName ?? currentId;
    setNavStack((prev) => [...prev, { id: currentId, name: currentName }]);
    loadProfile(id);
  };

  // Navigate back
  const handleBack = () => {
    const prev = navStack[navStack.length - 1];
    if (!prev) return;
    setNavStack((stack) => stack.slice(0, -1));
    loadProfile(prev.id);
  };

  if (!open) return null;

  const fm = profile?.frontmatter;
  const bs = profile?.body_sections;
  const displayName = fm?.entity ?? entityName ?? entityId ?? '';
  const sector = fm?.sector;
  const entityType = fm?.entity_type;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 48,
        }}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <motion.div
        initial={{ opacity: 0, x: '-100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '-100%' }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 560,
          background: '#0a0a0a',
          borderRight: '1px solid #1c1c1e',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={displayName || 'Entity Profile'}
      >
        {/* ---- Header ---- */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px 18px',
            borderBottom: '1px solid #1c1c1e',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Back button */}
              {navStack.length > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 11,
                    color: '#525252',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: 10,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#525252'; }}
                >
                  <ChevronLeft size={12} aria-hidden="true" />
                  {navStack[navStack.length - 1]?.name ?? 'Back'}
                </button>
              )}

              {loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton width={80} height={14} />
                  <Skeleton height={22} />
                  <Skeleton width={120} height={12} />
                </div>
              ) : profile ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {sector && (
                      <Badge label={sector} color={sectorColor(sector)} />
                    )}
                    {entityType && entityType.split(';').map((t) => (
                      <Badge key={t} label={t.trim().replace(/_/g, ' ')} color={typeColor(t.trim())} />
                    ))}
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 17,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      marginBottom: fm?.ownership_type ? 4 : 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {displayName}
                  </h2>
                  {fm?.ownership_type && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 400,
                        fontSize: 11,
                        color: '#525252',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {fm.ownership_type.replace(/_/g, ' ')}
                    </p>
                  )}
                </>
              ) : error ? (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#ff453a' }}>
                  {error}
                </p>
              ) : (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#525252' }}>
                  {entityName ?? 'Loading...'}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close entity profile"
              style={{
                flexShrink: 0,
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

        {/* ---- Body ---- */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <div>
              {/* Summary */}
              {bs?.summary && (
                <BodySection label="Summary" text={bs.summary} />
              )}

              {/* Location / ownership chips */}
              <WikiField
                label="Located In"
                values={fm?.located_in ?? []}
                onChipClick={handleChipClick}
              />
              <WikiField
                label="Owned By"
                values={fm?.owned_by ?? []}
                onChipClick={handleChipClick}
              />
              <WikiField
                label="Regulated By"
                values={fm?.regulated_by ?? []}
                onChipClick={handleChipClick}
              />
              <WikiField
                label="Licenses From"
                values={fm?.licenses_from ?? []}
                onChipClick={handleChipClick}
              />
              <WikiField
                label="Government Oversight"
                values={fm?.government_entities ?? []}
                onChipClick={handleChipClick}
              />
              <WikiField
                label="Relevant Laws"
                values={fm?.relevant_laws ?? []}
                onChipClick={handleChipClick}
              />
              <TagField
                label="Stakeholders"
                values={fm?.stakeholders ?? []}
              />

              {/* Divider */}
              {bs?.core_information && (
                <div style={{ borderTop: '1px solid #1c1c1e', margin: '16px 0' }} />
              )}

              {/* Body sections */}
              {bs?.core_information && (
                <BodySection label="Core Information" text={bs.core_information} />
              )}
              {bs?.governance_regulation && (
                <BodySection label="Governance & Regulation" text={bs.governance_regulation} />
              )}
              {bs?.stakeholders && (
                <BodySection label="Stakeholders" text={bs.stakeholders} />
              )}

              {/* Projects */}
              {(fm?.active_projects && fm.active_projects.length > 0) && (
                <>
                  <div style={{ borderTop: '1px solid #1c1c1e', margin: '16px 0' }} />
                  <WikiField
                    label="Active Projects"
                    values={fm.active_projects}
                    onChipClick={handleChipClick}
                  />
                </>
              )}
              {bs?.projects && (
                <BodySection label="Projects Detail" text={bs.projects} />
              )}

              {/* Decision makers & contacts */}
              {(fm?.decision_makers && fm.decision_makers.length > 0) && (
                <>
                  <div style={{ borderTop: '1px solid #1c1c1e', margin: '16px 0' }} />
                  <WikiField
                    label="Decision Makers"
                    values={fm.decision_makers}
                    onChipClick={handleChipClick}
                  />
                </>
              )}
              {(fm?.key_contacts && fm.key_contacts.length > 0) && (
                <WikiField
                  label="Key Contacts"
                  values={fm.key_contacts}
                  onChipClick={handleChipClick}
                />
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
