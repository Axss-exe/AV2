import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'atis-demo-access';

export function proxy(request: NextRequest) {
  const hasAccess = request.cookies.get(COOKIE_NAME)?.value === 'granted';
  if (hasAccess) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.searchParams.set('access', 'required');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/atis-dashboard/:path*',
    '/query/:path*',
    '/investigations/:path*',
    '/opportunities/:path*',
    '/history/:path*',
    '/entities/:path*',
    '/news/:path*',
    '/execute/:path*',
  ],
};
