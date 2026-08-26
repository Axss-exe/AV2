/**
 * Types for the Investigation layer. Investigations and their queries are
 * persisted entirely in Neon (Next.js API routes are the source of truth for
 * investigation state) — each query within an investigation still goes
 * through the real FastAPI `/api/query` backend via `queryAPI()` +
 * `mapAPIResponseToQueryResult()`, same as the standalone Query page.
 */
import type { QueryResult, KeyEntity, GraphEdge } from './types';

export interface InvestigationSummary {
  id: number;
  title: string;
  rootQuestion: string;
  status: 'active' | 'completed';
  queriesCount: number;
  sourcesCount: number;
  entitiesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationQuery {
  id: number;
  sequence: number;
  question: string;
  result: QueryResult;
  createdAt: string;
}

/** Deduped knowledge merged across every query in an investigation. Computed
 *  server-side from the real `result_json` rows — never fabricated. */
export interface AggregatedKnowledge {
  entities: KeyEntity[];
  relationships: GraphEdge[];
  sources: string[];
  findingsCount: number;
  entitiesCount: number;
  relationshipsCount: number;
  sourcesCount: number;
}

export interface Investigation extends InvestigationSummary {
  perspectiveCountry?: string;
  perspectiveCountryCode?: string;
  queries: InvestigationQuery[];
  aggregated: AggregatedKnowledge;
  report: InvestigationReport | null;
}

export interface InvestigationReport {
  title: string;
  generated_at: string;
  implications: string;
  key_findings: KeyFinding[];
  based_on_queries: number;
  executive_summary: string;
  original_question: string;
  research_required: string[];
  important_entities: ImportantEntity[];
  evidence_and_sources: EvidenceSource[];
  unresolved_questions: string[];
  evidence_sources_count: number;
  evidence_entities_count: number;
  important_relationships: Relationship[];
  investigation_narrative: string;
  confidence_and_limitations: string;
}

export interface KeyFinding {
  finding: string;
  confidence: 'High' | 'Medium' | 'Low';
  source_nodes: string[];
  evidence_queries: string[];
}

export interface ImportantEntity {
  name: string;
  type: string;
  significance: string;
  evidence_queries: string[];
}

export interface Relationship {
  insight: string;
  to_entity: string;
  from_entity: string;
  evidence_queries: string[];
  relationship_type: string;
}

export interface EvidenceSource {
  type: string;
  relevance: string;
  source_id: string;
}
