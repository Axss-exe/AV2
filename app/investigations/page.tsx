'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GitBranch, Loader2, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { fetchInvestigations, APIError } from '@/lib/api';
import type { InvestigationSummary } from '@/lib/investigation-types';

export default function InvestigationsPage() {
  const [items, setItems] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchInvestigations());
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load investigations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <AppShell>
      <main className="pt-6 md:pt-10" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="flex items-start justify-between gap-4" style={{ marginBottom: 28 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Persisted investigations
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-primary)', margin: 0 }}>
              Investigations
            </h1>
          </div>
          <button type="button" onClick={() => void load()} aria-label="Refresh investigations" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-dim)', cursor: 'pointer' }}>
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center" style={{ minHeight: 220 }}>
            <Loader2 size={20} color="var(--text-dim)" className="animate-spin" aria-label="Loading investigations" />
          </div>
        )}

        {error && !loading && (
          <div role="alert" style={{ color: '#ff453a', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px solid var(--border-default)', borderRadius: 12 }}>
            <GitBranch size={22} color="var(--text-dim)" aria-hidden="true" />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '14px 0 6px' }}>No investigations yet</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Start one from a completed query.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Link key={item.investigation_id} href={`/investigations/${item.investigation_id}`} style={{ display: 'block', padding: '16px 18px', border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)', textDecoration: 'none' }}>
                <div className="flex items-start justify-between gap-4">
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>{item.title}</h2>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{item.title}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{item.status}</span>
                </div>
                <div className="flex flex-wrap gap-3" style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                  <span>{item.query_count} queries</span>
                  <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
