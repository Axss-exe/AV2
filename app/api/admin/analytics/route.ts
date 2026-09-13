import { NextResponse } from 'next/server'
import { getAdminAnalytics } from '@/lib/admin-analytics'
import { requireAdminApi } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json(await getAdminAnalytics())
}
