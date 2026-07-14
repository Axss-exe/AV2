'use client';

import { motion } from 'framer-motion';
import type { Opportunity } from '@/lib/types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  index?: number;
  onViewTrace?: (opp: Opportunity) => void;
}

const statusColors: Record<string, string> = {
  active: '#30d158',
  pending: '#ff9f0a',
  closed: '#525252',
};

export function OpportunityCard({ opportunity, index = 0, onViewTrace }: OpportunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ translateY: -1 }}
      style={{
        background: '#0a0a0a',
        border: '1px solid #1c1c1e',
        borderRadius: 14,
        padding: 20,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#262626';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c1e';
      }}
      onClick={() => onViewTrace?.(opportunity)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 13,
            color: '#ffffff',
            lineHeight: 1.4,
          }}
        >
          {opportunity.title}
        </div>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: '#1c1c1e',
            border: '1px solid #333333',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 10,
            color: '#a1a1a6',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {opportunity.validation_score}
        </span>
      </div>

      {/* Markets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {opportunity.markets.map((market) => (
          <span
            key={market}
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: '#111111',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 10,
              color: '#737373',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {market}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: '#ffffff',
            }}
          >
            {opportunity.value}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 11,
              color: '#737373',
            }}
          >
            {opportunity.duration}
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 10,
            color: statusColors[opportunity.status] ?? '#737373',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColors[opportunity.status] ?? '#737373',
            }}
            aria-hidden="true"
          />
          {opportunity.status}
        </span>
      </div>
    </motion.div>
  );
}
