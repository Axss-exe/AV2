'use client';

import { Search, Bell, Menu, Globe, ChevronDown } from 'lucide-react';
import { useATIS } from '@/lib/context';
import { PERSPECTIVE_COUNTRIES } from '@/lib/perspective';

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { perspectiveCountry, setPerspectiveCountry } = useATIS();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-8"
      style={{ height: 64, background: 'transparent' }}
      role="banner"
    >
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden flex items-center justify-center"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'transparent',
          color: '#a1a1a6',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Perspective selector — the country the user is analysing FROM */}
      <div
        className="relative flex items-center"
        style={{
          background: '#0a0a0a',
          border: '1px solid #1c1c1e',
          borderRadius: 10,
          padding: '6px 10px',
          gap: 8,
        }}
      >
        <Globe size={15} strokeWidth={1.5} color="#30d158" aria-hidden="true" />
        <div className="flex flex-col" style={{ lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#525252',
            }}
          >
            Perspective
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: '#f5f5f7',
            }}
          >
            {perspectiveCountry}
          </span>
        </div>
        <ChevronDown size={13} color="#525252" aria-hidden="true" />
        {/* Invisible native select overlaid for accessible, no-redesign control */}
        <select
          value={perspectiveCountry}
          onChange={(e) => setPerspectiveCountry(e.target.value)}
          aria-label="Select perspective country"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            appearance: 'none',
          }}
        >
          {PERSPECTIVE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-center transition-colors duration-200"
          style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', color: '#737373', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#737373'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Search"
        >
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <button
          className="relative flex items-center justify-center transition-colors duration-200"
          style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', color: '#737373', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#737373'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
          <span
            className="absolute top-1 right-1 block"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff9f0a' }}
            aria-label="New notifications"
          />
        </button>

        <div
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#2c2c2e', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: '#a1a1a6', cursor: 'pointer' }}
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
