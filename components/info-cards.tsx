interface KeyEntityItem {
  entity_name: string;
  entity_type?: string;
  country?: string;
  sector?: string;
  significance_score?: number;
  summary?: string;
}

interface InfoCardsProps {
  findings: string[];
  opportunities: string[];
  riskFactors: string[];
  keyEntities?: KeyEntityItem[];
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 12,
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
                marginBottom: 6,
                paddingLeft: 12,
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 5,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--border-default)',
                }}
                aria-hidden="true"
              />
              {item}
            </li>
          ))
        ) : (
          <li
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 12,
              color: 'var(--text-dim)',
              fontStyle: 'italic',
            }}
          >
            No data available
          </li>
        )}
      </ul>
      <button
        style={{
          marginTop: 10,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 11,
          color: 'var(--text-primary)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'; }}
      >
        View all
      </button>
    </div>
  );
}

export function InfoCards({ findings, opportunities, riskFactors, keyEntities }: InfoCardsProps) {
  const safeFindings     = Array.isArray(findings)     ? findings     : [];
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
  const safeRisks        = Array.isArray(riskFactors)  ? riskFactors  : [];
  const safeEntities     = Array.isArray(keyEntities)  ? keyEntities  : [];
  const hasEntities      = safeEntities.length > 0;

  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${hasEntities ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}
    >
      <InfoCard title="Key Findings"   items={safeFindings} />
      <InfoCard title="Opportunities"  items={safeOpportunities} />
      <InfoCard title="Risk Factors"   items={safeRisks} />
      {hasEntities && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 14,
            padding: 18,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Key Entities
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {safeEntities.slice(0, 5).map((ke, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: i < Math.min(safeEntities.length, 5) - 1 ? '1px solid var(--border-default)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 2,
                  }}
                >
                  {ke.entity_name}
                </div>
                <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                  {ke.sector && (
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        background: 'var(--border-default)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 4,
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {ke.sector}
                    </span>
                  )}
                  {typeof ke.significance_score === 'number' && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-dim)',
                      }}
                    >
                      Score: {ke.significance_score}
                    </span>
                  )}
                </div>
                {ke.summary && (
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      lineHeight: 1.4,
                      margin: 0,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ke.summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
