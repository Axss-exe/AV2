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
  tableRows: IntelTableRow[];
  findings: string[];
  opportunities: string[];
  riskFactors: string[];
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
  source: string;
  relationship: string;
  confidence: string;
  status: 'Validated' | 'Gap' | 'External';
  last_updated: string;
}
