import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await pool.query(
    'SELECT id, title, body, href, read, "createdAt" FROM notification WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 20',
    [session.user.id],
  )
  return NextResponse.json({ notifications: result.rows })
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (body.id) {
    await pool.query('UPDATE notification SET read = true WHERE id = $1 AND "userId" = $2', [body.id, session.user.id])
  } else {
    await pool.query('UPDATE notification SET read = true WHERE "userId" = $1', [session.user.id])
  }
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (typeof body.title !== 'string' || typeof body.body !== 'string') return NextResponse.json({ error: 'Invalid notification' }, { status: 400 })
  const result = await pool.query(
    'INSERT INTO notification ("userId", title, body, href) VALUES ($1, $2, $3, $4) RETURNING id, title, body, href, read, "createdAt"',
    [session.user.id, body.title.slice(0, 160), body.body.slice(0, 500), typeof body.href === 'string' ? body.href.slice(0, 500) : null],
  )
  return NextResponse.json({ notification: result.rows[0] }, { status: 201 })
}
