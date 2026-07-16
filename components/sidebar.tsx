'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Clock,
  Network,
  Newspaper,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useATIS } from '@/lib/context';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Query', href: '/query', icon: Search },
  { label: 'History', href: '/history', icon: Clock },
  { label: 'Entities', href: '/entities', icon: Network },
  { label: 'Newsroom', href: '/newsroom', icon: Newspaper },
  { label: 'Country Map', href: '/country-map', icon: MapPin },
];

const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH = 240;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useATIS();

  const width = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      className="fixed left-0 top-0 h-full flex flex-col z-40 overflow-hidden"
      style={{ background: '#0a0a0a', borderRight: '1px solid #1c1c1e' }}
      aria-label="Main navigation"
    >
      {/* Logo + collapse toggle */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          height: 64,
          borderBottom: '1px solid #1c1c1e',
          padding: sidebarCollapsed ? '0 14px' : '0 16px 0 16px',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}
      >
        {/* Brand mark — always visible */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              background: '#ffffff',
              borderRadius: 6,
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ATIS%20SYMBOL-ooX7WbP3p5bVAv6S3KR9oEkEmh3IGU.png"
              alt="ATIS symbol"
              width={30}
              height={30}
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          {/* Text — fades out when collapsed */}
          <motion.div
            animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.18 }}
            className="flex flex-col overflow-hidden"
            style={{ minWidth: 0 }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                color: '#ffffff',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
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
                whiteSpace: 'nowrap',
              }}
            >
              Africa Trade &amp; Intelligence
            </span>
          </motion.div>
        </div>

        {/* Collapse toggle — only shown when expanded */}
        {!sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.12 }}
            onClick={() => setSidebarCollapsed(true)}
            className="flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#525252',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#525252';
            }}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={14} strokeWidth={1.5} aria-hidden="true" />
          </motion.button>
        )}
      </div>

      {/* Expand toggle shown when collapsed */}
      {sidebarCollapsed && (
        <div
          className="flex items-center justify-center"
          style={{ padding: '8px 0 4px' }}
        >
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="flex items-center justify-center transition-colors duration-150"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#525252',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#525252';
            }}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Nav Items */}
      <nav
        className="flex-1 flex flex-col gap-1"
        style={{ padding: sidebarCollapsed ? '8px 10px' : '8px 10px' }}
        role="navigation"
      >
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? label : undefined}
              className="flex items-center relative transition-all duration-150"
              style={{
                gap: sidebarCollapsed ? 0 : 12,
                padding: sidebarCollapsed ? '9px 0' : '8px 10px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
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
                style={{ flexShrink: 0 }}
              />
              <motion.span
                animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 13,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-0 w-[2px] rounded-r"
                  style={{ background: '#ffffff', top: 6, bottom: 6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          borderTop: '1px solid #1c1c1e',
          padding: sidebarCollapsed ? '12px 0' : '12px 14px',
          gap: 10,
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        }}
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
        <motion.div
          animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.15 }}
          className="flex flex-col overflow-hidden"
          style={{ minWidth: 0 }}
        >
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
              whiteSpace: 'nowrap',
            }}
          >
            Intelligence Desk
          </span>
        </motion.div>
      </div>
    </motion.aside>
  );
}
