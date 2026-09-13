'use client'

import { useState } from 'react'
import type { AdminUser } from '@/lib/admin'

export default function UsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [busy, setBusy] = useState<string | null>(null)
  async function update(id: string, field: 'role' | 'tier' | 'status', value: string) {
    setBusy(id)
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, [field]: value }) })
    if (response.ok) { const data = await response.json() as { user: AdminUser }; setUsers((current) => current.map((user) => user.id === id ? data.user : user)) }
    setBusy(null)
  }
  return <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-border-default font-mono text-[10px] uppercase tracking-[0.12em] text-text-dim"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b border-border-default last:border-0"><td className="px-4 py-4"><p className="font-medium">{user.name}</p><p className="text-xs text-text-muted">{user.email}</p></td><td className="px-4 py-4"><select disabled={busy === user.id} value={user.role} onChange={(event) => update(user.id, 'role', event.target.value)} className="rounded border border-border-default bg-bg-control px-2 py-1 text-xs"><option value="user">User</option><option value="admin">Admin</option></select></td><td className="px-4 py-4"><select disabled={busy === user.id} value={user.tier} onChange={(event) => update(user.id, 'tier', event.target.value)} className="rounded border border-border-default bg-bg-control px-2 py-1 text-xs"><option value="admin">Admin</option><option value="pilot">Pilot</option><option value="standard">Standard</option></select></td><td className="px-4 py-4"><select disabled={busy === user.id} value={user.status} onChange={(event) => update(user.id, 'status', event.target.value)} className="rounded border border-border-default bg-bg-control px-2 py-1 text-xs"><option value="active">Active</option><option value="suspended">Suspended</option></select></td></tr>)}</tbody></table>{users.length === 0 && <p className="p-8 text-center text-sm text-text-muted">No users found.</p>}</div>
}
