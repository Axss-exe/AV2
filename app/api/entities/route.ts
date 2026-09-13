import { requireFeatureAccess } from '@/lib/features'
import { proxyGET } from '@/lib/proxy'

export async function GET() {
  const authz = await requireFeatureAccess('entities')
  if (authz.response) return authz.response
  return proxyGET('/api/entities')
}
