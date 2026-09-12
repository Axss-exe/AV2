export interface Opportunity {
  opportunity_id: string;
  stable_opportunity_id?: string;
  title: string;
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
  capital_flow?: {
    beneficiary?: string;
    likely_funder?: string;
  };
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
  // Fields added when an opportunity is sourced from a news article pipeline
  intelligence_id?: string;
  trigger_event?: string;
  source_article_id?: number;
  source_article_headline?: string;
}

export interface PipelineMetadata {
  processed_at: string;
  source_article: string;
  extracted_entities_count: number;
  core_event: string;
  model_primary: string;
  model_fallback: string;
  elapsed_seconds?: number;
}

export interface Dashboard {
  intelligence_id: string;
  trigger_event: string;
  market_equilibrium_shift: string;
  opportunities: Opportunity[];
  pipeline_metadata: PipelineMetadata;
}
