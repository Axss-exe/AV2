import { requireApiUser } from '@/lib/auth-guard'
import { requireFeatureAccess } from '@/lib/features'
import { recordUserEventSafely, recordUserQuestionSafely } from '@/lib/analytics'
import { proxyPOST } from '@/lib/proxy'

export async function POST(req: Request) {
  const authz = await requireFeatureAccess('query')
  if (authz.response) return authz.response
  const userResult = await requireApiUser()
  if (userResult.response || !userResult.user) return userResult.response
  const body = await req.clone().json().catch(() => ({})) as Record<string, unknown>
  const question = typeof body.question === 'string' ? body.question : typeof body.query === 'string' ? body.query : ''
  await Promise.all([
    recordUserEventSafely(userResult.user.id, 'query_submitted', { feature: 'query', tier: (userResult.user as { tier?: string }).tier, payload: { hasQuestion: Boolean(question) } }),
    recordUserQuestionSafely(userResult.user.id, question, { feature: 'query', tier: (userResult.user as { tier?: string }).tier, payload: { source: 'query_workspace' } }),
  ])
  return proxyPOST('/api/query', req)
}
