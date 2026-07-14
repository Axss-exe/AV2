'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Thinking...', description: 'Analyzing query intent' },
  { label: 'Analyzing relationships...', description: 'Mapping entity networks' },
  { label: 'Validating data...', description: 'Cross-referencing sources' },
  { label: 'Loading results...', description: 'Preparing dashboard' },
];

interface AnalystLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
  durationMs?: number;
}

export function AnalystLoading({ isVisible, onComplete, durationMs = 3200 }: AnalystLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps([]);
      setProgress(0);
      return;
    }

    const stepDuration = durationMs / steps.length;
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (durationMs / 50);
        return next >= 100 ? 100 : next;
      });
    }, 50);

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      if (i === 0) return;
      stepTimers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i - 1]);
          setCurrentStep(i);
        }, i * stepDuration)
      );
    });

    const completeTimer = setTimeout(() => {
      clearInterval(progressInterval);
      setCompletedSteps([0, 1, 2, 3]);
      setProgress(100);
      setTimeout(() => onComplete?.(), 300);
    }, durationMs);

    return () => {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [isVisible, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(24px)', background: 'rgba(0,0,0,0.80)' }}
          role="status"
          aria-live="polite"
          aria-label="Loading intelligence analysis"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: '#0a0a0a',
              border: '1px solid #1c1c1e',
              borderRadius: 16,
              padding: 48,
              maxWidth: 480,
              width: '90vw',
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 11,
                  color: '#525252',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                Intelligence Analysis
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#ffffff',
                }}
              >
                Analyst Breakdown
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-4 mb-8">
              {steps.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isActive = currentStep === i && !isDone;
                return (
                  <div key={i} className="flex items-center gap-3">
                    {/* Step circle */}
                    <div className="relative flex-shrink-0" style={{ width: 20, height: 20 }}>
                      <motion.div
                        animate={{
                          background: isDone ? '#ffffff' : isActive ? '#ffffff' : '#1c1c1e',
                          borderColor: isDone ? '#ffffff' : isActive ? '#ffffff' : '#333333',
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: '1px solid',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isDone ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <Check size={10} color="#000000" strokeWidth={3} aria-hidden="true" />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ width: 6, height: 6, borderRadius: '50%', background: '#000000' }}
                          />
                        ) : null}
                      </motion.div>
                    </div>

                    {/* Step text */}
                    <div>
                      <motion.div
                        animate={{ color: isDone || isActive ? '#ffffff' : '#525252' }}
                        transition={{ duration: 0.3 }}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: isActive ? 500 : 400,
                          fontSize: 14,
                        }}
                      >
                        {step.label}
                      </motion.div>
                      <div
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 11,
                          color: '#525252',
                          marginTop: 1,
                        }}
                      >
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 2,
                background: '#1c1c1e',
                borderRadius: 1,
                overflow: 'hidden',
              }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                style={{
                  height: '100%',
                  background: '#ffffff',
                  borderRadius: 1,
                  width: `${progress}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 11,
                color: '#525252',
                textAlign: 'right',
              }}
            >
              {Math.round(progress)}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
