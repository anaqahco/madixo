import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getComparisonBySlug, getPostsBySlugs, localizeText } from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import ComparisonDetailPageClient from '@/components/comparison-detail-page';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);

  if (!page) return { title: 'Comparison not found' };

  return {
    title: page.title.en,
    description: page.seoDescription.en,
    alternates: {
      canonical: `/compare-to/${page.slug}`,
    },
    openGraph: {
      title: page.title.en,
      description: page.seoDescription.en,
      url: buildAbsoluteAppUrl(`/compare-to/${page.slug}`),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title.en,
      description: page.seoDescription.en,
    },
    keywords: [
      ...page.title.en.split(' '),
      'Madixo comparison',
      'business idea validation',
      'opportunity analysis',
    ],
  };
}

export default async function ComparisonDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);
  if (!page) notFound();

  const relatedPosts = getPostsBySlugs(page.relatedPosts);
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const pageTitle = localizeText(page.title, uiLang);
  const pageDescription = localizeText(page.seoDescription, uiLang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: pageTitle,
        description: pageDescription,
        url: buildAbsoluteAppUrl(`/compare-to/${page.slug}`),
        about: localizeText(page.compareAgainst, uiLang),
        isPartOf: {
          '@type': 'CollectionPage',
          name: uiLang === 'ar' ? 'مقارنات Madixo' : 'Madixo Comparisons',
          url: buildAbsoluteAppUrl('/compare-to'),
        },
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
          {
            '@type': 'ListItem',
            position: 3,
            name: pageTitle,
            item: buildAbsoluteAppUrl(`/compare-to/${page.slug}`),
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
      <ComparisonDetailPageClient page={page} relatedPosts={relatedPosts} />
    </>
  );
}
