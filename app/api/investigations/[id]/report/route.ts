import { NextRequest, NextResponse } from 'next/server';
import { generateText, Output, NoObjectGeneratedError } from 'ai';
import { z } from 'zod';
import { sql, getInvestigationDetail } from '@/lib/investigation-db';

const REPORT_MODEL = 'anthropic/claude-sonnet-4.5';

const reportSchema = z.object({
  executiveAssessment: z.string().describe('2-4 sentence high-level assessment synthesizing the investigation.'),
  keyFindings: z.array(z.string()).describe('The most important findings, drawn only from the provided data.'),
  actorLandscape: z.string().describe('A short narrative describing the key entities/actors and their roles, using only the provided entities.'),
  relationshipsNarrative: z.string().describe('A short narrative describing how the provided relationships connect the actors.'),
  risks: z.array(z.string()).describe('Risks drawn only from the provided data.'),
  opportunities: z.array(z.string()).describe('Opportunities drawn only from the provided data.'),
  knowledgeGaps: z.array(z.string()).describe('Open questions or gaps the investigation has not yet resolved. Return an empty array if none are evident.'),
  sourceTrail: z.array(z.string()).describe('The distinct source/entity names the findings above are traceable to, drawn only from the provided sources list.'),
});

// POST /api/investigations/[id]/report — synthesize a Knowledge Report from
// the investigation's already-real accumulated query data via the AI SDK +
// Vercel AI Gateway. Never invents entities, sources, or facts. On failure,
// the investigation row is left untouched.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investigationId = parseInt(id, 10);
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

    const { aggregated, queries } = investigation;

    const findings = Array.from(
      new Set(
        queries.flatMap((q) =>
          q.result.findingsCited?.length ? q.result.findingsCited.map((f) => f.text) : q.result.findings ?? []
        )
      )
    );
    const risks = Array.from(
      new Set(
        queries.flatMap((q) =>
          q.result.risksCited?.length ? q.result.risksCited.map((r) => r.text) : q.result.riskFactors ?? []
        )
      )
    );
    const opportunities = Array.from(
      new Set(
        queries.flatMap((q) =>
          q.result.opportunitiesCited?.length
            ? q.result.opportunitiesCited.map((o) => o.title ?? o.justification ?? '').filter(Boolean)
            : q.result.opportunities ?? []
        )
      )
    );

    const dataPayload = {
      rootQuestion: investigation.rootQuestion,
      queriesAsked: queries.map((q) => q.question),
      entities: aggregated.entities.map((e) => ({ name: e.entity_name, type: e.entity_type, country: e.country, summary: e.summary })),
      relationships: aggregated.relationships.map((r) => ({ from: r.from, to: r.to, label: r.label })),
      sources: aggregated.sources,
      findings,
      risks,
      opportunities,
    };

    let output: z.infer<typeof reportSchema>;
    try {
      const result = await generateText({
        model: REPORT_MODEL,
        output: Output.object({ schema: reportSchema }),
        system:
          'You are an intelligence analyst synthesizing a knowledge report from an already-completed ' +
          'investigation. You must ONLY organize, summarize, and cross-reference the data provided below. ' +
          'Never invent entities, sources, findings, risks, or opportunities that are not present in the ' +
          'provided data. Every entity or source name you reference must come from the provided entities ' +
          'or sources lists verbatim. If there is not enough data to support a section, keep it brief or ' +
          'return an empty array rather than fabricating content.',
        prompt: `Investigation root question: ${dataPayload.rootQuestion}\n\nAccumulated data (JSON):\n${JSON.stringify(dataPayload, null, 2)}`,
      });
      output = result.output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return NextResponse.json({ error: 'The report model did not return a valid report. Please retry.' }, { status: 502 });
      }
      throw err;
    }

    const generatedAt = new Date().toISOString();
    const reportJson = { ...output, generatedAt };

    await sql`
      UPDATE investigations
      SET report_json = ${JSON.stringify(reportJson)}::jsonb, report_generated_at = ${generatedAt}, updated_at = now()
      WHERE id = ${investigationId}
    `;

    return NextResponse.json({ status: 'ok', data: reportJson });
  } catch (err) {
    console.error('[investigations/[id]/report POST]', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
