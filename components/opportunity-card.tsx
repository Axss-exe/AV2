'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useEntities } from '@/components/entity-provider';
import type { Opportunity } from '@/types/dashboard';

interface OpportunityCardProps {
  opportunity: Opportunity;
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

export function OpportunityCard({ opportunity, onExecute }: OpportunityCardProps) {
  const [executing, setExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const uColor = urgencyColor(opportunity.urgency_score);

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

        {/* Feasibility badge */}
        <div
          style={{
            background: '#1c1c1e',
            border: '1px solid #2c2c2e',
            borderRadius: 8,
            padding: '6px 10px',
            textAlign: 'center' as const,
            flexShrink: 0,
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
            {opportunity.feasibility_score.toFixed(1)}
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
      </div>

      {/* Urgency bar */}
      <UrgencyBar score={opportunity.urgency_score} />

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
