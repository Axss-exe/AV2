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

const TERMINAL_STATES = new Set<BackendJobStatus>(['COMPLETED', 'FAILED']);
const PROCESSING_STATES = new Set<BackendJobStatus>(['QUEUED', 'RUNNING']);

function getJobPayload(json: Record<string, any>) {
  return json.data && typeof json.data === 'object' ? json.data : null;
}

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
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  
  // Async job tracking
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);
  const [jobCheckpoint, setJobCheckpoint] = useState<{
    current_stage?: string;
    completed_stages?: string[];
    stage_durations?: Record<string, number>;
  } | null>(null);
  
  // Self-scheduling polling and request lifecycle refs
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchJobResultRef = useRef<((jobId: string) => Promise<Dashboard>) | null>(null);
  const mountedRef = useRef(true);

  const addQueryToHistory = useCallback((result: QueryResult) => {
    setQueryHistory((prev) => [result, ...prev]);
  }, []);

  const removeQueryFromHistory = useCallback((query: string) => {
    setQueryHistory((prev) => prev.filter((r) => r.query !== query));
  }, []);

  // Stop future polling without aborting the current request/result fetch.
  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const abortAnalysis = useCallback(() => {
    stopPolling();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [stopPolling]);

  // Poll one status request. The durable lifecycle is always json.data.status.
  const pollJobStatus = useCallback(async (jobId: string): Promise<BackendJobStatus | null> => {
    if (!mountedRef.current || pollInFlightRef.current) return null;
    pollInFlightRef.current = true;
    try {
      const res = await fetch(`/api/news/status/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current?.signal,
      });
      if (!res.ok) throw new Error(`Status request failed (${res.status})`);

      const json = await res.json() as Record<string, any>;
      const job = getJobPayload(json);
      const status = normalizeStatus(job?.status) as BackendJobStatus;
      if (!PROCESSING_STATES.has(status) && !TERMINAL_STATES.has(status)) {
        throw new Error(`Unexpected job status: ${job?.status ?? 'missing'}`);
      }

      const checkpoint = job?.checkpoint ?? null;
      setCurrentJobStatus(status);
      setJobCheckpoint(checkpoint);
      if (Array.isArray(checkpoint?.completed_stages)) {
        setAnalysisProgress(calculateProgressFromStages(checkpoint.completed_stages));
      }
      if (checkpoint?.current_stage) {
        const stage = String(checkpoint.current_stage).toUpperCase();
        setAnalysisStatusText(`Stage: ${STAGE_LABELS[stage] ?? checkpoint.current_stage}`);
      } else {
        setAnalysisStatusText(status === 'QUEUED'
          ? 'Job queued - waiting for processing to start'
          : 'Processing intelligence analysis');
      }

      if (status === 'COMPLETED') {
        stopPolling();
        const fetchResult = fetchJobResultRef.current;
        if (!fetchResult) throw new Error('Result handler is not ready.');
        await fetchResult(jobId);
      } else if (status === 'FAILED') {
        stopPolling();
        setAnalysisError(String(job?.error ?? 'Backend processing failed. Please try again.'));
        setAnalysisLoading(false);
      }
      return status;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      console.warn('Job status polling failed, will retry:', err);
      return null;
    } finally {
      pollInFlightRef.current = false;
    }
  }, [stopPolling]);

  // Fetch job result after completion
  const fetchJobResult = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/news/result/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current?.signal,
      });

      if (!res.ok) {
        throw new Error(`Result fetch failed (${res.status})`);
      }

      const json = await res.json() as Record<string, any>;
      if (normalizeStatus(json.status) !== 'SUCCESS' || !json.data || typeof json.data !== 'object') {
        throw new Error('The completed analysis returned an invalid result. Please try again.');
      }

      const dashboard = normalizeDashboardData(json.data as Record<string, unknown>);
      if (!hasMeaningfulDashboardData(dashboard)) {
        throw new Error('The analysis returned no usable intelligence data. Please try again.');
      }

      setCurrentDashboard(dashboard);
      setAnalysisProgress(100);
      setAnalysisStatusText('Analysis complete');
      setAnalysisLoading(false);
      setCurrentJobStatus('COMPLETED');
      try {
        localStorage.setItem('atis_last_job_id', jobId);
        localStorage.setItem('atis_last_job_status', 'COMPLETED');
      } catch {
        // ignore persistence failure
      }
      return dashboard;

    } catch (err) {
      stopPolling();
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis result';
      setAnalysisError(errorMessage);
      setAnalysisLoading(false);
      throw err;
    }
  }, [stopPolling]);

  fetchJobResultRef.current = fetchJobResult;

  // Normalize backend dashboard data to frontend Dashboard type
  function normalizeDashboardData(data: Record<string, unknown>): Dashboard {
    const pm = data.pipeline_metadata as Record<string, unknown> | undefined;
    return {
      ...data,
      intelligence_id: String(data.intelligence_id ?? data.job_id ?? ''),
      trigger_event: String(data.trigger_event ?? data.core_event ?? ''),
      market_equilibrium_shift: String(data.market_equilibrium_shift ?? ''),
      opportunities: Array.isArray(data.opportunities) 
        ? data.opportunities.map((opp: unknown) => {
            const o = opp as Record<string, unknown>;
            const cf = o.capital_flow as Record<string, unknown> | undefined;
            return {
              ...o,
              opportunity_id: String(o.id ?? o.opportunity_id ?? ''),
              title: String(o.title ?? ''),
              type: String(o.type ?? 'Primary'),
              urgency_score: Number(o.urgency_score ?? o.urgency ?? 0),
              feasibility_score: Number(o.feasibility_score ?? o.feasibility ?? 0),
              required_missing_nodes: Array.isArray(o.required_missing_nodes) 
                ? o.required_missing_nodes as string[]
                : [],
              capital_flow: {
                ...cf,
                beneficiary: String(cf?.beneficiary ?? ''),
                likely_funder: String(cf?.likely_funder ?? ''),
              },
              justification: String(o.justification ?? ''),
            };
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
    
    return hasTrigger || hasShift || hasOpportunities;
  }

  // Main analysis function - implements proper async lifecycle
  const runAnalysis = useCallback(async (article: NewsArticle) => {
    // Clean up any existing job
    stopPolling();
    setCurrentJobId(null);
    setCurrentJobStatus(null);
    setJobCheckpoint(null);
    
    setCurrentNewsArticle(article);
    setAnalysisLoading(true);
    setAnalysisProgress(0);
    setAnalysisError(null);
    setCurrentDashboard(null);
    setAnalysisStatusText('Submitting article for analysis...');

    // Create abort controller for this analysis
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal,
      });

      if (!submitRes.ok) {
        const json = await submitRes.json().catch(() => ({}));
        throw new Error(json.detail ?? json.error ?? `Submission failed (${submitRes.status})`);
      }

      const submitJson = await submitRes.json() as Record<string, any>;
      const jobId = typeof submitJson.job_id === 'string' ? submitJson.job_id : '';
      if (!jobId || normalizeStatus(submitJson.status) !== 'ACCEPTED') {
        throw new Error('The analysis submission returned an invalid response.');
      }

      setCurrentJobId(jobId);
      setCurrentJobStatus('QUEUED');
      try {
        localStorage.setItem('atis_last_job_id', jobId);
        localStorage.setItem('atis_last_job_status', 'QUEUED');
        localStorage.setItem('atis_last_article', JSON.stringify(article));
      } catch {
        // ignore persistence failure
      }

      if (jobId) {
        setAnalysisStatusText('Job queued - waiting for processing...');
        setAnalysisProgress(0);

        const poll = async (): Promise<void> => {
          if (!mountedRef.current) return;
          const status = await pollJobStatus(jobId);
          if (status && TERMINAL_STATES.has(normalizeStatus(status))) return;
          if (mountedRef.current && !pollTimeoutRef.current) {
            pollTimeoutRef.current = setTimeout(() => {
              pollTimeoutRef.current = null;
              void poll();
            }, 2500);
          }
        };
        await poll();
      }

    } catch (err) {
      stopPolling();
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setAnalysisError(errorMessage);
      setAnalysisLoading(false);
      
      // Clean up persisted state on error
      try {
        localStorage.removeItem('atis_last_job_id');
        localStorage.removeItem('atis_last_job_status');
      } catch {
        // ignore
      }
    }
  }, [perspectiveCountry, perspectiveCountryCode, stopPolling, pollJobStatus, fetchJobResult]);

  // The backend has no cancellation endpoint. This abandons the UI locally only.
  const cancelAnalysis = useCallback(async () => {
    stopPolling();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setAnalysisLoading(false);
    setAnalysisStatusText('Analysis abandoned locally; the backend job may continue.');
    setAnalysisError(null);
    try {
      localStorage.removeItem('atis_last_job_id');
      localStorage.removeItem('atis_last_job_status');
    } catch {
      // ignore persistence failure
    }
  }, [stopPolling]);

  // Resume analysis from persisted job ID
  const resumeAnalysis = useCallback(async (jobId: string) => {
    if (!jobId) return;

    stopPolling();
    setAnalysisLoading(true);
    setAnalysisProgress(0);
    setAnalysisError(null);
    setCurrentJobId(jobId);
    setCurrentJobStatus(null);
    setJobCheckpoint(null);
    setAnalysisStatusText('Resuming analysis...');

    abortControllerRef.current = new AbortController();

    try {
      const poll = async (): Promise<void> => {
        if (!mountedRef.current) return;
        const status = await pollJobStatus(jobId);
        if (status && TERMINAL_STATES.has(status)) return;
        if (mountedRef.current && !pollTimeoutRef.current) {
          pollTimeoutRef.current = setTimeout(() => {
            pollTimeoutRef.current = null;
            void poll();
          }, 2500);
        }
      };
      await poll();
    } catch {
      stopPolling();
      setAnalysisError('Failed to resume analysis. Please try again.');
      setAnalysisLoading(false);
    }
  }, [stopPolling, pollJobStatus, fetchJobResult]);

  // Clear analysis
  const clearAnalysis = useCallback(() => {
    stopPolling();
    setCurrentNewsArticle(null);
    setAnalysisLoading(false);
    setAnalysisProgress(0);
    setAnalysisStatusText('');
    setAnalysisError(null);
    setCurrentDashboard(null);
    setCurrentJobId(null);
    setCurrentJobStatus(null);
    setJobCheckpoint(null);
    
    try {
      localStorage.removeItem('atis_last_job_id');
      localStorage.removeItem('atis_last_job_status');
      localStorage.removeItem('atis_last_article');
    } catch {
      // ignore
    }
  }, [stopPolling]);

  // Auto-resume exactly once per provider mount. Completion is revalidated by the status API.
  const autoResumeStartedRef = useRef(false);
  useEffect(() => {
    if (autoResumeStartedRef.current) return;
    autoResumeStartedRef.current = true;
    try {
      const savedJobId = localStorage.getItem('atis_last_job_id');
      if (savedJobId) void resumeAnalysis(savedJobId);
    } catch {
      // ignore persistence failures
    }
  }, [resumeAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortAnalysis();
    };
  }, [abortAnalysis]);

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
