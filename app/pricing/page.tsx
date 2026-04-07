'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import {
  getClientUiLanguage,
  setClientUiLanguage,
  type UiLanguage,
} from '@/lib/ui-language';

type PlanKey = 'free' | 'pro' | 'team';

type PlanCard = {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  description: string;
  fitTitle: string;
  fitPoints: string[];
  limitsTitle: string;
  limits: string[];
  extrasTitle: string;
  extras: string[];
  cta: string;
  highlighted?: boolean;
  disabled?: boolean;
  note?: string;
  badge?: string;
};

type PlanUsage = {
  analysisRunsUsed: number;
  analysisRunsLimit: number | null;
  savedReportsUsed: number;
  savedReportsLimit: number;
  compareReportsLimit: number;
};

type BillingStatus =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unknown';

type BillingInfo = {
  provider: 'paddle';
  configured: boolean;
  checkoutEnabled: boolean;
  environment: 'sandbox' | 'live';
  status: BillingStatus;
  customerId: string | null;
  subscriptionId: string | null;
  priceId: string | null;
  nextBilledAt: string | null;
  cancelAtPeriodEnd: boolean;
  lastUpdatedAt: string | null;
};

type CurrentPlanPayload = {
  plan: PlanKey;
  usage?: PlanUsage | null;
  billing?: BillingInfo | null;
};

type CheckoutPayload = {
  clientToken: string;
  environment: 'sandbox' | 'live';
  priceId: string;
  customerEmail: string;
  successUrl: string;
  customData: Record<string, string>;
};

type CheckoutResponse = {
  ok?: boolean;
  checkout?: CheckoutPayload;
  alreadyActive?: boolean;
  loginRedirect?: string;
  error?: string;
};

type BillingPortalResponse = {
  ok?: boolean;
  url?: string;
  loginRedirect?: string;
  error?: string;
};

type PaddleCheckoutOpenOptions = {
  items: Array<{ priceId: string; quantity: number }>;
  customer?: {
    email?: string;
  };
  customData?: Record<string, string>;
  settings?: {
    displayMode?: 'overlay';
    locale?: 'ar' | 'en';
    successUrl?: string;
    theme?: 'light' | 'dark';
  };
};

type PaddleGlobal = {
  Environment: {
    set: (environment: 'sandbox' | 'live') => void;
  };
  Initialize: (options: {
    token: string;
  }) => void;
  Checkout: {
    open: (options: PaddleCheckoutOpenOptions) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
    __madixoPaddleInitialized?: {
      token: string;
      environment: 'sandbox' | 'live';
    };
  }
}

let paddleScriptPromise: Promise<void> | null = null;

async function loadPaddleScript() {
  if (typeof window === 'undefined') {
    throw new Error('WINDOW_NOT_AVAILABLE');
  }

  if (window.Paddle) {
    return;
  }

  if (paddleScriptPromise) {
    return paddleScriptPromise;
  }

  paddleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-madixo-paddle="true"]'
    );

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('PADDLE_SCRIPT_FAILED')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.dataset.madixoPaddle = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PADDLE_SCRIPT_FAILED'));
    document.head.appendChild(script);
  });

  return paddleScriptPromise;
}

async function openMadixoPaddleCheckout(
  checkout: CheckoutPayload,
  language: UiLanguage
) {
  await loadPaddleScript();

  if (!window.Paddle) {
    throw new Error('PADDLE_NOT_READY');
  }

  const initialized = window.__madixoPaddleInitialized;

  if (!initialized) {
    if (checkout.environment === 'sandbox') {
      window.Paddle.Environment.set('sandbox');
    }

    window.Paddle.Initialize({
      token: checkout.clientToken,
    });

    window.__madixoPaddleInitialized = {
      token: checkout.clientToken,
      environment: checkout.environment,
    };
  }

  window.Paddle.Checkout.open({
    items: [{ priceId: checkout.priceId, quantity: 1 }],
    customer: {
      email: checkout.customerEmail,
    },
    customData: checkout.customData,
    settings: {
      displayMode: 'overlay',
      locale: language === 'ar' ? 'ar' : 'en',
      successUrl: checkout.successUrl,
      theme: 'light',
    },
  });
}

const COPY = {
  ar: {
    eyebrow: 'الباقات',
    title: 'اختر الباقة المناسبة لمرحلتك الآن.',
    description:
      'ابدأ بالمجانية لتجربة Madixo بشكل واضح، ثم انتقل إلى الاحترافية عندما تبدأ بحفظ فرص أكثر والعمل على التحقق والمتابعة بشكل مستمر.',
    draftHint:
      'هذه الصفحة أصبحت مهيأة للدفع الحقيقي عبر Paddle. عند اختيار الاحترافية سيتم فتح Checkout آمن فوق الصفحة الحالية، وتحديث الباقة يتم تلقائيًا عبر webhook بعد نجاح الدفع.',
    currentPlan: 'باقتك الحالية',
    activating: 'جارٍ فتح الدفع الآمن...',
    activeNow: 'مفعلة الآن',
    manageBilling: 'إدارة الاشتراك والفواتير',
    openingBilling: 'جارٍ فتح بوابة الفواتير...',
    downgradeInBilling: 'الرجوع للمجانية من بوابة الفواتير',
    checkoutSuccessPending: 'تمت العملية بنجاح. نحن نحدّث باقتك الآن وقد يستغرق ذلك بضع ثوانٍ.',
    checkoutSuccessDone: 'تم تحديث باقتك بنجاح. تستطيع الآن متابعة العمل داخل Madixo بدون حدود الباقة المجانية.',
    loginRequired: 'يجب تسجيل الدخول أولًا قبل تفعيل الباقة.',
    checkoutNotReady: 'لم يتم تجهيز إعدادات الدفع بعد. أكمل متغيرات البيئة الخاصة بـ Paddle أولًا.',
    limitReasonPrefix: 'سبب فتح هذه الصفحة الآن',
    compareTitle: 'ملخص سريع للفروق بين الباقات',
    compareDescription:
      'هذه الأرقام تعكس الحدود الحالية داخل النسخة الموجودة الآن، وليست وعودًا تسويقية عامة فقط.',
    footerTitle: 'ابدأ بالبسيط أولًا.',
    footerDescription:
      'المجانية مناسبة للتجربة الأولى. وعندما تبدأ بحفظ فرص أكثر والعمل على التحقق بشكل مستمر، تصبح الاحترافية هي الأنسب.',
    footerPrimary: 'حلّل فكرة جديدة',
    footerSecondary: 'افتح لوحة التحكم',
    comparisonHeaders: {
      item: 'العنصر',
      free: 'المجانية',
      pro: 'الاحترافية',
      team: 'الفِرق',
    },
    comparison: [
      {
        label: 'التحليلات',
        free: 'حتى 5 تحليلات',
        pro: 'بدون حد حاليًا',
        team: 'بدون حد حاليًا',
      },
      {
        label: 'الفرص المحفوظة',
        free: 'حتى 3 فرص',
        pro: 'حتى 50 فرصة',
        team: 'حتى 250 فرصة',
      },
      {
        label: 'المقارنة',
        free: 'حتى فرصتين',
        pro: 'حتى 3 فرص',
        team: 'حتى 5 فرص',
      },
      {
        label: 'مساحة التحقق',
        free: 'متاحة',
        pro: 'متاحة بالكامل',
        team: 'متاحة مع خصائص فرق لاحقًا',
      },
      {
        label: 'دراسة الجدوى الأولية',
        free: 'غير متاحة',
        pro: 'متاحة',
        team: 'متاحة',
      },
    ],
    plans: [
      {
        key: 'free',
        name: 'المجانية',
        price: '$0',
        period: 'شهريًا',
        description: 'لمن يريد تجربة Madixo بوضوح قبل الاشتراك.',
        fitTitle: 'مناسبة لهذه المرحلة',
        fitPoints: [
          'التجربة الأولى',
          'اختبار الفكرة قبل الالتزام',
          'مراجعة عدد محدود من الفرص',
        ],
        limitsTitle: 'الحدود الحالية',
        limits: [
          'حتى 5 تحليلات',
          'حتى 3 فرص محفوظة',
          'حتى فرصتين في المقارنة',
        ],
        extrasTitle: 'يشمل أيضًا',
        extras: ['مساحة التحقق', 'لوحة التحكم', 'تصدير PDF للتقرير'],
        cta: 'ابدأ مجانًا',
        note: 'أفضل نقطة بداية للتجربة الأولى.',
      },
      {
        key: 'pro',
        name: 'الاحترافية',
        price: '$39',
        period: 'شهريًا',
        description: 'للمستخدم الجاد الذي يريد استخدام Madixo باستمرار وبحدود أوسع.',
        fitTitle: 'مناسبة لهذه المرحلة',
        fitPoints: [
          'العمل المستمر على عدة فرص',
          'استخدام مساحة التحقق بشكل متكرر',
          'مقارنة أوسع ومتابعة أوضح للاتجاه الحالي',
        ],
        limitsTitle: 'الحدود الحالية',
        limits: [
          'بدون حد تحليلات حاليًا',
          'حتى 50 فرصة محفوظة',
          'حتى 3 فرص في المقارنة',
        ],
        extrasTitle: 'يشمل أيضًا',
        extras: [
          'مسار التحقق الكامل',
          'دراسة الجدوى الأولية',
          'السجل الزمني',
          'تحديث الاتجاه الحالي والخطوة التالية مع أدلة جديدة',
        ],
        cta: 'فعّل الاحترافية',
        highlighted: true,
        badge: 'الباقة الأنسب الآن',
        note: 'الأفضل لمعظم المستخدمين الجادين الآن.',
      },
      {
        key: 'team',
        name: 'الفِرق',
        price: '$99',
        period: 'شهريًا',
        description: 'للفرق التي ستحتاج لاحقًا مساحة عمل مشتركة، وهي باقة ما زالت قيد التجهيز الآن.',
        fitTitle: 'مناسبة لهذه المرحلة',
        fitPoints: [
          'عدة أعضاء على نفس مساحة العمل',
          'تنسيق العمل على فرص متعددة',
          'خصائص تعاون جماعي لاحقًا',
        ],
        limitsTitle: 'الحدود الحالية',
        limits: [
          'بدون حد تحليلات حاليًا',
          'حتى 250 فرصة محفوظة',
          'حتى 5 فرص في المقارنة',
        ],
        extrasTitle: 'الحالة الحالية',
        extras: [
          'دراسة الجدوى الأولية',
          'خصائص تعاون جماعي لاحقًا',
          'ستتوفر بشكل أوسع لاحقًا',
        ],
        cta: 'قريبًا',
        disabled: true,
        badge: 'خارطة الطريق — للفِرق',
        note: 'أبقيناها ظاهرة لتوضيح اتجاه المنتج لاحقًا، لكنها ليست متاحة للبيع بعد.',
      },
    ] as PlanCard[],
  },
  en: {
    eyebrow: 'Plans',
    title: 'Pick the plan that fits your stage right now.',
    description:
      'Start on Free to try Madixo clearly, then move to Pro when you begin saving more opportunities and using validation workflows regularly.',
    draftHint:
      'This page is now prepared for real billing with Paddle. When you choose Pro, a secure checkout opens on top of this page and your plan is updated automatically by webhook after payment succeeds.',
    currentPlan: 'Current plan',
    activating: 'Opening secure checkout...',
    activeNow: 'Active now',
    manageBilling: 'Manage subscription & billing',
    openingBilling: 'Opening billing portal...',
    downgradeInBilling: 'Downgrade from the billing portal',
    checkoutSuccessPending: 'Payment was completed. We are updating your plan now and it may take a few seconds.',
    checkoutSuccessDone: 'Your plan was updated successfully. You can now keep working in Madixo without the free plan limits.',
    loginRequired: 'You need to sign in first before activating a paid plan.',
    checkoutNotReady: 'Billing is not configured yet. Complete the Paddle environment variables first.',
    limitReasonPrefix: 'Why you are seeing this page now',
    compareTitle: 'Quick summary of plan differences',
    compareDescription:
      'These numbers reflect the current limits in this version of the product, not just generic marketing promises.',
    footerTitle: 'Start simple first.',
    footerDescription:
      'Free is a good first trial. Once you begin saving more opportunities and working through validation regularly, Pro becomes the better fit.',
    footerPrimary: 'Analyze a new idea',
    footerSecondary: 'Open dashboard',
    comparisonHeaders: {
      item: 'Item',
      free: 'Free',
      pro: 'Pro',
      team: 'Team',
    },
    comparison: [
      {
        label: 'Analyses',
        free: 'Up to 5 analyses',
        pro: 'No current limit',
        team: 'No current limit',
      },
      {
        label: 'Saved opportunities',
        free: 'Up to 3 saved',
        pro: 'Up to 50 saved',
        team: 'Up to 250 saved',
      },
      {
        label: 'Comparison',
        free: 'Up to 2 reports',
        pro: 'Up to 3 reports',
        team: 'Up to 5 reports',
      },
      {
        label: 'Validation workspace',
        free: 'Included',
        pro: 'Included in full',
        team: 'Included with team features later',
      },
      {
        label: 'Initial feasibility study',
        free: 'Not included',
        pro: 'Included',
        team: 'Included',
      },
    ],
    plans: [
      {
        key: 'free',
        name: 'Free',
        price: '$0',
        period: 'monthly',
        description: 'For someone who wants a clear first look at Madixo before subscribing.',
        fitTitle: 'Best for this stage',
        fitPoints: [
          'First trial',
          'Testing the product before committing',
          'Reviewing a small number of opportunities',
        ],
        limitsTitle: 'Current limits',
        limits: [
          'Up to 5 analyses',
          'Up to 3 saved opportunities',
          'Up to 2 reports in comparison',
        ],
        extrasTitle: 'Also includes',
        extras: ['Validation workspace', 'Dashboard access', 'PDF export for reports'],
        cta: 'Start free',
        note: 'Best starting point for a first trial.',
      },
      {
        key: 'pro',
        name: 'Pro',
        price: '$39',
        period: 'monthly',
        description: 'For a serious user who wants to work in Madixo regularly with wider limits.',
        fitTitle: 'Best for this stage',
        fitPoints: [
          'Working on multiple opportunities continuously',
          'Using the validation workspace regularly',
          'Wider comparison and clearer current-direction tracking',
        ],
        limitsTitle: 'Current limits',
        limits: [
          'No current analysis cap',
          'Up to 50 saved opportunities',
          'Up to 3 reports in comparison',
        ],
        extrasTitle: 'Also includes',
        extras: [
          'Full validation workflow',
          'Initial feasibility study',
          'Timeline',
          'Update the current direction and next step with new evidence',
        ],
        cta: 'Activate Pro',
        highlighted: true,
        badge: 'Best fit right now',
        note: 'Best fit for most serious users right now.',
      },
      {
        key: 'team',
        name: 'Team',
        price: '$99',
        period: 'monthly',
        description: 'For teams that will later need a shared workspace. This plan is still being prepared now.',
        fitTitle: 'Best for this stage',
        fitPoints: [
          'Multiple members in the same workspace',
          'Coordinating work on several opportunities',
          'Team collaboration features later',
        ],
        limitsTitle: 'Current limits',
        limits: [
          'No current analysis cap',
          'Up to 250 saved opportunities',
          'Up to 5 reports in comparison',
        ],
        extrasTitle: 'Current status',
        extras: [
          'Initial feasibility study',
          'Team collaboration features later',
          'Wider release later',
        ],
        cta: 'Coming soon',
        disabled: true,
        badge: 'Roadmap — for teams',
        note: 'It stays visible to show the future product direction, but it is not available for purchase yet.',
      },
    ] as PlanCard[],
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

function readPlanFromCookieClient(): PlanKey {
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

async function fetchCurrentPlanClient(): Promise<CurrentPlanPayload> {
  try {
    const response = await fetch('/api/current-plan', { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      plan?: PlanKey;
      usage?: PlanUsage | null;
      billing?: BillingInfo | null;
    };

    if (response.ok && payload.ok && payload.plan) {
      return {
        plan: payload.plan,
        usage: payload.usage ?? null,
        billing: payload.billing ?? null,
      };
    }
  } catch {
    // fall back to cookie below
  }

  return { plan: readPlanFromCookieClient(), usage: null, billing: null };
}

function getReasonText(reason: string | null, language: UiLanguage) {
  if (language === 'ar') {
    if (reason === 'analysis_limit') {
      return 'استهلكت 5 تحليلات مجانية، لذلك وصلت إلى صفحة الباقات.';
    }

    if (reason === 'reports_limit') {
      return 'وصلت إلى الحد المجاني من الفرص المحفوظة، لذلك وصلت إلى صفحة الباقات.';
    }

    if (reason === 'compare_limit') {
      return 'وصلت إلى حد المقارنة في الباقة المجانية، لذلك وصلت إلى صفحة الباقات.';
    }

    return null;
  }

  if (reason === 'analysis_limit') {
    return 'You used the 5 free analyses, so you were sent to the plans page.';
  }

  if (reason === 'reports_limit') {
    return 'You reached the free saved opportunities limit, so you were sent to the plans page.';
  }

  if (reason === 'compare_limit') {
    return 'You reached the free comparison limit, so you were sent to the plans page.';
  }

  return null;
}

export default function PricingPage() {
  const [uiLang, setUiLang] = useState<UiLanguage>('ar');
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free');
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<PlanKey | null>(null);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setUiLang(getClientUiLanguage('ar'));
    fetchCurrentPlanClient().then((payload) => {
      setCurrentPlan(payload.plan);
      setPlanUsage(payload.usage ?? null);
      setBilling(payload.billing ?? null);
    });
  }, []);

  const copy = COPY[uiLang];
  const reason = searchParams.get('reason');
  const reasonText = getReasonText(reason, uiLang);

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');

    if (checkoutStatus !== 'success') {
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;
    let attempts = 0;

    const poll = async () => {
      const payload = await fetchCurrentPlanClient();

      if (cancelled) {
        return;
      }

      setCurrentPlan(payload.plan);
      setPlanUsage(payload.usage ?? null);
      setBilling(payload.billing ?? null);

      if (payload.plan !== 'free') {
        setCheckoutNotice(uiLang === 'ar' ? COPY.ar.checkoutSuccessDone : COPY.en.checkoutSuccessDone);
        window.history.replaceState({}, '', '/pricing');
        return;
      }

      attempts += 1;
      setCheckoutNotice(uiLang === 'ar' ? COPY.ar.checkoutSuccessPending : COPY.en.checkoutSuccessPending);

      if (attempts < 6) {
        timeoutId = window.setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [searchParams, uiLang]);


  async function handleOpenBillingPortal() {
    try {
      setIsManagingBilling(true);

      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
      });

      const payload = (await response.json().catch(() => ({}))) as BillingPortalResponse;

      if (response.status === 401 && payload.loginRedirect) {
        window.location.assign(payload.loginRedirect);
        return;
      }

      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(
          payload.error ||
            (uiLang === 'ar'
              ? 'تعذر فتح بوابة الفواتير الآن.'
              : 'Could not open the billing portal right now.')
        );
      }

      window.location.assign(payload.url);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : uiLang === 'ar'
            ? 'تعذر فتح بوابة الفواتير الآن.'
            : 'Could not open the billing portal right now.'
      );
    } finally {
      setIsManagingBilling(false);
    }
  }

  async function handleSelectPlan(plan: PlanKey) {
    if (plan === 'team') return;

    if (plan === 'free' && currentPlan !== 'free') {
      await handleOpenBillingPortal();
      return;
    }

    if (plan === 'free') {
      window.location.assign('/dashboard');
      return;
    }

    try {
      setIsSubmitting(plan);

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (response.status === 401 && payload.loginRedirect) {
        window.location.assign(payload.loginRedirect);
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ||
            (uiLang === 'ar'
              ? 'تعذر فتح الدفع الآمن الآن.'
              : 'Could not open secure checkout right now.')
        );
      }

      if (payload.alreadyActive) {
        window.location.assign('/dashboard');
        return;
      }

      if (!payload.checkout) {
        throw new Error(copy.checkoutNotReady);
      }

      setCheckoutNotice(null);
      await openMadixoPaddleCheckout(payload.checkout, uiLang);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : uiLang === 'ar'
            ? 'تعذر فتح الدفع الآمن الآن.'
            : 'Could not open secure checkout right now.'
      );
    } finally {
      setIsSubmitting(null);
    }
  }

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

      <section className="mx-auto mt-6 max-w-7xl rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm md:p-8">
        <span className="inline-flex rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-3 py-1 text-xs font-semibold text-[#6B7280]">
          {copy.eyebrow}
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-6xl">
          {copy.title}
        </h1>

        <p className="mt-4 max-w-4xl text-base leading-8 text-[#4B5563] md:text-lg">
          {copy.description}
        </p>

        <div className="mt-6 rounded-[24px] border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3 text-sm leading-7 text-[#92400E]">
          {copy.draftHint}
        </div>

        {checkoutNotice ? (
          <div className="mt-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-800">
            {checkoutNotice}
          </div>
        ) : null}

        {reasonText ? (
          <div className="mt-4 rounded-[24px] border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-3 text-sm leading-7 text-[#374151]">
            <span className="font-semibold text-[#111827]">{copy.limitReasonPrefix}: </span>
            {reasonText}
          </div>
        ) : null}
        {planUsage ? (
          <div className="mt-4 grid gap-3 rounded-[24px] border border-[#D9E2F0] bg-[#F8FAFD] p-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[#D9E2F0] bg-[#FAFBFD] px-4 py-3">
              <p className="text-xs font-semibold text-[#6B7280]">{uiLang === 'ar' ? 'استهلاك التحليلات' : 'Analysis usage'}</p>
              <p className="mt-2 text-sm font-bold text-[#111827]">
                {planUsage.analysisRunsLimit === null
                  ? uiLang === 'ar'
                    ? `${planUsage.analysisRunsUsed} مستخدمة — بدون حد حاليًا`
                    : `${planUsage.analysisRunsUsed} used — unlimited for now`
                  : `${planUsage.analysisRunsUsed} / ${planUsage.analysisRunsLimit}`}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#D9E2F0] bg-[#FAFBFD] px-4 py-3">
              <p className="text-xs font-semibold text-[#6B7280]">{uiLang === 'ar' ? 'الفرص المحفوظة' : 'Saved opportunities'}</p>
              <p className="mt-2 text-sm font-bold text-[#111827]">
                {planUsage.savedReportsUsed} / {planUsage.savedReportsLimit}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#D9E2F0] bg-[#FAFBFD] px-4 py-3">
              <p className="text-xs font-semibold text-[#6B7280]">{uiLang === 'ar' ? 'حد المقارنة الحالي' : 'Compare limit'}</p>
              <p className="mt-2 text-sm font-bold text-[#111827]">
                {uiLang === 'ar'
                  ? `حتى ${planUsage.compareReportsLimit} ${planUsage.compareReportsLimit === 2 ? 'فرصتين' : 'فرص'}`
                  : `Up to ${planUsage.compareReportsLimit}`}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {copy.plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const isBusy = isSubmitting === plan.key;
            const isDowngradeToFreeAction = plan.key === 'free' && currentPlan !== 'free';
            const showManageBillingButton =
              isCurrent &&
              plan.key !== 'free' &&
              Boolean(billing?.customerId);
            const primaryLabel = plan.disabled
              ? plan.cta
              : isBusy
                ? copy.activating
                : isCurrent
                  ? copy.activeNow
                  : isDowngradeToFreeAction
                    ? copy.downgradeInBilling
                    : plan.cta;
            const sectionContainerClass = plan.highlighted
              ? 'border-white/10 bg-white/5'
              : 'border-[#D9E2F0] bg-[#F7F9FC]';
            const sectionItemClass = plan.highlighted
              ? 'border-white/10 bg-white/5 text-white'
              : 'border-[#D9E2F0] bg-[#FAFBFD] text-[#374151]';
            const sectionHeadingClass = plan.highlighted ? 'text-white' : 'text-[#111827]';

            return (
              <article
                key={plan.key}
                className={[
                  'rounded-[28px] border p-5 shadow-sm transition',
                  plan.highlighted
                    ? 'border-[#111827] bg-[#0F172A] text-white'
                    : 'border-[#E5E7EB] bg-white text-[#111827]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                      plan.highlighted
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#6B7280]',
                    ].join(' ')}
                  >
                    {plan.name}
                  </span>

                  {plan.badge ? (
                    <span
                      className={[
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        plan.highlighted
                          ? 'bg-emerald-400/15 text-emerald-200'
                          : 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]',
                      ].join(' ')}
                    >
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                {isCurrent ? (
                  <div
                    className={[
                      'mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                      plan.highlighted
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : 'bg-emerald-50 text-emerald-700',
                    ].join(' ')}
                  >
                    {copy.currentPlan}: {plan.name}
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span
                      className={
                        plan.highlighted ? 'text-sm text-white/70' : 'text-sm text-[#6B7280]'
                      }
                    >
                      {plan.period}
                    </span>
                  </div>

                  <p
                    className={[
                      'mt-3 text-sm leading-7',
                      plan.highlighted ? 'text-white/80' : 'text-[#4B5563]',
                    ].join(' ')}
                  >
                    {plan.description}
                  </p>
                </div>

                {plan.note ? (
                  <div
                    className={[
                      'mt-4 rounded-[18px] border px-4 py-3 text-xs leading-6',
                      plan.highlighted
                        ? 'border-white/10 bg-white/5 text-white/80'
                        : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#6B7280]',
                    ].join(' ')}
                  >
                    {plan.note}
                  </div>
                ) : null}

                <div className={['mt-5 rounded-[22px] border p-4', sectionContainerClass].join(' ')}>
                  <h2 className={['text-sm font-bold', sectionHeadingClass].join(' ')}>
                    {plan.fitTitle}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {plan.fitPoints.map((item) => (
                      <div
                        key={item}
                        className={[
                          'rounded-[16px] border px-3 py-2 text-sm leading-6',
                          sectionItemClass,
                        ].join(' ')}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={['mt-4 rounded-[22px] border p-4', sectionContainerClass].join(' ')}>
                  <h2 className={['text-sm font-bold', sectionHeadingClass].join(' ')}>
                    {plan.limitsTitle}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {plan.limits.map((item) => (
                      <div
                        key={item}
                        className={[
                          'rounded-[16px] border px-3 py-2 text-sm leading-6',
                          sectionItemClass,
                        ].join(' ')}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={['mt-4 rounded-[22px] border p-4', sectionContainerClass].join(' ')}>
                  <h2 className={['text-sm font-bold', sectionHeadingClass].join(' ')}>
                    {plan.extrasTitle}
                  </h2>
                  <div className="mt-3 space-y-2">
                    {plan.extras.map((item) => (
                      <div
                        key={item}
                        className={[
                          'rounded-[16px] border px-3 py-2 text-sm leading-6',
                          sectionItemClass,
                        ].join(' ')}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {plan.disabled ? (
                    <button
                      type="button"
                      disabled
                      className={[
                        'inline-flex rounded-full px-5 py-3 text-sm font-semibold opacity-60',
                        plan.highlighted
                          ? 'border border-white/20 bg-white/10 text-white'
                          : 'border border-[#D9E2F0] bg-[#F8FAFD] text-[#6B7280]',
                      ].join(' ')}
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={isBusy}
                      className={[
                        'inline-flex rounded-full px-5 py-3 text-sm font-semibold transition',
                        plan.highlighted
                          ? 'border border-[#111827] bg-white text-[#111827] hover:opacity-90'
                          : 'border border-[#111827] bg-[#111827] text-white hover:opacity-90',
                      ].join(' ')}
                    >
                      {primaryLabel}
                    </button>
                  )}

                  {showManageBillingButton ? (
                    <button
                      type="button"
                      onClick={handleOpenBillingPortal}
                      disabled={isManagingBilling}
                      className={[
                        'inline-flex rounded-full px-5 py-3 text-sm font-semibold transition',
                        plan.highlighted
                          ? 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
                          : 'border border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]',
                      ].join(' ')}
                    >
                      {isManagingBilling ? copy.openingBilling : copy.manageBilling}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-[#111827] md:text-3xl">{copy.compareTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4B5563] md:text-base">
          {copy.compareDescription}
        </p>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E5E7EB]">
          <div className="grid grid-cols-4 border-b border-[#D9E2F0] bg-[#F8FAFD] text-sm font-semibold text-[#111827]">
            <div className="px-4 py-3">{copy.comparisonHeaders.item}</div>
            <div className="px-4 py-3">{copy.comparisonHeaders.free}</div>
            <div className="px-4 py-3">{copy.comparisonHeaders.pro}</div>
            <div className="px-4 py-3">{copy.comparisonHeaders.team}</div>
          </div>

          {copy.comparison.map((row, index) => (
            <div
              key={row.label}
              className={[
                'grid grid-cols-4 text-sm leading-7',
                index !== copy.comparison.length - 1 ? 'border-b border-[#E5E7EB]' : '',
              ].join(' ')}
            >
              <div className="bg-[#FAFBFD] px-4 py-3 font-semibold text-[#111827]">{row.label}</div>
              <div className="bg-[#FAFBFD] px-4 py-3 text-[#374151]">{row.free}</div>
              <div className="bg-[#FAFBFD] px-4 py-3 text-[#374151]">{row.pro}</div>
              <div className="bg-[#FAFBFD] px-4 py-3 text-[#374151]">{row.team}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl rounded-[32px] border border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-sm md:p-8">
        <h2 className="text-2xl font-bold md:text-3xl">{copy.footerTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
          {copy.footerDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:opacity-90"
          >
            {copy.footerPrimary}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            {copy.footerSecondary}
          </Link>
        </div>
      </section>
      <SiteFooter uiLang={uiLang} />
    </main>
  );
}
