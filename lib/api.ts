/**
 * Centralized API client for ATIS backend.
 * All requests go through this module so base URL is never scattered.
 */

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
}

export interface QueryAPIResponse {
  executive_summary?: string;
  summary?: string;
  structured_intelligence?: IntelligenceRow[];
  findings?: string[];
  opportunities?: string[];
  risks?: string[];
  statistics?: Record<string, string | number>;
  entity_graph?: EntityGraphData;
}

export interface IntelligenceRow {
  source: string;
  relationship: string;
  confidence: string;
  status: 'Validated' | 'Gap' | 'External';
  last_updated: string;
}

export interface EntityGraphData {
  nodes?: { id: string; label: string; type: string }[];
  edges?: { from: string; to: string; label?: string }[];
}

interface QueryEnvelope {
  status?: string;
  cached?: boolean;
  elapsed_seconds?: number;
  data?: QueryAPIResponse;
  // Also support flat shape (no envelope)
  executive_summary?: string;
  summary?: string;
  structured_intelligence?: IntelligenceRow[];
  findings?: string[];
  opportunities?: string[];
  risks?: string[];
  statistics?: Record<string, string | number>;
  entity_graph?: EntityGraphData;
}

export async function queryAPI(body: QueryRequest): Promise<QueryAPIResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJSON<QueryEnvelope>(res);
  // Unwrap { status, data: {...} } envelope if present
  if (json.data && typeof json.data === 'object') return json.data;
  return json as QueryAPIResponse;
}

// ---------------------------------------------------------------------------
// POST /api/news
// ---------------------------------------------------------------------------

export interface NewsRequest {
  article_text: string;
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

export async function processNewsArticle(body: NewsRequest): Promise<NewsAPIResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJSON<NewsAPIResponse>(res);
}

// ---------------------------------------------------------------------------
// POST /api/execute
// ---------------------------------------------------------------------------

export interface ExecuteRequest {
  dashboard_json: Record<string, unknown>;
  opportunity_id: string;
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
  name: string;
  filename: string;
  path: string;
}

export interface EntitiesListResponse {
  status: string;
  count: number;
  directory: string;
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
// GET /api/entity/{id}
// Returns parsed frontmatter + body sections
// ---------------------------------------------------------------------------

export interface EntityFrontmatter {
  entity?: string;
  entity_type?: string;
  sector?: string;
  ownership_type?: string;
  located_in?: string[];
  owned_by?: string[];
  regulated_by?: string[];
  licenses_from?: string[];
  government_entities?: string[];
  relevant_laws?: string[];
  stakeholders?: string[];
  active_projects?: string[];
  decision_makers?: string[];
  key_contacts?: string[];
  [key: string]: unknown;
}

export interface EntityBodySections {
  summary?: string;
  core_information?: string;
  governance_regulation?: string;
  stakeholders?: string;
  projects?: string;
  decision_makers?: string;
  key_contacts?: string;
  [key: string]: unknown;
}

export interface EntityProfileResponse {
  status: string;
  id: string;
  frontmatter: EntityFrontmatter;
  body_sections: EntityBodySections;
  raw_markdown?: string;
}

export async function fetchEntityProfile(id: string): Promise<EntityProfileResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/entity/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<EntityProfileResponse>(res);
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
