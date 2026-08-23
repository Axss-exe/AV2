'use client';

import { motion } from 'framer-motion';
import type { Country } from '@/lib/types';

interface CountryCardProps {
  country: Country;
  index: number;
  onClick: () => void;
}

export function CountryCard({ country, index, onClick }: CountryCardProps) {
  return (
    <motion.article
      custom={index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)';
      }}
    >
      {/* Flag + Name Row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          style={{
            width: 36,
            height: 24,
            background: 'var(--border-default)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {country.flag}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          >
            {country.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            {country.region}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 10,
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}
          >
            GDP
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          >
            {country.gdp}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 10,
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}
          >
            Growth
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          >
            {country.gdp_growth}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 10,
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}
          >
            Population
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          >
            {country.population}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
