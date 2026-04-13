import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import PricingPageClient from '@/components/pricing-page-client';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export const metadata: Metadata = {
  title: 'Pricing | Plans for Business Idea Validation and Feasibility',
  description:
    'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
  keywords: [
    'Madixo pricing',
    'business idea validation pricing',
    'feasibility study tool pricing',
    'startup validation software pricing',
    'Madixo free vs pro',
  ],
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Madixo Pricing | Plans for Business Idea Validation and Feasibility',
    description:
      'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
    url: buildAbsoluteAppUrl('/pricing'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo Pricing | Plans for Business Idea Validation and Feasibility',
    description:
      'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
  },
};

function getPricingFaq(language: 'ar' | 'en') {
  return language === 'ar'
    ? [
        {
          question: 'ماذا تتضمن الباقة المجانية؟',
          answer:
            'الباقة المجانية مناسبة لتجربة تحليل الفرصة بشكل أولي، مع حدود استخدام بسيطة قبل الانتقال إلى التحقق والعمل الأعمق.',
        },
        {
          question: 'هل تشمل Pro دراسة الجدوى الأولية؟',
          answer:
            'نعم. باقة Pro مخصصة للعمل الأعمق وتشمل دراسة الجدوى الأولية ومساحة التحقق وحفظ الفرص واستخدامًا مستمرًا أكثر.',
        },
        {
          question: 'هل باقة Team متاحة الآن؟',
          answer:
            'حاليًا Team ما زالت في وضع Coming Soon. وجودها يوضح اتجاه المنتج مستقبلًا، لكن الإطلاق الأساسي الآن يركز على Free وPro.',
        },
      ]
    : [
        {
          question: 'What is included in the Free plan?',
          answer:
            'The Free plan is built for first-pass opportunity analysis, with a small usage limit for testing the workflow before deeper validation work.',
        },
        {
          question: 'Does Pro include the feasibility study?',
          answer:
            'Yes. Pro is the path for deeper work, including early feasibility, validation workspace access, saved opportunities, and more continuous usage.',
        },
        {
          question: 'Is Team available now?',
          answer:
            'Team is currently positioned as coming soon. The visible plan helps explain the future direction, but the core launch focus remains Free and Pro.',
        },
      ];
}

export default async function PricingPage() {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const faqItems = getPricingFaq(uiLang);
  const planNames = uiLang === 'ar' ? ['المجانية', 'الاحترافية', 'الفِرق'] : ['Free', 'Pro', 'Team'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Madixo',
            item: buildAbsoluteAppUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: uiLang === 'ar' ? 'الباقات' : 'Pricing',
            item: buildAbsoluteAppUrl('/pricing'),
          },
        ],
      },
      {
        '@type': 'Service',
        '@id': buildAbsoluteAppUrl('/pricing#service'),
        name: 'Madixo',
        serviceType:
          uiLang === 'ar'
            ? 'تحليل الفرص واختبار الفكرة ودراسة الجدوى الأولية'
            : 'Opportunity analysis, idea validation, and early feasibility',
        provider: {
          '@type': 'Organization',
          name: 'Madixo',
          url: buildAbsoluteAppUrl('/'),
        },
        areaServed: 'Worldwide',
        url: buildAbsoluteAppUrl('/pricing'),
      },
      {
        '@type': 'ItemList',
        '@id': buildAbsoluteAppUrl('/pricing#plans'),
        itemListElement: planNames.map((name, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          url: buildAbsoluteAppUrl('/pricing'),
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': buildAbsoluteAppUrl('/pricing#faq'),
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingPageClient />
    </>
  );
}
