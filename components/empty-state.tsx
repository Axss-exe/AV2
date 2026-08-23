interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div style={{ color: 'var(--border-default)', marginBottom: 16 }} aria-hidden="true">
          {icon}
        </div>
      )}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 14,
          color: 'var(--text-dim)',
          marginBottom: description ? 6 : 0,
        }}
      >
        {message ?? 'No data available.'}
      </p>
      {description && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 12,
            color: 'var(--border-default)',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
