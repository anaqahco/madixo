import Link from 'next/link';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import LanguageSwitcher from '@/components/language-switcher';
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
          pricing: 'شاهد الباقات',
          start: 'ابدأ التحليل',
        }
      : {
          blog: 'Articles',
          useCases: 'Use Cases',
          comparisons: 'Comparisons',
          pricing: 'See plans',
          start: 'Start analysis',
        };

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#111827]">
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {copy.start}
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[#D9E2F0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              {copy.pricing}
            </Link>
            <LanguageSwitcher value={uiLang} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {copy.blog}
            </Link>
            <Link
              href="/use-cases"
              className="rounded-full border border-[#D9E2F0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              {copy.useCases}
            </Link>
            <Link
              href="/compare-to"
              className="rounded-full border border-[#D9E2F0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              {copy.comparisons}
            </Link>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
