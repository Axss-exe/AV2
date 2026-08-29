'use client';

import { useState } from 'react';
import type { Dashboard } from '@/types/dashboard';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function display(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '18px 20px' }}>
    <h2 style={{ margin: '0 0 12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</h2>
    {children}
  </section>;
}

function TextList({ items, empty }: { items: unknown[]; empty: string }) {
  if (!items.length) return <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>{empty}</p>;
  return <div className="flex flex-col gap-3">{items.map((item, index) => {
    const obj = record(item);
    const text = obj.text ?? obj.claim ?? obj.insight ?? obj.title ?? item;
    return <div key={index} style={{ color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.6 }}>
      <div>{display(text)}</div>
      {Array.isArray(obj.source_nodes) && obj.source_nodes.length > 0 && <div style={{ marginTop: 4, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Evidence: {obj.source_nodes.map(display).join(', ')}</div>}
      {obj.evidence != null && <div style={{ marginTop: 4, color: 'var(--text-dim)', fontSize: 11 }}>{display(obj.evidence)}</div>}
    </div>;
  })}</div>;
}

function JsonDetails({ title, value }: { title: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  const hasValue = Array.isArray(value) ? value.length > 0 : Object.keys(record(value)).length > 0;
  return <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
    <summary style={{ cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12 }}>{title} {hasValue ? '' : '(empty)'}</summary>
    {hasValue ? <pre style={{ overflowX: 'auto', margin: '12px 0 0', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 1.6 }}>{display(value)}</pre> : <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>No data returned.</p>}
  </details>;
}

export function NewsIntelligencePanel({ dashboard }: { dashboard: Dashboard }) {
  const perspective = record(dashboard.perspective);
  const metadata = record(dashboard.pipeline_metadata);
  const rawDashboard = dashboard as unknown as UnknownRecord;
  const impactChain = Array.isArray(rawDashboard.impact_chain) ? rawDashboard.impact_chain as unknown[] : [];
  const status = rawDashboard.status;
  const detail = rawDashboard.detail;
  return <div className="flex flex-col gap-4" style={{ marginTop: 32 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>News Intelligence</span>
      {status != null && <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>STATUS: {display(status)}</span>}
      {dashboard.partial && <span style={{ color: '#ff9f0a', fontFamily: 'var(--font-mono)', fontSize: 10 }}>PARTIAL</span>}
    </div>
    {detail != null && <div role="status" style={{ color: 'var(--text-dim)', fontSize: 12 }}>{display(detail)}</div>}
    <Section title="What happened"><div className="flex flex-col gap-3"><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 14, lineHeight: 1.65 }}>{dashboard.trigger_event || 'No trigger event returned.'}</p><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.65 }}>{dashboard.executive_summary || 'No executive summary returned.'}</p></div></Section>
    <Section title="Perspective"><p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{display(perspective.country ?? 'No perspective returned.')}{perspective.country_code ? ` (${display(perspective.country_code)})` : ''}</p></Section>
    <Section title="What it means"><div className="flex flex-col gap-4"><div><h3 style={{ margin: '0 0 8px', color: 'var(--text-dim)', fontSize: 11 }}>Findings</h3><TextList items={dashboard.findings ?? []} empty="No findings returned." /></div><div><h3 style={{ margin: '0 0 8px', color: 'var(--text-dim)', fontSize: 11 }}>Market equilibrium shift</h3><p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13, lineHeight: 1.65 }}>{dashboard.market_equilibrium_shift || 'No market equilibrium shift returned.'}</p></div></div></Section>
    <Section title="Impact chain"><TextList items={impactChain} empty="No impact chain returned." /></Section>
    <Section title="Risks"><TextList items={dashboard.risks ?? []} empty="No risks returned." /></Section>
    <Section title="Opportunities"><TextList items={dashboard.opportunities} empty="No opportunities returned." /></Section>
    <Section title="Connections"><div className="flex flex-col gap-3"><JsonDetails title="Key entities" value={dashboard.key_entities ?? []} /><JsonDetails title="Source nodes" value={dashboard.source_nodes} /><JsonDetails title="Perspective nodes" value={dashboard.perspective_nodes} /><JsonDetails title="Cross-border bridges" value={dashboard.cross_border_bridges} /></div></Section>
    <Section title="Evidence / intelligence"><div className="flex flex-col gap-3"><JsonDetails title="Structured intelligence" value={dashboard.structured_intelligence ?? []} /><JsonDetails title="Pipeline metadata" value={metadata} /><div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Intelligence ID: {dashboard.intelligence_id || 'Not returned'}</div></div></Section>
  </div>;
}

export default NewsIntelligencePanel;
