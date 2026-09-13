import { NextResponse } from 'next/server'
import { getAdminOverview, requireAdminApi } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json(await getAdminOverview())
}
