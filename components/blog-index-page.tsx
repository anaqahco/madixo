'use client';

import Link from 'next/link';
import {
  BLOG_CATEGORIES,
  categoryLabel,
  formatContentDate,
  localizeText,
  type BlogPost,
  type ContentCategory,
} from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  selectedCategory: ContentCategory | 'all';
  featuredPosts: BlogPost[];
  posts: BlogPost[];
};

function readingTimeLabel(minutes: number, uiLang: UiLanguage) {
  return uiLang === 'ar' ? `${minutes} دقائق قراءة` : `${minutes} min read`;
}

export default function BlogIndexPageClient({
  selectedCategory,
  featuredPosts,
  posts,
}: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'مدونة Madixo',
          title: 'مقالات عملية لاختبار فكرة المشروع وفهم الجدوى والطلب في السوق.',
          description:
            'تجمع مدونة Madixo مقالات وأدلة عملية حول اختبار فكرة المشروع، فهم الطلب في السوق، دراسة الجدوى الأولية، واتخاذ قرار أوضح قبل البناء أو التوسع.',
          featured: 'الأبرز الآن',
          allArticles: 'جميع المقالات',
          readArticle: 'اقرأ المقال',
          openMadixo: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          useCases: 'شاهد حالات الاستخدام',
          filters: 'التصنيفات',
          all: 'الكل',
          guideTitle: 'ابدأ من الأسئلة التي يبحث الناس عنها فعلاً',
          guideDescription:
            'إذا كنت تبني مشروعًا جديدًا أو تراجع فرصة قائمة، فهذه الصفحة تساعدك على الانتقال من المقالة إلى التحليل العملي داخل Madixo.',
          guideCards: [
            {
              title: 'اختبار الفكرة قبل البناء',
              text: 'تعرف على كيف تقيّم المشكلة والعميل وإشارات السوق الأولى قبل صرف الوقت والمال.',
              href: '/blog/how-to-validate-a-business-idea-before-building',
              cta: 'ابدأ بهذه المقالة',
            },
            {
              title: 'فهم الفرق بين التحليل والجدوى',
              text: 'افهم متى تحتاج تحليل فرصة، ومتى تحتاج دراسة جدوى أولية، ولماذا يفيد الجمع بينهما.',
              href: '/blog/difference-between-opportunity-analysis-and-feasibility-study',
              cta: 'اقرأ الفرق',
            },
            {
              title: 'الانتقال إلى التطبيق العملي',
              text: 'بعد القراءة، انتقل إلى حالات الاستخدام أو صفحة الباقات لتعرف أين تبدأ داخل Madixo.',
              href: '/use-cases',
              cta: 'افتح حالات الاستخدام',
            },
          ],
          seoBlockTitle: 'ماذا ستجد في مدونة Madixo؟',
          seoBlockPoints: [
            'طرق عملية لاختبار فكرة مشروع قبل البناء الكامل.',
            'مقالات عن دراسة الجدوى الأولية والفرق بينها وبين تحليل الفرصة.',
            'أدلة عن الطلب في السوق وتوثيق الأدلة والملاحظات.',
          ],
        }
      : {
          eyebrow: 'Madixo Blog',
          title: 'Practical articles for validating business ideas, feasibility, and market demand.',
          description:
            'The Madixo blog brings together practical guides on validating business ideas, understanding market demand, reading early feasibility, and making clearer decisions before building or scaling.',
          featured: 'Featured now',
          allArticles: 'All articles',
          readArticle: 'Read article',
          openMadixo: 'Start opportunity analysis',
          pricing: 'See plans',
          useCases: 'See use cases',
          filters: 'Categories',
          all: 'All',
          guideTitle: 'Start with the questions people actually search for',
          guideDescription:
            'If you are building a new venture or reviewing an existing opportunity, this page helps you move from reading to practical action inside Madixo.',
          guideCards: [
            {
              title: 'Validate the idea before building',
              text: 'Learn how to assess the problem, the customer, and the first market signals before spending serious time or money.',
              href: '/blog/how-to-validate-a-business-idea-before-building',
              cta: 'Start here',
            },
            {
              title: 'Understand analysis vs feasibility',
              text: 'See when you need opportunity analysis, when you need early feasibility, and why using both often leads to a better decision.',
              href: '/blog/difference-between-opportunity-analysis-and-feasibility-study',
              cta: 'Read the difference',
            },
            {
              title: 'Move into practical application',
              text: 'After reading, jump into use cases or pricing to understand where to begin inside Madixo.',
              href: '/use-cases',
              cta: 'Open use cases',
            },
          ],
          seoBlockTitle: 'What you will find in the Madixo blog',
          seoBlockPoints: [
            'Practical ways to validate a business idea before full execution.',
            'Articles on early feasibility and how it differs from opportunity analysis.',
            'Guides on market demand, evidence capture, and clearer next-step decisions.',
          ],
        };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:px-6">
        <p className="text-sm font-medium text-[#6B7280]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8 md:text-lg">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 sm:px-6"
          >
            {copy.openMadixo}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-[#D9E2F0] bg-white px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:px-6"
          >
            {copy.pricing}
          </Link>
          <Link
            href="/use-cases"
            className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9] sm:px-6"
          >
            {copy.useCases}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6 lg:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {copy.seoBlockTitle}
          </h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#475467] sm:text-base md:grid-cols-3">
            {copy.seoBlockPoints.map((point) => (
              <li key={point} className="rounded-2xl border border-[#D9E2F0] bg-white px-4 py-4">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {copy.guideTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.guideDescription}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {copy.guideCards.map((card) => (
              <div
                key={card.href}
                className="rounded-[24px] border border-[#D9E2F0] bg-[#F8FAFD] p-5"
              >
                <h3 className="text-lg font-bold text-[#111827]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{card.text}</p>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">{copy.filters}</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              selectedCategory === 'all'
                ? 'border-[#111827] bg-[#111827] text-white'
                : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]'
            }`}
          >
            {copy.all}
          </Link>

          {BLOG_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${category}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                selectedCategory === category
                  ? 'border-[#111827] bg-[#111827] text-white'
                  : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]'
              }`}
            >
              {categoryLabel(category, uiLang)}
            </Link>
          ))}
        </div>
      </section>

      {selectedCategory === 'all' ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
              {copy.featured}
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
                    {categoryLabel(post.category, uiLang)}
                  </span>
                  <span className="text-xs font-medium text-[#6B7280]">
                    {formatContentDate(post.publishedAt, uiLang)}
                  </span>
                  <span className="text-xs font-medium text-[#6B7280]">
                    {readingTimeLabel(post.readingTimeMinutes, uiLang)}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight text-[#111827] sm:text-2xl">
                  {localizeText(post.title, uiLang)}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
                  {localizeText(post.excerpt, uiLang)}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
                  >
                    {copy.readArticle}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto"
                  >
                    {copy.pricing}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {copy.allArticles}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-3 py-1 text-xs font-semibold text-[#4B5563]">
                  {categoryLabel(post.category, uiLang)}
                </span>
                <span className="text-xs font-medium text-[#6B7280]">
                  {readingTimeLabel(post.readingTimeMinutes, uiLang)}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold leading-tight text-[#111827]">
                {localizeText(post.title, uiLang)}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#475467]">
                {localizeText(post.excerpt, uiLang)}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-[#6B7280]">
                  {formatContentDate(post.publishedAt, uiLang)}
                </span>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {copy.readArticle}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
