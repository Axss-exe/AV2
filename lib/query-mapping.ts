/**
 * Shared mapping from the backend /api/query response shape to the
 * frontend QueryResult type. Used by both the standalone Query page
 * and the Investigation workspace so every consumer of a query result
 * gets identically-shaped data.
 */
import type { queryAPI } from './api';
import type { QueryResult, IntelTableRow, GraphNode, GraphEdge, KeyEntity } from './types';

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [item];
    if (item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string') {
      return [(item as { text: string }).text];
    }
    return [];
  });
}

export function hasQueryIntelligence(res: Awaited<ReturnType<typeof queryAPI>>): boolean {
  return Boolean(res.executive_summary ?? res.summary)
    || (res.structured_intelligence?.length ?? 0) > 0
    || (res.findings?.length ?? 0) > 0
    || (res.findings_cited?.length ?? 0) > 0
    || (res.opportunities_cited?.length ?? 0) > 0
    || (res.risks?.length ?? 0) > 0
    || (res.risks_cited?.length ?? 0) > 0
    || (res.key_entities?.length ?? 0) > 0
    || (res.source_nodes?.length ?? 0) > 0;
}

// Map the already-unwrapped backend response into one safe QueryResult shape.
export function mapAPIResponseToQueryResult(query: string, res: Awaited<ReturnType<typeof queryAPI>>): QueryResult {
  // Derive stats from res.stats (real) or res.statistics (legacy fallback)
  const s = res.stats ?? {};
  const leg = res.statistics ?? {};
  const stats = {
    traces:    typeof s.traces === 'number'    ? s.traces    : typeof leg.traces === 'number'    ? leg.traces    : 0,
    nodes:     typeof s.total_entities === 'number' ? s.total_entities : typeof leg.nodes === 'number' ? leg.nodes : 0,
    concepts:  typeof s.commodities_tracked === 'number' ? s.commodities_tracked : typeof leg.concepts === 'number' ? leg.concepts : 0,
    entities:  typeof s.total_entities === 'number' ? s.total_entities : typeof leg.entities === 'number' ? leg.entities : 0,
    validated: typeof s.validated === 'string'   ? s.validated
             : typeof s.validated === 'number'   ? `${s.validated}%`
             : typeof leg.validated === 'string' ? leg.validated
             : typeof leg.validated === 'number' ? `${leg.validated}%`
             : '—',
  };

  // Map structured intelligence rows (real fields: entity, type, relationship, status, priority, insight, source_node)
  const intelRows = Array.isArray(res.structured_intelligence) ? res.structured_intelligence : [];
  const tableRows: IntelTableRow[] = intelRows.map((row) => {
    // Normalise status: backend sends e.g. "Operational", map to badge values
    const rawStatus = row.status ?? '';
    const status: IntelTableRow['status'] =
      rawStatus === 'Validated' ? 'Validated'
      : rawStatus === 'Gap' ? 'Gap'
      : 'External';
    return {
      source:       row.entity ?? row.source ?? 'Unknown',
      relationship: row.relationship ?? row.type ?? '',
      confidence:   row.priority ?? row.confidence ?? '—',
      status,
      last_updated: row.insight ?? row.last_updated ?? row.source_node ?? '',
    };
  });

  // Map entity graph nodes — use x/y from backend if provided, otherwise distribute
  const graphNodeData = Array.isArray(res.entity_graph?.nodes) ? res.entity_graph!.nodes : [];
  const FALLBACK_X = [280, 50, 520, 50, 520, 280, 160, 420];
  const FALLBACK_Y = [114, 50, 50, 180, 180, 10,  230, 230];
  const graphNodes: GraphNode[] = graphNodeData.map((n, i) => ({
    id:    n.id    ?? `n${i}`,
    label: n.label ?? n.id ?? `Node ${i}`,
    type:  (['hub', 'entity', 'risk', 'partner'].includes(n.type ?? '') ? n.type : 'entity') as GraphNode['type'],
    x:     typeof n.x === 'number' ? n.x : FALLBACK_X[i % FALLBACK_X.length],
    y:     typeof n.y === 'number' ? n.y : FALLBACK_Y[i % FALLBACK_Y.length],
  }));

  // Map entity graph edges
  const graphEdgeData = Array.isArray(res.entity_graph?.edges) ? res.entity_graph!.edges : [];
  const graphEdges: GraphEdge[] = graphEdgeData.map((e) => ({
    from:  e.from ?? e.source ?? '',
    to:    e.to   ?? e.target ?? '',
    label: e.label ?? '',
  }));

  // Map key_entities (new field in real response)
  const keyEntities: KeyEntity[] = Array.isArray(res.key_entities)
    ? res.key_entities.map((ke) => ({
        entity_name:       ke.entity_name ?? 'Unknown',
        entity_type:       ke.entity_type,
        country:           ke.country,
        sector:            ke.sector,
        significance_score: ke.significance_score,
        related_count:     ke.related_count,
        summary:           ke.summary,
        source_node:       ke.source_node,
      }))
    : [];

  // Real cited fields — see lib/intelligence-view-model.ts for how these are
  // consumed. Additive; camelCase mirrors the rest of QueryResult.
  const findingsCited = Array.isArray(res.findings_cited)
    ? res.findings_cited
        .filter((f) => typeof f.text === 'string')
        .map((f) => ({ text: f.text as string, sourceNodes: Array.isArray(f.source_nodes) ? f.source_nodes : [] }))
    : undefined;

  const risksCited = Array.isArray(res.risks_cited)
    ? res.risks_cited
        .filter((r) => typeof r.text === 'string')
        .map((r) => ({ text: r.text as string, sourceNodes: Array.isArray(r.source_nodes) ? r.source_nodes : [] }))
    : undefined;

  const opportunitiesCited = Array.isArray(res.opportunities_cited)
    ? res.opportunities_cited.map((o) => ({
        opportunityId: o.opportunity_id,
        title: o.title,
        type: o.type,
        perspectiveCountry: o.perspective_country,
        perspectiveCountryCode: o.perspective_country_code,
        sourceCountry: o.source_country,
        eventCountry: o.event_country,
        opportunityCountry: o.opportunity_country,
        crossBorder: o.cross_border,
        crossBorderCountries: o.cross_border_countries,
        perspectiveActor: o.perspective_actor,
        perspectiveCapability: o.perspective_capability,
        pathway: o.pathway,
        urgencyScore: o.urgency_score,
        feasibilityScore: o.feasibility_score,
        requiredMissingNodes: o.required_missing_nodes,
        capitalFlow: o.capital_flow
          ? { beneficiary: o.capital_flow.beneficiary, likelyFunder: o.capital_flow.likely_funder }
          : undefined,
        justification: o.justification,
        sourceNodes: Array.isArray(o.source_nodes) ? o.source_nodes : [],
        status: o.status,
      }))
    : undefined;

  const intent = res.intent
    ? {
        type: res.intent.type,
        entities: res.intent.entities ?? [],
        entityTypes: res.intent.entity_types ?? [],
        countries: res.intent.countries ?? [],
        sectors: res.intent.sectors ?? [],
        perspectiveCountry: res.intent.perspective_country,
        perspectiveCountryCode: res.intent.perspective_country_code,
      }
    : undefined;

  const filterStats = res.filter_stats
    ? {
        vaultTotal: res.filter_stats.vault_total,
        candidatesAfterBroadFilter: res.filter_stats.candidates_after_broad_filter,
        rankedByLlm: res.filter_stats.ranked_by_llm,
      }
    : undefined;

  return {
    query,
    summary:      res.executive_summary ?? res.summary ?? 'Intelligence analysis complete.',
    stats,
    graphNodes,
    graphEdges,
    tableRows,
    findings:     normalizeTextArray(res.findings),
    opportunities: normalizeTextArray(res.opportunities),
    riskFactors:  normalizeTextArray(res.risks),
    keyEntities,
    findingsCited,
    opportunitiesCited,
    risksCited,
    perspective: res.perspective ? { country: res.perspective.country, countryCode: res.perspective.country_code } : undefined,
    intent,
    filterStats,
    cached: res.cached,
    elapsedSeconds: res.elapsed_seconds,
    entityGraphRaw: res.entity_graph,
  };
}
