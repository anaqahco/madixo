import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import HomePageClient from '@/components/home-page-client';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export const metadata: Metadata = {
  title: 'AI Business Idea Validation & Feasibility Workspace',
  description:
    'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
  keywords: [
    'business idea validation',
    'feasibility study software',
    'startup idea analysis',
    'validation plan tool',
    'AI business analysis',
    'تحليل فكرة مشروع',
    'دراسة جدوى أولية',
    'خطة تحقق',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Madixo | AI Business Idea Validation & Feasibility Workspace',
    description:
      'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
    url: buildAbsoluteAppUrl('/'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo | AI Business Idea Validation & Feasibility Workspace',
    description:
      'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
  },
};

function getHomeFaq(language: 'ar' | 'en') {
  return language === 'ar'
    ? [
        {
          question: 'ما هو Madixo بالضبط؟',
          answer:
            'Madixo هو مساحة عمل لتحليل الفرص واختبار أفكار المشاريع. يساعدك على فهم الفكرة، توليد قراءة جدوى أولية، بناء خطة تحقق، وتوثيق الأدلة قبل اتخاذ قرار التنفيذ.',
        },
        {
          question: 'هل Madixo مجرد أداة لتوليد الأفكار؟',
          answer:
            'Madixo ليس مجرد مولد أفكار، بل مساحة عمل لتحليل الفرص، ودراسة الجدوى الأولية، ومساحة التحقق، وجمع الأدلة، وتحديد الخطوة التالية.',
        },
        {
          question: 'ماذا يحدث بعد تحليل الفرصة؟',
          answer:
            'بعد تقرير التحليل يمكنك الانتقال إلى دراسة الجدوى الأولية، ثم مساحة التحقق، ثم توثيق الأدلة والمقابلات والاعتراضات، ثم تحديث الاتجاه الحالي والخطوة التالية.',
        },
      ]
    : [
        {
          question: 'What exactly is Madixo?',
          answer:
            'Madixo is a workspace for opportunity analysis and business idea validation. It helps you understand an idea, generate an early feasibility view, build a validation plan, and capture evidence before you commit.',
        },
        {
          question: 'Is Madixo just an idea generator?',
          answer:
            'Madixo is not just an idea generator. It is built for opportunity analysis, early feasibility, validation workflow, evidence capture, and choosing the next practical move.',
        },
        {
          question: 'What happens after the opportunity analysis?',
          answer:
            'After the report, you can move into early feasibility, then into the validation workspace, then log interviews, objections, and signals, and finally update the current direction and next move.',
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
