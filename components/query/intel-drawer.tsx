'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { CitedItem } from '@/lib/intelligence-view-model';
import type { OpportunityCited } from '@/lib/types';
import { searchEntitiesAPI, fetchEntityProfile, APIError, type EntityProfile } from '@/lib/api';
import { resolveEntityType, entityTypeMeta } from '@/lib/entity-types';

export type DrawerView =
  | { type: 'finding'; item: CitedItem }
  | { type: 'risk'; item: CitedItem }
  | { type: 'opportunity'; item: OpportunityCited }
  | { type: 'entity'; name: string };

interface IntelDrawerProps {
  stack: DrawerView[];
  onClose: () => void;
  onPush: (view: DrawerView) => void;
  onPop: () => void;
}

const TITLES: Record<DrawerView['type'], string> = {
  finding: 'Finding',
  risk: 'Risk',
  opportunity: 'Opportunity',
  entity: 'Entity',
};

export function IntelDrawer({ stack, onClose, onPush, onPop }: IntelDrawerProps) {
  const current = stack[stack.length - 1];
  const isOpen = stack.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
            aria-hidden="true"
          />
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={TITLES[current.type]}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 100vw)',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-default)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2"
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-default)',
                flexShrink: 0,
              }}
            >
              {stack.length > 1 && (
                <button
                  onClick={onPop}
                  aria-label="Back"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    padding: 4,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <div
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {stack.map((v, i) => (
                  <span key={i}>
                    {i > 0 && ' / '}
                    {TITLES[v.type]}
                  </span>
                ))}
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {current.type === 'finding' && <StatementView item={current.item} onPush={onPush} />}
              {current.type === 'risk' && <StatementView item={current.item} onPush={onPush} />}
              {current.type === 'opportunity' && <OpportunityView item={current.item} onPush={onPush} />}
              {current.type === 'entity' && <EntityView name={current.name} onPush={onPush} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Finding / Risk detail ── */
function StatementView({ item, onPush }: { item: CitedItem; onPush: (v: DrawerView) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 15,
          color: 'var(--text-primary)',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {item.text}
      </p>

      {item.sourceNodes.length > 0 && (
        <div>
          <SectionLabel>Cited Entities</SectionLabel>
          <div className="flex flex-col gap-2">
            {item.sourceNodes.map((node) => (
              <EntityChip key={node} name={node} onClick={() => onPush({ type: 'entity', name: node })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Opportunity detail ── */
function OpportunityView({ item, onPush }: { item: OpportunityCited; onPush: (v: DrawerView) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
          {item.title}
        </h3>
        {item.status && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 9,
              color: 'var(--accent-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '1px solid var(--accent-warning)',
              borderRadius: 4,
              padding: '2px 6px',
            }}
          >
            {item.status}
          </span>
        )}
      </div>

      {item.pathway && <DetailRow label="Pathway" value={item.pathway} />}
      {item.perspectiveActor && <DetailRow label="Perspective Actor" value={item.perspectiveActor} />}
      {item.perspectiveCapability && <DetailRow label="Capability" value={item.perspectiveCapability} />}
      {item.justification && <DetailRow label="Justification" value={item.justification} />}

      {item.capitalFlow && (item.capitalFlow.likelyFunder || item.capitalFlow.beneficiary) && (
        <div>
          <SectionLabel>Capital Flow</SectionLabel>
          <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>{item.capitalFlow.likelyFunder ?? '—'}</span>
            <ArrowUpRight size={13} color="var(--text-dim)" aria-hidden="true" />
            <span>{item.capitalFlow.beneficiary ?? '—'}</span>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {typeof item.urgencyScore === 'number' && <DetailRow label="Urgency Score" value={item.urgencyScore.toFixed(2)} inline />}
        {typeof item.feasibilityScore === 'number' && <DetailRow label="Feasibility Score" value={item.feasibilityScore.toFixed(2)} inline />}
      </div>

      {item.crossBorder && item.crossBorderCountries && item.crossBorderCountries.length > 0 && (
        <DetailRow label="Cross-Border Countries" value={item.crossBorderCountries.join(', ')} />
      )}

      {item.sourceNodes.length > 0 && (
        <div>
          <SectionLabel>Cited Entities</SectionLabel>
          <div className="flex flex-col gap-2">
            {item.sourceNodes.map((node) => (
              <EntityChip key={node} name={node} onClick={() => onPush({ type: 'entity', name: node })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, inline }: { label: string; value: string; inline?: boolean }) {
  if (inline) {
    return (
      <div className="flex flex-col gap-1">
        <SectionLabel>{label}</SectionLabel>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{value}</span>
      </div>
    );
  }
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

/** Some vault entries have an empty frontmatter summary, so the API backfills
 *  it with a raw "## Core Information **Type:** ..." markdown block instead
 *  of prose. Strip markdown/wikilink syntax so the drawer never renders
 *  raw syntax characters (matches the sanitization already used for
 *  relation snippets on the entity profile page). */
function cleanSummary(raw: string): string {
  return raw
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' · ')
    .trim();
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function EntityChip({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between text-left w-full"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        padding: '9px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; }}
    >
      {name}
      <ArrowUpRight size={12} color="var(--text-dim)" aria-hidden="true" />
    </button>
  );
}

/* ── Entity detail (lazy resolution) ── */
function EntityView({ name, onPush }: { name: string; onPush: (v: DrawerView) => void }) {
  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProfile(null);

    (async () => {
      try {
        const searchRes = await searchEntitiesAPI(name);
        const match = searchRes.results?.[0];
        if (!match) {
          if (!cancelled) setError('No matching vault entity found.');
          return;
        }
        const profileRes = await fetchEntityProfile(match.slug);
        if (!cancelled) setProfile(profileRes);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof APIError ? err.message : 'Failed to load entity profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse" style={{ height: 14, borderRadius: 6, background: 'var(--bg-primary)' }} />
        ))}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col gap-3">
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{name}</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          {error ?? 'Entity profile unavailable.'}
        </p>
      </div>
    );
  }

  const type = resolveEntityType(profile.entity_type, profile.path);
  const meta = entityTypeMeta(type);
  const Icon = meta.icon;
  const related = profile.related_entities ?? [];
  const outbound = related.filter((r) => r.relation_type === 'outbound');
  const backlinks = related.filter((r) => r.relation_type === 'backlink');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${meta.color}1a`,
            border: `1px solid ${meta.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: meta.color,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
            {profile.name}
          </h3>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: meta.color,
            }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {profile.summary && (
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
          {cleanSummary(profile.summary)}
        </p>
      )}

      <Link
        href={`/entities/${profile.slug}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 12,
          color: 'var(--text-primary)',
          textDecoration: 'none',
          border: '1px solid var(--border-hover)',
          borderRadius: 7,
          padding: '7px 12px',
          alignSelf: 'flex-start',
        }}
      >
        <ExternalLink size={12} aria-hidden="true" />
        Open full profile
      </Link>

      {(outbound.length > 0 || backlinks.length > 0) && (
        <div className="flex flex-col gap-4">
          <SectionLabel>Relationships</SectionLabel>
          {outbound.length > 0 && (
            <RelationList title="Linked To" icon={<ArrowUpRight size={12} aria-hidden="true" />} accent="#0a84ff" rels={outbound} onPush={onPush} />
          )}
          {backlinks.length > 0 && (
            <RelationList title="Linked From" icon={<ArrowDownLeft size={12} aria-hidden="true" />} accent="#ff9f0a" rels={backlinks} onPush={onPush} />
          )}
        </div>
      )}
    </div>
  );
}

function RelationList({
  title,
  icon,
  accent,
  rels,
  onPush,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  rels: { slug: string; name: string; summary?: string }[];
  onPush: (v: DrawerView) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, color: 'var(--text-tertiary)' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>{rels.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {rels.map((r) => (
          <EntityChip key={r.slug} name={r.name} onClick={() => onPush({ type: 'entity', name: r.name })} />
        ))}
      </div>
    </div>
  );
}
