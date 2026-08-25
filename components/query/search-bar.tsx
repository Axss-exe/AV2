'use client';

import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  compact?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchBar({
  inputRef,
  value,
  onChange,
  onSubmit,
  compact,
  disabled,
  placeholder = 'Ask anything about African trade...',
  ariaLabel = 'Intelligence query search',
}: SearchBarProps) {
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
        <Search size={16} color="var(--text-dim)" />
      </div>
      <input
        ref={inputRef}
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            onSubmit(value);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: compact ? 44 : 56,
          background: 'var(--bg-surface)',
          border: `1px solid ${focused ? 'var(--text-primary)' : 'var(--border-default)'}`,
          borderRadius: 12,
          paddingLeft: 44,
          paddingRight: 48,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: compact ? 13 : 15,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxShadow: focused ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
        }}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      {value && !disabled && (
        <button
          onClick={() => onSubmit(value)}
          tabIndex={0}
          aria-label="Submit query"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--text-primary)',
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
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text-primary)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ArrowRight size={13} color="var(--bg-primary)" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
