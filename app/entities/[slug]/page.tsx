'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useEntities } from '@/components/entity-provider';
import { fetchEntityProfile } from '@/lib/api';
import type { EntityProfile, RelatedEntity } from '@/lib/api';
import { resolveEntityType, entityTypeMeta } from '@/lib/entity-types';

// ---------------------------------------------------------------------------
// Frontmatter parsing — the vault embeds YAML frontmatter inside `content`
// (the API's front_matter field is frequently empty), so we parse it here.
// ---------------------------------------------------------------------------

function cleanVal(v: string): string {
  return v
    .replace(/^["']|["']$/g, '')
    .replace(/\[\[(.+?)\]\]/g, '$1')
    .trim();
}

interface ParsedFrontmatter {
  fields: Array<[string, string[]]>;
  body: string;
}

function parseFrontmatter(content: string): ParsedFrontmatter {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fields: [], body: content };

  const body = content.slice(m[0].length);
  const lines = m[1].split('\n');
  const fields: Array<[string, string[]]> = [];
  let i = 0;

  while (i < lines.length) {
    const kv = lines[i].match(/^([A-Za-z0-9_ -]+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const key = kv[1].trim();
    const inline = kv[2].trim();
    const values: string[] = [];

    if (inline) {
      cleanVal(inline).split(';').map((s) => s.trim()).filter(Boolean).forEach((s) => values.push(s));
    } else {
      i++;
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        cleanVal(lines[i].replace(/^\s*-\s+/, ''))
          .split(';').map((s) => s.trim()).filter(Boolean)
          .forEach((s) => values.push(s));
        i++;
      }
      i--;
    }
    fields.push([key, values]);
    i++;
  }
  return { fields, body };
}

const HIDDEN_KEYS = new Set(['summary', 'entity', 'name', 'aliases']);

function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isMeaningful(values: string[]): boolean {
  const cleaned = values.filter((v) => v && v.toLowerCase() !== 'unknown' && v.toLowerCase() !== 'n/a');
  if (cleaned.length === 0) return false;
  // Exclude prose-like blocks (e.g. a duplicated summary) — real metadata is short.
  if (cleaned.some((v) => v.length > 160)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

function Bar({ width, height }: { width?: number | string; height: number }) {
  return (
    <div style={{ width: width ?? '100%', height, background: '#1c1c1e', borderRadius: 6, animation: 'pulse-soft 1.5s infinite' }} />
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Bar width={120} height={13} />
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Bar width={52} height={52} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Bar width="60%" height={26} />
          <Bar width={120} height={14} />
        </div>
      </div>
      <Bar height={70} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {[...Array(6)].map((_, i) => <Bar key={i} height={13} />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2" style={{ marginTop: 12 }}>
        {[...Array(2)].map((_, col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Bar width={100} height={12} />
            {[...Array(3)].map((_, i) => <Bar key={i} height={58} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relation card
// ---------------------------------------------------------------------------

function RelationCard({ rel }: { rel: RelatedEntity }) {
  const type = resolveEntityType(rel.entity_type, null);
  const meta = entityTypeMeta(type);
  const Icon = meta.icon;
  const accent = rel.relation_type === 'backlink' ? '#ff9f0a' : '#0a84ff';
  const snippet = rel.summary
    ? rel.summary.replace(/^---[\s\S]*?---/m, '').replace(/[#*`>[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 110)
    : '';

  return (
    <Link
      href={`/entities/${rel.slug}`}
      style={{ display: 'block', textDecoration: 'none' }}
      aria-label={`View ${rel.name}`}
    >
      <div
        style={{
          display: 'flex',
          gap: 11,
          padding: '12px 14px',
          background: '#0a0a0a',
          border: '1px solid #1c1c1e',
          borderLeft: `2px solid ${accent}`,
          borderRadius: 10,
          transition: 'border-color 0.15s, transform 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = '#111111';
          el.style.borderColor = '#2c2c2e';
          el.style.borderLeftColor = accent;
          el.style.transform = 'translateX(2px)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = '#0a0a0a';
          el.style.borderColor = '#1c1c1e';
          el.style.borderLeftColor = accent;
          el.style.transform = 'translateX(0)';
        }}
      >
        <span
          aria-hidden="true"
          style={{ width: 30, height: 30, borderRadius: 8, background: `${meta.color}1a`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: meta.color }}
        >
          <Icon size={14} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12.5, color: '#f5f5f7', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rel.name}
          </p>
          {snippet && (
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: '#525252', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {snippet}
            </p>
          )}
          <span style={{ display: 'inline-block', marginTop: 5, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

function RelationColumn({
  title, accent, icon, rels,
}: { title: string; accent: string; icon: React.ReactNode; rels: RelatedEntity[] }) {
  return (
    <section aria-label={title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: '#d1d1d6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252' }}>{rels.length}</span>
      </div>
      {rels.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12, color: '#3a3a3a', fontStyle: 'italic', padding: '8px 0' }}>
          No connections.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rels.map((r) => <RelationCard key={`${r.relation_type}-${r.slug}`} rel={r} />)}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EntityProfilePage({ params }: PageProps) {
  const { slug } = use(params);
  const { getEntityBySlug, isLoading: ctxLoading } = useEntities();
  const listEntity = getEntityBySlug(slug);

  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await fetchEntityProfile(slug);
      if (!data || !data.slug) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile.';
      if (/404|not found/i.test(msg)) setNotFound(true);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const displayName = profile?.name ?? listEntity?.name ?? slug.replace(/-/g, ' ');
  const type = resolveEntityType(profile?.entity_type ?? listEntity?.entity_type, profile?.path ?? listEntity?.path);
  const meta = entityTypeMeta(type);
  const TypeIcon = meta.icon;

  const parsed = parseFrontmatter(profile?.content ?? listEntity?.content ?? '');
  // Prefer non-empty API front_matter, else parsed frontmatter fields
  const apiFm = profile?.front_matter ?? {};
  const apiFmEntries = Object.entries(apiFm).filter(([, v]) => v != null && String(v).trim() !== '');
  const metaFields: Array<[string, string[]]> =
    apiFmEntries.length > 0
      ? apiFmEntries.map(([k, v]) => [k, (Array.isArray(v) ? v.map(String) : [String(v)]).map(cleanVal)])
      : parsed.fields;
  const displayFields = metaFields.filter(([k, v]) => !HIDDEN_KEYS.has(k.toLowerCase()) && isMeaningful(v));

  const summary = profile?.summary?.trim() || '';
  const bodyMarkdown = parsed.body.trim();

  const related = profile?.related_entities ?? [];
  const backlinks = related.filter((r) => r.relation_type === 'backlink');
  const outbound = related.filter((r) => r.relation_type === 'outbound');

  const url = metaFields.find(([k]) => k.toLowerCase() === 'url')?.[1]?.[0];

  return (
    <AppShell>
      <div style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <Link
            href="/entities"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: '#525252', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1a6'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#525252'; }}
          >
            <ChevronLeft size={13} aria-hidden="true" />
            Entity Directory
          </Link>
        </nav>

        {loading || ctxLoading ? (
          <ProfileSkeleton />
        ) : notFound ? (
          /* 404 */
          <div style={{ textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 18, color: '#d1d1d6' }}>
              Entity not found in vault
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#525252' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#737373', background: '#1c1c1e', padding: '2px 6px', borderRadius: 4 }}>
                {slug}
              </code>{' '}
              does not exist.
            </p>
            <Link
              href="/entities"
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: '#30d158', textDecoration: 'none', border: '1px solid rgba(48,209,88,0.25)', borderRadius: 7, padding: '8px 16px', background: 'rgba(48,209,88,0.06)' }}
            >
              Back to directory
            </Link>
          </div>
        ) : error ? (
          /* Fatal error */
          <div style={{ background: 'rgba(255,69,58,0.07)', border: '1px solid rgba(255,69,58,0.18)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: '#ff453a', marginBottom: 4 }}>Failed to load profile</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 11, color: '#525252' }}>{error}</p>
            </div>
            <button
              onClick={loadProfile}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, color: '#ff453a', background: 'rgba(255,69,58,0.12)', border: '1px solid rgba(255,69,58,0.25)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <RefreshCw size={11} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div
                aria-hidden="true"
                style={{ width: 52, height: 52, borderRadius: 14, background: `${meta.color}1a`, border: `1px solid ${meta.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: meta.color }}
              >
                <TypeIcon size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: '#ffffff', lineHeight: 1.25, wordBreak: 'break-word' }}>
                    {displayName}
                  </h1>
                  <span
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: meta.color, background: `${meta.color}1a`, border: `1px solid ${meta.color}40`, borderRadius: 6, padding: '4px 9px' }}
                  >
                    <TypeIcon size={11} aria-hidden="true" />
                    {meta.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {(profile?.path ?? listEntity?.path) && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#525252', background: '#141414', border: '1px solid #262626', borderRadius: 5, padding: '3px 8px', wordBreak: 'break-all' }}>
                      {profile?.path ?? listEntity?.path}
                    </span>
                  )}
                  {url && /^https?:\/\//.test(url) && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 11, color: '#64d2ff', textDecoration: 'none' }}
                    >
                      <ExternalLink size={11} aria-hidden="true" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </header>

            {/* Lead summary */}
            {summary && (
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 15, color: '#d1d1d6', lineHeight: 1.65, marginBottom: 28, borderLeft: `2px solid ${meta.color}`, paddingLeft: 16 }}>
                {summary}
              </p>
            )}

            {/* Main grid: content + metadata */}
            <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
              {/* Content */}
              <main style={{ minWidth: 0 }}>
                {bodyMarkdown ? (
                  <article style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#a1a1a6', lineHeight: 1.75 }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ children }) => <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, color: '#ffffff', marginTop: 26, marginBottom: 10, lineHeight: 1.3 }}>{children}</h2>,
                        h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: '#d1d1d6', marginTop: 24, marginBottom: 8, lineHeight: 1.3, borderBottom: '1px solid #1c1c1e', paddingBottom: 6 }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#a1a1a6', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</h3>,
                        p: ({ children }) => <p style={{ marginBottom: 14, lineHeight: 1.75 }}>{children}</p>,
                        ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 14 }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 14 }}>{children}</ol>,
                        li: ({ children }) => <li style={{ marginBottom: 5, lineHeight: 1.6 }}>{children}</li>,
                        blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #333333', paddingLeft: 14, margin: '14px 0', color: '#737373', fontStyle: 'italic' }}>{children}</blockquote>,
                        code: ({ children, className }) => {
                          const isBlock = className?.includes('language-');
                          return isBlock
                            ? <code className={className} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{children}</code>
                            : <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64d2ff', background: '#1c1c1e', borderRadius: 4, padding: '1px 5px' }}>{children}</code>;
                        },
                        pre: ({ children }) => <pre style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 8, padding: '14px 16px', overflow: 'auto', marginBottom: 14 }}>{children}</pre>,
                        table: ({ children }) => <div style={{ overflowX: 'auto', marginBottom: 14 }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>{children}</table></div>,
                        th: ({ children }) => <th style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#525252', padding: '8px 12px', borderBottom: '1px solid #1c1c1e', textAlign: 'left' }}>{children}</th>,
                        td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid #111111', color: '#a1a1a6' }}>{children}</td>,
                        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#64d2ff', textDecoration: 'underline', textDecorationColor: 'rgba(100,210,255,0.3)' }}>{children}</a>,
                        strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#d1d1d6' }}>{children}</strong>,
                        hr: () => <hr style={{ border: 'none', borderTop: '1px solid #1c1c1e', margin: '22px 0' }} />,
                      }}
                    >
                      {bodyMarkdown}
                    </ReactMarkdown>
                  </article>
                ) : !summary ? (
                  <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: '#525252', fontStyle: 'italic' }}>
                    No additional content available for this entity.
                  </p>
                ) : null}
              </main>

              {/* Metadata table */}
              <aside>
                {displayFields.length > 0 && (
                  <div style={{ background: '#0a0a0a', border: '1px solid #1c1c1e', borderRadius: 12, padding: '16px 16px 4px', position: 'sticky', top: 20 }}>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                      Metadata
                    </h2>
                    <dl style={{ margin: 0 }}>
                      {displayFields.map(([key, values]) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                          <dt style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {humanizeKey(key)}
                          </dt>
                          <dd style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {values
                              .filter((v) => v && v.toLowerCase() !== 'unknown')
                              .map((v, idx) => (
                                <span key={idx} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#a1a1a6', background: '#141414', border: '1px solid #1f1f1f', borderRadius: 5, padding: '3px 7px', wordBreak: 'break-word' }}>
                                  {v}
                                </span>
                              ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </aside>
            </div>

            {/* Relationships panel */}
            {(backlinks.length > 0 || outbound.length > 0) && (
              <div style={{ marginTop: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#ffffff' }}>
                    Relationships
                  </h2>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#525252' }}>
                    {backlinks.length + outbound.length} linked
                  </span>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <RelationColumn
                    title="Linked From"
                    accent="#ff9f0a"
                    icon={<ArrowDownLeft size={14} aria-hidden="true" />}
                    rels={backlinks}
                  />
                  <RelationColumn
                    title="Linked To"
                    accent="#0a84ff"
                    icon={<ArrowUpRight size={14} aria-hidden="true" />}
                    rels={outbound}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
