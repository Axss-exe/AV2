import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <AlertTriangle size={24} color="#ff453a" style={{ marginBottom: 12 }} aria-hidden="true" />
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: 14,
          color: 'var(--text-tertiary)',
          marginBottom: onRetry ? 16 : 0,
          maxWidth: 320,
        }}
      >
        {message ?? 'Connection to intelligence service interrupted. Displaying cached intelligence.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 16px',
            borderRadius: 8,
            background: 'var(--border-default)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
