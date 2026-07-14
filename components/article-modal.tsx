'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ValidationPanel } from '@/components/validation-panel';
import { useATIS } from '@/lib/context';
import { getOpportunity } from '@/lib/data';
import type { Article, Opportunity } from '@/lib/types';

interface ArticleModalProps {
  article: Article | null;
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function parseContent(content: string): { type: 'heading' | 'paragraph'; text: string }[] {
  return content.split('\n\n').map((block) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return { type: 'heading' as const, text: trimmed.replace(/\*\*/g, '') };
    }
    return { type: 'paragraph' as const, text: trimmed.replace(/\*\*/g, '') };
  }).filter((b) => b.text.length > 0);
}

export function ArticleModal({ article, open, onClose }: ArticleModalProps) {
  const { setSelectedOpportunity, setValidationPanelOpen, validationPanelOpen, selectedOpportunity } = useATIS();
  const [relatedOpps, setRelatedOpps] = useState<Opportunity[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(false);

  useEffect(() => {
    if (!article || !open) return;
    if (article.related_opportunities.length === 0) return;

    setLoadingOpps(true);
    Promise.all(article.related_opportunities.map((id) => getOpportunity(id)))
      .then((opps) => setRelatedOpps(opps.filter(Boolean) as Opportunity[]))
      .catch(() => setRelatedOpps([]))
      .finally(() => setLoadingOpps(false));
  }, [article, open]);

  const openValidationTrace = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setValidationPanelOpen(true);
  };

  if (!article) return null;

  const blocks = parseContent(article.content);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                zIndex: 48,
              }}
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: 768,
                background: '#0a0a0a',
                borderLeft: '1px solid #1c1c1e',
                zIndex: 49,
                display: 'flex',
                flexDirection: 'column',
              }}
              role="dialog"
              aria-modal="true"
              aria-label={article.title}
            >
              {/* Header */}
              <div
                className="flex-shrink-0"
                style={{
                  padding: '24px 32px 20px',
                  borderBottom: '1px solid #1c1c1e',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 10,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.06em',
                          color: '#a1a1a6',
                          background: '#1c1c1e',
                          borderRadius: 4,
                          padding: '2px 8px',
                        }}
                      >
                        {article.category_country}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 10,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.06em',
                          color: '#ff9f0a',
                          background: '#1c1c1e',
                          borderRadius: 4,
                          padding: '2px 8px',
                        }}
                      >
                        {article.category_sector}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 20,
                        color: '#ffffff',
                        lineHeight: 1.25,
                        marginBottom: 8,
                      }}
                    >
                      {article.title}
                    </h2>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 11,
                        color: '#737373',
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap' as const,
                      }}
                    >
                      <span>{article.author}</span>
                      <span style={{ color: '#333333' }}>·</span>
                      <span>{formatDate(article.published_at)}</span>
                      <span style={{ color: '#333333' }}>·</span>
                      <span>{estimateReadTime(article.content)}</span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close article"
                    style={{
                      width: 32,
                      height: 32,
                      background: '#1c1c1e',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: '#737373',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                      (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                      (e.currentTarget as HTMLButtonElement).style.color = '#737373';
                    }}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                {/* Article content */}
                <div className="mb-10">
                  {blocks.map((block, i) => (
                    block.type === 'heading' ? (
                      <h3
                        key={i}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#ffffff',
                          marginTop: i === 0 ? 0 : 24,
                          marginBottom: 10,
                          lineHeight: 1.4,
                        }}
                      >
                        {block.text}
                      </h3>
                    ) : (
                      <p
                        key={i}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 13,
                          color: '#a1a1a6',
                          lineHeight: 1.7,
                          marginBottom: 16,
                        }}
                      >
                        {block.text}
                      </p>
                    )
                  ))}
                </div>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 400,
                          fontSize: 11,
                          color: '#737373',
                          background: '#111111',
                          border: '1px solid #1c1c1e',
                          borderRadius: 6,
                          padding: '3px 10px',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Related Opportunities */}
                {article.related_opportunities.length > 0 && (
                  <div>
                    <div
                      style={{
                        height: 1,
                        background: '#1c1c1e',
                        marginBottom: 20,
                      }}
                    />
                    <h3
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#ffffff',
                        marginBottom: 12,
                      }}
                    >
                      Related Opportunities
                    </h3>

                    {loadingOpps ? (
                      <div className="flex flex-col gap-3">
                        {[...Array(1)].map((_, i) => (
                          <div
                            key={i}
                            style={{
                              height: 80,
                              background: '#000000',
                              border: '1px solid #1c1c1e',
                              borderRadius: 12,
                              animation: 'pulse-soft 1.5s infinite',
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {relatedOpps.map((opp) => (
                          <div
                            key={opp.id}
                            style={{
                              background: '#000000',
                              border: '1px solid #1c1c1e',
                              borderRadius: 12,
                              padding: '16px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: '#525252',
                                  }}
                                >
                                  {opp.id}
                                </span>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    fontSize: 10,
                                    color: '#30d158',
                                    background: '#1c1c1e',
                                    borderRadius: 4,
                                    padding: '1px 6px',
                                  }}
                                >
                                  {opp.validation_score} Validated
                                </span>
                              </div>
                              <div
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: '#ffffff',
                                  marginBottom: 4,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {opp.title}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontWeight: 400,
                                  fontSize: 11,
                                  color: '#737373',
                                }}
                              >
                                {opp.markets.join(' · ')}
                              </div>
                            </div>
                            <button
                              onClick={() => openValidationTrace(opp)}
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 500,
                                fontSize: 12,
                                color: '#ffffff',
                                background: '#1c1c1e',
                                border: '1px solid #333333',
                                borderRadius: 8,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                minHeight: 36,
                                transition: 'background 0.2s',
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                              }}
                            >
                              View Validation Trace
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Validation Panel (layered on top of article modal) */}
      <ValidationPanel
        opportunity={selectedOpportunity}
        open={validationPanelOpen}
        onClose={() => setValidationPanelOpen(false)}
      />
    </>
  );
}
