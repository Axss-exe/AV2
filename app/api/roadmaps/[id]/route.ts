import { getNeonClient } from '@/lib/neon';
import { NextRequest, NextResponse } from 'next/server';

const sql = (strings: TemplateStringsArray, ...values: unknown[]) => getNeonClient()(strings, ...values);

// GET /api/roadmaps/[id] — fetch a single roadmap record
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const rows = await sql`SELECT * FROM roadmaps WHERE id = ${numId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    return NextResponse.json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('[roadmaps GET id]', err);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}
