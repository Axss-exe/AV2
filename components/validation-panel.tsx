'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TraceCard } from '@/components/trace-card';
import { DocumentView } from '@/components/document-view';
import { RiskBanner } from '@/components/risk-banner';
import { getTracesByOpportunity } from '@/lib/data';
import type { Opportunity, Trace } from '@/lib/types';

interface ValidationPanelProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
}

interface AccordionSection {
  id: string;
  title: string;
  subtitle: string;
  traceFilter: (t: Trace) => boolean;
  showRisks?: boolean;
}

const SECTIONS: AccordionSection[] = [
  {
    id: 'perimeter',
    title: 'Transaction Perimeter Trace',
    subtitle: 'Regulatory and market boundary validation',
    traceFilter: (t) => t.relationship.includes('REG') || t.relationship.includes('PROC'),
  },
  {
    id: 'roadmap',
    title: 'Operational Roadmap Trace',
    subtitle: 'Phase-by-phase milestone validation',
    traceFilter: (t) => t.badge === 'validated',
  },
  {
    id: 'matrix',
    title: 'Direct Action Matrix Trace',
    subtitle: 'Action item evidence and source mapping',
    traceFilter: (t) => t.badge === 'external' || t.relationship.includes('FUND'),
  },
  {
    id: 'gaps',
    title: 'Gaps & External Assumptions',
    subtitle: 'Unvalidated claims and data gaps',
    traceFilter: (t) => t.badge === 'gap',
    showRisks: true,
  },
];

export function ValidationPanel({ opportunity, open, onClose }: ValidationPanelProps) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('perimeter');

  useEffect(() => {
    if (!opportunity || !open) return;
    setLoading(true);
    setTraces([]);
    getTracesByOpportunity(opportunity.id)
      .then(setTraces)
      .catch(() => setTraces([]))
      .finally(() => setLoading(false));
  }, [opportunity, open]);

  if (!opportunity) return null;

  const totalTraces = traces.length;
  const validatedTraces = traces.filter((t) => t.badge === 'validated').length;
  const gapTraces = traces.filter((t) => t.badge === 'gap').length;
  const externalTraces = traces.filter((t) => t.badge === 'external').length;
  const uniqueSources = new Set(traces.map((t) => t.source)).size;

  const stats = [
    { label: 'Traces', value: totalTraces || '—' },
    { label: 'Validated', value: validatedTraces || '—' },
    { label: 'Gaps', value: gapTraces || '—' },
    { label: 'External', value: externalTraces || '—' },
    { label: 'Sources', value: uniqueSources || '—' },
  ];

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="p-0 border-0"
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-default)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Panel Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--border-default)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
              >
                V
              </span>
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  marginBottom: 2,
                  lineHeight: 1.3,
                }}
              >
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                  }}
                >
                  {opportunity.id}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 10,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                    color: 'var(--text-tertiary)',
                    background: 'var(--border-default)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 4,
                    padding: '1px 6px',
                  }}
                >
                  {opportunity.validation_score} Validated
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close validation panel"
            style={{
              width: 24,
              height: 24,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Stats Strip */}
          <div
            className="flex gap-6 flex-wrap"
            style={{
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 22,
                    color: 'var(--text-primary)',
                  }}
                >
                  {loading ? '—' : stat.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Document View */}
          <DocumentView opportunity={opportunity} />

          {/* Accordion Sections */}
          <div className="flex flex-col gap-3">
            {SECTIONS.map((section, sIdx) => {
              const sectionTraces = loading
                ? []
                : traces.filter(section.traceFilter);
              const isOpen = openSection === section.id;

              return (
                <div
                  key={section.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left"
                    aria-expanded={isOpen}
                    aria-controls={`section-${section.id}`}
                    style={{
                      padding: '18px 22px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Number circle */}
                      <motion.div
                        animate={{
                          background: isOpen ? 'var(--text-primary)' : 'var(--border-default)',
                          color: isOpen ? 'var(--bg-primary)' : 'var(--text-primary)',
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {sIdx + 1}
                      </motion.div>

                      {/* Title + Subtitle */}
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            fontSize: 14,
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                          }}
                        >
                          {section.title}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 400,
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            marginTop: 2,
                          }}
                        >
                          {section.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Trace count pill */}
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 10,
                          color: 'var(--text-tertiary)',
                          background: 'var(--border-default)',
                          borderRadius: 4,
                          padding: '2px 8px',
                        }}
                      >
                        {loading ? '—' : sectionTraces.length} traces
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChevronDown
                          size={18}
                          color="var(--text-tertiary)"
                          aria-hidden="true"
                        />
                      </motion.div>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`section-${section.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          height: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.35 },
                        }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: '0 22px 18px',
                            borderTop: '1px solid var(--border-default)',
                          }}
                        >
                          {loading ? (
                            <div className="flex flex-col gap-2 pt-4">
                              {[...Array(2)].map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    height: 80,
                                    background: 'var(--bg-primary)',
                                    borderRadius: 10,
                                    animation: 'pulse-soft 1.5s infinite',
                                    marginTop: i === 0 ? 4 : 0,
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="pt-4">
                              {/* Risk Banners in section 4 */}
                              {section.showRisks && sectionTraces.length > 0 && (
                                <div className="mb-2">
                                  {sectionTraces.slice(0, 2).map((trace) => (
                                    <RiskBanner
                                      key={trace.id}
                                      strong="Unvalidated Assumption:"
                                      text={trace.fact}
                                    />
                                  ))}
                                </div>
                              )}

                              {sectionTraces.length === 0 ? (
                                <p
                                  style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 300,
                                    fontSize: 12,
                                    color: 'var(--text-dim)',
                                    paddingTop: 8,
                                  }}
                                >
                                  No traces found for this section.
                                </p>
                              ) : (
                                sectionTraces.map((trace) => (
                                  <TraceCard key={trace.id} trace={trace} />
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
