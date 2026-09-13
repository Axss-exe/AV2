import { NextResponse } from 'next/server'
import { getFeatureMap } from '@/lib/features'

export async function GET() {
  return NextResponse.json(await getFeatureMap())
}
