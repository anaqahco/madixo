import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getComparisonsBySlugs,
  getPostsBySlugs,
  getUseCaseBySlug,
  getUseCasesBySlugs,
  localizeText,
} from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import UseCaseDetailPageClient from '@/components/use-case-detail-page';

type Params = Promise<{ slug: string }>;

const relatedUseCaseMap: Record<string, string[]> = {
  'madixo-for-first-time-founders': ['madixo-for-service-businesses'],
  'madixo-for-service-businesses': ['madixo-for-first-time-founders'],
  'madixo-for-agencies-and-consultants': ['madixo-for-service-businesses'],
  'madixo-for-ecommerce-and-product-ideas': ['madixo-for-first-time-founders'],
};

const relatedComparisonMap: Record<string, string[]> = {
  'madixo-for-first-time-founders': [
    'madixo-vs-asking-chatgpt-only',
    'madixo-vs-feasibility-template-spreadsheets',
  ],
  'madixo-for-service-businesses': [
    'madixo-vs-feasibility-template-spreadsheets',
    'madixo-vs-generic-market-research-notes',
  ],
  'madixo-for-agencies-and-consultants': [
    'madixo-vs-asking-chatgpt-only',
    'madixo-vs-generic-market-research-notes',
  ],
  'madixo-for-ecommerce-and-product-ideas': [
    'madixo-vs-feasibility-template-spreadsheets',
    'madixo-vs-generic-market-research-notes',
  ],
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getUseCaseBySlug(slug);

  if (!page) return { title: 'Use case not found' };

  return {
    title: page.title.en,
    description: page.seoDescription.en,
    keywords: [
      page.title.en,
      page.industry.en,
      'Madixo use case',
      'business idea validation',
      'early feasibility',
    ],
    alternates: {
      canonical: `/use-cases/${page.slug}`,
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
      url: buildAbsoluteAppUrl(`/use-cases/${page.slug}`),
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
  };
}

export default async function UseCaseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getUseCaseBySlug(slug);
  if (!page) notFound();

  const relatedPosts = getPostsBySlugs(page.relatedPosts);
  const relatedUseCases = getUseCasesBySlugs(relatedUseCaseMap[page.slug] ?? []).filter(
    (item) => item.slug !== page.slug,
  );
  const relatedComparisons = getComparisonsBySlugs(relatedComparisonMap[page.slug] ?? []);
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
        url: buildAbsoluteAppUrl(`/use-cases/${page.slug}`),
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: buildAbsoluteAppUrl('/brand/madixo-logo.png'),
        },
        isPartOf: {
          '@type': 'CollectionPage',
          name: uiLang === 'ar' ? 'حالات استخدام Madixo' : 'Madixo Use Cases',
          url: buildAbsoluteAppUrl('/use-cases'),
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
            name: uiLang === 'ar' ? 'حالات الاستخدام' : 'Use Cases',
            item: buildAbsoluteAppUrl('/use-cases'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pageTitle,
            item: buildAbsoluteAppUrl(`/use-cases/${page.slug}`),
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
      <UseCaseDetailPageClient
        page={page}
        relatedPosts={relatedPosts}
        relatedUseCases={relatedUseCases}
        relatedComparisons={relatedComparisons}
      />
    </>
  );
}
