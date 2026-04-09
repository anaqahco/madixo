import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MADIXO_PLAN_COOKIE } from '@/lib/madixo-plan-store';
import { buildAbsoluteAppUrl } from '@/lib/app-url';

function clearPlanCookie(response: NextResponse) {
  response.cookies.set(MADIXO_PLAN_COOKIE, '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  });
}

function buildDestinationUrl(notice: string) {
  return buildAbsoluteAppUrl(`/?notice=${encodeURIComponent(notice || 'signed_out')}`);
}

async function signOutSafely() {
  try {
    const supabase = await createClient();

    await Promise.race([
      supabase.auth.signOut(),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
  } catch {
    // ignore and continue redirecting home
  }
}

export async function GET(request: NextRequest) {
  const notice = request.nextUrl.searchParams.get('notice')?.trim() || 'signed_out';

  await signOutSafely();

  const response = NextResponse.redirect(buildDestinationUrl(notice), {
    status: 303,
  });

  clearPlanCookie(response);
  return response;
}
