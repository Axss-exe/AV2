'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Clock,
  Network,
  MapPin,
  Zap,
  TrendingUp,
  Rss,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useATIS } from '@/lib/context';

export const navItems = [
  { label: 'Home',         href: '/',            icon: Home },
  { label: 'Query',        href: '/query',        icon: Search },
  { label: 'History',      href: '/history',      icon: Clock },
  { label: 'Entities',     href: '/entities',     icon: Network },
  { label: 'News',         href: '/news',         icon: Rss },
  { label: 'Opportunities',href: '/opportunities', icon: TrendingUp },
  { label: 'Country Map',  href: '/country-map',  icon: MapPin },
  { label: 'Execute',      href: '/execute',      icon: Zap },
];

const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH  = 240;

/* ── Shared nav link ── */
function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className="flex items-center relative transition-all duration-150"
      style={{
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '9px 0' : '8px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
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
      <Icon size={16} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" style={{ flexShrink: 0 }} />
      <motion.span
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
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
          layoutId="nav-active-desktop"
          className="absolute left-0 w-[2px] rounded-r"
          style={{ background: '#ffffff', top: 6, bottom: 6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
    </Link>
  );
}

/* ── Desktop sidebar (md+) ── */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useATIS();
  const width = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      className="hidden md:flex fixed left-0 top-0 h-full flex-col z-40 overflow-hidden"
      style={{ background: '#0a0a0a', borderRight: '1px solid #1c1c1e' }}
      aria-label="Main navigation"
    >
      {/* Logo + collapse toggle */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          height: 64,
          borderBottom: '1px solid #1c1c1e',
          padding: sidebarCollapsed ? '0 14px' : '0 16px',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 30, height: 30, background: '#ffffff', borderRadius: 6, overflow: 'hidden' }}
            aria-hidden="true"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ATIS%20SYMBOL-ooX7WbP3p5bVAv6S3KR9oEkEmh3IGU.png"
              alt="ATIS symbol"
              width={30}
              height={30}
              style={{ width: 30, height: 30, objectFit: 'cover' }}
              priority
            />
          </div>
          <motion.div
            animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.18 }}
            className="flex flex-col overflow-hidden"
            style={{ minWidth: 0 }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#ffffff', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              ATIS
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 9, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              Africa Trade &amp; Intelligence
            </span>
          </motion.div>
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#525252'; }}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex items-center justify-center" style={{ padding: '8px 0 4px' }}>
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#525252'; }}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 10px' }} role="navigation">
        {navItems.map(({ label, href, icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <NavLink key={href} href={href} label={label} icon={icon} isActive={isActive} collapsed={sidebarCollapsed} />
          );
        })}
      </nav>

      <div
        className="flex items-center flex-shrink-0"
        style={{ borderTop: '1px solid #1c1c1e', padding: sidebarCollapsed ? '12px 0' : '12px 14px', gap: 10, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2c2c2e', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, color: '#a1a1a6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">A</div>
        <motion.div
          animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.15 }}
          className="flex flex-col overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Analyst</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 10, color: '#737373', whiteSpace: 'nowrap' }}>Intelligence Desk</span>
        </motion.div>
      </div>
    </motion.aside>
  );
}

/* ── Mobile drawer (< md) ── */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed left-0 top-0 h-full z-50 flex flex-col md:hidden"
            style={{ width: 260, background: '#0a0a0a', borderRight: '1px solid #1c1c1e' }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0" style={{ height: 64, borderBottom: '1px solid #1c1c1e', padding: '0 16px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 28, height: 28, background: '#ffffff', borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ATIS%20SYMBOL-ooX7WbP3p5bVAv6S3KR9oEkEmh3IGU.png"
                    alt="ATIS symbol"
                    width={28}
                    height={28}
                    style={{ width: 28, height: 28, objectFit: 'cover' }}
                  />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#ffffff', letterSpacing: '0.02em' }}>ATIS</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 9, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Africa Trade &amp; Intelligence</span>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close menu" style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#737373', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto" style={{ padding: '10px 10px' }}>
              {navItems.map(({ label, href, icon }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <NavLink key={href} href={href} label={label} icon={icon} isActive={isActive} collapsed={false} onClick={onClose} />
                );
              })}
            </nav>

            {/* Footer */}
            <div className="flex items-center gap-3 flex-shrink-0" style={{ borderTop: '1px solid #1c1c1e', padding: '14px 16px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2c2c2e', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, color: '#a1a1a6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</div>
              <div className="flex flex-col">
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: '#ffffff' }}>Analyst</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 10, color: '#737373' }}>Intelligence Desk</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
