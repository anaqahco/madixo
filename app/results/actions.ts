'use server';

import { getUserReportsCount, saveReportToDb } from '@/lib/madixo-db';
import {
  getPlanLimits,
  hasReachedPlanLimit,
} from '@/lib/madixo-plans';
import { getCurrentMadixoPlan } from '@/lib/madixo-plan-store';
import type { AnalysisResult } from '@/lib/madixo-reports';

function toSafeText(value: string | null | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function isAuthRequiredErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  return (
    normalized === 'auth_required' ||
    normalized.includes('auth session missing') ||
    normalized.includes('refresh token') ||
    normalized.includes('session from your browser') ||
    normalized.includes('session missing')
  );
}

export async function saveResultReportAction(params: {
  query: string;
  market: string;
  customer: string;
  result: AnalysisResult;
}) {
  try {
    const plan = await getCurrentMadixoPlan();
    const planLimits = getPlanLimits(plan);
    const reportsCount = await getUserReportsCount();

    if (hasReachedPlanLimit(plan, 'savedReports', reportsCount)) {
      return {
        ok: false as const,
        error: 'PLAN_LIMIT_REPORTS',
        reason: 'reports_limit' as const,
        limit: planLimits.savedReports,
        plan,
      };
    }

    const savedReport = await saveReportToDb({
      query: toSafeText(params.query, 'Untitled opportunity'),
      market: toSafeText(params.market, 'Not specified'),
      customer: toSafeText(params.customer, 'Not specified'),
      result: params.result,
    });

    return {
      ok: true as const,
      savedReport,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save report.';

    return {
      ok: false as const,
      error: isAuthRequiredErrorMessage(message) ? 'AUTH_REQUIRED' : message,
    };
  }
}
