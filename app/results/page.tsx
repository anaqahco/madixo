'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/site-header';
import MixedText from '@/components/mixed-text';
import PlanUpgradeNotice from '@/components/plan-upgrade-notice';
import InitialFeasibilityStudyPanel from '@/components/initial-feasibility-study';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import {
  getReportLifecycleStatus,
  type ReportLifecycleStatus,
} from '@/lib/madixo-lifecycle-status';
import { getClientUiLanguage, normalizeUiLanguage } from '@/lib/ui-language';
import { type AnalysisResult } from '../../lib/madixo-reports';
import type { InitialFeasibilityStudy } from '@/lib/madixo-feasibility';
import { saveResultReportAction } from './actions';
import { normalizePlan } from '@/lib/madixo-plans';

type UiLanguage = 'ar' | 'en';
type BreakdownKey = keyof AnalysisResult['scoreBreakdown'];

type DisplayInputs = {
  query: string;
  market: string;
  customer: string;
};

const ANALYSIS_CACHE_KEY = 'madixo_analysis_cache_v2';
const MAX_CACHED_ANALYSES = 20;

type CachedAnalysisEntry = {
  key: string;
  savedAt: string;
  result: AnalysisResult;
  displayInputs: DisplayInputs;
};

type AnalysisCacheStore = {
  items: CachedAnalysisEntry[];
};
type ValidationPlanStatusRow = {
  report_id: string;
  ui_lang: UiLanguage;
  evidence_summary_json: unknown | null;
  iteration_engine_json: unknown | null;
  decision_state: ValidationDecisionState | null;
  updated_at?: string | null;
};

type ValidationDecisionState = 'undecided' | 'continue' | 'pivot' | 'stop';


type SingleReportApiPayload = {
  ok?: boolean;
  error?: string;
  report?: {
    id: string;
    createdAt: string;
    query: string;
    market: string;
    customer: string;
    result: AnalysisResult;
  } | null;
  validationPlans?: ValidationPlanStatusRow[];
};

type PlanKey = 'free' | 'pro' | 'team';

type CurrentPlanPayload = {
  ok?: boolean;
  plan?: PlanKey;
  label?: string;
};

type UpgradePrompt = {
  title: string;
  description: string;
  reason: 'reports_limit' | 'analysis_limit' | 'compare_limit' | 'feasibility';
};

type ReportsLimitIntent = 'save' | 'validation';

function getReportsLimitUpgradePrompt(language: UiLanguage, intent: ReportsLimitIntent): UpgradePrompt {
  if (language === 'ar') {
    if (intent === 'validation') {
      return {
        title: 'لبدء التحقق تحتاج حفظ هذه الفرصة أولًا، وقد وصلت إلى حد الفرص المحفوظة.',
        description: 'مساحة التحقق متاحة في باقتك، لكن بدء التحقق لهذا التقرير يتطلب حفظه أولًا. احذف فرصة قديمة أو انتقل إلى باقة أعلى لتكمل مباشرة.',
        reason: 'reports_limit',
      };
    }

    return {
      title: 'وصلت إلى حد الفرص المحفوظة في باقتك الحالية.',
      description: 'يمكنك مراجعة هذا التقرير الآن، لكن حفظ فرص إضافية يحتاج إلى باقة أعلى أو حذف فرصة محفوظة قديمة أولًا.',
      reason: 'reports_limit',
    };
  }

  if (intent === 'validation') {
    return {
      title: 'To start validation, this opportunity needs to be saved first — and you already reached your saved opportunities limit.',
      description: 'Validation is available on your current plan, but starting validation for this report requires saving it first. Delete an older saved opportunity or upgrade to continue now.',
      reason: 'reports_limit',
    };
  }

  return {
    title: 'You reached the saved opportunities limit for your current plan.',
    description: 'You can review this report now, but saving more opportunities requires a higher plan or deleting an older saved opportunity first.',
    reason: 'reports_limit',
  };
}



function getFeasibilityUpgradePrompt(language: UiLanguage): UpgradePrompt {
  if (language === 'ar') {
    return {
      title: 'ميزة دراسة الجدوى الأولية ضمن الباقة المدفوعة.',
      description:
        'تحليل الفرصة الأساسي يبقى متاحًا، لكن دراسة الجدوى الأولية أصبحت متاحة داخل الاحترافية وما فوق لأنها تضيف طبقة مالية أعمق فوق التقرير.',
      reason: 'feasibility',
    };
  }

  return {
    title: 'The initial feasibility study is part of the paid plan.',
    description:
      'The core opportunity report stays available, but the initial feasibility study now lives in Pro and above because it adds a deeper financial layer on top of the main report.',
    reason: 'feasibility',
  };
}

async function fetchCurrentPlanClient(): Promise<PlanKey> {
  try {
    const response = await fetch('/api/current-plan', { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as CurrentPlanPayload;

    if (response.ok && payload.ok && payload.plan) {
      return normalizePlan(payload.plan);
    }
  } catch {
    // fall back to free below
  }

  return 'free';
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalizeAnalysisCacheText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u064B-\u065F\u0670]/g, '');
}

function buildAnalysisCacheKey(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
}) {
  return JSON.stringify({
    q: normalizeAnalysisCacheText(params.query),
    m: normalizeAnalysisCacheText(params.market),
    c: normalizeAnalysisCacheText(params.customer),
    l: params.uiLang,
  });
}

function readAnalysisCacheStore(): AnalysisCacheStore {
  if (!isBrowser()) {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(raw) as AnalysisCacheStore;

    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items
        .filter((item): item is CachedAnalysisEntry => {
          return Boolean(
            item &&
              typeof item.key === 'string' &&
              item.key.trim().length > 0 &&
              item.result &&
              typeof item.result === 'object' &&
              item.displayInputs &&
              typeof item.displayInputs.query === 'string' &&
              typeof item.displayInputs.market === 'string' &&
              typeof item.displayInputs.customer === 'string'
          );
        })
        .slice(0, MAX_CACHED_ANALYSES),
    };
  } catch {
    return { items: [] };
  }
}

function writeAnalysisCacheStore(store: AnalysisCacheStore) {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    ANALYSIS_CACHE_KEY,
    JSON.stringify({
      items: store.items.slice(0, MAX_CACHED_ANALYSES),
    })
  );
}

function getCachedAnalysisEntry(key: string) {
  const store = readAnalysisCacheStore();
  return store.items.find((item) => item.key === key) || null;
}

function saveCachedAnalysisEntry(entry: Omit<CachedAnalysisEntry, 'savedAt'>) {
  const store = readAnalysisCacheStore();
  const nextItems = [
    {
      ...entry,
      savedAt: new Date().toISOString(),
    },
    ...store.items.filter((item) => item.key !== entry.key),
  ].slice(0, MAX_CACHED_ANALYSES);

  writeAnalysisCacheStore({ items: nextItems });
}

function calculateOverallScoreFromBreakdown(breakdown: AnalysisResult['scoreBreakdown']) {
  const total =
    breakdown.demand.score +
    breakdown.abilityToWin.score +
    breakdown.monetization.score +
    breakdown.speedToMvp.score +
    breakdown.distribution.score;

  return Math.round(total / 5);
}

function normalizeResultForDisplay(result: AnalysisResult, language: UiLanguage): AnalysisResult {
  const derivedScore = calculateOverallScoreFromBreakdown(result.scoreBreakdown);

  if (result.opportunityScore === derivedScore) {
    return result;
  }

  return {
    ...result,
    opportunityScore: derivedScore,
    opportunityLabel: labelFromScore(derivedScore, language),
  };
}


function getTestingActionMode(status: ReportLifecycleStatus) {
  if (
    status === 'collecting_evidence' ||
    status === 'decision_view_ready' ||
    status === 'current_decision_set' ||
    status === 'best_step_ready'
  ) {
    return 'continue' as const;
  }

  return 'start' as const;
}

function getTestingActionCopy(copy: (typeof UI_COPY)['ar'] | (typeof UI_COPY)['en'], status: ReportLifecycleStatus) {
  const mode = getTestingActionMode(status);

  if (mode === 'continue') {
    return {
      button: copy.continueTesting,
      title: copy.continueTestingTitle,
      description: copy.continueTestingDescription,
    };
  }

  return {
    button: copy.testIdea,
    title: copy.nextStepTitle,
    description: copy.nextStepDescription,
  };
}

const UI_COPY = {
  en: {
    dir: 'ltr',
    processing: 'Processing',
    done: 'Done',
    inProgress: 'In progress',
    queued: 'Queued',

    newScan: 'New Scan',
    copyReport: 'Copy Report',
    copied: 'Copied!',
    saveReport: 'Save Report',
    saving: 'Saving...',
    saved: 'Saved!',
    myReports: 'My Reports',
    compareReports: 'Compare Reports',
    testIdea: 'Start Validation',
    continueTesting: 'Continue Validation',
    openingTest: 'Opening plan...',
    nextStepTitle: 'Next Step',
    continueTestingTitle: 'Continue Validation',
    nextStepDescription: 'Turn this report into a clear validation workspace so you can collect evidence before you build.',
    continueTestingDescription: 'Open the validation workspace and continue from the current stage, notes, and next action.' ,
    nextStepButton: 'Start Validation',
    exportPdf: 'Export PDF',
    preparingPdf: 'Preparing PDF...',

    liveAnalysis: 'Live Analysis',
    analyzingOpportunity: 'Analyzing Opportunity',
    analysisEngine: 'Madixo Analysis Engine',
    loadingLead: 'Preparing a clean founder-ready opportunity report.',
    loadingShort:
      'Madixo is evaluating demand, competition, positioning, and first-offer logic for your opportunity.',
    loadingFinal:
      'Madixo is finalizing your report and validating the final response.',

    loadingStages: [
      {
        title: 'Understanding the idea',
        description:
          'Reading the business concept, target market, and target customer.',
      },
      {
        title: 'Evaluating the opportunity',
        description:
          'Reviewing demand, competition, positioning, and buyer urgency.',
      },
      {
        title: 'Preparing the report',
        description:
          'Building the score, summary, MVP direction, and next-step recommendations.',
      },
    ] as const,

    analysisError: 'Analysis Error',
    analysisFailed: 'Analysis failed',
    tryAgain: 'Try Again',
    retryAnalysis: 'Retry Analysis',
    backToNewScan: 'Back to New Scan',
    unableToLoad: 'Unable to load the opportunity analysis.',
    retryOrReturn:
      'You can retry the same analysis or return to start a new scan.',

    opportunityAnalysis: 'Opportunity Analysis',
    reportHeader: 'MADIXO OPPORTUNITY REPORT',
    businessIdea: 'Business Idea',
    targetMarket: 'Target Market',
    inputTargetCustomer: 'Input Target Customer',
    whyThisOpportunity: 'Why This Opportunity',
    opportunityScore: 'Opportunity Score',
    overallScore: 'Overall Score',
    whyThisScore: 'Why This Score',
    summary: 'Summary',
    marketDemand: 'Market Demand',
    competition: 'Competition',
    targetCustomers: 'Target Customers',
    suggestedMvp: 'Suggested MVP',
    mvpFeatures: 'MVP Features',
    revenueModel: 'Revenue Model',
    nextSteps: 'Next Steps',
    bestFirstCustomer: 'Best First Customer',
    firstOffer: 'First Offer',
    painPoints: 'Pain Points',
    opportunityAngle: 'Opportunity Angle',
    goToMarket: 'Go-To-Market',
    risks: 'Risks',
    generatedOn: 'Generated on',
    pageOf: 'Page',
    notSpecified: 'Not specified',

    failedToAnalyzeOpportunity: 'Failed to analyze opportunity.',
    failedToCopyReport: 'Failed to copy report.',
    failedToSaveReport: 'Failed to save report.',
    failedToGeneratePdf: 'Failed to generate PDF report.',
    genericLoadingError: 'Something went wrong while loading the analysis.',

    pdfArabicPending:
      'Arabic PDF font is not configured yet. Add Cairo-Regular.ttf to public/fonts to enable Arabic PDF export.',
  },

  ar: {
    dir: 'rtl',
    processing: 'جار المعالجة',
    done: 'اكتمل',
    inProgress: 'قيد التنفيذ',
    queued: 'بالانتظار',

    newScan: 'تحليل جديد',
    copyReport: 'نسخ التقرير',
    copied: 'تم النسخ!',
    saveReport: 'حفظ التقرير',
    saving: 'جار الحفظ...',
    saved: 'تم الحفظ!',
    myReports: 'تقاريري',
    compareReports: 'مقارنة التقارير',
    testIdea: 'ابدأ التحقق',
    continueTesting: 'أكمل التحقق',
    openingTest: 'جار فتح التحقق...',
    nextStepTitle: 'الخطوة التالية',
    continueTestingTitle: 'أكمل التحقق',
    nextStepDescription: 'حوّل هذا التحليل إلى مساحة تحقق واضحة حتى تجمع الأدلة قبل أن تبدأ بالبناء.',
    continueTestingDescription: 'افتح مساحة التحقق وأكمل من المرحلة الحالية والملاحظات والخطوة التالية.',
    nextStepButton: 'ابدأ التجربة',
    exportPdf: 'تصدير PDF',
    preparingPdf: 'جار تجهيز PDF...',

    liveAnalysis: 'تحليل مباشر',
    analyzingOpportunity: 'جار تحليل الفرصة',
    analysisEngine: 'محرك تحليل Madixo',
    loadingLead: 'يتم تجهيز تقرير واضح وجاهز للمؤسس.',
    loadingShort:
      'يقوم Madixo بتقييم الطلب والمنافسة والتموضع ومنطق العرض الأول لهذه الفرصة.',
    loadingFinal:
      'يقوم Madixo بإنهاء التقرير والتحقق من المخرجات النهائية.',

    loadingStages: [
      {
        title: 'فهم الفكرة',
        description:
          'قراءة فكرة المشروع والسوق المستهدف والعميل المستهدف.',
      },
      {
        title: 'تقييم الفرصة',
        description:
          'مراجعة الطلب والمنافسة والتموضع ومدى إلحاح الحاجة لدى العميل.',
      },
      {
        title: 'إعداد التقرير',
        description:
          'بناء الدرجة والخلاصة واتجاه النسخة الأولية والتوصيات العملية التالية.',
      },
    ] as const,

    analysisError: 'خطأ في التحليل',
    analysisFailed: 'فشل التحليل',
    tryAgain: 'إعادة المحاولة',
    retryAnalysis: 'إعادة التحليل',
    backToNewScan: 'العودة لتحليل جديد',
    unableToLoad: 'تعذر تحميل تحليل الفرصة.',
    retryOrReturn:
      'يمكنك إعادة نفس التحليل أو العودة لبدء تحليل جديد.',

    opportunityAnalysis: 'تحليل الفرصة',
    reportHeader: 'تقرير فرص MADIXO',
    businessIdea: 'الفكرة التجارية',
    targetMarket: 'السوق المستهدف',
    inputTargetCustomer: 'العميل المستهدف المدخل',
    whyThisOpportunity: 'لماذا هذه الفرصة',
    opportunityScore: 'درجة الفرصة',
    overallScore: 'الدرجة الإجمالية',
    whyThisScore: 'لماذا هذه الدرجة',
    summary: 'الخلاصة',
    marketDemand: 'طلب السوق',
    competition: 'المنافسة',
    targetCustomers: 'العملاء المستهدفون',
    suggestedMvp: 'النسخة الأولية المقترحة',
    mvpFeatures: 'ميزات النسخة الأولية',
    revenueModel: 'نموذج الإيرادات',
    nextSteps: 'الخطوات التالية',
    bestFirstCustomer: 'أفضل عميل أول',
    firstOffer: 'أول عرض',
    painPoints: 'نقاط الألم',
    opportunityAngle: 'زاوية الفرصة',
    goToMarket: 'خطة الدخول للسوق',
    risks: 'المخاطر',
    generatedOn: 'تم الإنشاء في',
    pageOf: 'الصفحة',
    notSpecified: 'غير محدد',

    failedToAnalyzeOpportunity: 'فشل تحليل الفرصة.',
    failedToCopyReport: 'فشل نسخ التقرير.',
    failedToSaveReport: 'فشل حفظ التقرير.',
    failedToGeneratePdf: 'فشل إنشاء ملف PDF.',
    genericLoadingError: 'حدث خطأ أثناء تحميل التحليل.',

    pdfArabicPending:
      'خط PDF العربي غير مهيأ بعد. أضف الملف Cairo-Regular.ttf داخل public/fonts لتفعيل تصدير PDF العربي.',
  },
} as const;


const FEASIBILITY_COPY = {
  en: {
    create: 'Create Initial Feasibility',
    refresh: 'Refresh Feasibility',
    loading: 'Preparing study...',
    failedToGenerate: 'Failed to generate the initial feasibility study.',
    savedWarning:
      'The study was generated, but Madixo could not save it inside the current report.',
    reportHeader: 'Initial Feasibility Study',
    verdict: 'Madixo initial verdict',
    assumptions: 'Key assumptions',
    startupCosts: 'Startup costs',
    startupTotal: 'Estimated startup range',
    monthlyCosts: 'Monthly operating costs',
    monthlyTotal: 'Estimated monthly range',
    revenueScenarios: 'Revenue scenarios',
    breakEven: 'Break-even view',
    risks: 'Financial risks',
    action: 'Recommended next move',
    disclaimer: 'Important note',
  },
  ar: {
    create: 'إنشاء دراسة الجدوى الأولية',
    refresh: 'إعادة إنشاء الدراسة',
    loading: 'جار إعداد الدراسة...',
    failedToGenerate: 'فشل إنشاء دراسة الجدوى الأولية.',
    savedWarning:
      'تم إنشاء الدراسة، لكن Madixo لم يستطع حفظها داخل التقرير الحالي.',
    reportHeader: 'دراسة الجدوى الأولية',
    verdict: 'حكم Madixo الأولي',
    assumptions: 'الافتراضات الأساسية',
    startupCosts: 'تكاليف البداية',
    startupTotal: 'النطاق التقديري للبداية',
    monthlyCosts: 'التكاليف الشهرية',
    monthlyTotal: 'النطاق التقديري الشهري',
    revenueScenarios: 'سيناريوهات الإيراد',
    breakEven: 'نظرة نقطة التعادل',
    risks: 'المخاطر المالية',
    action: 'أفضل خطوة مقترحة',
    disclaimer: 'ملاحظة مهمة',
  },
} as const;

function getScoreBreakdownItems(language: UiLanguage) {
  if (language === 'ar') {
    return [
      { key: 'demand' as const, label: 'الطلب' },
      { key: 'abilityToWin' as const, label: 'القدرة على الفوز' },
      { key: 'monetization' as const, label: 'الربحية' },
      { key: 'speedToMvp' as const, label: 'سرعة الإطلاق الأولي' },
      { key: 'distribution' as const, label: 'التوزيع' },
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

function LoadingProgressRing({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  return (
    <div className="relative h-40 w-40 md:h-48 md:w-48">
      <div
        className="absolute inset-0 rounded-full transition-all duration-500"
        style={{
          background: `conic-gradient(#0F172A ${progress * 3.6}deg, #E5E7EB 0deg)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-white shadow-inner md:inset-[12px]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-4xl font-bold leading-none md:text-5xl">
          {progress}%
        </div>
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
          {label}
        </div>
      </div>
    </div>
  );
}

function LoadingStageItem({
  stepNumber,
  title,
  description,
  state,
  doneLabel,
  inProgressLabel,
  queuedLabel,
}: {
  stepNumber: number;
  title: string;
  description: string;
  state: 'done' | 'active' | 'upcoming';
  doneLabel: string;
  inProgressLabel: string;
  queuedLabel: string;
}) {
  const isDone = state === 'done';
  const isActive = state === 'active';

  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition-all duration-300 ${
        isDone
          ? 'border-[#B7E4CE] bg-[#EAF7EF]'
          : isActive
            ? 'border-[#111827] bg-white shadow-sm'
            : 'border-[#E5E7EB] bg-white opacity-80'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isDone
              ? 'bg-[#0B8A4A] text-white'
              : isActive
                ? 'animate-pulse bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}
        >
          {isDone ? '✓' : stepNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#111827] md:text-base">
              {title}
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isDone
                  ? 'bg-white text-[#0B8A4A]'
                  : isActive
                    ? 'bg-[#111827] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
            >
              {isDone ? doneLabel : isActive ? inProgressLabel : queuedLabel}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdownCard({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] p-4">
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

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#111827] transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-7 text-[#4B5563]">{note}</p>
    </div>
  );
}

function toPdfFileName(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return cleaned || 'madixo-report';
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

function getShortOpportunityLabel(
  score: number,
  label: string,
  language: UiLanguage
) {
  const cleaned = label?.trim() || '';
  const tooLong = cleaned.length > 28 || cleaned.split(/\s+/).length > 4;

  if (!cleaned || tooLong) {
    return labelFromScore(score, language);
  }

  return cleaned;
}

function getBreakdownColor(score: number) {
  if (score >= 75) return 'bg-[#ECFDF3] text-[#027A48]';
  if (score >= 60) return 'bg-[#EFF6FF] text-[#1D4ED8]';
  if (score >= 40) return 'bg-[#FFF7ED] text-[#C2410C]';
  return 'bg-[#FEF2F2] text-[#B42318]';
}


function PdfSection({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="rounded-t-[28px] bg-[#F3F4F6] px-8 py-5 text-[24px] font-semibold text-[#111827]">
        {title}
      </div>
      <div className="p-8">{children}</div>
    </section>
  );
}

function HtmlPdfReport({
  exportRef,
  result,
  copy,
  uiLang,
  safeMarket,
  safeCustomer,
  safeLabel,
  scoreBreakdownRows,
  generatedAt,
}: {
  exportRef: { current: HTMLDivElement | null };
  result: AnalysisResult;
  copy: (typeof UI_COPY)[UiLanguage];
  uiLang: UiLanguage;
  safeMarket: string;
  safeCustomer: string;
  safeLabel: string;
  scoreBreakdownRows: Array<{ key: BreakdownKey; label: string; score: number; note: string }>;
  generatedAt: string;
}) {
  const feasibilityCopy = FEASIBILITY_COPY[uiLang];

  return (
    <div className="fixed left-0 top-0 z-[-1] pointer-events-none opacity-0">
      <div
        id="madixo-pdf-export-root"
        ref={exportRef}
        dir={copy.dir}
        lang={uiLang === 'ar' ? 'ar' : 'en'}
        className="w-[1120px] bg-white px-12 py-12 text-[#111827]"
        style={{
          fontFamily:
            uiLang === 'ar'
              ? 'Cairo, Tahoma, Arial, sans-serif'
              : 'Inter, Arial, sans-serif',
          transform: 'translateZ(0)',
        }}
      >

        <div className="mb-10 border-b border-[#E5E7EB] pb-8 text-center">
          <img
            src="/brand/madixo-logo.png"
            alt="Madixo"
            className="mx-auto h-12 w-auto"
          />
          <div className="mt-8 text-[56px] font-bold tracking-tight text-[#0F172A]">
            MADIXO
          </div>
          <div className="mt-3 text-[22px] font-semibold text-[#374151]">
            {copy.reportHeader}
          </div>
          <div className="mt-7 text-[34px] font-bold text-[#111827] leading-[1.4]">
            {result.query}
          </div>
          <div className="mt-4 text-[18px] text-[#6B7280]">
            {copy.generatedOn}: {generatedAt}
          </div>
        </div>

        <div className="mb-8 rounded-[32px] border border-[#E5E7EB] bg-[#F9FAFB] p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-semibold text-[#6B7280]">
                {copy.summary}
              </div>
              <div className="mt-4 text-[24px] leading-[1.9] text-[#374151]">
                {result.summary}
              </div>
            </div>

            <div className="shrink-0 rounded-[28px] bg-white px-8 py-6 text-center shadow-sm border border-[#E5E7EB] min-w-[220px]">
              <div className="text-[16px] font-semibold text-[#6B7280]">
                {copy.opportunityScore}
              </div>
              <div className="mt-2 flex items-end justify-center gap-2">
                <span className="text-[72px] font-bold leading-none text-[#111827]">
                  {result.opportunityScore}
                </span>
                <span className="mb-2 text-[28px] font-semibold text-[#6B7280]">/100</span>
              </div>
              <div className="mt-4 inline-flex rounded-full bg-[#ECFDF3] px-5 py-2 text-[16px] font-semibold text-[#027A48]">
                {safeLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6">
          <PdfSection title={copy.targetMarket}>
            <div className="text-[22px] leading-[1.8] text-[#374151]">{safeMarket}</div>
          </PdfSection>
          <PdfSection title={copy.inputTargetCustomer}>
            <div className="text-[22px] leading-[1.8] text-[#374151]">{safeCustomer}</div>
          </PdfSection>
        </div>

        <div className="mb-8">
          <PdfSection title={copy.whyThisOpportunity}>
            <div className="text-[22px] leading-[1.95] text-[#374151]">{result.whyThisOpportunity}</div>
          </PdfSection>
        </div>

        <div className="mb-8">
          <PdfSection title={copy.whyThisScore}>
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full bg-[#111827] px-5 py-2 text-[15px] font-semibold text-white">
                {copy.overallScore}: {result.opportunityScore}/100
              </span>
              <span className="rounded-full bg-[#ECFDF3] px-5 py-2 text-[15px] font-semibold text-[#027A48]">
                {safeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {scoreBreakdownRows.map((item) => (
                <div key={item.key} className="rounded-[24px] border border-[#E5E7EB] bg-[#FAFAFB] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[18px] font-semibold text-[#111827]">{item.label}</div>
                    <div className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${getBreakdownColor(item.score)}`}>
                      {item.score}/100
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div className="h-full rounded-full bg-[#111827]" style={{ width: `${item.score}%` }} />
                  </div>
                  <div className="mt-4 text-[16px] leading-[1.9] text-[#4B5563]">{item.note}</div>
                </div>
              ))}
            </div>
          </PdfSection>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <PdfSection title={copy.marketDemand}>
            <div className="text-[28px] font-bold text-[#111827]">{result.marketDemand.title}</div>
            <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.marketDemand.description}</div>
          </PdfSection>
          <PdfSection title={copy.competition}>
            <div className="text-[28px] font-bold text-[#111827]">{result.competition.title}</div>
            <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.competition.description}</div>
          </PdfSection>
          <PdfSection title={copy.targetCustomers}>
            <div className="text-[28px] font-bold text-[#111827]">{result.targetCustomers.title}</div>
            <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.targetCustomers.description}</div>
          </PdfSection>
        </div>

        <div className="mb-8 grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <PdfSection title={copy.suggestedMvp}>
              <div className="text-[30px] font-bold text-[#111827]">{result.suggestedMvp.title}</div>
              <div className="mt-4 text-[20px] leading-[1.8] text-[#374151]">{result.suggestedMvp.description}</div>
              <div className="mt-6 flex flex-wrap gap-3">
                {result.suggestedMvp.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-[#F3F4F6] px-4 py-2 text-[16px] font-medium text-[#374151]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </PdfSection>
          </div>
          <div className="col-span-3">
            <PdfSection title={copy.revenueModel}>
              <div className="text-[28px] font-bold text-[#111827]">{result.revenueModel.title}</div>
              <div className="mt-3 text-[24px] font-semibold text-[#111827]">{result.revenueModel.price}</div>
              <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.revenueModel.description}</div>
            </PdfSection>
          </div>
          <div className="col-span-4">
            <PdfSection title={copy.nextSteps}>
              <ul className="space-y-3 text-[18px] leading-[1.9] text-[#374151]">
                {result.nextSteps.map((step) => (
                  <li key={step}>• {step}</li>
                ))}
              </ul>
            </PdfSection>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6">
          <PdfSection title={copy.bestFirstCustomer}>
            <div className="text-[28px] font-semibold text-[#111827]">{result.bestFirstCustomer.title}</div>
            <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.bestFirstCustomer.description}</div>
          </PdfSection>
          <PdfSection title={copy.firstOffer}>
            <div className="text-[28px] font-semibold text-[#111827]">{result.firstOffer.title}</div>
            <div className="mt-3 text-[24px] font-semibold text-[#111827]">{result.firstOffer.priceIdea}</div>
            <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">{result.firstOffer.description}</div>
          </PdfSection>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <PdfSection title={copy.painPoints}>
            <ul className="space-y-3 text-[18px] leading-[1.9] text-[#4B5563]">
              {result.painPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </PdfSection>
          <PdfSection title={copy.opportunityAngle}>
            <div className="text-[18px] leading-[1.9] text-[#4B5563]">{result.opportunityAngle}</div>
          </PdfSection>
          <PdfSection title={copy.goToMarket}>
            <div className="text-[18px] leading-[1.9] text-[#4B5563]">{result.goToMarket}</div>
          </PdfSection>
        </div>

        <div className="mt-8">
          <PdfSection title={copy.risks}>
            <ul className="space-y-3 text-[18px] leading-[1.9] text-[#4B5563]">
              {result.risks.map((risk) => (
                <li key={risk}>• {risk}</li>
              ))}
            </ul>
          </PdfSection>
        </div>

        {result.initialFeasibility ? (
          <div className="mt-8 space-y-8">
            <PdfSection title={feasibilityCopy.reportHeader}>
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-full bg-[#111827] px-5 py-2 text-[15px] font-semibold text-white">
                  {feasibilityCopy.verdict}
                </span>
                <span className="rounded-full bg-[#ECFDF3] px-5 py-2 text-[15px] font-semibold text-[#027A48]">
                  {result.initialFeasibility.verdictLabel}
                </span>
              </div>
              <div className="text-[20px] leading-[1.9] text-[#374151]">
                {result.initialFeasibility.verdictSummary}
              </div>
            </PdfSection>

            <div className="grid grid-cols-2 gap-6">
              <PdfSection title={feasibilityCopy.assumptions}>
                <ul className="space-y-3 text-[18px] leading-[1.9] text-[#4B5563]">
                  {result.initialFeasibility.keyAssumptions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </PdfSection>

              <PdfSection title={feasibilityCopy.breakEven}>
                <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFB] px-5 py-4 text-[18px] font-semibold text-[#111827]">
                  {result.initialFeasibility.breakEvenTimeline}
                </div>
                <div className="mt-4 text-[18px] leading-[1.9] text-[#4B5563]">
                  {result.initialFeasibility.breakEvenSummary}
                </div>
              </PdfSection>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PdfSection title={feasibilityCopy.startupCosts}>
                <div className="mb-4 rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFB] px-5 py-4 text-[18px] font-semibold text-[#111827]">
                  {feasibilityCopy.startupTotal}: {result.initialFeasibility.startupCosts.totalRange}
                </div>
                <div className="space-y-4">
                  {result.initialFeasibility.startupCosts.items.map((item) => (
                    <div key={`${item.item}-${item.estimate}`} className="rounded-[20px] border border-[#E5E7EB] bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[18px] font-semibold text-[#111827]">{item.item}</div>
                        <div className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[13px] font-semibold text-[#111827]">{item.estimate}</div>
                      </div>
                      <div className="mt-3 text-[16px] leading-[1.8] text-[#6B7280]">{item.note}</div>
                    </div>
                  ))}
                </div>
              </PdfSection>

              <PdfSection title={feasibilityCopy.monthlyCosts}>
                <div className="mb-4 rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFB] px-5 py-4 text-[18px] font-semibold text-[#111827]">
                  {feasibilityCopy.monthlyTotal}: {result.initialFeasibility.monthlyCosts.totalRange}
                </div>
                <div className="space-y-4">
                  {result.initialFeasibility.monthlyCosts.items.map((item) => (
                    <div key={`${item.item}-${item.estimate}`} className="rounded-[20px] border border-[#E5E7EB] bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[18px] font-semibold text-[#111827]">{item.item}</div>
                        <div className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[13px] font-semibold text-[#111827]">{item.estimate}</div>
                      </div>
                      <div className="mt-3 text-[16px] leading-[1.8] text-[#6B7280]">{item.note}</div>
                    </div>
                  ))}
                </div>
              </PdfSection>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {result.initialFeasibility.revenueScenarios.map((scenario) => (
                <PdfSection key={`${scenario.scenario}-${scenario.monthlyRevenue}`} title={scenario.scenario}>
                  <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFB] px-5 py-4 text-[18px] font-semibold text-[#111827]">
                    {scenario.monthlyRevenue}
                  </div>
                  <div className="mt-4 text-[16px] leading-[1.8] text-[#6B7280]">{scenario.note}</div>
                </PdfSection>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PdfSection title={feasibilityCopy.risks}>
                <ul className="space-y-3 text-[18px] leading-[1.9] text-[#4B5563]">
                  {result.initialFeasibility.financialRisks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </PdfSection>

              <PdfSection title={feasibilityCopy.action}>
                <div className="text-[18px] leading-[1.9] text-[#4B5563]">
                  {result.initialFeasibility.recommendedAction}
                </div>
                <div className="mt-6 rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFB] p-4">
                  <div className="text-[16px] font-semibold text-[#111827]">{feasibilityCopy.disclaimer}</div>
                  <div className="mt-2 text-[16px] leading-[1.8] text-[#6B7280]">
                    {result.initialFeasibility.disclaimer}
                  </div>
                </div>
              </PdfSection>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => searchParams.get('q')?.trim() || 'AI tools for restaurants',
    [searchParams]
  );

  const market = useMemo(
    () => searchParams.get('market')?.trim() || '',
    [searchParams]
  );

  const customer = useMemo(
    () => searchParams.get('customer')?.trim() || '',
    [searchParams]
  );

  const reportIdParam = useMemo(
    () => searchParams.get('reportId')?.trim() || '',
    [searchParams]
  );

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [displayInputs, setDisplayInputs] = useState<DisplayInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);
  const [reportLifecycleStatus, setReportLifecycleStatus] = useState<ReportLifecycleStatus>('analysis_only');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);
  const [feasibilityError, setFeasibilityError] = useState('');
  const [feasibilityProgress, setFeasibilityProgress] = useState(0);
  const [feasibilityStageIndex, setFeasibilityStageIndex] = useState(0);
  const [requestNonce, setRequestNonce] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(6);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free');
  const [currentPlanReady, setCurrentPlanReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<UiLanguage>(() =>
    normalizeUiLanguage(
      searchParams.get('uiLang'),
      getClientUiLanguage('en')
    )
  );

  useEffect(() => {
    setSelectedLanguage(
      normalizeUiLanguage(
        searchParams.get('uiLang'),
        getClientUiLanguage('en')
      )
    );
  }, [searchParams]);

  const uiLang = selectedLanguage;

  const handleLanguageChange = (language: UiLanguage) => {
    if (language === uiLang) return;

    setSelectedLanguage(language);

    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('uiLang', language);

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;

    router.replace(nextUrl, { scroll: false });
  };

  const copy = UI_COPY[uiLang];
  const feasibilityCopy = FEASIBILITY_COPY[uiLang];
  const loadingStages = useMemo(() => copy.loadingStages, [copy]);
  const scoreBreakdownItems = useMemo(
    () => getScoreBreakdownItems(uiLang),
    [uiLang]
  );

  const safeMarket = market || copy.notSpecified;
  const safeCustomer = customer || copy.notSpecified;

  const displayQuery = displayInputs?.query || result?.query || query;
  const displayMarket = displayInputs?.market || safeMarket;
  const displayCustomer = displayInputs?.customer || safeCustomer;
  const feasibilityStudy = result?.initialFeasibility || null;
  const canUseFeasibility = feasibilityStudy ? true : !currentPlanReady || currentPlan !== 'free';
  const feasibilityLoadingStages = useMemo(
    () =>
      uiLang === 'ar'
        ? [
            {
              title: 'جمع معطيات الجدوى',
              description: 'يتم تحويل التقرير الحالي إلى افتراضات مالية أولية واضحة.',
            },
            {
              title: 'بناء التقديرات',
              description: 'يتم تقدير تكاليف البداية والتكاليف الشهرية وسيناريوهات الإيراد.',
            },
            {
              title: 'مراجعة المخرجات النهائية',
              description: 'يتم تنسيق الحكم الأولي ونقطة التعادل والخطوة المقترحة بشكل واضح.',
            },
          ]
        : [
            {
              title: 'Gathering feasibility inputs',
              description: 'Turning the current report into clear early financial assumptions.',
            },
            {
              title: 'Building rough estimates',
              description: 'Estimating startup costs, monthly costs, and revenue scenarios.',
            },
            {
              title: 'Reviewing the final study',
              description: 'Finalizing the early verdict, break-even direction, and next move.',
            },
          ],
    [uiLang]
  );

  useEffect(() => {
    let isMounted = true;

    const loadCurrentPlan = async () => {
      const plan = await fetchCurrentPlanClient();

      if (!isMounted) {
        return;
      }

      setCurrentPlan(plan);
      setCurrentPlanReady(true);
    };

    loadCurrentPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feasibilityLoading) {
      return;
    }

    const startProgress = 6;
    const targetProgress = 95;
    const totalDurationMs = 90000;
    const startedAt = Date.now();

    setFeasibilityProgress((current) => (current > 0 ? current : startProgress));

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(elapsed / totalDurationMs, 1);
      const nextValue = Math.min(
        targetProgress,
        Math.max(
          startProgress,
          Math.round(startProgress + (targetProgress - startProgress) * ratio)
        )
      );

      setFeasibilityProgress((current) => (current >= nextValue ? current : nextValue));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [feasibilityLoading]);

  useEffect(() => {
    if (feasibilityProgress >= 67) {
      setFeasibilityStageIndex(2);
      return;
    }

    if (feasibilityProgress >= 33) {
      setFeasibilityStageIndex(1);
      return;
    }

    setFeasibilityStageIndex(0);
  }, [feasibilityProgress]);

  useEffect(() => {
    let isActive = true;

    const runAnalysis = async () => {
      try {
        setLoading(true);
        setError('');
        setResult(null);
        setDisplayInputs(null);
        setSaved(false);
        setSavedReportId(reportIdParam || null);
        setReportLifecycleStatus('analysis_only');
        setCopied(false);
        setLoadingProgress(6);
        setLoadingStageIndex(0);

        if (reportIdParam) {
          const response = await fetch(`/api/reports?id=${encodeURIComponent(reportIdParam)}`, {
            cache: 'no-store',
          });

          const payload = (await response.json().catch(() => ({}))) as SingleReportApiPayload;

          if (response.status === 401 || payload.error === 'AUTH_REQUIRED') {
            router.replace(`/login?mode=login&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
          }

          if (!response.ok || !payload.ok) {
            throw new Error(payload.error || copy.unableToLoad);
          }

          if (!payload.report) {
            throw new Error(copy.unableToLoad);
          }

          if (!isActive) return;

          const normalizedSavedResult = normalizeResultForDisplay(payload.report.result, uiLang);
          const nextDisplayInputs = {
            query: payload.report.query || query,
            market: payload.report.market || copy.notSpecified,
            customer: payload.report.customer || copy.notSpecified,
          };

          setSaved(true);
          setSavedReportId(payload.report.id);

          const planRows = Array.isArray(payload.validationPlans) ? payload.validationPlans : [];
          const matchingRow =
            planRows.find((row) => row.ui_lang === uiLang) ||
            [...planRows].sort((a, b) => {
              const aTime = Date.parse(a.updated_at || '');
              const bTime = Date.parse(b.updated_at || '');
              const aValue = Number.isNaN(aTime) ? 0 : aTime;
              const bValue = Number.isNaN(bTime) ? 0 : bTime;
              return bValue - aValue;
            })[0];

          setReportLifecycleStatus(
            matchingRow
              ? getReportLifecycleStatus({
                  hasValidationPlan: true,
                  hasEvidenceSummary: Boolean(matchingRow.evidence_summary_json),
                  hasDecisionState:
                    matchingRow.decision_state === 'continue' ||
                    matchingRow.decision_state === 'pivot' ||
                    matchingRow.decision_state === 'stop',
                  hasIterationEngine: Boolean(matchingRow.iteration_engine_json),
                })
              : 'analysis_only'
          );

          setLoadingStageIndex(2);
          setLoadingProgress(100);

          window.setTimeout(() => {
            if (!isActive) return;
            setResult(normalizedSavedResult);
            setDisplayInputs(nextDisplayInputs);
            setLoading(false);
          }, 120);

          return;
        }

        const cacheKey = buildAnalysisCacheKey({
          query,
          market,
          customer,
          uiLang,
        });

        const cachedAnalysis = getCachedAnalysisEntry(cacheKey);

        if (cachedAnalysis) {
          setLoadingStageIndex(2);
          setLoadingProgress(100);

          window.setTimeout(() => {
            if (!isActive) return;
            setResult(normalizeResultForDisplay(cachedAnalysis.result, uiLang));
            setDisplayInputs(cachedAnalysis.displayInputs);
            setLoading(false);
          }, 120);

          return;
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            market,
            customer,
            uiLang,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          if (data?.code === 'INVALID_INPUT' || data?.code === 'INPUT_TOO_WEAK') {
            throw new Error(data.error || copy.failedToAnalyzeOpportunity);
          }

          if (data?.reason === 'analysis_limit' || data?.code === 'ANALYSIS_LIMIT') {
            router.replace(`/upgrade?reason=analysis_limit&from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
          }

          throw new Error(data.error || copy.failedToAnalyzeOpportunity);
        }

        if (!isActive) return;

        const nextDisplayInputs = {
          query:
            data.displayInputs?.query?.trim() ||
            data.result?.query ||
            query,
          market:
            data.displayInputs?.market?.trim() ||
            (market || copy.notSpecified),
          customer:
            data.displayInputs?.customer?.trim() ||
            (customer || copy.notSpecified),
        };

        saveCachedAnalysisEntry({
          key: cacheKey,
          result: normalizeResultForDisplay(data.result, uiLang),
          displayInputs: nextDisplayInputs,
        });

        setLoadingStageIndex(2);
        setLoadingProgress(100);

        window.setTimeout(() => {
          if (!isActive) return;
          setResult(normalizeResultForDisplay(data.result, uiLang));
          setDisplayInputs(nextDisplayInputs);
          setLoading(false);
        }, 420);
      } catch (err) {
        if (!isActive) return;

        setLoadingProgress(100);

        const message =
          err instanceof Error
            ? err.message
            : copy.genericLoadingError;

        window.setTimeout(() => {
          if (!isActive) return;
          setError(message);
          setLoading(false);
        }, 260);
      }
    };

    runAnalysis();

    return () => {
      isActive = false;
    };
  }, [query, market, customer, reportIdParam, requestNonce, uiLang]);

  useEffect(() => {
    if (!loading) return;

    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;

      let targetProgress = 6;

      if (elapsedSeconds < 6) {
        targetProgress = 6 + elapsedSeconds * 4;
      } else if (elapsedSeconds < 16) {
        targetProgress = 30 + (elapsedSeconds - 6) * 2;
      } else if (elapsedSeconds < 30) {
        targetProgress = 50 + (elapsedSeconds - 16) * 1.2;
      } else if (elapsedSeconds < 50) {
        targetProgress = 66 + (elapsedSeconds - 30) * 0.7;
      } else if (elapsedSeconds < 80) {
        targetProgress = 80 + (elapsedSeconds - 50) * 0.23;
      } else if (elapsedSeconds < 120) {
        targetProgress = 87 + (elapsedSeconds - 80) * 0.1;
      } else if (elapsedSeconds < 180) {
        targetProgress = 91 + (elapsedSeconds - 120) * 0.03;
      } else {
        targetProgress = 93;
      }

      const next = Math.min(93, Math.floor(targetProgress));

      setLoadingProgress((current) => {
        if (current >= 93) return current;
        return Math.max(current, next);
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading, requestNonce]);

  useEffect(() => {
    if (loadingProgress >= 72) {
      setLoadingStageIndex(2);
    } else if (loadingProgress >= 34) {
      setLoadingStageIndex(1);
    } else {
      setLoadingStageIndex(0);
    }
  }, [loadingProgress]);

  useEffect(() => {
    if (!reportIdParam) {
      return;
    }

    setSavedReportId(reportIdParam);
  }, [reportIdParam]);

  useEffect(() => {
    const reportId = savedReportId || reportIdParam;

    if (!reportId) {
      setReportLifecycleStatus('analysis_only');
      return;
    }

    let isActive = true;

    const loadLifecycleStatus = async () => {
      try {
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
          .from('validation_plans')
          .select(
            'report_id, ui_lang, evidence_summary_json, iteration_engine_json, decision_state, updated_at'
          )
          .eq('report_id', reportId);

        if (error) {
          throw error;
        }

        if (!isActive) return;

        const rows = (data || []) as ValidationPlanStatusRow[];

        if (!rows.length) {
          setReportLifecycleStatus('analysis_only');
          return;
        }

        const matchingRow =
          rows.find((row) => row.ui_lang === uiLang) ||
          rows.sort((a, b) => {
            const aTime = Date.parse(a.updated_at || '');
            const bTime = Date.parse(b.updated_at || '');
            const aValue = Number.isNaN(aTime) ? 0 : aTime;
            const bValue = Number.isNaN(bTime) ? 0 : bTime;
            return bValue - aValue;
          })[0];

        setReportLifecycleStatus(
          getReportLifecycleStatus({
            hasValidationPlan: true,
            hasEvidenceSummary: Boolean(matchingRow.evidence_summary_json),
            hasDecisionState:
              matchingRow.decision_state === 'continue' ||
              matchingRow.decision_state === 'pivot' ||
              matchingRow.decision_state === 'stop',
            hasIterationEngine: Boolean(matchingRow.iteration_engine_json),
          })
        );
      } catch {
        if (!isActive) return;
        setReportLifecycleStatus('analysis_only');
      }
    };

    loadLifecycleStatus();

    return () => {
      isActive = false;
    };
  }, [savedReportId, reportIdParam, uiLang]);

  const testingActionCopy = useMemo(() => {
    return getTestingActionCopy(copy, reportLifecycleStatus);
  }, [copy, reportLifecycleStatus]);

  const safeLabel = useMemo(() => {
    if (!result) return '';
    return getShortOpportunityLabel(
      result.opportunityScore,
      result.opportunityLabel,
      uiLang
    );
  }, [result, uiLang]);

  const scoreBreakdownRows = useMemo(() => {
    if (!result) return [];

    return scoreBreakdownItems.map((item) => ({
      ...item,
      ...result.scoreBreakdown[item.key],
    }));
  }, [result, scoreBreakdownItems]);

  const generatedAtText = useMemo(() => {
    return new Intl.DateTimeFormat(uiLang === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());
  }, [uiLang]);

  const reportText = useMemo(() => {
    if (!result) return '';

    const scoreBreakdownText = scoreBreakdownItems
      .map((item) => {
        const breakdown = result.scoreBreakdown[item.key];
        return `- ${item.label}: ${breakdown.score}/100 — ${breakdown.note}`;
      })
      .join('\\n');

    const feasibilityText = feasibilityStudy
      ? `

${feasibilityCopy.reportHeader}:
${feasibilityCopy.verdict}: ${feasibilityStudy.verdictLabel}
${feasibilityStudy.verdictSummary}

${feasibilityCopy.assumptions}:
- ${feasibilityStudy.keyAssumptions.join('\\n- ')}

${feasibilityCopy.startupCosts} (${feasibilityCopy.startupTotal}: ${feasibilityStudy.startupCosts.totalRange}):
${feasibilityStudy.startupCosts.items
  .map((item) => `- ${item.item}: ${item.estimate} — ${item.note}`)
  .join('\\n')}

${feasibilityCopy.monthlyCosts} (${feasibilityCopy.monthlyTotal}: ${feasibilityStudy.monthlyCosts.totalRange}):
${feasibilityStudy.monthlyCosts.items
  .map((item) => `- ${item.item}: ${item.estimate} — ${item.note}`)
  .join('\\n')}

${feasibilityCopy.revenueScenarios}:
${feasibilityStudy.revenueScenarios
  .map(
    (scenario) =>
      `- ${scenario.scenario}: ${scenario.monthlyRevenue} — ${scenario.note}`
  )
  .join('\\n')}

${feasibilityCopy.breakEven}:
${feasibilityStudy.breakEvenTimeline}
${feasibilityStudy.breakEvenSummary}

${feasibilityCopy.risks}:
- ${feasibilityStudy.financialRisks.join('\\n- ')}

${feasibilityCopy.action}:
${feasibilityStudy.recommendedAction}

${feasibilityCopy.disclaimer}:
${feasibilityStudy.disclaimer}`
      : '';

    return `${copy.reportHeader}

${copy.businessIdea}:
${displayQuery}

${copy.targetMarket}:
${displayMarket}

${copy.inputTargetCustomer}:
${displayCustomer}

${copy.whyThisOpportunity}:
${result.whyThisOpportunity}

${copy.opportunityScore}:
${result.opportunityScore}/100 - ${safeLabel}

${copy.whyThisScore}:
${scoreBreakdownText}

${copy.summary}:
${result.summary}

${copy.marketDemand}:
${result.marketDemand.title}
${result.marketDemand.description}

${copy.competition}:
${result.competition.title}
${result.competition.description}

${copy.targetCustomers}:
${result.targetCustomers.title}
${result.targetCustomers.description}

${copy.suggestedMvp}:
${result.suggestedMvp.title}
${result.suggestedMvp.description}

${copy.mvpFeatures}:
- ${result.suggestedMvp.features.join('\\n- ')}

${copy.revenueModel}:
${result.revenueModel.title}
${result.revenueModel.price}
${result.revenueModel.description}

${copy.nextSteps}:
- ${result.nextSteps.join('\\n- ')}

${copy.bestFirstCustomer}:
${result.bestFirstCustomer.title}
${result.bestFirstCustomer.description}

${copy.firstOffer}:
${result.firstOffer.title}
${result.firstOffer.priceIdea}
${result.firstOffer.description}

${copy.painPoints}:
- ${result.painPoints.join('\\n- ')}

${copy.opportunityAngle}:
${result.opportunityAngle}

${copy.goToMarket}:
${result.goToMarket}

${copy.risks}:
- ${result.risks.join('\\n- ')}${feasibilityText}`;
  }, [
    result,
    scoreBreakdownItems,
    copy,
    displayQuery,
    displayMarket,
    displayCustomer,
    safeLabel,
    feasibilityStudy,
    feasibilityCopy,
  ]);


  const handleCopyReport = async () => {
    if (!reportText) return;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(copy.failedToCopyReport);
    }
  };

  const persistCurrentReport = async (intent: ReportsLimitIntent = 'save') => {
    if (!result) {
      throw new Error(copy.failedToSaveReport);
    }

    const resultForStorage = {
      ...result,
      query: displayQuery,
    };

    const response = await saveResultReportAction({
      query: displayQuery,
      market: displayMarket,
      customer: displayCustomer,
      result: resultForStorage,
    });

    if (!response.ok) {
      if (response.error === 'AUTH_REQUIRED') {
        const nextPath = window.location.pathname + window.location.search;
        const nextUrl = `/login?next=${encodeURIComponent(nextPath)}&message=${encodeURIComponent(
          uiLang === 'ar'
            ? 'يجب تسجيل الدخول أولًا لحفظ التقرير.'
            : 'You need to log in first to save the report.'
        )}`;
        window.location.assign(nextUrl);
        return null;
      }

      if (response.error === 'PLAN_LIMIT_REPORTS') {
        setUpgradePrompt(getReportsLimitUpgradePrompt(uiLang, intent));
        return null;
      }

      throw new Error(response.error || copy.failedToSaveReport);
    }

    setUpgradePrompt(null);
    setSavedReportId(response.savedReport.id);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);

    return response.savedReport.id;
  };

  const handleSaveReport = async () => {
    if (!result || saveLoading) return;

    try {
      setSaveLoading(true);
      setError('');
      setSaved(false);
      setUpgradePrompt(null);

      await persistCurrentReport('save');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.failedToSaveReport
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateFeasibility = async () => {
    if (!result || feasibilityLoading) return;

    if (currentPlanReady && currentPlan === 'free' && !feasibilityStudy) {
      setUpgradePrompt(getFeasibilityUpgradePrompt(uiLang));
      setFeasibilityError('');
      return;
    }

    try {
      setFeasibilityLoading(true);
      setFeasibilityError('');
      setFeasibilityProgress(7);
      setFeasibilityStageIndex(0);
      setError('');
      setUpgradePrompt(null);

      const response = await fetch('/api/feasibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uiLang,
          query: displayQuery,
          market: displayMarket,
          customer: displayCustomer,
          reportId: savedReportId || reportIdParam || undefined,
          result: {
            ...result,
            query: displayQuery,
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
        feasibility?: InitialFeasibilityStudy;
        persistedReportId?: string | null;
        persistenceError?: string | null;
      };

      if (response.status === 401 && data.code === 'AUTH_REQUIRED') {
        const nextPath = `${window.location.pathname}${window.location.search}`;
        window.location.assign(
          `/login?mode=login&next=${encodeURIComponent(nextPath)}&message=${encodeURIComponent(
            uiLang === 'ar'
              ? 'يجب تسجيل الدخول أولًا لاستخدام دراسة الجدوى الأولية.'
              : 'You need to sign in first to use the initial feasibility study.'
          )}`
        );
        return;
      }

      if (response.status === 403 && data.code === 'FEASIBILITY_REQUIRES_PAID_PLAN') {
        setUpgradePrompt(getFeasibilityUpgradePrompt(uiLang));
        setFeasibilityError('');
        return;
      }

      if (!response.ok || !data.ok || !data.feasibility) {
        throw new Error(data.error || feasibilityCopy.failedToGenerate);
      }

      setFeasibilityProgress(100);

      const nextResult = normalizeResultForDisplay(
        {
          ...result,
          query: displayQuery,
          initialFeasibility: data.feasibility,
        },
        uiLang
      );

      setResult(nextResult);

      saveCachedAnalysisEntry({
        key: buildAnalysisCacheKey({
          query,
          market,
          customer,
          uiLang,
        }),
        result: nextResult,
        displayInputs: {
          query: displayQuery,
          market: displayMarket,
          customer: displayCustomer,
        },
      });

      if (data.persistedReportId) {
        setSavedReportId(data.persistedReportId);
      }

      if (data.persistenceError) {
        setError(feasibilityCopy.savedWarning);
      }
    } catch (err) {
      setFeasibilityProgress(0);
      setFeasibilityError(
        err instanceof Error ? err.message : feasibilityCopy.failedToGenerate
      );
    } finally {
      setFeasibilityLoading(false);
    }
  };

  const handleStartTesting = async () => {
    if (!result || testLoading || feasibilityLoading) return;

    try {
      setTestLoading(true);
      setError('');

      const reportId = savedReportId || (await persistCurrentReport('validation'));

      if (!reportId) return;

      router.push(`/validate/${reportId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.failedToSaveReport
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleRetry = () => {
    setCopied(false);
    setSaved(false);
    setSavedReportId(null);
    setTestLoading(false);
    setPdfLoading(false);
    setFeasibilityLoading(false);
    setError('');
    setResult(null);
    setDisplayInputs(null);
    setRequestNonce((prev) => prev + 1);
  };


  const handleExportPdf = async () => {
    if (!result) return;

    try {
      setPdfLoading(true);
      setError('');

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: {
            ...result,
            query: displayQuery,
          },
          uiLang,
          safeMarket: displayMarket,
          safeCustomer: displayCustomer,
          safeLabel,
          scoreBreakdownRows,
          generatedAt: generatedAtText,
          copy: {
            reportHeader: copy.reportHeader,
            businessIdea: copy.businessIdea,
            targetMarket: copy.targetMarket,
            inputTargetCustomer: copy.inputTargetCustomer,
            whyThisOpportunity: copy.whyThisOpportunity,
            opportunityScore: copy.opportunityScore,
            whyThisScore: copy.whyThisScore,
            summary: copy.summary,
            marketDemand: copy.marketDemand,
            competition: copy.competition,
            targetCustomers: copy.targetCustomers,
            suggestedMvp: copy.suggestedMvp,
            mvpFeatures: copy.mvpFeatures,
            revenueModel: copy.revenueModel,
            nextSteps: copy.nextSteps,
            bestFirstCustomer: copy.bestFirstCustomer,
            firstOffer: copy.firstOffer,
            painPoints: copy.painPoints,
            opportunityAngle: copy.opportunityAngle,
            goToMarket: copy.goToMarket,
            risks: copy.risks,
            generatedOn: copy.generatedOn,
            overallScore: copy.overallScore,
            notSpecified: copy.notSpecified,
          },
        }),
      });

      if (!response.ok) {
        let message: string = copy.failedToGeneratePdf;

        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) {
            message = data.error;
          }
        } catch {}

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${toPdfFileName(displayQuery)}-madixo-report.pdf`;
      link.click();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.failedToGeneratePdf
      );
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]">
        <div className="mx-auto max-w-6xl">
          <SiteHeader
            uiLang={uiLang}
            onLanguageChange={handleLanguageChange}
            logo={<MadixoLogo />}
            className="mb-8"
          />

          <div className="mb-10">
            <Link
              href="/"
              className="inline-block rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              ← {copy.newScan}
            </Link>
          </div>

          <div className="rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                  {copy.liveAnalysis}
                </div>

                <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-7xl">
                  {copy.analyzingOpportunity}
                </h1>

                <MixedText
                  as="p"
                  text={query}
                  className="mt-4 text-lg text-[#4B5563] md:text-2xl"
                />
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div className="flex justify-center">
                  <LoadingProgressRing progress={loadingProgress} label={copy.processing} />
                </div>

                <div>
                  <div className="rounded-3xl bg-[#F9FAFB] p-5">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#6B7280]">
                      <span>{copy.analysisEngine}</span>
                      <span>{loadingProgress}%</span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-full rounded-full bg-[#111827] transition-all duration-500"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[#6B7280]">
                      {loadingProgress >= 88
                        ? copy.loadingFinal
                        : copy.loadingShort}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {loadingStages.map((stage, index) => (
                      <LoadingStageItem
                        key={stage.title}
                        stepNumber={index + 1}
                        title={stage.title}
                        description={stage.description}
                        state={
                          index < loadingStageIndex
                            ? 'done'
                            : index === loadingStageIndex
                              ? 'active'
                              : 'upcoming'
                        }
                        doneLabel={copy.done}
                        inProgressLabel={copy.inProgress}
                        queuedLabel={copy.queued}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-[#6B7280]">
                {copy.loadingLead}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]">
        <div className="mx-auto max-w-5xl">
          <SiteHeader
            uiLang={uiLang}
            onLanguageChange={handleLanguageChange}
            logo={<MadixoLogo />}
            maxWidthClass="max-w-5xl"
            className="mb-8"
          />

          <div className="mb-10 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-block rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              ← {copy.newScan}
            </Link>

            <button
              onClick={handleRetry}
              className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {copy.tryAgain}
            </button>
          </div>

          <div className="rounded-[32px] border border-red-200 bg-white px-8 py-12 text-center shadow-sm md:px-12">
            <div className="mx-auto max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                {copy.analysisError}
              </div>

              <h1 className="mt-6 text-3xl font-bold md:text-5xl">
                {copy.analysisFailed}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-red-600 md:text-xl">
                {error || copy.unableToLoad}
              </p>

              <p className="mt-6 text-sm text-[#6B7280]">
                {copy.retryOrReturn}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {copy.retryAnalysis}
                </button>

                <Link
                  href="/"
                  className="inline-block rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                >
                  {copy.backToNewScan}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] px-6 pb-16 pt-6 text-[#111827]">
      <div className="mx-auto max-w-6xl">
        <SiteHeader
          uiLang={uiLang}
          onLanguageChange={handleLanguageChange}
          logo={<MadixoLogo />}
          className="mb-8"
        />

        <div className="mb-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-block rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            ← {copy.newScan}
          </Link>

          <button
            onClick={handleCopyReport}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copied ? copy.copied : copy.copyReport}
          </button>

          <button
            onClick={handleSaveReport}
            disabled={saveLoading}
            className="rounded-full border border-[#111827] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveLoading ? copy.saving : saved ? copy.saved : copy.saveReport}
          </button>

          <button
            onClick={handleStartTesting}
            disabled={testLoading || feasibilityLoading}
            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testLoading ? copy.openingTest : testingActionCopy.button}
          </button>

          <button
            onClick={handleGenerateFeasibility}
            disabled={feasibilityLoading}
            className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {feasibilityLoading
              ? feasibilityCopy.loading
              : feasibilityStudy
                ? feasibilityCopy.refresh
                : feasibilityCopy.create}
          </button>

          <Link
            href="/reports"
            className="inline-block rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            {copy.myReports}
          </Link>

          <Link
            href="/compare"
            className="inline-block rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            {copy.compareReports}
          </Link>

          <button
            onClick={handleExportPdf}
            disabled={pdfLoading}
            className="rounded-full border border-[#111827] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfLoading ? copy.preparingPdf : copy.exportPdf}
          </button>
        </div>

        {upgradePrompt ? (
          <div className="mb-8">
            <PlanUpgradeNotice
              title={upgradePrompt.title}
              description={upgradePrompt.description}
              ctaHref={`/upgrade?reason=${upgradePrompt.reason}`}
              ctaLabel={uiLang === 'ar' ? 'ترقية الآن' : 'Upgrade now'}
              secondaryHref="/pricing"
              secondaryLabel={uiLang === 'ar' ? 'شاهد الباقات' : 'View plans'}
              tone="amber"
            />
          </div>
        ) : null}

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">
            {copy.opportunityAnalysis}
          </h1>
          <MixedText
            as="p"
            text={displayQuery}
            className="mt-4 text-xl font-medium text-[#4B5563]"
          />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.targetMarket}
            </div>
            <div className="p-6">
              <MixedText
                as="p"
                text={displayMarket}
                className="text-lg leading-8 text-[#4B5563]"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.inputTargetCustomer}
            </div>
            <div className="p-6">
              <MixedText
                as="p"
                text={displayCustomer}
                className="text-lg leading-8 text-[#4B5563]"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
            {copy.whyThisOpportunity}
          </div>
          <div className="p-6">
            <p className="text-lg leading-8 text-[#4B5563]">
              {result.whyThisOpportunity}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
            {copy.whyThisScore}
          </div>
          <div className="p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">
                {copy.overallScore}: {result.opportunityScore}/100
              </span>
              <span className="rounded-full bg-[#ECFDF3] px-4 py-2 text-sm font-semibold text-[#027A48]">
                {safeLabel}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {scoreBreakdownRows.slice(0, 3).map((item) => (
                  <ScoreBreakdownCard
                    key={item.key}
                    label={item.label}
                    score={item.score}
                    note={item.note}
                  />
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:max-w-[66.666%]">
                {scoreBreakdownRows.slice(3).map((item) => (
                  <ScoreBreakdownCard
                    key={item.key}
                    label={item.label}
                    score={item.score}
                    note={item.note}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm md:col-span-1">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.opportunityScore}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold leading-none">
                    {result.opportunityScore}
                  </span>
                  <span className="mb-1 text-2xl font-semibold text-[#6B7280]">
                    /100
                  </span>
                </div>
                <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-sm font-semibold text-[#027A48]">
                  {safeLabel}
                </span>
              </div>
              <div className="my-4 h-px bg-[#E5E7EB]" />
              <p className="text-lg text-[#4B5563]">{result.summary}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.marketDemand}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-semibold">
                {result.marketDemand.title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {result.marketDemand.description}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.competition}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-semibold">
                {result.competition.title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {result.competition.description}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.targetCustomers}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-semibold">
                {result.targetCustomers.title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {result.targetCustomers.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-12">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm md:col-span-5">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.suggestedMvp}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold">
                {result.suggestedMvp.title}
              </h3>
              <p className="mt-4 text-2xl text-[#374151]">
                {result.suggestedMvp.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {result.suggestedMvp.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-[#F3F4F6] px-4 py-2 text-lg font-medium text-[#374151]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm md:col-span-3">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.revenueModel}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold">
                {result.revenueModel.title}
              </h3>
              <p className="mt-3 text-2xl font-semibold">
                {result.revenueModel.price}
              </p>
              <p className="mt-4 text-lg leading-8 text-[#6B7280]">
                {result.revenueModel.description}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm md:col-span-4">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.nextSteps}
            </div>
            <div className="p-6">
              <div className="space-y-4 text-lg font-medium text-[#374151]">
                {result.nextSteps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.bestFirstCustomer}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-semibold">
                {result.bestFirstCustomer.title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {result.bestFirstCustomer.description}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.firstOffer}
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-semibold">
                {result.firstOffer.title}
              </h3>
              <p className="mt-3 text-2xl font-semibold text-[#111827]">
                {result.firstOffer.priceIdea}
              </p>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {result.firstOffer.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.painPoints}
            </div>
            <div className="p-6">
              <div className="space-y-3 text-lg text-[#4B5563]">
                {result.painPoints.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.opportunityAngle}
            </div>
            <div className="p-6">
              <p className="text-lg leading-8 text-[#4B5563]">
                {result.opportunityAngle}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.goToMarket}
            </div>
            <div className="p-6">
              <p className="text-lg leading-8 text-[#4B5563]">
                {result.goToMarket}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold">
              {copy.risks}
            </div>
            <div className="p-6">
              <div className="space-y-3 text-lg text-[#4B5563]">
                {result.risks.map((risk) => (
                  <p key={risk}>{risk}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {canUseFeasibility ? (
          <InitialFeasibilityStudyPanel
            study={feasibilityStudy}
            uiLang={uiLang}
            loading={feasibilityLoading}
            loadingProgress={feasibilityProgress}
            loadingStageTitle={feasibilityLoadingStages[feasibilityStageIndex]?.title || ''}
            loadingStageDescription={feasibilityLoadingStages[feasibilityStageIndex]?.description || ''}
            errorMessage={feasibilityError}
            onGenerate={handleGenerateFeasibility}
            onContinueToValidation={feasibilityStudy ? handleStartTesting : undefined}
            validationActionLabel={testingActionCopy.button}
            validationActionHint={
              uiLang === 'ar'
                ? 'إذا بدت الجدوى الأولية منطقية، افتح التحقق الآن وحوّل هذه الفرضيات إلى أدلة من السوق الحقيقي.'
                : 'If the early feasibility looks reasonable, open validation now and turn these assumptions into real market evidence.'
            }
            validationActionLoading={testLoading || feasibilityLoading}
            reportQuery={displayQuery}
            reportMarket={displayMarket}
            generatedAt={generatedAtText}
          />
        ) : (
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  {uiLang === 'ar' ? 'ميزة مدفوعة' : 'Paid feature'}
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
                  {uiLang === 'ar'
                    ? 'دراسة الجدوى الأولية ضمن الاحترافية وما فوق'
                    : 'The initial feasibility study is available on Pro and above'}
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                  {uiLang === 'ar'
                    ? 'تحليل الفرصة الأساسي يبقى ظاهرًا هنا، لكن طبقة الجدوى الأولية المالية أصبحت ضمن الباقة المدفوعة لأنها تضيف تكاليف وتقديرات وإيرادات ونقطة تعادل فوق التقرير الأساسي.'
                    : 'The main opportunity analysis stays available here, but the early financial feasibility layer now sits inside the paid plan because it adds startup costs, monthly estimates, revenue scenarios, and a break-even view on top of the core report.'}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/upgrade?reason=feasibility"
                  className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {uiLang === 'ar' ? 'فتح الاحترافية' : 'Unlock Pro'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {!feasibilityStudy ? (
          <div className="mt-10 rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  {copy.nextStepTitle}
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
                  {testingActionCopy.title}
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                  {testingActionCopy.description}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleStartTesting}
                  disabled={testLoading || feasibilityLoading}
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {testLoading ? copy.openingTest : testingActionCopy.button}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}