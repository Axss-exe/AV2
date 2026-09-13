'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import type { ElementType, MouseEvent } from 'react'

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

export function FeaturePreviewHost() {
  const [key, setKey] = useState<string | null>(null)
  const { feature, user } = useFeatureAccess(key ?? '')
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const handlePreview = (event: Event) => {
      const nextKey = (event as CustomEvent<{ key?: string }>).detail?.key
      if (nextKey) { setKey(nextKey); setSlide(0) }
    }
    window.addEventListener('atis:feature-preview', handlePreview)
    return () => window.removeEventListener('atis:feature-preview', handlePreview)
  }, [])
  if (!key || !feature) return null
  const slides = [
    ['What it does', feature.description],
    ['How it works', 'Move from source evidence to structured signals, constraints, and decision-ready outputs.'],
    ['What you receive', 'A focused workspace with traceable findings, supporting evidence, and next actions.'],
  ]
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" role="dialog" aria-modal="true" onClick={() => setKey(null)}><div className="w-full max-w-lg rounded-2xl border p-6 shadow-xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }} onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>ATIS feature catalog</p><h2 className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.label}</h2></div><button type="button" onClick={() => setKey(null)} aria-label="Close feature preview" className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button></div><div className="mt-5 rounded-xl border p-5" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}><p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#007aff' }}>Preview {slide + 1} / {slides.length}</p><div className="mt-6 min-h-28"><p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{slides[slide][0]}</p><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{slides[slide][1]}</p></div><div className="mt-5 flex gap-2">{slides.map((item, index) => <button key={item[0]} type="button" aria-label={`Show preview ${index + 1}`} onClick={() => setSlide(index)} className="h-1.5 flex-1 rounded-full" style={{ background: index === slide ? '#007aff' : 'var(--border-default)' }} />)}</div></div><p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{feature.state === 'DISABLED' ? 'This feature is currently disabled by an administrator.' : `Your ${user?.tier ?? 'current'} tier does not include this capability yet.`}</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setSlide((slide + slides.length - 1) % slides.length)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>Previous</button><button type="button" onClick={() => slide === slides.length - 1 ? setKey(null) : setSlide(slide + 1)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: '#007aff', color: 'var(--text-primary)' }}>{slide === slides.length - 1 ? 'Close preview' : 'Next preview'}</button></div></div></div>
}

export function FeatureNavLink({ featureKey, href, label, icon: Icon, isActive, collapsed, onClick }: { featureKey: string; href: string; label: string; icon: ElementType; isActive: boolean; collapsed: boolean; onClick?: () => void }) {
  const { feature, user } = useFeatureAccess(featureKey)
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const handlePreview = (event: Event) => {
      if ((event as CustomEvent<{ key?: string }>).detail?.key === featureKey) {
        setOpen(true)
        setSlide(0)
      }
    }
    window.addEventListener('atis:feature-preview', handlePreview)
    return () => window.removeEventListener('atis:feature-preview', handlePreview)
  }, [featureKey])
  const slides = [
    { title: 'What it does', body: feature?.description ?? 'Explore this ATIS capability and its workflow.' },
    { title: 'How it works', body: 'Move from source evidence to structured signals, constraints, and decision-ready outputs.' },
    { title: 'What you receive', body: 'A focused workspace with traceable findings, supporting evidence, and next actions.' },
  ]
  const unavailable = feature && feature.state !== 'AVAILABLE'
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (unavailable) { event.preventDefault(); setOpen(true); return }
    onClick?.()
  }
  return <>
    <a href={href} aria-current={isActive ? 'page' : undefined} title={collapsed ? label : undefined} onClick={handleClick} className="flex items-center relative transition-all duration-150" style={{ gap: collapsed ? 0 : 12, padding: collapsed ? '9px 0' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 8, background: isActive ? 'var(--bg-control)' : 'transparent', color: unavailable ? 'var(--text-dim)' : isActive ? 'var(--text-primary)' : 'var(--text-tertiary)', textDecoration: 'none', opacity: unavailable ? 0.55 : 1, cursor: unavailable ? 'not-allowed' : 'pointer' }}>
      <Icon size={16} aria-hidden="true" /><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap' }}>{label}</span>
    </a>
    {open && feature && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" role="dialog" aria-modal="true" onClick={() => setOpen(false)}><div className="w-full max-w-lg rounded-2xl border p-6 shadow-xl" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }} onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>ATIS feature catalog</p><h2 className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.label}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close feature preview" className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button></div><div className="mt-5 rounded-xl border p-5" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#007aff' }}>Preview {slide + 1} / {slides.length}</p><span className="text-xs" style={{ color: 'var(--text-dim)' }}>{feature.state === 'DISABLED' ? 'Unavailable' : 'Tier restricted'}</span></div><div className="mt-6 flex min-h-28 flex-col justify-center"><p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{slides[slide].title}</p><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{slides[slide].body}</p></div><div className="mt-5 flex gap-2">{slides.map((item, index) => <button key={item.title} type="button" aria-label={`Show preview ${index + 1}`} onClick={() => setSlide(index)} className="h-1.5 flex-1 rounded-full" style={{ background: index === slide ? '#007aff' : 'var(--border-default)' }} />)}</div></div><p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{feature.state === 'DISABLED' ? 'This feature is currently disabled by an administrator.' : `Your ${user?.tier ?? 'current'} tier does not include this capability yet.`} Contact an administrator if you believe this access is incorrect.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setSlide((slide + slides.length - 1) % slides.length)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>Previous</button><button type="button" onClick={() => slide === slides.length - 1 ? setOpen(false) : setSlide(slide + 1)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: '#007aff', color: 'var(--text-primary)' }}>{slide === slides.length - 1 ? 'Close preview' : 'Next preview'}</button></div></div></div>}
  </>
}
