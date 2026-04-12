import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import {
  BLOG_CATEGORIES,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  localizeText,
  type ContentCategory,
} from '@/lib/blog';
import { buildAbsoluteAppUrl } from '@/lib/app-url';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import BlogIndexPageClient from '@/components/blog-index-page';

export const metadata: Metadata = {
  title: 'Madixo Blog | Business Idea Validation, Feasibility, and Market Learning',
  description:
    'Read practical articles about validating business ideas, understanding market demand, early feasibility studies, and using Madixo to make clearer startup decisions.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Madixo Blog | Business Idea Validation, Feasibility, and Market Learning',
    description:
      'Practical guides on business idea validation, market demand, early feasibility, and clearer next-step decisions.',
    url: buildAbsoluteAppUrl('/blog'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo Blog | Business Idea Validation, Feasibility, and Market Learning',
    description:
      'Practical guides on business idea validation, market demand, early feasibility, and clearer next-step decisions.',
  },
  keywords: [
    'Madixo blog',
    'business idea validation',
    'early feasibility study',
    'market demand',
    'startup idea analysis',
    'validate a business idea',
  ],
};

type SearchParams = Promise<{ category?: string }>;

function isCategory(value: string | undefined): value is ContentCategory {
  return Boolean(value && BLOG_CATEGORIES.includes(value as ContentCategory));
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedCategory = isCategory(params.category) ? params.category : 'all';
  const featuredPosts = getFeaturedBlogPosts().slice(0, 3);
  const posts = getBlogPostsByCategory(selectedCategory);
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: uiLang === 'ar' ? 'مدونة Madixo' : 'Madixo Blog',
        url: buildAbsoluteAppUrl('/blog'),
        description:
          uiLang === 'ar'
            ? 'مقالات عملية عن اختبار الفكرة وفهم السوق ودراسة الجدوى الأولية واتخاذ القرار.'
            : 'Practical articles about idea validation, market demand, early feasibility, and clearer decisions.',
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
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: posts.slice(0, 8).map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteAppUrl(`/blog/${post.slug}`),
          name: localizeText(post.title, uiLang),
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
      <BlogIndexPageClient
        selectedCategory={selectedCategory}
        featuredPosts={featuredPosts}
        posts={posts}
      />
    </>
  );
}
