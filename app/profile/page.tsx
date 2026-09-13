import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AppShell } from '@/components/app-shell'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const result = await pool.query<{
    name: string
    email: string
    role: string
    tier: string
    status: string
    createdAt: Date
  }>(
    'SELECT name, email, role, tier, status, "createdAt" FROM "user" WHERE id = $1',
    [session.user.id],
  )
  const profile = result.rows[0]

  if (!profile) redirect('/sign-in')

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl py-8 sm:py-12">
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--accent-fg)' }}>Account profile</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Your access profile</h1>
          <p className="mt-2 max-w-xl leading-6" style={{ color: 'var(--text-secondary)' }}>
            Confirm the account class and workspace tier currently assigned to your ATIS identity.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" aria-label="Profile details">
          <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold" style={{ background: 'var(--bg-control-active)', color: 'var(--text-primary)' }} aria-hidden="true">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
                <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Account class" value={profile.role === 'admin' ? 'Administrator' : 'Standard user'} />
              <Detail label="Account status" value={profile.status === 'active' ? 'Active' : 'Suspended'} />
              <Detail label="Member since" value={profile.createdAt.toLocaleDateString()} />
              <Detail label="User ID" value={session.user.id} mono />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border p-6 shadow-sm" style={{ background: 'var(--bg-control-active)', borderColor: 'var(--border-strong)' }}>
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border-[18px] opacity-20" style={{ borderColor: 'var(--accent-fg)' }} aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full border-[14px] opacity-10" style={{ borderColor: 'var(--accent-fg)' }} aria-hidden="true" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>Workspace entitlement</p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>ATIS access card</p>
                </div>
                <span className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ background: 'var(--accent-bg)', color: 'var(--accent-fg)' }}>
                  {profile.status}
                </span>
              </div>
              <div className="mt-7 flex items-center gap-4">
                <div className="h-9 w-12 rounded-md border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }} aria-hidden="true">
                  <div className="mt-3 h-px w-full" style={{ background: 'var(--border-default)' }} />
                </div>
                <div>
                  <p className="text-3xl font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{profile.tier}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>Current access tier</p>
                </div>
              </div>
              <div className="mt-8 flex items-end justify-between gap-4 border-t pt-4" style={{ borderColor: 'var(--border-default)' }}>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Cardholder</p>
                  <p className="mt-1 truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Status</p>
                  <p className="mt-1 text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{profile.status}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`mt-1 truncate text-sm ${mono ? 'font-mono text-xs' : 'font-medium'}`} style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
