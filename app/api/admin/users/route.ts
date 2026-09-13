import { NextResponse } from 'next/server'
import { listAdminUsers, requireAdminApi, updateAdminUser } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json({ users: await listAdminUsers() })
}

export async function PATCH(request: Request) {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  const body = await request.json() as { id?: string; role?: string; tier?: string; status?: string }
  if (!body.id) return NextResponse.json({ error: 'User id is required' }, { status: 400 })
  try {
    const user = await updateAdminUser(authz.user.id, body.id, { role: body.role, tier: body.tier, status: body.status })
    if (!user) return NextResponse.json({ error: 'User not found or no changes supplied' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid ')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    throw error
  }
}
