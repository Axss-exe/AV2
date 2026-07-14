'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Clock,
  Network,
  Newspaper,
  MapPin,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Query', href: '/query', icon: Search },
  { label: 'History', href: '/history', icon: Clock },
  { label: 'Entities', href: '/entities', icon: Network },
  { label: 'Newsroom', href: '/newsroom', icon: Newspaper },
  { label: 'Country Map', href: '/country-map', icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[240px] flex flex-col z-40"
      style={{ background: '#0a0a0a', borderRight: '1px solid #1c1c1e' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3" style={{ borderBottom: '1px solid #1c1c1e' }}>
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: '#ffffff',
            borderRadius: 6,
          }}
          aria-hidden="true"
        >
          <span style={{ color: '#000000', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
            A
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 13,
              color: '#ffffff',
              letterSpacing: '0.02em',
            }}
          >
            ATIS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 9,
              color: '#525252',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              lineHeight: 1.3,
            }}
          >
            Africa Trade &amp; Intelligence
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" role="navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex items-center gap-3 transition-all duration-200 group"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: isActive ? '#1c1c1e' : 'transparent',
                color: isActive ? '#ffffff' : '#a1a1a6',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#1c1c1e';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#d1d1d6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1a6';
                }
              }}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2 : 1.5}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-0 w-[2px] h-5 rounded-r"
                  style={{ background: '#ffffff' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid #1c1c1e' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#2c2c2e',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 11,
            color: '#a1a1a6',
          }}
          aria-hidden="true"
        >
          A
        </div>
        <div className="flex flex-col min-w-0">
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 12,
              color: '#ffffff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Analyst
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 10,
              color: '#737373',
            }}
          >
            Intelligence Desk
          </span>
        </div>
      </div>
    </aside>
  );
}
