import { NextResponse, type NextRequest } from 'next/server';
import {
  UI_LANGUAGE_COOKIE,
  isUiLanguage,
  type UiLanguage,
} from '@/lib/ui-language';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function getPreferredUiLanguage(request: NextRequest): UiLanguage {
  const queryLanguage = request.nextUrl.searchParams.get('uiLang');

  if (isUiLanguage(queryLanguage)) {
    return queryLanguage;
  }

  const cookieLanguage = request.cookies.get(UI_LANGUAGE_COOKIE)?.value;

  if (isUiLanguage(cookieLanguage)) {
    return cookieLanguage;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() || '';

  return acceptLanguage.startsWith('ar') || acceptLanguage.includes(',ar')
    ? 'ar'
    : 'en';
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const resolvedLanguage = getPreferredUiLanguage(request);
  const existingCookie = request.cookies.get(UI_LANGUAGE_COOKIE)?.value;

  if (!isUiLanguage(existingCookie) || existingCookie !== resolvedLanguage) {
    response.cookies.set(UI_LANGUAGE_COOKIE, resolvedLanguage, {
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
