'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ChevronLeft, FileText, Code2, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useEntities } from '@/components/entity-provider';
import { fetchEntityProfile } from '@/lib/api';
import type { EntityProfileResponse } from '@/lib/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hashToColor(str: string): string {
  const COLORS = [
    '#30d158', '#64d2ff', '#ffd60a', '#ff9f0a',
    '#ff453a', '#bf5af2', '#ff6b35', '#0a84ff',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ width, height }: { width?: number | string; height: number }) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height,
        background: '#1c1c1e',
        borderRadius: 6,
        animation: 'pulse-soft 1.5s infinite',
      }}
    />
  );
}

function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton width={120} height={14} />
      <Skeleton height={32} />
      <Skeleton width={200} height={12} />
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(6)].map((_, i) => <Skeleton key={i} height={14} />)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metadata sidebar item
// ---------------------------------------------------------------------------

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 10,
          color: '#525252',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#737373',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EntityDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { getEntityById, isLoading: ctxLoading } = useEntities();
  const listEntity = getEntityById(id);

  const [profile, setProfile] = useState<EntityProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Fetch full profile (frontmatter + body)
  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await fetchEntityProfile(id);
      setProfile(data);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Name: prefer frontmatter > list entity > id
  const displayName = profile?.frontmatter?.entity ?? listEntity?.name ?? id.replace(/_/g, ' ');
  const color = hashToColor(id);
  const sizeBytes = listEntity?.size_bytes;
  const filePath = listEntity?.path ?? profile?.frontmatter?.path as string | undefined;

  // Markdown content — prefer raw_markdown from profile, fall back to list entity content
  const markdownContent = profile?.raw_markdown ?? listEntity?.content ?? '';

  const isLoading = ctxLoading || profileLoading;

  return (
    <AppShell>
      <div style={{ paddingTop: 32, paddingBottom: 60 }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <Link
            href="/entities"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 12,
              color: '#525252',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1a6'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#525252'; }}
          >
            <ChevronLeft size={13} aria-hidden="true" />
            Entity Directory
          </Link>
        </nav>

        {isLoading ? (
          <DetailSkeleton />
        ) : !listEntity && !profile ? (
          /* Not found */
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 18,
                color: '#d1d1d6',
              }}
            >
              Entity not found
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontSize: 13,
                color: '#525252',
              }}
            >
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: '#737373',
                  background: '#1c1c1e',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {id}
              </code>{' '}
              does not exist in the vault.
            </p>
            <Link
              href="/entities"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 12,
                color: '#30d158',
                textDecoration: 'none',
                border: '1px solid rgba(48,209,88,0.25)',
                borderRadius: 7,
                padding: '8px 16px',
                background: 'rgba(48,209,88,0.06)',
              }}
            >
              Back to directory
            </Link>
          </div>
        ) : (
          /* Main layout */
          <div
            style={{
              display: 'grid',
              gap: 32,
              gridTemplateColumns: '1fr',
            }}
            className="lg:grid-cols-[1fr_220px]"
          >
            {/* ---- Left: content ---- */}
            <main>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${color}1a`,
                    border: `1px solid ${color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700,
                    fontSize: 17,
                    color,
                    letterSpacing: '0.02em',
                  }}
                >
                  {initials(displayName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 22,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      marginBottom: 6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {displayName}
                  </h1>
                  {filePath && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: '#525252',
                        background: '#1c1c1e',
                        border: '1px solid #262626',
                        borderRadius: 5,
                        padding: '3px 8px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {filePath}
                    </span>
                  )}
                </div>
              </div>

              {/* Raw / Rendered toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <button
                  onClick={() => setShowRaw(false)}
                  aria-pressed={!showRaw}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 11,
                    color: !showRaw ? '#ffffff' : '#525252',
                    background: !showRaw ? '#1c1c1e' : 'none',
                    border: `1px solid ${!showRaw ? '#333333' : 'transparent'}`,
                    borderRadius: 7,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <FileText size={11} aria-hidden="true" />
                  Rendered
                </button>
                <button
                  onClick={() => setShowRaw(true)}
                  aria-pressed={showRaw}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 11,
                    color: showRaw ? '#ffffff' : '#525252',
                    background: showRaw ? '#1c1c1e' : 'none',
                    border: `1px solid ${showRaw ? '#333333' : 'transparent'}`,
                    borderRadius: 7,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Code2 size={11} aria-hidden="true" />
                  Raw markdown
                </button>
              </div>

              {/* Profile error (non-fatal — list data can still show) */}
              {profileError && (
                <div
                  style={{
                    background: 'rgba(255,69,58,0.07)',
                    border: '1px solid rgba(255,69,58,0.18)',
                    borderRadius: 9,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 300,
                      fontSize: 12,
                      color: '#ff453a',
                    }}
                  >
                    {profileError}
                  </p>
                  <button
                    onClick={loadProfile}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 11,
                      color: '#ff453a',
                      background: 'rgba(255,69,58,0.1)',
                      border: '1px solid rgba(255,69,58,0.2)',
                      borderRadius: 6,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw size={10} aria-hidden="true" />
                    Retry
                  </button>
                </div>
              )}

              {/* Content */}
              {showRaw ? (
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#a1a1a6',
                    background: '#0a0a0a',
                    border: '1px solid #1c1c1e',
                    borderRadius: 10,
                    padding: '18px 20px',
                    overflow: 'auto',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {markdownContent || 'No content available.'}
                </pre>
              ) : markdownContent ? (
                <article
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 13,
                    color: '#a1a1a6',
                    lineHeight: 1.75,
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => (
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#ffffff', marginTop: 28, marginBottom: 10, lineHeight: 1.3 }}>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: '#d1d1d6', marginTop: 24, marginBottom: 8, lineHeight: 1.3, borderBottom: '1px solid #1c1c1e', paddingBottom: 6 }}>{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#a1a1a6', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p style={{ marginBottom: 14, lineHeight: 1.75 }}>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ paddingLeft: 18, marginBottom: 14 }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ paddingLeft: 18, marginBottom: 14 }}>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: 5, lineHeight: 1.6 }}>{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote style={{ borderLeft: '3px solid #333333', paddingLeft: 14, margin: '14px 0', color: '#737373', fontStyle: 'italic' }}>{children}</blockquote>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes('language-');
                        return isBlock ? (
                          <code className={className} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{children}</code>
                        ) : (
                          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64d2ff', background: '#1c1c1e', borderRadius: 4, padding: '1px 5px' }}>{children}</code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 8, padding: '14px 16px', overflow: 'auto', marginBottom: 14 }}>{children}</pre>
                      ),
                      table: ({ children }) => (
                        <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>{children}</table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#525252', padding: '8px 12px', borderBottom: '1px solid #1c1c1e', textAlign: 'left' }}>{children}</th>
                      ),
                      td: ({ children }) => (
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #111111', color: '#a1a1a6' }}>{children}</td>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#64d2ff', textDecoration: 'underline', textDecorationColor: 'rgba(100,210,255,0.3)' }}>{children}</a>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600, color: '#d1d1d6' }}>{children}</strong>
                      ),
                      hr: () => (
                        <hr style={{ border: 'none', borderTop: '1px solid #1c1c1e', margin: '22px 0' }} />
                      ),
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </article>
              ) : (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 300,
                    fontSize: 13,
                    color: '#525252',
                    fontStyle: 'italic',
                  }}
                >
                  No content available for this entity.
                </p>
              )}
            </main>

            {/* ---- Right: metadata sidebar ---- */}
            <aside>
              <div
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1e',
                  borderRadius: 12,
                  padding: '18px 16px',
                  position: 'sticky',
                  top: 20,
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 11,
                    color: '#525252',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.07em',
                    marginBottom: 16,
                  }}
                >
                  Metadata
                </h2>

                {sizeBytes != null && (
                  <MetaRow label="File size" value={formatBytes(sizeBytes)} />
                )}
                {listEntity?.filename && (
                  <MetaRow label="Filename" value={listEntity.filename} />
                )}
                {profile?.frontmatter?.sector && (
                  <MetaRow label="Sector" value={profile.frontmatter.sector} />
                )}
                {profile?.frontmatter?.entity_type && (
                  <MetaRow
                    label="Entity type"
                    value={String(profile.frontmatter.entity_type).replace(/_/g, ' ')}
                  />
                )}
                {profile?.frontmatter?.ownership_type && (
                  <MetaRow
                    label="Ownership"
                    value={String(profile.frontmatter.ownership_type).replace(/_/g, ' ')}
                  />
                )}
                {profile?.id && (
                  <MetaRow label="Entity ID" value={profile.id} />
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
