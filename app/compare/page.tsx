'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import MixedText from '@/components/mixed-text';
import SiteHeader from '@/components/site-header';
import LifecycleStatusBadge from '@/components/lifecycle-status-badge';
import PlanUpgradeNotice from '@/components/plan-upgrade-notice';
import {
  type ReportSortOption,
  type SavedMadixoReport,
} from '@/lib/madixo-reports';
import {
  getReportLifecycleStatus,
  lifecycleStatusPriority,
  type ReportLifecycleStatus,
} from '@/lib/madixo-lifecycle-status';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';
import { getCompareSelectionLimit, getPlanLabel, normalizePlan } from '@/lib/madixo-plans';

function readPlanFromCookieClient(): 'free' | 'pro' | 'team' {
  if (typeof document === 'undefined') {
    return 'free' as const;
  }

  const match = document.cookie.match(/(?:^|;\s*)madixo_plan=([^;]+)/);
  const value = match?.[1];

  if (value === 'pro' || value === 'team' || value === 'free') {
    return value;
  }

  return 'free' as const;
}

type CurrentPlanPayload = {
  ok?: boolean;
  plan?: 'free' | 'pro' | 'team';
  label?: string;
};

type ReportsApiPayload = {
  ok?: boolean;
  error?: string;
  reports?: SavedMadixoReport[];
  validationPlans?: ValidationPlanStatusRow[];
};

async function fetchCurrentPlanClient(): Promise<{
  plan: 'free' | 'pro' | 'team';
  label: string;
}> {
  try {
    const response = await fetch('/api/current-plan', { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as CurrentPlanPayload;

    if (response.ok && payload.ok && payload.plan) {
      return { plan: normalizePlan(payload.plan), label: payload.label || '' };
    }
  } catch {
    // fall back to cookie below
  }

  return { plan: readPlanFromCookieClient(), label: '' };
}

type CompareSortMode = ReportSortOption | 'status';

type ValidationPlanStatusRow = {
  report_id: string;
  ui_lang: UiLanguage;
  iteration_engine_json: unknown | null;
  evidence_summary_json: unknown | null;
  decision_state: string | null;
  updated_at?: string | null;
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

function getOpportunityLabelForUi(
  score: number,
  label: string,
  language: UiLanguage
) {
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

function getCompareUpgradeNotice(language: UiLanguage, planLabel: string, compareLimit: number, selectionLimitReached: boolean) {
  const safePlanLabel = planLabel || (language === 'ar' ? 'باقتك الحالية' : 'your current plan');

  if (selectionLimitReached) {
    return {
      title: language === 'ar' ? 'وصلت إلى حد المقارنة في باقتك الحالية.' : 'You reached your current comparison limit.',
      description:
        language === 'ar'
          ? `يمكنك الآن مقارنة حتى ${compareLimit} ${compareLimit === 2 ? 'فرصتين' : 'فرص'} داخل ${safePlanLabel}. للانتقال إلى مقارنة أوسع، فعّل باقة أعلى.`
          : `You can currently compare up to ${compareLimit} opportunities in ${safePlanLabel}. Upgrade for a wider comparison view.`,
      tone: 'amber' as const,
    };
  }

  return {
    title: language === 'ar' ? 'المقارنة الحالية محدودة حسب الباقة.' : 'Comparison is currently limited by your plan.',
    description:
      language === 'ar'
        ? `هذه الصفحة تسمح لك حاليًا بمقارنة حتى ${compareLimit} ${compareLimit === 2 ? 'فرصتين' : 'فرص'} في المرة الواحدة داخل ${safePlanLabel}.`
        : `This page currently lets you compare up to ${compareLimit} opportunities at once in ${safePlanLabel}.`,
    tone: 'blue' as const,
  };
}

const UI_COPY = {
  en: {
    dir: 'ltr',
    newScan: 'New Scan',
    myReports: 'My Reports',
    logOut: 'Log Out',
    decisionWorkspace: 'Decision Workspace',
    compareReports: 'Compare Reports',
    compareIntro:
      'Compare saved Madixo opportunities side by side to decide which idea deserves more attention.',
    selected: 'Selected',
    sortBy: 'Sort By',
    latest: 'Latest',
    oldest: 'Oldest',
    highestScore: 'Highest Score',
    lowestScore: 'Lowest Score',
    byStatus: 'By Status',
    loadingWorkspace: 'Loading Comparison Workspace',
    loadingTitle: 'Loading your saved reports',
    loadingDescription:
      'Madixo is preparing your saved opportunities for comparison.',
    noSavedReports: 'No Saved Reports',
    noReportsTitle: 'No reports available for comparison',
    noReportsDescription:
      'Save at least two opportunity reports first, then return here to compare them side by side.',
    startNewScan: 'Start New Scan',
    openMyReports: 'Open My Reports',
    chooseReports: 'Choose reports',
    chooseReportsDescription:
      'Select at least 2 reports to compare. Your current plan decides how many you can compare at once.',
    selectedCount: 'selected',
    selectionPlanHint: 'Current plan',
    clearSelection: 'Clear Selection',
    selectionLimitReached:
      'Your current plan reached the comparison limit. Remove one report or upgrade to compare more.',
    selectionHint:
      'Choose the opportunities you want to evaluate side by side.',
    comparisonReady: 'Comparison ready',
    selectAtLeastTwo: 'Select at least 2 reports',
    selectAtLeastTwoTitle: 'Select at least 2 reports',
    selectAtLeastTwoDescription:
      'Choose two or more saved reports above to unlock the full side-by-side comparison view.',
    selectedOpportunities: 'Selected opportunities',
    selectedOpportunitiesDescription:
      'Review the high-level differences before diving into the deeper comparison sections.',
    reportsInComparison: 'reports in comparison',
    scoreBreakdown: 'Score Breakdown',
    overall: 'Overall',
    coreComparison: 'Core Comparison',
    targetMarket: 'Target Market',
    targetCustomer: 'Target Customer',
    whyThisOpportunity: 'Why This Opportunity',
    strategyComparison: 'Strategy',
    opportunityAngle: 'Opportunity Angle',
    goToMarket: 'How to Reach the Market',
    bestFirstCustomer: 'Best First Customer',
    offerAndRevenue: 'Offer & Revenue',
    firstOffer: 'First Offer',
    revenueModel: 'Revenue Model',
    executionRisk: 'What could slow this down',
    nextSteps: 'Next Steps',
    risks: 'Risks',
    market: 'Market',
    customer: 'Customer',
    notSpecified: 'Not specified',
    failedToLoadReports: 'Failed to load reports.',
  },
  ar: {
    dir: 'rtl',
    newScan: 'تحليل جديد',
    myReports: 'تقاريري',
    logOut: 'تسجيل الخروج',
    decisionWorkspace: 'مساحة المقارنة',
    compareReports: 'مقارنة التقارير',
    compareIntro:
      'قارن بين الفرص المحفوظة جنبًا إلى جنب لتعرف أيها تستحق أن تبدأ بها أولًا.',
    selected: 'المحدد',
    sortBy: 'الفرز حسب',
    latest: 'الأحدث',
    oldest: 'الأقدم',
    highestScore: 'أعلى درجة',
    lowestScore: 'أقل درجة',
    byStatus: 'حسب الحالة',
    loadingWorkspace: 'جارٍ تحميل مساحة المقارنة',
    loadingTitle: 'جارٍ تحميل تقاريرك المحفوظة',
    loadingDescription: 'يقوم Madixo بتجهيز الفرص المحفوظة للمقارنة.',
    noSavedReports: 'لا توجد تقارير محفوظة',
    noReportsTitle: 'لا توجد تقارير متاحة للمقارنة',
    noReportsDescription:
      'احفظ تحليلين على الأقل أولًا، ثم عد إلى هنا لمقارنتهما جنبًا إلى جنب.',
    startNewScan: 'ابدأ تحليلًا جديدًا',
    openMyReports: 'افتح تقاريري',
    chooseReports: 'اختر الفرص',
    chooseReportsDescription:
      'اختر تحليلين على الأقل للمقارنة. خطتك الحالية هي التي تحدد عدد الأفكار التي يمكنك مقارنتها في نفس الوقت.',
    selectedCount: 'محدد',
    selectionPlanHint: 'الباقة الحالية',
    clearSelection: 'مسح التحديد',
    selectionLimitReached:
      'وصلت إلى حد المقارنة في خطتك الحالية. أزل تحديد تقرير أو قم بالترقية للمقارنة بعدد أكبر.',
    selectionHint: 'اختر الأفكار التي تريد مقارنتها جنبًا إلى جنب.',
    comparisonReady: 'المقارنة جاهزة',
    selectAtLeastTwo: 'اختر تحليلين على الأقل',
    selectAtLeastTwoTitle: 'اختر تحليلين على الأقل',
    selectAtLeastTwoDescription:
      'اختر تقريرين محفوظين أو أكثر أعلاه لفتح عرض المقارنة الكامل جنبًا إلى جنب.',
    selectedOpportunities: 'الفرص المحددة',
    selectedOpportunitiesDescription:
      'راجع الفروقات السريعة أولًا قبل النزول إلى تفاصيل المقارنة.',
    reportsInComparison: 'فرص في المقارنة',
    scoreBreakdown: 'تفصيل الدرجة',
    overall: 'الإجمالي',
    coreComparison: 'المقارنة الأساسية',
    targetMarket: 'السوق',
    targetCustomer: 'العميل',
    whyThisOpportunity: 'لماذا تبدو هذه فرصة جيدة',
    strategyComparison: 'طريقة التنفيذ',
    opportunityAngle: 'زاوية الدخول',
    goToMarket: 'طريقة الوصول للسوق',
    bestFirstCustomer: 'أفضل عميل نبدأ معه',
    offerAndRevenue: 'العرض وطريقة الربح',
    firstOffer: 'العرض الأول',
    revenueModel: 'طريقة الربح',
    executionRisk: 'ما الذي قد يبطئنا',
    nextSteps: 'ماذا نفعل الآن',
    risks: 'المخاطر',
    market: 'السوق',
    customer: 'العميل',
    notSpecified: 'غير محدد',
    failedToLoadReports: 'فشل تحميل التقارير.',
  },
} as const;

function getScoreBreakdownItems(language: UiLanguage) {
  if (language === 'ar') {
    return [
      { key: 'demand' as const, label: 'الطلب' },
      { key: 'abilityToWin' as const, label: 'قدرتنا على الفوز' },
      { key: 'monetization' as const, label: 'الربحية' },
      { key: 'speedToMvp' as const, label: 'سرعة البدء' },
      { key: 'distribution' as const, label: 'الوصول' },
    ];
  }

  return [
    { key: 'demand' as const, label: 'Demand' },
    { key: 'abilityToWin' as const, label: 'Ability to Win' },
    { key: 'monetization' as const, label: 'Monetization' },
    { key: 'speedToMvp' as const, label: 'Speed to MVP' },
    { key: 'distribution' as const, label: 'Distribution' },
  ];
}

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

function CompareCell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

function SectionGrid({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  return (
    <div
      className={`grid gap-6 ${
        count === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
      }`}
    >
      {children}
    </div>
  );
}

function getBreakdownColor(score: number) {
  if (score >= 75) return 'bg-[#ECFDF3] text-[#027A48]';
  if (score >= 60) return 'bg-[#EFF6FF] text-[#1D4ED8]';
  if (score >= 40) return 'bg-[#FFF7ED] text-[#C2410C]';
  return 'bg-[#FEF2F2] text-[#B42318]';
}

function ScoreBreakdownRow({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FAFAFB] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#111827]">{label}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBreakdownColor(
            score
          )}`}
        >
          {score}/100
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#111827]"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-sm leading-7 text-[#4B5563]">{note}</p>
    </div>
  );
}

export default function CompareReportsPage() {
  const [reports, setReports] = useState<SavedMadixoReport[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, ReportLifecycleStatus>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [plan, setPlan] = useState<'free' | 'pro' | 'team'>('free');
  const [planLabelFromApi, setPlanLabelFromApi] = useState('');
  const [showCompareLimitPrompt, setShowCompareLimitPrompt] = useState(false);
  const [sortBy, setSortBy] = useState<CompareSortMode>('latest');
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguage>(() => getClientUiLanguage('en'));

  useEffect(() => {
    fetchCurrentPlanClient().then((payload) => {
      setPlan(payload.plan);
      setPlanLabelFromApi(payload.label || '');
    });
  }, []);

  const copy = UI_COPY[preferredLanguage];
  const scoreBreakdownItems = getScoreBreakdownItems(preferredLanguage);
  const compareLimit = getCompareSelectionLimit(plan);
  const currentPlanLabel = planLabelFromApi || getPlanLabel(plan, preferredLanguage);

  const refreshReports = useCallback(async (nextSort: CompareSortMode = sortBy) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/reports?sort=${encodeURIComponent(nextSort === 'status' ? 'latest' : nextSort)}`,
        { cache: 'no-store' }
      );

      const payload = (await response.json().catch(() => ({}))) as ReportsApiPayload;

      if (response.status === 401 || payload.error === 'AUTH_REQUIRED') {
        window.location.assign('/login?mode=login&next=/compare');
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || copy.failedToLoadReports);
      }

      const mapped = Array.isArray(payload.reports) ? payload.reports : [];
      const planRows = Array.isArray(payload.validationPlans) ? payload.validationPlans : [];

      const nextReports = [...mapped];

      const reportIds = mapped.map((item) => item.id);
      const nextStatusMap: Record<string, ReportLifecycleStatus> = {};

      for (const reportId of reportIds) {
        nextStatusMap[reportId] = 'analysis_only';
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

        nextStatusMap[reportId] = getReportLifecycleStatus({
          hasValidationPlan: true,
          hasIterationEngine: Boolean(matchingRow.iteration_engine_json),
          hasEvidenceSummary: Boolean(matchingRow.evidence_summary_json),
          hasDecisionState:
            matchingRow.decision_state === 'continue' ||
            matchingRow.decision_state === 'pivot' ||
            matchingRow.decision_state === 'stop',
        });
      }

      if (nextSort === 'status') {
        nextReports.sort((a, b) => {
          return (
            lifecycleStatusPriority(nextStatusMap[a.id] || 'analysis_only') -
            lifecycleStatusPriority(nextStatusMap[b.id] || 'analysis_only')
          );
        });
      }

      setReports(nextReports);
      setStatusMap(nextStatusMap);

      setSelectedIds((current) => {
        const availableIds = new Set(nextReports.map((item) => item.id));
        const filtered = current.filter((id) => availableIds.has(id));

        if (!initialized && filtered.length === 0 && nextReports.length >= 2) {
          return nextReports.slice(0, 2).map((item) => item.id);
        }

        return filtered;
      });

      if (!initialized) {
        setInitialized(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failedToLoadReports);
    } finally {
      setLoading(false);
    }
  }, [copy.failedToLoadReports, initialized, preferredLanguage, sortBy]);

  useEffect(() => {
    refreshReports(sortBy);
  }, [refreshReports, sortBy]);

  const selectedReports = useMemo(() => {
    return reports.filter((report) => selectedIds.includes(report.id));
  }, [reports, selectedIds]);

  const canCompare = selectedReports.length >= 2;
  const selectionLimitReached = selectedIds.length >= compareLimit;
  const compareUpgradeNotice = useMemo(
    () => getCompareUpgradeNotice(preferredLanguage, currentPlanLabel, compareLimit, showCompareLimitPrompt || selectionLimitReached),
    [preferredLanguage, currentPlanLabel, compareLimit, showCompareLimitPrompt, selectionLimitReached]
  );

  const handleToggle = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= compareLimit) {
        setShowCompareLimitPrompt(true);
        return current;
      }

      return [...current, id];
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]"
    >
      <div className="mx-auto max-w-7xl">
        <SiteHeader
          uiLang={preferredLanguage}
          onLanguageChange={setPreferredLanguage}
          logo={<MadixoLogo />}
          maxWidthClass="max-w-7xl"
          className="mb-8"
        />

        {compareUpgradeNotice ? (
          <div className="mb-6">
            <PlanUpgradeNotice
              title={compareUpgradeNotice.title}
              description={compareUpgradeNotice.description}
              ctaHref={showCompareLimitPrompt || selectionLimitReached ? '/upgrade?reason=compare_limit' : '/pricing'}
              ctaLabel={showCompareLimitPrompt || selectionLimitReached ? (preferredLanguage === 'ar' ? 'ترقية الآن' : 'Upgrade now') : (preferredLanguage === 'ar' ? 'شاهد الباقات' : 'View plans')}
              secondaryHref={showCompareLimitPrompt || selectionLimitReached ? '/pricing' : undefined}
              secondaryLabel={showCompareLimitPrompt || selectionLimitReached ? (preferredLanguage === 'ar' ? 'شاهد الباقات' : 'View plans') : undefined}
              tone={compareUpgradeNotice.tone}
            />
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {copy.decisionWorkspace}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              {copy.compareReports}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4B5563]">
              {copy.compareIntro}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.selected}
              </p>
              <p className="mt-1 text-2xl font-bold">{selectedIds.length}/{compareLimit}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{copy.selectionPlanHint}: {currentPlanLabel}</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
              <label
                htmlFor="sort-compare-reports"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]"
              >
                {copy.sortBy}
              </label>
              <select
                id="sort-compare-reports"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as CompareSortMode)}
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

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.loadingWorkspace}
              </div>

              <h2 className="mt-6 text-3xl font-bold md:text-4xl">
                {copy.loadingTitle}
              </h2>

              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {copy.loadingDescription}
              </p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.noSavedReports}
              </div>

              <h2 className="mt-6 text-3xl font-bold md:text-4xl">
                {copy.noReportsTitle}
              </h2>

              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {copy.noReportsDescription}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-block rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {copy.startNewScan}
                </Link>

                <Link
                  href="/reports"
                  className="inline-block rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                >
                  {copy.openMyReports}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{copy.chooseReports}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                    {copy.chooseReportsDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm font-semibold text-[#374151]">
                    {selectedIds.length} {copy.selectedCount}
                  </span>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={selectedIds.length === 0}
                    className="rounded-full border border-[#111827] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.clearSelection}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((report) => {
                  const selected = selectedIds.includes(report.id);
                  const safeLabel = getOpportunityLabelForUi(
                    report.result.opportunityScore,
                    report.result.opportunityLabel,
                    preferredLanguage
                  );
                  const safeMarket = report.market || copy.notSpecified;
                  const safeCustomer = report.customer || copy.notSpecified;
                  const lifecycleStatus = statusMap[report.id] || 'analysis_only';

                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => handleToggle(report.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        selected
                          ? 'border-[#111827] bg-[#F9FAFB] ring-2 ring-[#111827]/10'
                          : 'border-[#E5E7EB] bg-white hover:bg-[#FAFAFB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-[#6B7280]">
                          {formatSavedReportDateLocalized(
                            report.createdAt,
                            preferredLanguage
                          )}
                        </p>

                        {selected && (
                          <span className="rounded-full bg-[#111827] px-2.5 py-1 text-[11px] font-semibold text-white">
                            {copy.selected}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <LifecycleStatusBadge
                          status={lifecycleStatus}
                          uiLang={preferredLanguage}
                        />
                      </div>

                      <MixedText
                        as="h3"
                        text={report.query}
                        className="mt-3 text-lg font-semibold leading-7 text-[#111827]"
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                          {report.result.opportunityScore}/100
                        </span>

                        <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#027A48]">
                          {safeLabel}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F9FAFB] px-3 py-1 text-xs font-medium text-[#4B5563]">
                          {copy.market}:{' '}
                          <MixedText as="span" text={safeMarket} />
                        </span>

                        <span className="rounded-full bg-[#F9FAFB] px-3 py-1 text-xs font-medium text-[#4B5563]">
                          {copy.customer}:{' '}
                          <MixedText as="span" text={safeCustomer} />
                        </span>
                      </div>

                      <MixedText
                        as="p"
                        text={report.result.summary}
                        className="mt-4 text-sm leading-7 text-[#4B5563]"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[#6B7280]">
                  {selectionLimitReached
                    ? copy.selectionLimitReached
                    : copy.selectionHint}
                </p>

                <div className="text-sm font-semibold text-[#374151]">
                  {canCompare ? copy.comparisonReady : copy.selectAtLeastTwo}
                </div>
              </div>
            </div>

            {!canCompare ? (
              <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-semibold">
                  {copy.selectAtLeastTwoTitle}
                </h2>
                <p className="mt-3 text-lg leading-8 text-[#4B5563]">
                  {copy.selectAtLeastTwoDescription}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-7">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {copy.selectedOpportunities}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                        {copy.selectedOpportunitiesDescription}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm font-semibold text-[#374151]">
                      {selectedReports.length} {copy.reportsInComparison}
                    </span>
                  </div>

                  <div className="mt-6">
                    <SectionGrid count={selectedReports.length}>
                      {selectedReports.map((report) => {
                        const safeLabel = getOpportunityLabelForUi(
                          report.result.opportunityScore,
                          report.result.opportunityLabel,
                          preferredLanguage
                        );
                        const lifecycleStatus = statusMap[report.id] || 'analysis_only';

                        return (
                          <div
                            key={report.id}
                            className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-sm font-medium text-[#6B7280]">
                                {formatSavedReportDateLocalized(
                                  report.createdAt,
                                  preferredLanguage
                                )}
                              </p>

                              <LifecycleStatusBadge
                                status={lifecycleStatus}
                                uiLang={preferredLanguage}
                              />
                            </div>

                            <MixedText
                              as="h2"
                              text={report.query}
                              className="mt-3 text-2xl font-bold leading-9"
                            />

                            <div className="mt-4 flex flex-wrap gap-3">
                              <span className="rounded-full bg-[#ECFDF3] px-4 py-2 text-sm font-semibold text-[#027A48]">
                                {report.result.opportunityScore}/100 — {safeLabel}
                              </span>
                            </div>

                            <MixedText
                              as="p"
                              text={report.result.summary}
                              className="mt-5 text-base leading-8 text-[#4B5563]"
                            />
                          </div>
                        );
                      })}
                    </SectionGrid>
                  </div>
                </div>

                <section>
                  <h3 className="mb-4 text-2xl font-semibold">
                    {copy.scoreBreakdown}
                  </h3>

                  <SectionGrid count={selectedReports.length}>
                    {selectedReports.map((report) => {
                      const safeLabel = getOpportunityLabelForUi(
                        report.result.opportunityScore,
                        report.result.opportunityLabel,
                        preferredLanguage
                      );

                      return (
                        <CompareCell key={`${report.id}-breakdown`}>
                          <div className="mb-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#111827] px-3 py-1.5 text-sm font-semibold text-white">
                              {copy.overall}: {report.result.opportunityScore}/100
                            </span>
                            <span className="rounded-full bg-[#ECFDF3] px-3 py-1.5 text-sm font-semibold text-[#027A48]">
                              {safeLabel}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {scoreBreakdownItems.map((item) => {
                              const breakdown = report.result.scoreBreakdown[item.key];

                              return (
                                <ScoreBreakdownRow
                                  key={item.key}
                                  label={item.label}
                                  score={breakdown.score}
                                  note={breakdown.note}
                                />
                              );
                            })}
                          </div>
                        </CompareCell>
                      );
                    })}
                  </SectionGrid>
                </section>

                <section>
                  <h3 className="mb-4 text-2xl font-semibold">
                    {copy.coreComparison}
                  </h3>

                  <SectionGrid count={selectedReports.length}>
                    {selectedReports.map((report) => {
                      const safeMarket = report.market || copy.notSpecified;
                      const safeCustomer = report.customer || copy.notSpecified;

                      return (
                        <CompareCell key={`${report.id}-core`}>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-[#6B7280]">
                                {copy.targetMarket}
                              </p>
                              <MixedText
                                as="p"
                                text={safeMarket}
                                className="mt-1 text-base text-[#374151]"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#6B7280]">
                                {copy.targetCustomer}
                              </p>
                              <MixedText
                                as="p"
                                text={safeCustomer}
                                className="mt-1 text-base text-[#374151]"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#6B7280]">
                                {copy.whyThisOpportunity}
                              </p>
                              <MixedText
                                as="p"
                                text={report.result.whyThisOpportunity}
                                className="mt-1 text-base leading-8 text-[#374151]"
                              />
                            </div>
                          </div>
                        </CompareCell>
                      );
                    })}
                  </SectionGrid>
                </section>

                <section>
                  <h3 className="mb-4 text-2xl font-semibold">
                    {copy.strategyComparison}
                  </h3>

                  <SectionGrid count={selectedReports.length}>
                    {selectedReports.map((report) => (
                      <CompareCell key={`${report.id}-strategy`}>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.opportunityAngle}
                            </p>
                            <MixedText
                              as="p"
                              text={report.result.opportunityAngle}
                              className="mt-1 text-base leading-8 text-[#374151]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.goToMarket}
                            </p>
                            <MixedText
                              as="p"
                              text={report.result.goToMarket}
                              className="mt-1 text-base leading-8 text-[#374151]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.bestFirstCustomer}
                            </p>
                            <MixedText
                              as="p"
                              text={report.result.bestFirstCustomer.title}
                              className="mt-1 text-base leading-8 text-[#374151]"
                            />
                          </div>
                        </div>
                      </CompareCell>
                    ))}
                  </SectionGrid>
                </section>

                <section>
                  <h3 className="mb-4 text-2xl font-semibold">
                    {copy.offerAndRevenue}
                  </h3>

                  <SectionGrid count={selectedReports.length}>
                    {selectedReports.map((report) => (
                      <CompareCell key={`${report.id}-revenue`}>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.firstOffer}
                            </p>
                            <MixedText
                              as="p"
                              text={report.result.firstOffer.title}
                              className="mt-1 text-base font-semibold text-[#111827]"
                            />
                            <MixedText
                              as="p"
                              text={report.result.firstOffer.priceIdea}
                              className="mt-2 text-base text-[#374151]"
                            />
                            <MixedText
                              as="p"
                              text={report.result.firstOffer.description}
                              className="mt-2 text-sm leading-7 text-[#4B5563]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.revenueModel}
                            </p>
                            <MixedText
                              as="p"
                              text={report.result.revenueModel.title}
                              className="mt-1 text-base font-semibold text-[#111827]"
                            />
                            <MixedText
                              as="p"
                              text={report.result.revenueModel.price}
                              className="mt-2 text-base text-[#374151]"
                            />
                            <MixedText
                              as="p"
                              text={report.result.revenueModel.description}
                              className="mt-2 text-sm leading-7 text-[#4B5563]"
                            />
                          </div>
                        </div>
                      </CompareCell>
                    ))}
                  </SectionGrid>
                </section>

                <section>
                  <h3 className="mb-4 text-2xl font-semibold">
                    {copy.executionRisk}
                  </h3>

                  <SectionGrid count={selectedReports.length}>
                    {selectedReports.map((report) => (
                      <CompareCell key={`${report.id}-execution`}>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.nextSteps}
                            </p>
                            <div className="mt-2 space-y-2 text-base leading-8 text-[#374151]">
                              {report.result.nextSteps.map((step) => (
                                <MixedText
                                  key={step}
                                  as="p"
                                  text={`• ${step}`}
                                  className="text-base leading-8 text-[#374151]"
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[#6B7280]">
                              {copy.risks}
                            </p>
                            <div className="mt-2 space-y-2 text-base leading-8 text-[#374151]">
                              {report.result.risks.map((risk) => (
                                <MixedText
                                  key={risk}
                                  as="p"
                                  text={`• ${risk}`}
                                  className="text-base leading-8 text-[#374151]"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CompareCell>
                    ))}
                  </SectionGrid>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
