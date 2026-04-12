import type { Metadata } from 'next';
import { getUseCases } from '@/lib/blog';
import UseCasesPageClient from '@/components/use-cases-page';

export const metadata: Metadata = {
  title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
  description:
    'Explore real Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas to understand where opportunity analysis, early feasibility, and validation fit best.',
  alternates: {
    canonical: '/use-cases',
  },
  openGraph: {
    title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
    description:
      'See practical Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas.',
    url: '/use-cases',
    type: 'website',
  },
  twitter: {
    title: 'Madixo Use Cases | Where Business Idea Validation and Feasibility Fit Best',
    description:
      'See practical Madixo use cases for founders, service businesses, agencies, consultants, and ecommerce ideas.',
  },
  keywords: [
    'Madixo use cases',
    'business idea validation tool',
    'early feasibility tool',
    'startup idea analysis use cases',
    'founder validation workflow',
  ],
};

export default async function UseCasesPage() {
  const items = getUseCases();

  return <UseCasesPageClient items={items} />;
}
