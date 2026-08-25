'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { QueryResult } from '@/lib/types';
import type { IntelligenceViewModel } from '@/lib/intelligence-view-model';

interface AnswerPanelProps {
  result: QueryResult;
  vm: IntelligenceViewModel;
}

export function AnswerPanel({ result, vm }: AnswerPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const statItems = [
    { label: 'Traces', value: result.stats.traces },
    { label: 'Nodes', value: result.stats.nodes },
    { label: 'Concepts', value: result.stats.concepts },
    { label: 'Entities', value: result.stats.entities },
    { label: 'Validated', value: result.stats.validated },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: 32,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 11,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {vm.intentType ? `Query · ${vm.intentType}` : 'Query'}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 18,
          color: 'var(--text-primary)',
          marginBottom: 16,
          lineHeight: 1.4,
        }}
      >
        {vm.query}
      </h2>

      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {vm.shortAnswer}
        </p>

        {vm.hasMoreThanShort && (
          <>
            {expanded && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.6,
                  margin: '10px 0 0',
                }}
              >
                {vm.fullAnswer}
              </p>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1"
              style={{
                marginTop: 10,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 11,
                color: 'var(--text-dim)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-expanded={expanded}
            >
              {expanded ? 'Show less' : 'Full analysis'}
              <ChevronDown
                size={12}
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                aria-hidden="true"
              />
            </button>
          </>
        )}
      </div>

      <div className="flex gap-6 flex-wrap">
        {statItems.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: 'var(--text-primary)',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 10,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
