import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to make bestdinnerparty.com serve the dinner party app
 * at the root (/) instead of requiring /dinnerparty prefix.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isBestDinnerParty = host.includes('bestdinnerparty.com');

  if (!isBestDinnerParty) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // API routes: rewrite /api/dinnerparty/* as-is (they already have the right prefix)
  if (pathname.startsWith('/api/dinnerparty')) return NextResponse.next();

  // Static assets and Next.js internals — pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rewrite root and sub-paths to /dinnerparty/*
  // bestdinnerparty.com/ → /dinnerparty
  // bestdinnerparty.com/dinner/abc → /dinnerparty/dinner/abc
  // bestdinnerparty.com/research/abc → /dinnerparty/research/abc
  if (!pathname.startsWith('/dinnerparty')) {
    const newPath = pathname === '/' ? '/dinnerparty' : `/dinnerparty${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
