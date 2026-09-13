import { headers } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { pool } from '@/lib/db'

const MAX_TEXT = 1000
const MAX_JSON_KEYS = 30

type AnalyticsContext = {
  route?: string
  feature?: string
  sessionId?: string
  tier?: string
  payload?: Record<string, unknown>
}

function cleanText(value: unknown, max = MAX_TEXT) {
  return typeof value === 'string' ? value.trim().slice(0, max) : undefined
}

function cleanPayload(payload: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(payload).slice(0, MAX_JSON_KEYS).map(([key, value]) => [
    cleanText(key, 80) ?? 'unknown',
    typeof value === 'string' ? cleanText(value, 300) : typeof value === 'number' || typeof value === 'boolean' || value === null ? value : undefined,
  ]).filter(([, value]) => value !== undefined))
}

async function getRequestContext() {
  const requestHeaders = await headers()
  return {
    route: cleanText(requestHeaders.get('x-invoke-path') ?? requestHeaders.get('referer'), 300),
    userAgent: cleanText(requestHeaders.get('user-agent'), 300),
  }
}

export async function recordUserEvent(userId: string, eventType: string, context: AnalyticsContext = {}) {
  const requestContext = await getRequestContext()
  await pool.query(
    'INSERT INTO "user_event" ("id", "userId", "sessionId", "eventType", "feature", "route", "tier", "payload") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)',
    [randomUUID(), userId, cleanText(context.sessionId, 160) ?? null, cleanText(eventType, 100) ?? 'unknown', cleanText(context.feature, 100) ?? null, cleanText(context.route, 300) ?? requestContext.route ?? null, cleanText(context.tier, 40) ?? null, JSON.stringify({ ...cleanPayload(context.payload), userAgent: requestContext.userAgent })],
  )
}

export async function recordUserQuestion(userId: string, question: string, context: AnalyticsContext = {}) {
  const requestContext = await getRequestContext()
  const sanitizedQuestion = cleanText(question)
  if (!sanitizedQuestion) return
  await pool.query(
    'INSERT INTO "user_question" ("id", "userId", "sessionId", "question", "route", "feature", "tier", "context") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)',
    [randomUUID(), userId, cleanText(context.sessionId, 160) ?? null, sanitizedQuestion, cleanText(context.route, 300) ?? requestContext.route ?? null, cleanText(context.feature, 100) ?? null, cleanText(context.tier, 40) ?? null, JSON.stringify({ ...cleanPayload(context.payload), userAgent: requestContext.userAgent })],
  )
}

export async function recordUserEventSafely(userId: string, eventType: string, context: AnalyticsContext = {}) {
  try {
    await recordUserEvent(userId, eventType, context)
  } catch (error) {
    console.error('[v0] analytics event failed', error)
  }
}

export async function recordUserQuestionSafely(userId: string, question: string, context: AnalyticsContext = {}) {
  try {
    await recordUserQuestion(userId, question, context)
  } catch (error) {
    console.error('[v0] analytics question failed', error)
  }
}
