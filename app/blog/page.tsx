import type { Metadata } from 'next';
import {
  BLOG_CATEGORIES,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  type ContentCategory,
} from '@/lib/blog';
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
    url: '/blog',
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

  return (
    <BlogIndexPageClient
      selectedCategory={selectedCategory}
      featuredPosts={featuredPosts}
      posts={posts}
    />
  );
}
