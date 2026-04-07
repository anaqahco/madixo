import { NextResponse } from 'next/server';
import { normalizePlan } from '@/lib/madixo-plans';
import {
  MADIXO_PLAN_COOKIE,
  persistCurrentUserPlan,
} from '@/lib/madixo-plan-store';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      plan?: string;
      redirectTo?: string;
    };

    const plan = normalizePlan(body.plan);
    const redirectTo =
      typeof body.redirectTo === 'string' && body.redirectTo.startsWith('/')
        ? body.redirectTo
        : '/dashboard';

    await persistCurrentUserPlan(plan);

    const response = NextResponse.json({
      ok: true,
      plan,
      redirectTo,
    });

    response.cookies.set(MADIXO_PLAN_COOKIE, plan, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to select plan.',
      },
      { status: 400 }
    );
  }
}
