import { NextRequest, NextResponse } from 'next/server';
import { sql, getInvestigationDetail } from '@/lib/investigation-db';
import type { QueryResult } from '@/lib/types';

// POST /api/investigations/[id]/queries — append the next follow-up query.
// The client already called queryAPI() + mapAPIResponseToQueryResult(), same
// as the standalone Query page — this route only persists the real result.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investigationId = parseInt(id, 10);
    if (Number.isNaN(investigationId)) {
      return NextResponse.json({ error: 'Invalid investigation id' }, { status: 400 });
    }

    const body = await req.json();
    const { question, result }: { question: string; result: QueryResult } = body;

    if (!question || !result) {
      return NextResponse.json({ error: 'question and result are required' }, { status: 400 });
    }

    const [existing] = await sql`SELECT id FROM investigations WHERE id = ${investigationId}`;
    if (!existing) {
      return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
    }

    const [{ next_sequence: nextSequence }] = await sql`
      SELECT coalesce(max(sequence), 0) + 1 AS next_sequence
      FROM investigation_queries WHERE investigation_id = ${investigationId}
    `;

    await sql`
      INSERT INTO investigation_queries (investigation_id, sequence, question, result_json)
      VALUES (${investigationId}, ${nextSequence}, ${question}, ${JSON.stringify(result)}::jsonb)
    `;

    await sql`UPDATE investigations SET updated_at = now() WHERE id = ${investigationId}`;

    const data = await getInvestigationDetail(investigationId);
    return NextResponse.json({ status: 'ok', data });
  } catch (err) {
    console.error('[investigations/[id]/queries POST]', err);
    return NextResponse.json({ error: 'Failed to add query' }, { status: 500 });
  }
}
