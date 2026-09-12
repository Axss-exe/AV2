/**
 * Centralized API client for ATIS backend.
 * All requests go through this module so base URL is never scattered.
 */

import type { PerspectiveContext } from './perspective';
import type { QueryResult } from './types';
import type { Investigation, InvestigationSummary, InvestigationReport, AggregatedKnowledge } from './investigation-types';
import { mapAPIResponseToQueryResult } from './query-mapping';
import { computeAggregated } from './investigation-aggregation';

// Client-side requests go through the Next.js proxy routes (/api/*)
// to avoid CORS issues. The proxy routes (lib/proxy.ts) forward to
// the real backend server-side.
const API_BASE = '';

const DEFAULT_TIMEOUT_MS = 120_000; // 2 minutes — Render cold-start can be slow

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isTimeout?: boolean
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new APIError(
        'The intelligence pipeline is taking longer than expected. Please retry or reduce the scope of the request.',
        undefined,
        true
      );
    }
    throw new APIError(
      err instanceof Error
        ? `Network error: ${err.message}`
        : 'An unexpected network error occurred.'
    );
  } finally {
    clearTimeout(id);
  }
}

async function parseJSON<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) message = body.detail;
      else if (body?.message) message = body.message;
      else if (typeof body === 'string') message = body;
    } catch {
      // ignore parse errors on error bodies
    }
    throw new APIError(message, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new APIError('Server returned malformed JSON. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// POST /api/query
// ---------------------------------------------------------------------------

export interface QueryRequest {
  question?: string;
  // Analytical perspective context (added, does not change the question)
  perspective_country?: string;
  perspective_country_code?: string;
}

export interface KeyEntity {
  entity_name?: string;
  entity_type?: string;
  country?: string;
  sector?: string;
  significance_score?: number;
  related_count?: number;
  summary?: string;
  source_node?: string;
}

export interface QueryStats {
  total_entities?: number;
  total_relationships?: number;
  commodities_tracked?: number;
  countries_covered?: number;
  // legacy fallback fields
  traces?: number;
  nodes?: number;
  concepts?: number;
  entities?: number;
  validated?: string | number;
}

/** A finding or risk string with the entity ids that support it. */
export interface CitedStatement {
  text?: string;
  source_nodes?: string[];
}

/** Real structured opportunity object (do NOT use the legacy `opportunities: string[]`
 *  field — those are stringified Python dicts, a backend bug). */
export interface OpportunityCited {
  opportunity_id?: string;
  title?: string;
  type?: string;
  perspective_country?: string;
  perspective_country_code?: string;
  source_country?: string;
  event_country?: string;
  opportunity_country?: string;
  cross_border?: boolean;
  cross_border_countries?: string[];
  perspective_actor?: string;
  perspective_capability?: string;
  pathway?: string;
  urgency_score?: number;
  feasibility_score?: number;
  required_missing_nodes?: string[];
  capital_flow?: {
    beneficiary?: string;
    likely_funder?: string;
  };
  justification?: string;
  source_nodes?: string[];
  status?: string;
}

export interface SourceNode {
  id?: string;
  type?: string;
}

/** Backend's own query classification — authoritative signal for query type. */
export interface QueryIntent {
  type?: string;
  entities?: string[];
  entity_types?: string[];
  countries?: string[];
  sectors?: string[];
  perspective_country?: string;
  perspective_country_code?: string;
}

/** How much of the vault was searched to produce this response. */
export interface FilterStats {
  vault_total?: number;
  candidates_after_broad_filter?: number;
  ranked_by_llm?: number;
}

export interface QueryAPIResponse {
  executive_summary?: string;
  summary?: string;
  structured_intelligence?: IntelligenceRow[];
  findings?: string[];
  opportunities?: string[];
  risks?: string[];
  key_entities?: KeyEntity[];
  stats?: QueryStats;
  // legacy field name fallback
  statistics?: Record<string, string | number>;
  entity_graph?: EntityGraphData;
  // Perspective echoed back by the backend (optional — backward compatible)
  perspective?: PerspectiveContext;
  // Real cited/structured fields (additive — see audit notes in the plan)
  findings_cited?: CitedStatement[];
  opportunities_cited?: OpportunityCited[];
  risks_cited?: CitedStatement[];
  source_nodes?: SourceNode[];
  intent?: QueryIntent;
  filter_stats?: FilterStats;
  analysis_version?: string;
  schema_version?: string;
  analysis_fingerprint?: string;
  knowledge_state?: unknown;
  cache_hit?: boolean;
  cache_key?: string;
  files_written?: Record<string, unknown>;
  perspective_nodes?: SourceNode[];
  cross_border_bridges?: unknown[];
}

export interface IntelligenceRow {
  // Real backend fields
  entity?: string;
  type?: string;
  country?: string;
  relationship?: string;
  status?: string;
  priority?: string;
  insight?: string;
  source_node?: string;
  // Legacy fallback fields (keep for graceful degradation)
  source?: string;
  confidence?: string;
  last_updated?: string;
}

export interface EntityGraphData {
  viewBox?: string;
  height?: number;
  nodes?: EntityGraphNode[];
  edges?: EntityGraphEdge[];
}

export interface EntityGraphNode {
  id?: string;
  label?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

export interface EntityGraphEdge {
  from?: string;
  to?: string;
  label?: string;
  source?: string;
  target?: string;
}

interface QueryEnvelope {
  // Wrapped shape: { status, elapsed_seconds, data: { ... } }
  status?: string;
  cached?: boolean;
  elapsed_seconds?: number;
  data?: QueryAPIResponse;
  // Flat shape fallback (no envelope)
  executive_summary?: string;
  summary?: string;
  structured_intelligence?: IntelligenceRow[];
  findings?: string[];
  opportunities?: string[];
  risks?: string[];
  key_entities?: KeyEntity[];
  stats?: QueryStats;
  statistics?: Record<string, string | number>;
  entity_graph?: EntityGraphData;
}

/** Same fields as QueryAPIResponse, plus the envelope-level metadata that
 *  queryAPI() used to discard (cached / elapsed_seconds). Additive: every
 *  existing consumer that destructures the QueryAPIResponse fields still
 *  works, since this type extends it. */
export interface QueryAPIResult extends QueryAPIResponse {
  cached?: boolean;
  elapsed_seconds?: number;
}

export async function queryAPI(body: QueryRequest): Promise<QueryAPIResult> {
  const res = await fetchWithTimeout(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<QueryEnvelope>(res);
  // Unwrap { status, data: {...} } envelope if present, but keep the
  // envelope-level cached/elapsed_seconds metadata alongside it.
  if (json.data && typeof json.data === 'object') {
    return { ...json.data, cached: json.cached, elapsed_seconds: json.elapsed_seconds };
  }
  return json as QueryAPIResult;
}

// ---------------------------------------------------------------------------
// POST /api/news
// ---------------------------------------------------------------------------

export interface NewsRequest {
  article_text: string;
  // Analytical perspective context (augments the article payload)
  perspective_country?: string;
  perspective_country_code?: string;
}

export interface NewsOpportunity {
  id?: string;
  title?: string;
  description?: string;
  urgency?: string;
  feasibility?: string;
  sector?: string;
  markets?: string[];
  [key: string]: unknown;
}

export interface NewsAPIResponse {
  core_event?: string;
  trigger_event?: string;
  market_equilibrium_shift?: string;
  opportunities?: NewsOpportunity[];
  urgency?: string;
  feasibility?: string;
  [key: string]: unknown;
}

export interface NewsSubmissionResponse {
  status: 'accepted';
  job_id: string;
  execution_model: string;
  resume_available: boolean;
  analysis_version?: string;
  schema_version?: string;
}

export async function processNewsArticle(body: NewsRequest): Promise<NewsSubmissionResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJSON<NewsSubmissionResponse>(res);
}

// ---------------------------------------------------------------------------
// GET /api/news/status/{job_id}
// Returns the durable job status inside response.data.
// ---------------------------------------------------------------------------

export interface JobStatus {
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  job_id: string;
  attempts?: number;
  created_at?: number;
  updated_at?: number;
  completed_at?: number | null;
  error?: string | null;
  worker_id?: string | null;
  lease_until?: number | null;
  checkpoint?: {
    status?: 'IN_PROGRESS' | 'PARTIAL' | 'COMPLETED';
    current_stage?: string;
    completed_stages?: string[];
    updated_at?: number;
    error_count?: number;
    resume_available?: boolean;
  };
}

export interface NewsStatusResponse {
  status: 'success';
  analysis_version?: string;
  schema_version?: string;
  data: JobStatus;
}

export async function getNewsJobStatus(jobId: string): Promise<NewsStatusResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/news/status/${jobId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<NewsStatusResponse>(res);
}

// ---------------------------------------------------------------------------
// GET /api/news/result/{job_id}
// Returns the final intelligence result after job completion
// ---------------------------------------------------------------------------

export interface NewsResult {
  status: 'success';
  analysis_version?: string;
  schema_version?: string;
  data: NewsAPIResponse;
}

export async function getNewsJobResult(jobId: string): Promise<NewsResult> {
  const res = await fetchWithTimeout(`${API_BASE}/api/news/result/${jobId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<NewsResult>(res);
}

// ---------------------------------------------------------------------------
// POST /api/execute
// ---------------------------------------------------------------------------

export interface ExecuteRequest {
  dashboard_json: Record<string, unknown>;
  opportunity_id: string;
  // Request-level perspective. Does NOT overwrite any perspective already
  // present inside dashboard_json (the backend opportunity is authoritative).
  perspective_country?: string;
  perspective_country_code?: string;
}

export interface ExecuteAPIResponse {
  opportunity_id: string;
  stable_opportunity_id?: string;
  status: 'EXECUTED' | 'EXECUTION_BLOCKED' | string;
  validation_message?: string;
  final_roadmap?: string;
  ui_thinking_graph?: string;
  compiled_lineage_traces?: LineageTrace[];
  perspective?: PerspectiveContext;
  files_written?: Record<string, unknown>;
  analysis_version?: string;
  schema_version?: string;
  analysis_fingerprint?: string;
  knowledge_state?: unknown;
  [key: string]: unknown;
}

export interface ExecuteResponse {
  status: 'success' | 'busy' | 'error' | string;
  elapsed_seconds?: number;
  analysis_version?: string;
  schema_version?: string;
  data: ExecuteAPIResponse;
  detail?: string;
}

export interface LineageTrace {
  id?: string;
  step?: string;
  source?: string;
  reasoning?: string;
  confidence?: string;
  [key: string]: unknown;
}

export async function executeOpportunity(body: ExecuteRequest): Promise<ExecuteAPIResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<ExecuteResponse>(res);
  if (json.status !== 'success' || !json.data) {
    throw new APIError(json.detail ?? `Execution request returned ${json.status}`);
  }
  return json.data;
}

// ---------------------------------------------------------------------------
// History is AV2-local. ATISv2 does not expose /api/history.
// ---------------------------------------------------------------------------

export interface HistoryItem {
  id: string;
  query: string;
  summary: string;
  stats?: Record<string, string | number>;
  created_at: string;
  output?: unknown;
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  return [];
}

// ---------------------------------------------------------------------------
// GET /api/entities
// Returns: { status, count, directory, entities: [...] }
// ---------------------------------------------------------------------------

export interface EntityListItem {
  id: string;
  /** URL-safe identifier — ALWAYS use this for routing (id may contain spaces). */
  slug: string;
  name: string;
  filename: string;
  path: string;
  content?: string;
  size_bytes?: number;
  entity_type?: string;
}

export interface EntitiesListResponse {
  status: string;
  count: number;
  /** Legacy single-directory field (kept for backward compat) */
  directory?: string;
  /** Real backend returns the list of vault directories */
  directories?: string[];
  entities: EntityListItem[];
}

export async function fetchEntities(): Promise<EntityListItem[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/entities`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJSON<EntitiesListResponse | EntityListItem[]>(res);
  // Handle both { entities: [...] } and raw array shapes
  if (Array.isArray(json)) return json;
  return Array.isArray((json as EntitiesListResponse).entities)
    ? (json as EntitiesListResponse).entities
    : [];
}

// ---------------------------------------------------------------------------
// GET /api/entity/{slug}
// Returns full profile + related entities graph
// ---------------------------------------------------------------------------

export interface RelatedEntity {
  slug: string;
  name: string;
  entity_type: string;
  relation_type: 'outbound' | 'backlink';
  summary: string;
}

export interface EntityProfile {
  id: string;
  slug: string;
  name: string;
  filename: string;
  path: string;
  content: string;
  size_bytes?: number;
  front_matter: Record<string, unknown>;
  summary: string;
  entity_type?: string;
  outbound_links: string[];
  backlink_uids: string[];
  related_entities: RelatedEntity[];
}

/**
 * Fetch an entity profile by slug. The slug is already URL-safe, so we pass it
 * directly WITHOUT encodeURIComponent — the proxy route forwards it as-is to
 * avoid double-encoding.
 */
export async function fetchEntityProfile(slug: string): Promise<EntityProfile> {
  const res = await fetchWithTimeout(`${API_BASE}/api/entity/${slug}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<EntityProfile>(res);
}

// ---------------------------------------------------------------------------
// GET /api/search?q={query}
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  slug: string;
  name: string;
  entity_type: string;
  summary: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
}

export async function searchEntitiesAPI(query: string): Promise<SearchResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/search?q=${encodeURIComponent(query)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    30_000
  );
  return parseJSON<SearchResponse>(res);
}

// Keep legacy type alias so existing components don't break immediately
export interface EntityAPIItem {
  id: string;
  name: string;
  type: string;
  country: string;
  description?: string;
  metadata?: Record<string, unknown>;
  relationships?: { entity: string; type: string }[];
  summary?: string;
  connected_entities?: string[];
}

// ---------------------------------------------------------------------------
// Investigations — Next.js/Neon-backed (no matching backend endpoint exists;
// each query within an investigation still goes through the real /api/query
// pipeline via queryAPI() + mapAPIResponseToQueryResult()).
// ---------------------------------------------------------------------------

export async function createInvestigation(body: {
  question: string;
  perspective_country?: string;
  perspective_country_code?: string;
}): Promise<Investigation> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<{ status: string; investigation: NativeInvestigation }>(res);
  return normalizeInvestigation(json.investigation);
}

export async function fetchInvestigations(): Promise<InvestigationSummary[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJSON<{ status: string; count: number; investigations: NativeInvestigationSummary[] }>(res);
  return json.investigations;
}

export async function fetchInvestigation(id: string): Promise<Investigation> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJSON<{ status: string; investigation: NativeInvestigation }>(res);
  return normalizeInvestigation(json.investigation);
}

export async function addInvestigationQuery(
  id: string,
  body: { question: string; parent_query_id?: string }
): Promise<Investigation> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations/${id}/queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<{ status: string; investigation: NativeInvestigation }>(res);
  return normalizeInvestigation(json.investigation);
}

export async function generateInvestigationReport(id: string): Promise<InvestigationReport> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/investigations/${id}/report`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    120_000
  );
  const json = await parseJSON<{ status: string; report: InvestigationReport }>(res);
  return json.report;
}

interface NativeInvestigationSummary {
  investigation_id: string;
  title: string;
  status: string;
  query_count: number;
  created_at: string;
  updated_at: string;
}

interface NativeInvestigation {
  investigation_id: string;
  title: string;
  status: string;
  root_question: string;
  original_question?: string;
  perspective?: { country?: string; country_code?: string };
  queries: Array<{
    query_id: string;
    sequence: number;
    parent_query_id?: string | null;
    question: string;
    result: QueryAPIResponse;
    created_at: string;
  }>;
  aggregated_context?: Record<string, unknown>;
  report?: InvestigationReport | null;
  created_at: string;
  updated_at: string;
}

function normalizeInvestigation(native: NativeInvestigation): Investigation {
  const aggregated = computeAggregated(native.queries.map((q) => mapAPIResponseToQueryResult(q.question, q.result as QueryAPIResult)));
  return {
    investigation_id: native.investigation_id,
    title: native.title,
    status: native.status,
    root_question: native.root_question,
    original_question: native.original_question ?? native.root_question,
    perspective: native.perspective,
    queries: native.queries.map((query) => ({
      query_id: query.query_id,
      sequence: query.sequence,
      parent_query_id: query.parent_query_id ?? null,
      question: query.question,
      result: mapAPIResponseToQueryResult(query.question, query.result as QueryAPIResult),
      created_at: query.created_at,
    })),
    aggregated_context: aggregated,
    report: native.report ?? null,
    created_at: native.created_at,
    updated_at: native.updated_at,
  };
}
