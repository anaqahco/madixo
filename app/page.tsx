import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import HomePageClient from '@/components/home-page-client';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export const metadata: Metadata = {
  title: 'Madixo — Stop Guessing. Start Validating Your Business Idea.',
  description:
    'Madixo is an AI workspace that validates business ideas with structured analysis, early feasibility studies, and evidence-based decision making. Arabic and English.',
  keywords: [
    'business idea validation',
    'feasibility study software',
    'startup idea analysis',
    'validation plan tool',
    'AI business analysis',
    'idea testing',
    'تحليل فكرة مشروع',
    'دراسة جدوى أولية',
    'اختبار فكرة مشروع',
    'خطة تحقق',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Madixo — Stop Guessing. Start Validating Your Business Idea.',
    description:
      'AI workspace for business idea validation. Structured analysis, feasibility studies, and evidence-based decisions. Arabic and English.',
    url: buildAbsoluteAppUrl('/'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo — Stop Guessing. Start Validating Your Business Idea.',
    description:
      'AI workspace for business idea validation. Structured analysis, feasibility studies, and evidence-based decisions. Arabic and English.',
  },
};

function getHomeFaq(language: 'ar' | 'en') {
  return language === 'ar'
    ? [
        {
          question: 'وش هو Madixo بالضبط؟',
          answer:
            'Madixo مساحة عمل تاخذ فكرة مشروعك من مفهوم خام إلى قرار مبني على أدلة. يجمع بين تحليل الفرصة ودراسة الجدوى الأولية ومساحة التحقق والاختبار والخطوة التالية — كلها في مكان واحد.',
        },
        {
          question: 'هل Madixo مجرد مولد أفكار؟',
          answer:
            'لا. Madixo ما يولّد أفكار. يختبر الأفكار اللي عندك عبر تحليل منظم وتقييم جدوى وجمع أدلة ومتابعة القرار.',
        },
        {
          question: 'وش الفرق بينه وبين سؤال ChatGPT؟',
          answer:
            'ChatGPT يعطيك إجابة وحدة وتضيع. Madixo يحفظ تحليلك ويتتبع أدلتك مع الوقت ويبني دراسات جدوى ويساعدك تقرر هل تكمل أو تعدّل أو توقف — داخل مساحة عمل دائمة.',
        },
      ]
    : [
        {
          question: 'What exactly is Madixo?',
          answer:
            'Madixo is a workspace that takes your business idea from raw concept to validated decision. It combines opportunity analysis, early feasibility, a validation workspace for testing, and evidence-based next moves — all in one place.',
        },
        {
          question: 'Is Madixo just an idea generator?',
          answer:
            'No. Madixo does not generate ideas. It validates the ideas you already have through structured analysis, feasibility assessment, evidence capture, and decision tracking.',
        },
        {
          question: 'How is this different from asking ChatGPT?',
          answer:
            'ChatGPT gives you a one-time answer that disappears. Madixo saves your analysis, tracks your evidence over time, generates feasibility studies, and helps you decide whether to continue, pivot, or stop — inside a persistent workspace.',
        },
      ];
}


function getHomeCollections(language: 'ar' | 'en') {
  return language === 'ar'
    ? [
        {
          name: 'المقالات',
          description: 'تعلم كيف تحلل الفكرة وتختبر الطلب وتفهم الجدوى الأولية.',
          url: buildAbsoluteAppUrl('/blog'),
        },
        {
          name: 'المقارنات',
          description: 'قارن Madixo بالبدائل الشائعة قبل أن تقرر الأداة الأنسب.',
          url: buildAbsoluteAppUrl('/compare-to'),
        },
        {
          name: 'حالات الاستخدام',
          description: 'شاهد أمثلة عملية لكيف يستخدم Madixo حسب نوع المشروع.',
          url: buildAbsoluteAppUrl('/use-cases'),
        },
        {
          name: 'الباقات',
          description: 'افهم الفرق بين الخطط وما الذي يفتحه كل اشتراك.',
          url: buildAbsoluteAppUrl('/pricing'),
        },
      ]
    : [
        {
          name: 'Articles',
          description: 'Learn how to validate ideas, test demand, and understand early feasibility.',
          url: buildAbsoluteAppUrl('/blog'),
        },
        {
          name: 'Comparisons',
          description: 'Compare Madixo with common alternatives before you choose a workflow.',
          url: buildAbsoluteAppUrl('/compare-to'),
        },
        {
          name: 'Use Cases',
          description: 'See practical examples of how Madixo fits different business situations.',
          url: buildAbsoluteAppUrl('/use-cases'),
        },
        {
          name: 'Pricing',
          description: 'Understand what each plan unlocks and which workflow depth fits you.',
          url: buildAbsoluteAppUrl('/pricing'),
        },
      ];
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const faqItems = getHomeFaq(uiLang);
  const collections = getHomeCollections(uiLang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': buildAbsoluteAppUrl('/#organization'),
        name: 'Madixo',
        url: buildAbsoluteAppUrl('/'),
        logo: buildAbsoluteAppUrl('/brand/madixo-logo.png'),
      },
      {
        '@type': 'WebSite',
        '@id': buildAbsoluteAppUrl('/#website'),
        name: 'Madixo',
        url: buildAbsoluteAppUrl('/'),
        inLanguage: uiLang === 'ar' ? 'ar' : 'en',
      },
      {
        '@type': 'WebPage',
        '@id': buildAbsoluteAppUrl('/#webpage'),
        name: uiLang === 'ar' ? 'Madixo | الصفحة الرئيسية' : 'Madixo | Home',
        url: buildAbsoluteAppUrl('/'),
        inLanguage: uiLang === 'ar' ? 'ar' : 'en',
        about: {
          '@id': buildAbsoluteAppUrl('/#software'),
        },
      },
      {
        '@type': 'ItemList',
        '@id': buildAbsoluteAppUrl('/#home-paths'),
        name: uiLang === 'ar' ? 'مسارات البداية داخل Madixo' : 'Start paths inside Madixo',
        itemListElement: collections.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
          description: item.description,
        })),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': buildAbsoluteAppUrl('/#software'),
        name: 'Madixo',
        url: buildAbsoluteAppUrl('/'),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          uiLang === 'ar'
            ? 'مساحة عمل لتحليل الفرص واختبار أفكار المشاريع ودراسة الجدوى الأولية ومسار التحقق وجمع الأدلة.'
            : 'A workspace for business idea validation, opportunity analysis, early feasibility, validation workflow, and evidence capture.',
      },
      {
        '@type': 'FAQPage',
        '@id': buildAbsoluteAppUrl('/#faq'),
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
      <HomePageClient />
    </>
  );
}
