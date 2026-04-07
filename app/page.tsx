'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import {
  BLOG_POSTS,
  COMPARISONS,
  USE_CASES,
  localizeText,
} from '@/lib/blog';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

const EXAMPLES = {
  en: {
    idea: 'AI for dental clinics',
    market: 'Saudi Arabia',
    customer: 'Private dental clinics with 2-10 branches',
  },
  ar: {
    idea: 'ذكاء اصطناعي لعيادات الأسنان',
    market: 'السعودية، الرياض، الكويت، مصر',
    customer: 'عيادات أسنان خاصة لديها من 2 إلى 10 فروع',
  },
} as const;

const INPUT_PLACEHOLDERS = {
  en: {
    idea: 'Example: furnished apartment turnover service, beard serum for men, gym subscription management tool',
    customer:
      'Example: owners of small furnished apartments, men interested in beard care, owners of small gyms',
  },
  ar: {
    idea: 'مثال: مغسلة سيارات نسائية متنقلة في الرياض، متجر تيشيرتات شبابية، خدمة واتساب لتأكيد مواعيد العيادات',
    customer: 'مثال: مالكات سيارات، أصحاب عيادات صغيرة، شباب من 18 إلى 30 سنة',
  },
} as const;

const UI_COPY = {
  en: {
    dir: 'ltr',
    heroEyebrow: 'AI Opportunity Analysis Workspace',
    heroTitle: 'Turn an idea into a clearer direction and next move.',
    heroDescription:
      'Madixo helps you analyze opportunities, generate an early feasibility view, turn them into testing plans, capture market evidence, and decide the next move with more confidence.',
    primaryCta: 'Start Opportunity Analysis',
    secondaryCta: 'See How It Works',
    radarLabel: 'Start with an idea',
    radarDescription:
      'Describe the opportunity, market, and customer, then let Madixo turn that into analysis, early feasibility, testing, evidence, and a clearer working path.',
    businessIdea: 'Business Idea',
    targetMarket: 'Target Market',
    targetCustomer: 'Target Customer',
    analyzeOpportunity: 'Analyze Opportunity',

    summary1: 'Analyze',
    summary2: 'Test',
    summary3: 'Capture evidence',
    summary4: 'Decide',

    trustEyebrow: 'Why Madixo',
    trustTitle: 'Built for founders who need more than a one-time report.',
    trustDescription:
      'Madixo is designed to help you move from analysis to execution instead of getting stuck with a static output.',
    trustCard1Title: 'From report to feasibility and testing',
    trustCard1Description:
      'Generate a structured opportunity report, then move into an early feasibility view and a practical validation plan without switching tools.',
    trustCard2Title: 'From evidence to decision',
    trustCard2Description:
      'Capture objections, interviews, and market signals, then use them to understand whether to continue, pivot, or stop.',
    trustCard3Title: 'From decision to next move',
    trustCard3Description:
      'Get a clearer next move with suggested changes, a tighter test, an updated offer, and a sharper outreach message.',
    builtForTitle: 'Best fit for',
    builtFor1: 'Founders validating new startup ideas',
    builtFor2: 'Operators testing a product before scaling',
    builtFor3: 'Teams that want evidence before commitment',

    pricingEyebrow: 'Plans',
    pricingTitle: 'Package the product around workflow depth.',
    pricingDescription:
      'Madixo can be positioned in tiers based on how deep the user wants to go: from opportunity analysis only, to early feasibility, testing, evidence, and the best next move.',
    plan1Name: 'Opportunity Scan',
    plan1Tag: 'Light entry',
    plan1Description:
      'For founders who want a strong opportunity report before committing to deeper validation work.',
    plan1Feature1: 'Opportunity analysis',
    plan1Feature2: 'Structured report',
    plan1Feature3: 'PDF export',
    plan1Feature4: 'Good for first-pass screening',
    plan2Name: 'Validation Workspace',
    plan2Tag: 'Best value',
    plan2Description:
      'For founders who want to move from report to early feasibility, testing, evidence capture, and a clearer next move.',
    plan2Feature1: 'Everything in Opportunity Scan',
    plan2Feature2: 'Early feasibility study',
    plan2Feature3: 'Testing plan and workspace',
    plan2Feature4: 'Evidence, decision view, and next move',
    plan3Name: 'Team Workspace',
    plan3Tag: 'For teams',
    plan3Description:
      'For operators or small teams who want a shared workspace around opportunities, evidence, and execution follow-up.',
    plan3Feature1: 'Everything in Validation Workspace, including feasibility',
    plan3Feature2: 'Built for repeat internal usage',
    plan3Feature3: 'Better fit for team review flow',
    plan3Feature4: 'Ready for future collaboration layer',
    mostRecommended: 'Most recommended',

    valueEyebrow: 'What you get',
    valueTitle: 'A working evidence flow, not just a single answer.',
    valueDescription:
      'Each opportunity in Madixo can move through analysis, early feasibility, testing, evidence capture, current direction, and the best next move inside one workspace.',
    value1Title: 'Structured opportunity report',
    value1Description:
      'Evaluate demand, competition, monetization, risks, and first-customer direction in one report.',
    value2Title: 'Early feasibility study',
    value2Description:
      'Get an early financial view before deeper execution: startup range, monthly costs, revenue scenarios, and a rough break-even direction.',
    value3Title: 'Validation workspace and evidence',
    value3Description:
      'Turn the report into a practical testing plan, log interviews, objections, and market signals, then keep your decision state visible in one workspace.',
    value4Title: 'Next move engine',
    value4Description:
      'Translate what you learned into the next practical move: what to change, what to test, what to offer, and what to measure.',

    signalsEyebrow: 'Trust signals',
    signalsTitle: 'Designed for a real workflow.',
    signalsDescription:
      'Madixo is built around practical operating signals that make the product more useful in real decision-making.',
    signal1: 'Arabic and English experience',
    signal2: 'Saved reports, feasibility studies, and validation plans',
    signal3: 'Evidence logging and evidence summary',
    signal4: 'Evidence, decision view, and next move',
    signal5: 'Shareable PDF exports',
    signal6: 'Single workspace from idea to next step',

    contentEyebrow: 'Explore content',
    contentTitle: 'Explore the knowledge hub without leaving the main path.',
    contentDescription:
      'Read one useful article, one practical use case, and one comparison, then continue back to the product when you are ready.',
    articlesTitle: 'Articles',
    articlesCta: 'Open article',
    useCasesTitle: 'Use Cases',
    useCasesCta: 'Open use case',
    comparisonsTitle: 'Comparisons',
    comparisonsCta: 'Open comparison',
    browseAllArticles: 'Browse all articles',
    browseAllUseCases: 'Browse all use cases',
    browseAllComparisons: 'Browse all comparisons',

    howMadixoWorks: 'How Madixo Works',
    howMadixoWorksDescription:
      'Move from a raw idea to a clearer next move through analysis, early feasibility, testing, evidence, and a current direction.',
    step1Title: 'Describe the idea and market',
    step1Description:
      'Enter the opportunity you want to explore, then define the market and target customer so Madixo starts with clear context.',
    step2Title: 'Get the report and early feasibility view',
    step2Description:
      'Madixo evaluates demand, competition, monetization, and risk, then gives you a structured opportunity report. On the paid path, you can also generate an early feasibility view before deeper execution.',
    step3Title: 'Test and capture evidence',
    step3Description:
      'Turn the report into a practical testing plan, then log interviews, objections, and market signals in one working space.',
    step4Title: 'Decide the next move',
    step4Description:
      'Generate the decision view, understand the current direction, and get the next practical move: what to change, what to test, and what to measure.',

    closingTitle: 'Ready to explore your next opportunity?',
    closingDescription:
      'Start with analysis, then add early feasibility, testing, evidence, and a clearer next move with Madixo.',
  },
  ar: {
    dir: 'rtl',
    heroEyebrow: 'مساحة عمل لتحليل الفرص وتحديد الخطوة التالية',
    heroTitle: 'حوّل الفكرة إلى اتجاه أوضح وخطوة تالية أهدأ.',
    heroDescription:
      'يساعدك Madixo على تحليل الفرص، وإنشاء دراسة جدوى أولية، وتحويلها إلى خطة تجربة، وجمع نتائج التجربة من السوق، ثم تحديد الخطوة التالية بثقة أكبر.',
    primaryCta: 'ابدأ تحليل الفرصة',
    secondaryCta: 'استكشف كيف يعمل',
    radarLabel: 'ابدأ من الفكرة',
    radarDescription:
      'صف الفرصة والسوق والعميل، ثم دع Madixo يحول ذلك إلى تحليل ودراسة جدوى أولية وخطة تجربة وملاحظات سوق ومسار أوضح للعمل.',
    businessIdea: 'الفكرة التجارية',
    targetMarket: 'السوق المستهدف',
    targetCustomer: 'العميل المستهدف',
    analyzeOpportunity: 'حلّل الفرصة',

    summary1: 'حلّل',
    summary2: 'جرّب',
    summary3: 'اجمع نتائج التجربة',
    summary4: 'قرّر',

    trustEyebrow: 'لماذا Madixo',
    trustTitle: 'مبني للمؤسس الذي يحتاج أكثر من تقرير واحد.',
    trustDescription:
      'صُمم Madixo ليساعدك على الانتقال من التحليل إلى التنفيذ، بدل التوقف عند مخرجات ثابتة لا تتحرك بعدها.',
    trustCard1Title: 'من التقرير إلى الجدوى الأولية وخطة التجربة',
    trustCard1Description:
      'أنشئ تقرير فرصة منظمًا، ثم انتقل إلى دراسة جدوى أولية وخطة تجربة عملية داخل المسار نفسه دون التنقل بين أدوات متعددة.',
    trustCard2Title: 'من نتائج التجربة إلى القرار',
    trustCard2Description:
      'سجل الاعتراضات والمقابلات وملاحظات السوق، ثم استخدمها لتعرف هل الأنسب هو الاستمرار أو التعديل أو التوقف.',
    trustCard3Title: 'من الاتجاه الحالي إلى الخطوة التالية',
    trustCard3Description:
      'احصل على التعديل التنفيذي التالي بشكل أوضح: ما الذي يتغير، ما الاختبار التالي، وما العرض والرسالة الأنسب الآن.',
    builtForTitle: 'الأنسب لـ',
    builtFor1: 'المؤسسين الذين يختبرون أفكارًا جديدة',
    builtFor2: 'المشغلين الذين يريدون اختبار المنتج قبل التوسع',
    builtFor3: 'من يريد اتجاهًا مبنيًا على ما تعلّمه من السوق لا على الانطباع',

    pricingEyebrow: 'الباقات',
    pricingTitle: 'قسّم المنتج حسب عمق العمل، لا حسب عدد الأزرار فقط.',
    pricingDescription:
      'يمكن تموضع Madixo كباقات متدرجة بحسب عمق الاستخدام: من تحليل الفرصة فقط، إلى دراسة الجدوى الأولية، ثم مسار التحقق وملاحظات السوق والخطوة التالية.',
    plan1Name: 'تحليل الفرصة',
    plan1Tag: 'دخول خفيف',
    plan1Description:
      'لمن يريد تقرير فرصة قويًا قبل الدخول في تجربة أعمق أو التزام أكبر.',
    plan1Feature1: 'تحليل الفرصة',
    plan1Feature2: 'تقرير منظم',
    plan1Feature3: 'تصدير PDF',
    plan1Feature4: 'مناسب للفرز الأولي للأفكار',
    plan2Name: 'مساحة التحقق',
    plan2Tag: 'الأكثر قيمة',
    plan2Description:
      'لمن يريد الانتقال من التقرير إلى الجدوى الأولية وخطة التحقق وتسجيل ملاحظات السوق والوصول إلى اتجاه أوضح.',
    plan2Feature1: 'كل ما في تحليل الفرصة',
    plan2Feature2: 'دراسة جدوى أولية',
    plan2Feature3: 'خطة اختبار ومساحة عمل',
    plan2Feature4: 'ملاحظات السوق ورؤية القرار وأفضل خطوة الآن',
    plan3Name: 'مساحة عمل للفريق',
    plan3Tag: 'للفرق',
    plan3Description:
      'للمشغلين أو الفرق الصغيرة التي تريد لاحقًا مساحة عمل مشتركة حول الفرص والمتابعة التنفيذية.',
    plan3Feature1: 'كل ما في مساحة التحقق بما فيه دراسة الجدوى الأولية',
    plan3Feature2: 'أنسب للاستخدام الداخلي المتكرر',
    plan3Feature3: 'أنسب لمراجعة الفرص داخل الفريق',
    plan3Feature4: 'جاهز لاحقًا لطبقة تعاون أوسع',
    mostRecommended: 'الأكثر توصية',

    valueEyebrow: 'ماذا تحصل عليه',
    valueTitle: 'مسار عمل متجدد، وليس إجابة واحدة فقط.',
    valueDescription:
      'كل فرصة في Madixo يمكن أن تمر عبر التحليل، ودراسة الجدوى الأولية، وخطة التحقق، وتسجيل ملاحظات السوق، ورؤية القرار، ثم أفضل خطوة الآن داخل مساحة عمل واحدة.',
    value1Title: 'تقرير فرصة منظم',
    value1Description:
      'قيّم الطلب والمنافسة والربحية والمخاطر واتجاه أفضل عميل أول داخل تقرير واحد واضح.',
    value2Title: 'دراسة جدوى أولية',
    value2Description:
      'خذ نظرة مالية أولية قبل التنفيذ الأعمق: تكاليف البداية، والتكاليف الشهرية، وسيناريوهات الإيراد، واتجاه أولي لنقطة التعادل.',
    value3Title: 'مساحة عمل للتجربة ونتائجها',
    value3Description:
      'حوّل التقرير إلى خطة تجربة، وسجل المقابلات والاعتراضات وملاحظات السوق، ثم استخرج خلاصة ما تعلمته من السوق.',
    value4Title: 'محرك الخطوة التالية',
    value4Description:
      'حوّل ما تعلمته من التجربة إلى خطوة عملية تالية: ما الذي يتغير، ما التجربة التالية، ما العرض الأنسب، وما الذي يجب قياسه.',

    signalsEyebrow: 'إشارات الثقة',
    signalsTitle: 'مصمم لسير عمل حقيقي.',
    signalsDescription:
      'تم بناء Madixo حول عناصر تشغيل عملية تجعل المنتج أكثر فائدة في اتخاذ القرار الحقيقي.',
    signal1: 'تجربة عربية وإنجليزية',
    signal2: 'حفظ التقارير ودراسات الجدوى وخطط التجربة',
    signal3: 'تسجيل نتائج التجربة وخلاصة ما تعلمناه',
    signal4: 'ملاحظات السوق ورؤية القرار وأفضل خطوة الآن',
    signal5: 'تصدير PDF قابل للمشاركة',
    signal6: 'مساحة عمل واحدة من الفكرة إلى الخطوة التالية',

    contentEyebrow: 'مركز المحتوى',
    contentTitle: 'اكتشف المحتوى بدون أن يزاحم هدف الصفحة الرئيسي.',
    contentDescription:
      'مقال واحد مفيد، وحالة استخدام عملية، ومقارنة واضحة، ثم تستطيع العودة مباشرة إلى المنتج عندما تكون جاهزًا.',
    articlesTitle: 'المقالات',
    articlesCta: 'افتح المقال',
    useCasesTitle: 'حالات الاستخدام',
    useCasesCta: 'افتح الحالة',
    comparisonsTitle: 'المقارنات',
    comparisonsCta: 'افتح المقارنة',
    browseAllArticles: 'تصفح كل المقالات',
    browseAllUseCases: 'تصفح كل الحالات',
    browseAllComparisons: 'تصفح كل المقارنات',

    howMadixoWorks: 'كيف يعمل Madixo',
    howMadixoWorksDescription:
      'حوّل فكرتك من تصور أولي إلى قرار أوضح، عبر التحليل، ودراسة الجدوى الأولية، والتجربة، ونتائجها، والخطوة التالية.',
    step1Title: 'صف الفكرة والسوق',
    step1Description:
      'أدخل الفكرة التي تريد تجربتها، وحدد السوق والعميل المستهدف حتى يبدأ Madixo من سياق واضح.',
    step2Title: 'احصل على التقرير ودراسة الجدوى الأولية',
    step2Description:
      'يحلل Madixo الطلب والمنافسة والربحية والمخاطر، ثم يبني لك تقرير فرصة منظمًا. وفي المسار المدفوع يمكنك أيضًا إنشاء دراسة جدوى أولية قبل الدخول في التنفيذ الأعمق.',
    step3Title: 'جرّب الفكرة واجمع نتائج التجربة',
    step3Description:
      'حوّل التقرير إلى خطة اختبار عملية، وسجل المقابلات والاعتراضات وإشارات السوق داخل مساحة عمل واحدة.',
    step4Title: 'قرر الخطوة التالية',
    step4Description:
      'استخرج خلاصة ما تعلمناه، افهم اتجاه القرار، ثم احصل على التعديل التنفيذي التالي: ماذا تغيّر، ماذا تجرّب، وما الذي تقيسه.',

    closingTitle: 'هل أنت جاهز لاكتشاف فرصتك القادمة؟',
    closingDescription:
      'ابدأ بتحليل الفكرة، ثم أضف دراسة جدوى أولية وتجربة ونتائج وقرار أوضح مع Madixo.',
  },
} as const;

type PricingCardProps = {
  name: string;
  tag: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  actionLabel: string;
  badgeLabel: string;
  onClick: () => void;
};

type DynamicContentCard = {
  sectionTitle: string;
  itemTitle: string;
  itemDescription: string;
  href: string;
  cta: string;
  browseLabel: string;
  browseHref: string;
};

function PricingCard({
  name,
  tag,
  description,
  features,
  highlighted = false,
  actionLabel,
  badgeLabel,
  onClick,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-[28px] border p-6 shadow-sm ${
        highlighted
          ? 'border-[#111827] bg-[#111827] text-white'
          : 'border-[#D9E2F0] bg-[#F7F9FC] text-[#111827]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold tracking-tight">{name}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            highlighted
              ? 'bg-white/15 text-white'
              : 'border border-[#D9E2F0] bg-[#F8FAFD] text-[#4B5563]'
          }`}
        >
          {tag}
        </span>
      </div>

      {highlighted ? (
        <div className="mt-4">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#111827]">
            {badgeLabel}
          </span>
        </div>
      ) : null}

      <p
        className={`mt-5 text-base leading-8 ${
          highlighted ? 'text-white/85' : 'text-[#4B5563]'
        }`}
      >
        {description}
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
              highlighted ? 'bg-white/10 text-white' : 'bg-[#FAFBFD] text-[#374151]'
            }`}
          >
            {feature}
          </div>
        ))}
      </div>

      <button
        onClick={onClick}
        className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
          highlighted
            ? 'bg-white text-[#111827] hover:opacity-90'
            : 'bg-[#111827] text-white hover:opacity-90'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function normalizeInputForValidation(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function truncateText(value: string, maxLength = 140) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function countLettersForValidation(value: string) {
  const matches = value.match(/[A-Za-z\u0600-\u06FF]/g);
  return matches ? matches.length : 0;
}

function looksLikePlaceholder(value: string) {
  const simplified = normalizeInputForValidation(value)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[^a-z\u0600-\u06FF0-9\s]/g, '')
    .trim();

  if (!simplified) return true;

  const placeholders = new Set([
    '1',
    '11',
    '111',
    'test',
    'testing',
    'demo',
    'none',
    'na',
    'n a',
    'asdf',
    'qwerty',
    'xxx',
    'غير محدد',
    'غير معروف',
    'لا اعرف',
    'لا أعرف',
    'لا يوجد',
    'لايوجد',
    'غير موجود',
    'مافي',
    'ما فيه',
    'بدون',
    'شي',
    'شيء',
    'فكرة',
    'عميل',
    'سوق',
    'نفسه',
  ]);

  if (placeholders.has(simplified)) return true;
  if (/^\d+$/.test(simplified)) return true;

  const compact = simplified.replace(/\s+/g, '');
  if (compact.length >= 2 && new Set(compact).size === 1) return true;

  return false;
}

function looksLikeMeaningfulIdea(value: string) {
  const normalized = normalizeInputForValidation(value);
  if (!normalized) return false;
  if (looksLikePlaceholder(value)) return false;
  if (countLettersForValidation(normalized) < 2) return false;
  return true;
}

function looksLikeValidCustomerDescription(value: string) {
  const normalized = normalizeInputForValidation(value);
  if (!normalized) return false;
  if (looksLikePlaceholder(value)) return false;
  if (countLettersForValidation(normalized) < 2) return false;
  return true;
}

function looksTooGenericForMarket(value: string) {
  if (looksLikePlaceholder(value)) return true;
  if (countLettersForValidation(value) < 2) return true;
  return false;
}

function getFormValidationCopy(language: UiLanguage) {
  if (language === 'ar') {
    return {
      general:
        'أكمل الحقول الثلاثة بشكل واضح حتى يبدأ التحليل.',
      idea:
        'اكتب فكرة واضحة حتى لو كانت قصيرة. مثال: مغسلة سيارات نسائية متنقلة في الرياض، متجر تيشيرتات شبابية، خدمة واتساب لتأكيد مواعيد العيادات.',
      market: 'اكتب السوق بشكل واضح، مثل: السعودية، الرياض، الكويت، أو مصر.',
      customer:
        'اكتب العميل المستهدف بشكل مختصر وواضح، مثل: مالكات سيارات، أصحاب عيادات صغيرة، أو شباب من 18 إلى 30 سنة.',
    };
  }

  return {
    general: 'Complete the three fields clearly to start the analysis.',
    idea:
      'Write the idea in a way that can be understood, even if it is short. Example: selling T-shirts, beard serum, booking platform, importing products and adapting them.',
    market: 'Write the market clearly, such as Saudi Arabia, Riyadh, or GCC.',
    customer:
      'Write the target customer clearly, even in a short way, such as youth, mothers, clinic owners, or all ages.',
  };
}

function validateStartForm(
  values: { idea: string; market: string; customer: string },
  language: UiLanguage
) {
  const copy = getFormValidationCopy(language);

  const query = normalizeInputForValidation(values.idea);
  const market = normalizeInputForValidation(values.market);
  const customer = normalizeInputForValidation(values.customer);

  const errors: Partial<Record<'idea' | 'market' | 'customer', string>> = {};

  if (!looksLikeMeaningfulIdea(query)) {
    errors.idea = copy.idea;
  }

  if (!market || looksTooGenericForMarket(market)) {
    errors.market = copy.market;
  }

  if (!looksLikeValidCustomerDescription(customer)) {
    errors.customer = copy.customer;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: errors.idea || errors.market || errors.customer || copy.general,
  };
}

export default function HomePage() {
  const router = useRouter();

  const [preferredLanguage, setPreferredLanguage] = useState<UiLanguage>('en');
  const [idea, setIdea] = useState('');
  const [market, setMarket] = useState('');
  const [customer, setCustomer] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'idea' | 'market' | 'customer', string>>>({});
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const ideaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const initialLanguage = getClientUiLanguage('en');
    setPreferredLanguage(initialLanguage);
  }, []);

  const copy = UI_COPY[preferredLanguage];
  const isArabic = preferredLanguage === 'ar';
  const inputAlignClass = isArabic ? 'text-right' : 'text-left';
  const sectionId = 'how-it-works';

  const featuredArticle = BLOG_POSTS.find((post) => post.featured) ?? BLOG_POSTS[0];
  const featuredUseCase = USE_CASES[0];
  const featuredComparison = COMPARISONS[0];

  const dynamicContentCards: DynamicContentCard[] = [
    {
      sectionTitle: copy.articlesTitle,
      itemTitle: localizeText(featuredArticle.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredArticle.excerpt, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/blog/${featuredArticle.slug}`,
      cta: copy.articlesCta,
      browseLabel: copy.browseAllArticles,
      browseHref: '/blog',
    },
    {
      sectionTitle: copy.useCasesTitle,
      itemTitle: localizeText(featuredUseCase.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredUseCase.summary, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/use-cases/${featuredUseCase.slug}`,
      cta: copy.useCasesCta,
      browseLabel: copy.browseAllUseCases,
      browseHref: '/use-cases',
    },
    {
      sectionTitle: copy.comparisonsTitle,
      itemTitle: localizeText(featuredComparison.title, preferredLanguage),
      itemDescription: truncateText(
        localizeText(featuredComparison.summary, preferredLanguage),
        preferredLanguage === 'ar' ? 110 : 130
      ),
      href: `/compare-to/${featuredComparison.slug}`,
      cta: copy.comparisonsCta,
      browseLabel: copy.browseAllComparisons,
      browseHref: '/compare-to',
    },
  ];

  const handleAnalyze = () => {
    const query = idea.trim();
    const targetMarket = market.trim();
    const targetCustomer = customer.trim();

    const validation = validateStartForm(
      {
        idea: query,
        market: targetMarket,
        customer: targetCustomer,
      },
      preferredLanguage
    );

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(validation.message);
      return;
    }

    setFieldErrors({});
    setFormError('');

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('uiLang', preferredLanguage);
    params.set('market', targetMarket);
    params.set('customer', targetCustomer);

    router.push(`/results?${params.toString()}`);
  };

  const secondaryHref = `#${sectionId}`;

  const scrollToIdeaForm = () => {
    formSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    window.setTimeout(() => {
      ideaInputRef.current?.focus();
    }, 250);
  };

  const steps = [
    { number: 1, title: copy.step1Title, description: copy.step1Description },
    { number: 2, title: copy.step2Title, description: copy.step2Description },
    { number: 3, title: copy.step3Title, description: copy.step3Description },
    { number: 4, title: copy.step4Title, description: copy.step4Description },
  ];

  const trustCards = [
    { title: copy.trustCard1Title, description: copy.trustCard1Description },
    { title: copy.trustCard2Title, description: copy.trustCard2Description },
    { title: copy.trustCard3Title, description: copy.trustCard3Description },
  ];

  const fitItems = [copy.builtFor1, copy.builtFor2, copy.builtFor3];

  const valueCards = [
    { title: copy.value1Title, description: copy.value1Description },
    { title: copy.value2Title, description: copy.value2Description },
    { title: copy.value3Title, description: copy.value3Description },
    { title: copy.value4Title, description: copy.value4Description },
  ];

  const signalItems = [
    copy.signal1,
    copy.signal2,
    copy.signal3,
    copy.signal4,
    copy.signal5,
    copy.signal6,
  ];

  const pricingPlans = [
    {
      name: copy.plan1Name,
      tag: copy.plan1Tag,
      description: copy.plan1Description,
      features: [
        copy.plan1Feature1,
        copy.plan1Feature2,
        copy.plan1Feature3,
        copy.plan1Feature4,
      ],
      highlighted: false,
    },
    {
      name: copy.plan2Name,
      tag: copy.plan2Tag,
      description: copy.plan2Description,
      features: [
        copy.plan2Feature1,
        copy.plan2Feature2,
        copy.plan2Feature3,
        copy.plan2Feature4,
      ],
      highlighted: true,
    },
    {
      name: copy.plan3Name,
      tag: copy.plan3Tag,
      description: copy.plan3Description,
      features: [
        copy.plan3Feature1,
        copy.plan3Feature2,
        copy.plan3Feature3,
        copy.plan3Feature4,
      ],
      highlighted: false,
    },
  ];

  const summaryItems = [copy.summary1, copy.summary2, copy.summary3, copy.summary4];

  return (
    <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] text-[#111827]">
      <section className="px-6 pt-6 md:pt-8">
        <SiteHeader
          uiLang={preferredLanguage}
          onLanguageChange={setPreferredLanguage}
          logo={
            <Image
              src="/brand/madixo-logo.png"
              alt="Madixo"
              width={220}
              height={56}
              priority
              className="h-auto w-[170px] md:w-[220px]"
            />
          }
        />
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-14 pt-10 text-center md:pt-12">
        <span className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#4B5563] shadow-sm">
          {copy.heroEyebrow}
        </span>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {copy.heroTitle}
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
          {copy.heroDescription}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={handleAnalyze}
            className="cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.primaryCta}
          </button>

          <a
            href={secondaryHref}
            className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9]"
          >
            {copy.secondaryCta}
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {summaryItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-medium text-[#374151]"
            >
              {item}
            </span>
          ))}
        </div>

        <div
          ref={formSectionRef}
          className="mt-14 w-full max-w-4xl rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm md:p-8"
        >
          <p className="text-sm font-medium text-[#6B7280]">{copy.radarLabel}</p>
          <p className="mt-3 text-sm leading-7 text-[#4B5563]">{copy.radarDescription}</p>

          <div className={`mt-6 grid gap-4 md:grid-cols-1 ${inputAlignClass}`}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.businessIdea}
              </label>
              <input
                ref={ideaInputRef}
                type="text"
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  if (fieldErrors.idea) {
                    setFieldErrors((current) => ({ ...current, idea: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.idea ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={isArabic ? INPUT_PLACEHOLDERS.ar.idea : INPUT_PLACEHOLDERS.en.idea}
              />
              {fieldErrors.idea ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.idea}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.targetMarket}
              </label>
              <input
                type="text"
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value);
                  if (fieldErrors.market) {
                    setFieldErrors((current) => ({ ...current, market: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.market ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={EXAMPLES[preferredLanguage].market}
              />
              {fieldErrors.market ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.market}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                {copy.targetCustomer}
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (fieldErrors.customer) {
                    setFieldErrors((current) => ({ ...current, customer: undefined }));
                  }
                  if (formError) setFormError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className={`w-full rounded-xl border bg-white px-4 py-4 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF] ${
                  fieldErrors.customer ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                } ${inputAlignClass}`}
                placeholder={isArabic ? INPUT_PLACEHOLDERS.ar.customer : INPUT_PLACEHOLDERS.en.customer}
              />
              {fieldErrors.customer ? (
                <p className="mt-2 text-sm text-[#DC2626]">{fieldErrors.customer}</p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <div className="mt-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
              {formError}
            </div>
          ) : null}

          <button
            onClick={handleAnalyze}
            className="mt-6 cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.analyzeOpportunity}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.trustEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            {copy.trustTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
            {copy.trustDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-[#111827]">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#6B7280]">{copy.builtForTitle}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {fitItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-medium text-[#374151]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.pricingEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            {copy.pricingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
            {copy.pricingDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              tag={plan.tag}
              description={plan.description}
              features={plan.features}
              highlighted={plan.highlighted}
              actionLabel={copy.primaryCta}
              badgeLabel={copy.mostRecommended}
              onClick={scrollToIdeaForm}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.valueEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            {copy.valueTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
            {copy.valueDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-[#111827]">
                {card.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm md:p-8">
          <div className="text-center">
            <p className="text-sm font-medium text-[#6B7280]">{copy.signalsEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
              {copy.signalsTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
              {copy.signalsDescription}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {signalItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-medium text-[#374151]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id={sectionId} className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <p className="text-sm font-medium text-[#6B7280]">{copy.howMadixoWorks}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
            {copy.howMadixoWorks}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
            {copy.howMadixoWorksDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF3F9] text-lg font-semibold text-[#111827]">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold">{step.title}</h3>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[24px] border border-[#D9E2F0] bg-[#F8FAFD] p-5 shadow-sm md:p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-[#6B7280]">{copy.contentEyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
              {copy.contentTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#4B5563] md:text-base">
              {copy.contentDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dynamicContentCards.map((item) => (
              <div
                key={item.href}
                className="rounded-2xl border border-[#D9E2F0] bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold text-[#6B7280]">
                  {item.sectionTitle}
                </p>

                <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#111827]">
                  {item.itemTitle}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                  {item.itemDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {item.cta}
                  </Link>

                  <Link
                    href={item.browseHref}
                    className="inline-flex rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#EEF3F9]"
                  >
                    {item.browseLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">{copy.closingTitle}</h2>
        <p className="mt-4 text-lg text-[#4B5563]">{copy.closingDescription}</p>

        <button
          onClick={scrollToIdeaForm}
          className="mt-8 cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {copy.primaryCta}
        </button>
      </section>
      <SiteFooter uiLang={preferredLanguage} />
    </main>
  );
}
