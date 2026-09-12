export interface Country {
  id: string;
  name: string;
  flag: string;
  region: string;
  gdp: string;
  gdp_growth: string;
  population: string;
  currency: string;
  leader: string;
  capital: string;
  area: string;
  language: string;
  overview: string;
  trade_intel: string[];
  risks: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  subtitle: string;
  markets: string[];
  value: string;
  duration: string;
  status: 'active' | 'pending' | 'closed';
  validation_score: string;
  transaction_perimeter: string;
  operational_roadmap: { phase: string; duration: string; milestone: string }[];
  direct_action_matrix: string[];
}

export interface Entity {
  id: string;
  name: string;
  type: 'regulatory' | 'infrastructure' | 'logistics' | 'legal' | 'partner' | 'risk';
  country: string;
  description: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  hero_image: string;
  category_country: string;
  category_sector: string;
  tags: string[];
  author: string;
  published_at: string;
  related_opportunities: string[];
  is_hero: boolean;
}

export interface Trace {
  id: string;
  opportunity_id: string;
  source: string;
  badge: 'validated' | 'gap' | 'external';
  relationship: string;
  fact: string;
  justification: string;
}

export interface QueryHistory {
  id: string;
  query: string;
  summary: string;
  stats: {
    traces: number;
    nodes: number;
    concepts: number;
    entities: number;
    validated: string;
  };
  created_at: string;
}

export interface KeyEntity {
  entity_name: string;
  entity_type?: string;
  country?: string;
  sector?: string;
  significance_score?: number;
  related_count?: number;
  summary?: string;
  source_node?: string;
}

/** A finding or risk string with the entity ids that support it. */
export interface CitedStatement {
  text: string;
  sourceNodes: string[];
}

/** Real structured opportunity object from `opportunities_cited`. */
export interface OpportunityCited {
  opportunity_id?: string;
  stable_opportunity_id?: string;
  title?: string;
  type?: string;
  opportunity_type?: string;
  status?: string;
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
  capital_flow?: { beneficiary?: string; likely_funder?: string };
  justification?: string;
  source_nodes?: string[];
  graph_paths?: unknown[];
  validation_note?: string;
  validation_errors?: string[];
  validation_metadata?: Record<string, unknown>;
  perspective_actor_evidence?: boolean;
  perspective_capability_evidence?: boolean;
  pathway_evidence?: boolean;
  opportunity_confidence?: number;
  scoring_factors?: Record<string, number>;
  [key: string]: unknown;
}

export interface QueryIntent {
  type?: string;
  entities: string[];
  entityTypes: string[];
  countries: string[];
  sectors: string[];
  perspectiveCountry?: string;
  perspectiveCountryCode?: string;
}

export interface FilterStats {
  vaultTotal?: number;
  candidatesAfterBroadFilter?: number;
  rankedByLlm?: number;
}

export interface QueryResult {
  query: string;
  summary: string;
  stats: {
    traces: number;
    nodes: number;
    concepts: number;
    entities: number;
    validated: string;
  };
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  tableRows: IntelTableRow[];
  findings: string[];
  opportunities: string[];
  riskFactors: string[];
  keyEntities: KeyEntity[];
  // Additive real-data fields (optional so existing consumers, e.g.
  // app/history/page.tsx, keep working untouched).
  findingsCited?: CitedStatement[];
  opportunitiesCited?: OpportunityCited[];
  risksCited?: CitedStatement[];
  perspective?: { country?: string; countryCode?: string };
  intent?: QueryIntent;
  filterStats?: FilterStats;
  cached?: boolean;
  elapsedSeconds?: number;
  entityGraphRaw?: unknown;
  backendData: Record<string, unknown>;
  analysisVersion?: string;
  schemaVersion?: string;
  analysisFingerprint?: string;
  knowledgeState?: unknown;
  cacheKey?: string;
  sourceNodes?: { id?: string; type?: string }[];
  perspectiveNodes?: { id?: string; type?: string }[];
  crossBorderBridges?: unknown[];
  filesWritten?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'hub' | 'entity' | 'risk' | 'partner';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface IntelTableRow {
  entity: string;
  relationship: string;
  priority: string;
  status: 'Validated' | 'Gap' | 'External';
  insight: string;
  source_node: string;
}
