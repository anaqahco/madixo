import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import LanguageSwitcher from '@/components/language-switcher';
import { getUseCases, localizeText } from '@/lib/blog';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export const metadata: Metadata = {
  title: 'Madixo Use Cases',
  description:
    'Use-case pages that show when Madixo fits best and how founders or teams can use it in practical situations.',
  alternates: {
    canonical: '/use-cases',
  },
};

export default async function UseCasesPage() {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const items = getUseCases();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'حالات الاستخدام',
          title: 'كيف يمكن استخدام Madixo في حالات عملية مختلفة؟',
          description:
            'استكشف حالات استخدام عملية توضّح كيف يساعدك Madixo على تحليل الفرصة، ودراسة الجدوى الأولية، واتخاذ قرار أوضح بحسب نوع المشروع أو الفريق.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          open: 'افتح الحالة',
          blog: 'المقالات',
          useCases: 'حالات الاستخدام',
          comparisons: 'المقارنات',
        }
      : {
          eyebrow: 'Use Cases',
          title: 'How can Madixo be used in practical situations?',
          description:
            'Explore practical use cases that show how Madixo can help with opportunity analysis, early feasibility, and clearer decisions depending on the business or team.',
          start: 'Start analysis',
          pricing: 'See plans',
          open: 'Open use case',
          blog: 'Articles',
          useCases: 'Use Cases',
          comparisons: 'Comparisons',
        };

  return (
    <>
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
            <LanguageSwitcher />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="rounded-full border border-[#D9E2F0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              {copy.blog}
            </Link>
            <Link
              href="/use-cases"
              className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
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

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-10 text-center">
        <p className="text-sm font-medium text-[#6B7280]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#475467] md:text-lg">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-2 xl:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.slug}
            className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm"
          >
            <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
              {localizeText(item.industry, uiLang)}
            </span>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#111827]">
              {localizeText(item.title, uiLang)}
            </h2>

            <p className="mt-4 text-base leading-8 text-[#475467]">
              {localizeText(item.summary, uiLang)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/use-cases/${item.slug}`}
                className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                {copy.open}
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
              >
                {copy.pricing}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
