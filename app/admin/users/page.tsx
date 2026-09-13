import { listAdminUsers } from '@/lib/admin'
import UsersTable from './users-table'

export default async function AdminUsersPage() {
  return <section><div className="mb-8"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">Directory</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Users</h2><p className="mt-2 text-sm text-text-muted">Manage persisted role, tier, and account status.</p></div><UsersTable initialUsers={await listAdminUsers()} /></section>
}
