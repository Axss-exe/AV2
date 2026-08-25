'use client';

import { EntityGraph } from '@/components/entity-graph';
import { RelatedNewsPanel } from '@/components/query/related-news-panel';

const nodes = [
  { id: 'timb', label: 'Tobacco Industry & Marketing Board', type: 'hub' as const, x: 0, y: 0 },
  { id: 'zim-farmers', label: 'Zimbabwe Tobacco Farmers Assoc.', type: 'entity' as const, x: 0, y: 0 },
  { id: 'china-buyer', label: 'China Tobacco International', type: 'partner' as const, x: 0, y: 0 },
  { id: 'export-ban', label: 'Raw Export Restrictions', type: 'risk' as const, x: 0, y: 0 },
  { id: 'rbz', label: 'Reserve Bank of Zimbabwe', type: 'entity' as const, x: 0, y: 0 },
  { id: 'auction-floors', label: 'Tobacco Auction Floors', type: 'entity' as const, x: 0, y: 0 },
  { id: 'contract-co', label: 'Contract Tobacco Companies', type: 'partner' as const, x: 0, y: 0 },
  { id: 'fx-risk', label: 'FX Repatriation Risk', type: 'risk' as const, x: 0, y: 0 },
];

const edges = [
  { from: 'timb', to: 'zim-farmers', label: 'regulates' },
  { from: 'timb', to: 'auction-floors', label: 'oversees' },
  { from: 'timb', to: 'rbz', label: 'reports to' },
  { from: 'zim-farmers', to: 'contract-co', label: 'supplies' },
  { from: 'auction-floors', to: 'china-buyer', label: 'sells to' },
  { from: 'contract-co', to: 'china-buyer', label: 'exports to' },
  { from: 'timb', to: 'export-ban', label: 'enforces' },
  { from: 'rbz', to: 'fx-risk', label: 'exposed to' },
  { from: 'contract-co', to: 'fx-risk', label: 'exposed to' },
];

export default function QAPreviewPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: 40 }} className="flex flex-col gap-6">
      <EntityGraph nodes={nodes} edges={edges} title="Entity Network" onNodeClick={(l) => console.log('[v0] node click', l)} />
      <RelatedNewsPanel countries={['Zimbabwe']} onSelect={(a) => console.log('[v0] article select', a)} />
    </div>
  );
}
