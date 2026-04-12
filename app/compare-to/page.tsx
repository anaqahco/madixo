import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getComparisons, localizeText } from '@/lib/blog';
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

export default async function ComparisonsPage() {
  const items = getComparisons();
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComparisonsPageClient items={items} />
    </>
  );
}
