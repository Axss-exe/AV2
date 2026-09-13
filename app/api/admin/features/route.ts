import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin'
import { listFeatures, updateFeature } from '@/lib/features'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json({ features: await listFeatures() })
}

export async function PATCH(request: Request) {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  const body = await request.json() as { key?: string; enabled?: boolean; allowedTiers?: string[] }
  if (!body.key || (body.enabled !== undefined && typeof body.enabled !== 'boolean') || (body.allowedTiers && !Array.isArray(body.allowedTiers))) return NextResponse.json({ error: 'Invalid feature update' }, { status: 400 })
  try {
    const feature = await updateFeature(authz.user.id, body.key, { enabled: body.enabled, allowedTiers: body.allowedTiers })
    return feature ? NextResponse.json({ feature }) : NextResponse.json({ error: 'Feature not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid feature update' }, { status: 400 })
  }
}
