'use client';

import { motion } from 'framer-motion';
import type { Article } from '@/lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface HeroArticleProps {
  article: Article;
  onClick: () => void;
}

export function HeroArticle({ article, onClick }: HeroArticleProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="flex"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        height: 320,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        marginBottom: 24,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
    >
      {/* Left: content (60%) */}
      <div
        className="flex flex-col justify-between"
        style={{
          flex: '0 0 60%',
          padding: '32px 36px',
          borderRight: '1px solid var(--border-default)',
        }}
      >
        <div>
          <div className="mb-4">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 10,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                color: '#ff9f0a',
              }}
            >
              Featured
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            {article.title}
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 14,
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}
          >
            {article.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            <span>{article.author}</span>
            <span style={{ margin: '0 8px', color: 'var(--border-default)' }}>·</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
          <button
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 13,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.2s',
              minHeight: 36,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-primary)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            Read Article
          </button>
        </div>
      </div>

      {/* Right: image/metadata (40%) */}
      <div
        className="flex flex-col justify-between"
        style={{
          flex: '0 0 40%',
          padding: '24px 28px',
          background: article.hero_image,
          position: 'relative',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 10,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--text-tertiary)',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 4,
              padding: '3px 8px',
            }}
          >
            {article.category_country}
          </span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 10,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: '#ff9f0a',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 4,
              padding: '3px 8px',
            }}
          >
            {article.category_sector}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
