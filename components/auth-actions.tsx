'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  uiLang: UiLanguage;
};

type SessionState = 'loading' | 'guest' | 'user';

type UserSummary = {
  name: string;
  email: string;
  avatarUrl: string;
  provider: string;
};

type AuthSnapshot = {
  sessionState: Exclude<SessionState, 'loading'>;
  userSummary: UserSummary | null;
  savedAt: number;
};

const AUTH_SNAPSHOT_KEY = 'madixo_auth_snapshot_v1';
const AUTH_SNAPSHOT_TTL_MS = 1000 * 60 * 60 * 24 * 3;

const COPY = {
  en: {
    blog: 'Blog',
    login: 'Log In',
    signup: 'Create Account',
    dashboard: 'Dashboard',
    newScan: 'New Scan',
    reports: 'My Reports',
    compare: 'Compare Reports',
    pricing: 'Plans',
    logout: 'Log Out',
    signedInAs: 'Signed in as',
    signedIn: 'Signed in',
    providerGoogle: 'Google',
    providerEmail: 'Email',
    providerOther: 'Account',
    signingOut: 'Signing out...',
  },
  ar: {
    blog: 'المدونة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    newScan: 'تحليل جديد',
    reports: 'تقاريري',
    compare: 'مقارنة التقارير',
    pricing: 'الباقات',
    logout: 'تسجيل الخروج',
    signedInAs: 'تم تسجيل الدخول عبر',
    signedIn: 'تم تسجيل الدخول',
    providerGoogle: 'Google',
    providerEmail: 'البريد الإلكتروني',
    providerOther: 'الحساب',
    signingOut: 'جارٍ تسجيل الخروج...',
  },
} as const;

function getUserDisplayName(user: User | null) {
  if (!user) return '';

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const candidate =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    metadata.preferred_username ||
    user.email ||
    '';

  return typeof candidate === 'string' ? candidate.trim() : '';
}

function getUserAvatar(user: User | null) {
  if (!user) return '';

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const candidate = metadata.avatar_url || metadata.picture || '';

  return typeof candidate === 'string' ? candidate.trim() : '';
}

function getProviderKey(session: Session | null, user: User | null) {
  const providers = session?.user?.app_metadata?.providers;

  if (Array.isArray(providers) && typeof providers[0] === 'string') {
    return providers[0];
  }

  const provider = user?.app_metadata?.provider;
  return typeof provider === 'string' ? provider : 'email';
}

function getProviderLabel(provider: string, uiLang: UiLanguage) {
  const copy = COPY[uiLang];

  if (provider === 'google') return copy.providerGoogle;
  if (provider === 'email') return copy.providerEmail;
  return copy.providerOther;
}

function getInitials(name: string, email: string) {
  const source = name || email;
  if (!source) return 'M';

  const words = source
    .replace(/[@._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) return 'M';

  return words
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function readAuthSnapshot(): AuthSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_SNAPSHOT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;

    if (
      !parsed ||
      (parsed.sessionState !== 'guest' && parsed.sessionState !== 'user') ||
      typeof parsed.savedAt !== 'number'
    ) {
      return null;
    }

    if (Date.now() - parsed.savedAt > AUTH_SNAPSHOT_TTL_MS) {
      return null;
    }

    return {
      sessionState: parsed.sessionState,
      userSummary: parsed.userSummary ?? null,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

function writeAuthSnapshot(snapshot: AuthSnapshot | null) {
  if (typeof window === 'undefined') return;

  try {
    if (!snapshot) {
      window.localStorage.removeItem(AUTH_SNAPSHOT_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage failures
  }
}

function clearSupabaseBrowserStorage() {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;

      if (
        key === AUTH_SNAPSHOT_KEY ||
        key.startsWith('sb-') ||
        key.includes('supabase')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // ignore storage failures
  }
}

function buildSummaryFromUser(session: Session | null, user: User | null): UserSummary | null {
  if (!session || !user) return null;

  return {
    name: getUserDisplayName(user),
    email: user.email || '',
    avatarUrl: getUserAvatar(user),
    provider: getProviderKey(session, user),
  };
}

function applySnapshotState(
  snapshotState: Exclude<SessionState, 'loading'>,
  summary: UserSummary | null,
  setSessionState: (value: SessionState) => void,
  setUserSummary: (value: UserSummary | null) => void
) {
  setSessionState(snapshotState);
  setUserSummary(summary);
  writeAuthSnapshot({
    sessionState: snapshotState,
    userSummary: summary,
    savedAt: Date.now(),
  });
}

export default function AuthActions({ uiLang }: Props) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const [hasHydrated, setHasHydrated] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    let mounted = true;

    const setGuest = () => {
      if (!mounted) return;
      applySnapshotState('guest', null, setSessionState, setUserSummary);
    };

    const setUser = (summary: UserSummary) => {
      if (!mounted) return;
      applySnapshotState('user', summary, setSessionState, setUserSummary);
    };

    const syncFromServer = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) return false;

        const payload = (await response.json()) as {
          sessionState?: 'guest' | 'user';
          userSummary?: UserSummary | null;
        };

        if (payload.sessionState === 'user' && payload.userSummary) {
          setUser(payload.userSummary);
          return true;
        }

        if (payload.sessionState === 'guest') {
          setGuest();
          return true;
        }

        return false;
      } catch {
        return false;
      }
    };

    const bootstrap = async () => {
      const cachedSnapshot = readAuthSnapshot();

      if (cachedSnapshot) {
        setSessionState(cachedSnapshot.sessionState);
        setUserSummary(cachedSnapshot.userSummary);
      }

      const syncedFromServer = await syncFromServer();
      if (syncedFromServer) return;

      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      const summary = buildSummaryFromUser(sessionData.session, userData.user);
      if (summary) {
        setUser(summary);
      } else {
        setGuest();
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!session || event === 'SIGNED_OUT') {
          setGuest();
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const summary = buildSummaryFromUser(session, userData.user);

        if (summary) {
          setUser(summary);
          return;
        }

        await syncFromServer();
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hasHydrated, supabase]);

  const copy = COPY[uiLang];
  const nextPath = pathname || '/';

  const pillBase =
    'rounded-full border px-4 py-2 text-sm font-semibold transition';
  const secondaryPill =
    'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]';
  const primaryPill =
    'border-[#111827] bg-[#111827] text-white hover:opacity-90';
  const dangerPill =
    'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2]';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSessionState('guest');
    setUserSummary(null);
    writeAuthSnapshot({
      sessionState: 'guest',
      userSummary: null,
      savedAt: Date.now(),
    });

    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        cache: 'no-store',
        credentials: 'include',
      }).catch(() => null);

      await supabase.auth.signOut().catch(() => null);
    } finally {
      clearSupabaseBrowserStorage();
      writeAuthSnapshot(null);

      const target = `/login?mode=login&next=${encodeURIComponent(nextPath)}`;
      window.location.replace(target);
    }
  };

  if (!hasHydrated || sessionState === 'loading') {
    return <div className="h-10" aria-hidden="true" />;
  }

  if (sessionState === 'guest') {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 ${
          uiLang === 'ar' ? 'justify-end' : 'justify-start'
        }`}
      >
        <Link href="/blog" className={`${pillBase} ${secondaryPill}`}>
          {copy.blog}
        </Link>

        {pathname !== '/pricing' ? (
          <Link href="/pricing" className={`${pillBase} ${secondaryPill}`}>
            {copy.pricing}
          </Link>
        ) : null}

        {pathname !== '/login' ? (
          <>
            <Link
              href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
              className={`${pillBase} ${secondaryPill}`}
            >
              {copy.login}
            </Link>

            <Link
              href={`/login?mode=signup&next=${encodeURIComponent(nextPath)}`}
              className={`${pillBase} ${primaryPill}`}
            >
              {copy.signup}
            </Link>
          </>
        ) : null}
      </div>
    );
  }

  const name = userSummary?.name || '';
  const email = userSummary?.email || '';
  const avatarUrl = userSummary?.avatarUrl || '';
  const initials = getInitials(name, email);
  const providerLabel = getProviderLabel(userSummary?.provider || 'email', uiLang);

  return (
    <div className="flex w-full flex-col gap-3 md:max-w-[640px]">
      <div
        className={`flex items-center gap-3 rounded-[22px] border border-[#E5E7EB] bg-white px-3 py-3 shadow-sm ${
          uiLang === 'ar' ? 'text-right' : 'text-left'
        }`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name || email || 'User avatar'}
            className="h-11 w-11 rounded-full border border-[#E5E7EB] object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#111827] text-sm font-bold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[#111827]">
              {name || email || copy.signedIn}
            </p>
            <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
              {providerLabel}
            </span>
          </div>

          {email ? (
            <p className="truncate text-xs text-[#6B7280]">{email}</p>
          ) : null}

          <p className="mt-1 text-[11px] font-medium text-[#6B7280]">
            {copy.signedInAs} {providerLabel}
          </p>
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 ${
          uiLang === 'ar' ? 'justify-end' : 'justify-start'
        }`}
      >
        <Link href="/blog" className={`${pillBase} ${secondaryPill}`}>
          {copy.blog}
        </Link>

        {pathname !== '/dashboard' ? (
          <Link href="/dashboard" className={`${pillBase} ${secondaryPill}`}>
            {copy.dashboard}
          </Link>
        ) : null}

        {pathname !== '/' ? (
          <Link href="/" className={`${pillBase} ${secondaryPill}`}>
            {copy.newScan}
          </Link>
        ) : null}

        {pathname !== '/reports' ? (
          <Link href="/reports" className={`${pillBase} ${secondaryPill}`}>
            {copy.reports}
          </Link>
        ) : null}

        {pathname !== '/compare' ? (
          <Link href="/compare" className={`${pillBase} ${secondaryPill}`}>
            {copy.compare}
          </Link>
        ) : null}

        {pathname !== '/pricing' ? (
          <Link href="/pricing" className={`${pillBase} ${secondaryPill}`}>
            {copy.pricing}
          </Link>
        ) : null}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`${pillBase} ${dangerPill}`}
        >
          {isSigningOut ? copy.signingOut : copy.logout}
        </button>
      </div>
    </div>
  );
}
