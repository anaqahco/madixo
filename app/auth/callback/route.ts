import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MADIXO_PLAN_COOKIE, syncPlanCookieFromUser } from '@/lib/madixo-plan-store';

type UiLanguage = 'ar' | 'en';
type AuthFlow = 'oauth' | 'email' | 'recovery';

const DEFAULT_NEXT = '/dashboard';

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

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return DEFAULT_NEXT;
  }

  return value;
}

function getFlow(value: string | null): AuthFlow {
  if (value === 'oauth') return 'oauth';
  if (value === 'recovery') return 'recovery';
  return 'email';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const language = detectLanguage(request.headers.get('accept-language'));
  const copy = COPY[language];
  const next = getSafeNext(searchParams.get('next'));
  const flow = getFlow(searchParams.get('flow'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const cookiePlan = (await syncPlanCookieFromUser()) ?? 'free';

      let destination = `${origin}/auth/verified?next=${encodeURIComponent(next)}`;

      if (flow === 'oauth') {
        destination = `${origin}/auth/finish?next=${encodeURIComponent(next)}`;
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

      return response;
    }
  }

  const message =
    flow === 'oauth'
      ? copy.oauthError
      : flow === 'recovery'
        ? copy.recoveryError
        : copy.verificationError;

  return NextResponse.redirect(
    `${origin}/auth/error?next=${encodeURIComponent(next)}&message=${encodeURIComponent(message)}`
  );
}
