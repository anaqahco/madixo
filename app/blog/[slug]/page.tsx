import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  BLOG_POSTS,
  getBlogPostBySlug,
  getComparisonsBySlugs,
  getUseCasesBySlugs,
} from '@/lib/blog';
import BlogPostPageClient from '@/components/blog-post-page';

type Params = Promise<{ slug: string }>;

const siteUrl =
  (process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://madixo.ai').replace(/\/$/, '');

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found' };
  }

  const title = `${post.title.en} | Madixo Blog`;
  const description = post.seoDescription.en;
  const canonical = `/blog/${post.slug}`;
  const absoluteUrl = `${siteUrl}${canonical}`;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: 'Madixo',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedUseCases = getUseCasesBySlugs(post.relatedUseCases);
  const relatedComparisons = getComparisonsBySlugs(post.relatedComparisons);

  return (
    <BlogPostPageClient
      post={post}
      relatedUseCases={relatedUseCases}
      relatedComparisons={relatedComparisons}
    />
  );
}
