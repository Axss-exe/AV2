'use client';

import { Search, Bell, Menu, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { useATIS } from '@/lib/context';
import { PERSPECTIVE_COUNTRIES } from '@/lib/perspective';
import { useTheme } from '@/components/theme-provider';

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { perspectiveCountry, setPerspectiveCountry } = useATIS();
  const { theme, toggleTheme } = useTheme();

  const iconBtn = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    cursor: 'pointer',
  } as const;

  return (
    <header
      className="atis-topbar flex items-center justify-between px-4 sm:px-8"
      style={{ height: 64, background: 'transparent' }}
      role="banner"
    >
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden flex items-center justify-center"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', color: 'var(--text-tertiary)', border: 'none', cursor: 'pointer' }}
      >
        <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Perspective selector — the country the user is analysing FROM */}
      <div
        className="relative flex items-center"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: '6px 10px',
          gap: 8,
        }}
      >
        <Globe size={15} strokeWidth={1.5} color="var(--text-secondary)" aria-hidden="true" />
        <div className="flex flex-col" style={{ lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            Perspective
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
          >
            {perspectiveCountry}
          </span>
        </div>
        <ChevronDown size={13} color="var(--text-dim)" aria-hidden="true" />
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
        {/* Theme toggle — Obsidian / Paper */}
        <button
          className="flex items-center justify-center transition-colors duration-200"
          style={iconBtn}
          onClick={toggleTheme}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to Paper (light)' : 'Switch to Obsidian (dark)'}
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={1.5} aria-hidden="true" />
            : <Moon size={16} strokeWidth={1.5} aria-hidden="true" />}
        </button>

        <button
          className="flex items-center justify-center transition-colors duration-200"
          style={iconBtn}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Search"
        >
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <button
          className="relative flex items-center justify-center transition-colors duration-200"
          style={iconBtn}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
          <span
            className="absolute top-1 right-1 block"
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-warning)' }}
            aria-label="New notifications"
          />
        </button>

        <div
          className="flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-control-active)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer' }}
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
