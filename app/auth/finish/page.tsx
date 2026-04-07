'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthShellHeader from '@/components/auth-shell-header';
import { createClient } from '@/lib/supabase/client';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

type StatusKey = 'finalizing' | 'redirecting' | 'error';

type SessionPayload = {
  ok?: boolean;
  sessionState?: 'guest' | 'user';
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_NEXT = '/dashboard';

const COPY = {
  en: {
    dir: 'ltr',
    badge: 'Finishing Sign In',
    title: 'Signing you in',
    messages: {
      finalizing: 'Finalizing your session...',
      redirecting: 'Your session is ready. Redirecting you now...',
      error: 'Something went wrong while finalizing your session.',
    },
  },
  ar: {
    dir: 'rtl',
    badge: 'استكمال تسجيل الدخول',
    title: 'جارٍ تسجيل دخولك',
    messages: {
      finalizing: 'جارٍ إنهاء جلستك...',
      redirecting: 'جلستك أصبحت جاهزة. جارٍ تحويلك الآن...',
      error: 'حدث خطأ أثناء استكمال جلسة تسجيل الدخول.',
    },
  },
} as const;

export default function AuthFinishPage() {
  const searchParams = useSearchParams();
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguage>('en');
  const [status, setStatus] = useState<StatusKey>('finalizing');

  const nextPath = useMemo(() => {
    const raw = searchParams.get('next') || DEFAULT_NEXT;
    return raw.startsWith('/') ? raw : DEFAULT_NEXT;
  }, [searchParams]);

  useEffect(() => {
    setPreferredLanguage(getClientUiLanguage('en'));
  }, []);

  const copy = COPY[preferredLanguage];
  const message = copy.messages[status];

  useEffect(() => {
    let cancelled = false;

    const redirectToNext = async () => {
      if (cancelled) return;
      setStatus('redirecting');
      await sleep(200);
      if (!cancelled) {
        window.location.replace(nextPath);
      }
    };

    const redirectToLogin = async () => {
      if (cancelled) return;
      setStatus('error');
      await sleep(700);
      if (!cancelled) {
        window.location.replace(
          `/login?mode=login&next=${encodeURIComponent(nextPath)}`
        );
      }
    };

    const hasServerSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) return false;

        const payload = (await response.json()) as SessionPayload;
        return payload.sessionState === 'user';
      } catch {
        return false;
      }
    };

    const run = async () => {
      try {
        if (await hasServerSession()) {
          await redirectToNext();
          return;
        }

        const supabase = createClient();

        for (let i = 0; i < 12; i += 1) {
          const [{ data: sessionData }, serverHasSession] = await Promise.all([
            supabase.auth.getSession(),
            hasServerSession(),
          ]);

          if (sessionData.session || serverHasSession) {
            await redirectToNext();
            return;
          }

          await sleep(250);
        }

        await redirectToLogin();
      } catch {
        await redirectToLogin();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 py-8 text-[#111827] md:py-10"
    >
      <AuthShellHeader uiLang={preferredLanguage} showAuthActions={false} />

      <div className="mx-auto mt-8 max-w-2xl rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm md:p-10">
        <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
          {copy.badge}
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4B5563]">
          {message}
        </p>
      </div>
    </main>
  );
}
