import type { KeyEntity, GraphEdge, QueryResult } from './types';
import type { AggregatedKnowledge } from './investigation-types';

/**
 * Merge accumulated query results into deduped entities, relationships,
 * sources, and findings without requiring a database connection.
 */
export function computeAggregated(results: QueryResult[]): AggregatedKnowledge {
  const entityByName = new Map<string, KeyEntity>();
  const relationshipByKey = new Map<string, GraphEdge>();
  const sourceNames = new Set<string>();
  const findingTexts = new Set<string>();

  for (const result of results) {
    for (const entity of result.keyEntities ?? []) {
      if (!entityByName.has(entity.entity_name)) {
        entityByName.set(entity.entity_name, entity);
      }
    }
    for (const edge of result.graphEdges ?? []) {
      const key = `${edge.from}|${edge.to}|${edge.label}`;
      if (!relationshipByKey.has(key)) {
        relationshipByKey.set(key, edge);
      }
    }
    for (const row of result.tableRows ?? []) {
      if (row.entity) sourceNames.add(row.entity);
    }
    if (result.findingsCited && result.findingsCited.length > 0) {
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
