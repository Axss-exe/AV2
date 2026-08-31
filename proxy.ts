import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'atis-demo-access';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // The landing page and this endpoint are the only public entry points.
  if (pathname === '/' || pathname === '/api/demo-access') {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(COOKIE_NAME)?.value === 'granted';
  if (hasAccess) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.searchParams.set('access', 'required');
  return NextResponse.redirect(url);
}

export const config = {
  // Protect platform pages without intercepting their data/API requests.
  // Intercepting API redirects can turn a failed fetch into an unexpected
  // navigation back to the landing page.
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
