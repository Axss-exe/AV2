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
        background: '#000000',
        border: '1px solid #1c1c1e',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#262626';
        (e.currentTarget as HTMLElement).style.background = '#0a0a0a';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#1c1c1e';
        (e.currentTarget as HTMLElement).style.background = '#000000';
      }}
    >
      {/* Flag + Name Row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          style={{
            width: 36,
            height: 24,
            background: '#1c1c1e',
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
              color: '#ffffff',
            }}
          >
            {country.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 11,
              color: '#737373',
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
              color: '#737373',
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
              color: '#ffffff',
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
              color: '#737373',
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
              color: '#30d158',
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
              color: '#737373',
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
              color: '#ffffff',
            }}
          >
            {country.population}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
