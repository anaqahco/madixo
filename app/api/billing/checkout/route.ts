import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getMadixoBillingEnvironment,
  getMadixoPaddlePriceId,
} from '@/lib/madixo-billing';
import { getCurrentMadixoPlan } from '@/lib/madixo-plan-store';
import { normalizePlan } from '@/lib/madixo-plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestedBody = {
  plan?: string;
};

function cleanBaseUrl(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    return null;
  }
}

function buildOriginFromForwardedHeaders(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host')?.trim();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.trim() || 'https';

  if (!forwardedHost) {
    return null;
  }

  try {
    return new URL(`${forwardedProto}://${forwardedHost}`).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string | null) {
  if (!origin) return true;

  return (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('0.0.0.0')
  );
}

function resolvePublicBaseUrl(request: Request) {
  const candidates = [
    buildOriginFromForwardedHeaders(request),
    cleanBaseUrl(request.headers.get('origin')),
    (() => {
      const referer = request.headers.get('referer');
      if (!referer) return null;
      try {
        return new URL(referer).origin;
      } catch {
        return null;
      }
    })(),
    cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL),
    cleanBaseUrl(process.env.APP_URL),
    cleanBaseUrl(request.url),
  ];

  const publicCandidate = candidates.find((candidate) => candidate && !isLocalOrigin(candidate));
  if (publicCandidate) {
    return publicCandidate;
  }

  return candidates.find(Boolean) ?? 'http://localhost:3000';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RequestedBody;
    const requestedPlan = normalizePlan(body.plan);

    if (requestedPlan === 'free') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Use the billing portal to move back to the free plan.',
        },
        { status: 400 }
      );
    }

    if (requestedPlan === 'team') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Team billing is not enabled yet.',
        },
        { status: 400 }
      );
    }

    const priceId = getMadixoPaddlePriceId(requestedPlan);
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = getMadixoBillingEnvironment();

    if (!clientToken || !priceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Paddle checkout is not fully configured. Add the Paddle client token and price IDs first.',
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          loginRedirect: `/login?mode=login&next=${encodeURIComponent('/pricing')}`,
          error: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your account does not have an email address that can be sent to checkout.',
        },
        { status: 400 }
      );
    }

    const currentPlan = await getCurrentMadixoPlan();

    if (currentPlan === requestedPlan) {
      return NextResponse.json({
        ok: true,
        alreadyActive: true,
      });
    }

    const publicBaseUrl = resolvePublicBaseUrl(request);

    return NextResponse.json({
      ok: true,
      checkout: {
        clientToken,
        environment,
        priceId,
        customerEmail: user.email,
        successUrl: `${publicBaseUrl}/pricing?checkout=success&plan=${requestedPlan}`,
        customData: {
          madixo_user_id: user.id,
          madixo_user_email: user.email,
          madixo_plan: requestedPlan,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to prepare checkout.',
      },
      { status: 500 }
    );
  }
}
