import 'server-only';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  getMadixoBillingEnvironment,
  normalizeMadixoBillingStatus,
  type MadixoBillingInfo,
} from '@/lib/madixo-billing';
import { getMadixoComplimentaryAccess } from '@/lib/madixo-comp-access';
import {
  getPlanLabel,
  getPlanLimits,
  normalizePlan,
  parsePlan,
  type MadixoPlan,
} from '@/lib/madixo-plans';

export const MADIXO_PLAN_COOKIE = 'madixo_plan';

type SafeMetadata = Record<string, unknown>;

function toMetadataRecord(value: unknown): SafeMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as SafeMetadata;
}

/**
 * SECURITY: Reads the user's plan with the following priority:
 *   1. app_metadata (server-side only, cannot be modified from the client)
 *   2. user_metadata (legacy, kept for backward compatibility)
 *
 * For any new user, webhooks should write to BOTH so we migrate cleanly.
 * The eventual goal is to drop user_metadata fallback entirely.
 */
function readPlanFromUserMetadata(user: unknown): MadixoPlan | null {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const appMetadata = toMetadataRecord(
    (user as { app_metadata?: Record<string, unknown> | null }).app_metadata
  );
  const appPlan = parsePlan(
    typeof appMetadata.madixo_plan === 'string' ? appMetadata.madixo_plan : null
  );

  if (appPlan) {
    return appPlan;
  }

  // Fallback: older users still have their plan in user_metadata.
  // This path will be removed once all users are migrated.
  const userMetadata = toMetadataRecord(
    (user as { user_metadata?: Record<string, unknown> | null }).user_metadata
  );

  return parsePlan(
    typeof userMetadata.madixo_plan === 'string' ? userMetadata.madixo_plan : null
  );
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getBoolean(value: unknown) {
  return value === true;
}

function readBillingFromMetadata(metadata: SafeMetadata): MadixoBillingInfo {
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

export async function getPlanFromCookieStore() {
  const cookieStore = await cookies();
  return normalizePlan(cookieStore.get(MADIXO_PLAN_COOKIE)?.value);
}

export async function getCurrentMadixoPlan(): Promise<MadixoPlan> {
  const cookiePlan = await getPlanFromCookieStore();

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return cookiePlan;
    }

    const complimentaryAccess = getMadixoComplimentaryAccess(user);
    if (complimentaryAccess) {
      return complimentaryAccess.plan;
    }

    const metadataPlan = readPlanFromUserMetadata(user);
    return metadataPlan ?? cookiePlan;
  } catch {
    return cookiePlan;
  }
}

export async function getCurrentMadixoBilling(): Promise<MadixoBillingInfo> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return readBillingFromMetadata({});
    }

    const billing = readBillingFromMetadata(toMetadataRecord(user.user_metadata));
    const complimentaryAccess = getMadixoComplimentaryAccess(user);

    if (!complimentaryAccess) {
      return billing;
    }

    return {
      ...billing,
      status: billing.customerId ? billing.status : 'active',
    };
  } catch {
    return readBillingFromMetadata({});
  }
}

export async function syncPlanCookieFromUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    const complimentaryAccess = getMadixoComplimentaryAccess(user);
    return complimentaryAccess?.plan ?? readPlanFromUserMetadata(user);
  } catch {
    return null;
  }
}

/**
 * Persists the plan to user_metadata. This is retained for the manual
 * "select plan" flow where there is no Paddle subscription yet.
 *
 * For production subscriptions, writes should happen via the Paddle webhook
 * which uses the Admin API to write to app_metadata (server-only, tamper-proof).
 */
export async function persistCurrentUserPlan(plan: MadixoPlan) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return { user: null, plan };
  }

  const existingMetadata = toMetadataRecord(user.user_metadata);

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      ...existingMetadata,
      madixo_plan: plan,
      madixo_plan_source: 'manual',
      madixo_plan_updated_at: new Date().toISOString(),
    },
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { user, plan };
}

export async function getCurrentMadixoPlanPayload(language: 'ar' | 'en' = 'ar') {
  const plan = await getCurrentMadixoPlan();
  const billing = await getCurrentMadixoBilling();

  return {
    plan,
    label: getPlanLabel(plan, language),
    limits: getPlanLimits(plan),
    billing,
  };
}
