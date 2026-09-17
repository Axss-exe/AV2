'use client';

import { Search, Bell, Menu, Globe, ChevronDown, Sun, Moon, Check } from 'lucide-react';
import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fetcher = (url: string) => fetch(url).then((response) => response.json());
  const { data, mutate } = useSWR<{ notifications: Array<{ id: string; title: string; body: string; href?: string | null; read: boolean; createdAt: string }> }>('/api/notifications', fetcher, { refreshInterval: 30000 });
  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const close = (event: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const markRead = async (id?: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? { id } : {}) });
    mutate();
  };

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

        <div className="relative" ref={panelRef}>
          <button
            className="relative flex items-center justify-center transition-colors duration-200"
            style={iconBtn}
            onClick={() => setOpen((value) => !value)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-control)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            aria-expanded={open}
          >
            <Bell size={16} strokeWidth={1.5} aria-hidden="true" />
            {unread > 0 && <span className="absolute right-1 top-1 block" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-warning)' }} aria-label="New notifications" />}
          </button>
          {open && <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-xl border shadow-xl" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }} role="dialog" aria-label="Notifications">
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-default)' }}><div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</p><p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{unread ? `${unread} unread` : 'All caught up'}</p></div>{unread > 0 && <button type="button" className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }} onClick={() => markRead()}><Check size={13} /> Mark all read</button>}</div>
            <div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet.</p> : notifications.map((item) => <button key={item.id} type="button" className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-bg-control" style={{ borderColor: 'var(--border-default)', background: item.read ? 'transparent' : 'var(--bg-control)' }} onClick={() => { markRead(item.id); if (item.href) window.location.href = item.href; }}><span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: item.read ? 'var(--border-default)' : 'var(--accent-warning)' }} /><span className="min-w-0"><span className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</span><span className="mt-1 block text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>{item.body}</span><span className="mt-1 block font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</span></span></button>)}</div>
          </div>}
        </div>
      </div>
    </header>
  );
}
