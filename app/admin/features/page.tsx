'use client'

import { useEffect, useState } from 'react'

interface Feature { key: string; label: string; description: string; enabled: boolean; allowedTiers: string[]; requiredPermission: string | null; updatedAt: string }

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  async function load() { const response = await fetch('/api/admin/features'); const data = await response.json(); setFeatures(data.features ?? []) }
  useEffect(() => { void load() }, [])
  async function update(feature: Feature, patch: Partial<Feature>) {
    if (!window.confirm(`${patch.enabled === undefined ? 'Update access for' : patch.enabled ? 'Enable' : 'Disable'} ${feature.label}?`)) return
    setBusy(feature.key)
    await fetch('/api/admin/features', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: feature.key, ...patch }) })
    await load(); setBusy(null)
  }
  return <main className="min-h-screen px-6 py-10 lg:px-12" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
    <div className="mx-auto max-w-6xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>Admin control room / feature access</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Feature access</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Control real ATIS capabilities from the server-authoritative registry. Changes are persisted and audited.</p>
      <div className="mt-8 flex flex-col gap-3">
        {features.map((feature) => <article key={feature.key} className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-lg font-semibold">{feature.label}</h2><p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p></div>
            <button type="button" disabled={busy === feature.key} onClick={() => void update(feature, { enabled: !feature.enabled })} className="rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ borderColor: feature.enabled ? 'var(--accent-fg)' : 'var(--border-default)', color: feature.enabled ? 'var(--accent-fg)' : 'var(--text-muted)' }}>{busy === feature.key ? 'Saving' : feature.enabled ? 'Enabled' : 'Disabled'}</button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {['admin', 'pilot', 'standard'].map((tier) => <button key={tier} type="button" disabled={busy === feature.key} onClick={() => void update(feature, { allowedTiers: feature.allowedTiers.includes(tier) ? feature.allowedTiers.filter((item) => item !== tier) : [...feature.allowedTiers, tier] })} className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ background: feature.allowedTiers.includes(tier) ? 'var(--accent-bg)' : 'transparent', borderColor: feature.allowedTiers.includes(tier) ? 'var(--accent-fg)' : 'var(--border-default)', color: feature.allowedTiers.includes(tier) ? 'var(--accent-fg)' : 'var(--text-muted)' }}>{tier}</button>)}
            {feature.requiredPermission && <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>Permission: {feature.requiredPermission}</span>}
          </div>
        </article>)}
      </div>
    </div>
  </main>
}
