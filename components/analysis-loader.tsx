'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AnalysisLoaderProps {
  progress: number;
  statusText: string;
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

export function AnalysisLoader({
  progress,
  statusText,
  error,
  onCancel,
  onRetry,
}: AnalysisLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const diff = progress - displayProgress;
    if (Math.abs(diff) < 0.5) return;
    const step = diff / 8;
    const timer = setTimeout(() => {
      setDisplayProgress((prev) => {
        const next = prev + step;
        return Math.min(100, Math.max(0, next));
      });
    }, 40);
    return () => clearTimeout(timer);
  }, [progress, displayProgress]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        background: 'rgba(0,0,0,0.72)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Running intelligence analysis"
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '1px solid #1c1c1e',
          borderRadius: 16,
          padding: '36px 40px',
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          position: 'relative',
        }}
      >
        {/* Cancel button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#525252',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 6,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#a1a1a6')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
          aria-label="Cancel analysis"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {!error ? (
          <>
            {/* ATIS mark */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.14em',
                color: '#333333',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              ATIS Intelligence Pipeline
            </div>

            {/* Status text */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 15,
                color: '#f5f5f7',
                margin: '0 0 6px 0',
                minHeight: 22,
                transition: 'opacity 0.3s',
              }}
            >
              {statusText || 'Initialising...'}
            </p>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 12,
                color: '#525252',
                margin: '0 0 24px 0',
              }}
            >
              This may take up to 60 seconds. Do not close this window.
            </p>

            {/* Progress bar */}
            <div
              style={{
                height: 4,
                background: '#1c1c1e',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: 10,
              }}
              role="progressbar"
              aria-valuenow={Math.round(displayProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  height: '100%',
                  width: `${displayProgress}%`,
                  background: displayProgress >= 100 ? '#30d158' : '#007aff',
                  borderRadius: 2,
                  transition: 'width 0.08s linear, background 0.4s',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#333333',
              }}
            >
              <span>Analysis in progress</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
          </>
        ) : (
          <>
            {/* Error state */}
            <div className="flex items-start gap-3" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} color="#ff453a" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#ff453a',
                    margin: '0 0 4px 0',
                  }}
                >
                  Analysis failed
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 12,
                    color: '#737373',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onRetry}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#000000',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#d1d1d6')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
              >
                Retry
              </button>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #2c2c2e',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#737373',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#525252';
                  (e.currentTarget as HTMLElement).style.color = '#a1a1a6';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#2c2c2e';
                  (e.currentTarget as HTMLElement).style.color = '#737373';
                }}
              >
                Dismiss
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
