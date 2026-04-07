import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import {
  categoryLabel,
  formatContentDate,
  getBlogPostBySlug,
  getComparisonsBySlugs,
  getUseCasesBySlugs,
  localizeText,
} from '@/lib/blog';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found' };
  }

  return {
    title: post.title.en,
    description: post.seoDescription.en,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const relatedUseCases = getUseCasesBySlugs(post.relatedUseCases);
  const relatedComparisons = getComparisonsBySlugs(post.relatedComparisons);

  const copy =
    uiLang === 'ar'
      ? {
          back: 'العودة إلى المدونة',
          start: 'ابدأ تحليل الفرصة',
          pricing: 'شاهد الباقات',
          useCases: 'حالات استخدام مرتبطة',
          comparisons: 'مقارنات مرتبطة',
        }
      : {
          back: 'Back to blog',
          start: 'Start opportunity analysis',
          pricing: 'See plans',
          useCases: 'Related use cases',
          comparisons: 'Related comparisons',
        };

  return (
    <article className="mx-auto max-w-4xl px-6 pb-24 pt-10">
      <Link href="/blog" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
        {copy.back}
      </Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-8 shadow-sm">
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

        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[#111827] md:text-5xl">
          {localizeText(post.title, uiLang)}
        </h1>

        <p className="mt-5 text-lg leading-8 text-[#475467]">
          {localizeText(post.excerpt, uiLang)}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
            {copy.start}
          </Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
            {copy.pricing}
          </Link>
        </div>
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

      {relatedUseCases.length ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.useCases}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedUseCases.map((item) => (
              <Link key={item.slug} href={`/use-cases/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
                <h3 className="text-xl font-bold text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.comparisons}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedComparisons.map((item) => (
              <Link key={item.slug} href={`/compare-to/${item.slug}`} className="rounded-[24px] border border-[#D9E2F0] bg-white p-5 shadow-sm hover:bg-[#F9FAFB]">
                <h3 className="text-xl font-bold text-[#111827]">{localizeText(item.title, uiLang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(item.summary, uiLang)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
