'use client';

import Link from 'next/link';
import { ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import type { Investigation } from '@/lib/investigation-types';

interface InvestigationHeaderProps {
  investigation: Investigation;
  onGenerateReport: () => void;
  generatingReport: boolean;
  reportError: string | null;
}

export function InvestigationHeader({
  investigation,
  onGenerateReport,
  generatingReport,
  reportError,
}: InvestigationHeaderProps) {
  const isActive = investigation.status === 'active';

  const counters = [
    { label: 'Queries', value: investigation.queriesCount },
    { label: 'Sources', value: investigation.sourcesCount },
    { label: 'Entities', value: investigation.entitiesCount },
    { label: 'Relationships', value: investigation.aggregated.relationshipsCount },
  ];

  return (
    <div className="mb-6">
      <Link
        href="/investigations"
        className="inline-flex items-center gap-1 mb-4"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 12,
          color: 'var(--text-dim)',
          textDecoration: 'none',
        }}
      >
        <ChevronLeft size={14} aria-hidden="true" />
        All Investigations
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0" style={{ flex: 1 }}>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                fontSize: 10,
                color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: `1px solid ${isActive ? 'var(--border-hover)' : 'var(--border-default)'}`,
                borderRadius: 4,
                padding: '3px 8px',
              }}
            >
              {isActive ? 'Active' : 'Completed'}
            </span>
          </div>
          <h1
            className="text-balance"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 24,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              marginBottom: 10,
            }}
          >
            {investigation.title}
          </h1>
          <div
            className="flex items-center gap-4 flex-wrap"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {counters.map((c, i) => (
              <span key={c.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span style={{ width: 1, height: 10, background: 'var(--border-default)' }} aria-hidden="true" />
                )}
                {c.value} {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2" style={{ flexShrink: 0 }}>
          <button
            onClick={onGenerateReport}
            disabled={generatingReport}
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              color: 'var(--bg-primary)',
              background: 'var(--text-primary)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              cursor: generatingReport ? 'not-allowed' : 'pointer',
              opacity: generatingReport ? 0.7 : 1,
              whiteSpace: 'nowrap',
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {generatingReport && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
            {generatingReport ? 'Generating…' : 'Generate Report'}
          </button>
          {reportError && (
            <p
              role="alert"
              className="flex items-center gap-1 text-right"
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 11, color: '#ff453a', maxWidth: 220 }}
            >
              <AlertCircle size={11} style={{ flexShrink: 0 }} aria-hidden="true" />
              {reportError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
