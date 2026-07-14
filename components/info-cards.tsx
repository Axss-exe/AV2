interface InfoCardsProps {
  findings: string[];
  opportunities: string[];
  riskFactors: string[];
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
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 11,
          color: '#737373',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 12,
              color: '#a1a1a6',
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
                background: '#333333',
              }}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
      <button
        style={{
          marginTop: 10,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 11,
          color: '#ffffff',
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

export function InfoCards({ findings, opportunities, riskFactors }: InfoCardsProps) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <InfoCard title="Key Findings" items={findings} />
      <InfoCard title="Opportunities" items={opportunities} />
      <InfoCard title="Risk Factors" items={riskFactors} />
    </div>
  );
}
