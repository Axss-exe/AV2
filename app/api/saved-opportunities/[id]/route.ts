import { getNeonClient } from '@/lib/neon';
import { NextRequest, NextResponse } from 'next/server';

const sql = (strings: TemplateStringsArray, ...values: unknown[]) => getNeonClient()(strings, ...values);

// DELETE /api/saved-opportunities/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await sql`DELETE FROM saved_opportunities WHERE id = ${numId}`;
    return NextResponse.json({ status: 'deleted' });
  } catch (err) {
    console.error('[saved-opportunities DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}

// GET /api/saved-opportunities/[id] — fetch single saved opportunity + its roadmaps
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
    const rows = await sql`SELECT * FROM saved_opportunities WHERE id = ${numId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const roadmaps = await sql`
      SELECT * FROM roadmaps WHERE saved_opportunity_id = ${numId} ORDER BY executed_at DESC
    `;
    return NextResponse.json({ status: 'ok', data: rows[0], roadmaps });
  } catch (err) {
    console.error('[saved-opportunities GET id]', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
