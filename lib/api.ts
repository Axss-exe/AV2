/**
 * Centralized API client for ATIS backend.
 * All requests go through this module so base URL is never scattered.
 */

import type { PerspectiveContext } from './perspective';
import type { QueryResult } from './types';
import type { Investigation, InvestigationSummary, InvestigationReport } from './investigation-types';

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
  status?: string;
  success?: boolean;
  error?: string;
  detail?: string;
  message?: string;
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
  success?: boolean;
  error?: string;
  detail?: string;
  message?: string;
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
  backendError?: string;
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
  const envelopeError = typeof json.error === 'string'
    ? json.error
    : typeof json.detail === 'string'
      ? json.detail
      : typeof json.message === 'string'
        ? json.message
        : undefined;
  if (json.data && typeof json.data === 'object') {
    return {
      ...json.data,
      status: json.status,
      success: json.success,
      backendError: envelopeError,
      cached: json.cached,
      elapsed_seconds: json.elapsed_seconds,
    };
  }
  return { ...(json as QueryAPIResult), backendError: envelopeError };
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
  intelligence_id?: string;
  executive_summary?: string;
  trigger_event?: string;
  market_equilibrium_shift?: string;
  source_country?: string;
  event_country?: string;
  key_entities?: Array<{ name?: string; type?: string; country?: string; role?: string }>;
  structured_intelligence?: Array<{ claim?: string; evidence?: string; source_node?: string; impact?: string }>;
  findings?: CitedStatement[];
  risks?: CitedStatement[];
  opportunities?: OpportunityCited[];
  source_nodes?: SourceNode[];
  perspective_nodes?: unknown[];
  cross_border_bridges?: Array<{ from_node?: string; to_node?: string; relationship_type?: string }>;
  perspective?: PerspectiveContext;
  pipeline_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface NewsJobSubmission {
  status?: string;
  job_id: string;
  analysis_version?: string;
  schema_version?: string;
  [key: string]: unknown;
}

export interface NewsJobStatus {
  status?: string;
  job_id?: string;
  stage?: string;
  current_stage?: string;
  completed_stages?: string[];
  progress?: number;
  position_in_queue?: number;
  estimated_time_remaining?: number;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export async function processNewsArticle(body: NewsRequest): Promise<NewsJobSubmission | NewsAPIResponse> {
  // The News pipeline is intentionally long-running. Do not abort the submit
  // request based on elapsed time; only the backend may report failure.
  const res = await fetch(`${API_BASE}/api/news`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return parseJSON<NewsJobSubmission | NewsAPIResponse>(res);
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
  roadmap?: string;
  reasoning_graph?: unknown;
  lineage_traces?: LineageTrace[];
  [key: string]: unknown;
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
  return parseJSON<ExecuteAPIResponse>(res);
}

// ---------------------------------------------------------------------------
// GET /api/history  (if the endpoint exists)
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
  const res = await fetchWithTimeout(`${API_BASE}/api/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<HistoryItem[]>(res);
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
  result: QueryResult;
  perspectiveCountry?: string;
  perspectiveCountryCode?: string;
}): Promise<{ id: number }> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<{ status: string; id: number }>(res);
  return { id: json.id };
}

export async function fetchInvestigations(): Promise<InvestigationSummary[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJSON<{ status: string; data: InvestigationSummary[] }>(res);
  return json.data;
}

export async function fetchInvestigation(id: number): Promise<Investigation> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJSON<{ status: string; data: Investigation }>(res);
  return json.data;
}

export async function addInvestigationQuery(
  id: number,
  body: { question: string; result: QueryResult }
): Promise<Investigation> {
  const res = await fetchWithTimeout(`${API_BASE}/api/investigations/${id}/queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<{ status: string; data: Investigation }>(res);
  return json.data;
}

export async function generateInvestigationReport(id: number): Promise<InvestigationReport> {
  const res = await fetchWithTimeout(
    `${API_BASE}/api/investigations/${id}/report`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    120_000
  );
  return parseJSON<InvestigationReport>(res);
}
