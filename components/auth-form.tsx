'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { trackUserEvent } from '@/lib/analytics-client'

type AuthFormProps = { mode: 'sign-in' | 'sign-up' }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = mode === 'sign-in'
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ name, email, password })
    setPending(false)
    if (result.error) {
      setError('Unable to authenticate with those details.')
      return
    }
    trackUserEvent({ eventType: mode === 'sign-in' ? 'sign_in_completed' : 'sign_up_completed', feature: 'authentication', payload: { authMode: mode } })
    router.push('/atis-dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className={mode === 'sign-in' ? 'flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:gap-2' : 'flex w-full max-w-md flex-col gap-4'}>
      {mode === 'sign-up' && (
        <label className="flex flex-col gap-2 text-sm">
          Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded border border-border bg-bg-secondary px-3 py-2" />
        </label>
      )}
      <label className={mode === 'sign-in' ? 'flex min-w-0 flex-1 flex-col gap-1 text-xs' : 'flex flex-col gap-2 text-sm'}>
        Email
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="rounded border border-border bg-bg-secondary px-3 py-2" />
      </label>
      <label className={mode === 'sign-in' ? 'flex min-w-0 flex-1 flex-col gap-1 text-xs' : 'flex flex-col gap-2 text-sm'}>
        Password
        <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="rounded border border-border bg-bg-secondary px-3 py-2" />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button disabled={pending} className={mode === 'sign-in' ? 'shrink-0 rounded bg-text-primary px-4 py-2 text-bg-primary disabled:opacity-50' : 'rounded bg-text-primary px-4 py-2 text-bg-primary disabled:opacity-50'}>
        {pending ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}
