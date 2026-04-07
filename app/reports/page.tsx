'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import MixedText from '@/components/mixed-text';
import SiteHeader from '@/components/site-header';
import LifecycleStatusBadge from '@/components/lifecycle-status-badge';
import PlanUpgradeNotice from '@/components/plan-upgrade-notice';
import {
  getReportLifecycleStatus,
  lifecycleStatusPriority,
  type ReportLifecycleStatus,
} from '@/lib/madixo-lifecycle-status';
import {
  type ReportSortOption,
  type SavedMadixoReport,
} from '@/lib/madixo-reports';
import { normalizePlan } from '@/lib/madixo-plans';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

type ReportsSortMode = ReportSortOption | 'status';
type StatusFilter =
  | 'all'
  | 'analysis_only'
  | 'in_validation'
  | 'current_decision_set'
  | 'best_step_ready';

type ValidationDecisionState = 'undecided' | 'continue' | 'pivot' | 'stop';
type StageSummaryKey =
  | 'analysis_only'
  | 'analysis_feasibility'
  | 'analysis_validation'
  | 'analysis_feasibility_validation';


type ValidationPlanStatusRow = {
  report_id: string;
  ui_lang: UiLanguage;
  evidence_summary_json: unknown | null;
  iteration_engine_json: unknown | null;
  decision_state: ValidationDecisionState | null;
  updated_at?: string | null;
};

type PlanUsage = {
  analysisRunsUsed: number;
  analysisRunsLimit: number | null;
  savedReportsUsed: number;
  savedReportsLimit: number;
  compareReportsLimit: number;
};

type CurrentPlanPayload = {
  ok?: boolean;
  plan?: 'free' | 'pro' | 'team';
  label?: string;
  usage?: PlanUsage | null;
};

type ReportsApiPayload = {
  ok?: boolean;
  error?: string;
  reports?: SavedMadixoReport[];
  validationPlans?: ValidationPlanStatusRow[];
};

function countArabicChars(value: string) {
  return (value.match(/[\u0600-\u06FF]/g) ?? []).length;
}

function countLatinChars(value: string) {
  return (value.match(/[A-Za-z]/g) ?? []).length;
}

function detectTextLanguage(value: string): UiLanguage {
  const arabicScore = countArabicChars(value);
  const latinScore = countLatinChars(value);

  if (arabicScore === 0 && latinScore === 0) {
    return 'en';
  }

  return arabicScore >= latinScore ? 'ar' : 'en';
}

function labelFromScore(score: number, language: UiLanguage) {
  if (language === 'ar') {
    if (score >= 75) return 'فرصة قوية';
    if (score >= 60) return 'سوق واعد';
    if (score >= 40) return 'فرصة متوسطة';
    return 'تحتاج تحقق';
  }

  if (score >= 75) return 'High Potential';
  if (score >= 60) return 'Promising Niche';
  if (score >= 40) return 'Moderate Opportunity';
  return 'Needs Validation';
}

function getOpportunityLabelForUi(score: number, label: string, language: UiLanguage) {
  const cleaned = label?.trim() || '';
  const tooLong = cleaned.length > 28 || cleaned.split(/\s+/).length > 4;

  if (!cleaned || tooLong) {
    return labelFromScore(score, language);
  }

  if (detectTextLanguage(cleaned) !== language) {
    return labelFromScore(score, language);
  }

  return cleaned;
}

function formatSavedReportDateLocalized(value: string, language: UiLanguage) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function readPlanFromCookieClient(): 'free' | 'pro' | 'team' {
  if (typeof document === 'undefined') {
    return 'free';
  }

  const match = document.cookie.match(/(?:^|;\s*)madixo_plan=([^;]+)/);
  const value = match?.[1];

  if (value === 'pro' || value === 'team' || value === 'free') {
    return value;
  }

  return 'free';
}

async function fetchCurrentPlanClient(): Promise<{
  plan: 'free' | 'pro' | 'team';
  label: string;
  usage: PlanUsage | null;
}> {
  try {
    const response = await fetch('/api/current-plan', { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as CurrentPlanPayload;

    if (response.ok && payload.ok && payload.plan) {
      return {
        plan: normalizePlan(payload.plan),
        label: payload.label || '',
        usage: payload.usage ?? null,
      };
    }
  } catch {
    // fallback below
  }

  return {
    plan: readPlanFromCookieClient(),
    label: '',
    usage: null,
  };
}

function getReportsUpgradeNotice(language: UiLanguage, planLabel: string, usage: PlanUsage | null) {
  if (!usage) return null;

  const safePlanLabel = planLabel || (language === 'ar' ? 'باقتك الحالية' : 'your current plan');
  const limitReached = usage.savedReportsUsed >= usage.savedReportsLimit;
  const nearLimit = usage.savedReportsUsed >= Math.max(1, usage.savedReportsLimit - 1);

  if (!limitReached && !nearLimit) return null;

  return {
    title:
      limitReached
        ? language === 'ar'
          ? 'وصلت إلى حد الفرص المحفوظة.'
          : 'You reached the saved opportunities limit.'
        : language === 'ar'
          ? 'أنت قريب من حد الفرص المحفوظة.'
          : 'You are close to your saved opportunities limit.',
    description:
      limitReached
        ? language === 'ar'
          ? `لديك الآن ${usage.savedReportsUsed} من ${usage.savedReportsLimit} فرصة محفوظة داخل ${safePlanLabel}. فعّل باقة أعلى لتكمل الحفظ.`
          : `You already have ${usage.savedReportsUsed} of ${usage.savedReportsLimit} saved opportunities in ${safePlanLabel}. Upgrade to keep saving.`
        : language === 'ar'
          ? `بقيت مساحة محدودة فقط داخل ${safePlanLabel}. لديك ${usage.savedReportsUsed} من ${usage.savedReportsLimit} فرصة محفوظة.`
          : `Only a little room is left in ${safePlanLabel}. You have ${usage.savedReportsUsed} of ${usage.savedReportsLimit} saved opportunities used.`,
    tone: limitReached ? ('amber' as const) : ('blue' as const),
  };
}

const UI_COPY = {
  en: {
    dir: 'ltr',
    newScan: 'New Scan',
    compareReports: 'Compare Reports',
    savedWorkspace: 'Saved Opportunities',
    myReports: 'My Reports',
    workspaceDescription:
      'Saved Madixo opportunities you can revisit, review, and compare anytime.',
    totalReports: 'Total Reports',
    sortBy: 'Sort By',
    latest: 'Latest',
    oldest: 'Oldest',
    highestScore: 'Highest Score',
    lowestScore: 'Lowest Score',
    byStatus: 'By Status',
    loadingReports: 'Loading Reports',
    loadingWorkspace: 'Loading your workspace',
    loadingWorkspaceDescription:
      'Madixo is fetching your saved reports from your account.',
    stillLoadingTitle: 'Still loading?',
    stillLoadingDescription: 'The connection took longer than usual. You can retry now.',
    retryNow: 'Retry now',
    noSavedReports: 'No Saved Reports',
    noReportsSavedYet: 'No reports saved yet',
    noReportsDescription:
      'Run your first opportunity analysis, save it, and it will appear here as part of your Madixo workspace.',
    startNewScan: 'Start New Scan',
    openComparePage: 'Open Compare Page',
    market: 'Market',
    customer: 'Customer',
    rerunAnalysis: 'Run Again',
    openReport: 'Open Report',
    compare: 'Compare',
    startValidation: 'Start Validation',
    addMarketNotes: 'Add market notes',
    setCurrentDecision: 'Set current decision',
    generateBestStep: 'Generate best step now',
    continueBestStep: 'Continue from best step',
    delete: 'Delete',
    deleting: 'Deleting...',
    whyThisOpportunity: 'Why This Looks Strong',
    opportunityAngle: 'Best Angle',
    goToMarket: 'How to Reach the Market',
    untitledOpportunity: 'Untitled opportunity',
    notSpecified: 'Not specified',
    failedToLoadReports: 'Failed to load reports.',
    failedToDeleteReport: 'Failed to delete report.',
    filterByStatus: 'Filter by status',
    noMatchingReports: 'No reports match this filter.',
    stageSummary_analysis_only: 'Analysis only',
    stageSummary_analysis_feasibility: 'Analysis + Feasibility',
    stageSummary_analysis_validation: 'Analysis + Validation',
    stageSummary_analysis_feasibility_validation: 'Analysis + Feasibility + Validation',
  },
  ar: {
    dir: 'rtl',
    newScan: 'تحليل جديد',
    compareReports: 'مقارنة التقارير',
    savedWorkspace: 'الفرص المحفوظة',
    myReports: 'تقاريري',
    workspaceDescription:
      'كل الفرص المحفوظة التي يمكنك الرجوع إليها ومراجعتها ومقارنتها في أي وقت.',
    totalReports: 'إجمالي التقارير',
    sortBy: 'الفرز حسب',
    latest: 'الأحدث',
    oldest: 'الأقدم',
    highestScore: 'أعلى درجة',
    lowestScore: 'أقل درجة',
    byStatus: 'حسب الحالة',
    loadingReports: 'جارٍ تحميل التقارير',
    loadingWorkspace: 'جارٍ تحميل مساحة العمل',
    loadingWorkspaceDescription:
      'يقوم Madixo بجلب التحليلات المحفوظة من حسابك.',
    stillLoadingTitle: 'هل طال التحميل؟',
    stillLoadingDescription: 'الاتصال استغرق أكثر من المعتاد. يمكنك إعادة المحاولة الآن.',
    retryNow: 'إعادة المحاولة الآن',
    noSavedReports: 'لا توجد تقارير محفوظة',
    noReportsSavedYet: 'لا توجد تقارير محفوظة بعد',
    noReportsDescription:
      'حلّل أول فكرة ثم احفظها، وستظهر هنا ضمن مساحة عمل Madixo.',
    startNewScan: 'ابدأ تحليلًا جديدًا',
    openComparePage: 'افتح صفحة المقارنة',
    market: 'السوق',
    customer: 'العميل',
    rerunAnalysis: 'إعادة التحليل',
    openReport: 'افتح التقرير',
    compare: 'قارن',
    startValidation: 'ابدأ التحقق',
    addMarketNotes: 'أضف ملاحظات السوق',
    setCurrentDecision: 'حدّد القرار الحالي',
    generateBestStep: 'أنشئ أفضل خطوة الآن',
    continueBestStep: 'أكمل من أفضل خطوة الآن',
    delete: 'حذف',
    deleting: 'جارٍ الحذف...',
    whyThisOpportunity: 'لماذا تبدو هذه فرصة جيدة',
    opportunityAngle: 'زاوية الدخول',
    goToMarket: 'طريقة الوصول للسوق',
    untitledOpportunity: 'فرصة بدون اسم',
    notSpecified: 'غير محدد',
    failedToLoadReports: 'فشل تحميل التقارير.',
    failedToDeleteReport: 'فشل حذف التقرير.',
    filterByStatus: 'تصفية حسب الحالة',
    noMatchingReports: 'لا توجد تقارير تطابق هذه التصفية.',
    stageSummary_analysis_only: 'تحليل فقط',
    stageSummary_analysis_feasibility: 'تحليل + جدوى',
    stageSummary_analysis_validation: 'تحليل + تحقق',
    stageSummary_analysis_feasibility_validation: 'تحليل + جدوى + تحقق',
  },
} as const;

function MadixoLogo() {
  return (
    <Image
      src="/brand/madixo-logo.png"
      alt="Madixo"
      width={210}
      height={54}
      priority
      className="h-auto w-[175px] md:w-[210px]"
    />
  );
}

function getPrimaryValidationAction(
  status: ReportLifecycleStatus,
  copy: (typeof UI_COPY)['ar'] | (typeof UI_COPY)['en']
) {
  switch (status) {
    case 'collecting_evidence':
      return copy.addMarketNotes;
    case 'decision_view_ready':
      return copy.setCurrentDecision;
    case 'current_decision_set':
      return copy.generateBestStep;
    case 'best_step_ready':
      return copy.continueBestStep;
    case 'analysis_only':
    default:
      return copy.startValidation;
  }
}

function hasInitialFeasibility(report: SavedMadixoReport) {
  const value = (report.result as unknown as { initialFeasibility?: unknown }).initialFeasibility;
  return Boolean(value && typeof value === 'object');
}

function getStageSummaryKey(params: {
  report: SavedMadixoReport;
  validationPlan: ValidationPlanStatusRow | null;
}): StageSummaryKey {
  const hasFeasibility = hasInitialFeasibility(params.report);
  const hasValidation = Boolean(params.validationPlan);

  if (hasFeasibility && hasValidation) return 'analysis_feasibility_validation';
  if (hasFeasibility) return 'analysis_feasibility';
  if (hasValidation) return 'analysis_validation';
  return 'analysis_only';
}

function ReportStageSummaryBadge({
  stage,
  uiLang,
}: {
  stage: StageSummaryKey;
  uiLang: UiLanguage;
}) {
  const copy = UI_COPY[uiLang];
  const label = copy[`stageSummary_${stage}` as const];

  return (
    <span className="rounded-full border border-[#D1FAE5] bg-[#ECFDF3] px-3 py-1 text-sm font-semibold text-[#027A48]">
      {label}
    </span>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<SavedMadixoReport[]>([]);
  const [currentPlanLabel, setCurrentPlanLabel] = useState('');
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, ReportLifecycleStatus>>({});
  const [validationPlanMap, setValidationPlanMap] = useState<Record<string, ValidationPlanStatusRow | null>>({});
  const [sortBy, setSortBy] = useState<ReportsSortMode>('latest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguage>('en');
  const [showSlowNotice, setShowSlowNotice] = useState(false);
  const requestIdRef = useRef(0);

  const copy = UI_COPY[preferredLanguage];
  const pathname = usePathname();
  const lastAutoRefreshAtRef = useRef(0);

  useEffect(() => {
    setPreferredLanguage(getClientUiLanguage('en'));
  }, []);

  useEffect(() => {
    fetchCurrentPlanClient().then((payload) => {
      setCurrentPlanLabel(payload.label || '');
      setPlanUsage(payload.usage ?? null);
    });
  }, []);

  const refreshReports = useCallback(
    async (nextSort: ReportsSortMode = sortBy) => {
      const requestId = ++requestIdRef.current;
      const controller = new AbortController();
      const slowTimer = window.setTimeout(() => {
        if (requestIdRef.current === requestId) {
          setShowSlowNotice(true);
        }
      }, 6000);

      try {
        setLoading(true);
        setError('');
        setShowSlowNotice(false);

        const response = await fetch(`/api/reports?sort=${encodeURIComponent(nextSort === 'status' ? 'latest' : nextSort)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => ({}))) as ReportsApiPayload;

        if (response.status === 401 || payload.error === 'AUTH_REQUIRED') {
          window.location.assign('/login?mode=login&next=/reports');
          return;
        }

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || copy.failedToLoadReports);
        }

        if (requestIdRef.current !== requestId) {
          return;
        }

        const mapped = Array.isArray(payload.reports) ? payload.reports : [];
        const planRows = Array.isArray(payload.validationPlans) ? payload.validationPlans : [];

        const reportIds = mapped.map((item) => item.id);
        const nextStatusMap: Record<string, ReportLifecycleStatus> = {};
        const nextValidationPlanMap: Record<string, ValidationPlanStatusRow | null> = {};

        for (const reportId of reportIds) {
          nextStatusMap[reportId] = 'analysis_only';
          nextValidationPlanMap[reportId] = null;
        }

        const rowsByReport = new Map<string, ValidationPlanStatusRow[]>();
        for (const row of planRows) {
          const existingRows = rowsByReport.get(row.report_id) || [];
          existingRows.push(row);
          rowsByReport.set(row.report_id, existingRows);
        }

        for (const reportId of reportIds) {
          const matchingRows = rowsByReport.get(reportId) || [];
          if (!matchingRows.length) continue;

          const matchingRow =
            matchingRows.find((row) => row.ui_lang === preferredLanguage) ||
            [...matchingRows].sort((a, b) => {
              const aTime = Date.parse(a.updated_at || '');
              const bTime = Date.parse(b.updated_at || '');
              const aValue = Number.isNaN(aTime) ? 0 : aTime;
              const bValue = Number.isNaN(bTime) ? 0 : bTime;
              return bValue - aValue;
            })[0];

          nextValidationPlanMap[reportId] = matchingRow;
          nextStatusMap[reportId] = getReportLifecycleStatus({
            hasValidationPlan: true,
            hasEvidenceSummary: Boolean(matchingRow.evidence_summary_json),
            hasDecisionState:
              matchingRow.decision_state === 'continue' ||
              matchingRow.decision_state === 'pivot' ||
              matchingRow.decision_state === 'stop',
            hasIterationEngine: Boolean(matchingRow.iteration_engine_json),
          });
        }

        setReports(mapped);
        setValidationPlanMap(nextValidationPlanMap);
        setStatusMap(nextStatusMap);
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          setError(copy.failedToLoadReports);
        } else {
          setError(err instanceof Error ? err.message : copy.failedToLoadReports);
        }
      } finally {
        window.clearTimeout(slowTimer);
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }

      return () => controller.abort();
    },
    [copy.failedToLoadReports, preferredLanguage, sortBy]
  );

  const requestRefresh = useCallback(
    (reason: 'manual' | 'focus' | 'visibility' | 'pageshow' | 'pathname' = 'manual') => {
      const now = Date.now();

      if (reason !== 'manual' && now - lastAutoRefreshAtRef.current < 1200) {
        return;
      }

      lastAutoRefreshAtRef.current = now;
      void refreshReports(sortBy);
    },
    [refreshReports, sortBy]
  );

  useEffect(() => {
    requestRefresh('manual');
  }, [requestRefresh, preferredLanguage]);

  useEffect(() => {
    requestRefresh('pathname');
  }, [pathname, requestRefresh]);

  useEffect(() => {
    const onFocus = () => requestRefresh('focus');
    const onPageShow = () => requestRefresh('pageshow');
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestRefresh('visibility');
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [requestRefresh]);


  const visibleReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const status = statusMap[report.id] || 'analysis_only';
      const planRow = validationPlanMap[report.id];
      const hasValidationPlan = Boolean(planRow);
      const hasDecisionState =
        planRow?.decision_state === 'continue' ||
        planRow?.decision_state === 'pivot' ||
        planRow?.decision_state === 'stop';
      const hasBestStep = Boolean(planRow?.iteration_engine_json);

      if (statusFilter === 'all') return true;
      if (statusFilter === 'analysis_only') return !hasValidationPlan || status === 'analysis_only';
      if (statusFilter === 'in_validation') return hasValidationPlan;
      if (statusFilter === 'current_decision_set') return hasDecisionState;
      if (statusFilter === 'best_step_ready') return hasBestStep;
      return true;
    });

    const next = [...filtered];
    if (sortBy === 'status') {
      next.sort(
        (a, b) =>
          lifecycleStatusPriority(statusMap[a.id] || 'analysis_only') -
          lifecycleStatusPriority(statusMap[b.id] || 'analysis_only')
      );
    }

    return next;
  }, [reports, sortBy, statusFilter, statusMap, validationPlanMap]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');

      const response = await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (response.status === 401 || payload.error === 'AUTH_REQUIRED') {
        window.location.assign('/login?mode=login&next=/reports');
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || copy.failedToDeleteReport);
      }

      await refreshReports(sortBy);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failedToDeleteReport);
    } finally {
      setDeletingId(null);
    }
  };

  const reportsUpgradeNotice = useMemo(
    () => getReportsUpgradeNotice(preferredLanguage, currentPlanLabel, planUsage),
    [preferredLanguage, currentPlanLabel, planUsage]
  );

  const statusFilters: Array<{ value: StatusFilter; label: string }> =
    preferredLanguage === 'ar'
      ? [
          { value: 'all', label: 'الكل' },
          { value: 'analysis_only', label: 'تحليل فقط' },
          { value: 'in_validation', label: 'قيد التحقق' },
          { value: 'best_step_ready', label: 'أفضل خطوة الآن جاهزة' },
          { value: 'current_decision_set', label: 'قرار حالي محدد' },
        ]
      : [
          { value: 'all', label: 'All' },
          { value: 'analysis_only', label: 'Analysis only' },
          { value: 'in_validation', label: 'In validation' },
          { value: 'best_step_ready', label: 'Best step ready' },
          { value: 'current_decision_set', label: 'Current decision set' },
        ];

  return (
    <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]">
      <SiteHeader uiLang={preferredLanguage} onLanguageChange={setPreferredLanguage} logo={<MadixoLogo />} />

      <div className="mx-auto mt-8 max-w-6xl">
        {reportsUpgradeNotice ? (
          <div className="mb-6">
            <PlanUpgradeNotice
              title={reportsUpgradeNotice.title}
              description={reportsUpgradeNotice.description}
              ctaHref={planUsage && planUsage.savedReportsUsed >= planUsage.savedReportsLimit ? '/upgrade?reason=reports_limit' : '/pricing'}
              ctaLabel={planUsage && planUsage.savedReportsUsed >= planUsage.savedReportsLimit ? (preferredLanguage === 'ar' ? 'ترقية الآن' : 'Upgrade now') : (preferredLanguage === 'ar' ? 'شاهد الباقات' : 'View plans')}
              secondaryHref={planUsage && planUsage.savedReportsUsed >= planUsage.savedReportsLimit ? '/pricing' : undefined}
              secondaryLabel={planUsage && planUsage.savedReportsUsed >= planUsage.savedReportsLimit ? (preferredLanguage === 'ar' ? 'شاهد الباقات' : 'View plans') : undefined}
              tone={reportsUpgradeNotice.tone}
            />
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {copy.savedWorkspace}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">{copy.myReports}</h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4B5563]">{copy.workspaceDescription}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">{copy.totalReports}</p>
              <p className="mt-1 text-2xl font-bold">{reports.length}</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
              <label htmlFor="sort-reports" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.sortBy}
              </label>
              <select
                id="sort-reports"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ReportsSortMode)}
                className="mt-2 w-full bg-transparent text-sm font-semibold text-[#111827] outline-none"
              >
                <option value="latest">{copy.latest}</option>
                <option value="oldest">{copy.oldest}</option>
                <option value="highestScore">{copy.highestScore}</option>
                <option value="lowestScore">{copy.lowestScore}</option>
                <option value="status">{copy.byStatus}</option>
              </select>
            </div>
          </div>
        </div>

        {reports.length ? (
          <div className="mb-6 rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#6B7280]">{copy.filterByStatus}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === option.value
                      ? 'bg-[#111827] text-white'
                      : 'border border-[#E5E7EB] bg-white text-[#4B5563]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.loadingReports}
              </div>
              <h2 className="mt-6 text-3xl font-bold md:text-4xl">{copy.loadingWorkspace}</h2>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">{copy.loadingWorkspaceDescription}</p>

              {showSlowNotice ? (
                <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-start">
                  <p className="text-sm font-semibold text-amber-800">{copy.stillLoadingTitle}</p>
                  <p className="mt-1 text-sm leading-7 text-amber-700">{copy.stillLoadingDescription}</p>
                  <button
                    type="button"
                    onClick={() => refreshReports(sortBy)}
                    className="mt-4 rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
                  >
                    {copy.retryNow}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.noSavedReports}
              </div>
              <h2 className="mt-6 text-3xl font-bold md:text-4xl">{copy.noReportsSavedYet}</h2>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">{copy.noReportsDescription}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/" className="inline-block rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  {copy.startNewScan}
                </Link>
                <Link
                  href="/compare"
                  className="inline-block rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                >
                  {copy.openComparePage}
                </Link>
              </div>
            </div>
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-10 text-center text-[#6B7280] shadow-sm">{copy.noMatchingReports}</div>
        ) : (
          <div className="grid gap-6">
            {visibleReports.map((report) => {
              const safeLabel = getOpportunityLabelForUi(
                report.result.opportunityScore,
                report.result.opportunityLabel,
                preferredLanguage
              );
              const safeQuery = report.query || copy.untitledOpportunity;
              const safeMarket = report.market || copy.notSpecified;
              const safeCustomer = report.customer || copy.notSpecified;
              const lifecycleStatus = statusMap[report.id] || 'analysis_only';
              const resultsHref = `/results?reportId=${report.id}&q=${encodeURIComponent(report.query)}&market=${encodeURIComponent(report.market)}&customer=${encodeURIComponent(report.customer)}`;
              const validateHref = `/validate/${report.id}`;

              return (
                <div key={report.id} className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                          {formatSavedReportDateLocalized(report.createdAt, preferredLanguage)}
                        </span>
                        <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-sm font-semibold text-[#027A48]">
                          {report.result.opportunityScore}/100 · {safeLabel}
                        </span>
                        <LifecycleStatusBadge status={lifecycleStatus} uiLang={preferredLanguage} />
                        <ReportStageSummaryBadge
                          stage={getStageSummaryKey({
                            report,
                            validationPlan: validationPlanMap[report.id] || null,
                          })}
                          uiLang={preferredLanguage}
                        />
                      </div>

                      <MixedText as="h2" text={safeQuery} className="mt-4 text-2xl font-bold leading-tight md:text-3xl" />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#374151]">
                          {copy.market}: <MixedText as="span" text={safeMarket} />
                        </span>
                        <span className="rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#374151]">
                          {copy.customer}: <MixedText as="span" text={safeCustomer} />
                        </span>
                      </div>

                      <MixedText as="p" text={report.result.summary} className="mt-5 max-w-3xl text-lg leading-8 text-[#4B5563]" />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#F3F4F6] pt-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={validateHref}
                        className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {getPrimaryValidationAction(lifecycleStatus, copy)}
                      </Link>

                      <Link
                        href={resultsHref}
                        className="rounded-full border border-[#111827] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                      >
                        {copy.openReport}
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/compare"
                        className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                      >
                        {copy.compare}
                      </Link>

                      <Link
                        href={resultsHref}
                        className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                      >
                        {copy.rerunAnalysis}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        disabled={deletingId === report.id}
                        className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === report.id ? copy.deleting : copy.delete}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#F9FAFB] p-4">
                      <p className="text-sm font-semibold text-[#6B7280]">{copy.whyThisOpportunity}</p>
                      <MixedText as="p" text={report.result.whyThisOpportunity} className="mt-2 text-sm leading-7 text-[#4B5563]" />
                    </div>
                    <div className="rounded-2xl bg-[#F9FAFB] p-4">
                      <p className="text-sm font-semibold text-[#6B7280]">{copy.opportunityAngle}</p>
                      <MixedText as="p" text={report.result.opportunityAngle} className="mt-2 text-sm leading-7 text-[#4B5563]" />
                    </div>
                    <div className="rounded-2xl bg-[#F9FAFB] p-4">
                      <p className="text-sm font-semibold text-[#6B7280]">{copy.goToMarket}</p>
                      <MixedText as="p" text={report.result.goToMarket} className="mt-2 text-sm leading-7 text-[#4B5563]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
