import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  tier: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function getAdminUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as ({ id: string; email: string; name: string; role?: string } | undefined)
  return user?.role === 'admin' ? user : null
}

export async function requireAdminApi() {
  const user = await getAdminUser()
  if (!user) return { user: null, response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  return { user, response: null }
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const result = await pool.query<AdminUser>(
    'SELECT id, name, email, role, tier, status, "createdAt", "updatedAt" FROM "user" ORDER BY "createdAt" DESC',
  )
  return result.rows.map((row) => ({ ...row, createdAt: new Date(row.createdAt).toISOString(), updatedAt: new Date(row.updatedAt).toISOString() }))
}

export async function getAdminOverview() {
  const result = await pool.query<{ total: string; active: string; admins: string; pilots: string }>(
    `SELECT COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE status = 'active')::text AS active,
      COUNT(*) FILTER (WHERE role = 'admin')::text AS admins,
      COUNT(*) FILTER (WHERE tier = 'pilot')::text AS pilots
     FROM "user"`,
  )
  return { ...result.rows[0], requests: null, integrations: 'not_available' }
}

export async function updateAdminUser(id: string, input: { role?: string; tier?: string; status?: string }) {
  const fields: string[] = []
  const values: string[] = []
  for (const key of ['role', 'tier', 'status'] as const) {
    if (input[key] !== undefined) {
      fields.push(`"${key}" = $${values.length + 1}`)
      values.push(input[key]!)
    }
  }
  if (!fields.length) return null
  values.push(id)
  const result = await pool.query<AdminUser>(
    `UPDATE "user" SET ${fields.join(', ')}, "updatedAt" = now() WHERE id = $${values.length}
     RETURNING id, name, email, role, tier, status, "createdAt", "updatedAt"`,
    values,
  )
  return result.rows[0] ?? null
}
