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
          title: 'مقالات وأدلة تبني قرارًا أوضح.',
          description:
            'مقالات وأدلة تساعدك على فهم الفكرة والسوق والجدوى الأولية واتخاذ قرار أوضح حول خطوتك التالية.',
          featured: 'الأبرز الآن',
          allArticles: 'جميع المقالات',
          readArticle: 'اقرأ المقال',
          openMadixo: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          filters: 'التصنيفات',
          all: 'الكل',
          startHere: 'ابدأ بهذه الصفحات إذا كنت جديدًا',
          startHereDescription:
            'إذا وصلت إلى المدونة من Google أو من بحث خارجي، فهذه الروابط تنقلك بسرعة من القراءة إلى فهم المنتج أو الباقات أو حالات الاستخدام.',
          useCases: 'حالات الاستخدام',
          comparisons: 'المقارنات',
          readByGoal: 'اقرأ حسب هدفك الآن',
          readByGoalDescription:
            'بدل أن تتنقل بين المقالات بشكل عشوائي، اختر المسار الأقرب لسؤالك الحالي ثم أكمل القراءة منه.',
          newestTracks: 'أحدث المسارات',
          goal1: 'أريد التأكد أن الفكرة تستحق التنفيذ',
          goal1Desc: 'مقالات حول اختبار الفكرة، أول عميل، وما الذي يستحق التنفيذ فعلًا.',
          goal2: 'أريد فهم السوق والطلب بشكل أوضح',
          goal2Desc: 'مقالات تساعدك على قراءة إشارات الطلب، اختيار السوق الأول، والتعامل مع اعتراضات السوق.',
          goal3: 'أريد الانتقال من القراءة إلى خطوة عملية',
          goal3Desc: 'انتقل إلى المقارنات، حالات الاستخدام، أو تحليل الفرصة نفسه بدل الاكتفاء بالقراءة.',
          openTrack: 'افتح المسار',
          openUseCases: 'شاهد حالات الاستخدام',
          openComparisons: 'شاهد المقارنات',
        }
      : {
          eyebrow: 'Madixo Blog',
          title: 'Articles and guides that lead to a clearer decision.',
          description:
            'Articles and guides that help you understand ideas, markets, early feasibility, and the next decision more clearly.',
          featured: 'Featured now',
          allArticles: 'All articles',
          readArticle: 'Read article',
          openMadixo: 'Start opportunity analysis',
          pricing: 'See plans',
          filters: 'Categories',
          all: 'All',
          startHere: 'Start here if you are new to Madixo',
          startHereDescription:
            'If you arrived from Google or an external search, these links help you move quickly from reading into understanding the product, plans, or practical use cases.',
          useCases: 'Use cases',
          comparisons: 'Comparisons',
          readByGoal: 'Read by your current goal',
          readByGoalDescription:
            'Instead of jumping randomly between articles, choose the track that is closest to your current question and continue from there.',
          newestTracks: 'Newest tracks',
          goal1: 'I want to confirm the idea is worth executing',
          goal1Desc: 'Articles about idea validation, the first customer, and whether the idea truly deserves execution.',
          goal2: 'I want a clearer view of market demand',
          goal2Desc: 'Articles that help you read demand signals, choose your first market, and handle market objections.',
          goal3: 'I want to move from reading into action',
          goal3Desc: 'Jump into comparisons, use cases, or the opportunity analysis itself instead of stopping at content.',
          openTrack: 'Open track',
          openUseCases: 'See use cases',
          openComparisons: 'See comparisons',
        };

  const newestPosts = posts.slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:px-6">
        <p className="text-sm font-medium text-[#6B7280]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8 md:text-lg">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 sm:px-6">
            {copy.openMadixo}
          </Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:px-6">
            {copy.pricing}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.startHere}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{copy.startHereDescription}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link href="/pricing" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.pricing}</div>
              <p className="mt-2 text-sm leading-7 text-[#475467]">
                {uiLang === 'ar' ? 'افهم الفرق بين Free و Pro ومتى تحتاج كل واحدة.' : 'Understand the difference between Free and Pro and when you need each one.'}
              </p>
            </Link>

            <Link href="/use-cases" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.useCases}</div>
              <p className="mt-2 text-sm leading-7 text-[#475467]">
                {uiLang === 'ar' ? 'شاهد أمثلة عملية لكيفية استخدام Madixo بحسب نوع المشروع.' : 'See practical examples of how Madixo is used across different idea types.'}
              </p>
            </Link>

            <Link href="/compare-to" className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
              <div className="text-sm font-semibold text-[#111827]">{copy.comparisons}</div>
              <p className="mt-2 text-sm leading-7 text-[#475467]">
                {uiLang === 'ar' ? 'افهم الفرق بين Madixo وبين الأساليب أو البدائل القريبة.' : 'Understand how Madixo differs from adjacent tools or approaches.'}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {selectedCategory === 'all' ? (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.readByGoal}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{copy.readByGoalDescription}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link href="/blog?category=idea-validation" className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm hover:bg-[#F1F5F9]">
                <div className="text-sm font-semibold text-[#111827]">{copy.goal1}</div>
                <p className="mt-2 text-sm leading-7 text-[#475467]">{copy.goal1Desc}</p>
                <span className="mt-4 inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">{copy.openTrack}</span>
              </Link>

              <Link href="/blog?category=market-research" className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm hover:bg-[#F1F5F9]">
                <div className="text-sm font-semibold text-[#111827]">{copy.goal2}</div>
                <p className="mt-2 text-sm leading-7 text-[#475467]">{copy.goal2Desc}</p>
                <span className="mt-4 inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">{copy.openTrack}</span>
              </Link>

              <div className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm">
                <div className="text-sm font-semibold text-[#111827]">{copy.goal3}</div>
                <p className="mt-2 text-sm leading-7 text-[#475467]">{copy.goal3Desc}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/use-cases" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]">{copy.openUseCases}</Link>
                  <Link href="/compare-to" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]">{copy.openComparisons}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">{copy.filters}</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/blog" className={`rounded-full border px-4 py-2 text-sm font-semibold ${selectedCategory === 'all' ? 'border-[#111827] bg-[#111827] text-white' : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]'}`}>
            {copy.all}
          </Link>

          {BLOG_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${category}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${selectedCategory === category ? 'border-[#111827] bg-[#111827] text-white' : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]'}`}
            >
              {categoryLabel(category, uiLang)}
            </Link>
          ))}
        </div>
      </section>

      {selectedCategory === 'all' ? (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.newestTracks}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {newestPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm hover:bg-[#F1F5F9]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{categoryLabel(post.category, uiLang)}</span>
                  <span className="text-xs font-medium text-[#6B7280]">{formatContentDate(post.publishedAt, uiLang)}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold leading-tight text-[#111827]">{localizeText(post.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(post.excerpt, uiLang)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {selectedCategory === 'all' ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.featured}</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <article key={post.slug} className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{categoryLabel(post.category, uiLang)}</span>
                  <span className="text-xs font-medium text-[#6B7280]">{formatContentDate(post.publishedAt, uiLang)}</span>
                  <span className="text-xs font-medium text-[#6B7280]">{readingTimeLabel(post.readingTimeMinutes, uiLang)}</span>
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight text-[#111827] sm:text-2xl">{localizeText(post.title, uiLang)}</h3>

                <p className="mt-4 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">{localizeText(post.excerpt, uiLang)}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/blog/${post.slug}`} className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">
                    {copy.readArticle}
                  </Link>
                  <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
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
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.allArticles}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-3 py-1 text-xs font-semibold text-[#4B5563]">{categoryLabel(post.category, uiLang)}</span>
                <span className="text-xs font-medium text-[#6B7280]">{readingTimeLabel(post.readingTimeMinutes, uiLang)}</span>
              </div>

              <h3 className="mt-4 text-xl font-bold leading-tight text-[#111827]">{localizeText(post.title, uiLang)}</h3>

              <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(post.excerpt, uiLang)}</p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-[#6B7280]">{formatContentDate(post.publishedAt, uiLang)}</span>

                <Link href={`/blog/${post.slug}`} className="inline-flex rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
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
