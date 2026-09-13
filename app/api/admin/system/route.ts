import { NextResponse } from 'next/server'
import { getAuditLogStatus, requireAdminApi } from '@/lib/admin'

export async function GET() {
  const authz = await requireAdminApi()
  if (authz.response) return authz.response
  return NextResponse.json({ database: 'operational', analysisPipeline: 'external', batana: 'not_available', auditLog: await getAuditLogStatus() })
}
