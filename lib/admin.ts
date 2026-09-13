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

const ADMIN_VALUES = {
  role: new Set(['admin', 'user']),
  tier: new Set(['admin', 'pilot', 'standard']),
  status: new Set(['active', 'suspended']),
} as const

export async function updateAdminUser(actorId: string, id: string, input: { role?: string; tier?: string; status?: string }) {
  const fields: string[] = []
  const values: string[] = []
  for (const key of ['role', 'tier', 'status'] as const) {
    const value = input[key]
    if (value !== undefined) {
      if (!ADMIN_VALUES[key].has(value)) throw new Error(`Invalid ${key}`)
      fields.push(`"${key}" = $${values.length + 1}`)
      values.push(value)
    }
  }
  if (!fields.length) return null
  values.push(id)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query<AdminUser>(
      `UPDATE "user" SET ${fields.join(', ')}, "updatedAt" = now() WHERE id = $${values.length}
       RETURNING id, name, email, role, tier, status, "createdAt", "updatedAt"`,
      values,
    )
    const user = result.rows[0] ?? null
    if (!user) {
      await client.query('ROLLBACK')
      return null
    }
    await client.query(
      `INSERT INTO "audit_log" ("id", "actorId", "action", "targetType", "targetId", "result", "metadata")
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [crypto.randomUUID(), actorId, 'admin.user.update', 'user', id, 'success', JSON.stringify({ fields: Object.keys(input).filter((key) => input[key as keyof typeof input] !== undefined) })],
    )
    await client.query('COMMIT')
    return user
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getAuditLogStatus() {
  const result = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "audit_log"')
  return { status: 'operational', records: Number(result.rows[0]?.count ?? 0) }
}
