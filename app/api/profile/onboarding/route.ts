import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

// Cap the stored avatar payload. The client resizes to a small square before
// upload, so a legitimate image lands well under this; anything larger is
// rejected rather than bloating the row.
const MAX_IMAGE_BYTES = 600_000

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { displayName?: unknown; image?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  if (displayName.length < 1 || displayName.length > 60) {
    return NextResponse.json(
      { error: 'Please enter a name between 1 and 60 characters.' },
      { status: 400 },
    )
  }

  let image: string | null = null
  if (typeof body.image === 'string' && body.image.length > 0) {
    if (!body.image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format.' }, { status: 400 })
    }
    if (body.image.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'Image is too large. Please choose a smaller picture.' },
        { status: 413 },
      )
    }
    image = body.image
  }

  await pool.query(
    'UPDATE "user" SET display_name = $1, image = $2, onboarded = true, "updatedAt" = now() WHERE id = $3',
    [displayName, image, session.user.id],
  )

  return NextResponse.json({ ok: true, displayName, image })
}
