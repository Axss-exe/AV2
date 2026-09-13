import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireApiUser } from '@/lib/auth-guard'

export const FEATURE_DEFINITIONS = [
  ['query', 'Query workspace', 'Run structured intelligence queries.', ['admin', 'pilot', 'standard']],
  ['investigations', 'Investigations', 'Create and review investigation workspaces.', ['admin', 'pilot', 'standard']],
  ['history', 'Analysis history', 'Review prior investigations and saved analysis.', ['admin', 'pilot', 'standard']],
  ['entities', 'Entities', 'Explore entity records and relationships.', ['admin', 'pilot', 'standard']],
  ['news', 'News intelligence', 'Analyze news and related articles.', ['admin', 'pilot', 'standard']],
  ['opportunities', 'Opportunities', 'Review and save opportunity records.', ['admin', 'pilot', 'standard']],
  ['country-map', 'Country map', 'Explore country-level intelligence views.', ['admin', 'pilot', 'standard']],
  ['execute', 'Execute and roadmaps', 'Turn analysis into execution roadmaps.', ['admin', 'pilot']],
] as const

export type FeatureKey = typeof FEATURE_DEFINITIONS[number][0]
export type FeatureConfig = { key: FeatureKey; label: string; description: string; enabled: boolean; allowedTiers: string[]; requiredPermission: string | null; updatedBy: string | null; updatedAt: string }

export async function listFeatures() {
  const result = await pool.query<FeatureConfig>('SELECT key, label, description, enabled, "allowedTiers", "requiredPermission", "updatedBy", "updatedAt" FROM "feature_config" ORDER BY key')
  return result.rows.map((row) => ({ ...row, updatedAt: new Date(row.updatedAt).toISOString() }))
}

export async function requireFeatureAccess(key: string) {
  return getFeatureAccess(key)
}

export async function getFeatureAccess(key: string) {
  const authz = await requireApiUser()
  if (authz.response || !authz.user) return { key, state: 'RESTRICTED' as const, response: authz.response }
  const result = await pool.query<FeatureConfig>('SELECT key, label, description, enabled, "allowedTiers", "requiredPermission", "updatedBy", "updatedAt" FROM "feature_config" WHERE key = $1', [key])
  const feature = result.rows[0]
  if (!feature) return { key, state: 'RESTRICTED' as const, response: NextResponse.json({ error: 'Feature unavailable' }, { status: 404 }) }
  const user = authz.user as typeof authz.user & { role?: string; tier?: string; status?: string }
  const permitted = feature.enabled && (user.role === 'admin' || feature.allowedTiers.includes(user.tier ?? ''))
  if (user.status === 'suspended' || !permitted) return { key, state: feature.enabled ? 'RESTRICTED' as const : 'DISABLED' as const, response: NextResponse.json({ error: feature.enabled ? 'Feature access restricted' : 'Feature disabled' }, { status: 403 }) }
  return { key, feature, state: 'AVAILABLE' as const, response: null }
}

export async function getFeatureMap() {
  const rows = await listFeatures()
  const authz = await requireApiUser()
  if (authz.response || !authz.user) return { user: null, features: rows.map((row) => ({ ...row, state: 'RESTRICTED' })) }
  const user = authz.user as typeof authz.user & { role?: string; tier?: string; status?: string }
  return { user: { id: user.id, role: user.role ?? 'user', tier: user.tier ?? 'standard', status: user.status ?? 'active' }, features: rows.map((row) => ({ ...row, state: user.status !== 'suspended' && (user.role === 'admin' || (row.enabled && row.allowedTiers.includes(user.tier ?? ''))) ? 'AVAILABLE' : row.enabled ? 'RESTRICTED' : 'DISABLED' })) }
}

export async function updateFeature(actorId: string, key: string, input: { enabled?: boolean; allowedTiers?: string[] }) {
  const allowedTiers = input.allowedTiers?.filter((tier) => ['admin', 'pilot', 'standard'].includes(tier))
  if (input.allowedTiers && allowedTiers?.length !== input.allowedTiers.length) throw new Error('Invalid tier')
  const result = await pool.query<FeatureConfig>('UPDATE "feature_config" SET enabled = COALESCE($2, enabled), "allowedTiers" = COALESCE($3::text[], "allowedTiers"), "updatedBy" = $4, "updatedAt" = now() WHERE key = $1 RETURNING key, label, description, enabled, "allowedTiers", "requiredPermission", "updatedBy", "updatedAt"', [key, input.enabled ?? null, allowedTiers ?? null, actorId])
  const feature = result.rows[0]
  if (!feature) return null
  await pool.query('INSERT INTO "audit_log" ("id", "actorId", "action", "targetType", "targetId", "result", "metadata") VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)', [crypto.randomUUID(), actorId, 'admin.feature.update', 'feature_config', key, 'success', JSON.stringify(input)])
  return feature
}
