'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OpportunityCard } from '@/components/opportunity-card';
import { useATIS } from '@/lib/context';
import { executeOpportunity } from '@/lib/api';
import { Newspaper, Clock, Hash, ArrowLeft } from 'lucide-react';

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const { currentDashboard, currentNewsArticle, clearAnalysis } = useATIS();

  const handleExecute = useCallback(
    async (opportunityId: string) => {
      if (!currentDashboard) return;
      await executeOpportunity({
        dashboard_json: currentDashboard,
        opportunity_id: opportunityId,
      });
    },
    [currentDashboard]
  );

  // Empty state — user navigated directly without running analysis
  if (!currentDashboard) {
    return (
      <AppShell>
        <main
          style={{
            minHeight: '100vh',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 28px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: '#0a0a0a',
                border: '1px solid #1c1c1e',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
              aria-hidden="true"
            >
              <Newspaper size={24} color="#333333" />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 18,
                color: '#f5f5f7',
                margin: '0 0 8px 0',
                letterSpacing: '-0.01em',
              }}
            >
              No analysis loaded
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 13,
                color: '#525252',
                margin: '0 0 28px 0',
                lineHeight: 1.6,
              }}
            >
              Go to News and select an article to run the ATIS intelligence
              pipeline. Opportunity data will appear here automatically.
            </p>
            <Link href="/news" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 22px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#000000',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = '#d1d1d6')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = '#ffffff')
                }
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Go to News Feed
              </button>
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const meta = currentDashboard.pipeline_metadata;
  const sorted = [...(currentDashboard.opportunities ?? [])].sort(
    (a, b) => b.urgency_score - a.urgency_score
  );

  return (
    <AppShell>
      <main
        style={{
          minHeight: '100vh',
          background: '#050505',
          padding: '28px 28px 80px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* Back link */}
        <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              color: '#525252',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#a1a1a6')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Back
          </button>

          <button
            onClick={() => {
              clearAnalysis();
              router.push('/news');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid #2c2c2e',
              borderRadius: 7,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 12,
              color: '#525252',
              padding: '6px 12px',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#525252';
              (e.currentTarget as HTMLElement).style.color = '#a1a1a6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2c2c2e';
              (e.currentTarget as HTMLElement).style.color = '#525252';
            }}
          >
            <Newspaper size={12} aria-hidden="true" />
            Analyze another article
          </button>
        </div>

        {/* Header section */}
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid #1c1c1e',
            borderRadius: 14,
            padding: '24px 26px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, #007aff, #5ac8fa)',
            }}
            aria-hidden="true"
          />

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.14em',
              color: '#333333',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Intelligence ID: {currentDashboard.intelligence_id}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 22,
              color: '#f5f5f7',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {currentDashboard.trigger_event}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 13,
              color: '#737373',
              margin: '0 0 20px 0',
              lineHeight: 1.55,
              maxWidth: 680,
            }}
          >
            {currentDashboard.market_equilibrium_shift}
          </p>

          {/* Metadata pills */}
          <div className="flex flex-wrap items-center gap-3">
            {currentNewsArticle && (
              <Link
                href={`/news/${currentNewsArticle.id}`}
                style={{ textDecoration: 'none' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 11,
                    color: '#007aff',
                    background: 'rgba(0,122,255,0.08)',
                    border: '1px solid rgba(0,122,255,0.2)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      'rgba(0,122,255,0.15)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      'rgba(0,122,255,0.08)')
                  }
                >
                  <Newspaper size={10} aria-hidden="true" />
                  Source article
                </span>
              </Link>
            )}

            {meta?.extracted_entities_count != null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#525252',
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 6,
                  padding: '4px 10px',
                }}
              >
                <Hash size={10} aria-hidden="true" />
                {meta.extracted_entities_count} entities extracted
              </span>
            )}

            {meta?.processed_at && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#525252',
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 6,
                  padding: '4px 10px',
                }}
              >
                <Clock size={10} aria-hidden="true" />
                {formatTimestamp(meta.processed_at)}
              </span>
            )}

            {meta?.elapsed_seconds != null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#333333',
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 6,
                  padding: '4px 10px',
                }}
              >
                {meta.elapsed_seconds}s
              </span>
            )}
          </div>
        </div>

        {/* Opportunities grid */}
        {sorted.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-sans)',
              color: '#525252',
              fontSize: 13,
            }}
          >
            No opportunities found in this analysis.
          </div>
        ) : (
          <>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 16 }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#a1a1a6',
                  margin: 0,
                }}
              >
                Opportunities
              </h2>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#333333',
                }}
              >
                {sorted.length} found — sorted by urgency
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: 16,
              }}
            >
              {sorted.map((opp) => (
                <OpportunityCard
                  key={opp.opportunity_id}
                  opportunity={opp}
                  onExecute={handleExecute}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
