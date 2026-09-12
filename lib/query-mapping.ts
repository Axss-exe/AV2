/**
 * Shared mapping from the backend /api/query response shape to the
 * frontend QueryResult type. Used by both the standalone Query page
 * and the Investigation workspace so every consumer of a query result
 * gets identically-shaped data.
 */
import type { queryAPI } from './api';
import type { QueryResult, IntelTableRow, GraphNode, GraphEdge, KeyEntity } from './types';

// Map backend API response to the existing QueryResult type.
// The backend returns { status, elapsed_seconds, data: { ... } } — the
// queryAPI() function in lib/api.ts already unwraps this so `res` is the
// flat `data` object here.
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
      entity:       row.entity ?? 'Unknown',
      relationship: row.relationship ?? row.type ?? '',
      priority:     row.priority ?? '—',
      status,
      insight:      row.insight ?? '',
      source_node:  row.source_node ?? '',
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
    ? res.opportunities_cited.map((o) => ({ ...o, source_nodes: Array.isArray(o.source_nodes) ? o.source_nodes : [] }))
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
    findings:     Array.isArray(res.findings)     ? res.findings     : [],
    opportunities: Array.isArray(res.opportunities) ? res.opportunities : [],
    riskFactors:  Array.isArray(res.risks)        ? res.risks        : [],
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
    backendData: res as unknown as Record<string, unknown>,
    analysisVersion: res.analysis_version,
    schemaVersion: res.schema_version,
    analysisFingerprint: res.analysis_fingerprint,
    knowledgeState: res.knowledge_state,
    cacheKey: res.cache_key,
    sourceNodes: res.source_nodes,
    perspectiveNodes: res.perspective_nodes,
    crossBorderBridges: res.cross_border_bridges,
    filesWritten: res.files_written,
  };
}
