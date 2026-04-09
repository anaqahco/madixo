'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getBrowserAppUrl } from '@/lib/app-url';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  uiLang: UiLanguage;
  nextPath: string;
  mode: 'login' | 'signup';
};

const OAUTH_NEXT_COOKIE = 'madixo_oauth_next';
const OAUTH_FLOW_COOKIE = 'madixo_oauth_flow';
const OAUTH_COOKIE_MAX_AGE = 60 * 10;

const COPY = {
  en: {
    login: 'Continue with Google',
    signup: 'Create account with Google',
    loading: 'Redirecting...',
    error: 'We could not start Google sign-in. Please try again.',
  },
  ar: {
    login: 'المتابعة عبر Google',
    signup: 'إنشاء الحساب عبر Google',
    loading: 'جارٍ التحويل...',
    error: 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.',
  },
} as const;

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.2 0-.5 0-.9-.1-1.3H12Z"
      />
      <path
        fill="#34A853"
        d="M2.5 7.8 5.7 10c.9-2.6 3.4-4.3 6.3-4.3 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 8 2.5 4.6 4.8 2.5 7.8Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.5c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.3 1.1-3.9 0-5.3-2.5-5.5-3.8l-3.1 2.4c2 4 5.6 5 8.6 5Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.9c.1-.4.1-.8.1-1.3s0-.9-.1-1.3H12v3.9h5.5c-.3 1.6-1.3 2.8-2.3 3.6l2.9 2.4c1.7-1.6 3-3.9 3-7.3Z"
      />
    </svg>
  );
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export default function GoogleAuthButton({
  uiLang,
  nextPath,
  mode,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = COPY[uiLang];

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError('');

      setCookie(OAUTH_NEXT_COOKIE, nextPath, OAUTH_COOKIE_MAX_AGE);
      setCookie(OAUTH_FLOW_COOKIE, 'oauth', OAUTH_COOKIE_MAX_AGE);

      const supabase = createClient();
      const appUrl = getBrowserAppUrl();
      const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}&flow=oauth`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch {
      clearCookie(OAUTH_NEXT_COOKIE);
      clearCookie(OAUTH_FLOW_COOKIE);
      setLoading(false);
      setError(copy.error);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        <span>{loading ? copy.loading : copy[mode]}</span>
      </button>

      {error ? (
        <div className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
