import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostsBySlugs, getUseCaseBySlug, localizeText } from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import UseCaseDetailPageClient from '@/components/use-case-detail-page';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getUseCaseBySlug(slug);

  if (!page) return { title: 'Use case not found' };

  return {
    title: page.title.en,
    description: page.seoDescription.en,
    alternates: {
      canonical: `/use-cases/${page.slug}`,
    },
    openGraph: {
      title: page.title.en,
      description: page.seoDescription.en,
      url: buildAbsoluteAppUrl(`/use-cases/${page.slug}`),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title.en,
      description: page.seoDescription.en,
    },
    keywords: [
      ...page.title.en.split(' '),
      'Madixo use case',
      'business idea validation workflow',
      'early feasibility use case',
    ],
  };
}

export default async function UseCaseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getUseCaseBySlug(slug);
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
        url: buildAbsoluteAppUrl(`/use-cases/${page.slug}`),
        about: localizeText(page.industry, uiLang),
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
      <UseCaseDetailPageClient page={page} relatedPosts={relatedPosts} />
    </>
  );
}
