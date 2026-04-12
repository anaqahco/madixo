import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getBlogPostBySlug,
  getComparisonsBySlugs,
  getPostsBySlugs,
  getUseCasesBySlugs,
} from '@/lib/blog';
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
      url: `/blog/${post.slug}`,
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

  const relatedPosts = getPostsBySlugs(post.relatedPosts).filter((item) => item.slug !== post.slug);
  const relatedUseCases = getUseCasesBySlugs(post.relatedUseCases);
  const relatedComparisons = getComparisonsBySlugs(post.relatedComparisons);

  return (
    <BlogPostPageClient
      post={post}
      relatedPosts={relatedPosts}
      relatedUseCases={relatedUseCases}
      relatedComparisons={relatedComparisons}
    />
  );
}
