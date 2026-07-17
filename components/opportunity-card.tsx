'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useEntities } from '@/components/entity-provider';
import type { Opportunity } from '@/types/dashboard';

interface OpportunityCardProps {
  opportunity: Opportunity;
  /** Pre-mark as saved (e.g. when rendered from DB list) */
  initialSaved?: boolean;
  /** DB row id if already saved */
  savedDbId?: number;
  /** Called after a successful save — receives the new DB id */
  onSaved?: (dbId: number) => void;
  /** Called after unsave/delete */
  onDeleted?: (dbId: number) => void;
  onExecute?: (opportunityId: string) => Promise<void>;
}

function urgencyColor(score: number): string {
  if (score >= 9.0) return '#ff453a';
  if (score >= 7.0) return '#ff9f0a';
  if (score >= 5.0) return '#ffd60a';
  return '#30d158';
}

function typeColor(type: string): string {
  if (type === 'Primary') return '#007aff';
  if (type === 'Secondary') return '#5ac8fa';
  if (type === 'Tertiary') return '#737373';
  return '#525252';
}

function UrgencyBar({ score }: { score: number }) {
  const color = urgencyColor(score);
  const pct = (score / 10) * 100;
  return (
    <div style={{ width: '100%' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#525252',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
          }}
        >
          Urgency
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 13,
            color,
          }}
        >
          {score.toFixed(1)}
          <span style={{ fontWeight: 400, fontSize: 10, color: '#525252', marginLeft: 2 }}>/10</span>
        </span>
      </div>
      <div
        style={{ height: 3, background: '#1c1c1e', borderRadius: 2, overflow: 'hidden' }}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`Urgency score: ${score}`}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function EntityChip({ name }: { name: string }) {
  const { entities } = useEntities();
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matched = entities.find((e) => {
    const en = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return en.includes(normalized) || normalized.includes(en);
  });

  if (matched) {
    return (
      <Link href={`/entities/${matched.id}`} style={{ textDecoration: 'none' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 11,
            color: '#007aff',
            background: 'rgba(0,122,255,0.1)',
            border: '1px solid rgba(0,122,255,0.25)',
            borderRadius: 5,
            padding: '3px 8px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = 'rgba(0,122,255,0.18)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = 'rgba(0,122,255,0.1)')
          }
        >
          {name}
        </span>
      </Link>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        fontSize: 11,
        color: '#525252',
        background: 'transparent',
        border: '1px dashed #2c2c2e',
        borderRadius: 5,
        padding: '3px 8px',
      }}
      title="Entity not yet mapped in ATIS"
    >
      {name}
    </span>
  );
}

export function OpportunityCard({
  opportunity,
  initialSaved = false,
  savedDbId: initialDbId,
  onSaved,
  onDeleted,
  onExecute,
}: OpportunityCardProps) {
  const [executing, setExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [saved, setSaved] = useState(initialSaved);
  const [savedDbId, setSavedDbId] = useState<number | undefined>(initialDbId);
  const [saving, setSaving] = useState(false);
  const [unsaving, setUnsaving] = useState(false);
  // pg returns NUMERIC columns as strings — coerce to number before any arithmetic
  const urgencyScore = Number(opportunity.urgency_score);
  const feasibilityScore = Number(opportunity.feasibility_score);
  const uColor = urgencyColor(urgencyScore);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.opportunity_id,
          title: opportunity.title,
          type: opportunity.type,
          urgency_score: opportunity.urgency_score,
          feasibility_score: opportunity.feasibility_score,
          justification: opportunity.justification,
          required_missing_nodes: opportunity.required_missing_nodes,
          capital_flow: opportunity.capital_flow,
          dashboard_json: opportunity,
          intelligence_id: opportunity.intelligence_id,
          trigger_event: opportunity.trigger_event,
          source_article_id: opportunity.source_article_id,
          source_article_headline: opportunity.source_article_headline,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSaved(true);
        setSavedDbId(data.id);
        onSaved?.(data.id);
      } else if (data.status === 'already_saved') {
        setSaved(true);
        setSavedDbId(data.id);
      }
    } catch (err) {
      console.error('[OpportunityCard save]', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!savedDbId || unsaving) return;
    setUnsaving(true);
    try {
      await fetch(`/api/saved-opportunities/${savedDbId}`, { method: 'DELETE' });
      setSaved(false);
      onDeleted?.(savedDbId);
      setSavedDbId(undefined);
    } catch (err) {
      console.error('[OpportunityCard unsave]', err);
    } finally {
      setUnsaving(false);
    }
  };

  const handleExecute = async () => {
    if (!onExecute) return;
    setExecuting(true);
    setExecuteError(null);
    try {
      await onExecute(opportunity.opportunity_id);
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <article
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderLeft: `4px solid ${uColor}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: 'wrap' as const }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#333333',
                letterSpacing: '0.06em',
              }}
            >
              {opportunity.opportunity_id}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: typeColor(opportunity.type),
                background: `${typeColor(opportunity.type)}1a`,
                border: `1px solid ${typeColor(opportunity.type)}33`,
                borderRadius: 4,
                padding: '2px 7px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {opportunity.type}
            </span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 14,
              color: '#f5f5f7',
              margin: 0,
              lineHeight: 1.35,
            }}
          >
            {opportunity.title}
          </h3>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {/* Feasibility badge */}
          <div
            style={{
              background: '#1c1c1e',
              border: '1px solid #2c2c2e',
              borderRadius: 8,
              padding: '6px 10px',
              textAlign: 'center' as const,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 14,
                color: '#a1a1a6',
                lineHeight: 1,
              }}
            >
              {feasibilityScore.toFixed(1)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: '#333333',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                marginTop: 3,
              }}
            >
              Feasibility
            </div>
          </div>

          {/* Save / Unsave button */}
          <button
            onClick={saved ? handleUnsave : handleSave}
            disabled={saving || unsaving}
            aria-label={saved ? 'Remove from saved opportunities' : 'Save to Opportunities'}
            title={saved ? 'Unsave' : 'Save'}
            style={{
              background: saved ? 'rgba(48,209,88,0.1)' : 'transparent',
              border: `1px solid ${saved ? 'rgba(48,209,88,0.3)' : '#2c2c2e'}`,
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: saving || unsaving ? 'wait' : 'pointer',
              color: saved ? '#30d158' : '#525252',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!saving && !unsaving && !saved) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#525252';
                (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
              }
            }}
            onMouseLeave={(e) => {
              if (!saved) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2c2c2e';
                (e.currentTarget as HTMLButtonElement).style.color = '#525252';
              }
            }}
          >
            {saving || unsaving
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
              : saved
                ? <BookmarkCheck size={14} aria-hidden="true" />
                : <Bookmark size={14} aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* Urgency bar */}
      <UrgencyBar score={urgencyScore} />

      {/* Justification */}
      <blockquote
        style={{
          margin: 0,
          padding: '10px 14px',
          background: '#111111',
          borderLeft: '2px solid #2c2c2e',
          borderRadius: '0 6px 6px 0',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 12,
            color: '#737373',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {opportunity.justification}
        </p>
      </blockquote>

      {/* Required missing nodes */}
      {Array.isArray(opportunity.required_missing_nodes) &&
        opportunity.required_missing_nodes.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#525252',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                margin: '0 0 8px 0',
              }}
            >
              Required Nodes
            </p>
            <div className="flex flex-wrap gap-2">
              {opportunity.required_missing_nodes.map((node) => (
                <EntityChip key={node} name={node} />
              ))}
            </div>
          </div>
        )}

      {/* Capital flow */}
      {opportunity.capital_flow?.beneficiary && (
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#525252',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              margin: '0 0 8px 0',
            }}
          >
            Capital Flow
          </p>
          <div
            className="flex items-center gap-2"
            style={{
              background: '#111111',
              border: '1px solid #1c1c1e',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'inline-flex',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 12,
                color: '#a1a1a6',
              }}
            >
              {opportunity.capital_flow.likely_funder}
            </span>
            <ArrowRight size={12} color="#333333" aria-hidden="true" />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 12,
                color: '#f5f5f7',
              }}
            >
              {opportunity.capital_flow.beneficiary}
            </span>
          </div>
        </div>
      )}

      {/* Execute */}
      {onExecute && (
        <div>
          {executeError && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: '#ff453a',
                margin: '0 0 8px 0',
              }}
              role="alert"
            >
              {executeError}
            </p>
          )}
          <button
            onClick={handleExecute}
            disabled={executing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'transparent',
              border: `1px solid ${uColor}55`,
              borderRadius: 8,
              padding: '9px 16px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: uColor,
              cursor: executing ? 'not-allowed' : 'pointer',
              opacity: executing ? 0.6 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!executing)
                (e.currentTarget as HTMLElement).style.background = `${uColor}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {executing ? (
              <Loader2
                size={13}
                style={{ animation: 'spin 1s linear infinite' }}
                aria-hidden="true"
              />
            ) : (
              <Zap size={13} aria-hidden="true" />
            )}
            {executing ? 'Executing...' : 'Execute'}
          </button>
        </div>
      )}
    </article>
  );
}
