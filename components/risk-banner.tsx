'use client';

import { AlertTriangle } from 'lucide-react';

interface RiskBannerProps {
  text: string;
  strong?: string;
}

export function RiskBanner({ text, strong }: RiskBannerProps) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid rgba(255, 69, 58, 0.2)',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 16,
      }}
    >
      <AlertTriangle
        size={14}
        color="#ff453a"
        style={{ marginTop: 2, flexShrink: 0 }}
        aria-hidden="true"
      />
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 12,
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {strong && (
          <strong style={{ color: '#ff453a', fontWeight: 600 }}>{strong} </strong>
        )}
        {text}
      </p>
    </div>
  );
}
