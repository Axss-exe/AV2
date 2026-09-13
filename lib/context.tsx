'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Article, Opportunity, QueryResult } from './types';
import type { Article as NewsArticle } from '@/types/article';
import type { Dashboard } from '@/types/dashboard';
import { DEFAULT_PERSPECTIVE, getCountryCode } from './perspective';

interface ATISContextType {
  // Existing state
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
  selectedOpportunity: Opportunity | null;
  setSelectedOpportunity: (opp: Opportunity | null) => void;
  validationPanelOpen: boolean;
  setValidationPanelOpen: (open: boolean) => void;
  articleModalOpen: boolean;
  setArticleModalOpen: (open: boolean) => void;
  currentQueryResult: QueryResult | null;
  setCurrentQueryResult: (result: QueryResult | null) => void;
  queryHistory: QueryResult[];
  addQueryToHistory: (result: QueryResult) => void;
  removeQueryFromHistory: (query: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Perspective context — the country the user is analysing FROM (not a filter)
  perspectiveCountry: string;
  perspectiveCountryCode: string;
  setPerspectiveCountry: (name: string) => void;
  // News analysis state
  currentNewsArticle: NewsArticle | null;
  analysisLoading: boolean;
  analysisPhase: 'idle' | 'running' | 'success' | 'error';
  analysisProgress: number;
  analysisStatusText: string;
  analysisError: string | null;
  currentDashboard: Dashboard | null;
  // Async job tracking
  currentJobId: string | null;
  currentJobStatus: string | null;
  jobCheckpoint: {
    current_stage?: string;
    completed_stages?: string[];
    stage_durations?: Record<string, number>;
  } | null;
  runAnalysis: (article: NewsArticle) => Promise<void>;
  cancelAnalysis: () => Promise<void>;
  resumeAnalysis: (jobId: string) => Promise<void>;
  clearAnalysis: () => void;
}

const ATISContext = createContext<ATISContextType | null>(null);

// Pipeline stages in order
const PIPELINE_STAGES = [
  'INPUT_VALIDATION',
  'ARTICLE_UNDERSTANDING',
  'PERSPECTIVE_ECOSYSTEM_LOADING',
  'PERSPECTIVE_IMPACT_MAPPING',
  'TARGET_RESOLUTION',
  'GRAPH_TRAVERSAL',
  'IMPACT_ANALYSIS',
  'FINAL_SYNTHESIS',
  'VALIDATION_GROUNDING',
  'OUTPUT_ASSEMBLY',
  'COMPLETE',
];

// User-friendly stage names
const STAGE_LABELS: Record<string, string> = {
  'INPUT_VALIDATION': 'Validating input',
  'ARTICLE_UNDERSTANDING': 'Understanding article',
  'PERSPECTIVE_ECOSYSTEM_LOADING': 'Loading perspective ecosystem',
  'PERSPECTIVE_IMPACT_MAPPING': 'Mapping perspective impacts',
  'TARGET_RESOLUTION': 'Resolving targets',
  'GRAPH_TRAVERSAL': 'Traversing knowledge graph',
  'IMPACT_ANALYSIS': 'Analyzing impacts',
  'FINAL_SYNTHESIS': 'Synthesizing results',
  'VALIDATION_GROUNDING': 'Validating and grounding',
  'OUTPUT_ASSEMBLY': 'Assembling output',
  'COMPLETE': 'Finalizing',
};

// Normalize backend status to uppercase
function normalizeStatus(status: string): string {
  return String(status || '').trim().toUpperCase();
}

// Calculate progress from completed stages
function calculateProgressFromStages(completedStages: string[] = []): number {
  if (completedStages.length === 0) return 0;
  
  const completedIndices = completedStages
    .map((stage) => PIPELINE_STAGES.findIndex((s) => s === stage.toUpperCase()))
    .filter((idx) => idx !== -1);
  
  if (completedIndices.length === 0) return 0;
  
  const maxCompletedIndex = Math.max(...completedIndices);
  const totalStages = PIPELINE_STAGES.length;
  
  // Progress is based on completed stages
  const progress = ((maxCompletedIndex + 1) / totalStages) * 100;
  return Math.min(98, Math.max(0, progress));
}

type BackendJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface JobCheckpoint {
  status?: 'IN_PROGRESS' | 'PARTIAL' | 'COMPLETED';
  current_stage?: string;
  completed_stages?: string[];
  updated_at?: number;
  error_count?: number;
  resume_available?: boolean;
}

interface NewsExecutionState {
  phase: 'idle' | 'running' | 'success' | 'error';
  jobId?: string;
  backendStatus?: BackendJobStatus;
  checkpoint?: JobCheckpoint;
  dashboard?: Dashboard;
  error?: string;
}

const POLL_INTERVAL_MS = 2500;

export function ATISProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [validationPanelOpen, setValidationPanelOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [currentQueryResult, setCurrentQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Perspective context (single source of truth). Defaults to Zimbabwe.
  const [perspectiveCountry, setPerspectiveCountryState] = useState<string>(DEFAULT_PERSPECTIVE.name);
  const [perspectiveCountryCode, setPerspectiveCountryCode] = useState<string>(DEFAULT_PERSPECTIVE.code);

  // Restore the last-selected perspective from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('atis_perspective_country');
      if (saved) {
        setPerspectiveCountryState(saved);
        setPerspectiveCountryCode(getCountryCode(saved) || DEFAULT_PERSPECTIVE.code);
      }
    } catch {
      // localStorage unavailable — keep defaults
    }
  }, []);

  const setPerspectiveCountry = useCallback((name: string) => {
    setPerspectiveCountryState(name);
    setPerspectiveCountryCode(getCountryCode(name));
    try {
      localStorage.setItem('atis_perspective_country', name);
    } catch {
      // ignore persistence failure
    }
  }, []);

  // News analysis state
  const [currentNewsArticle, setCurrentNewsArticle] = useState<NewsArticle | null>(null);
  const [executionState, setExecutionState] = useState<NewsExecutionState>({ phase: 'idle' });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState('');
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusAbortRef = useRef<AbortController | null>(null);
  const pollInFlightRef = useRef(false);
  const lifecycleRef = useRef(0);

  const analysisLoading = executionState.phase === 'running';
  const analysisError = executionState.phase === 'error' ? executionState.error ?? null : null;
  const currentDashboard = executionState.dashboard ?? null;
  const currentJobId = executionState.jobId ?? null;
  const currentJobStatus = executionState.backendStatus ?? null;
  const jobCheckpoint = executionState.checkpoint ?? null;

  const addQueryToHistory = useCallback((result: QueryResult) => {
    setQueryHistory((prev) => [result, ...prev]);
  }, []);

  const removeQueryFromHistory = useCallback((query: string) => {
    setQueryHistory((prev) => prev.filter((r) => r.query !== query));
  }, []);

  // Stop polling and cleanup
  const stopPolling = useCallback(() => {
    lifecycleRef.current += 1;
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
    statusAbortRef.current?.abort();
    statusAbortRef.current = null;
    pollInFlightRef.current = false;
  }, []);

  // Fetch the result only after the durable queue reaches COMPLETED.
  const fetchJobResult = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/news/result/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Result fetch failed (${res.status})`);
      }

      const json = await res.json();
      if (json.status !== 'success' || !json.data || typeof json.data !== 'object') {
        throw new Error('The analysis result did not contain a dashboard.');
      }

      const dashboard = normalizeDashboardData(json.data as Record<string, unknown>);
      if (!hasMeaningfulDashboardData(dashboard)) {
        throw new Error('The analysis returned no usable intelligence data. Please try again.');
      }

      setExecutionState((current) => ({
        ...current,
        phase: 'success',
        dashboard,
        backendStatus: 'COMPLETED',
      }));
      setAnalysisProgress(100);
      setAnalysisStatusText('Analysis complete');
      try {
        localStorage.setItem('atis_last_job_id', jobId);
        localStorage.setItem('atis_last_job_status', 'COMPLETED');
      } catch {
        // ignore persistence failure
      }
      return dashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis result';
      setExecutionState((current) => ({
        ...current,
        phase: 'error',
        error: errorMessage,
      }));
      setAnalysisStatusText('Analysis failed');
      throw err;
    }
  }, []);

  // One recursive controller prevents overlapping status requests.
  const pollJobStatus = useCallback(async (jobId: string, lifecycle: number): Promise<void> => {
    if (lifecycle !== lifecycleRef.current || pollInFlightRef.current) return;
    pollInFlightRef.current = true;
    const controller = new AbortController();
    statusAbortRef.current = controller;

    try {
      const res = await fetch(`/api/news/status/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Status request failed (${res.status})`);
      }
      const json = await res.json();
      const job = json.data;
      const status = normalizeStatus(job?.status) as BackendJobStatus;
      if (!['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED'].includes(status)) {
        throw new Error('Status response contained an unknown job state.');
      }

      setExecutionState((current) => ({
        ...current,
        backendStatus: status,
        checkpoint: job.checkpoint ?? undefined,
      }));
      if (job.checkpoint?.completed_stages) {
        setAnalysisProgress(calculateProgressFromStages(job.checkpoint.completed_stages));
      }
      if (job.checkpoint?.current_stage) {
        const stage = STAGE_LABELS[job.checkpoint.current_stage.toUpperCase()] ?? job.checkpoint.current_stage;
        setAnalysisStatusText(`Stage: ${stage}`);
      } else {
        setAnalysisStatusText(status === 'QUEUED' ? 'Job queued - waiting for processing to start' : 'Processing intelligence analysis');
      }

      if (status === 'COMPLETED') {
        stopPolling();
        await fetchJobResult(jobId);
        return;
      }
      if (status === 'FAILED') {
        stopPolling();
        const errorMessage = job.error || 'Backend processing failed. Please try again.';
        setExecutionState((current) => ({ ...current, phase: 'error', error: errorMessage }));
        setAnalysisStatusText('Analysis failed');
        return;
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn('Job status polling failed, will retry:', err);
    } finally {
      pollInFlightRef.current = false;
      if (statusAbortRef.current === controller) statusAbortRef.current = null;
      if (lifecycle === lifecycleRef.current) {
        pollTimerRef.current = setTimeout(() => void pollJobStatus(jobId, lifecycle), POLL_INTERVAL_MS);
      }
    }
  }, [fetchJobResult, stopPolling]);

  // Normalize backend dashboard data to frontend Dashboard type
  function normalizeDashboardData(data: Record<string, unknown>): Dashboard {
    const pm = data.pipeline_metadata as Record<string, unknown> | undefined;
    return {
      ...data,
      intelligence_id: String(data.intelligence_id ?? data.job_id ?? ''),
      trigger_event: String(data.trigger_event ?? data.core_event ?? ''),
      market_equilibrium_shift: String(data.market_equilibrium_shift ?? ''),
      executive_summary: data.executive_summary ? String(data.executive_summary) : undefined,
      summary: data.summary ? String(data.summary) : undefined,
      findings: Array.isArray(data.findings) ? data.findings.map(String) : undefined,
      key_entities: Array.isArray(data.key_entities) ? data.key_entities : undefined,
      structured_intelligence: Array.isArray(data.structured_intelligence) ? data.structured_intelligence : undefined,
      intent: data.intent && typeof data.intent === 'object' ? data.intent as Record<string, unknown> : undefined,
      filter_stats: data.filter_stats && typeof data.filter_stats === 'object' ? data.filter_stats as Record<string, number> : undefined,
      perspective_nodes: Array.isArray(data.perspective_nodes) ? data.perspective_nodes : undefined,
      opportunities: Array.isArray(data.opportunities) 
        ? data.opportunities.map((opp: unknown) => {
            const o = opp as Record<string, unknown>;
              return {
                ...o,
                opportunity_id: o.opportunity_id,
              } as Dashboard['opportunities'][number];
          })
        : [],
      pipeline_metadata: {
          ...pm,
        processed_at: String(pm?.processed_at ?? new Date().toISOString()),
        source_article: String(pm?.source_article ?? (data.article_text?.toString().slice(0, 100) ?? '')),
        extracted_entities_count: Number(pm?.extracted_entities_count ?? 0),
        core_event: String(pm?.core_event ?? data.trigger_event ?? ''),
        model_primary: String(pm?.model_primary ?? ''),
        model_fallback: String(pm?.model_fallback ?? ''),
        elapsed_seconds: Number(pm?.elapsed_seconds ?? 0),
      },
    };
  }

  // Validate that dashboard has meaningful data
  function hasMeaningfulDashboardData(dashboard: Dashboard | null): boolean {
    if (!dashboard) return false;
    
    // Must have intelligence_id
    if (!dashboard.intelligence_id || dashboard.intelligence_id.trim() === '') {
      return false;
    }
    
    // Must have at least one meaningful field
    const hasTrigger = dashboard.trigger_event && dashboard.trigger_event.trim() !== '';
    const hasShift = dashboard.market_equilibrium_shift && dashboard.market_equilibrium_shift.trim() !== '';
    const hasOpportunities = Array.isArray(dashboard.opportunities) && dashboard.opportunities.length > 0;
    const hasFindings = Array.isArray(dashboard.findings) && dashboard.findings.length > 0;
    const hasKeyEntities = Array.isArray(dashboard.key_entities) && dashboard.key_entities.length > 0;
    const hasStructuredIntelligence = Array.isArray(dashboard.structured_intelligence) && dashboard.structured_intelligence.length > 0;
    const hasExecutiveSummary = dashboard.executive_summary != null && dashboard.executive_summary.trim() !== '';
    const hasSummary = dashboard.summary != null && dashboard.summary.trim() !== '';
    
    return hasTrigger || hasShift || hasOpportunities || hasFindings || hasKeyEntities || hasStructuredIntelligence || hasExecutiveSummary || hasSummary;
  }

  // Main analysis function - implements proper async lifecycle
  const runAnalysis = useCallback(async (article: NewsArticle) => {
    stopPolling();
    setCurrentNewsArticle(article);
    setAnalysisProgress(0);
    setAnalysisStatusText('Submitting article for analysis...');
    setExecutionState({ phase: 'running' });

    try {
      // STEP 1: POST /api/news - Submit job
      setAnalysisStatusText('Submitting article for analysis...');
      setAnalysisProgress(0);

      const submitRes = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_text: article.article_text,
          perspective_country: perspectiveCountry,
          perspective_country_code: perspectiveCountryCode,
        }),
      });

      if (!submitRes.ok) {
        const json = await submitRes.json().catch(() => ({}));
        throw new Error(json.detail ?? json.error ?? `Submission failed (${submitRes.status})`);
      }

      const submitJson = await submitRes.json();
      const jobId = submitJson.job_id;
      if (!jobId) {
        throw new Error('Submission response did not contain job_id.');
      }

      const lifecycle = lifecycleRef.current;
      setExecutionState({ phase: 'running', jobId, backendStatus: 'QUEUED' });
      setAnalysisStatusText('Job queued - waiting for processing...');

      // Persist job ID for recovery on page refresh
      try {
        localStorage.setItem('atis_last_job_id', jobId);
        localStorage.setItem('atis_last_job_status', 'QUEUED');
        localStorage.setItem('atis_last_article', JSON.stringify(article));
      } catch {
        // ignore persistence failure
      }

      await pollJobStatus(jobId, lifecycle);

    } catch (err) {
      stopPolling();
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setExecutionState((current) => ({ ...current, phase: 'error', error: errorMessage }));
      setAnalysisStatusText('Analysis failed');
      
      // Clean up persisted state on error
      try {
        localStorage.removeItem('atis_last_job_id');
        localStorage.removeItem('atis_last_job_status');
      } catch {
        // ignore
      }
    }
  }, [perspectiveCountry, perspectiveCountryCode, stopPolling, pollJobStatus]);

  // The backend has no cancellation endpoint; this only abandons the frontend view.
  const cancelAnalysis = useCallback(async () => {
    stopPolling();
    setExecutionState({ phase: 'idle' });
    setAnalysisProgress(0);
    setAnalysisStatusText('');
  }, [stopPolling]);

  // Resume analysis from persisted job ID
  const resumeAnalysis = useCallback(async (jobId: string) => {
    if (!jobId) return;

    stopPolling();
    setAnalysisProgress(0);
    setExecutionState({ phase: 'running', jobId });
    setAnalysisStatusText('Resuming analysis...');

    try {
      await pollJobStatus(jobId, lifecycleRef.current);
    } catch (err) {
      stopPolling();
      setExecutionState((current) => ({ ...current, phase: 'error', error: 'Failed to resume analysis. Please try again.' }));
    }
  }, [stopPolling, pollJobStatus]);

  // Clear analysis
  const clearAnalysis = useCallback(() => {
    stopPolling();
    setCurrentNewsArticle(null);
    setExecutionState({ phase: 'idle' });
    setAnalysisProgress(0);
    setAnalysisStatusText('');
    
    try {
      localStorage.removeItem('atis_last_job_id');
      localStorage.removeItem('atis_last_job_status');
      localStorage.removeItem('atis_last_article');
    } catch {
      // ignore
    }
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return (
    <ATISContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedArticle,
        setSelectedArticle,
        selectedOpportunity,
        setSelectedOpportunity,
        validationPanelOpen,
        setValidationPanelOpen,
        articleModalOpen,
        setArticleModalOpen,
        currentQueryResult,
        setCurrentQueryResult,
        queryHistory,
        addQueryToHistory,
        removeQueryFromHistory,
        sidebarCollapsed,
        setSidebarCollapsed,
        perspectiveCountry,
        perspectiveCountryCode,
        setPerspectiveCountry,
        currentNewsArticle,
        analysisLoading,
        analysisPhase: executionState.phase,
        analysisProgress,
        analysisStatusText,
        analysisError,
        currentDashboard,
        currentJobId,
        currentJobStatus,
        jobCheckpoint,
        runAnalysis,
        cancelAnalysis,
        resumeAnalysis,
        clearAnalysis,
      }}
    >
      {children}
    </ATISContext.Provider>
  );
}

export function useATIS(): ATISContextType {
  const ctx = useContext(ATISContext);
  if (!ctx) throw new Error('useATIS must be used within ATISProvider');
  return ctx;
}
