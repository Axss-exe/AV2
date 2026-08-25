import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export const runtime = 'edge';

function getPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const country = searchParams.get('country');
  const category = searchParams.get('category');

  const pool = getPool();

  try {
    if (id) {
      const result = await pool.query(
        'SELECT * FROM news_articles WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ status: 'success', article: result.rows[0] });
    }

    let query =
      'SELECT id, headline, source, published_at, summary, category, country_tag FROM news_articles';
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (country) {
      values.push(country);
      conditions.push(`country_tag = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY published_at DESC';

    const result = await pool.query(query, values);
    return NextResponse.json({
      status: 'success',
      count: result.rows.length,
      articles: result.rows,
    });
  } catch (error) {
    console.error('[v0] Neon query error:', error);
    return NextResponse.json(
      { status: 'error', detail: 'Database query failed' },
      { status: 500 }
    );
  }
}
