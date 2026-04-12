import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getBlogPostBySlug,
  getComparisonsBySlugs,
  getPostsBySlugs,
  getUseCasesBySlugs,
  localizeText,
} from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import BlogPostPageClient from '@/components/blog-post-page';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found' };
  }

  return {
    title: post.title.en,
    description: post.seoDescription.en,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title.en,
      description: post.seoDescription.en,
      url: buildAbsoluteAppUrl(`/blog/${post.slug}`),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title.en,
      description: post.seoDescription.en,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const relatedPosts = getPostsBySlugs(post.relatedPosts).filter((item) => item.slug !== post.slug);
  const relatedUseCases = getUseCasesBySlugs(post.relatedUseCases);
  const relatedComparisons = getComparisonsBySlugs(post.relatedComparisons);

  const articleTitle = localizeText(post.title, uiLang);
  const articleDescription = localizeText(post.seoDescription, uiLang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: articleTitle,
        description: articleDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: uiLang === 'ar' ? 'ar' : 'en',
        mainEntityOfPage: buildAbsoluteAppUrl(`/blog/${post.slug}`),
        url: buildAbsoluteAppUrl(`/blog/${post.slug}`),
        author: {
          '@type': 'Organization',
          name: 'Madixo',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Madixo',
          logo: {
            '@type': 'ImageObject',
            url: buildAbsoluteAppUrl('/brand/madixo-logo.png'),
          },
        },
        articleSection: post.coverEyebrow[uiLang],
        keywords: post.keywords.join(', '),
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
            name: uiLang === 'ar' ? 'المدونة' : 'Blog',
            item: buildAbsoluteAppUrl('/blog'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: articleTitle,
            item: buildAbsoluteAppUrl(`/blog/${post.slug}`),
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
      <BlogPostPageClient
        post={post}
        relatedPosts={relatedPosts}
        relatedUseCases={relatedUseCases}
        relatedComparisons={relatedComparisons}
      />
    </>
  );
}
