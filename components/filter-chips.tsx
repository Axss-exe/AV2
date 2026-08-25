'use client';

interface FilterChipsProps {
  options: string[];
  active: string[];
  onToggle: (value: string) => void;
  label?: string;
}

export function FilterChips({ options, active, onToggle, label }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label ?? 'Filter options'}>
      {options.map((opt) => {
        const isActive = active.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            aria-pressed={isActive}
            className="transition-all duration-200"
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: isActive ? 'var(--border-default)' : 'var(--border-default)',
              background: isActive ? 'var(--border-hover)' : 'var(--border-default)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
