import 'server-only';

import { cookies } from 'next/headers';
import { getUserReportsCount } from '@/lib/madixo-db';
import { getCurrentMadixoPlan } from '@/lib/madixo-plan-store';
import { getPlanLimits } from '@/lib/madixo-plans';

const ANALYSIS_USAGE_COOKIE = 'madixo_analysis_usage_v1';

type AnalysisUsageStore = {
  items: string[];
};

export type MadixoPlanUsage = {
  analysisRunsUsed: number;
  analysisRunsLimit: number | null;
  savedReportsUsed: number;
  savedReportsLimit: number;
  compareReportsLimit: number;
};

function parseCookieHeader(cookieHeader: string) {
  return new Map(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''] as const;
        return [part.slice(0, index), part.slice(index + 1)] as const;
      })
  );
}

function normalizeAnalysisItems(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, 50);
}

function readAnalysisUsageFromCookieValue(raw: string | undefined) {
  if (!raw) {
    return { items: [] } satisfies AnalysisUsageStore;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AnalysisUsageStore;
    return {
      items: normalizeAnalysisItems(parsed?.items),
    } satisfies AnalysisUsageStore;
  } catch {
    return { items: [] } satisfies AnalysisUsageStore;
  }
}

async function readAnalysisUsageFromServerCookies() {
  const cookieStore = await cookies();
  return readAnalysisUsageFromCookieValue(cookieStore.get(ANALYSIS_USAGE_COOKIE)?.value);
}

function readAnalysisUsageFromHeader(cookieHeader: string) {
  const cookiesMap = parseCookieHeader(cookieHeader);
  return readAnalysisUsageFromCookieValue(cookiesMap.get(ANALYSIS_USAGE_COOKIE));
}

export async function getCurrentMadixoPlanUsage(request?: Request): Promise<MadixoPlanUsage> {
  const plan = await getCurrentMadixoPlan();
  const limits = getPlanLimits(plan);

  const analysisUsage = request
    ? readAnalysisUsageFromHeader(request.headers.get('cookie') || '')
    : await readAnalysisUsageFromServerCookies();

  let savedReportsUsed = 0;

  try {
    savedReportsUsed = await getUserReportsCount();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message !== 'AUTH_REQUIRED') {
      throw error;
    }
  }

  return {
    analysisRunsUsed: analysisUsage.items.length,
    analysisRunsLimit: limits.analysisRuns,
    savedReportsUsed,
    savedReportsLimit: limits.savedReports,
    compareReportsLimit: limits.compareReports,
  };
}
