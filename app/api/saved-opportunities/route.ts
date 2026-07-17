import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/saved-opportunities — list all saved opportunities
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id, opportunity_id, title, type,
        urgency_score, feasibility_score, justification,
        required_missing_nodes, capital_flow,
        dashboard_json, intelligence_id, trigger_event,
        source_article_id, source_article_headline, saved_at,
        (SELECT id FROM roadmaps r WHERE r.saved_opportunity_id = so.id ORDER BY executed_at DESC LIMIT 1) AS latest_roadmap_id
      FROM saved_opportunities so
      ORDER BY saved_at DESC
    `;
    return NextResponse.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('[saved-opportunities GET]', err);
    return NextResponse.json({ error: 'Failed to fetch saved opportunities' }, { status: 500 });
  }
}

// POST /api/saved-opportunities — save a new opportunity
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      opportunity_id,
      title,
      type,
      urgency_score,
      feasibility_score,
      justification,
      required_missing_nodes,
      capital_flow,
      dashboard_json,
      intelligence_id,
      trigger_event,
      source_article_id,
      source_article_headline,
    } = body;

    if (!opportunity_id || !title || !dashboard_json) {
      return NextResponse.json({ error: 'opportunity_id, title, and dashboard_json are required' }, { status: 400 });
    }

    // Prevent duplicate saves of the same opportunity
    const existing = await sql`
      SELECT id FROM saved_opportunities WHERE opportunity_id = ${opportunity_id} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ status: 'already_saved', id: existing[0].id });
    }

    const result = await sql`
      INSERT INTO saved_opportunities (
        opportunity_id, title, type, urgency_score, feasibility_score,
        justification, required_missing_nodes, capital_flow, dashboard_json,
        intelligence_id, trigger_event, source_article_id, source_article_headline
      ) VALUES (
        ${opportunity_id}, ${title}, ${type ?? null},
        ${urgency_score ?? 0}, ${feasibility_score ?? 0},
        ${justification ?? null},
        ${JSON.stringify(required_missing_nodes ?? [])}::jsonb,
        ${JSON.stringify(capital_flow ?? {})}::jsonb,
        ${JSON.stringify(dashboard_json)}::jsonb,
        ${intelligence_id ?? null}, ${trigger_event ?? null},
        ${source_article_id ?? null}, ${source_article_headline ?? null}
      )
      RETURNING id, saved_at
    `;
    return NextResponse.json({ status: 'saved', id: result[0].id, saved_at: result[0].saved_at });
  } catch (err) {
    console.error('[saved-opportunities POST]', err);
    return NextResponse.json({ error: 'Failed to save opportunity' }, { status: 500 });
  }
}
