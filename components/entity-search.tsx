'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { searchEntitiesAPI, type SearchResult } from '@/lib/api';
import { resolveEntityType, entityTypeMeta } from '@/lib/entity-types';

interface EntitySearchProps {
  total: number;
  resultCount: number;
  onSearch: (query: string) => void;
  placeholder?: string;
}

function stripMd(text: string): string {
  return text
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#*`>[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function EntitySearch({ total, resultCount, onSearch, placeholder = 'Search entities...' }: EntitySearchProps) {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced client-side grid filter (instant)
  useEffect(() => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => onSearch(value), 150);
    return () => { if (filterTimer.current) clearTimeout(filterTimer.current); };
  }, [value, onSearch]);

  // Debounced API search for the dropdown
  useEffect(() => {
    const q = value.trim();
    if (apiTimer.current) clearTimeout(apiTimer.current);

    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setOpen(false);
      return;
    }

    setSearching(true);
    setOpen(true);
    const current = ++reqId.current;

    apiTimer.current = setTimeout(async () => {
      try {
        const res = await searchEntitiesAPI(q);
        if (current !== reqId.current) return; // stale — ignore
        setResults(res.results ?? []);
        setCount(res.count ?? res.results?.length ?? 0);
      } catch {
        if (current !== reqId.current) return;
        setResults([]);
        setCount(0);
      } finally {
        if (current === reqId.current) setSearching(false);
      }
    }, 280);

    return () => { if (apiTimer.current) clearTimeout(apiTimer.current); };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const clear = () => {
    setValue('');
    setResults([]);
    setOpen(false);
    onSearch('');
  };

  const isFiltered = value.trim().length > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {/* Input + dropdown */}
      <div ref={containerRef} style={{ position: 'relative', flex: '1 1 320px', maxWidth: 440 }}>
        <Search
          size={13}
          color="var(--text-dim)"
          aria-hidden="true"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)';
            if (results.length > 0) setOpen(true);
          }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)'; }}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          placeholder={placeholder}
          aria-label="Search entities"
          role="combobox"
          aria-expanded={open}
          aria-controls="entity-search-results"
          style={{
            width: '100%',
            height: 38,
            background: 'var(--bg-control)',
            border: '1px solid var(--border-default)',
            borderRadius: 9,
            paddingLeft: 34,
            paddingRight: value ? 60 : 12,
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 12,
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.18s',
          }}
        />

        {/* Spinner + clear */}
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {searching && <Loader2 size={13} color="var(--text-dim)" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />}
          {value && (
            <button
              onClick={clear}
              aria-label="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', padding: 2 }}
            >
              <X size={12} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div
            id="entity-search-results"
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            {searching && results.length === 0 ? (
              <div style={{ padding: '18px 16px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-dim)' }}>
                Searching vault...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '18px 16px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-dim)' }}>
                No entities matching &ldquo;{value}&rdquo;
              </div>
            ) : (
              <>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {count} result{count === 1 ? '' : 's'}
                </div>
                {results.slice(0, 20).map((r) => {
                  const type = resolveEntityType(r.entity_type, null);
                  const meta = entityTypeMeta(type);
                  const Icon = meta.icon;
                  const snippet = stripMd(r.summary).slice(0, 90);
                  return (
                    <Link
                      key={r.slug}
                      href={`/entities/${r.slug}`}
                      onClick={() => setOpen(false)}
                      role="option"
                      aria-selected={false}
                      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', textDecoration: 'none', borderBottom: '1px solid var(--bg-control)', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#141414'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}1a`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: meta.color }}
                      >
                        <Icon size={13} />
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </span>
                        {snippet && (
                          <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {snippet}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Result count badge (grid filter) */}
      <div
        style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: isFiltered ? 'var(--text-tertiary)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {isFiltered ? (
          <>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{resultCount}</span>
            {' of '}
            <span style={{ color: 'var(--text-dim)' }}>{total}</span>
            {' shown'}
          </>
        ) : (
          <span>{total} profiles</span>
        )}
      </div>
    </div>
  );
}
