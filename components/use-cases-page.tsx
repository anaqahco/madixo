'use client';

import Link from 'next/link';
import { localizeText, type BlogPost, type UseCasePage } from '@/lib/blog';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Props = {
  items: UseCasePage[];
  featuredPosts: BlogPost[];
};

export default function UseCasesPageClient({ items, featuredPosts }: Props) {
  const [uiLang] = useUiLanguageState();

  const copy =
    uiLang === 'ar'
      ? {
          eyebrow: 'حالات الاستخدام',
          title: 'شف كيف مؤسسين مثلك يستخدمون Madixo.',
          description:
            'سيناريوهات حقيقية توضح كيف Madixo يساعد أنواع مختلفة من المشاريع — من المؤسسين الجدد للشركات الخدمية وفرق المنتجات.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          open: 'افتح الحالة',
          blog: 'المقالات',
          comparisons: 'المقارنات',
          helperTitle: 'هل تريد فهمًا أعمق قبل اختيار الحالة؟',
          helperDescription:
            'يمكنك قراءة المقالات أولًا لفهم الفكرة والطلب والجدوى، أو الانتقال إلى المقارنات إذا كنت تقارن بين Madixo وبدائل أخرى.',
          chooseTitle: 'اختر الحالة الأقرب لوضعك الحالي',
          chooseDescription:
            'هذه الصفحة لا تشرح فقط ما الذي يفعله Madixo، بل متى يكون مناسبًا أكثر حسب نوع المشروع وما تريد الوصول إليه بعد القراءة.',
          chooseCards: [
            {
              title: 'إذا كنت مؤسسًا جديدًا',
              text: 'ابدأ بالحالة التي تعطيك مسارًا أوضح من فرز الفكرة إلى الجدوى الأولية ثم التحقق العملي.',
            },
            {
              title: 'إذا كان مشروعك خدميًا',
              text: 'ابدأ بالحالة التي تساعدك على اختبار العرض والسعر والطلب قبل التوسع أو التوظيف.',
            },
            {
              title: 'إذا كنت وكالة أو مستشارًا',
              text: 'ابدأ بالحالة التي توضّح كيف تستخدم Madixo داخليًا أو مع العميل بدل الاكتفاء بتقرير جامد.',
            },
            {
              title: 'إذا لديك منتج أو متجر',
              text: 'ابدأ بالحالة التي تركّز على وضوح الرغبة والهامش والبداية المناسبة قبل الالتزام بالمخزون أو التصنيع.',
            },
          ],
          contextTitle: 'مقالات تساعدك على اختيار الحالة الصحيحة',
          contextDescription:
            'هذه المقالات تعطيك خلفية عملية قبل أن تفتح حالة الاستخدام أو بعدها حتى تتحول القراءة إلى خطوة أوضح.',
          readArticle: 'اقرأ المقال',
        }
      : {
          eyebrow: 'Use Cases',
          title: 'See how founders like you use Madixo.',
          description:
            'Real scenarios showing how Madixo helps different business types — from first-time founders to service businesses and product teams.',
          start: 'Start analysis',
          pricing: 'See plans',
          open: 'Open use case',
          blog: 'Blog',
          comparisons: 'Comparisons',
          helperTitle: 'Need deeper context before choosing a use case?',
          helperDescription:
            'You can read the blog first to understand ideas, demand, and feasibility, or move into comparisons if you are evaluating Madixo against alternatives.',
          chooseTitle: 'Choose the use case closest to your current situation',
          chooseDescription:
            'This page is not only about what Madixo does. It is about when it fits best depending on your project type and what you want to reach after reading.',
          chooseCards: [
            {
              title: 'If you are a first-time founder',
              text: 'Start with the path that gives you a clearer route from sorting the idea to early feasibility and practical validation.',
            },
            {
              title: 'If your business is service-based',
              text: 'Start with the path that helps you test offer, pricing, and demand before scaling or hiring.',
            },
            {
              title: 'If you are an agency or consultant',
              text: 'Start with the path that shows how Madixo works internally or with clients instead of ending at a static report.',
            },
            {
              title: 'If you have a product or store idea',
              text: 'Start with the path focused on demand clarity, margin, and a sensible first move before inventory or manufacturing commitments.',
            },
          ],
          contextTitle: 'Articles that help you choose the right use case',
          contextDescription:
            'These articles give you practical background before or after opening a use case so the reading turns into a clearer next step.',
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
          <Link href="/" className="rounded-full bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0D9488] sm:px-6">
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

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">{copy.chooseTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.chooseDescription}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
