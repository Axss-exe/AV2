import type { QueryResult } from './types';

export interface InvestigationSummary {
  investigation_id: string;
  title: string;
  status: string;
  query_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationQuery {
  query_id: string;
  sequence: number;
  parent_query_id: string | null;
  question: string;
  result: QueryResult;
  created_at: string;
}

export interface InvestigationReport {
  title: string;
  generated_at: string;
  implications: string;
  key_findings: Array<Record<string, unknown>>;
  based_on_queries: number;
  executive_summary: string;
  original_question: string;
  research_required: string[];
  important_entities: Array<Record<string, unknown>>;
  evidence_and_sources: Array<Record<string, unknown>>;
  unresolved_questions: string[];
  important_relationships: Array<Record<string, unknown>>;
  investigation_narrative: string;
  confidence_and_limitations: string;
  evidence_sources_count?: number;
  evidence_entities_count?: number;
  [key: string]: unknown;
}

export interface Investigation {
  investigation_id: string;
  title: string;
  status: string;
  root_question: string;
  original_question: string;
  perspective?: { country?: string; country_code?: string };
  queries: InvestigationQuery[];
  aggregated_context: Record<string, unknown>;
  report: InvestigationReport | null;
  created_at: string;
  updated_at: string;
}
