import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getComparisonBySlug, getPostsBySlugs } from '@/lib/blog';
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
  };
}

export default async function ComparisonDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);
  if (!page) notFound();

  const relatedPosts = getPostsBySlugs(page.relatedPosts);

  return <ComparisonDetailPageClient page={page} relatedPosts={relatedPosts} />;
}
