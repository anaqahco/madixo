'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import MixedText from '@/components/mixed-text';
import SiteHeader from '@/components/site-header';
import PlanUpgradeNotice from '@/components/plan-upgrade-notice';
import type { SavedMadixoReport } from '@/lib/madixo-reports';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

type ValidationDecisionState = 'undecided' | 'continue' | 'pivot' | 'stop';

type ValidationPlanStatusRow = {
  report_id: string;
  ui_lang: UiLanguage;
  evidence_summary_json: unknown | null;
  iteration_engine_json: unknown | null;
  decision_state: ValidationDecisionState | null;
  updated_at?: string | null;
};

type DashboardStage =
  | 'analysis_only'
  | 'collecting_evidence'
  | 'decision_view_ready'
  | 'current_decision_set'
  | 'best_step_ready';

type FocusItem = {
  report: SavedMadixoReport;
  stage: DashboardStage;
  updatedAt: string;
};

type PlanKey = 'free' | 'pro' | 'team';

type PlanUsage = {
  analysisRunsUsed: number;
  analysisRunsLimit: number | null;
  savedReportsUsed: number;
  savedReportsLimit: number;
  compareReportsLimit: number;
};

type DashboardPayload = {
  ok: boolean;
  reports?: SavedMadixoReport[];
  stageMap?: Record<string, DashboardStage>;
  stageUpdatedAtMap?: Record<string, string>;
  plan?: PlanKey;
  currentPlanLabel?: string;
  planUsage?: PlanUsage | null;
  error?: string;
};

function getDashboardUpgradeNotice(language: UiLanguage, planLabel: string, usage: PlanUsage | null) {
  if (!usage) return null;

  const safePlanLabel = planLabel || (language === 'ar' ? 'باقتك الحالية' : 'your current plan');

  if (usage.analysisRunsLimit !== null && usage.analysisRunsUsed >= usage.analysisRunsLimit) {
    return {
      title: language === 'ar' ? 'وصلت إلى حد التحليلات في باقتك الحالية.' : 'You reached the analysis limit for your current plan.',
      description:
        language === 'ar'
          ? `استخدمت ${usage.analysisRunsUsed} من ${usage.analysisRunsLimit} تحليلًا داخل ${safePlanLabel}. للمتابعة بتحليلات جديدة، فعّل باقة أعلى.`
          : `You used ${usage.analysisRunsUsed} of ${usage.analysisRunsLimit} analyses in ${safePlanLabel}. Upgrade to continue with new analyses.`,
      reason: 'analysis_limit',
      tone: 'amber' as const,
    };
  }

  if (usage.savedReportsUsed >= usage.savedReportsLimit) {
    return {
      title: language === 'ar' ? 'امتلأت مساحة الفرص المحفوظة في باقتك الحالية.' : 'Your saved opportunities limit is full.',
      description:
        language === 'ar'
          ? `لديك الآن ${usage.savedReportsUsed} من ${usage.savedReportsLimit} فرصة محفوظة داخل ${safePlanLabel}. فعّل باقة أعلى لتكمل الحفظ.`
          : `You now have ${usage.savedReportsUsed} of ${usage.savedReportsLimit} saved opportunities in ${safePlanLabel}. Upgrade to keep saving.`,
      reason: 'reports_limit',
      tone: 'amber' as const,
    };
  }

  const nearingAnalysisLimit = usage.analysisRunsLimit !== null && usage.analysisRunsUsed >= Math.max(1, usage.analysisRunsLimit - 1);
  const nearingReportsLimit = usage.savedReportsUsed >= Math.max(1, usage.savedReportsLimit - 1);

  if (nearingAnalysisLimit || nearingReportsLimit) {
    return {
      title: language === 'ar' ? 'أنت قريب من حد باقتك الحالية.' : 'You are getting close to your current plan limit.',
      description:
        language === 'ar'
          ? `راجع استهلاكك الحالي في ${safePlanLabel} وفكّر في الترقية قبل أن تتوقف أثناء التحليل أو الحفظ.`
          : `Review your current usage in ${safePlanLabel} and consider upgrading before you hit a stop while analyzing or saving.`,
      reason: nearingReportsLimit ? 'reports_limit' : 'analysis_limit',
      tone: 'blue' as const,
    };
  }

  return null;
}

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

function formatLocalizedDate(value: string, language: UiLanguage) {
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

function makeExcerpt(value: string | null | undefined, maxLength = 170) {
  const cleaned = (value || '').replace(/\s+/g, ' ').trim();

  if (!cleaned) return '';

  if (cleaned.length <= maxLength) return cleaned;

  return `${cleaned.slice(0, maxLength).trim()}…`;
}

function getDashboardStage(
  row: ValidationPlanStatusRow | undefined
): DashboardStage {
  if (!row) return 'analysis_only';
  if (row.iteration_engine_json) return 'best_step_ready';
  if (
    row.decision_state === 'continue' ||
    row.decision_state === 'pivot' ||
    row.decision_state === 'stop'
  ) {
    return 'current_decision_set';
  }
  if (row.evidence_summary_json) return 'decision_view_ready';
  return 'collecting_evidence';
}

function stagePriority(stage: DashboardStage) {
  switch (stage) {
    case 'best_step_ready':
      return 1;
    case 'current_decision_set':
      return 2;
    case 'decision_view_ready':
      return 3;
    case 'collecting_evidence':
      return 4;
    case 'analysis_only':
    default:
      return 5;
  }
}

const UI_COPY = {
  en: {
    dir: 'ltr',
    dashboard: 'Dashboard',
    workspaceOverview: 'Workspace overview',
    heroTitle: 'See exactly where your opportunities stand now.',
    heroDescription:
      'Madixo gives you one clear place to review your saved opportunities, know their current stage, and continue from the right next action.',
    quickActions: 'Quick actions',
    startNewAnalysis: 'Analyze a new idea',
    openReports: 'Open reports',
    openCompare: 'Open compare',
    continueFocus: 'Continue the priority opportunity',

    totalIdeas: 'Total opportunities',
    activeValidation: 'Validation in progress',
    bestStepReady: 'Best step ready',
    currentDecisionSet: 'Current decision set',

    totalIdeasHint: 'All opportunities saved in your workspace.',
    activeValidationHint: 'Opportunities already inside the validation workspace.',
    bestStepReadyHint: 'Opportunities that already have a best step ready now.',
    currentDecisionSetHint: 'Opportunities where a current direction is already selected.',

    focusNow: 'Priority now',
    focusDescription:
      'This is the opportunity that deserves your attention first based on its current stage.',
    noFocusYet: 'No priority opportunity yet.',
    noFocusDescription:
      'Save your first opportunity and it will start appearing here.',
    score: 'Score',
    market: 'Market',
    customer: 'Customer',
    lastUpdate: 'Last update',
    currentStage: 'Current stage',
    nextAction: 'Next action',
    quickSummary: 'Quick summary',

    recentIdeas: 'Latest opportunities',
    recentIdeasDescription:
      'Your latest saved opportunities, with their current stage and the clearest next action.',
    noSavedIdeas: 'No saved opportunities yet',
    noSavedIdeasDescription:
      'Run your first analysis, save it, and it will appear here.',
    loadingDashboard: 'Loading dashboard',
    loadingDescription:
      'Madixo is reviewing your saved opportunities and current workspace stages.',
    failedToLoadDashboard: 'Failed to load dashboard.',
    tryAgain: 'Try again',
    emptyPrimaryAction: 'Start your first analysis',

    stage_analysis_only: 'Analysis only',
    stage_collecting_evidence: 'Needs market notes',
    stage_decision_view_ready: 'Decision view ready',
    stage_current_decision_set: 'Current decision set',
    stage_best_step_ready: 'Best step ready',

    stageHint_analysis_only:
      'This opportunity is still only a report. Move it into validation when you are ready.',
    stageHint_collecting_evidence:
      'This opportunity is already in validation, but it needs more market notes first.',
    stageHint_decision_view_ready:
      'This opportunity has enough saved notes to build or refresh the decision view.',
    stageHint_current_decision_set:
      'This opportunity already has a current direction, and is close to generating the best step now.',
    stageHint_best_step_ready:
      'This opportunity already has a best step ready now and deserves immediate attention.',

    action_analysis_only: 'Open report',
    action_collecting_evidence: 'Add market notes',
    action_decision_view_ready: 'Generate decision view',
    action_current_decision_set: 'Generate best step now',
    action_best_step_ready: 'Continue from best step',

    openOpportunity: 'Open opportunity',
    compare: 'Compare',
  },
  ar: {
    dir: 'rtl',
    dashboard: 'لوحة التحكم',
    workspaceOverview: 'نظرة سريعة على مساحة العمل',
    heroTitle: 'اعرف أين وصلت فرصك الآن.',
    heroDescription:
      'تعطيك لوحة Madixo مكانًا واضحًا لمراجعة فرصك المحفوظة، ومعرفة مرحلتها الحالية، والمتابعة من الإجراء الصحيح التالي.',
    quickActions: 'اختصارات سريعة',
    startNewAnalysis: 'حلّل فكرة جديدة',
    openReports: 'افتح التقارير',
    openCompare: 'افتح المقارنة',
    continueFocus: 'أكمل الفرصة الأهم الآن',

    totalIdeas: 'إجمالي الفرص',
    activeValidation: 'فرص قيد التحقق',
    bestStepReady: 'أفضل خطوة الآن جاهزة',
    currentDecisionSet: 'فرص لها قرار حالي',

    totalIdeasHint: 'كل الفرص المحفوظة في مساحة عملك.',
    activeValidationHint: 'فرص دخلت بالفعل إلى مساحة التحقق.',
    bestStepReadyHint: 'فرص لديها أفضل خطوة الآن جاهزة للتنفيذ.',
    currentDecisionSetHint: 'فرص تم تحديد اتجاهها الحالي بالفعل.',

    focusNow: 'الأهم الآن',
    focusDescription:
      'هذه هي الفرصة التي تستحق انتباهك أولًا بناءً على مرحلتها الحالية.',
    noFocusYet: 'لا توجد فرصة أولوية الآن.',
    noFocusDescription:
      'احفظ أول فرصة لديك، وستبدأ بالظهور هنا.',
    score: 'التقييم',
    market: 'السوق',
    customer: 'العميل',
    lastUpdate: 'آخر تحديث',
    currentStage: 'المرحلة الحالية',
    nextAction: 'الإجراء التالي',
    quickSummary: 'الخلاصة السريعة',

    recentIdeas: 'أحدث الفرص',
    recentIdeasDescription:
      'آخر الفرص المحفوظة لديك، مع مرحلتها الحالية والإجراء التالي الأوضح.',
    noSavedIdeas: 'لا توجد فرص محفوظة بعد',
    noSavedIdeasDescription:
      'حلّل أول فكرة ثم احفظها، وستظهر هنا.',
    loadingDashboard: 'جارٍ تحميل لوحة التحكم',
    loadingDescription:
      'يقوم Madixo الآن بمراجعة فرصك المحفوظة ومراحل مساحة العمل الحالية.',
    failedToLoadDashboard: 'تعذر تحميل لوحة التحكم.',
    tryAgain: 'إعادة المحاولة',
    emptyPrimaryAction: 'ابدأ أول تحليل',

    stage_analysis_only: 'تحليل فقط',
    stage_collecting_evidence: 'يحتاج ملاحظات سوق',
    stage_decision_view_ready: 'رؤية القرار جاهزة',
    stage_current_decision_set: 'قرار حالي محدد',
    stage_best_step_ready: 'أفضل خطوة الآن جاهزة',

    stageHint_analysis_only:
      'هذه الفرصة ما زالت تقريرًا فقط. انقلها إلى مساحة التحقق عندما تكون جاهزًا.',
    stageHint_collecting_evidence:
      'هذه الفرصة دخلت بالفعل إلى مساحة التحقق، لكنها تحتاج ملاحظات سوق أكثر أولًا.',
    stageHint_decision_view_ready:
      'هذه الفرصة لديها ملاحظات محفوظة كافية لبناء أو تحديث رؤية القرار.',
    stageHint_current_decision_set:
      'هذه الفرصة لديها اتجاه حالي واضح، وأصبحت قريبة من إنشاء أفضل خطوة الآن.',
    stageHint_best_step_ready:
      'هذه الفرصة لديها أفضل خطوة الآن جاهزة، وتستحق انتباهك الفوري.',

    action_analysis_only: 'افتح التقرير',
    action_collecting_evidence: 'أضف ملاحظات السوق',
    action_decision_view_ready: 'أنشئ رؤية القرار',
    action_current_decision_set: 'أنشئ أفضل خطوة الآن',
    action_best_step_ready: 'أكمل من أفضل خطوة الآن',

    openOpportunity: 'افتح الفرصة',
    compare: 'قارن',
  },
} as const;

function stageLabel(stage: DashboardStage, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];
  return copy[`stage_${stage}`];
}

function stageHint(stage: DashboardStage, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];
  return copy[`stageHint_${stage}`];
}

function stageActionLabel(stage: DashboardStage, uiLang: UiLanguage) {
  const copy = UI_COPY[uiLang];
  return copy[`action_${stage}`];
}

function stageTone(stage: DashboardStage) {
  switch (stage) {
    case 'best_step_ready':
      return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
    case 'current_decision_set':
      return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
    case 'decision_view_ready':
      return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
    case 'collecting_evidence':
      return 'border-[#FDEAD7] bg-[#FFF7ED] text-[#C2410C]';
    case 'analysis_only':
    default:
      return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]';
  }
}

function getPrimaryHref(reportId: string, stage: DashboardStage) {
  if (stage === 'analysis_only') {
    return `/results?reportId=${reportId}`;
  }

  return `/validate/${reportId}`;
}

function StageBadge({
  stage,
  uiLang,
}: {
  stage: DashboardStage;
  uiLang: UiLanguage;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stageTone(
        stage
      )}`}
    >
      {stageLabel(stage, uiLang)}
    </span>
  );
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

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [reports, setReports] = useState<SavedMadixoReport[]>([]);
  const [stageMap, setStageMap] = useState<Record<string, DashboardStage>>({});
  const [stageUpdatedAtMap, setStageUpdatedAtMap] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguage>('en');
  const [currentPlanLabel, setCurrentPlanLabel] = useState('');
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);

  const copy = UI_COPY[preferredLanguage];

  useEffect(() => {
    setPreferredLanguage(getClientUiLanguage('en'));
  }, []);

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/dashboard?uiLang=${preferredLanguage}`,
        { cache: 'no-store' }
      );

      const payload = (await response.json()) as DashboardPayload;

      if (response.status === 401 || payload.error === 'AUTH_REQUIRED') {
        window.location.assign('/login?mode=login&next=/dashboard');
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || copy.failedToLoadDashboard);
      }

      setReports(payload.reports ?? []);
      setStageMap(payload.stageMap ?? {});
      setStageUpdatedAtMap(payload.stageUpdatedAtMap ?? {});
      setCurrentPlanLabel(payload.currentPlanLabel ?? '');
      setPlanUsage(payload.planUsage ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.failedToLoadDashboard
      );
      setReports([]);
      setStageMap({});
      setStageUpdatedAtMap({});
      setCurrentPlanLabel('');
      setPlanUsage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredLanguage]);

  const stats = useMemo(() => {
    const counts = {
      total: reports.length,
      activeValidation: 0,
      bestStepReady: 0,
      currentDecisionSet: 0,
    };

    for (const report of reports) {
      const stage = stageMap[report.id] || 'analysis_only';

      if (stage !== 'analysis_only') counts.activeValidation += 1;
      if (stage === 'best_step_ready') counts.bestStepReady += 1;
      if (stage === 'current_decision_set') counts.currentDecisionSet += 1;
    }

    return counts;
  }, [reports, stageMap]);

  const focusItem = useMemo<FocusItem | null>(() => {
    if (!reports.length) return null;

    const ranked = [...reports].sort((a, b) => {
      const stageDiff =
        stagePriority(stageMap[a.id] || 'analysis_only') -
        stagePriority(stageMap[b.id] || 'analysis_only');

      if (stageDiff !== 0) return stageDiff;

      return b.result.opportunityScore - a.result.opportunityScore;
    });

    const report = ranked[0];
    const stage = stageMap[report.id] || 'analysis_only';
    const updatedAt = stageUpdatedAtMap[report.id] || report.createdAt;

    return {
      report,
      stage,
      updatedAt,
    };
  }, [reports, stageMap, stageUpdatedAtMap]);

  const recentReports = useMemo(() => reports.slice(0, 6), [reports]);

  const dashboardUpgradeNotice = useMemo(
    () => getDashboardUpgradeNotice(preferredLanguage, currentPlanLabel, planUsage),
    [preferredLanguage, currentPlanLabel, planUsage]
  );

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]"
    >
      <SiteHeader
        uiLang={preferredLanguage}
        onLanguageChange={setPreferredLanguage}
        logo={<MadixoLogo />}
      />

      <div className="mx-auto mt-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-9">
            <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {copy.workspaceOverview}
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              {copy.heroTitle}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4B5563]">
              {copy.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {copy.startNewAnalysis}
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
              >
                {copy.openReports}
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
              >
                {copy.openCompare}
              </Link>
              {focusItem ? (
                <Link
                  href={getPrimaryHref(focusItem.report.id, focusItem.stage)}
                  className="inline-flex items-center rounded-full border border-[#111827] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                >
                  {copy.continueFocus}
                </Link>
              ) : null}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {copy.quickActions}
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/"
                className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm font-semibold text-[#111827] transition hover:bg-white"
              >
                {copy.startNewAnalysis}
              </Link>
              <Link
                href="/reports"
                className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm font-semibold text-[#111827] transition hover:bg-white"
              >
                {copy.openReports}
              </Link>
              <Link
                href="/compare"
                className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm font-semibold text-[#111827] transition hover:bg-white"
              >
                {copy.openCompare}
              </Link>
              {focusItem ? (
                <Link
                  href={getPrimaryHref(focusItem.report.id, focusItem.stage)}
                  className="rounded-[22px] border border-[#111827] bg-[#111827] px-4 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {stageActionLabel(focusItem.stage, preferredLanguage)}
                </Link>
              ) : null}
            </div>
          </section>
        </div>


        {planUsage ? (
          <section className="mt-6 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  {preferredLanguage === 'ar' ? 'الباقة الحالية' : 'Current plan'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                  {currentPlanLabel || (preferredLanguage === 'ar' ? 'المجانية' : 'Free')}
                </h2>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white"
              >
                {preferredLanguage === 'ar' ? 'إدارة الباقة' : 'Manage plan'}
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold text-[#6B7280]">
                  {preferredLanguage === 'ar' ? 'استهلاك التحليلات' : 'Analysis usage'}
                </p>
                <p className="mt-2 text-xl font-bold text-[#111827]">
                  {planUsage.analysisRunsLimit === null
                    ? preferredLanguage === 'ar'
                      ? `${planUsage.analysisRunsUsed} مستخدمة — بدون حد`
                      : `${planUsage.analysisRunsUsed} used — unlimited`
                    : `${planUsage.analysisRunsUsed} / ${planUsage.analysisRunsLimit}`}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold text-[#6B7280]">
                  {preferredLanguage === 'ar' ? 'الفرص المحفوظة' : 'Saved opportunities'}
                </p>
                <p className="mt-2 text-xl font-bold text-[#111827]">
                  {planUsage.savedReportsUsed} / {planUsage.savedReportsLimit}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold text-[#6B7280]">
                  {preferredLanguage === 'ar' ? 'حد المقارنة' : 'Compare limit'}
                </p>
                <p className="mt-2 text-xl font-bold text-[#111827]">
                  {preferredLanguage === 'ar'
                    ? `حتى ${planUsage.compareReportsLimit} ${planUsage.compareReportsLimit === 2 ? 'فرصتين' : 'فرص'}`
                    : `Up to ${planUsage.compareReportsLimit}`}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {dashboardUpgradeNotice ? (
          <div className="mt-6">
            <PlanUpgradeNotice
              title={dashboardUpgradeNotice.title}
              description={dashboardUpgradeNotice.description}
              ctaHref={`/upgrade?reason=${dashboardUpgradeNotice.reason}`}
              ctaLabel={preferredLanguage === 'ar' ? 'ترقية الآن' : 'Upgrade now'}
              secondaryHref="/pricing"
              secondaryLabel={preferredLanguage === 'ar' ? 'شاهد الباقات' : 'View plans'}
              tone={dashboardUpgradeNotice.tone}
            />
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={refreshDashboard}
                className="rounded-full border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
              >
                {copy.tryAgain}
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.loadingDashboard}
              </div>

              <p className="mt-5 text-lg leading-8 text-[#4B5563]">
                {copy.loadingDescription}
              </p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-[#E5E7EB] bg-white px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                {copy.dashboard}
              </div>

              <h2 className="mt-6 text-3xl font-bold md:text-4xl">
                {copy.noSavedIdeas}
              </h2>

              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {copy.noSavedIdeasDescription}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-block rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {copy.emptyPrimaryAction}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title={copy.totalIdeas}
                value={stats.total}
                hint={copy.totalIdeasHint}
              />
              <StatCard
                title={copy.activeValidation}
                value={stats.activeValidation}
                hint={copy.activeValidationHint}
              />
              <StatCard
                title={copy.bestStepReady}
                value={stats.bestStepReady}
                hint={copy.bestStepReadyHint}
              />
              <StatCard
                title={copy.currentDecisionSet}
                value={stats.currentDecisionSet}
                hint={copy.currentDecisionSetHint}
              />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      {copy.focusNow}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                      {focusItem ? (
                        <MixedText text={focusItem.report.query || copy.noFocusYet} />
                      ) : (
                        copy.noFocusYet
                      )}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B7280]">
                      {focusItem
                        ? stageHint(focusItem.stage, preferredLanguage)
                        : copy.noFocusDescription}
                    </p>
                  </div>

                  {focusItem ? (
                    <StageBadge stage={focusItem.stage} uiLang={preferredLanguage} />
                  ) : null}
                </div>

                {focusItem ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        {copy.score}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#111827]">
                        {focusItem.report.result.opportunityScore}
                      </p>
                      <p className="mt-2 text-sm text-[#6B7280]">
                        {getOpportunityLabelForUi(
                          focusItem.report.result.opportunityScore,
                          focusItem.report.result.opportunityLabel,
                          preferredLanguage
                        )}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        {copy.market}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-7 text-[#111827]">
                        <MixedText text={focusItem.report.market || '-'} />
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        {copy.currentStage}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-7 text-[#111827]">
                        {stageLabel(focusItem.stage, preferredLanguage)}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        {copy.lastUpdate}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-7 text-[#111827]">
                        {formatLocalizedDate(
                          focusItem.updatedAt,
                          preferredLanguage
                        )}
                      </p>
                    </div>
                  </div>
                ) : null}

                {focusItem ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]">
                    <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFD] p-5">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6B7280]">
                        {copy.quickSummary}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#374151]">
                        <MixedText
                          text={makeExcerpt(
                            focusItem.report.result.summary,
                            preferredLanguage === 'ar' ? 190 : 170
                          )}
                        />
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFD] p-5">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6B7280]">
                        {copy.nextAction}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#374151]">
                        {stageActionLabel(focusItem.stage, preferredLanguage)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {focusItem ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={getPrimaryHref(focusItem.report.id, focusItem.stage)}
                      className="inline-flex items-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {stageActionLabel(focusItem.stage, preferredLanguage)}
                    </Link>
                    <Link
                      href={`/results?reportId=${focusItem.report.id}`}
                      className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                    >
                      {copy.openOpportunity}
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  {copy.recentIdeas}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                  {copy.recentIdeasDescription}
                </p>

                <div className="mt-5 grid gap-3">
                  {recentReports.map((report) => {
                    const stage = stageMap[report.id] || 'analysis_only';
                    const updatedAt =
                      stageUpdatedAtMap[report.id] || report.createdAt;

                    return (
                      <div
                        key={report.id}
                        className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-base font-semibold leading-7 text-[#111827]">
                              <MixedText
                                text={
                                  report.query ||
                                  (preferredLanguage === 'ar'
                                    ? 'فرصة بدون عنوان'
                                    : 'Untitled opportunity')
                                }
                              />
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 font-semibold text-[#111827]">
                                {copy.score}: {report.result.opportunityScore}
                              </span>
                              <span>
                                {formatLocalizedDate(
                                  updatedAt,
                                  preferredLanguage
                                )}
                              </span>
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#4B5563]">
                              <MixedText
                                text={makeExcerpt(
                                  report.result.summary,
                                  preferredLanguage === 'ar' ? 110 : 95
                                )}
                              />
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <StageBadge
                                stage={stage}
                                uiLang={preferredLanguage}
                              />
                              <span className="text-xs font-semibold text-[#1D4ED8]">
                                {stageActionLabel(stage, preferredLanguage)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={getPrimaryHref(report.id, stage)}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111827] ring-1 ring-[#E5E7EB] transition hover:bg-white"
                          >
                            {stageActionLabel(stage, preferredLanguage)}
                          </Link>
                          <Link
                            href={`/results?reportId=${report.id}`}
                            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-white"
                          >
                            {copy.openOpportunity}
                          </Link>
                          <Link
                            href={`/compare?ids=${report.id}`}
                            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-white"
                          >
                            {copy.compare}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}