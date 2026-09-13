import { requireFeatureAccess } from '@/lib/features'
import { proxyPOST } from '@/lib/proxy'

export async function POST(req: Request) {
  const authz = await requireFeatureAccess('execute')
  if (authz.response) return authz.response
  return proxyPOST('/api/execute', req)
}
