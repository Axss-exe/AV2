import type { Dashboard, Opportunity, PipelineMetadata } from '@/types/dashboard';

export interface NormalizedTextItem {
  text: string;
  source_nodes: string[];
}

export interface StructuredIntelligenceItem {
  claim?: string;
  evidence?: string;
  source_node?: string;
  impact?: string;
  entity?: string;
  type?: string;
  country?: string;
  relationship?: string;
  status?: string;
  priority?: string;
  insight?: string;
}

export interface KeyEntityItem {
  name?: string;
  type?: string;
  country?: string;
  role?: string;
  entity?: string;
  relationship?: string;
  source_node?: string;
}

export interface CrossBorderBridge {
  from_node?: string;
  to_node?: string;
  pathway?: string;
  evidence?: string;
  source_country?: string;
  opportunity_country?: string;
  [key: string]: unknown;
}

export interface ATISNewsDashboard extends Dashboard {
  executive_summary: string;
  structured_intelligence: StructuredIntelligenceItem[];
  findings: NormalizedTextItem[];
  risks: NormalizedTextItem[];
  key_entities: KeyEntityItem[];
  source_nodes: Array<{ id?: string; type?: string }>;
  perspective_nodes: unknown[];
  cross_border_bridges: CrossBorderBridge[];
  perspective?: { country?: string; country_code?: string; actor?: string; capability?: string };
  source_country?: string;
  event_country?: string;
  analysis_version?: string;
  schema_version?: string;
  analysis_fingerprint?: string;
  knowledge_state?: unknown;
  cache_hit?: boolean;
  partial: boolean;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeTextItems(value: unknown): NormalizedTextItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return [{ text: item, source_nodes: [] }];
    const obj = asRecord(item);
    if (!obj || typeof item !== 'object') return [];
    return [{
      text: typeof obj.text === 'string' ? obj.text : '',
      source_nodes: Array.isArray(obj.source_nodes)
        ? obj.source_nodes.filter((node): node is string => typeof node === 'string')
        : [],
    }];
  });
}

export function extractATISPayload(raw: unknown): Record<string, unknown> {
  const obj = asRecord(raw);
  const isPayload = ['executive_summary', 'opportunities', 'findings', 'structured_intelligence']
    .some((key) => key in obj);
  if (isPayload) return obj;

  // The News route may return the Stage 3 dashboard under a wrapper.
  // Prefer the dashboard itself so the UI validates the actual intelligence,
  // rather than rejecting a valid response because wrapper keys are sparse.
  for (const candidate of [obj.dashboard, obj.data, obj.result]) {
    const payload = asRecord(candidate);
    if (['executive_summary', 'opportunities', 'findings', 'structured_intelligence', 'key_entities']
      .some((key) => key in payload)) {
      return payload;
    }
  }

  return obj;
}

function safeScore(value: unknown): number | undefined {
  const score = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(score) ? score : undefined;
}

function normalizeOpportunity(value: unknown, index: number): Opportunity {
  const obj = asRecord(value);
  const capital = asRecord(obj.capital_flow);
  return {
    opportunity_id: typeof obj.stable_opportunity_id === 'string'
      ? obj.stable_opportunity_id
      : typeof obj.opportunity_id === 'string' ? obj.opportunity_id : `opportunity-${index}`,
    title: typeof obj.title === 'string' ? obj.title : 'Untitled opportunity',
    type: typeof obj.type === 'string' ? obj.type : 'Unclassified',
    urgency_score: safeScore(obj.urgency_score) ?? 0,
    feasibility_score: safeScore(obj.feasibility_score) ?? 0,
    required_missing_nodes: Array.isArray(obj.required_missing_nodes) ? obj.required_missing_nodes.filter((v): v is string => typeof v === 'string') : [],
    capital_flow: {
      beneficiary: typeof capital.beneficiary === 'string' ? capital.beneficiary : '',
      likely_funder: typeof capital.likely_funder === 'string' ? capital.likely_funder : '',
    },
    justification: typeof obj.justification === 'string' ? obj.justification : '',
    ...(typeof obj.intelligence_id === 'string' ? { intelligence_id: obj.intelligence_id } : {}),
    ...(typeof obj.trigger_event === 'string' ? { trigger_event: obj.trigger_event } : {}),
    ...(typeof obj.source_article_id === 'number' ? { source_article_id: obj.source_article_id } : {}),
    ...(typeof obj.source_article_headline === 'string' ? { source_article_headline: obj.source_article_headline } : {}),
  };
}

export function normalizeATISNewsResponse(raw: unknown): ATISNewsDashboard {
  const data = extractATISPayload(raw);
  const opportunities = Array.isArray(data.opportunities) ? data.opportunities.map(normalizeOpportunity) : [];
  const findings = normalizeTextItems(data.findings);
  const risks = normalizeTextItems(data.risks);
  const structured_intelligence = Array.isArray(data.structured_intelligence)
    ? data.structured_intelligence.filter((item) => item && typeof item === 'object') as StructuredIntelligenceItem[]
    : [];
  const key_entities = Array.isArray(data.key_entities)
    ? data.key_entities.filter((item) => item && typeof item === 'object') as KeyEntityItem[]
    : [];
  const meaningful = Boolean(
    data.executive_summary || data.trigger_event || data.market_equilibrium_shift
  ) || structured_intelligence.length > 0 || findings.length > 0 || opportunities.length > 0 || risks.length > 0 || key_entities.length > 0;
  const sectionCount = [structured_intelligence.length, findings.length, opportunities.length, risks.length, key_entities.length].filter(Boolean).length;
  const metadata = asRecord(data.pipeline_metadata) as PipelineMetadata;

  return {
    ...data,
    intelligence_id: typeof data.intelligence_id === 'string' ? data.intelligence_id : '',
    trigger_event: typeof data.trigger_event === 'string' ? data.trigger_event : '',
    market_equilibrium_shift: typeof data.market_equilibrium_shift === 'string' ? data.market_equilibrium_shift : '',
    executive_summary: typeof data.executive_summary === 'string' ? data.executive_summary : '',
    structured_intelligence,
    findings,
    opportunities,
    risks,
    key_entities,
    source_nodes: Array.isArray(data.source_nodes) ? data.source_nodes.filter((v) => v && typeof v === 'object') as Array<{ id?: string; type?: string }> : [],
    perspective_nodes: Array.isArray(data.perspective_nodes) ? data.perspective_nodes : [],
    cross_border_bridges: Array.isArray(data.cross_border_bridges) ? data.cross_border_bridges.filter((v) => v && typeof v === 'object') as CrossBorderBridge[] : [],
    pipeline_metadata: metadata,
    partial: meaningful && sectionCount < 5,
  };
}

export function hasMeaningfulATISData(payload: ATISNewsDashboard): boolean {
  return Boolean(payload.executive_summary) || payload.structured_intelligence.length > 0 || payload.findings.length > 0 || payload.opportunities.length > 0 || payload.risks.length > 0 || payload.key_entities.length > 0;
}
