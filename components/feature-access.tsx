'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function useFeatureAccess(key: string) {
  const { data, error, isLoading, mutate } = useSWR<{ features: Array<{ key: string; label: string; description: string; state: 'AVAILABLE' | 'RESTRICTED' | 'DISABLED' }> }>('/api/features', fetcher)
  const feature = data?.features?.find((item) => item.key === key)
  return { feature, state: isLoading || error ? 'RESTRICTED' : feature?.state ?? 'RESTRICTED', isLoading, mutate }
}

export function FeatureUnavailable({ label, description, state }: { label: string; description: string; state: 'RESTRICTED' | 'DISABLED' }) {
  return <div role="status" className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label} unavailable</p>
    <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{state === 'DISABLED' ? 'This feature is globally disabled by an administrator.' : 'Your account tier or permission does not include this feature.'} {description}</p>
  </div>
}
