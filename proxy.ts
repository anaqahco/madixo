import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from './lib/supabase/middleware';

const UI_LANG_COOKIE = 'madixo_ui_lang';
const OAUTH_NEXT_COOKIE = 'madixo_oauth_next';
const SUPPORTED_LANGUAGES = new Set(['en', 'ar']);
const DEFAULT_AUTH_REDIRECT = '/dashboard';

function isSupportedLanguage(value: string | null | undefined): value is 'en' | 'ar' {
  return value === 'en' || value === 'ar';
}

function detectUiLanguage(request: NextRequest): 'en' | 'ar' {
  const queryLang = request.nextUrl.searchParams.get('uiLang');
  if (isSupportedLanguage(queryLang)) {
    return queryLang;
  }

  const cookieLang = request.cookies.get(UI_LANG_COOKIE)?.value;
  if (isSupportedLanguage(cookieLang)) {
    return cookieLang;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (acceptLanguage.includes('ar')) {
    return 'ar';
  }

  return 'en';
}

function getSafeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/')) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/validate')
  );
}

function buildOAuthCallbackRedirect(request: NextRequest) {
  const callbackUrl = new URL('/auth/callback', request.url);

  request.nextUrl.searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value);
  });

  if (!callbackUrl.searchParams.get('flow')) {
    callbackUrl.searchParams.set('flow', 'oauth');
  }

  const nextFromQuery = callbackUrl.searchParams.get('next');
  const nextFromCookie = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  callbackUrl.searchParams.set('next', getSafeNextPath(nextFromQuery ?? nextFromCookie));

  return callbackUrl;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const uiLang = detectUiLanguage(request);

  if (request.nextUrl.searchParams.has('code') && pathname !== '/auth/callback') {
    const redirectUrl = buildOAuthCallbackRedirect(request);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    redirectResponse.cookies.set(UI_LANG_COOKIE, uiLang, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    return redirectResponse;
  }

  const response = isProtectedPath(pathname)
    ? await updateSession(request)
    : NextResponse.next();

  const currentCookie = request.cookies.get(UI_LANG_COOKIE)?.value;
  if (!isSupportedLanguage(currentCookie) || currentCookie !== uiLang) {
    response.cookies.set(UI_LANG_COOKIE, uiLang, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
