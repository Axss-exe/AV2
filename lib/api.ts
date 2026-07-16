/**
 * Centralized API client for ATIS backend.
 * All requests go through this module so base URL is never scattered.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://atis-api.onrender.com'
    : 'http://localhost:8000');

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

export async function queryAPI(body: QueryRequest): Promise<QueryAPIResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJSON<QueryAPIResponse>(res);
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
// GET /api/entities  (if the endpoint exists)
// ---------------------------------------------------------------------------

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

export async function fetchEntities(): Promise<EntityAPIItem[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/entities`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<EntityAPIItem[]>(res);
}

export async function fetchEntityProfile(id: string): Promise<EntityAPIItem> {
  const res = await fetchWithTimeout(`${API_BASE}/api/entities/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseJSON<EntityAPIItem>(res);
}
