'use client';

import Link from 'next/link';
import { localizeText, type UseCasePage } from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

export default function UseCasesPageClient({ items }: { items: UseCasePage[] }) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'حالات الاستخدام',
          title: 'كيف يمكن استخدام Madixo في حالات عملية مختلفة؟',
          description:
            'استكشف حالات استخدام عملية توضّح كيف يساعدك Madixo على تحليل الفرصة، ودراسة الجدوى الأولية، واتخاذ قرار أوضح بحسب نوع المشروع أو الفريق.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          open: 'افتح الحالة',
          blog: 'المقالات',
          comparisons: 'المقارنات',
          helperTitle: 'هل تريد فهمًا أعمق قبل اختيار الحالة؟',
          helperDescription:
            'يمكنك قراءة المقالات أولًا لفهم الفكرة والطلب والجدوى، أو الانتقال إلى المقارنات إذا كنت تقارن بين Madixo وبدائل أخرى.',
        }
      : {
          eyebrow: 'Use Cases',
          title: 'How can Madixo be used in practical situations?',
          description:
            'Explore practical use cases that show how Madixo can help with opportunity analysis, early feasibility, and clearer decisions depending on the business or team.',
          start: 'Start analysis',
          pricing: 'See plans',
          open: 'Open use case',
          blog: 'Blog',
          comparisons: 'Comparisons',
          helperTitle: 'Need more context before choosing a use case?',
          helperDescription:
            'You can read the blog first to understand ideas, demand, and feasibility, or jump into comparisons if you are evaluating Madixo against alternatives.',
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
          <Link href="/" className="rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 sm:px-6">
            {copy.start}
          </Link>
          <Link href="/pricing" className="rounded-full border border-[#D9E2F0] bg-white px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:px-6">
            {copy.pricing}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.helperTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.helperDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/blog" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
              {copy.blog}
            </Link>
            <Link href="/compare-to" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
              {copy.comparisons}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 md:grid-cols-2 xl:grid-cols-2">
        {items.map((item) => (
          <article key={item.slug} className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
            <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
              {localizeText(item.industry, uiLang)}
            </span>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
              {localizeText(item.title, uiLang)}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
              {localizeText(item.summary, uiLang)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/use-cases/${item.slug}`} className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">
                {copy.open}
              </Link>
              <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
                {copy.pricing}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
