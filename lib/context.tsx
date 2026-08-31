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

// Terminal states where polling should stop
const TERMINAL_STATES = new Set(['COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED']);

// Non-terminal states where polling should continue
const PROCESSING_STATES = new Set(['QUEUED', 'PROCESSING']);

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
  
  // Polling interval ref for cleanup
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addQueryToHistory = useCallback((result: QueryResult) => {
    setQueryHistory((prev) => [result, ...prev]);
  }, []);

  const removeQueryFromHistory = useCallback((query: string) => {
    setQueryHistory((prev) => prev.filter((r) => r.query !== query));
  }, []);

  // Stop polling and cleanup
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/news/status/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current?.signal,
      });

      if (!res.ok) {
        throw new Error(`Status request failed (${res.status})`);
      }

      const json = await res.json();
      const normalizedStatus = normalizeStatus(json.status || json.job_status || '');
      
      // Update job status and checkpoint
      setCurrentJobStatus(normalizedStatus);
      setJobCheckpoint(json.checkpoint || null);

      // Calculate progress from completed stages if available
      if (json.checkpoint?.completed_stages) {
        const progress = calculateProgressFromStages(json.checkpoint.completed_stages);
        setAnalysisProgress(progress);
      }

      // Update status text based on current stage
      if (json.checkpoint?.current_stage) {
        const stageLabel = STAGE_LABELS[json.checkpoint.current_stage.toUpperCase()] || 
          json.checkpoint.current_stage;
        setAnalysisStatusText(`Stage: ${stageLabel}`);
      } else if (normalizedStatus === 'QUEUED') {
        setAnalysisStatusText('Job queued - waiting for processing to start');
      } else if (normalizedStatus === 'PROCESSING') {
        setAnalysisStatusText('Processing intelligence analysis');
      }

      // Check if job is complete
      if (normalizedStatus === 'COMPLETED') {
        stopPolling();
        // Fetch the result
        await fetchJobResult(jobId);
        return;
      }

      // Check for terminal failure states
      if (TERMINAL_STATES.has(normalizedStatus)) {
        stopPolling();
        if (normalizedStatus === 'FAILED') {
          setAnalysisError('Backend processing failed. Please try again.');
          setAnalysisLoading(false);
        } else if (normalizedStatus === 'PARTIAL') {
          // Try to fetch partial result
          await fetchJobResult(jobId);
        } else if (normalizedStatus === 'CANCELLED') {
          setAnalysisLoading(false);
          setAnalysisStatusText('Analysis cancelled');
        }
        return;
      }

      // Continue polling for non-terminal states
      return normalizedStatus;

    } catch (err) {
      // Network error - continue polling
      console.warn('Job status polling failed, will retry:', err);
      return null;
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

      const json = await res.json();
      const normalizedStatus = normalizeStatus(json.status || '');

      // Handle the result response
      if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'PARTIAL') {
        // Extract the dashboard data
        const resultData = json.data ?? json;
        
        // Validate that we have meaningful intelligence data
        const dashboard = normalizeDashboardData(resultData);
        
        if (!hasMeaningfulDashboardData(dashboard)) {
          if (normalizedStatus === 'PARTIAL') {
            setAnalysisStatusText('Partial result - some intelligence available');
          } else {
            throw new Error('The analysis returned no usable intelligence data. Please try again.');
          }
        }

        setCurrentDashboard(dashboard);
        setAnalysisProgress(100);
        setAnalysisStatusText(normalizedStatus === 'PARTIAL' 
          ? 'Partial analysis complete'
          : 'Analysis complete');
        setAnalysisLoading(false);
        
        // Persist completed job ID for recovery
        try {
          localStorage.setItem('atis_last_job_id', jobId);
          localStorage.setItem('atis_last_job_status', normalizedStatus);
        } catch {
          // ignore persistence failure
        }

        return dashboard;
      }

      throw new Error(`Unexpected result status: ${json.status}`);

    } catch (err) {
      stopPolling();
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis result';
      setAnalysisError(errorMessage);
      setAnalysisLoading(false);
      throw err;
    }
  }, [stopPolling]);

  // Normalize backend dashboard data to frontend Dashboard type
  function normalizeDashboardData(data: Record<string, unknown>): Dashboard {
    const pm = data.pipeline_metadata as Record<string, unknown> | undefined;
    return {
      intelligence_id: String(data.intelligence_id ?? data.job_id ?? ''),
      trigger_event: String(data.trigger_event ?? data.core_event ?? ''),
      market_equilibrium_shift: String(data.market_equilibrium_shift ?? ''),
      opportunities: Array.isArray(data.opportunities) 
        ? data.opportunities.map((opp: unknown) => {
            const o = opp as Record<string, unknown>;
            const cf = o.capital_flow as Record<string, unknown> | undefined;
            return {
              opportunity_id: String(o.id ?? o.opportunity_id ?? ''),
              title: String(o.title ?? ''),
              type: String(o.type ?? 'Primary'),
              urgency_score: Number(o.urgency_score ?? o.urgency ?? 0),
              feasibility_score: Number(o.feasibility_score ?? o.feasibility ?? 0),
              required_missing_nodes: Array.isArray(o.required_missing_nodes) 
                ? o.required_missing_nodes as string[]
                : [],
              capital_flow: {
                beneficiary: String(cf?.beneficiary ?? ''),
                likely_funder: String(cf?.likely_funder ?? ''),
              },
              justification: String(o.justification ?? ''),
            };
          })
        : [],
      pipeline_metadata: {
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

      const submitJson = await submitRes.json();
      const normalizedStatus = normalizeStatus(submitJson.status || '');

      // Extract job_id from response - try multiple possible locations
      // Backend may return: {job_id: "..."} or {id: "..."} or {data: {job_id: "..."}}
      // Also check nested structures
      const jobId = 
        submitJson.job_id ||
        submitJson.id ||
        submitJson.data?.job_id ||
        submitJson.data?.id ||
        submitJson.result?.job_id ||
        submitJson.result?.id ||
        submitJson.response?.job_id ||
        submitJson.response?.id;
      
      if (!jobId) {
        console.error('Submission response:', submitJson);
        throw new Error('No job ID returned from submission');
      }

      setCurrentJobId(jobId);
      setCurrentJobStatus(normalizedStatus);

      // Persist job ID for recovery on page refresh
      try {
        localStorage.setItem('atis_last_job_id', jobId);
        localStorage.setItem('atis_last_job_status', normalizedStatus);
        localStorage.setItem('atis_last_article', JSON.stringify(article));
      } catch {
        // ignore persistence failure
      }

      // STEP 2: Check if already complete
      if (normalizedStatus === 'COMPLETED') {
        setAnalysisStatusText('Job completed - fetching result...');
        await fetchJobResult(jobId);
        return;
      }

      // STEP 3: Check for immediate failure
      if (normalizedStatus === 'FAILED') {
        throw new Error(submitJson.message || 'Job submission failed');
      }

      // STEP 4: For queued/processing, start polling
      if (PROCESSING_STATES.has(normalizedStatus) || normalizedStatus === '') {
        setAnalysisStatusText('Job queued - waiting for processing...');
        setAnalysisProgress(0);

        // Start polling immediately, then every 2-3 seconds
        const POLL_INTERVAL = 2500; // 2.5 seconds
        
        pollIntervalRef.current = setInterval(async () => {
          try {
            const status = await pollJobStatus(jobId);
            
            // If polling returned a terminal state, stop
            if (status && TERMINAL_STATES.has(normalizeStatus(status))) {
              stopPolling();
            }
          } catch (err) {
            console.warn('Polling error:', err);
          }
        }, POLL_INTERVAL);

        // Initial poll right away
        await pollJobStatus(jobId);
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

  // Cancel analysis
  const cancelAnalysis = useCallback(async () => {
    if (!currentJobId) return;

    try {
      stopPolling();
      
      // Call cancel endpoint
      await fetch(`/api/news/cancel/${currentJobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setAnalysisLoading(false);
      setCurrentJobStatus('CANCELLED');
      setAnalysisStatusText('Analysis cancelled');
      setAnalysisError(null);
      
      // Clean up
      try {
        localStorage.removeItem('atis_last_job_id');
        localStorage.removeItem('atis_last_job_status');
      } catch {
        // ignore
      }

    } catch (err) {
      console.error('Failed to cancel analysis:', err);
      setAnalysisError('Failed to cancel analysis. Please try again.');
    }
  }, [currentJobId, stopPolling]);

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
      // Check current status
      const status = await pollJobStatus(jobId);
      
      if (TERMINAL_STATES.has(normalizeStatus(status || ''))) {
        // If already complete, fetch result
        if (normalizeStatus(status || '') === 'COMPLETED' || normalizeStatus(status || '') === 'PARTIAL') {
          await fetchJobResult(jobId);
        }
        // If failed or cancelled, show appropriate state
        else if (normalizeStatus(status || '') === 'FAILED') {
          setAnalysisError('Previous analysis failed. Please try again.');
          setAnalysisLoading(false);
        } else if (normalizeStatus(status || '') === 'CANCELLED') {
          setAnalysisStatusText('Analysis was cancelled');
          setAnalysisLoading(false);
        }
      } else {
        // Still processing - start polling
        const POLL_INTERVAL = 2500;
        pollIntervalRef.current = setInterval(async () => {
          try {
            await pollJobStatus(jobId);
          } catch (err) {
            console.warn('Polling error:', err);
          }
        }, POLL_INTERVAL);
      }

    } catch (err) {
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

  // Auto-resume on mount if there's a persisted job
  useEffect(() => {
    try {
      const savedJobId = localStorage.getItem('atis_last_job_id');
      const savedStatus = localStorage.getItem('atis_last_job_status');
      
      if (savedJobId && !TERMINAL_STATES.has(normalizeStatus(savedStatus || ''))) {
        // Job is still active, resume it
        resumeAnalysis(savedJobId);
      } else if (savedJobId && savedStatus && TERMINAL_STATES.has(normalizeStatus(savedStatus))) {
        // Job is complete, we might want to fetch the result
        // But only if we don't already have a dashboard
        if (!currentDashboard) {
          resumeAnalysis(savedJobId);
        }
      }
    } catch {
      // ignore
    }
  }, [currentDashboard, resumeAnalysis]);

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
