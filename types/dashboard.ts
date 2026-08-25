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
