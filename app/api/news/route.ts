import { requireFeatureAccess } from '@/lib/features'
import { proxyPOST } from '@/lib/proxy'

export async function POST(req: Request) {
  const authz = await requireFeatureAccess('news')
  if (authz.response) return authz.response
  return proxyPOST('/api/news', req)
}
