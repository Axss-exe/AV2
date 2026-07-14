import type { QueryResult, GraphNode, IntelTableRow } from './types';
import { mockCountries, mockOpportunities, mockEntities, mockTraces } from './mock-data';

function generateGraphNodes(query: string): GraphNode[] {
  const q = query.toLowerCase();
  const nodes: GraphNode[] = [];

  // Always add a hub node for the query topic
  let hubLabel = 'Query Hub';
  if (q.includes('kenya')) hubLabel = 'Kenya';
  else if (q.includes('nigeria')) hubLabel = 'Nigeria';
  else if (q.includes('ghana')) hubLabel = 'Ghana';
  else if (q.includes('tanzania')) hubLabel = 'Tanzania';
  else if (q.includes('ethiopia')) hubLabel = 'Ethiopia';
  else if (q.includes('rwanda')) hubLabel = 'Rwanda';
  else if (q.includes('uganda')) hubLabel = 'Uganda';
  else if (q.includes('opp-002') || q.includes('agri') || q.includes('machinery')) hubLabel = 'OPP-002';
  else if (q.includes('opp-003') || q.includes('logistics')) hubLabel = 'OPP-003';
  else if (q.includes('opp-004') || q.includes('energy') || q.includes('solar')) hubLabel = 'OPP-004';
  else if (q.includes('opp-005') || q.includes('pharma')) hubLabel = 'OPP-005';
  else if (q.includes('eac') || q.includes('corridor')) hubLabel = 'EAC Corridor';

  nodes.push({ id: 'hub', label: hubLabel, type: 'hub', x: 280, y: 114 });

  // Surrounding entity nodes based on context
  const entityPool: { label: string; type: GraphNode['type']; x: number; y: number }[] = [];

  if (q.includes('kenya') || q.includes('agri') || q.includes('machinery') || q.includes('opp-002')) {
    entityPool.push(
      { label: 'KEBS', type: 'entity', x: 50, y: 50 },
      { label: 'EAC Secretariat', type: 'entity', x: 520, y: 50 },
      { label: 'Mombasa Port', type: 'entity', x: 50, y: 180 },
      { label: 'AGRA Fund', type: 'partner', x: 520, y: 180 },
      { label: 'Currency Risk', type: 'risk', x: 280, y: 10 },
    );
  } else if (q.includes('logistics') || q.includes('corridor') || q.includes('opp-003')) {
    entityPool.push(
      { label: 'KESWS', type: 'entity', x: 50, y: 50 },
      { label: 'KRA', type: 'entity', x: 520, y: 50 },
      { label: 'Malaba OSBP', type: 'entity', x: 50, y: 180 },
      { label: 'RRA (Rwanda)', type: 'partner', x: 520, y: 180 },
      { label: 'API Gap', type: 'risk', x: 280, y: 10 },
    );
  } else if (q.includes('nigeria') || q.includes('energy') || q.includes('solar') || q.includes('opp-004')) {
    entityPool.push(
      { label: 'NERC', type: 'entity', x: 50, y: 50 },
      { label: 'PURC Ghana', type: 'entity', x: 520, y: 50 },
      { label: 'EPRA Kenya', type: 'entity', x: 50, y: 180 },
      { label: 'IFC / AfDB', type: 'partner', x: 520, y: 180 },
      { label: 'FX Risk', type: 'risk', x: 280, y: 10 },
    );
  } else if (q.includes('pharma') || q.includes('opp-005') || q.includes('distribution')) {
    entityPool.push(
      { label: 'NAFDAC', type: 'entity', x: 50, y: 50 },
      { label: 'FDA Ghana', type: 'entity', x: 520, y: 50 },
      { label: 'Rwanda FDA', type: 'entity', x: 50, y: 180 },
      { label: 'UNICEF Supply', type: 'partner', x: 520, y: 180 },
      { label: 'Cold Chain Gap', type: 'risk', x: 280, y: 10 },
    );
  } else {
    entityPool.push(
      { label: 'EAC Secretariat', type: 'entity', x: 50, y: 50 },
      { label: 'AfDB', type: 'entity', x: 520, y: 50 },
      { label: 'Regional Banks', type: 'entity', x: 50, y: 180 },
      { label: 'Donor Partners', type: 'partner', x: 520, y: 180 },
      { label: 'Political Risk', type: 'risk', x: 280, y: 10 },
    );
  }

  entityPool.forEach((n, i) => nodes.push({ ...n, id: `n${i}` }));
  return nodes;
}

function generateEdges(nodes: GraphNode[]): { from: string; to: string; label: string }[] {
  const hub = nodes.find((n) => n.type === 'hub');
  if (!hub) return [];
  return nodes
    .filter((n) => n.id !== 'hub')
    .map((n, i) => ({
      from: 'hub',
      to: n.id,
      label: ['REG', 'PROC', 'FUND', 'RISK', 'PART'][i % 5],
    }));
}

function generateTableRows(query: string): IntelTableRow[] {
  const q = query.toLowerCase();
  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const baseRows: IntelTableRow[] = [
    { source: 'EAC Trade Portal', relationship: 'POLICY:EAC-CET → TARIFF:ZERO', confidence: '94%', status: 'Validated', last_updated: now },
    { source: 'Local Partner Network', relationship: 'PARTNER:LOCAL → DISTRIBUTION', confidence: '71%', status: 'External', last_updated: now },
    { source: 'Regulatory Authority DB', relationship: 'REG:CERT → IMPORT:APPROVAL', confidence: '88%', status: 'Validated', last_updated: now },
    { source: 'Market Intelligence Report', relationship: 'MARKET:SIZE → SEGMENT:TARGET', confidence: '65%', status: 'External', last_updated: now },
    { source: 'Legal Opinion 2026', relationship: 'LEGAL:FRAMEWORK → COMPLIANCE', confidence: '82%', status: 'Validated', last_updated: now },
  ];

  if (q.includes('gap') || q.includes('risk')) {
    baseRows.push(
      { source: 'Gap Analysis Report', relationship: 'GAP:REGULATORY → STATUS:UNKNOWN', confidence: '—', status: 'Gap', last_updated: now },
      { source: 'Risk Assessment', relationship: 'RISK:FX → EXPOSURE:HIGH', confidence: '—', status: 'Gap', last_updated: now },
    );
  } else {
    baseRows.push(
      { source: 'Development Finance Inst.', relationship: 'FUNDING:DFI → FACILITY:CREDIT', confidence: '79%', status: 'Validated', last_updated: now },
    );
  }

  return baseRows.slice(0, 7);
}

function generateStats(query: string): QueryResult['stats'] {
  const q = query.toLowerCase();
  if (q.includes('opp-002') || q.includes('agri')) return { traces: 18, nodes: 10, concepts: 15, entities: 7, validated: '92%' };
  if (q.includes('opp-003') || q.includes('logistics')) return { traces: 9, nodes: 6, concepts: 8, entities: 4, validated: '85%' };
  if (q.includes('opp-004') || q.includes('energy')) return { traces: 11, nodes: 7, concepts: 9, entities: 6, validated: '72%' };
  if (q.includes('opp-005') || q.includes('pharma')) return { traces: 16, nodes: 9, concepts: 11, entities: 8, validated: '83%' };
  if (q.includes('kenya')) return { traces: 14, nodes: 8, concepts: 12, entities: 5, validated: '78%' };
  if (q.includes('nigeria')) return { traces: 11, nodes: 7, concepts: 10, entities: 5, validated: '74%' };
  return { traces: 12, nodes: 7, concepts: 10, entities: 5, validated: '76%' };
}

function generateSummary(query: string): string {
  const q = query.toLowerCase();
  const country = mockCountries.find((c) => q.includes(c.name.toLowerCase()));
  const opp = mockOpportunities.find((o) => q.includes(o.id.toLowerCase()) || q.includes(o.title.toLowerCase().split(' ')[0]));

  if (opp) {
    return `Intelligence analysis for ${opp.title} reveals a ${opp.validation_score} validated opportunity across ${opp.markets.join(', ')} markets. Key pathways confirmed through regulatory and trade databases. Critical path items: ${opp.operational_roadmap[0]?.milestone ?? 'regulatory approval'}. Transaction perimeter estimated at ${opp.value} over ${opp.duration}.`;
  }

  if (country) {
    const intel = country.trade_intel.slice(0, 2).join('; ');
    const risk = country.risks[0];
    return `${country.name} intelligence brief: GDP ${country.gdp} (${country.gdp_growth} growth), capital ${country.capital}. Key trade factors: ${intel}. Primary risk signal: ${risk}. Cross-border trade opportunities validated against EAC and ECOWAS frameworks.`;
  }

  return `Comprehensive intelligence sweep across 7 monitored African markets. Analysis cross-referenced ${generateStats(query).traces} trace sources and ${generateStats(query).entities} registered entities. Validation rate of ${generateStats(query).validated} achieved against primary data sources. Actionable intelligence prepared for analyst review.`;
}

function generateFindings(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('kenya') || q.includes('agri') || q.includes('opp-002')) {
    return ['KEBS type-approval mandatory for all machinery >15kW', 'EAC zero-tariff applies to HS Chapter 84', 'AGRA fund: $34M disbursed to East African networks', 'Elgon Kenya: 340 agrodealer points, exclusive JD deal expires Q4'];
  }
  if (q.includes('logistics') || q.includes('opp-003')) {
    return ['Malaba OSBP average clearance: 67 minutes', 'KESWS API available for pre-clearance', 'RRA integration scheduled Q3 2026', 'COMESA Yellow Card covers 14 member states'];
  }
  if (q.includes('energy') || q.includes('opp-004')) {
    return ['NERC mini-grid license: 60-day processing', 'C&I solar market: $640M annual addressable', 'IRR range: 18–24% for Nigerian projects', 'Ghana storage regulation remains a gray area'];
  }
  if (q.includes('pharma') || q.includes('opp-005')) {
    return ['NAFDAC timeline: 6–12 months', 'WHO GDP cold chain +2°C to +8°C required', 'Ghana FDA GDP framework now aligned to EU standards', 'Rwanda FDA: 2–3 inspections/quarter capacity'];
  }
  return ['AfCFTA implementation reducing intra-Africa tariffs', 'EAC SCT bonded carrier certification available', 'DFI co-financing opportunities identified', 'Regulatory harmonization advancing across EAC'];
}

function generateOpportunityLabels(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('kenya') || q.includes('agri')) return ['OPP-002: Agricultural Machinery ($42M)', 'OPP-003: Cross-Border Logistics ($28M)', 'AGRA co-investment facility open'];
  if (q.includes('energy') || q.includes('nigeria')) return ['OPP-004: Renewable Energy Grid ($85M)', 'C&I solar: 18–24% IRR', 'Dangote zone power demand growing'];
  if (q.includes('pharma')) return ['OPP-005: Pharmaceutical Distribution ($31M)', 'NHIS expansion: 4.2M new covered lives', 'GHS preferred supplier list: open registration'];
  return ['OPP-002 active — 92% validated', 'OPP-003 active — 87% validated', 'OPP-004 active — 78% validated'];
}

function generateRiskFactors(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('kenya')) return ['KES lost 25% vs USD in 2023 — ongoing exposure', 'Political instability risk following 2022 disputes', 'TBS mutual recognition with India unconfirmed'];
  if (q.includes('nigeria')) return ['Naira devaluation: 70% post-FX unification', 'Power grid at 30% capacity — operational risk', 'PURC Ghana storage regulation unclear'];
  if (q.includes('pharma')) return ['NAFDAC 6–12 month approval timeline', 'Rwanda FDA bottleneck: 2–3 inspections/quarter', 'Cold chain infrastructure gaps in spoke cities'];
  return ['Currency volatility across monitored markets', 'Regulatory timeline uncertainty for new entrants', 'Political risk in 2 of 7 monitored countries'];
}

export function processQuery(query: string): QueryResult {
  const nodes = generateGraphNodes(query);
  const edges = generateEdges(nodes);

  return {
    query,
    summary: generateSummary(query),
    stats: generateStats(query),
    graphNodes: nodes,
    tableRows: generateTableRows(query),
    findings: generateFindings(query),
    opportunities: generateOpportunityLabels(query),
    riskFactors: generateRiskFactors(query),
  };
}
