import { getNeonClient } from '@/lib/neon';
import { NextRequest, NextResponse } from 'next/server';

const sql = (strings: TemplateStringsArray, ...values: unknown[]) => getNeonClient()(strings, ...values);

// POST /api/roadmaps — save a roadmap result after execute
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      saved_opportunity_id,
      opportunity_id,
      opportunity_title,
      roadmap_text,
      lineage_traces,
      raw_response,
    } = body;

    if (!opportunity_id || !raw_response) {
      return NextResponse.json({ error: 'opportunity_id and raw_response are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO roadmaps (
        saved_opportunity_id, opportunity_id, opportunity_title,
        roadmap_text, lineage_traces, raw_response
      ) VALUES (
        ${saved_opportunity_id ?? null}, ${opportunity_id}, ${opportunity_title ?? null},
        ${roadmap_text ?? null},
        ${JSON.stringify(lineage_traces ?? [])}::jsonb,
        ${JSON.stringify(raw_response)}::jsonb
      )
      RETURNING id, executed_at
    `;
    return NextResponse.json({ status: 'saved', id: result[0].id, executed_at: result[0].executed_at });
  } catch (err) {
    console.error('[roadmaps POST]', err);
    return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 });
  }
}

// GET /api/roadmaps?opportunity_id=... — fetch roadmaps for an opportunity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get('opportunity_id');
    const savedId = searchParams.get('saved_opportunity_id');

    let rows;
    if (savedId) {
      rows = await sql`SELECT * FROM roadmaps WHERE saved_opportunity_id = ${parseInt(savedId, 10)} ORDER BY executed_at DESC`;
    } else if (opportunityId) {
      rows = await sql`SELECT * FROM roadmaps WHERE opportunity_id = ${opportunityId} ORDER BY executed_at DESC`;
    } else {
      rows = await sql`SELECT * FROM roadmaps ORDER BY executed_at DESC LIMIT 20`;
    }
    return NextResponse.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('[roadmaps GET]', err);
    return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: 500 });
  }
}
