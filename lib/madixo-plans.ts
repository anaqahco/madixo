export type MadixoPlan = 'free' | 'pro' | 'team';
export type PlanLimitKey = 'savedReports' | 'compareReports' | 'analysisRuns';

type PlanLimits = {
  savedReports: number;
  compareReports: number;
  analysisRuns: number | null;
};

export const PLAN_LIMITS: Record<MadixoPlan, PlanLimits> = {
  free: {
    savedReports: 3,
    compareReports: 2,
    analysisRuns: 5,
  },
  pro: {
    savedReports: 50,
    compareReports: 3,
    analysisRuns: null,
  },
  team: {
    savedReports: 250,
    compareReports: 5,
    analysisRuns: null,
  },
};

export function parsePlan(value: string | null | undefined): MadixoPlan | null {
  if (value === 'pro' || value === 'team' || value === 'free') {
    return value;
  }

  return null;
}

export function normalizePlan(value: string | null | undefined): MadixoPlan {
  return parsePlan(value) ?? 'free';
}

export function getPlanLimits(plan: MadixoPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function getPlanLimitValue(plan: MadixoPlan, key: PlanLimitKey) {
  return PLAN_LIMITS[plan][key];
}

export function hasReachedPlanLimit(
  plan: MadixoPlan,
  key: PlanLimitKey,
  currentCount: number
) {
  const limit = PLAN_LIMITS[plan][key];

  if (typeof limit !== 'number') {
    return false;
  }

  return currentCount >= limit;
}

export function getCompareSelectionLimit(plan: MadixoPlan) {
  return PLAN_LIMITS[plan].compareReports;
}

export function getPlanLabel(plan: MadixoPlan, language: 'ar' | 'en' = 'ar') {
  if (language === 'ar') {
    if (plan === 'pro') return 'الاحترافية';
    if (plan === 'team') return 'الفِرق';
    return 'المجانية';
  }

  if (plan === 'pro') return 'Pro';
  if (plan === 'team') return 'Team';
  return 'Free';
}

export function getPlanLimitsSummary(
  plan: MadixoPlan,
  language: 'ar' | 'en' = 'ar'
) {
  const limits = PLAN_LIMITS[plan];

  if (language === 'ar') {
    return {
      analysisRuns:
        typeof limits.analysisRuns === 'number'
          ? `حتى ${limits.analysisRuns} تحليلات`
          : 'بدون حد تحليلات حاليًا',
      savedReports: `حتى ${limits.savedReports} فرص محفوظة`,
      compareReports: `حتى ${limits.compareReports} فرص في المقارنة`,
    };
  }

  return {
    analysisRuns:
      typeof limits.analysisRuns === 'number'
        ? `Up to ${limits.analysisRuns} analyses`
        : 'No current analysis cap',
    savedReports: `Up to ${limits.savedReports} saved opportunities`,
    compareReports: `Up to ${limits.compareReports} reports in comparison`,
  };
}

export function getUpgradeReasonText(
  reason: string | null | undefined,
  language: 'ar' | 'en' = 'ar'
) {
  const key = typeof reason === 'string' ? reason : '';

  if (language === 'ar') {
    if (key === 'reports_limit') {
      return 'وصلت إلى الحد الحالي من الفرص المحفوظة في باقتك.';
    }

    if (key === 'compare_limit') {
      return 'وصلت إلى حد المقارنة في باقتك الحالية.';
    }

    if (key === 'analysis_limit') {
      return 'استهلكت الحد الحالي من التحليلات في باقتك.';
    }

    if (key === 'feasibility') {
      return 'ميزة دراسة الجدوى الأولية متاحة داخل الباقة المدفوعة.';
    }

    return 'هذه الميزة تحتاج باقة أعلى في النسخة الحالية.';
  }

  if (key === 'reports_limit') {
    return 'You reached the saved opportunities limit for your current plan.';
  }

  if (key === 'compare_limit') {
    return 'You reached the comparison limit for your current plan.';
  }

  if (key === 'analysis_limit') {
    return 'You used the analysis limit for your current plan.';
  }

  if (key === 'feasibility') {
    return 'The initial feasibility study is available on the paid plan.';
  }

  return 'This feature needs a higher plan in the current version.';
}
