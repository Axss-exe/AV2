'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AnalystLoading } from '@/components/analyst-loading';
import { QueryHero } from '@/components/query-hero';
import { EntityGraph } from '@/components/entity-graph';
import { IntelTable } from '@/components/intel-table';
import { InfoCards } from '@/components/info-cards';
import { processQuery } from '@/lib/use-query-processor';
import { useATIS } from '@/lib/context';
import type { QueryResult } from '@/lib/types';

const SUGGESTIONS = [
  'What are the risks in Kenyan agriculture?',
  'Show me cross-border logistics opportunities',
  'Validate OPP-002 data',
  'Nigeria energy market analysis',
  'Pharmaceutical distribution in West Africa',
];

export default function QueryPage() {
  const { currentQueryResult, setCurrentQueryResult, addQueryToHistory } = useATIS();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(!!currentQueryResult);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentQueryResult) setHasResult(true);
  }, [currentQueryResult]);

  const handleSubmit = (query: string) => {
    if (!query.trim()) return;
    setInputValue(query);
    setLoading(true);
  };

  const handleLoadingComplete = () => {
    const result = processQuery(inputValue);
    setCurrentQueryResult(result);
    addQueryToHistory(result);
    setLoading(false);
    setHasResult(true);
  };

  const handleReset = () => {
    setHasResult(false);
    setCurrentQueryResult(null);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] as number[] },
    }),
  };

  return (
    <AppShell>
      <AnalystLoading
        isVisible={loading}
        onComplete={handleLoadingComplete}
        durationMs={3000}
      />

      <div style={{ paddingTop: 40 }}>
        <AnimatePresence mode="wait">
          {!hasResult ? (
            /* ── INITIAL SEARCH STATE ── */
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center justify-center"
              style={{ minHeight: 'calc(100vh - 180px)' }}
            >
              <div style={{ width: '100%', maxWidth: 640 }}>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="mb-8 text-center"
                >
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 28,
                      color: '#ffffff',
                      marginBottom: 8,
                    }}
                  >
                    Intelligence Query
                  </h1>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 14,
                      color: '#737373',
                    }}
                  >
                    Ask anything about African trade, markets, and opportunities
                  </p>
                </motion.div>

                {/* Search bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative mb-6"
                >
                  <SearchBar
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                  />
                </motion.div>

                {/* Suggested queries */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="flex flex-wrap gap-2 justify-center"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSubmit(s)}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 400,
                        fontSize: 12,
                        color: '#a1a1a6',
                        background: '#1c1c1e',
                        border: '1px solid transparent',
                        borderRadius: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                        minHeight: 44,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ── RESULTS STATE ── */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Top bar: re-query */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <SearchBar
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    compact
                  />
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 12,
                    color: '#a1a1a6',
                    background: '#1c1c1e',
                    border: '1px solid #262626',
                    borderRadius: 8,
                    padding: '10px 16px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minHeight: 44,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                    (e.currentTarget as HTMLButtonElement).style.color = '#a1a1a6';
                  }}
                >
                  New Query
                </button>
              </div>

              {currentQueryResult && (
                <div className="flex flex-col gap-4">
                  {/* Query Hero */}
                  <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <QueryHero result={currentQueryResult} />
                  </motion.div>

                  {/* Graph + Table side by side */}
                  <div className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                    <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                      <EntityGraph result={currentQueryResult} />
                    </motion.div>
                    <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                      <IntelTable rows={currentQueryResult.tableRows} />
                    </motion.div>
                  </div>

                  {/* Info Cards */}
                  <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
                    <InfoCards result={currentQueryResult} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

/* ── Reusable Search Bar ── */
interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  compact?: boolean;
}

function SearchBar({ inputRef, value, onChange, onSubmit, compact }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative" style={{ width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        <Search size={16} color="#525252" />
      </div>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            onSubmit(value);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask anything about African trade..."
        style={{
          width: '100%',
          height: compact ? 44 : 56,
          background: '#0a0a0a',
          border: `1px solid ${focused ? '#ffffff' : '#1c1c1e'}`,
          borderRadius: 12,
          paddingLeft: 44,
          paddingRight: 48,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: compact ? 13 : 15,
          color: '#ffffff',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxShadow: focused ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none',
        }}
        aria-label="Intelligence query search"
        autoComplete="off"
      />
      {value && (
        <button
          onClick={() => onSubmit(value)}
          tabIndex={0}
          aria-label="Submit query"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#ffffff',
            border: 'none',
            borderRadius: 6,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#d1d1d6';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ArrowRight size={13} color="#000000" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
