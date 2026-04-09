'use client';

import Link from 'next/link';
import { localizeText, type BlogPost, type ComparisonPage } from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  page: ComparisonPage;
  relatedPosts: BlogPost[];
};

export default function ComparisonDetailPageClient({ page, relatedPosts }: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          back: 'العودة إلى المقارنات',
          bestWhen: 'اختر Madixo أكثر عندما',
          whyMadixo: 'لماذا Madixo هنا أقوى',
          notFor: 'قد لا يكون الأنسب إذا',
          start: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          related: 'مقالات مرتبطة',
        }
      : {
          back: 'Back to comparisons',
          bestWhen: 'Choose Madixo more when',
          whyMadixo: 'Why Madixo is stronger here',
          notFor: 'It may not be the best fit when',
          start: 'Start opportunity analysis',
          pricing: 'See plans',
          related: 'Related articles',
        };

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 pb-24 pt-10">
      <Link href="/compare-to" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.back}</Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
        <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{localizeText(page.compareAgainst, uiLang)}</span>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl tracking-tight text-[#111827] md:text-5xl">{localizeText(page.title, uiLang)}</h1>
        <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 text-[#475467]">{localizeText(page.summary, uiLang)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">{copy.start}</Link>
          <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">{copy.pricing}</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.bestWhen}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">
            {page.bestWhen.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.whyMadixo}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">
            {page.whyMadixo.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.notFor}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">
            {page.notFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>
      </div>

      {relatedPosts.length ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.related}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
                <h3 className="text-xl font-bold text-[#111827]">{localizeText(post.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(post.excerpt, uiLang)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
