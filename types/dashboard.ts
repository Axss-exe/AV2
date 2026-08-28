export interface Opportunity {
  opportunity_id: string;
  title: string;
  type: 'Primary' | 'Secondary' | 'Tertiary' | string;
  urgency_score: number;
  feasibility_score: number;
  required_missing_nodes: string[];
  capital_flow: {
    beneficiary: string;
    likely_funder: string;
  };
  justification: string;
  // Fields added when an opportunity is sourced from a news article pipeline
  intelligence_id?: string;
  trigger_event?: string;
  source_article_id?: number;
  source_article_headline?: string;
}

export interface PipelineMetadata {
  processed_at?: string;
  source_article?: string;
  extracted_entities_count?: number;
  core_event?: string;
  model_primary?: string;
  model_fallback?: string | null;
  analysis_fingerprint?: string;
  analysis_version?: string;
  cross_border_bridges_found?: number;
  perspective_nodes_found?: number;
  event_country?: string;
  source_country?: string;
  perspective_country?: string;
  perspective_country_code?: string;
  schema_version?: string;
  knowledge_state?: {
    vault_version?: string;
    total_files?: number;
    evidence_set_hash?: string;
    knowledge_state_hash?: string;
    [key: string]: unknown;
  };
  elapsed_seconds?: number;
}

export interface Dashboard {
  intelligence_id: string;
  partial?: boolean;
  executive_summary?: string;
  trigger_event: string;
  market_equilibrium_shift: string;
  source_country?: string;
  event_country?: string;
  key_entities?: Array<{ name?: string; type?: string; country?: string; role?: string }>;
  structured_intelligence?: Array<{ claim?: string; evidence?: string; source_node?: string; impact?: string }>;
  findings?: Array<{ text?: string; source_nodes?: string[] }>;
  risks?: Array<{ text?: string; source_nodes?: string[] }>;
  opportunities: Opportunity[];
  pipeline_metadata: PipelineMetadata;
}
