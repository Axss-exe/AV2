'use client';

import { motion } from 'framer-motion';
import type { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  index: number;
  onClick: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Generate deterministic CSS gradient from article hero_image field
function getGradientStyle(heroImage: string, categoryCountry: string): string {
  // Each country gets a unique direction/hue shift
  const gradients: Record<string, string> = {
    Kenya: 'linear-gradient(145deg, #0f1f0f 0%, #1a2e1a 50%, #0a0a0a 100%)',
    Tanzania: 'linear-gradient(135deg, #0a0f1e 0%, #111a2c 50%, #0a0a0a 100%)',
    Nigeria: 'linear-gradient(150deg, #1e1500 0%, #2c2000 50%, #0a0a0a 100%)',
    Ghana: 'linear-gradient(125deg, #1a0e00 0%, #261400 50%, #0a0a0a 100%)',
    Ethiopia: 'linear-gradient(160deg, #0a0a14 0%, #111122 50%, #0a0a0a 100%)',
    Rwanda: 'linear-gradient(140deg, #0f0a1e 0%, #1a1130 50%, #0a0a0a 100%)',
    Uganda: 'linear-gradient(130deg, #1e0a00 0%, #2c1000 50%, #0a0a0a 100%)',
  };
  return gradients[categoryCountry] ?? heroImage ?? 'linear-gradient(135deg, #1c1c1e 0%, #0a0a0a 100%)';
}

export function ArticleCard({ article, index, onClick }: ArticleCardProps) {
  const gradientBg = getGradientStyle(article.hero_image, article.category_country);

  return (
    <motion.article
      custom={index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#333333';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#1c1c1e';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Image area */}
      <div
        style={{
          height: 140,
          background: gradientBg,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '10px 12px',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {/* Badges */}
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

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 13,
            color: '#ffffff',
            lineHeight: 1.4,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {article.title}
        </h3>

        {/* Meta */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 11,
            color: '#737373',
          }}
        >
          {formatDate(article.published_at)}
        </p>
      </div>
    </motion.article>
  );
}
