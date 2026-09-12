import type { QueryResult, KeyEntity, GraphEdge } from './types';
import type { AggregatedKnowledge } from './investigation-types';

/** Merge query results into deduped investigation knowledge for client and server use. */
export function computeAggregated(results: QueryResult[]): AggregatedKnowledge {
  const entityByName = new Map<string, KeyEntity>();
  const relationshipByKey = new Map<string, GraphEdge>();
  const sourceNames = new Set<string>();
  const findingTexts = new Set<string>();

  for (const result of results) {
    for (const entity of result.keyEntities ?? []) {
      if (!entityByName.has(entity.entity_name)) entityByName.set(entity.entity_name, entity);
    }
    for (const edge of result.graphEdges ?? []) {
      const key = `${edge.from}|${edge.to}|${edge.label}`;
      if (!relationshipByKey.has(key)) relationshipByKey.set(key, edge);
    }
    for (const row of result.tableRows ?? []) {
      if (row.entity) sourceNames.add(row.entity);
    }
    if (result.findingsCited?.length) {
      for (const finding of result.findingsCited) findingTexts.add(finding.text);
    } else {
      for (const finding of result.findings ?? []) findingTexts.add(finding);
    }
  }

  const entities = Array.from(entityByName.values());
  const relationships = Array.from(relationshipByKey.values());
  const sources = Array.from(sourceNames);

  return {
    entities,
    relationships,
    sources,
    findingsCount: findingTexts.size,
    entitiesCount: entities.length,
    relationshipsCount: relationships.length,
    sourcesCount: sources.length,
  };
}

export { type AggregatedKnowledge } from './investigation-types';
