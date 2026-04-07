'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import {
  getClientUiLanguage,
  setClientUiLanguage,
  type UiLanguage,
} from '@/lib/ui-language';
import { getPlanLimitsSummary, getUpgradeReasonText } from '@/lib/madixo-plans';

const COPY = {
  ar: {
    eyebrow: 'ترقية',
    defaultTitle: 'هذه الميزة تحتاج باقة أعلى في النسخة الحالية.',
    reasonReportsTitle: 'وصلت إلى الحد الحالي من الفرص المحفوظة.',
    reasonCompareTitle: 'وصلت إلى حد المقارنة في باقتك الحالية.',
    reasonAnalysisTitle: 'استهلكت الحد الحالي من التحليلات.',
    reasonFeasibilityTitle: 'ميزة دراسة الجدوى الأولية ضمن الباقة المدفوعة.',
    defaultDescription:
      'هذه الصفحة تشرح لك ببساطة لماذا ظهرت لك شاشة الترقية الآن، وما الذي يتغير إذا انتقلت إلى الاحترافية.',
    reasonReportsDescription:
      'عندما تصل إلى الحد الحالي من الفرص المحفوظة، تحتاج إلى الترقية لتكمل الحفظ بمساحة أوسع.',
    reasonCompareDescription:
      'عندما تصل إلى حد المقارنة في باقتك الحالية، تحتاج إلى الترقية لفتح مقارنة أوسع.',
    reasonAnalysisDescription:
      'عندما تستهلك الحد الحالي من التحليلات، تحتاج إلى الترقية للاستمرار.',
    reasonFeasibilityDescription:
      'دراسة الجدوى الأولية متاحة داخل الاحترافية وما فوق، لأنها تضيف طبقة مالية إضافية فوق تحليل الفرصة الأساسي.',
    currentPlanCard: 'حدود الباقة المجانية',
    proTitle: 'ماذا يتغير مع الاحترافية؟',
    note:
      'عند الانتقال إلى صفحة الباقات سيتم فتح Checkout آمن عبر Paddle، وتحديث الباقة يتم تلقائيًا بعد نجاح الدفع. وإذا كنت مشتركًا بالفعل فإدارة الإلغاء والفواتير تتم من بوابة الاشتراك.',
    primary: 'شاهد الباقات',
    secondary: 'العودة إلى لوحة التحكم',
    extraProItems: [
      'دراسة الجدوى الأولية',
      'مساحة تحقق أوسع للعمل المستمر',
      'مقارنة أوسع بين الفرص',
      'مرونة أكبر لحفظ التقارير والرجوع لها',
    ],
  },
  en: {
    eyebrow: 'Upgrade',
    defaultTitle: 'This feature needs a higher plan in the current version.',
    reasonReportsTitle: 'You reached the current saved opportunities limit.',
    reasonCompareTitle: 'You reached the comparison limit for your current plan.',
    reasonAnalysisTitle: 'You used the current analysis limit.',
    reasonFeasibilityTitle: 'The initial feasibility study is part of the paid plan.',
    defaultDescription:
      'This page explains, in a simple way, why you are seeing the upgrade screen now and what changes if you move to Pro.',
    reasonReportsDescription:
      'When you reach your current saved opportunities limit, you need to upgrade to keep saving with more room.',
    reasonCompareDescription:
      'When you reach your current comparison limit, you need to upgrade to unlock wider comparison.',
    reasonAnalysisDescription:
      'When you use your current analysis limit, you need to upgrade to continue.',
    reasonFeasibilityDescription:
      'The initial feasibility study is available on Pro and above because it adds a deeper financial layer on top of the main opportunity analysis.',
    currentPlanCard: 'Current free plan limits',
    proTitle: 'What changes with Pro?',
    note:
      'When you continue to the pricing page, Madixo opens a secure Paddle checkout and updates your plan automatically after payment. If you are already subscribed, cancellation and invoices are handled from the billing portal.',
    primary: 'View plans',
    secondary: 'Back to dashboard',
    extraProItems: [
      'Initial feasibility study',
      'More room to keep working inside validation',
      'Wider side-by-side comparison',
      'More room to save and revisit opportunities',
    ],
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

export default function UpgradePage() {
  const [uiLang, setUiLang] = useState<UiLanguage>('ar');
  const searchParams = useSearchParams();

  useEffect(() => {
    setUiLang(getClientUiLanguage('ar'));
  }, []);

  const copy = COPY[uiLang];
  const freeLimits = getPlanLimitsSummary('free', uiLang);
  const proLimits = getPlanLimitsSummary('pro', uiLang);

  const content = useMemo(() => {
    const reason = searchParams.get('reason');

    if (reason === 'reports_limit') {
      return {
        title: copy.reasonReportsTitle,
        description: copy.reasonReportsDescription,
      };
    }

    if (reason === 'compare_limit') {
      return {
        title: copy.reasonCompareTitle,
        description: copy.reasonCompareDescription,
      };
    }

    if (reason === 'analysis_limit') {
      return {
        title: copy.reasonAnalysisTitle,
        description: copy.reasonAnalysisDescription,
      };
    }

    if (reason === 'feasibility') {
      return {
        title: copy.reasonFeasibilityTitle,
        description: copy.reasonFeasibilityDescription,
      };
    }

    return {
      title: copy.defaultTitle,
      description: copy.defaultDescription,
    };
  }, [copy, searchParams]);

  const pricingHref = useMemo(() => {
    const reason = searchParams.get('reason');
    return reason ? `/pricing?reason=${encodeURIComponent(reason)}` : '/pricing';
  }, [searchParams]);

  const reasonText = getUpgradeReasonText(searchParams.get('reason'), uiLang);

  const freeStats = [
    { label: uiLang === 'ar' ? 'التحليلات' : 'Analyses', value: freeLimits.analysisRuns },
    { label: uiLang === 'ar' ? 'الفرص المحفوظة' : 'Saved opportunities', value: freeLimits.savedReports },
    { label: uiLang === 'ar' ? 'المقارنة' : 'Comparison', value: freeLimits.compareReports },
  ];

  const proItems = [
    proLimits.analysisRuns,
    proLimits.savedReports,
    proLimits.compareReports,
    ...copy.extraProItems,
  ];

  return (
    <main
      dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F9FAFB] px-4 py-6 md:px-6 md:py-8"
    >
      <SiteHeader
        uiLang={uiLang}
        onLanguageChange={(language) => {
          setUiLang(language);
          setClientUiLanguage(language);
        }}
        logo={<MadixoLogo />}
      />

      <section className="mx-auto mt-6 max-w-5xl rounded-[32px] border border-[#111827] bg-white p-6 shadow-sm md:p-8">
        <span className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs font-semibold text-[#6B7280]">
          {copy.eyebrow}
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#4B5563]">
          {content.description}
        </p>

        <div className="mt-6 rounded-[24px] border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3 text-sm leading-7 text-[#92400E]">
          {copy.note}
        </div>

        <div className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#374151]">
          <span className="font-semibold text-[#111827]">
            {uiLang === 'ar' ? 'سبب شاشة الترقية الآن:' : 'Why you are seeing this now:'}
          </span>{' '}
          {reasonText}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[28px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
            <h2 className="text-lg font-bold text-[#111827]">{copy.currentPlanCard}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {freeStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-[#E5E7EB] bg-white px-4 py-4"
                >
                  <div className="text-xs font-semibold text-[#6B7280]">{item.label}</div>
                  <div className="mt-2 text-xl font-bold text-[#111827]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#111827] bg-[#0F172A] p-5 text-white">
            <h2 className="text-lg font-bold">{copy.proTitle}</h2>
            <div className="mt-4 space-y-3">
              {proItems.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={pricingHref}
            className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.primary}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            {copy.secondary}
          </Link>
        </div>
      </section>
    </main>
  );
}
