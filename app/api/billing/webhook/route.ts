import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanFromPaddlePriceId, normalizeMadixoBillingStatus } from '@/lib/madixo-billing';
import { normalizePlan, type MadixoPlan } from '@/lib/madixo-plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PaddleEvent<TData = Record<string, unknown>> = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: TData;
};

type PaddleSubscriptionItem = {
  price?: {
    id?: string | null;
    product_id?: string | null;
  } | null;
};

type PaddleSubscription = {
  id?: string;
  status?: string;
  customer_id?: string;
  next_billed_at?: string | null;
  scheduled_change?: {
    action?: string | null;
  } | null;
  custom_data?: Record<string, unknown> | null;
  items?: PaddleSubscriptionItem[] | null;
};

function getWebhookSecret() {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('PADDLE_WEBHOOK_SECRET is missing.');
  }

  return secret;
}

function parseSignatureHeader(value: string | null) {
  if (!value) {
    return null;
  }

  const parts = value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  const timestamp = parts.find((part) => part.startsWith('ts='))?.slice(3) ?? null;
  const signatures = parts
    .filter((part) => part.startsWith('h1='))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

function verifyWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const parsed = parseSignatureHeader(signatureHeader);

  if (!parsed) {
    return false;
  }

  const timestampNumber = Number(parsed.timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const toleranceInSeconds = 60 * 5;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (Math.abs(nowInSeconds - timestampNumber) > toleranceInSeconds) {
    return false;
  }

  const expected = createHmac('sha256', getWebhookSecret())
    .update(`${parsed.timestamp}:${rawBody}`, 'utf8')
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');

  return parsed.signatures.some((signature) => {
    try {
      const receivedBuffer = Buffer.from(signature, 'hex');

      if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function resolvePaidPlan(subscription: PaddleSubscription): MadixoPlan {
  const customPlan = normalizePlan(getString(subscription.custom_data?.madixo_plan));

  if (customPlan !== 'free') {
    return customPlan;
  }

  const firstPriceId = getString(subscription.items?.[0]?.price?.id);
  const mapped = getPlanFromPaddlePriceId(firstPriceId);

  return mapped && mapped !== 'free' ? mapped : 'pro';
}

function resolveAppPlanForStatus(subscription: PaddleSubscription): MadixoPlan {
  const status = normalizeMadixoBillingStatus(subscription.status);
  const paidPlan = resolvePaidPlan(subscription);

  if (status === 'active' || status === 'trialing' || status === 'past_due') {
    return paidPlan;
  }

  return 'free';
}

function toMetadataRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function shouldHandleEvent(eventType: string | null) {
  return (
    eventType === 'subscription.created' ||
    eventType === 'subscription.activated' ||
    eventType === 'subscription.updated' ||
    eventType === 'subscription.trialing' ||
    eventType === 'subscription.paused' ||
    eventType === 'subscription.resumed' ||
    eventType === 'subscription.past_due' ||
    eventType === 'subscription.canceled'
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('paddle-signature');

    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Paddle signature.',
        },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody) as PaddleEvent<PaddleSubscription>;
    const eventType = getString(event.event_type);

    if (!shouldHandleEvent(eventType)) {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    const subscription = event.data || {};
    const userId = getString(subscription.custom_data?.madixo_user_id);

    if (!userId) {
      return NextResponse.json(
        {
          ok: true,
          ignored: true,
          reason: 'No Madixo user id was attached to this subscription.',
        },
        { status: 200 }
      );
    }

    const admin = createAdminClient();
    const { data: userData, error: getUserError } = await admin.auth.admin.getUserById(userId);

    if (getUserError || !userData.user) {
      return NextResponse.json(
        {
          ok: false,
          error: getUserError?.message || 'Supabase user was not found.',
        },
        { status: 404 }
      );
    }

    const existingMetadata = toMetadataRecord(userData.user.user_metadata);
    const nextPlan = resolveAppPlanForStatus(subscription);
    const priceId = getString(subscription.items?.[0]?.price?.id);
    const productId = getString(subscription.items?.[0]?.price?.product_id);
    const billingStatus = normalizeMadixoBillingStatus(subscription.status);
    const cancelAtPeriodEnd = subscription.scheduled_change?.action === 'cancel';

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMetadata,
        madixo_plan: nextPlan,
        madixo_plan_source: 'paddle',
        madixo_plan_updated_at: new Date().toISOString(),
        madixo_billing_provider: 'paddle',
        madixo_billing_status: billingStatus,
        madixo_paddle_customer_id: getString(subscription.customer_id),
        madixo_paddle_subscription_id: getString(subscription.id),
        madixo_paddle_price_id: priceId,
        madixo_paddle_product_id: productId,
        madixo_paddle_next_billed_at: getString(subscription.next_billed_at),
        madixo_paddle_cancel_at_period_end: cancelAtPeriodEnd,
        madixo_paddle_event_type: eventType,
        madixo_paddle_event_id: getString(event.event_id),
        madixo_paddle_updated_at: getString(event.occurred_at) ?? new Date().toISOString(),
      },
    });

    if (updateError) {
      return NextResponse.json(
        {
          ok: false,
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      userId,
      plan: nextPlan,
      billingStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Webhook processing failed.',
      },
      { status: 500 }
    );
  }
}
