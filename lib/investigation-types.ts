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

/** AI-synthesized knowledge report — organizes/summarizes the investigation's
 *  already-real accumulated data. Never invents entities, sources, or facts
 *  that don't exist in the stored query results. */
export interface InvestigationReport {
  executiveAssessment: string;
  keyFindings: string[];
  actorLandscape: string;
  relationshipsNarrative: string;
  risks: string[];
  opportunities: string[];
  knowledgeGaps: string[];
  sourceTrail: string[];
  generatedAt: string;
}
