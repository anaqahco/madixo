'use client';

import Link from 'next/link';
import { localizeText, type BlogPost, type UseCasePage } from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  page: UseCasePage;
  relatedPosts: BlogPost[];
};

export default function UseCaseDetailPageClient({ page, relatedPosts }: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          back: 'العودة إلى حالات الاستخدام',
          bestFor: 'الأنسب لـ',
          useFor: 'استخدم Madixo من أجل',
          workflow: 'المسار المقترح',
          expected: 'النتيجة المتوقعة',
          start: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          related: 'مقالات مرتبطة',
        }
      : {
          back: 'Back to use cases',
          bestFor: 'Best for',
          useFor: 'Use Madixo for',
          workflow: 'Suggested workflow',
          expected: 'Expected outcome',
          start: 'Start opportunity analysis',
          pricing: 'See plans',
          related: 'Related articles',
        };

  return (
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link href="/use-cases" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.back}</Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-8 shadow-sm">
        <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{localizeText(page.industry, uiLang)}</span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">{localizeText(page.title, uiLang)}</h1>
        <p className="mt-5 text-lg leading-8 text-[#475467]">{localizeText(page.summary, uiLang)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">{copy.start}</Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.pricing}</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.bestFor}</h2>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[#475467]">
            {page.bestFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.useFor}</h2>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[#475467]">
            {page.useMadixoFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.workflow}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {page.workflow.map((step, index) => (
            <div key={index} className="rounded-2xl border border-[#D9E2F0] bg-[#F8FAFD] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF3F9] text-sm font-bold text-[#111827]">{index + 1}</div>
              <p className="text-sm leading-7 text-[#475467]">{localizeText(step, uiLang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.expected}</h2>
        <p className="mt-4 text-base leading-8 text-[#475467]">{localizeText(page.expectedOutcome, uiLang)}</p>
      </section>

      {relatedPosts.length ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.related}</h2>
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
