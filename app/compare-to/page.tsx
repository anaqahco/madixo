import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getComparisons, localizeText } from '@/lib/blog';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export const metadata: Metadata = {
  title: 'Madixo Comparisons',
  description:
    'Comparison pages that help readers understand how Madixo differs from broad AI chats, templates, and other common ways to evaluate ideas.',
  alternates: {
    canonical: '/compare-to',
  },
};

export default async function ComparisonsPage() {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const items = getComparisons();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'المقارنات',
          title: 'كيف يختلف Madixo عن البدائل الشائعة؟',
          description:
            'هذه المقارنات تساعدك على فهم الفرق بين Madixo وبين الأساليب أو الأدوات القريبة، حتى تعرف متى يكون هو الخيار الأنسب لفهم الفكرة واتخاذ القرار.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          open: 'افتح المقارنة',
        }
      : {
          eyebrow: 'Comparisons',
          title: 'How is Madixo different from common alternatives?',
          description:
            'These comparisons help you understand the difference between Madixo and adjacent tools or approaches so you can see when it is the better fit for idea evaluation and decision-making.',
          start: 'Start analysis',
          pricing: 'See plans',
          open: 'Open comparison',
        };

  return (
    <>
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
              {localizeText(item.compareAgainst, uiLang)}
            </span>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#111827]">
              {localizeText(item.title, uiLang)}
            </h2>

            <p className="mt-4 text-base leading-8 text-[#475467]">
              {localizeText(item.summary, uiLang)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/compare-to/${item.slug}`}
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
