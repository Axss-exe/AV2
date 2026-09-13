import { NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/auth-guard'
import { recordUserEventSafely } from '@/lib/analytics'

export async function POST(request: Request) {
  const result = await requireApiUser()
  if (result.response || !result.user) return result.response
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const eventType = typeof body.eventType === 'string' ? body.eventType : ''
  if (!eventType) return NextResponse.json({ error: 'eventType is required' }, { status: 400 })
  await recordUserEventSafely(result.user.id, eventType, {
    feature: typeof body.feature === 'string' ? body.feature : undefined,
    route: typeof body.route === 'string' ? body.route : undefined,
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
    tier: typeof body.tier === 'string' ? body.tier : undefined,
    payload: typeof body.payload === 'object' && body.payload !== null ? body.payload as Record<string, unknown> : undefined,
  })
  return NextResponse.json({ ok: true })
}
