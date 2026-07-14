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
          color: '#a1a1a6',
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
            background: '#1c1c1e',
            border: '1px solid #333333',
            color: '#ffffff',
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
