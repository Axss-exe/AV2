import { pool } from '@/lib/db'

export async function getAdminAnalytics() {
  const [summary, daily, events, features, tiers, questions] = await Promise.all([
    pool.query<{ users: string; events: string; questions: string; activeDays: string }>(`
      SELECT COUNT(DISTINCT "userId")::text AS users,
        COUNT(*)::text AS events,
        (SELECT COUNT(*)::text FROM "user_question") AS questions,
        COUNT(DISTINCT DATE("createdAt"))::text AS "activeDays"
      FROM "user_event"
    `),
    pool.query<{ day: string; count: string }>(`
      SELECT TO_CHAR(DATE("createdAt"), 'Mon DD') AS day, COUNT(*)::text AS count
      FROM "user_event"
      WHERE "createdAt" >= now() - interval '30 days'
      GROUP BY DATE("createdAt") ORDER BY DATE("createdAt")
    `),
    pool.query<{ eventType: string; count: string }>(`
      SELECT "eventType", COUNT(*)::text AS count FROM "user_event"
      GROUP BY "eventType" ORDER BY COUNT(*) DESC LIMIT 10
    `),
    pool.query<{ feature: string; count: string }>(`
      SELECT COALESCE("feature", 'unassigned') AS feature, COUNT(*)::text AS count
      FROM "user_event" GROUP BY COALESCE("feature", 'unassigned')
      ORDER BY COUNT(*) DESC LIMIT 10
    `),
    pool.query<{ tier: string; count: string }>(`
      SELECT COALESCE("tier", 'unknown') AS tier, COUNT(*)::text AS count
      FROM "user_event" GROUP BY COALESCE("tier", 'unknown') ORDER BY COUNT(*) DESC
    `),
    pool.query<{ id: string; question: string; feature: string | null; tier: string | null; createdAt: string }>(`
      SELECT "id", "question", "feature", "tier", "createdAt"::text AS "createdAt"
      FROM "user_question" ORDER BY "createdAt" DESC LIMIT 25
    `),
  ])

  return {
    summary: Object.fromEntries(Object.entries(summary.rows[0] ?? {}).map(([key, value]) => [key, Number(value)])),
    daily: daily.rows.map((row) => ({ ...row, count: Number(row.count) })),
    events: events.rows.map((row) => ({ ...row, count: Number(row.count) })),
    features: features.rows.map((row) => ({ ...row, count: Number(row.count) })),
    tiers: tiers.rows.map((row) => ({ ...row, count: Number(row.count) })),
    questions: questions.rows,
  }
}
