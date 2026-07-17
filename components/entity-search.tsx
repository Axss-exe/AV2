'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface EntitySearchProps {
  total: number;
  resultCount: number;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function EntitySearch({ total, resultCount, onSearch, placeholder = 'Search entities...' }: EntitySearchProps) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce — 150ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(value), 150);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, onSearch]);

  const clear = () => {
    setValue('');
    onSearch('');
  };

  const isFiltered = value.trim().length > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {/* Input */}
      <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
        <Search
          size={13}
          color="#525252"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search entities"
          style={{
            width: '100%',
            height: 38,
            background: '#111111',
            border: '1px solid #1c1c1e',
            borderRadius: 9,
            paddingLeft: 34,
            paddingRight: value ? 36 : 12,
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 12,
            color: '#ffffff',
            outline: 'none',
            transition: 'border-color 0.18s',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#333333'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1c1c1e'; }}
        />
        {value && (
          <button
            onClick={clear}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#525252',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Result count badge */}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 12,
          color: isFiltered ? '#a1a1a6' : '#525252',
          whiteSpace: 'nowrap',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {isFiltered ? (
          <>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{resultCount}</span>
            {' of '}
            <span style={{ color: '#525252' }}>{total}</span>
            {' profiles'}
          </>
        ) : (
          <span>{total} profiles</span>
        )}
      </div>
    </div>
  );
}
