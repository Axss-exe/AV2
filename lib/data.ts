import {
  mockCountries,
  mockOpportunities,
  mockEntities,
  mockArticles,
  mockTraces,
  mockQueryHistory,
} from './mock-data';
import type { Country, Opportunity, Entity, Article, Trace, QueryHistory } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min = 200, max = 800): Promise<void> {
  return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}

function maybeThrow(): void {
  // 2% error rate — keeps error states testable without blocking normal use
  if (Math.random() < 0.02) {
    throw new Error('Connection to intelligence service interrupted. Displaying cached intelligence.');
  }
}

function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getCountries(): Promise<Country[]> {
  await randomDelay(200, 500);
  maybeThrow();
  return deepCopy(mockCountries);
}

export async function getCountry(id: string): Promise<Country | null> {
  await randomDelay(200, 400);
  maybeThrow();
  const country = mockCountries.find((c) => c.id === id);
  return country ? deepCopy(country) : null;
}

export async function getOpportunities(): Promise<Opportunity[]> {
  await randomDelay(300, 600);
  maybeThrow();
  return deepCopy(mockOpportunities);
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  await randomDelay(200, 400);
  maybeThrow();
  const opp = mockOpportunities.find((o) => o.id === id);
  return opp ? deepCopy(opp) : null;
}

export async function getEntities(): Promise<Entity[]> {
  await randomDelay(200, 500);
  maybeThrow();
  return deepCopy(mockEntities);
}

export async function getArticles(): Promise<Article[]> {
  await randomDelay(300, 600);
  maybeThrow();
  return deepCopy(mockArticles);
}

export async function getArticle(slug: string): Promise<Article | null> {
  await randomDelay(200, 400);
  maybeThrow();
  const article = mockArticles.find((a) => a.slug === slug);
  return article ? deepCopy(article) : null;
}

export async function getTracesByOpportunity(oppId: string): Promise<Trace[]> {
  await randomDelay(300, 700);
  maybeThrow();
  return deepCopy(mockTraces.filter((t) => t.opportunity_id === oppId));
}

export async function getQueryHistory(): Promise<QueryHistory[]> {
  await randomDelay(200, 400);
  maybeThrow();
  return deepCopy(mockQueryHistory);
}

export async function saveQuery(
  query: string,
  summary: string,
  stats: QueryHistory['stats']
): Promise<void> {
  await randomDelay(200, 400);
  // In production, this would persist to database
}
