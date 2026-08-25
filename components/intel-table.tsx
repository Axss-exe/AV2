import type { IntelTableRow } from '@/lib/types';

const statusStyles: Record<string, { color: string; border: string }> = {
  Validated: { color: 'var(--text-tertiary)', border: 'var(--border-default)' },
  Gap: { color: '#ff453a', border: '#ff453a' },
  External: { color: '#ff9f0a', border: '#ff9f0a' },
};

interface IntelTableProps {
  rows: IntelTableRow[];
  /** Optional — when provided, rows become clickable and pass their source name. */
  onRowClick?: (source: string) => void;
}

export function IntelTable({ rows: rowsProp, onRowClick }: IntelTableProps) {
  const rows = Array.isArray(rowsProp) ? rowsProp : [];
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-default)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Structured Intelligence
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Source', 'Relationship', 'Confidence', 'Status', 'Last Updated'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border-default)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    fontStyle: 'italic',
                  }}
                >
                  No intelligence data available
                </td>
              </tr>
            ) : null}
            {rows.map((row, i) => {
              const ss = statusStyles[row.status] ?? statusStyles.Validated;
              return (
                <tr
                  key={i}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border-default)' : 'none',
                    transition: 'background 0.15s',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onClick={() => onRowClick?.(row.source)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row.source);
                    }
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-control)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {row.source}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.relationship}
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                    {row.confidence}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: `1px solid ${ss.border}`,
                        background: 'var(--border-default)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 10,
                        color: ss.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                      aria-label={`Status: ${row.status}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {row.last_updated}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
