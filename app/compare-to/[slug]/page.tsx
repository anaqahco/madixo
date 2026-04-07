import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getComparisonBySlug, getPostsBySlugs, localizeText } from '@/lib/blog';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);

  if (!page) return { title: 'Comparison not found' };

  return {
    title: page.title.en,
    description: page.seoDescription.en,
    alternates: {
      canonical: `/compare-to/${page.slug}`,
    },
  };
}

export default async function ComparisonDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);
  if (!page) notFound();

  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const relatedPosts = getPostsBySlugs(page.relatedPosts);

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
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-10">
      <Link href="/compare-to" className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.back}</Link>

      <div className="mt-8 rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-8 shadow-sm">
        <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">{localizeText(page.compareAgainst, uiLang)}</span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">{localizeText(page.title, uiLang)}</h1>
        <p className="mt-5 text-lg leading-8 text-[#475467]">{localizeText(page.summary, uiLang)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">{copy.start}</Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">{copy.pricing}</Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.bestWhen}</h2>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[#475467]">
            {page.bestWhen.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.whyMadixo}</h2>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[#475467]">
            {page.whyMadixo.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>

        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{copy.notFor}</h2>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[#475467]">
            {page.notFor.map((item, index) => <li key={index}>• {localizeText(item, uiLang)}</li>)}
          </ul>
        </section>
      </div>

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
