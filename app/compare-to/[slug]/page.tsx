import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getComparisonBySlug,
  getComparisonsBySlugs,
  getPostsBySlugs,
  getUseCasesBySlugs,
  localizeText,
} from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import ComparisonDetailPageClient from '@/components/comparison-detail-page';

type Params = Promise<{ slug: string }>;

const relatedUseCaseMap: Record<string, string[]> = {
  'madixo-vs-asking-chatgpt-only': [
    'madixo-for-first-time-founders',
    'madixo-for-agencies-and-consultants',
  ],
  'madixo-vs-feasibility-template-spreadsheets': [
    'madixo-for-service-businesses',
    'madixo-for-ecommerce-and-product-ideas',
  ],
  'madixo-vs-generic-market-research-notes': [
    'madixo-for-service-businesses',
    'madixo-for-first-time-founders',
  ],
};

const relatedComparisonMap: Record<string, string[]> = {
  'madixo-vs-asking-chatgpt-only': ['madixo-vs-feasibility-template-spreadsheets'],
  'madixo-vs-feasibility-template-spreadsheets': ['madixo-vs-generic-market-research-notes'],
  'madixo-vs-generic-market-research-notes': ['madixo-vs-asking-chatgpt-only'],
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);

  if (!page) return { title: 'Comparison not found' };

  const keywordSeed = page.title.en
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: page.title.en,
    description: page.seoDescription.en,
    alternates: {
      canonical: `/compare-to/${page.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: page.title.en,
      description: page.seoDescription.en,
      url: buildAbsoluteAppUrl(`/compare-to/${page.slug}`),
      type: 'article',
      images: [
        {
          url: buildAbsoluteAppUrl('/brand/madixo-logo.png'),
          width: 1200,
          height: 630,
          alt: page.title.en,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title.en,
      description: page.seoDescription.en,
      images: [buildAbsoluteAppUrl('/brand/madixo-logo.png')],
    },
    keywords: [
      ...keywordSeed,
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
  const relatedUseCases = getUseCasesBySlugs(relatedUseCaseMap[page.slug] ?? []);
  const relatedComparisons = getComparisonsBySlugs(relatedComparisonMap[page.slug] ?? []).filter(
    (item) => item.slug !== page.slug,
  );
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
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: buildAbsoluteAppUrl('/brand/madixo-logo.png'),
        },
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
      <ComparisonDetailPageClient
        page={page}
        relatedPosts={relatedPosts}
        relatedUseCases={relatedUseCases}
        relatedComparisons={relatedComparisons}
      />
    </>
  );
}
