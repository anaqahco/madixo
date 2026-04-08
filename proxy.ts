import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from './lib/supabase/middleware';

const UI_LANG_COOKIE = 'madixo_ui_lang';
const SUPPORTED_LANGUAGES = new Set(['en', 'ar']);

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

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/validate')
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const uiLang = detectUiLanguage(request);

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
