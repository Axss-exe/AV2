'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { getQueryHistory } from '@/lib/data';
import type { QueryHistory } from '@/lib/types';
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Shield,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'HARARE', 'POPULATION 16.3M', 'GDP $26.7B', 'ZiG ACTIVE',
  'LITHIUM: HIGH PRIORITY', 'POWER DEFICIT: CRITICAL', 'AFCFTA SIGNATORY',
  'GDP GROWTH +3.4%', 'PLATINUM RESERVES', 'KARIBA DAM ONLINE',
  'CURRENCY: VOLATILE', '10 PROVINCES', 'SOUTHERN AFRICA',
];

const VITAL_STATS = [
  { label: 'Head of State',  value: 'E. Mnangagwa', sub: 'President',          trend: null,     trendDir: null },
  { label: 'Population',     value: '16.3M',         sub: 'Citizens',            trend: null,     trendDir: null },
  { label: 'GDP (USD)',       value: '$26.7B',         sub: 'Nominal 2024',        trend: '+3.4%',  trendDir: 'up'   },
  { label: 'Currency',        value: 'ZiG / USD',      sub: 'Dual-track active',   trend: 'VOLATILE', trendDir: 'warn' },
  { label: 'GDP Growth',      value: '+3.4%',          sub: 'YoY expansion',       trend: null,     trendDir: 'up'   },
  { label: 'GDP per Capita',  value: '$1,669',          sub: 'Est. 390,757 km²',    trend: null,     trendDir: null   },
];

const PROVINCES = [
  'Mashonaland West', 'Mashonaland East', 'Mashonaland Central',
  'Manicaland', 'Midlands', 'Masvingo',
  'Matabeleland North', 'Matabeleland South', 'Harare', 'Bulawayo',
];

const PROFILE_ROWS: [string, string, string | null][] = [
  ['Capital',        'Harare',                              null],
  ['Languages',      'English, Shona, Ndebele',             null],
  ['Gov. Type',      'Presidential Republic',               null],
  ['GDP Growth',     '+3.4% YoY',                          'up'],
  ['Key Sectors',    'Mining, Agriculture, Energy, Telecom, Manufacturing', null],
  ['Key Exports',    'Gold, Tobacco, Diamonds, Chrome',     null],
  ['AfCFTA',         'Signatory — tariff phase-in',         'up'],
];

const INSTITUTIONAL = {
  govEntities: ['ZIDA', 'EMA', 'ZIMRA', 'RBZ', 'ZERA', 'POTRAZ', 'MMCZ'],
  soes: ['ZESA Holdings', 'ZINWA', 'NRZ', 'TelOne', 'NetOne'],
  laws: [
    'Mines and Minerals Act',
    'Environmental Management Act',
    'Water Act',
    'ZIDA Act',
    'Electricity Act',
  ],
};

const MINERALS = [
  { name: 'Lithium',   priority: 'HIGH',   rank: 1 },
  { name: 'Gold',      priority: 'HIGH',   rank: 2 },
  { name: 'Platinum',  priority: 'HIGH',   rank: 3 },
  { name: 'Chrome',    priority: 'MEDIUM', rank: 4 },
  { name: 'Coal',      priority: 'MEDIUM', rank: 5 },
  { name: 'Nickel',    priority: 'MEDIUM', rank: 6 },
  { name: 'Diamonds',  priority: 'MEDIUM', rank: 7 },
];

const INTELLIGENCE_FEED = [
  {
    id: 'INT-001',
    title: 'Regulatory requirements for importing agricultural machinery',
    summary: 'New ZIDA framework mandates local content certification for all agricultural machinery imports above $500k.',
    timestamp: '2h ago',
    badge: 'REGULATORY',
    severity: 'medium',
  },
  {
    id: 'INT-002',
    title: 'Cross-border logistics opportunities in the EAC corridor',
    summary: 'NRZ and Tanzania Railways Corporation MOU opens northbound freight corridor via Dar es Salaam.',
    timestamp: '6h ago',
    badge: 'OPPORTUNITY',
    severity: 'high',
  },
  {
    id: 'INT-003',
    title: 'OPP-002 data validation at 92% completion',
    summary: 'Lithium Beneficiation opportunity dataset nearing validation threshold. Review recommended before execution.',
    timestamp: '1d ago',
    badge: 'VALIDATION',
    severity: 'low',
  },
  {
    id: 'INT-004',
    title: 'RBZ issues revised FCA account guidance for mining exporters',
    summary: 'Gold and platinum exporters must now retain 35% of export proceeds in ZiG-denominated accounts.',
    timestamp: '2d ago',
    badge: 'REGULATORY',
    severity: 'high',
  },
];

const OPPORTUNITIES = [
  {
    id: 'OPP-001',
    title: 'Lithium Beneficiation',
    sector: 'Mining',
    regulator: 'MMCZ',
    constraint: 'Power Deficit',
    constraintLink: true,
    summary: 'In-country processing mandate creates refinery investment window. Strong Chinese FDI competition.',
    urgency: 'HIGH',
  },
  {
    id: 'OPP-002',
    title: 'Renewable Energy',
    sector: 'Energy',
    regulator: 'ZERA',
    constraint: 'Power Deficit',
    constraintLink: true,
    summary: 'ZESA shortfall of 1,200MW creates direct procurement opportunity. IPP licensing via ZERA.',
    urgency: 'HIGH',
  },
  {
    id: 'OPP-003',
    title: 'Agro-processing',
    sector: 'Agriculture',
    regulator: 'EMA',
    constraint: 'Infrastructure Gaps',
    constraintLink: true,
    summary: 'Tobacco and horticultural value addition. SEZ incentives available under ZIDA Act.',
    urgency: 'MEDIUM',
  },
  {
    id: 'OPP-004',
    title: 'Data Centers',
    sector: 'Telecommunications',
    regulator: 'POTRAZ',
    constraint: 'Power Deficit',
    constraintLink: true,
    summary: 'Regional connectivity hub positioning. POTRAZ licensing and fibre corridor access critical path.',
    urgency: 'MEDIUM',
  },
];

const ASSETS = [
  { name: 'Kariba Dam',           detail: 'Southern Africa\'s largest hydro — 1,050MW capacity', type: 'asset' },
  { name: 'Platinum Resources',   detail: 'World-class Great Dyke deposits, 2nd largest global reserve', type: 'asset' },
  { name: 'Lithium Resources',    detail: '23M+ tonne lithium reserve, tier-1 global battery supply', type: 'asset' },
  { name: 'Regional Trade Corridors', detail: 'SADC + AfCFTA access to 1.4B consumer market', type: 'asset' },
];

const CONSTRAINTS = [
  { name: 'Power Deficit',        detail: '1,200MW shortfall. ZESA load-shedding at 12h/day', type: 'constraint' },
  { name: 'Currency Volatility',  detail: 'ZiG introduced 2024; dual-track USD co-circulation', type: 'constraint' },
  { name: 'Infrastructure Gaps',  detail: 'NRZ fleet at 40% capacity; road freight dependency high', type: 'constraint' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(h: number): string {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase();
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SEVERITY_COLOR: Record<string, string> = {
  high:   '#ff453a',
  medium: '#ff9f0a',
  low:    'var(--text-primary)',
};
const URGENCY_COLOR: Record<string, string> = {
  HIGH:   '#ff453a',
  MEDIUM: '#ff9f0a',
  LOW:    'var(--text-primary)',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Ticker() {
  const track = useRef<HTMLDivElement>(null);
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div
      className="overflow-hidden"
      style={{ borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '7px 0' }}
      aria-label="Live intelligence ticker"
    >
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker-scroll 40s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div ref={track} className="ticker-track flex gap-0 whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            <span style={{ padding: '0 18px' }}>{item}</span>
            <span style={{ color: 'var(--border-default)' }}>|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat, i }: { stat: typeof VITAL_STATS[0]; i: number }) {
  return (
    <motion.div
      custom={i}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 + i * 0.04 } }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        padding: '16px 18px',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)';
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {stat.value}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {stat.label}
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 10, color: 'var(--border-default)' }}>{stat.sub}</span>
        {stat.trend && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: 3,
              background:
                stat.trendDir === 'up'   ? 'var(--bg-control-active)' :
                stat.trendDir === 'warn' ? 'rgba(255,159,10,0.12)' :
                                           'rgba(255,69,58,0.12)',
              color:
                stat.trendDir === 'up'   ? 'var(--text-primary)' :
                stat.trendDir === 'warn' ? '#ff9f0a' :
                                           '#ff453a',
            }}
          >
            {stat.trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 10, color: 'var(--border-default)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function EntityChip({ label, href }: { label: string; href?: string }) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    padding: '3px 7px', borderRadius: 4,
    background: 'var(--bg-control)', border: '1px solid var(--border-hover)',
    color: 'var(--text-tertiary)', textDecoration: 'none',
    transition: 'border-color 0.15s, color 0.15s',
    cursor: href ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
  };
  if (href) {
    return (
      <Link href={href} style={base}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#444'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-tertiary)'; }}
      >
        {label}
      </Link>
    );
  }
  return <span style={base}>{label}</span>;
}

// ─── Country Profile Panel ────────────────────────────────────────────────────

function CountryProfilePanel() {
  const [tab, setTab] = useState<'profile' | 'institutional'>('profile');
  const [showProvinces, setShowProvinces] = useState(false);
  const [showAllMinerals, setShowAllMinerals] = useState(false);

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
        {(['profile', 'institutional'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '11px 16px',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: tab === t ? 'var(--bg-control)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-dim)',
              borderBottom: tab === t ? '1px solid var(--text-primary)' : '1px solid transparent',
              cursor: 'pointer', border: 'none',
              transition: 'color 0.15s, background 0.15s',
            }}
          >
            {t === 'profile' ? 'Economic Profile' : 'Institutional Ecosystem'}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 18px' }}>
        <AnimatePresence mode="wait">
          {tab === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Key rows */}
              <div style={{ marginBottom: 14 }}>
                {PROFILE_ROWS.map(([k, v, trend]) => (
                  <div key={k} className="flex items-start gap-3" style={{ marginBottom: 9 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 10, color: 'var(--border-default)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, width: 76, paddingTop: 1 }}>{k}</span>
                    <span className="flex items-center gap-2 flex-wrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {v}
                      {trend === 'up' && <TrendingUp size={11} color="var(--text-primary)" aria-label="Positive trend" />}
                    </span>
                  </div>
                ))}
              </div>

              {/* Minerals */}
              <div style={{ marginBottom: 14 }}>
                <SectionLabel>Major Minerals</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(showAllMinerals ? MINERALS : MINERALS.slice(0, 4)).map((m) => (
                    <span
                      key={m.name}
                      title={`Priority: ${m.priority} · Export rank #${m.rank}`}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        padding: '3px 8px', borderRadius: 4,
                        background: m.priority === 'HIGH' ? 'rgba(255,69,58,0.08)' : 'var(--bg-control)',
                        border: `1px solid ${m.priority === 'HIGH' ? 'rgba(255,69,58,0.25)' : 'var(--border-default)'}`,
                        color: m.priority === 'HIGH' ? '#ff6b63' : 'var(--text-muted)',
                        cursor: 'default',
                      }}
                    >
                      {m.name}
                    </span>
                  ))}
                  {!showAllMinerals && (
                    <button onClick={() => setShowAllMinerals(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', background: 'none', border: '1px dashed var(--border-hover)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                      +{MINERALS.length - 4} more
                    </button>
                  )}
                </div>
              </div>

              {/* Provinces */}
              <div>
                <button
                  className="flex items-center gap-1.5 w-full"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showProvinces ? 10 : 0 }}
                  onClick={() => setShowProvinces((p) => !p)}
                  aria-expanded={showProvinces}
                >
                  <SectionLabel>10 Provinces</SectionLabel>
                  {showProvinces ? <ChevronUp size={11} color="var(--border-default)" /> : <ChevronDown size={11} color="var(--border-default)" />}
                </button>
                <AnimatePresence>
                  {showProvinces && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {PROVINCES.map((p) => (
                          <div
                            key={p}
                            title={p}
                            style={{
                              fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)',
                              padding: '5px 8px', borderRadius: 6, background: 'var(--bg-control)',
                              border: '1px solid var(--border-default)', transition: 'color 0.15s, background 0.15s',
                              cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="institutional" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Gov entities */}
              <div style={{ marginBottom: 16 }}>
                <SectionLabel>Government Entities</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {INSTITUTIONAL.govEntities.map((e) => (
                    <EntityChip key={e} label={e} href="/entities" />
                  ))}
                </div>
              </div>

              {/* SOEs */}
              <div style={{ marginBottom: 16 }}>
                <SectionLabel>State-Owned Enterprises</SectionLabel>
                <div className="flex flex-col gap-1.5">
                  {INSTITUTIONAL.soes.map((s) => (
                    <div key={s} className="flex items-center justify-between"
                      style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-control)', border: '1px solid var(--border-default)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
                    >
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)' }}>{s}</span>
                      <Link href="/entities" style={{ color: 'var(--border-default)', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--border-default)'; }}
                      >
                        <ArrowRight size={12} aria-label={`View ${s}`} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Laws */}
              <div>
                <SectionLabel>Key Legislation</SectionLabel>
                <div className="flex flex-col gap-1.5">
                  {INSTITUTIONAL.laws.map((l) => (
                    <div key={l}
                      style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-control)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', borderLeft: '2px solid var(--border-hover)', transition: 'color 0.15s, border-left-color 0.15s', cursor: 'default' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'var(--text-dim)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'var(--border-hover)'; }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Intelligence Feed ────────────────────────────────────────────────────────

function IntelligenceFeed({ history, loading }: { history: QueryHistory[]; loading: boolean }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '11px 18px', borderBottom: '1px solid var(--border-default)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Active Signals</span>
        <Link href="/history" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--border-default)'; }}
        >
          VIEW ALL →
        </Link>
      </div>

      {/* Simulated feed items always visible */}
      {INTELLIGENCE_FEED.map((item, i) => (
        <div
          key={item.id}
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-default)',
            transition: 'background 0.15s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {item.title}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                padding: '2px 5px', borderRadius: 3,
                background: `${SEVERITY_COLOR[item.severity]}18`,
                color: SEVERITY_COLOR[item.severity],
                border: `1px solid ${SEVERITY_COLOR[item.severity]}33`,
              }}>
                {item.badge}
              </span>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: 'var(--text-dim)', marginBottom: 5, lineHeight: 1.5 }}>
            {item.summary}
          </p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-default)' }}>{item.id} · {item.timestamp}</span>
        </div>
      ))}

      {/* Query history items */}
      {loading ? (
        <div style={{ padding: 14 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 44, background: 'var(--bg-control)', borderRadius: 6, marginBottom: 8, animation: 'pulse-soft 1.5s infinite' }} />
          ))}
        </div>
      ) : history.length > 0 && (
        <>
          <div style={{ padding: '8px 18px 4px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Recent Queries
          </div>
          {history.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{ padding: '10px 18px', borderTop: '1px solid var(--bg-control)', transition: 'background 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                {item.query}
              </p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-hover)' }}>{formatTime(item.created_at)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Opportunities Spotlight ──────────────────────────────────────────────────

function OpportunitiesSpotlight() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '11px 18px', borderBottom: '1px solid var(--border-default)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Investment Opportunities</span>
        <Link href="/opportunities" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--border-default)'; }}
        >
          DASHBOARD →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 0 }}>
        {OPPORTUNITIES.map((opp, i) => (
          <div
            key={opp.id}
            style={{
              padding: '14px 18px',
              borderRight: i % 2 === 0 ? '1px solid var(--border-default)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--border-default)' : 'none',
              transition: 'background 0.15s',
              cursor: 'default',
              borderLeft: `3px solid ${URGENCY_COLOR[opp.urgency]}`,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{opp.title}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                padding: '2px 5px', borderRadius: 3, flexShrink: 0,
                background: `${URGENCY_COLOR[opp.urgency]}18`,
                color: URGENCY_COLOR[opp.urgency],
              }}>
                {opp.urgency}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 8 }}>
              {opp.summary}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <EntityChip label={opp.regulator} href="/entities" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-default)' }}>↔</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '3px 7px', borderRadius: 4,
                background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
                color: '#ff6b63',
              }}>
                {opp.constraint}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Strategic Assessment ─────────────────────────────────────────────────────

function StrategicAssessment() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--border-default)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Strategic Assessment</span>
        <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)' }}>Assets vs. Constraints</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 0 }}>
        {/* Assets */}
        <div style={{ padding: '14px 18px', borderRight: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={12} color="var(--text-primary)" aria-hidden="true" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Strategic Assets</span>
          </div>
          <div className="flex flex-col gap-2">
            {ASSETS.map((a) => (
              <div
                key={a.name}
                title={a.detail}
                style={{
                  padding: '9px 12px', borderRadius: 8,
                  background: 'var(--bg-control)', border: '1px solid var(--border-default)',
                  borderLeft: '3px solid var(--border-active)',
                  transition: 'border-left-color 0.2s, background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'var(--text-primary)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'var(--border-active)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)';
                }}
              >
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.4 }}>{a.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div style={{ padding: '14px 18px' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={12} color="#ff453a" aria-hidden="true" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ff453a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Strategic Constraints</span>
          </div>
          <div className="flex flex-col gap-2">
            {CONSTRAINTS.map((c) => (
              <div
                key={c.name}
                title={c.detail}
                style={{
                  padding: '9px 12px', borderRadius: 8,
                  background: 'var(--bg-control)', border: '1px solid var(--border-default)',
                  borderLeft: '3px solid rgba(255,69,58,0.4)',
                  transition: 'border-left-color 0.2s, background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#ff453a';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'rgba(255,69,58,0.4)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-control)';
                }}
              >
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.4 }}>{c.detail}</div>
              </div>
            ))}

            {/* Balance note */}
            <div style={{ padding: '8px 10px', borderRadius: 6, background: 'transparent', border: '1px dashed var(--border-default)', marginTop: 4 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 10, color: 'var(--border-default)', lineHeight: 1.5 }}>
                World-class mineral endowment is offset by energy and infrastructure headwinds. Constraint mitigation unlocks tier-1 opportunity conversion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDateStr(formatDate(now));
  }, []);

  useEffect(() => {
    getQueryHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="pt-4 md:pt-6 pb-10">

        {/* ── Hero Zone ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{ marginBottom: 0 }}
        >
          {/* Top meta line */}
          <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-default)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ATIS / Intelligence Desk
              </span>
              <span style={{ width: 1, height: 10, background: 'var(--border-default)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--border-hover)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {dateStr}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={10} color="var(--text-primary)" aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>FEEDS ACTIVE</span>
            </div>
          </div>

          {/* Greeting + mission */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(22px, 3vw, 34px)', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 6 }}>
            {greeting || 'Welcome back'}, Analyst
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: 'var(--text-dim)', marginBottom: 14, maxWidth: 560 }}>
            Zimbabwe macro briefing — population, economy, minerals, and strategic constraints.
          </p>
        </motion.div>

        {/* ── Ticker ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <Ticker />
        </div>

        {/* ── Vital Stats Row ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" style={{ marginBottom: 24 }}>
          {VITAL_STATS.map((s, i) => <StatCard key={s.label} stat={s} i={i} />)}
        </div>

        {/* ── Main two-column zone ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-5" style={{ marginBottom: 20 }}>
          <CountryProfilePanel />
          <IntelligenceFeed history={history} loading={loading} />
        </div>

        {/* ── Opportunities Spotlight ───────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <OpportunitiesSpotlight />
        </div>

        {/* ── Strategic Assessment ──────────────────────────────── */}
        <StrategicAssessment />

      </div>
    </AppShell>
  );
}
