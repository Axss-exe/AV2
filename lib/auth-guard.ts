import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function requireApiUser() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  return { user, response: null }
}
