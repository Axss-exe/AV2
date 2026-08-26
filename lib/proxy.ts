/**
 * Server-side proxy helper.
 * All client fetch calls go to /api/* (same origin, no CORS).
 * These Next.js route handlers forward them to the real backend.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://atisv2.onrender.com';

export async function proxyPOST(path: string, req: Request): Promise<Response> {
  return proxyPOSTWithTimeout(path, req);
}

export async function proxyPOSTWithTimeout(
  path: string,
  req: Request,
  timeoutMs = 120_000
): Promise<Response> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(`${BACKEND}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body !== null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function proxyGET(path: string): Promise<Response> {
  const upstream = await fetch(`${BACKEND}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await upstream.text();
  return new Response(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
