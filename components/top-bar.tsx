'use client';

import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between px-8"
      style={{ height: 64, background: 'transparent' }}
      role="banner"
    >
      <div />
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center transition-colors duration-200"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'transparent',
            color: '#737373',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#737373';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label="Search"
        >
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center transition-colors duration-200"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'transparent',
            color: '#737373',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#737373';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
          <span
            className="absolute top-1 right-1 block"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff9f0a' }}
            aria-label="New notifications"
          />
        </button>

        {/* User Avatar */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#2c2c2e',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 12,
            color: '#a1a1a6',
            cursor: 'pointer',
          }}
          role="button"
          tabIndex={0}
          aria-label="User profile"
        >
          A
        </div>
      </div>
    </header>
  );
}
