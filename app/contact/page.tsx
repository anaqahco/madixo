'use client';

import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { useUiLanguageState } from '@/components/ui-language-provider';

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Contact',
    title: 'The simplest way to reach Madixo right now.',
    description:
      'For support, billing, account questions, product feedback, or general business inquiries, email us directly and keep the subject clear so we can route it faster.',
    emailTitle: 'Primary email',
    email: 'support@madixo.ai',
    emailHint:
      'Suggested subjects: Support, Billing, Feedback, Partnership, or Question.',
    topicsTitle: 'Best reasons to contact us',
    topics: [
      'Account access or login issues',
      'Billing, subscription, or payment questions',
      'Product feedback or feature requests',
      'Partnerships or business inquiries',
    ],
    responseTitle: 'What to include',
    responseItems: [
      'A clear subject line',
      'The email address used in your account if relevant',
      'A short explanation of the issue or request',
    ],
    primary: 'Email Madixo',
    secondary: 'Back to Home',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'تواصل معنا',
    title: 'أبسط طريقة للتواصل مع Madixo في الوقت الحالي.',
    description:
      'للدعم، أو الفوترة، أو مشاكل الحساب، أو ملاحظات المنتج، أو الاستفسارات العامة، راسلنا مباشرة عبر البريد واجعل عنوان الرسالة واضحًا حتى يصل الطلب بسرعة إلى المسار الصحيح.',
    emailTitle: 'البريد الأساسي',
    email: 'support@madixo.ai',
    emailHint:
      'أمثلة على عنوان الرسالة: دعم، فوترة، ملاحظات، شراكة، أو سؤال عام.',
    topicsTitle: 'أهم الأسباب المناسبة للتواصل',
    topics: [
      'مشاكل الدخول أو الوصول إلى الحساب',
      'أسئلة الفوترة أو الاشتراك أو الدفع',
      'ملاحظات المنتج أو طلب ميزة جديدة',
      'الشراكات أو الاستفسارات التجارية',
    ],
    responseTitle: 'ما الأفضل أن تضعه في الرسالة',
    responseItems: [
      'عنوان رسالة واضح',
      'البريد المستخدم في الحساب إذا كان الموضوع متعلقًا بالحساب',
      'شرح قصير وواضح للمشكلة أو الطلب',
    ],
    primary: 'راسل Madixo',
    secondary: 'العودة للرئيسية',
  },
} as const;

export default function ContactPage() {
  const [uiLang, setUiLang] = useUiLanguageState();

  const copy = COPY[uiLang];

  return (
    <main dir={copy.dir} className="min-h-screen bg-[#FAFAFB] text-[#111827]">
      <section className="px-6 pt-6 md:pt-8">
        <SiteHeader
          uiLang={uiLang}
          onLanguageChange={setUiLang}
          logo={
            <Image
              src="/brand/madixo-logo.png"
              alt="Madixo"
              width={220}
              height={56}
              priority
              className="h-auto w-[170px] md:w-[220px]"
            />
          }
        />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14 pt-10 md:pt-12">
        <div className="rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-8 shadow-sm md:p-10">
          <p className="text-sm font-medium text-[#6B7280]">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">
            {copy.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-[1.15fr,0.85fr]">
          <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.emailTitle}</h2>

            <div className="mt-5 rounded-[22px] border border-[#D9E2F0] bg-[#F8FAFD] p-5">
              <a
                href={`mailto:${copy.email}`}
                className="text-xl font-semibold text-[#111827] hover:underline"
              >
                {copy.email}
              </a>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">{copy.emailHint}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${copy.email}`}
                className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {copy.primary}
              </a>
              <Link
                href="/"
                className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9]"
              >
                {copy.secondary}
              </Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.topicsTitle}</h2>
            <div className="mt-4 space-y-3">
              {copy.topics.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[#D9E2F0] bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.responseTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {copy.responseItems.map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-4 text-sm leading-7 text-[#374151]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter uiLang={uiLang} />
    </main>
  );
}
