'use client'

import useSWR from 'swr'

export interface UserProfile {
  name: string
  email: string
  image: string | null
  displayName: string | null
  onboarded: boolean
  role: string
  tier: string
  status: string
}

const fetcher = async (url: string): Promise<UserProfile> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to load profile')
  }
  return res.json()
}

export function useProfile() {
  return useSWR<UserProfile>('/api/profile', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
}

/** The name to greet/address the user by, with sensible fallbacks. */
export function resolveDisplayName(profile?: UserProfile | null): string {
  const chosen = profile?.displayName?.trim()
  if (chosen) return chosen
  const accountName = profile?.name?.trim()
  if (accountName) return accountName.split(/\s+/)[0]
  return 'Analyst'
}
