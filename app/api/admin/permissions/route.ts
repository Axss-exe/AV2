import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdminApi } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  const result = await pool.query<{ userId: string; permission: string; createdAt: string }>(
    'SELECT "userId", permission, "createdAt" FROM "user_permission" ORDER BY "createdAt" DESC',
  )
  return NextResponse.json({ permissions: result.rows })
}

export async function POST(request: Request) {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  const body = await request.json() as { userId?: string; permission?: string }
  if (!body.userId || !body.permission || !/^[a-z][a-z0-9]*(\.[a-z0-9-]+)+$/.test(body.permission)) {
    return NextResponse.json({ error: 'userId and a valid dotted permission are required' }, { status: 400 })
  }
  await pool.query(
    'INSERT INTO "user_permission" ("userId", permission) VALUES ($1, $2) ON CONFLICT ("userId", permission) DO NOTHING',
    [body.userId, body.permission],
  )
  await pool.query(
    `INSERT INTO "audit_log" ("id", "actorId", "action", "targetType", "targetId", "result", "metadata") VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [crypto.randomUUID(), authz.user.id, 'admin.permission.grant', 'user_permission', body.userId, 'success', JSON.stringify({ permission: body.permission })],
  )
  return NextResponse.json({ ok: true }, { status: 201 })
}
