import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getComparisons, getPostsBySlugs, localizeText } from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import ComparisonsPageClient from '@/components/comparisons-page';

export const metadata: Metadata = {
  title: 'Madixo Comparisons | Compare Madixo with Common Alternatives',
  description:
    'Compare Madixo with asking ChatGPT only, spreadsheet feasibility templates, and generic market research notes to see where structured opportunity analysis and validation fit better.',
  alternates: {
    canonical: '/compare-to',
  },
  openGraph: {
    title: 'Madixo Comparisons | Compare Madixo with Common Alternatives',
    description:
      'Compare Madixo with common alternatives and see when a structured validation workflow is a better fit for business idea decisions.',
    url: buildAbsoluteAppUrl('/compare-to'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo Comparisons | Compare Madixo with Common Alternatives',
    description:
      'Compare Madixo with common alternatives and see when a structured validation workflow is a better fit for business idea decisions.',
  },
  keywords: [
    'Madixo comparisons',
    'Madixo vs ChatGPT',
    'Madixo vs spreadsheet templates',
    'business idea validation comparison',
    'opportunity analysis tool comparison',
  ],
};

const featuredPostSlugs = [
  'when-to-use-madixo-instead-of-asking-chatgpt-only',
  'difference-between-opportunity-analysis-and-feasibility-study',
  'how-to-document-market-notes-that-improve-decisions',
];

export default async function ComparisonsPage() {
  const items = getComparisons();
  const featuredPosts = getPostsBySlugs(featuredPostSlugs);
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: uiLang === 'ar' ? 'مقارنات Madixo' : 'Madixo Comparisons',
        url: buildAbsoluteAppUrl('/compare-to'),
        description:
          uiLang === 'ar'
            ? 'مقارنات تساعدك على فهم كيف يختلف Madixo عن البدائل الشائعة عند تحليل الفكرة واتخاذ القرار.'
            : 'Comparison pages that explain how Madixo differs from common alternatives for idea analysis and decision-making.',
      },
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
            name: uiLang === 'ar' ? 'المقارنات' : 'Comparisons',
            item: buildAbsoluteAppUrl('/compare-to'),
          },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteAppUrl(`/compare-to/${item.slug}`),
          name: localizeText(item.title, uiLang),
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name:
              uiLang === 'ar'
                ? 'متى أقرأ صفحة مقارنة بدل مقال عادي؟'
                : 'When should I read a comparison page instead of a normal article?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                uiLang === 'ar'
                  ? 'عندما تكون المفاضلة بين Madixo وبين بديل قريب هي السؤال الأساسي لديك، مثل الاكتفاء بسؤال ChatGPT أو استخدام جدول تقليدي أو الاكتفاء بملاحظات سوق عامة.'
                  : 'Use a comparison page when your main question is choosing between Madixo and an adjacent alternative such as asking ChatGPT only, using a spreadsheet template, or keeping generic market notes.',
            },
          },
          {
            '@type': 'Question',
            name:
              uiLang === 'ar'
                ? 'هل صفحات المقارنات مناسبة قبل الشراء؟'
                : 'Are comparison pages useful before buying?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                uiLang === 'ar'
                  ? 'نعم، لأنها تختصر لك متى يكون Madixo أقوى، ومتى قد لا يكون الأنسب، ثم تربطك بمقالات وحالات استخدام وباقات قبل اتخاذ قرار الاشتراك.'
                  : 'Yes. They show when Madixo is stronger, when it may not be the best fit, and then connect you to articles, use cases, and plans before you decide to subscribe.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComparisonsPageClient items={items} featuredPosts={featuredPosts} />
    </>
  );
}
