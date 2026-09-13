import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function requireApiUser() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  return { user, response: null }
}

export async function requireServiceAccess(permission: string) {
  const result = await requireApiUser()
  if (result.response || !result.user) return result

  const user = result.user as typeof result.user & { role?: string; status?: string }
  if (user.status === 'suspended') {
    return { user: null, response: NextResponse.json({ error: 'Account suspended' }, { status: 403 }) }
  }
  if (user.role === 'admin') return result

  const permissionResult = await pool.query<{ exists: boolean }>(
    'SELECT EXISTS (SELECT 1 FROM "user_permission" WHERE "userId" = $1 AND permission = $2) AS exists',
    [user.id, permission],
  )
  if (!permissionResult.rows[0]?.exists) {
    return { user: null, response: NextResponse.json({ error: `Permission required: ${permission}` }, { status: 403 }) }
  }
  return result
}
