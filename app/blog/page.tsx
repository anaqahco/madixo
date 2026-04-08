import type { Metadata } from 'next';
import {
  BLOG_CATEGORIES,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  type ContentCategory,
} from '@/lib/blog';
import BlogIndexPageClient from '@/components/blog-index-page';

export const metadata: Metadata = {
  title: 'Madixo Blog',
  description:
    'Articles about opportunity analysis, early feasibility, market validation, and using Madixo more effectively.',
  alternates: {
    canonical: '/blog',
  },
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
