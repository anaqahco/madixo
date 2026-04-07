import { NextResponse } from 'next/server';
import {
  MADIXO_PLAN_COOKIE,
  getCurrentMadixoPlanPayload,
} from '@/lib/madixo-plan-store';
import { getCurrentMadixoPlanUsage } from '@/lib/madixo-plan-usage';

function detectLanguage(value: string | null): 'ar' | 'en' {
  if (!value) return 'en';
  return value.toLowerCase().includes('ar') ? 'ar' : 'en';
}

export async function GET(request: Request) {
  try {
    const language = detectLanguage(request.headers.get('accept-language'));
    const payload = await getCurrentMadixoPlanPayload(language);
    const usage = await getCurrentMadixoPlanUsage(request);

    const response = NextResponse.json({
      ok: true,
      ...payload,
      usage,
    });

    response.cookies.set(MADIXO_PLAN_COOKIE, payload.plan, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to read current plan.',
      },
      { status: 500 }
    );
  }
}
