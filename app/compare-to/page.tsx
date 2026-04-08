import type { Metadata } from 'next';
import { getComparisons } from '@/lib/blog';
import ComparisonsPageClient from '@/components/comparisons-page';

export const metadata: Metadata = {
  title: 'Madixo Comparisons',
  description:
    'Comparison pages that help readers understand how Madixo differs from broad AI chats, templates, and other common ways to evaluate ideas.',
  alternates: {
    canonical: '/compare-to',
  },
};

export default async function ComparisonsPage() {
  const items = getComparisons();

  return <ComparisonsPageClient items={items} />;
}
