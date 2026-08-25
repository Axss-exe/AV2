'use client';

import { FileText } from 'lucide-react';
import type { Opportunity } from '@/lib/types';

interface DocumentViewProps {
  opportunity: Opportunity;
}

export function DocumentView({ opportunity }: DocumentViewProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          background: 'var(--bg-control)',
          borderBottom: '1px solid var(--border-default)',
          padding: '16px 20px',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--border-default)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <FileText size={14} color="var(--text-tertiary)" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--text-primary)',
                marginBottom: 2,
              }}
            >
              {opportunity.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontSize: 11,
                color: 'var(--text-muted)',
              }}
            >
              {opportunity.id} · {opportunity.value} · {opportunity.duration}
            </div>
          </div>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            color: opportunity.status === 'active' ? 'var(--text-primary)' : opportunity.status === 'pending' ? '#ff9f0a' : 'var(--text-muted)',
            background: 'var(--border-default)',
            border: '1px solid var(--border-default)',
            borderRadius: 4,
            padding: '2px 8px',
          }}
        >
          {opportunity.status}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          maxHeight: 440,
          overflowY: 'auto',
          padding: '20px 24px',
        }}
      >
        {/* Transaction Perimeter */}
        <section className="mb-6">
          <h4
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Transaction Perimeter
          </h4>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {opportunity.transaction_perimeter}
          </p>
        </section>

        {/* Operational Roadmap Table */}
        <section className="mb-6">
          <h4
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Operational Roadmap
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Phase', 'Duration', 'Milestone'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left' as const,
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      padding: '8px 10px',
                      borderBottom: '1px solid var(--border-default)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunity.operational_roadmap.map((row, i) => (
                <tr key={i}>
                  {[row.phase, row.duration, row.milestone].map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 12,
                        color: 'var(--text-tertiary)',
                        padding: '10px',
                        borderBottom: '1px solid var(--border-default)',
                        verticalAlign: 'top' as const,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Direct Action Matrix */}
        <section>
          <h4
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 10,
            }}
          >
            Direct Action Matrix
          </h4>
          <div className="flex flex-col gap-2">
            {opportunity.direct_action_matrix.map((action, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: '1px solid var(--border-default)',
                    background: 'var(--border-default)',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.5,
                  }}
                >
                  {action}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
