'use client'

import useSWR from 'swr'
import { useState } from 'react'
import type { MouseEvent } from 'react'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
type FeatureState = 'AVAILABLE' | 'RESTRICTED' | 'DISABLED'
type Feature = { key: string; label: string; description: string; state: FeatureState }

export function useFeatureAccess(key: string) {
  const { data, error, isLoading, mutate } = useSWR<{ features: Feature[]; user?: { tier?: string } }>('/api/features', fetcher)
  const feature = data?.features?.find((item) => item.key === key)
  return { feature, user: data?.user, state: isLoading || error ? 'RESTRICTED' as FeatureState : feature?.state ?? 'RESTRICTED' as FeatureState, isLoading, mutate }
}

export function FeatureUnavailable({ label, description, state, tier }: { label: string; description: string; state: 'RESTRICTED' | 'DISABLED'; tier?: string }) {
  return <div role="status" className="rounded-xl border p-5" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label} unavailable</p>
    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{state === 'DISABLED' ? 'This feature is globally disabled by an administrator.' : `The ${tier ?? 'current'} tier does not include this capability.`} {description}</p>
  </div>
}

export function FeatureNavLink({ featureKey, href, label, icon: Icon, isActive, collapsed, onClick }: { featureKey: string; href: string; label: string; icon: React.ElementType; isActive: boolean; collapsed: boolean; onClick?: () => void }) {
  const { feature, user } = useFeatureAccess(featureKey)
  const [open, setOpen] = useState(false)
  const unavailable = feature && feature.state !== 'AVAILABLE'
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (unavailable) { event.preventDefault(); setOpen(true); return }
    onClick?.()
  }
  return <>
    <a href={href} aria-current={isActive ? 'page' : undefined} title={collapsed ? label : undefined} onClick={handleClick} className="flex items-center relative transition-all duration-150" style={{ gap: collapsed ? 0 : 12, padding: collapsed ? '9px 0' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, background: isActive ? 'var(--bg-control)' : 'transparent', color: unavailable ? 'var(--text-dim)' : isActive ? 'var(--text-primary)' : 'var(--text-tertiary)', textDecoration: 'none', opacity: unavailable ? 0.55 : 1, cursor: unavailable ? 'not-allowed' : 'pointer' }}>
      <Icon size={16} aria-hidden="true" /><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap' }}>{label}</span>
    </a>
    {open && feature && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" role="dialog" aria-modal="true" onClick={() => setOpen(false)}><div className="w-full max-w-md rounded-2xl border p-6 shadow-xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }} onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>Access notice</p><h2 className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.label}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close access notice" className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button></div><p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p><FeatureUnavailable label={feature.label} description="Contact an administrator if you believe this access is incorrect." state={feature.state as 'RESTRICTED' | 'DISABLED'} tier={user?.tier} /><button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>Understood</button></div></div>}
  </>
}
