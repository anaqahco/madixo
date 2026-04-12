import type { Metadata } from 'next';
import HomePageClient from '@/components/home-page-client';
import { buildAbsoluteAppUrl } from '@/lib/app-url';

export const metadata: Metadata = {
  title: 'AI Business Idea Validation & Feasibility Workspace',
  description:
    'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Madixo | AI Business Idea Validation & Feasibility Workspace',
    description:
      'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
    url: buildAbsoluteAppUrl('/'),
    type: 'website',
  },
  twitter: {
    title: 'Madixo | AI Business Idea Validation & Feasibility Workspace',
    description:
      'Analyze business ideas, generate an early feasibility view, build a validation plan, capture market evidence, and decide your next move with Madixo.',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
