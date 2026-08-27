/**
 * Deterministic mapping layer: QueryResult (the shape stored in context and
 * history — persists across a fresh query AND a history revisit) -> the
 * richer view-model consumed by the Query workspace components.
 *
 * Every field here is derived from a real backend value that was captured
 * into QueryResult's additive fields in app/query/page.tsx's
 * mapAPIResponseToQueryResult(). Nothing is fabricated. Where data doesn't
 * exist, the corresponding view-model field is simply omitted/empty.
 */

import type { QueryResult, OpportunityCited } from './types';
import { PERSPECTIVE_COUNTRIES } from './perspective';

export interface CitedItem {
  text: string;
  sourceNodes: string[];
  /** Highest-priority match found among structured intelligence rows whose
   *  entity/source_node is in sourceNodes. Undefined if nothing resolves —
   *  never guessed. */
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
}

export type ValidOpportunity = OpportunityCited;

export interface ResearchRequiredInfo {
  isResearchRequired: boolean;
  emptyCategories: string[]; // e.g. ['findings', 'opportunities', 'risks']
}

export interface IntelligenceViewModel {
  query: string;
  shortAnswer: string;
  fullAnswer: string;
  hasMoreThanShort: boolean;

  perspectiveCountry?: string;
  perspectiveCountryCode?: string;
  sourceCountries: string[]; // countries in intent.countries other than the perspective country

  cached?: boolean;
  elapsedSeconds?: number;

  intentType?: string;

  findings: CitedItem[];
  opportunities: ValidOpportunity[];
  risks: CitedItem[];

  filterStats?: {
    vaultTotal?: number;
    candidatesAfterBroadFilter?: number;
    rankedByLlm?: number;
  };

  research: ResearchRequiredInfo;
}

/** Convert an ISO 3166-1 alpha-2 code to a flag emoji. Presentational only —
 *  the code itself always comes from real data (backend echo or the static
 *  perspective-country list already used by the perspective selector). */
export function flagFor(countryName?: string, explicitCode?: string): string {
  let code = explicitCode;
  if (!code && countryName) {
    const found = PERSPECTIVE_COUNTRIES.find(
      (c) => c.name.toLowerCase() === countryName.trim().toLowerCase()
    );
    code = found?.code;
  }
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  const codePoints = [...upper].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/** Split on the first sentence boundary. Deterministic, not fabricated. */
function splitFirstSentence(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?[.!?])(\s+|$)/);
  if (!match) return { first: trimmed, rest: '' };
  const first = match[1];
  const rest = trimmed.slice(match[0].length).trim();
  return { first, rest };
}

const PRIORITY_RANK: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function resolveSeverity(
  sourceNodes: string[] | undefined,
  intelRows: { source?: string; last_updated?: string; confidence?: string }[]
): CitedItem['severity'] {
  if (!sourceNodes || sourceNodes.length === 0) return undefined;
  let best: string | undefined;
  for (const node of sourceNodes) {
    // tableRows (IntelTableRow) stores entity name in `source` and priority in `confidence`
    const row = intelRows.find((r) => r.source === node);
    if (row?.confidence && PRIORITY_RANK[row.confidence] !== undefined) {
      if (!best || PRIORITY_RANK[row.confidence] > PRIORITY_RANK[best]) {
        best = row.confidence;
      }
    }
  }
  return best as CitedItem['severity'];
}

/** Backend placeholder strings observed in the real no-match/empty state — used
 *  only to detect that state, never displayed verbatim as invented reasoning. */
const NO_MATCH_MARKERS = ['no matching entities found', 'consider expanding the vault', 'incomplete data coverage'];

function isPlaceholder(text?: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return NO_MATCH_MARKERS.some((m) => lower.includes(m));
}

export function buildIntelligenceViewModel(result: QueryResult): IntelligenceViewModel {
  const intelRows = Array.isArray(result.tableRows) ? result.tableRows : [];

  const rawSummary = result.summary ?? 'Intelligence analysis complete.';
  const { first, rest } = splitFirstSentence(rawSummary);

  const findingsCited = Array.isArray(result.findingsCited) ? result.findingsCited : [];
  const findings: CitedItem[] =
    findingsCited.length > 0
      ? findingsCited
          .filter((f) => f.text && !isPlaceholder(f.text))
          .map((f) => ({
            text: f.text,
            sourceNodes: f.sourceNodes ?? [],
            severity: resolveSeverity(f.sourceNodes, intelRows),
          }))
      : (result.findings ?? [])
          .filter((t) => !isPlaceholder(t))
          .map((t) => ({ text: t, sourceNodes: [] as string[], severity: undefined }));

  const opportunitiesCited = Array.isArray(result.opportunitiesCited) ? result.opportunitiesCited : [];
  const opportunities: ValidOpportunity[] = opportunitiesCited.filter(
    (o) => o.title && o.title.trim().length > 0 && !isPlaceholder(o.title) && !isPlaceholder(o.justification)
  );

  const risksCited = Array.isArray(result.risksCited) ? result.risksCited : [];
  const risks: CitedItem[] =
    risksCited.length > 0
      ? risksCited
          .filter((r) => r.text && !isPlaceholder(r.text))
          .map((r) => ({
            text: r.text,
            sourceNodes: r.sourceNodes ?? [],
            severity: resolveSeverity(r.sourceNodes, intelRows),
          }))
      : (result.riskFactors ?? [])
          .filter((t) => !isPlaceholder(t))
          .map((t) => ({ text: t, sourceNodes: [] as string[], severity: undefined }));

  const keyEntitiesEmpty = !Array.isArray(result.keyEntities) || result.keyEntities.length === 0;
  const intelEmpty = intelRows.length === 0;
  const rankedByLlmZero = result.filterStats?.rankedByLlm === 0;
  const findingsPlaceholder = (result.findings ?? []).some(isPlaceholder);
  const hasMeaningfulIntelligence = Boolean(rawSummary.trim())
    || !keyEntitiesEmpty
    || !intelEmpty
    || findings.length > 0
    || opportunities.length > 0
    || risks.length > 0;
  const isResearchRequired = !hasMeaningfulIntelligence || (rankedByLlmZero && !hasMeaningfulIntelligence) || (findingsPlaceholder && !hasMeaningfulIntelligence);

  const emptyCategories: string[] = [];
  if (findings.length === 0) emptyCategories.push('findings');
  if (opportunities.length === 0) emptyCategories.push('opportunities');
  if (risks.length === 0) emptyCategories.push('risks');

  const perspectiveCountry = result.perspective?.country ?? result.intent?.perspectiveCountry;
  const perspectiveCountryCode = result.perspective?.countryCode ?? result.intent?.perspectiveCountryCode;
  const sourceCountries = (result.intent?.countries ?? []).filter(
    (c) => c.toLowerCase() !== (perspectiveCountry ?? '').toLowerCase()
  );

  return {
    query: result.query,
    shortAnswer: first,
    fullAnswer: rest,
    hasMoreThanShort: rest.length > 0,
    perspectiveCountry,
    perspectiveCountryCode,
    sourceCountries,
    cached: result.cached,
    elapsedSeconds: result.elapsedSeconds,
    intentType: result.intent?.type,
    findings,
    opportunities,
    risks,
    filterStats: result.filterStats,
    research: { isResearchRequired, emptyCategories },
  };
}
