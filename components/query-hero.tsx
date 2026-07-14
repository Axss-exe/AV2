import type { QueryResult } from '@/lib/types';

interface QueryHeroProps {
  result: QueryResult;
}

export function QueryHero({ result }: QueryHeroProps) {
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
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 16,
        padding: 32,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 11,
          color: '#525252',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        Executive Summary
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 18,
          color: '#ffffff',
          marginBottom: 16,
          lineHeight: 1.4,
        }}
      >
        {result.query}
      </h2>
      <div
        style={{
          background: '#000000',
          border: '1px solid #1c1c1e',
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
            color: '#a1a1a6',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {result.summary}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 flex-wrap">
        {statItems.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: '#ffffff',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 10,
                color: '#737373',
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
