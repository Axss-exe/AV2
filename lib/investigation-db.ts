/**
 * Server-only helpers shared by the `/api/investigations*` route handlers:
 * the Neon client, row → API-shape mappers, and the aggregation logic that
 * merges real accumulated query results into deduped `AggregatedKnowledge`.
 * Mirrors the existing `roadmaps`/`saved_opportunities` pattern.
 */
import { neon } from '@neondatabase/serverless';
import type { QueryResult, KeyEntity, GraphEdge } from './types';
import type { AggregatedKnowledge, Investigation, InvestigationQuery, InvestigationReport } from './investigation-types';

export const sql = neon(process.env.DATABASE_URL!);

export interface InvestigationRow {
  id: number;
  title: string;
  root_question: string;
  status: string;
  perspective_country: string | null;
  perspective_country_code: string | null;
  report_json: InvestigationReport | null;
  report_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestigationQueryRow {
  id: number;
  investigation_id: number;
  sequence: number;
  question: string;
  result_json: QueryResult;
  created_at: string;
}

export function mapQueryRow(row: InvestigationQueryRow): InvestigationQuery {
  return {
    query_id: String(row.id),
    sequence: row.sequence,
    parent_query_id: null,
    question: row.question,
    result: row.result_json,
    created_at: row.created_at,
  };
}

/**
 * Merge the already-real accumulated QueryResults from every query in an
 * investigation into deduped entities/relationships/sources. Never invents
 * data — only reorganizes what the backend already returned.
 */
export function computeAggregated(results: QueryResult[]): AggregatedKnowledge {
  const entityByName = new Map<string, KeyEntity>();
  const relationshipByKey = new Map<string, GraphEdge>();
  const sourceNames = new Set<string>();
  const findingTexts = new Set<string>();

  for (const result of results) {
    for (const entity of result.keyEntities ?? []) {
      if (!entityByName.has(entity.entity_name)) {
        entityByName.set(entity.entity_name, entity);
      }
    }
    for (const edge of result.graphEdges ?? []) {
      const key = `${edge.from}|${edge.to}|${edge.label}`;
      if (!relationshipByKey.has(key)) {
        relationshipByKey.set(key, edge);
      }
    }
    for (const row of result.tableRows ?? []) {
      if (row.entity) sourceNames.add(row.entity);
    }
    if (result.findingsCited && result.findingsCited.length > 0) {
      for (const f of result.findingsCited) findingTexts.add(f.text);
    } else {
      for (const f of result.findings ?? []) findingTexts.add(f);
    }
  }

  const entities = Array.from(entityByName.values());
  const relationships = Array.from(relationshipByKey.values());
  const sources = Array.from(sourceNames);

  return {
    entities,
    relationships,
    sources,
    findingsCount: findingTexts.size,
    entitiesCount: entities.length,
    relationshipsCount: relationships.length,
    sourcesCount: sources.length,
  };
}

/** Derive a readable title from the root question when no explicit title was given. */
export function deriveTitle(rootQuestion: string): string {
  const trimmed = rootQuestion.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 77)}...`;
}

/** Full investigation detail: metadata + ordered queries[] + computed aggregated knowledge + report. */
export async function getInvestigationDetail(investigationId: number): Promise<Investigation | null> {
  const [investigation] = (await sql`
    SELECT * FROM investigations WHERE id = ${investigationId}
  `) as unknown as InvestigationRow[];

  if (!investigation) return null;

  const queryRows = (await sql`
    SELECT * FROM investigation_queries WHERE investigation_id = ${investigationId} ORDER BY sequence ASC
  `) as unknown as InvestigationQueryRow[];

  const queries = queryRows.map(mapQueryRow);
  const aggregated = computeAggregated(queries.map((q) => q.result));

  return {
    investigation_id: String(investigation.id),
    title: investigation.title,
    status: investigation.status,
    root_question: investigation.root_question,
    original_question: investigation.root_question,
    perspective: investigation.perspective_country ? { country: investigation.perspective_country, country_code: investigation.perspective_country_code ?? undefined } : undefined,
    queries,
    aggregated_context: aggregated,
    report: investigation.report_json ?? null,
    created_at: investigation.created_at,
    updated_at: investigation.updated_at,
  };
}
