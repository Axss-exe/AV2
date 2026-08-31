import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const sql = neon(process.env.DATABASE_URL!);

type ArticleRow = Record<string, unknown>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const country = searchParams.get('country');
  const category = searchParams.get('category');

  try {
    if (id) {
      const rows = await sql`
        SELECT * FROM news_articles WHERE id = ${id} LIMIT 1
      ` as ArticleRow[];
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 'success', article: rows[0] });
    }

    const rows = country && category
      ? await sql`
          SELECT id, headline, source, published_at, summary, category, country_tag
          FROM news_articles
          WHERE country_tag = ${country} AND category = ${category}
          ORDER BY published_at DESC
        `
      : country
        ? await sql`
            SELECT id, headline, source, published_at, summary, category, country_tag
            FROM news_articles
            WHERE country_tag = ${country}
            ORDER BY published_at DESC
          `
        : category
          ? await sql`
              SELECT id, headline, source, published_at, summary, category, country_tag
              FROM news_articles
              WHERE category = ${category}
              ORDER BY published_at DESC
            `
          : await sql`
              SELECT id, headline, source, published_at, summary, category, country_tag
              FROM news_articles
              ORDER BY published_at DESC
            `;

    return NextResponse.json({ status: 'success', count: rows.length, articles: rows });
  } catch (error) {
    console.error('[v0] Neon article query error:', error instanceof Error ? error.message : 'Unknown database error');
    return NextResponse.json(
      { status: 'error', detail: 'Database query failed' },
      { status: 500 }
    );
  }
}
