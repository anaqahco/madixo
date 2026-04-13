import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getPostsBySlugs, getUseCases, localizeText } from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import UseCasesPageClient from '@/components/use-cases-page';

export const metadata: Metadata = {
  title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
  description:
    'Explore real Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas to understand where opportunity analysis, early feasibility, and validation fit best.',
  alternates: {
    canonical: '/use-cases',
  },
  openGraph: {
    title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
    description:
      'See practical Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas.',
    url: buildAbsoluteAppUrl('/use-cases'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
    description:
      'See practical Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas.',
  },
  keywords: [
    'Madixo use cases',
    'business idea validation tool',
    'early feasibility tool',
    'startup idea analysis use cases',
    'founder validation workflow',
  ],
};

const featuredPostSlugs = [
  'how-to-choose-your-best-first-customer',
  'difference-between-opportunity-analysis-and-feasibility-study',
  'how-to-know-if-market-demand-is-real',
];

export default async function UseCasesPage() {
  const items = getUseCases();
  const featuredPosts = getPostsBySlugs(featuredPostSlugs);
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: uiLang === 'ar' ? 'حالات استخدام Madixo' : 'Madixo Use Cases',
        url: buildAbsoluteAppUrl('/use-cases'),
        description:
          uiLang === 'ar'
            ? 'أمثلة عملية على كيفية استخدام Madixo لتحليل الفرصة ودراسة الجدوى الأولية ومسار التحقق.'
            : 'Practical examples of how Madixo is used for opportunity analysis, early feasibility, and validation.',
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
            name: uiLang === 'ar' ? 'حالات الاستخدام' : 'Use Cases',
            item: buildAbsoluteAppUrl('/use-cases'),
          },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: items.slice(0, 8).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteAppUrl(`/use-cases/${item.slug}`),
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
                ? 'متى أفتح صفحة حالة استخدام بدل مقال؟'
                : 'When should I open a use case page instead of an article?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                uiLang === 'ar'
                  ? 'عندما يكون سؤالك ليس ما هي الفكرة فقط، بل كيف يمكن استخدام Madixo مع نوع مشروعك أو مرحلتك الحالية عمليًا.'
                  : 'Use a use case page when your question is not only what the idea is, but how Madixo fits your project type or current stage in practice.',
            },
          },
          {
            '@type': 'Question',
            name:
              uiLang === 'ar'
                ? 'هل صفحات حالات الاستخدام مناسبة قبل الاشتراك؟'
                : 'Are use case pages useful before subscribing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                uiLang === 'ar'
                  ? 'نعم، لأنها تشرح متى يكون Madixo مناسبًا لك، وما المسار المتوقع من التحليل إلى الجدوى الأولية إلى التحقق.'
                  : 'Yes. They explain when Madixo is a fit for you and what the expected flow looks like from analysis to early feasibility to validation.',
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
      <UseCasesPageClient items={items} featuredPosts={featuredPosts} />
    </>
  );
}
