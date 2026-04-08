import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  MADIXO_PLAN_COOKIE,
  syncPlanCookieFromUser,
} from '@/lib/madixo-plan-store';

type UiLanguage = 'ar' | 'en';
type AuthFlow = 'oauth' | 'email' | 'recovery';

const DEFAULT_NEXT = '/dashboard';
const OAUTH_NEXT_COOKIE = 'madixo_oauth_next';
const OAUTH_FLOW_COOKIE = 'madixo_oauth_flow';

const COPY = {
  en: {
    verificationError:
      'We could not verify your email. Please try the verification link again.',
    oauthError:
      'We could not complete your Google sign-in. Please try again.',
    recoveryError:
      'We could not prepare your password reset session. Please request a new reset link.',
  },
  ar: {
    verificationError:
      'تعذر التحقق من بريدك الإلكتروني. يرجى إعادة محاولة رابط التحقق مرة أخرى.',
    oauthError:
      'تعذر إكمال تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.',
    recoveryError:
      'تعذر تجهيز جلسة إعادة تعيين كلمة المرور. اطلب رابطًا جديدًا.',
  },
} as const;

function detectLanguage(value: string | null): UiLanguage {
  if (!value) return 'en';
  return value.toLowerCase().includes('ar') ? 'ar' : 'en';
}

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith('/')) {
    return DEFAULT_NEXT;
  }

  return value;
}

function getFlow(value: string | null | undefined): AuthFlow {
  if (value === 'oauth') return 'oauth';
  if (value === 'recovery') return 'recovery';
  return 'email';
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(OAUTH_NEXT_COOKIE, '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  });

  response.cookies.set(OAUTH_FLOW_COOKIE, '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = await cookies();
  const code = searchParams.get('code');
  const language = detectLanguage(request.headers.get('accept-language'));
  const copy = COPY[language];
  const next = getSafeNext(
    searchParams.get('next') ?? cookieStore.get(OAUTH_NEXT_COOKIE)?.value
  );
  const flow = getFlow(
    searchParams.get('flow') ?? cookieStore.get(OAUTH_FLOW_COOKIE)?.value
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const cookiePlan = (await syncPlanCookieFromUser()) ?? 'free';

      let destination = `${origin}/auth/verified?next=${encodeURIComponent(next)}`;

      if (flow === 'oauth') {
        destination = `${origin}${next}`;
      }

      if (flow === 'recovery') {
        destination = `${origin}/reset-password?next=${encodeURIComponent(next)}`;
      }

      const response = NextResponse.redirect(destination);
      response.cookies.set(MADIXO_PLAN_COOKIE, cookiePlan, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      clearOAuthCookies(response);

      return response;
    }
  }

  const message =
    flow === 'oauth'
      ? copy.oauthError
      : flow === 'recovery'
        ? copy.recoveryError
        : copy.verificationError;

  const response = NextResponse.redirect(
    `${origin}/auth/error?next=${encodeURIComponent(next)}&message=${encodeURIComponent(message)}`
  );
  clearOAuthCookies(response);
  return response;
}
