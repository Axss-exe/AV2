import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json({ database: 'operational', analysisPipeline: 'external', batana: 'not_available', auditLog: 'not_available' })
}
