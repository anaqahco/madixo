import { NextResponse } from 'next/server';
import {
  MADIXO_PLAN_COOKIE,
  getCurrentMadixoPlanPayload,
} from '@/lib/madixo-plan-store';
import {
  getMadixoBillingEnvironment,
  normalizeMadixoBillingStatus,
  type MadixoBillingInfo,
} from '@/lib/madixo-billing';
import {
  getPlanLabel,
  getPlanLimits,
  parsePlan,
  type MadixoPlan,
} from '@/lib/madixo-plans';
import {
  getCurrentMadixoPlanUsage,
  type MadixoPlanUsage,
} from '@/lib/madixo-plan-usage';
import { createClient } from '@/lib/supabase/server';

type SafeMetadata = Record<string, unknown>;

type CurrentPlanPayloadShape = {
  plan: MadixoPlan;
  label: string;
  limits: ReturnType<typeof getPlanLimits>;
  billing: MadixoBillingInfo;
};

function detectLanguage(value: string | null): 'ar' | 'en' {
  if (!value) return 'en';
  return value.toLowerCase().includes('ar') ? 'ar' : 'en';
}

function getBearerToken(request: Request) {
  const value = request.headers.get('authorization');
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function toMetadataRecord(value: unknown): SafeMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as SafeMetadata;
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getBoolean(value: unknown) {
  return value === true;
}

function buildBillingFromMetadata(metadata: SafeMetadata): MadixoBillingInfo {
  return {
    provider: 'paddle',
    configured: Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN),
    checkoutEnabled: Boolean(
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
        process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY
    ),
    environment: getMadixoBillingEnvironment(),
    status: normalizeMadixoBillingStatus(metadata.madixo_billing_status),
    customerId: getString(metadata.madixo_paddle_customer_id),
    subscriptionId: getString(metadata.madixo_paddle_subscription_id),
    priceId: getString(metadata.madixo_paddle_price_id),
    nextBilledAt: getString(metadata.madixo_paddle_next_billed_at),
    cancelAtPeriodEnd: getBoolean(metadata.madixo_paddle_cancel_at_period_end),
    lastUpdatedAt: getString(metadata.madixo_paddle_updated_at),
  };
}

function buildPayloadFromMetadata(
  metadata: SafeMetadata,
  language: 'ar' | 'en'
): CurrentPlanPayloadShape {
  const plan = parsePlan(
    typeof metadata.madixo_plan === 'string' ? metadata.madixo_plan : null
  );
  const normalizedPlan = plan || 'free';

  return {
    plan: normalizedPlan,
    label: getPlanLabel(normalizedPlan, language),
    limits: getPlanLimits(normalizedPlan),
    billing: buildBillingFromMetadata(metadata),
  };
}

function buildFallbackUsage(plan: MadixoPlan): MadixoPlanUsage {
  const limits = getPlanLimits(plan);

  return {
    analysisRunsUsed: 0,
    analysisRunsLimit: limits.analysisRuns,
    savedReportsUsed: 0,
    savedReportsLimit: limits.savedReports,
    compareReportsLimit: limits.compareReports,
  };
}

async function getPayloadForRequest(
  request: Request,
  language: 'ar' | 'en'
): Promise<CurrentPlanPayloadShape> {
  const accessToken = getBearerToken(request);

  if (accessToken) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (!error && user) {
        return buildPayloadFromMetadata(toMetadataRecord(user.user_metadata), language);
      }
    } catch {
      // Fall back to cookie-based plan below.
    }
  }

  return getCurrentMadixoPlanPayload(language);
}

export async function GET(request: Request) {
  const language = detectLanguage(request.headers.get('accept-language'));

  try {
    const payload = await getPayloadForRequest(request, language);

    let usage: MadixoPlanUsage;
    try {
      usage = await getCurrentMadixoPlanUsage(request);
    } catch {
      usage = buildFallbackUsage(payload.plan);
    }

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
    const payload = await getCurrentMadixoPlanPayload(language).catch(() => ({
      plan: 'free' as const,
      label: getPlanLabel('free', language),
      limits: getPlanLimits('free'),
      billing: buildBillingFromMetadata({}),
    }));

    return NextResponse.json({
      ok: true,
      ...payload,
      usage: buildFallbackUsage(payload.plan),
      warning:
        error instanceof Error ? error.message : 'Fell back to a safe plan payload.',
    });
  }
}
