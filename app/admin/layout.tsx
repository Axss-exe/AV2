import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin'

const links = [['/admin', 'Overview'], ['/admin/analytics', 'Analytics'], ['/admin/users', 'Users'], ['/admin/requests', 'Requests'], ['/admin/roles', 'Roles & tiers'], ['/admin/permissions', 'Permissions'], ['/admin/system', 'System']] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/atis-dashboard')
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">ATIS / CONTROL ROOM</p><h1 className="mt-1 text-lg font-semibold">Administration</h1></div>
          <div className="flex items-center gap-5"><Link href="/atis-dashboard" className="rounded-md border border-border-default px-3 py-2 font-mono text-xs text-text-muted transition hover:border-border-active hover:text-text-primary">Back to ATIS</Link><div className="text-right"><p className="font-mono text-[10px] uppercase text-text-dim">Signed in as</p><p className="text-sm">{admin.email}</p></div></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto lg:w-52 lg:shrink-0 lg:flex-col">
          {links.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-md border border-border-default px-3 py-2 font-mono text-xs text-text-muted transition hover:border-border-active hover:text-text-primary">{label}</Link>)}
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
