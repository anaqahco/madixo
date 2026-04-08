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
          <Link href="/" className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
            {copy.openMadixo}
          </Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
            {copy.pricing}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
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
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.featured}</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <article key={post.slug} className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
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

                <h3 className="mt-5 text-2xl font-bold leading-tight text-[#111827]">
                  {localizeText(post.title, uiLang)}
                </h3>

                <p className="mt-4 text-base leading-8 text-[#475467]">
                  {localizeText(post.excerpt, uiLang)}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/blog/${post.slug}`} className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                    {copy.readArticle}
                  </Link>
                  <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
                    {copy.pricing}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.allArticles}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
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
