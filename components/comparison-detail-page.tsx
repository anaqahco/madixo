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
  page: ComparisonPage;
  relatedPosts: BlogPost[];
  relatedUseCases: UseCasePage[];
  relatedComparisons: ComparisonPage[];
};

export default function ComparisonDetailPageClient({
  page,
  relatedPosts,
  relatedUseCases,
  relatedComparisons,
}: Props) {
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
          relatedUseCases: 'حالات استخدام مرتبطة',
          otherComparisons: 'مقارنات أخرى قريبة',
          nextStepTitle: 'ماذا تفعل بعد هذه المقارنة؟',
          nextStepDescription:
            'لا تجعل المقارنة آخر خطوة. إذا اقتربت من فهم الفرق، انتقل الآن إلى المقال أو حالة الاستخدام أو التحليل الأقرب لسؤالك الحقيقي.',
          readArticle: 'اقرأ المقال',
          openUseCase: 'افتح الحالة',
          openComparison: 'افتح المقارنة',
          decisionTitle: 'حوّل المقارنة إلى قرار أوضح',
          decisionDescription:
            'هذه الصفحة مفيدة عندما تكون الحيرة بين Madixo وبديل قريب. لكن القرار يصبح أوضح أكثر عندما تربط المقارنة بوضعك الفعلي: نوع المشروع، المرحلة الحالية، وما الذي تريد عمله بعد القراءة.',
        }
      : {
          back: 'Back to comparisons',
          bestWhen: 'Choose Madixo more when',
          whyMadixo: 'Why Madixo is stronger here',
          notFor: 'It may not be the best fit when',
          start: 'Start opportunity analysis',
          pricing: 'See plans',
          related: 'Related articles',
          relatedUseCases: 'Related use cases',
          otherComparisons: 'Other nearby comparisons',
          nextStepTitle: 'What should you do after this comparison?',
          nextStepDescription:
            'Do not let the comparison be the last step. Once the difference is clearer, move into the article, use case, or analysis path that matches your real question.',
          readArticle: 'Read article',
          openUseCase: 'Open use case',
          openComparison: 'Open comparison',
          decisionTitle: 'Turn the comparison into a clearer decision',
          decisionDescription:
            'This page helps when the hesitation is between Madixo and an adjacent alternative. The decision gets stronger when you connect the comparison to your real situation: project type, current stage, and what you want to do after reading.',
        };

  return (
    <article className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
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

      <div className="mt-8 rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.decisionTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{copy.decisionDescription}</p>
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

          {relatedUseCases.slice(0, 1).map((item) => (
            <Link key={item.slug} href={`/use-cases/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.relatedUseCases}</div>
              <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.openUseCase}</div>
            </Link>
          ))}

          {relatedComparisons.slice(0, 1).map((item) => (
            <Link key={item.slug} href={`/compare-to/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.otherComparisons}</div>
              <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.openComparison}</div>
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
