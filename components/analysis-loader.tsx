'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AnalysisLoaderProps {
  progress: number;
  statusText: string;
  jobId?: string | null;
  queued?: boolean;
  stage?: string;
  completedStages?: string[];
  positionInQueue?: number;
  connectionWarning?: string | null;
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

export function AnalysisLoader({
  progress,
  statusText,
  jobId,
  queued,
  stage,
  completedStages = [],
  positionInQueue,
  connectionWarning,
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
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
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
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 6,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
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
                color: 'var(--border-default)',
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
                color: 'var(--text-primary)',
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
                color: 'var(--text-dim)',
                margin: '0 0 24px 0',
              }}
            >
              Analyses can take 2–5 minutes. You can keep this window open while the pipeline runs.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginBottom: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
              {jobId && <span>JOB {jobId}</span>}
              {queued && <span>QUEUED{positionInQueue !== undefined ? ` · POSITION ${positionInQueue}` : ''}</span>}
              {!queued && stage && <span>STAGE {stage}</span>}
            </div>
            {connectionWarning && <p role="status" style={{ color: '#ff9f0a', fontSize: 11, margin: '-8px 0 16px' }}>{connectionWarning}</p>}
            {completedStages.length > 0 && <div className="flex flex-wrap gap-2" style={{ marginBottom: 18 }} aria-label="Completed analysis stages">{completedStages.map((completedStage) => <span key={completedStage} style={{ border: '1px solid var(--border-hover)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-dim)', fontSize: 10 }}>{completedStage}</span>)}</div>}

            {/* Progress bar */}
            <div
              style={{
                height: 4,
                background: 'var(--border-default)',
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
                  background: displayProgress >= 100 ? 'var(--text-primary)' : '#007aff',
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
                color: 'var(--border-default)',
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
                    color: 'var(--text-muted)',
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
                  background: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--bg-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--text-secondary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--text-primary)')}
              >
                Retry
              </button>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border-hover)',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-dim)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
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
