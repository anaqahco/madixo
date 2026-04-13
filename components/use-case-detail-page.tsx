'use client';

import Link from 'next/link';
import {
  localizeText,
  type BlogPost,
  type ComparisonPage,
  type UseCasePage,
} from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  page: UseCasePage;
  relatedPosts: BlogPost[];
  relatedUseCases: UseCasePage[];
  relatedComparisons: ComparisonPage[];
};

export default function UseCaseDetailPageClient({
  page,
  relatedPosts,
  relatedUseCases,
  relatedComparisons,
}: Props) {
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
          relatedUseCases: 'حالات استخدام قريبة',
          relatedComparisons: 'مقارنات تساعدك قبل القرار',
          nextStepTitle: 'الخطوة التالية بعد هذه الحالة',
          nextStepDescription:
            'إذا كانت هذه الحالة أقرب لوضعك، لا تتوقف هنا. انتقل الآن إلى المقارنة أو المقال أو التحليل نفسه حتى يتحول الفهم إلى قرار عملي.',
          openUseCase: 'افتح الحالة',
          openComparison: 'افتح المقارنة',
          readArticle: 'اقرأ المقال',
          decisionTitle: 'كيف تستفيد من حالة الاستخدام عمليًا؟',
          decisionDescription:
            'حالة الاستخدام لا تعني أن Madixo مناسب لك تلقائيًا، لكنها تعطيك إطارًا عمليًا: متى تستخدمه، ما الخطوات المتوقعة، وما النتيجة التي تبحث عنها قبل الاشتراك أو قبل بدء التحقق.',
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
          relatedUseCases: 'Nearby use cases',
          relatedComparisons: 'Comparisons to read before deciding',
          nextStepTitle: 'What should you do after this use case?',
          nextStepDescription:
            'If this use case is close to your situation, do not stop here. Move into the comparison, article, or analysis path so understanding becomes a practical decision.',
          openUseCase: 'Open use case',
          openComparison: 'Open comparison',
          readArticle: 'Read article',
          decisionTitle: 'How should you use this use case in practice?',
          decisionDescription:
            'A use case does not automatically mean Madixo is the right fit, but it gives you a practical frame: when to use it, what steps to expect, and what outcome you should be looking for before subscribing or validating.',
        };

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 pb-24 pt-10">
      <Link href="/use-cases" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.back}</Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
        <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{localizeText(page.industry, uiLang)}</span>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl tracking-tight text-[#111827] md:text-5xl">{localizeText(page.title, uiLang)}</h1>
        <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 text-[#475467]">{localizeText(page.summary, uiLang)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">{copy.start}</Link>
          <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">{copy.pricing}</Link>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.decisionTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{copy.decisionDescription}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.bestFor}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">
            {page.bestFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.useFor}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">
            {page.useMadixoFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.workflow}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {page.workflow.map((step, index) => (
            <div key={index} className="rounded-2xl border border-[#D9E2F0] bg-[#F8FAFD] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF3F9] text-sm font-bold text-[#111827]">{index + 1}</div>
              <p className="text-sm leading-7 text-[#475467]">{localizeText(step, uiLang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold sm:text-2xl tracking-tight text-[#111827]">{copy.expected}</h2>
        <p className="mt-4 text-sm leading-7 sm:text-base sm:leading-8 text-[#475467]">{localizeText(page.expectedOutcome, uiLang)}</p>
      </section>

      <section className="mt-14 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.nextStepTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
          {copy.nextStepDescription}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {relatedPosts.slice(0, 1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.related}</div>
              <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(post.title, uiLang)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(post.excerpt, uiLang)}</p>
              <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.readArticle}</div>
            </Link>
          ))}

          {relatedComparisons.slice(0, 1).map((item) => (
            <Link key={item.slug} href={`/compare-to/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.relatedComparisons}</div>
              <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.openComparison}</div>
            </Link>
          ))}

          {relatedUseCases.slice(0, 1).map((item) => (
            <Link key={item.slug} href={`/use-cases/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.relatedUseCases}</div>
              <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.openUseCase}</div>
            </Link>
          ))}
        </div>
      </section>

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
