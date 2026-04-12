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
          title: 'كيف يستخدم الناس Madixo لاختبار الفكرة وقراءة الجدوى واتخاذ القرار؟',
          description:
            'استكشف حالات استخدام عملية توضّح أين يفيد Madixo أكثر: للمؤسسين الجدد، والمشاريع الخدمية، والوكالات، والاستشاريين، وأفكار المنتجات والمتاجر الإلكترونية.',
          start: 'ابدأ التحليل',
          pricing: 'شاهد الباقات',
          blog: 'اقرأ المدونة',
          open: 'افتح الحالة',
          fitTitle: 'متى تكون هذه الصفحة مفيدة لك؟',
          fitPoints: [
            'إذا كنت تريد معرفة أين يناسب Madixo حالتك الفعلية قبل الاشتراك.',
            'إذا كنت تريد أمثلة عملية على الانتقال من تحليل الفكرة إلى دراسة الجدوى الأولية ثم التحقق.',
            'إذا كنت تقارن بين استخدام Madixo كمؤسس أو كفريق أو كمستشار.',
          ],
          cardBestFor: 'مناسب لـ',
          cardUseFor: 'استخدم Madixo من أجل',
          bridgeTitle: 'من حالات الاستخدام إلى التطبيق العملي',
          bridgeDescription:
            'بعد أن تعرف الحالة الأقرب لك، انتقل إلى الصفحة الرئيسية لبدء التحليل، أو إلى المدونة لتقرأ الأدلة العملية، أو إلى الباقات لتختار العمق المناسب.',
        }
      : {
          eyebrow: 'Use Cases',
          title: 'How people use Madixo to validate ideas, read feasibility, and make clearer decisions',
          description:
            'Explore practical use cases that show where Madixo fits best for first-time founders, service businesses, agencies, consultants, and product or ecommerce ideas.',
          start: 'Start analysis',
          pricing: 'See plans',
          blog: 'Read the blog',
          open: 'Open use case',
          fitTitle: 'When this page is useful',
          fitPoints: [
            'When you want to understand whether Madixo fits your exact situation before subscribing.',
            'When you want practical examples of moving from idea analysis into early feasibility and validation.',
            'When you are comparing how Madixo fits founders, teams, consultants, or service businesses.',
          ],
          cardBestFor: 'Best for',
          cardUseFor: 'Use Madixo for',
          bridgeTitle: 'From use cases into practical action',
          bridgeDescription:
            'Once you identify the closest use case, move into the homepage to start analysis, read the blog for practical guidance, or open pricing to choose the right depth.',
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
            {copy.start}
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-[#D9E2F0] bg-white px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] sm:px-6"
          >
            {copy.pricing}
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9] sm:px-6"
          >
            {copy.blog}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6 lg:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {copy.fitTitle}
          </h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#475467] sm:text-base md:grid-cols-3">
            {copy.fitPoints.map((point) => (
              <li key={point} className="rounded-2xl border border-[#D9E2F0] bg-white px-4 py-4">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 md:grid-cols-2 xl:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.slug}
            className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-5 shadow-sm sm:p-6"
          >
            <span className="rounded-full border border-[#D9E2F0] bg-white px-3 py-1 text-xs font-semibold text-[#4B5563]">
              {localizeText(item.industry, uiLang)}
            </span>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
              {localizeText(item.title, uiLang)}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
              {localizeText(item.summary, uiLang)}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#D9E2F0] bg-white p-4">
                <h3 className="text-sm font-bold text-[#111827]">{copy.cardBestFor}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#475467]">
                  {item.bestFor.slice(0, 3).map((point) => (
                    <li key={localizeText(point, uiLang)}>• {localizeText(point, uiLang)}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#D9E2F0] bg-white p-4">
                <h3 className="text-sm font-bold text-[#111827]">{copy.cardUseFor}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#475467]">
                  {item.useMadixoFor.slice(0, 3).map((point) => (
                    <li key={localizeText(point, uiLang)}>• {localizeText(point, uiLang)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/use-cases/${item.slug}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
              >
                {copy.open}
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
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {copy.bridgeTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475467] sm:text-base sm:leading-8">
            {copy.bridgeDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {copy.start}
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              {copy.blog}
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-5 py-3 text-sm font-semibold text-[#374151] hover:bg-[#EEF3F9]"
            >
              {copy.pricing}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
