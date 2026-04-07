'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  normalizeFeasibilityStudyDisplay,
  type InitialFeasibilityStudy,
} from '@/lib/madixo-feasibility';

type UiLanguage = 'ar' | 'en';

const COPY = {
  en: {
    eyebrow: 'Initial Feasibility Study',
    headline: 'Early feasibility before full execution',
    description:
      'This is a practical first-pass view of whether the opportunity can make financial sense early, based on assumptions rather than a final operating model.',
    create: 'Create Initial Feasibility Study',
    refresh: 'Refresh Feasibility Study',
    exportPdf: 'Download feasibility PDF',
    exportingPdf: 'Preparing PDF...',
    loading: 'Preparing study...',
    progressLabel: 'Completion',
    progressLead:
      'Madixo is building a clear early financial view for this opportunity.',
    currentStep: 'Current step',
    retry: 'Try again',
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
    empty:
      'Generate this section to get a rough early financial view: startup cost range, monthly cost range, rough revenue scenarios, and a preliminary break-even direction.',
    validationCta: 'Turn this study into validation',
    validationHint:
      'Move from early feasibility into the validation workspace so you can test the offer, demand, and real market response.',
    validationOpening: 'Opening validation...',
  },
  ar: {
    eyebrow: 'دراسة الجدوى الأولية',
    headline: 'نظرة أولية قبل التنفيذ الكامل',
    description:
      'هذه قراءة أولية عملية توضح هل المشروع قد يكون مجديًا ماليًا في البداية أم لا، بناءً على افتراضات واضحة وليست خطة مالية نهائية.',
    create: 'إنشاء دراسة الجدوى الأولية',
    refresh: 'إعادة إنشاء الدراسة',
    exportPdf: 'تحميل PDF دراسة الجدوى',
    exportingPdf: 'جار تجهيز PDF...',
    loading: 'جار إعداد الدراسة...',
    progressLabel: 'نسبة الإنجاز',
    progressLead:
      'يقوم Madixo الآن ببناء قراءة مالية أولية واضحة لهذه الفرصة.',
    currentStep: 'المرحلة الحالية',
    retry: 'إعادة المحاولة',
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
    empty:
      'أنشئ هذا القسم لتحصل على نظرة مالية أولية تقريبية: تكاليف البداية، التكاليف الشهرية، سيناريوهات الإيراد، واتجاه أولي لنقطة التعادل.',
    validationCta: 'حوّل هذه الدراسة إلى التحقق',
    validationHint:
      'انتقل من القراءة المالية الأولية إلى مساحة التحقق حتى تختبر العرض والطلب واستجابة السوق الحقيقي.',
    validationOpening: 'جار فتح التحقق...',
  },
} as const;

function getVerdictClasses(verdictKey: InitialFeasibilityStudy['verdictKey']) {
  if (verdictKey === 'start_now') {
    return 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]';
  }

  if (verdictKey === 'not_yet') {
    return 'bg-[#FEF2F2] text-[#B42318] border-[#FECDCA]';
  }

  return 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]';
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="rounded-t-3xl bg-[#F3F4F6] px-6 py-4 text-xl font-semibold text-[#111827]">
        {title}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ProgressCircle({ progress }: { progress: number }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32">
      <div
        className="absolute inset-0 rounded-full transition-all duration-500"
        style={{
          background: `conic-gradient(#111827 ${safeProgress * 3.6}deg, #E5E7EB 0deg)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-white shadow-inner" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-[#111827] md:text-3xl">
          {safeProgress}%
        </div>
      </div>
    </div>
  );
}


function toPdfFileName(value: string) {
  return (value || 'madixo-feasibility')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'madixo-feasibility';
}

export default function InitialFeasibilityStudyPanel({
  study,
  uiLang,
  loading,
  loadingProgress = 0,
  loadingStageTitle = '',
  loadingStageDescription = '',
  errorMessage = '',
  onGenerate,
  onContinueToValidation,
  validationActionLabel,
  validationActionHint,
  validationActionLoading = false,
  reportQuery = '',
  reportMarket = '',
  generatedAt = '',
}: {
  study: InitialFeasibilityStudy | null;
  uiLang: UiLanguage;
  loading: boolean;
  loadingProgress?: number;
  loadingStageTitle?: string;
  loadingStageDescription?: string;
  errorMessage?: string;
  onGenerate: () => void;
  onContinueToValidation?: () => void;
  validationActionLabel?: string;
  validationActionHint?: string;
  validationActionLoading?: boolean;
  reportQuery?: string;
  reportMarket?: string;
  generatedAt?: string;
}) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const copy = COPY[uiLang];
  const displayStudy = useMemo(
    () => (study ? normalizeFeasibilityStudyDisplay(study, uiLang) : null),
    [study, uiLang]
  );

  const handleExportPdf = async () => {
    if (!study) return;

    try {
      setExportingPdf(true);

      const response = await fetch('/api/export-feasibility-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uiLang,
          safeMarket: reportMarket,
          generatedAt,
          result: {
            query: reportQuery,
          },
          feasibility: study,
        }),
      });

      if (!response.ok) {
        let message = uiLang === 'ar' ? 'تعذر إنشاء PDF دراسة الجدوى.' : 'Failed to generate feasibility PDF.';
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {}
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${toPdfFileName(reportQuery || 'madixo-feasibility')}-feasibility.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : uiLang === 'ar' ? 'تعذر إنشاء PDF دراسة الجدوى.' : 'Failed to generate feasibility PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <section className="mt-10 rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            {copy.headline}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#4B5563]">
            {displayStudy ? copy.description : copy.empty}
          </p>
        </div>

        <div className="shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {displayStudy ? (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={loading || exportingPdf}
                className="rounded-full border border-[#D0D5DD] bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingPdf ? copy.exportingPdf : copy.exportPdf}
              </button>
            ) : null}

            <button
              onClick={onGenerate}
              disabled={loading || exportingPdf}
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? copy.loading : displayStudy ? copy.refresh : copy.create}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <ProgressCircle progress={loadingProgress} />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.progressLabel}
              </p>
              <p className="mt-3 text-xl font-semibold text-[#111827]">
                {copy.progressLead}
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#111827] transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, loadingProgress))}%` }}
                />
              </div>
              <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-[#6B7280]">{copy.currentStep}</p>
                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {loadingStageTitle || copy.loading}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                  {loadingStageDescription || copy.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && errorMessage ? (
        <div className="mt-8 rounded-3xl border border-[#FECDCA] bg-[#FEF3F2] p-6">
          <p className="text-sm font-semibold text-[#B42318]">{errorMessage}</p>
          <button
            type="button"
            onClick={onGenerate}
            className="mt-4 rounded-full border border-[#FCA5A5] bg-white px-5 py-2 text-sm font-semibold text-[#B42318] transition hover:bg-[#FFF1F2]"
          >
            {copy.retry}
          </button>
        </div>
      ) : null}

      {displayStudy ? (
        <div className="mt-8 space-y-8">
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFB] p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">
                {copy.verdict}
              </span>
              <span
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${getVerdictClasses(
                  displayStudy.verdictKey
                )}`}
              >
                {displayStudy.verdictLabel}
              </span>
            </div>
            <p className="mt-4 text-lg leading-8 text-[#374151]">
              {displayStudy.verdictSummary}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title={copy.assumptions}>
              <div className="space-y-3 text-lg leading-8 text-[#4B5563]">
                {displayStudy.keyAssumptions.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={copy.breakEven}>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] px-4 py-3 text-sm font-semibold text-[#111827]">
                {displayStudy.breakEvenTimeline}
              </div>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {displayStudy.breakEvenSummary}
              </p>
            </SectionCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title={copy.startupCosts}>
              <div className="mb-5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] px-4 py-3 text-sm font-semibold text-[#111827]">
                {copy.startupTotal}: {displayStudy.startupCosts.totalRange}
              </div>

              <div className="space-y-4">
                {displayStudy.startupCosts.items.map((item) => (
                  <div
                    key={`${item.item}-${item.estimate}`}
                    className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[#111827]">
                        {item.item}
                      </h3>
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-sm font-semibold text-[#111827]">
                        {item.estimate}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={copy.monthlyCosts}>
              <div className="mb-5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] px-4 py-3 text-sm font-semibold text-[#111827]">
                {copy.monthlyTotal}: {displayStudy.monthlyCosts.totalRange}
              </div>

              <div className="space-y-4">
                {displayStudy.monthlyCosts.items.map((item) => (
                  <div
                    key={`${item.item}-${item.estimate}`}
                    className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[#111827]">
                        {item.item}
                      </h3>
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-sm font-semibold text-[#111827]">
                        {item.estimate}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {displayStudy.revenueScenarios.map((scenario) => (
              <SectionCard
                key={`${scenario.scenario}-${scenario.monthlyRevenue}`}
                title={scenario.scenario}
              >
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] px-4 py-3 text-lg font-semibold text-[#111827]">
                  {scenario.monthlyRevenue}
                </div>
                <p className="mt-4 text-sm leading-7 text-[#6B7280]">
                  {scenario.note}
                </p>
              </SectionCard>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title={copy.risks}>
              <div className="space-y-3 text-lg leading-8 text-[#4B5563]">
                {displayStudy.financialRisks.map((item) => (
                  <p key={item}>• {item}</p>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={copy.action}>
              <p className="text-lg leading-8 text-[#4B5563]">
                {displayStudy.recommendedAction}
              </p>

              {onContinueToValidation ? (
                <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] p-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    {validationActionHint || copy.validationHint}
                  </p>
                  <button
                    type="button"
                    onClick={onContinueToValidation}
                    disabled={validationActionLoading}
                    className="mt-4 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {validationActionLoading
                      ? copy.validationOpening
                      : validationActionLabel || copy.validationCta}
                  </button>
                </div>
              ) : null}

              <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] p-4">
                <p className="text-sm font-semibold text-[#111827]">
                  {copy.disclaimer}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                  {displayStudy.disclaimer}
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}
    </section>
  );
}
