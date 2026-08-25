import { NextRequest, NextResponse } from 'next/server';
import { getInvestigationDetail } from '@/lib/investigation-db';

// GET /api/investigations/[id] — full detail: metadata + ordered queries[] + aggregated + report
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investigationId = parseInt(id, 10);
    if (Number.isNaN(investigationId)) {
      return NextResponse.json({ error: 'Invalid investigation id' }, { status: 400 });
    }

    const data = await getInvestigationDetail(investigationId);
    if (!data) {
      return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
    }

    return NextResponse.json({ status: 'ok', data });
  } catch (err) {
    console.error('[investigations/[id] GET]', err);
    return NextResponse.json({ error: 'Failed to fetch investigation' }, { status: 500 });
  }
}
