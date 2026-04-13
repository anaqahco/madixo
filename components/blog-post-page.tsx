'use client';

import Link from 'next/link';
import {
  categoryLabel,
  formatContentDate,
  localizeText,
  type BlogPost,
  type ComparisonPage,
  type UseCasePage,
} from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  post: BlogPost;
  relatedPosts: BlogPost[];
  relatedUseCases: UseCasePage[];
  relatedComparisons: ComparisonPage[];
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{children}</h2>;
}

export default function BlogPostPageClient({
  post,
  relatedPosts,
  relatedUseCases,
  relatedComparisons,
}: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          back: 'العودة إلى المدونة',
          start: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          useCases: 'حالات استخدام مرتبطة',
          comparisons: 'مقارنات مرتبطة',
          relatedArticles: 'مقالات مرتبطة تقرؤها بعد هذا المقال',
          relatedArticlesDescription:
            'هذه المقالات تكمل نفس الموضوع أو تقرّبك من زاوية أخرى حتى لا تتوقف عند قراءة واحدة فقط.',
          readArticle: 'اقرأ المقال',
          comparisonsHub: 'شاهد المقارنات',
          useCasesHub: 'شاهد حالات الاستخدام',
          nextStepTitle: 'الخطوة التالية بعد قراءة المقال',
          nextStepDescription:
            'إذا بدأت تتضح لك الصورة، انتقل الآن من القراءة إلى خطوة عملية: تحليل، مقارنة، أو حالة استخدام أقرب لوضعك.',
          practicalLinks: 'صفحات مفيدة من داخل Madixo',
          practicalLinksDescription:
            'هذه الصفحات تربط بين المحتوى النظري والخطوة العملية، حتى يتحول المقال إلى قرار أو تجربة تحقق أو فهم أوضح للباقات.',
          keyTakeaway: 'الخلاصة العملية',
          keyTakeawayText:
            'المقال وحده لا يكفي لاتخاذ القرار. أفضل استخدام له هو أن يحول فكرتك أو ملاحظاتك إلى أسئلة أوضح، ثم تنتقل بعدها إلى تحليل منظم أو تحقق عملي داخل Madixo.',
          keepReading: 'أكمل القراءة حسب هذا الموضوع',
          keepReadingDescription:
            'إذا كان هذا المقال قريبًا من سؤالك الحالي، فهذه أفضل المسارات التالية من داخل المدونة والمنتج.',
          exploreUseCase: 'افتح حالة الاستخدام',
          exploreComparison: 'افتح المقارنة',
        }
      : {
          back: 'Back to blog',
          start: 'Start opportunity analysis',
          pricing: 'See plans',
          useCases: 'Related use cases',
          comparisons: 'Related comparisons',
          relatedArticles: 'Related articles to read next',
          relatedArticlesDescription:
            'These articles extend the same theme or give you another angle so you do not stop at a single read.',
          readArticle: 'Read article',
          comparisonsHub: 'See comparisons',
          useCasesHub: 'See use cases',
          nextStepTitle: 'What to do after reading this article',
          nextStepDescription:
            'If the picture is getting clearer, move from reading into a practical next step: analysis, comparison, or a use case closer to your situation.',
          practicalLinks: 'Useful pages inside Madixo',
          practicalLinksDescription:
            'These pages connect the theory to a practical next step so the article becomes a decision, a validation test, or a clearer understanding of the plans.',
          keyTakeaway: 'Practical takeaway',
          keyTakeawayText:
            'An article alone is not enough to make the decision. Its best use is to turn your idea or notes into clearer questions, then move into structured analysis or validation inside Madixo.',
          keepReading: 'Continue from this topic',
          keepReadingDescription:
            'If this article is close to your current question, these are the best next paths inside the blog and product.',
          exploreUseCase: 'Open use case',
          exploreComparison: 'Open comparison',
        };

  const relatedResourceCount =
    relatedPosts.length + relatedUseCases.length + relatedComparisons.length;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
      >
        {copy.back}
      </Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
            {categoryLabel(post.category, uiLang)}
          </span>
          <span className="text-xs font-medium text-[#6B7280]">
            {formatContentDate(post.publishedAt, uiLang)}
          </span>
          <span className="text-xs font-medium text-[#6B7280]">
            {uiLang === 'ar' ? `${post.readingTimeMinutes} دقائق قراءة` : `${post.readingTimeMinutes} min read`}
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
          {localizeText(post.title, uiLang)}
        </h1>

        <p className="mt-5 text-base leading-7 text-[#475467] sm:text-lg sm:leading-8">
          {localizeText(post.excerpt, uiLang)}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/" className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">
            {copy.start}
          </Link>
          <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
            {copy.pricing}
          </Link>
          <Link href="/use-cases" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
            {copy.useCasesHub}
          </Link>
          <Link href="/compare-to" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
            {copy.comparisonsHub}
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading>{copy.keyTakeaway}</SectionHeading>
        <p className="mt-3 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{copy.keyTakeawayText}</p>
      </div>

      <div className="prose prose-slate mt-10 max-w-none prose-headings:tracking-tight prose-p:text-[17px] prose-p:leading-8 prose-li:text-[17px] prose-li:leading-8">
        {post.body.map((block, index) => {
          if (block.type === 'heading') {
            return <h2 key={index}>{localizeText(block.text, uiLang)}</h2>;
          }

          if (block.type === 'list') {
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{localizeText(item, uiLang)}</li>
                ))}
              </ul>
            );
          }

          return <p key={index}>{localizeText(block.text, uiLang)}</p>;
        })}
      </div>

      {(relatedPosts.length || relatedUseCases.length || relatedComparisons.length) ? (
        <section className="mt-14 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
          <SectionHeading>{copy.keepReading}</SectionHeading>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.keepReadingDescription}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedPosts.slice(0, 1).map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <div className="text-sm font-semibold text-[#111827]">{copy.relatedArticles}</div>
                <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.excerpt, uiLang)}</p>
              </Link>
            ))}

            {relatedUseCases.slice(0, 1).map((item) => (
              <Link
                key={item.slug}
                href={`/use-cases/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <div className="text-sm font-semibold text-[#111827]">{copy.useCases}</div>
                <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              </Link>
            ))}

            {relatedComparisons.slice(0, 1).map((item) => (
              <Link
                key={item.slug}
                href={`/compare-to/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <div className="text-sm font-semibold text-[#111827]">{copy.comparisons}</div>
                <h3 className="mt-3 text-lg font-bold leading-tight text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-8">
        <SectionHeading>{copy.nextStepTitle}</SectionHeading>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
          {copy.nextStepDescription}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 text-[#111827] shadow-sm hover:bg-[#F9FAFB]">
            <div className="text-sm font-semibold">{copy.start}</div>
            <p className="mt-2 text-sm leading-7 text-[#475467]">
              {uiLang === 'ar'
                ? 'ابدأ بتحليل الفكرة والسوق والجدوى الأولية في مكان واحد.'
                : 'Start with idea, market, and early feasibility analysis in one place.'}
            </p>
          </Link>

          <Link href="/pricing" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 text-[#111827] shadow-sm hover:bg-[#F9FAFB]">
            <div className="text-sm font-semibold">{copy.pricing}</div>
            <p className="mt-2 text-sm leading-7 text-[#475467]">
              {uiLang === 'ar'
                ? 'افهم ما الذي يفتحه كل اشتراك قبل أن تبدأ العمل.'
                : 'See what each plan unlocks before you start.'}
            </p>
          </Link>

          <Link href="/use-cases" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 text-[#111827] shadow-sm hover:bg-[#F9FAFB]">
            <div className="text-sm font-semibold">{copy.useCasesHub}</div>
            <p className="mt-2 text-sm leading-7 text-[#475467]">
              {uiLang === 'ar'
                ? 'شاهد كيف يستخدم Madixo في حالات عملية قريبة من فكرتك.'
                : 'See how Madixo fits real use cases closer to your situation.'}
            </p>
          </Link>

          <Link href="/compare-to" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 text-[#111827] shadow-sm hover:bg-[#F9FAFB]">
            <div className="text-sm font-semibold">{copy.comparisonsHub}</div>
            <p className="mt-2 text-sm leading-7 text-[#475467]">
              {uiLang === 'ar'
                ? 'افهم الفرق بين Madixo وبين الطرق أو البدائل القريبة.'
                : 'Understand the difference between Madixo and adjacent alternatives.'}
            </p>
          </Link>
        </div>
      </section>

      {relatedPosts.length ? (
        <section className="mt-14">
          <SectionHeading>{copy.relatedArticles}</SectionHeading>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.relatedArticlesDescription}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedPosts.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                    {categoryLabel(item.category, uiLang)}
                  </span>
                  <span className="text-xs font-medium text-[#6B7280]">
                    {uiLang === 'ar' ? `${item.readingTimeMinutes} دقائق قراءة` : `${item.readingTimeMinutes} min read`}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.excerpt, uiLang)}</p>
                <span className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">{copy.readArticle}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedResourceCount ? (
        <section className="mt-14">
          <SectionHeading>{copy.practicalLinks}</SectionHeading>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.practicalLinksDescription}
          </p>
        </section>
      ) : null}

      {relatedUseCases.length ? (
        <section className="mt-6">
          <h3 className="text-lg font-bold tracking-tight text-[#111827]">{copy.useCases}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedUseCases.map((item) => (
              <Link
                key={item.slug}
                href={`/use-cases/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <h4 className="text-xl font-bold text-[#111827]">{localizeText(item.title, uiLang)}</h4>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
                <span className="mt-5 inline-flex rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#111827]">{copy.exploreUseCase}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length ? (
        <section className="mt-10">
          <h3 className="text-lg font-bold tracking-tight text-[#111827]">{copy.comparisons}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedComparisons.map((item) => (
              <Link
                key={item.slug}
                href={`/compare-to/${item.slug}`}
                className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]"
              >
                <h4 className="text-xl font-bold text-[#111827]">{localizeText(item.title, uiLang)}</h4>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
                <span className="mt-5 inline-flex rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-2 text-sm font-semibold text-[#111827]">{copy.exploreComparison}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
