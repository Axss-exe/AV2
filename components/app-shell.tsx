'use client';

import { useState } from 'react';
import { Sidebar, MobileDrawer, navItems } from './sidebar';
import { TopBar } from './top-bar';
import { useATIS } from '@/lib/context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH  = 240;

const BOTTOM_NAV = navItems.slice(0, 5);

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useATIS();
  const sidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar — self-hidden on mobile via `hidden md:flex` */}
      <Sidebar />

      {/* Mobile slide-in drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/*
        Main content column.
        - Mobile: full width, no left offset.
        - Desktop (md+): offset to the right of the sidebar via inline style.
          We inject a <style> tag so the margin tracks the animated sidebar width
          without requiring Framer Motion on this div (avoids SSR hydration issues).
      */}
      <style>{`
        @media (min-width: 768px) {
          .atis-content {
            margin-left: ${sidebarWidth}px;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
        @media (max-width: 767px) {
          .atis-content { margin-left: 0 !important; }
        }
      `}</style>

      <div className="atis-content flex flex-col flex-1 min-w-0">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main
          className="flex-1 px-4 sm:px-6 md:px-8"
          style={{
            paddingTop: 0,
            paddingBottom: 'max(2.5rem, calc(56px + env(safe-area-inset-bottom) + 1rem))',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="atis-bottomnav md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-default)',
          height: 'calc(56px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Mobile navigation"
      >
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
              style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 10, letterSpacing: '0.03em' }}>
                {label}
              </span>
            </Link>
          );
        })}
        {/* "More" dots to open drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="More navigation options"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="5"  cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 10, letterSpacing: '0.03em' }}>
            More
          </span>
        </button>
      </nav>
    </div>
  );
}
