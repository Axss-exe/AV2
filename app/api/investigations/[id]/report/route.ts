import { NextRequest, NextResponse } from 'next/server';
import { sql, getInvestigationDetail } from '@/lib/investigation-db';
import { proxyPOSTWithTimeout } from '@/lib/proxy';

const REQUEST_TIMEOUT_MS = 120_000;

function safeBackendError(body: unknown, status: number) {
  if (body && typeof body === 'object') {
    const candidate = body as { detail?: unknown; error?: unknown; message?: unknown };
    for (const value of [candidate.detail, candidate.error, candidate.message]) {
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  return `ATISv2 report generation failed (HTTP ${status}).`;
}

// POST /api/investigations/[id]/report — forwards the persisted investigation
// to ATISv2, which owns report generation and all LLM configuration.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investigationId = Number.parseInt(id, 10);
    if (Number.isNaN(investigationId)) {
      return NextResponse.json({ error: 'Invalid investigation id' }, { status: 400 });
    }

    const investigation = await getInvestigationDetail(investigationId);
    if (!investigation) {
      return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
    }
    if (investigation.queries.length === 0) {
      return NextResponse.json({ error: 'Investigation has no queries yet' }, { status: 400 });
    }

    let backendResponse: Response;

    try {
      backendResponse = await proxyPOSTWithTimeout(
        '/api/investigation/report',
        new Request('http://localhost/api/investigation/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ investigation }),
        }),
        REQUEST_TIMEOUT_MS
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'ATISv2 took too long to generate the report. Please try again.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: 'Could not reach the ATISv2 report service. Please try again.' },
        { status: 502 }
      );
    }

    const body: unknown = await backendResponse.json().catch(() => null);
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: safeBackendError(body, backendResponse.status),
          detail: safeBackendError(body, backendResponse.status),
        },
        { status: backendResponse.status >= 500 ? 502 : backendResponse.status }
      );
    }

    if (!body || typeof body !== 'object' || !('report' in body)) {
      return NextResponse.json(
        { error: 'ATISv2 returned an incomplete report response.' },
        { status: 502 }
      );
    }

    const report = (body as { report: unknown }).report;
    await sql`
      UPDATE investigations
      SET report_json = ${JSON.stringify(report)}::jsonb,
          report_generated_at = now(),
          updated_at = now()
      WHERE id = ${investigationId}
    `;

    return NextResponse.json({ status: 'ok', data: report });
  } catch (error) {
    console.error('[investigations/[id]/report POST]', error);
    return NextResponse.json({ error: 'Unable to complete the report request.' }, { status: 500 });
  }
}
