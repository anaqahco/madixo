import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_AUTHENTICATED_REDIRECT = '/dashboard';

function isProtectedRoute(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/validate')
  );
}

function isAuthRoute(pathname: string) {
  return pathname === '/login';
}

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith('/')) {
    return DEFAULT_AUTHENTICATED_REDIRECT;
  }

  return value;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const pathname = request.nextUrl.pathname;
  const currentPathWithQuery = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('mode', 'login');
    loginUrl.searchParams.set('next', currentPathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute(pathname)) {
    const nextParam = getSafeNext(request.nextUrl.searchParams.get('next'));
    const destinationUrl = new URL(nextParam, request.url);
    return NextResponse.redirect(destinationUrl);
  }

  response.headers.set('Cache-Control', 'private, no-store, max-age=0');

  return response;
}
