'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Article, Opportunity, QueryResult } from './types';
import type { Article as NewsArticle } from '@/types/article';
import type { Dashboard } from '@/types/dashboard';
import { normalizeATISNewsResponse, hasMeaningfulATISData } from './news-normalization';
import { DEFAULT_PERSPECTIVE, getCountryCode } from './perspective';
import { getNewsJobResult, getNewsJobStatus, processNewsArticle } from './api';

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
      setAnalysisError('We couldn\'t submit this analysis because the backend did not return a job ID.');
      setAnalysisLoading(false);
      return;
    }

    setAnalysisJobId(jobId);
    setAnalysisQueued(true);
    setAnalysisStatusText('Analysis submitted. The backend is processing your request.');
    try { localStorage.setItem('atis_active_news_job', JSON.stringify({ jobId, article, submittedAt: new Date().toISOString() })); } catch { /* optional persistence */ }

    let delay = 2000;
    const monitor = async (): Promise<void> => {
      const status = await getNewsJobStatus(jobId);
      const state = String(status.status ?? '').toLowerCase();
      setAnalysisStage(String(status.current_stage ?? status.stage ?? 'Processing'));
      setAnalysisStatusText(state === 'queued' ? 'Analysis queued...' : String(status.current_stage ?? status.stage ?? 'Analysis in progress...'));
      if (Array.isArray(status.completed_stages)) setAnalysisCompletedStages(status.completed_stages.filter((item): item is string => typeof item === 'string'));
      if (typeof status.progress === 'number') setAnalysisProgress(Math.min(99, Math.max(0, status.progress)));
      if (typeof status.position_in_queue === 'number') setAnalysisPositionInQueue(status.position_in_queue);
      if (state === 'failed' || state === 'error') throw new Error(String(status.error ?? status.detail ?? 'The analysis failed.'));
      if (state === 'cancelled' || state === 'canceled') throw new Error('The analysis was cancelled.');
      if (state === 'completed' || state === 'complete' || state === 'succeeded') {
        const result = normalizeATISNewsResponse(await getNewsJobResult(jobId));
        if (!hasMeaningfulATISData(result)) throw new Error('The completed analysis returned no usable intelligence data. Please try again.');
        setAnalysisQueued(false); setAnalysisProgress(100); setAnalysisStatusText('Analysis complete.'); setAnalysisLoading(false); setCurrentDashboard(result);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = 5000;
      return monitor();
    };
    void monitor().catch((error: unknown) => {
      setAnalysisError(error instanceof Error ? error.message : 'The analysis failed.');
      setAnalysisLoading(false);
      setAnalysisQueued(false);
    });
  }, [perspectiveCountry, perspectiveCountryCode]);



  const clearAnalysis = useCallback(() => {
    setCurrentNewsArticle(null);
    setAnalysisLoading(false);
    setAnalysisProgress(0);
    setAnalysisJobId(null);
    setAnalysisStatusText('');
    setAnalysisError(null);
    setAnalysisPartial(false);
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
