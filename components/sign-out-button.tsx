'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
      router.replace('/sign-in')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:cursor-wait disabled:opacity-60"
      style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }}
      aria-label="Sign out of ATIS"
    >
      <LogOut size={15} aria-hidden="true" />
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
