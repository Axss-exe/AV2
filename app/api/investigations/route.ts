import { NextRequest, NextResponse } from 'next/server';
import { sql, deriveTitle, type InvestigationRow } from '@/lib/investigation-db';
import type { InvestigationSummary } from '@/lib/investigation-types';
import type { QueryResult } from '@/lib/types';

// GET /api/investigations — list, with lightweight (non-deduped) per-row counts
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        i.id, i.title, i.root_question, i.status, i.created_at, i.updated_at,
        (SELECT count(*) FROM investigation_queries q WHERE q.investigation_id = i.id)::int AS queries_count,
        (SELECT coalesce(sum(jsonb_array_length(coalesce(q.result_json->'tableRows', '[]'::jsonb))), 0)
           FROM investigation_queries q WHERE q.investigation_id = i.id)::int AS sources_count,
        (SELECT coalesce(sum(jsonb_array_length(coalesce(q.result_json->'keyEntities', '[]'::jsonb))), 0)
           FROM investigation_queries q WHERE q.investigation_id = i.id)::int AS entities_count
      FROM investigations i
      ORDER BY i.updated_at DESC
    `;

    const data: InvestigationSummary[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      rootQuestion: r.root_question,
      status: r.status,
      queriesCount: r.queries_count,
      sourcesCount: r.sources_count,
      entitiesCount: r.entities_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ status: 'ok', data });
  } catch (err) {
    console.error('[investigations GET]', err);
    return NextResponse.json({ error: 'Failed to fetch investigations' }, { status: 500 });
  }
}

// POST /api/investigations — start a new investigation from an already-fetched QueryResult
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      result,
      perspectiveCountry,
      perspectiveCountryCode,
    }: { question: string; result: QueryResult; perspectiveCountry?: string; perspectiveCountryCode?: string } = body;

    if (!question || !result) {
      return NextResponse.json({ error: 'question and result are required' }, { status: 400 });
    }

    const title = deriveTitle(question);

    const [investigation] = await sql`
      INSERT INTO investigations (title, root_question, status, perspective_country, perspective_country_code)
      VALUES (${title}, ${question}, 'active', ${perspectiveCountry ?? null}, ${perspectiveCountryCode ?? null})
      RETURNING id
    ` as unknown as InvestigationRow[];

    await sql`
      INSERT INTO investigation_queries (investigation_id, sequence, question, result_json)
      VALUES (${investigation.id}, 1, ${question}, ${JSON.stringify(result)}::jsonb)
    `;

    return NextResponse.json({ status: 'created', id: investigation.id });
  } catch (err) {
    console.error('[investigations POST]', err);
    return NextResponse.json({ error: 'Failed to create investigation' }, { status: 500 });
  }
}
