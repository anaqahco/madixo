import type { Metadata } from 'next';
import { getUseCases } from '@/lib/blog';
import UseCasesPageClient from '@/components/use-cases-page';

export const metadata: Metadata = {
  title: 'Madixo Use Cases',
  description:
    'Use-case pages that show when Madixo fits best and how founders or teams can use it in practical situations.',
  alternates: {
    canonical: '/use-cases',
  },
};

export default async function UseCasesPage() {
  const items = getUseCases();

  return <UseCasesPageClient items={items} />;
}
