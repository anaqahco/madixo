import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimitValue, type MadixoPlan } from '@/lib/madixo-plans';

/**
 * Returns the start of the current month (UTC) as a YYYY-MM-DD string.
 * This is the key we use to bucket monthly usage in Supabase.
 */
export function getCurrentUsagePeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export type UsageSummary = {
  plan: MadixoPlan;
  limit: number | null; // null = unlimited
  used: number;
  remaining: number; // Infinity for unlimited
  hasReachedLimit: boolean;
  period: string;
};

/**
 * Reads the current month's usage for a user without modifying it.
 * Returns 0 if no usage row exists yet for this period.
 */
export async function readUserUsage(
  userId: string,
  plan: MadixoPlan
): Promise<UsageSummary> {
  const period = getCurrentUsagePeriod();
  const limit = getPlanLimitValue(plan, 'analysisRuns');

  // Unlimited plans don't need to hit the database for this check
  if (typeof limit !== 'number') {
    return {
      plan,
      limit: null,
      used: 0,
      remaining: Infinity,
      hasReachedLimit: false,
      period,
    };
  }

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc('get_user_analysis_count', {
      p_user_id: userId,
      p_period: period,
    });

    if (error) {
      console.error('[madixo-usage] readUserUsage RPC error:', error.message);
      // Fail closed: assume usage = 0 to avoid blocking legitimate users.
      // Service-level failures should not punish the end user.
      return buildSummary(plan, limit, 0, period);
    }

    const used = typeof data === 'number' ? data : 0;
    return buildSummary(plan, limit, used, period);
  } catch (err) {
    console.error(
      '[madixo-usage] readUserUsage failed:',
      err instanceof Error ? err.message : err
    );
    return buildSummary(plan, limit, 0, period);
  }
}

/**
 * Atomically increments the usage counter for the current month.
 * Returns the new count, OR null if the increment failed.
 *
 * Call this AFTER a successful analysis (i.e., after we got a valid
 * response from OpenAI). Don't call it on failure or it will burn quota.
 */
export async function incrementUserUsage(
  userId: string
): Promise<number | null> {
  const period = getCurrentUsagePeriod();

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc('increment_user_analysis_count', {
      p_user_id: userId,
      p_period: period,
    });

    if (error) {
      console.error('[madixo-usage] incrementUserUsage RPC error:', error.message);
      return null;
    }

    return typeof data === 'number' ? data : null;
  } catch (err) {
    console.error(
      '[madixo-usage] incrementUserUsage failed:',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

function buildSummary(
  plan: MadixoPlan,
  limit: number,
  used: number,
  period: string
): UsageSummary {
  const safeUsed = Math.max(0, used);
  const remaining = Math.max(0, limit - safeUsed);
  return {
    plan,
    limit,
    used: safeUsed,
    remaining,
    hasReachedLimit: safeUsed >= limit,
    period,
  };
}
