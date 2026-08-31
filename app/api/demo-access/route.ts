import { NextResponse } from 'next/server';

const DEMO_PASSCODE = process.env.DEMO_PASSCODE ?? 'ATIS-2026-ZIMBABWE';
const COOKIE_NAME = 'atis-demo-access';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { passcode?: unknown };
    const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';

    if (!passcode || passcode !== DEMO_PASSCODE) {
      return NextResponse.json({ error: 'Incorrect passcode.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export const DEMO_ACCESS_COOKIE = COOKIE_NAME;
export const DEMO_ACCESS_DEFAULT = DEMO_PASSCODE;
