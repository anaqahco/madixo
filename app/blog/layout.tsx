import Link from 'next/link';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export default async function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const copy =
    uiLang === 'ar'
      ? {
          blog: 'المقالات',
          useCases: 'حالات الاستخدام',
          comparisons: 'المقارنات',
          pricing: 'الباقات',
          results: 'ابدأ التحليل',
        }
      : {
          blog: 'Articles',
          useCases: 'Use Cases',
          comparisons: 'Comparisons',
          pricing: 'Plans',
          results: 'Start Analysis',
        };

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#111827]">
      <section className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/blog" className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9]">
              {copy.blog}
            </Link>
            <Link href="/use-cases" className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9]">
              {copy.useCases}
            </Link>
            <Link href="/compare-to" className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9]">
              {copy.comparisons}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
              {copy.pricing}
            </Link>
            <Link href="/" className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              {copy.results}
            </Link>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
