import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostsBySlugs, getUseCaseBySlug } from '@/lib/blog';
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
  };
}

export default async function UseCaseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getUseCaseBySlug(slug);
  if (!page) notFound();

  const relatedPosts = getPostsBySlugs(page.relatedPosts);

  return <UseCaseDetailPageClient page={page} relatedPosts={relatedPosts} />;
}
