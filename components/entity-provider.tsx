'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fetchEntities } from '@/lib/api';
import type { EntityListItem } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntityContextValue {
  entities: EntityListItem[];
  isLoading: boolean;
  error: Error | null;
  getEntityById: (id: string) => EntityListItem | undefined;
  searchEntities: (query: string) => EntityListItem[];
  refetch: () => void;
}

const EntityContext = createContext<EntityContextValue | null>(null);

export function useEntities(): EntityContextValue {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error('useEntities must be used inside <EntityProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface EntityProviderProps {
  children: ReactNode;
}

export function EntityProvider({ children }: EntityProviderProps) {
  const [entities, setEntities] = useState<EntityListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEntities();
      setEntities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load entities'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, [load]);

  const getEntityById = useCallback(
    (id: string) => entities.find((e) => e.id === id),
    [entities]
  );

  const searchEntities = useCallback(
    (query: string): EntityListItem[] => {
      if (!query.trim()) return entities;
      const q = query.toLowerCase();
      return entities.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.content ?? '').toLowerCase().includes(q)
      );
    },
    [entities]
  );

  return (
    <EntityContext.Provider
      value={{ entities, isLoading, error, getEntityById, searchEntities, refetch: load }}
    >
      {children}
    </EntityContext.Provider>
  );
}
