import { requireServiceAccess } from '@/lib/auth-guard'
import { proxyPOST } from '@/lib/proxy'

export async function POST(req: Request) {
  const authz = await requireServiceAccess('news.analyze')
  if (authz.response) return authz.response
  return proxyPOST('/api/news', req)
}
