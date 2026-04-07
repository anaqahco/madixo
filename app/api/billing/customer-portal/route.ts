import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMadixoPaddleApiBaseUrl } from '@/lib/madixo-billing';
import { getCurrentMadixoBilling } from '@/lib/madixo-plan-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPaddleApiKey() {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is missing.');
  }

  return apiKey;
}

function findFirstPortalUrl(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('http')) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    const found = findFirstPortalUrl(nested);
    if (found) {
      return found;
    }
  }

  return null;
}

export async function POST() {
  try {
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

    const billing = await getCurrentMadixoBilling();

    if (!billing.customerId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No Paddle customer was found for this user yet.',
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${getMadixoPaddleApiBaseUrl()}/customers/${billing.customerId}/portal-sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getPaddleApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          billing.subscriptionId
            ? {
                subscription_ids: [billing.subscriptionId],
              }
            : {}
        ),
        cache: 'no-store',
      }
    );

    const payload = (await response.json().catch(() => ({}))) as {
      data?: {
        urls?: Record<string, unknown>;
      };
      error?: {
        detail?: string;
      };
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            payload.error?.detail ||
            'Could not create a Paddle customer portal session.',
        },
        { status: response.status }
      );
    }

    const url = findFirstPortalUrl(payload.data?.urls) || null;

    if (!url) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Paddle did not return a customer portal URL.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to open the billing portal.',
      },
      { status: 500 }
    );
  }
}
