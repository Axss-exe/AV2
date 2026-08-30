'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Article, Opportunity, QueryResult } from './types';
import type { Article as NewsArticle } from '@/types/article';
import type { Dashboard } from '@/types/dashboard';
import { normalizeATISNewsResponse, hasMeaningfulATISData } from './news-normalization';
import { DEFAULT_PERSPECTIVE, getCountryCode } from './perspective';
import { getNewsJobResult, getNewsJobStatus, processNewsArticle } from './api';
import type { NewsJobStatus } from './api';

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
  analysisJobId: string | null;
  analysisQueued: boolean;
  analysisStage: string;
  analysisCompletedStages: string[];
  analysisPositionInQueue?: number;
  analysisConnectionWarning: string | null;
  analysisError: string | null;
  analysisPartial: boolean;
  currentDashboard: Dashboard | null;
  runAnalysis: (article: NewsArticle) => Promise<void>;
  clearAnalysis: () => void;
}

const ATISContext = createContext<ATISContextType | null>(null);

const STATUS_MESSAGES = [
  'Extracting intelligence...',
  'Mapping the event against the knowledge graph...',
  'Solving strategic constraints...',
  'Formatting intelligence dashboard...',
];

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

  // News analysis
  const [currentNewsArticle, setCurrentNewsArticle] = useState<NewsArticle | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState('');
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [analysisQueued, setAnalysisQueued] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisCompletedStages, setAnalysisCompletedStages] = useState<string[]>([]);
  const [analysisPositionInQueue, setAnalysisPositionInQueue] = useState<number | undefined>();
  const [analysisConnectionWarning, setAnalysisConnectionWarning] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisPartial, setAnalysisPartial] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);

  const addQueryToHistory = useCallback((result: QueryResult) => {
    setQueryHistory((prev) => [result, ...prev]);
  }, []);

  const removeQueryFromHistory = useCallback((query: string) => {
    setQueryHistory((prev) => prev.filter((r) => r.query !== query));
  }, []);

  const runAnalysis = useCallback(async (article: NewsArticle) => {
    setCurrentNewsArticle(article);
    setAnalysisLoading(true);
    setAnalysisProgress(0);
    setAnalysisError(null);
    setAnalysisPartial(false);
    setCurrentDashboard(null);

    setAnalysisStatusText('Submitting analysis request...');
    setAnalysisStage('Submitting');
    setAnalysisCompletedStages([]);
    setAnalysisQueued(false);
    setAnalysisConnectionWarning(null);

    let submitted: Awaited<ReturnType<typeof processNewsArticle>>;
    try {
      submitted = await processNewsArticle({
        article_text: article.article_text,
        perspective_country: perspectiveCountry,
        perspective_country_code: perspectiveCountryCode,
      });
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Unable to submit analysis.');
      setAnalysisLoading(false);
      return;
    }
    const jobId = 'job_id' in submitted && typeof submitted.job_id === 'string' ? submitted.job_id : null;

    if (!jobId) {
      const dashboard = normalizeATISNewsResponse(submitted);
      if (!hasMeaningfulATISData(dashboard)) throw new Error('The analysis returned no usable intelligence data. Please try again.');
      setAnalysisProgress(100);
      setAnalysisStatusText('Analysis complete.');
      setAnalysisLoading(false);
      setCurrentDashboard(dashboard);
      return;
    }

    setAnalysisJobId(jobId);
    setAnalysisQueued(true);
    try { localStorage.setItem('atis_active_news_job', JSON.stringify({ jobId, article, submittedAt: new Date().toISOString() })); } catch { /* optional persistence */ }

    let delay = 2000;
    let transientFailures = 0;
    const poll = async (): Promise<void> => {
      const status: NewsJobStatus = await getNewsJobStatus(jobId);
      const normalizedStatus = String(status.status ?? '').toLowerCase();
      if (normalizedStatus === 'failed' || normalizedStatus === 'error') throw new Error(status.error ?? status.detail ?? 'The intelligence pipeline could not complete this analysis.');
      if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') throw new Error('Analysis cancelled.');
      const progress = typeof status.progress === 'number' ? Math.min(99, Math.max(0, status.progress)) : Math.min(95, analysisProgress + 4);
      setAnalysisProgress(progress);
      setAnalysisStage(status.current_stage ?? status.stage ?? (normalizedStatus === 'queued' ? 'Waiting for processing' : 'Processing intelligence'));
      setAnalysisStatusText(normalizedStatus === 'queued' ? 'Analysis queued. Waiting for processing...' : status.current_stage ?? status.stage ?? 'Processing intelligence...');
      setAnalysisCompletedStages(Array.isArray(status.completed_stages) ? status.completed_stages : []);
      setAnalysisPositionInQueue(status.position_in_queue);
      if (normalizedStatus === 'completed' || normalizedStatus === 'complete' || normalizedStatus === 'succeeded') {
        const result = normalizeATISNewsResponse(await getNewsJobResult(jobId));
        if (!hasMeaningfulATISData(result)) throw new Error('The analysis completed without usable intelligence data.');
        setAnalysisQueued(false); setAnalysisProgress(100); setAnalysisStatusText('Analysis complete.'); setAnalysisLoading(false); setCurrentDashboard(result);
        try { localStorage.removeItem('atis_active_news_job'); } catch { /* optional persistence */ }
        return;
      }
      setAnalysisQueued(normalizedStatus === 'queued');
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = 5000;
      await poll();
    };

    try {
      await poll();
    } catch (error) {
      transientFailures += 1;
      if (transientFailures < 3) {
        setAnalysisConnectionWarning('Connection temporarily unavailable. We\'ll keep trying.');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await poll();
      } else {
        setAnalysisError(error instanceof Error ? error.message : 'An unexpected error occurred.');
        setAnalysisLoading(false);
      }
    }
  }, [perspectiveCountry, perspectiveCountryCode]);

  // Reconnect to a backend-owned job after a browser refresh.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const saved = JSON.parse(localStorage.getItem('atis_active_news_job') ?? 'null') as { jobId?: string; article?: NewsArticle } | null;
      if (!saved?.jobId) return () => { cancelled = true; };
      setAnalysisJobId(saved.jobId); setCurrentNewsArticle(saved.article ?? null); setAnalysisLoading(true); setAnalysisQueued(true);
      const reconnect = async (): Promise<void> => {
        if (cancelled) return;
        try {
          const status = await getNewsJobStatus(saved.jobId!);
          const state = String(status.status ?? '').toLowerCase();
          if (state === 'completed' || state === 'complete' || state === 'succeeded') {
            const result = normalizeATISNewsResponse(await getNewsJobResult(saved.jobId!));
            if (!cancelled) { setCurrentDashboard(result); setAnalysisProgress(100); setAnalysisLoading(false); setAnalysisQueued(false); setAnalysisStatusText('Analysis complete.'); }
            localStorage.removeItem('atis_active_news_job'); return;
          }
          if (state === 'failed' || state === 'error' || state === 'cancelled') { if (!cancelled) { setAnalysisError(status.error ?? status.detail ?? 'The analysis is no longer available.'); setAnalysisLoading(false); } return; }
          if (!cancelled) { setAnalysisStage(status.current_stage ?? status.stage ?? 'Processing intelligence'); setAnalysisProgress(status.progress ?? 0); setAnalysisCompletedStages(status.completed_stages ?? []); }
          timer = setTimeout(reconnect, 5000);
        } catch { if (!cancelled) { setAnalysisConnectionWarning("Connection temporarily unavailable. We'll keep trying."); timer = setTimeout(reconnect, 5000); } }
      };
      void reconnect();
    } catch { /* storage is optional */ }
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, []);

  const clearAnalysis = useCallback(() => {
    setCurrentNewsArticle(null);
    setAnalysisLoading(false);
    setAnalysisProgress(0);
    setAnalysisJobId(null);
    setAnalysisStatusText('');
    setAnalysisError(null);
    setAnalysisPartial(false);
    setAnalysisJobId(null);
    setAnalysisQueued(false);
    setAnalysisStage('');
    setAnalysisCompletedStages([]);
    setAnalysisPositionInQueue(undefined);
    setAnalysisConnectionWarning(null);
    setCurrentDashboard(null);
    try { localStorage.removeItem('atis_active_news_job'); } catch { /* optional persistence */ }
  }, []);

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
        analysisJobId,
        analysisQueued,
        analysisStage,
        analysisCompletedStages,
        analysisPositionInQueue,
        analysisConnectionWarning,
        analysisError,
        analysisPartial,
        currentDashboard,
        runAnalysis,
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
