import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await pool.query<{
    name: string
    email: string
    image: string | null
    display_name: string | null
    onboarded: boolean
    role: string
    tier: string
    status: string
  }>(
    'SELECT name, email, image, display_name, onboarded, role, tier, status FROM "user" WHERE id = $1',
    [session.user.id],
  )

  const row = result.rows[0]
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    name: row.name,
    email: row.email,
    image: row.image,
    displayName: row.display_name,
    onboarded: row.onboarded,
    role: row.role,
    tier: row.tier,
    status: row.status,
  })
}
