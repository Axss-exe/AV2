'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  runAnalysis: (article: NewsArticle) => Promise<void>;
  clearAnalysis: () => void;
}

const ATISContext = createContext<ATISContextType | null>(null);

const STATUS_MESSAGES = [
  'Running constraint analysis...',
  'Extracting entities...',
  'Solving equilibrium...',
  'Formatting dashboard...',
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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
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
    setCurrentDashboard(null);

    // Animate progress over 60s while the API runs
    let elapsed = 0;
    const TOTAL = 60;
    const TICK = 500;
    let messageIndex = 0;
    setAnalysisStatusText(STATUS_MESSAGES[0]);

    const timer = setInterval(() => {
      elapsed += TICK / 1000;
      const pct = Math.min(98, (elapsed / TOTAL) * 100);
      setAnalysisProgress(pct);
      const newIndex = Math.floor((elapsed / TOTAL) * STATUS_MESSAGES.length);
      if (newIndex !== messageIndex && newIndex < STATUS_MESSAGES.length) {
        messageIndex = newIndex;
        setAnalysisStatusText(STATUS_MESSAGES[messageIndex]);
      }
    }, TICK);

    const MAX_RETRIES = 10;
    const RETRY_DELAY = 5000;

    const attempt = async (): Promise<Dashboard> => {
      for (let i = 0; i < MAX_RETRIES; i++) {
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            article_text: article.article_text,
            perspective_country: perspectiveCountry,
            perspective_country_code: perspectiveCountryCode,
          }),
        });

        const json = await res.json();

        // Handle busy response — retry
        if (json.status === 'busy' || res.status === 503) {
          if (i < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
            continue;
          }
          throw new Error('Analysis engine is busy. Please try again in a moment.');
        }

        if (!res.ok) {
          throw new Error(json.detail ?? json.error ?? `Request failed (${res.status})`);
        }

        // Unwrap { status, data: {...} } or flat shape
        const dashboard: Dashboard = json.data ?? json;
        return dashboard;
      }
      throw new Error('Max retries exceeded. Please try again.');
    };

    try {
      const dashboard = await attempt();
      clearInterval(timer);
      setAnalysisProgress(100);
      setAnalysisStatusText('Analysis complete.');
      setCurrentDashboard(dashboard);
    } catch (err) {
      clearInterval(timer);
      setAnalysisError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setAnalysisLoading(false);
    }
  }, [perspectiveCountry, perspectiveCountryCode]);

  const clearAnalysis = useCallback(() => {
    setCurrentNewsArticle(null);
    setAnalysisLoading(false);
    setAnalysisProgress(0);
    setAnalysisStatusText('');
    setAnalysisError(null);
    setCurrentDashboard(null);
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
        analysisError,
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
