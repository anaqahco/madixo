'use client';

import Link from 'next/link';
import { localizeText, type BlogPost, type ComparisonPage } from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  items: ComparisonPage[];
  featuredPosts: BlogPost[];
};

export default function ComparisonsPageClient({ items, featuredPosts }: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'المقارنات',
          title: 'Madixo مقابل البدائل اللي تستخدمها الآن.',
          description:
            'شف بالضبط وين Madixo يضيف قيمة مقارنة بـ ChatGPT والجداول والملاحظات العامة — عشان تقرر هل يستاهل التغيير.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          open: 'افتح المقارنة',
          blog: 'المقالات',
          useCases: 'حالات الاستخدام',
          helperTitle: 'قبل أن تحكم على الأداة، شاهد السياق العملي',
          helperDescription:
            'إذا كنت ما زلت في مرحلة الفهم، فالمقالات وحالات الاستخدام تساعدك على رؤية الفرق من زاوية القرار العملي، لا من زاوية المقارنة النظرية فقط.',
          chooseTitle: 'كيف تستخدم صفحات المقارنات بشكل صحيح؟',
          chooseDescription:
            'ابدأ بالمقارنة الأقرب لسؤالك الحالي، ثم افتح الحالة أو المقال الذي يشرح لك ماذا تفعل بعد ذلك بدل أن تتوقف عند المقارنة وحدها.',
          chooseCards: [
            {
              title: 'إذا كنت تقارن مع ChatGPT',
              text: 'ابدأ هنا عندما يكون سؤالك: هل يكفيني سؤال واحد، أم أحتاج مسار قرار وتحليل وتوثيق؟',
            },
            {
              title: 'إذا كنت تقارن مع جداول الجدوى',
              text: 'ابدأ هنا عندما يكون سؤالك: هل أحتاج ملف أرقام فقط، أم مسار يبدأ من الفكرة ثم الجدوى ثم التحقق؟',
            },
            {
              title: 'إذا كنت تقارن مع ملاحظات السوق',
              text: 'ابدأ هنا عندما يكون سؤالك: هل أريد مجرد أرشيف ملاحظات، أم تحويلها إلى قرار وخطوة عملية؟',
            },
          ],
          contextTitle: 'مقالات تساعدك قبل أو بعد المقارنة',
          contextDescription:
            'هذه المقالات تشرح الخلفية العملية التي تجعل المقارنة أوضح، خصوصًا إذا كنت ما زلت تبني فهمك قبل الاشتراك أو قبل تجربة التحليل.',
          readArticle: 'اقرأ المقال',
        }
      : {
          eyebrow: 'Comparisons',
          title: 'Madixo vs. the alternatives you are already using.',
          description:
            'See exactly where Madixo adds value compared to ChatGPT, spreadsheets, and generic research notes — so you can decide if it is worth switching.',
          start: 'Start analysis',
          pricing: 'See plans',
          open: 'Open comparison',
          blog: 'Blog',
          useCases: 'Use cases',
          helperTitle: 'See the practical context before judging the tool',
          helperDescription:
            'If you are still in the understanding stage, the blog and use cases help you see the difference through real decision-making context, not only a theoretical comparison.',
          chooseTitle: 'How should you use comparison pages?',
          chooseDescription:
            'Start with the comparison closest to your current question, then open the related use case or article so you move forward instead of stopping at the comparison alone.',
          chooseCards: [
            {
              title: 'If you are comparing with ChatGPT',
              text: 'Start here when your question is whether a single answer is enough or you need a workflow for analysis, evidence, and decision-making.',
            },
            {
              title: 'If you are comparing with spreadsheets',
              text: 'Start here when your question is whether you only need a numbers file or a workflow from idea to feasibility to validation.',
            },
            {
              title: 'If you are comparing with generic notes',
              text: 'Start here when your question is whether you only want to store notes or turn them into a clearer next move.',
            },
          ],
          contextTitle: 'Articles that help before or after the comparison',
          contextDescription:
            'These articles explain the practical background that makes the comparison clearer, especially if you are still building understanding before subscribing or running analysis.',
          readArticle: 'Read article',
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
            <Link href="/use-cases" className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]">
              {copy.useCases}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.chooseTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.chooseDescription}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {copy.chooseCards.map((card) => (
              <div key={card.title} className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5">
                <h3 className="text-lg font-bold text-[#111827]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#475467]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 md:grid-cols-2 xl:grid-cols-2">
        {items.map((item) => (
          <article key={item.slug} className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6">
            <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
              {localizeText(item.compareAgainst, uiLang)}
            </span>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
              {localizeText(item.title, uiLang)}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
              {localizeText(item.summary, uiLang)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/compare-to/${item.slug}`} className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">
                {copy.open}
              </Link>
              <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:w-auto">
                {copy.pricing}
              </Link>
            </div>
          </article>
        ))}
      </section>

      {featuredPosts.length ? (
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.contextTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
              {copy.contextDescription}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-[24px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm hover:bg-[#F9FAFB]"
                >
                  <h3 className="text-lg font-bold leading-tight text-[#111827]">{localizeText(post.title, uiLang)}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#475467]">{localizeText(post.excerpt, uiLang)}</p>
                  <div className="mt-4 text-sm font-semibold text-[#111827]">{copy.readArticle}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
