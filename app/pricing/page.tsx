import type { Metadata } from 'next';
import PricingPageClient from '@/components/pricing-page-client';
import { buildAbsoluteAppUrl } from '@/lib/app-url';

export const metadata: Metadata = {
  title: 'Pricing | Plans for Business Idea Validation and Feasibility',
  description:
    'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Madixo Pricing | Plans for Business Idea Validation and Feasibility',
    description:
      'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
    url: buildAbsoluteAppUrl('/pricing'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo Pricing | Plans for Business Idea Validation and Feasibility',
    description:
      'Compare Madixo Free and Pro plans for business idea analysis, early feasibility study, validation workflows, saved opportunities, and PDF exports.',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
