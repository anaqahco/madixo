import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MADIXO_PLAN_COOKIE } from '@/lib/madixo-plan-store';

type SessionUser = Pick<User, 'email' | 'user_metadata' | 'app_metadata'>;

function getUserDisplayName(user: SessionUser | null) {
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

function getUserAvatar(user: SessionUser | null) {
  if (!user) return '';

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const candidate = metadata.avatar_url || metadata.picture || '';

  return typeof candidate === 'string' ? candidate.trim() : '';
}

function getProvider(user: SessionUser | null) {
  if (!user) return 'email';

  const providers = user.app_metadata?.providers;

  if (Array.isArray(providers) && typeof providers[0] === 'string') {
    return providers[0];
  }

  const provider = user.app_metadata?.provider;
  return typeof provider === 'string' ? provider : 'email';
}

function buildNoStoreHeaders() {
  return {
    'Cache-Control': 'private, no-store, max-age=0',
  };
}

function clearPlanCookie(response: NextResponse) {
  response.cookies.set(MADIXO_PLAN_COOKIE, '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          ok: true,
          sessionState: 'guest',
          userSummary: null,
        },
        {
          headers: buildNoStoreHeaders(),
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        sessionState: 'user',
        userSummary: {
          name: getUserDisplayName(user),
          email: user.email || '',
          avatarUrl: getUserAvatar(user),
          provider: getProvider(user),
        },
      },
      {
        headers: buildNoStoreHeaders(),
      }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        sessionState: 'guest',
        userSummary: null,
      },
      {
        status: 500,
        headers: buildNoStoreHeaders(),
      }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const response = NextResponse.json(
      {
        ok: true,
        sessionState: 'guest',
        userSummary: null,
      },
      {
        headers: buildNoStoreHeaders(),
      }
    );

    clearPlanCookie(response);
    return response;
  } catch {
    const response = NextResponse.json(
      {
        ok: false,
        sessionState: 'guest',
        userSummary: null,
      },
      {
        status: 500,
        headers: buildNoStoreHeaders(),
      }
    );

    clearPlanCookie(response);
    return response;
  }
}
