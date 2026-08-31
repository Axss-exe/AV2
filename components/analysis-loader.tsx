'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';

// Pipeline stages in order for display
const PIPELINE_STAGES = [
  'Input Validation',
  'Article Understanding',
  'Perspective Ecosystem Loading',
  'Perspective Impact Mapping',
  'Target Resolution',
  'Graph Traversal',
  'Impact Analysis',
  'Final Synthesis',
  'Validation Grounding',
  'Output Assembly',
];

interface AnalysisLoaderProps {
  progress: number;
  statusText: string;
  error: string | null;
  jobId: string | null;
  jobStatus: string | null;
  checkpoint: {
    current_stage?: string;
    completed_stages?: string[];
    stage_durations?: Record<string, number>;
  } | null;
  onCancel: () => void;
  onRetry: () => void;
}

// User-friendly stage names mapping
const STAGE_LABELS: Record<string, string> = {
  'INPUT_VALIDATION': 'Input Validation',
  'ARTICLE_UNDERSTANDING': 'Article Understanding',
  'PERSPECTIVE_ECOSYSTEM_LOADING': 'Perspective Ecosystem Loading',
  'PERSPECTIVE_IMPACT_MAPPING': 'Perspective Impact Mapping',
  'TARGET_RESOLUTION': 'Target Resolution',
  'GRAPH_TRAVERSAL': 'Graph Traversal',
  'IMPACT_ANALYSIS': 'Impact Analysis',
  'FINAL_SYNTHESIS': 'Final Synthesis',
  'VALIDATION_GROUNDING': 'Validation Grounding',
  'OUTPUT_ASSEMBLY': 'Output Assembly',
  'COMPLETE': 'Finalizing',
};

function normalizeStatus(status: string | null): string {
  if (!status) return '';
  return String(status).trim().toUpperCase();
}

export function AnalysisLoader({
  progress,
  statusText,
  error,
  jobId,
  jobStatus,
  checkpoint,
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

  // Determine current stage from checkpoint or status
  const getCurrentStage = (): string => {
    if (checkpoint?.current_stage) {
      return STAGE_LABELS[checkpoint.current_stage.toUpperCase()] || checkpoint.current_stage;
    }
    
    const normalized = normalizeStatus(jobStatus);
    if (normalized === 'QUEUED') return 'Waiting in queue';
    if (normalized === 'PROCESSING') return 'Processing';
    if (normalized === 'COMPLETED') return 'Complete';
    
    return statusText || 'Initializing...';
  };

  // Get completed stages from checkpoint
  const getCompletedStages = (): string[] => {
    if (checkpoint?.completed_stages) {
      return checkpoint.completed_stages.map(
        (stage) => STAGE_LABELS[stage.toUpperCase()] || stage
      );
    }
    return [];
  };

  const currentStage = getCurrentStage();
  const completedStages = getCompletedStages();
  const normalizedStatus = normalizeStatus(jobStatus);
  const isQueued = normalizedStatus === 'QUEUED';
  const isProcessing = normalizedStatus === 'PROCESSING' || (normalizedStatus === '' && progress < 100);
  const isComplete = normalizedStatus === 'COMPLETED' || progress >= 100;

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
              {statusText || currentStage || 'Initializing...'}
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
              {isQueued ? 'Job queued - waiting for processing to start' : 
               isProcessing ? 'The intelligence engine is processing the article. This may take several minutes.' :
               isComplete ? 'Analysis complete' :
               'Analyzing article from a ' + (statusText.includes('Zimbabwe') ? 'Zimbabwe' : 'selected') + ' perspective'}
              {jobId && ` (Job: ${jobId.slice(0, 8)}...)`}
            </p>

            {/* Pipeline stage visualization */}
            {isProcessing && completedStages.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  Pipeline Progress
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PIPELINE_STAGES.map((stage, index) => {
                    const isCompleted = completedStages.some(
                      (s) => s.toUpperCase() === stage.toUpperCase()
                    );
                    const isCurrent = stage === currentStage || 
                      (currentStage === 'Processing' && !isCompleted && index === completedStages.length);
                    
                    return (
                      <div
                        key={stage}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            background: isCompleted 
                              ? 'var(--text-primary)' 
                              : isCurrent 
                                ? '#007aff' 
                                : 'transparent',
                            border: isCompleted 
                              ? 'none' 
                              : isCurrent 
                                ? '2px solid #007aff' 
                                : '1px solid var(--border-default)',
                            color: isCompleted ? 'var(--bg-primary)' : isCurrent ? '#007aff' : 'var(--border-default)',
                          }}
                        >
                          {isCompleted ? <CheckCircle size={10} /> : isCurrent ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                        </span>
                        <span
                          style={{
                            color: isCompleted 
                              ? 'var(--text-primary)' 
                              : isCurrent 
                                ? 'var(--text-tertiary)' 
                                : 'var(--text-dim)',
                            fontWeight: isCompleted || isCurrent ? 600 : 300,
                          }}
                        >
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              <span>{isQueued ? 'Waiting in queue' : isProcessing ? 'Analysis in progress' : 'Finalizing'}</span>
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
                  {normalizedStatus === 'CANCELLED' ? 'Analysis cancelled' : 'Analysis failed'}
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
