'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getClientUiLanguage, type UiLanguage } from '@/lib/ui-language';

const COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'About Madixo',
    title: 'A clearer way to evaluate an idea before committing too deeply.',
    description:
      'Madixo was built to help founders and operators move from a raw idea into a clearer venture decision through structured analysis, early feasibility, market evidence, and the next practical step.',
    section1Title: 'What Madixo is',
    section1Body:
      'Madixo is an AI opportunity analysis workspace. It is designed to help you analyze an idea, understand whether the opportunity looks strong, explore an early feasibility view, capture market notes, and decide what to do next.',
    section2Title: 'What Madixo is not',
    section2Body:
      'It is not just a one-time idea generator, and it is not a replacement for real market learning. The goal is to make your judgment sharper before deeper execution, not to create false certainty.',
    section3Title: 'Why it was built',
    section3Body:
      'Many founders jump from an early idea directly into building, branding, hiring, or spending on ads before the opportunity is clear enough. Madixo was built to create a calmer middle layer between raw idea and full execution.',
    section4Title: 'Best fit for',
    section4Items: [
      'Founders validating a new startup idea',
      'Operators reviewing whether an opportunity deserves deeper work',
      'Small teams that want clearer evidence before commitment',
    ],
    section5Title: 'How the workflow works',
    section5Items: [
      'Start with the idea, target market, and target customer',
      'Generate a structured opportunity analysis',
      'Move into an early feasibility view when needed',
      'Turn the idea into a validation workspace and save market notes',
      'Use the evidence to decide whether to continue, adjust, or stop',
    ],
    primary: 'Start Opportunity Analysis',
    secondary: 'See plans',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'من نحن',
    title: 'طريقة أوضح لتقييم الفكرة قبل الدخول في التزام أعمق.',
    description:
      'بُني Madixo ليساعد المؤسس أو المشغّل على الانتقال من فكرة أولية إلى قرار أوضح، عبر تحليل منظم، ودراسة جدوى أولية، وملاحظات سوق، ثم خطوة عملية تالية.',
    section1Title: 'ما هو Madixo',
    section1Body:
      'Madixo هو مساحة عمل لتحليل الفرص. هدفه أن يساعدك على فهم الفكرة، وقياس قوة الفرصة، واستكشاف الجدوى الأولية، وتسجيل ملاحظات السوق، ثم تحديد الخطوة التالية بشكل أوضح.',
    section2Title: 'ما الذي لا يقدمه Madixo',
    section2Body:
      'هو ليس مجرد مولد أفكار سريع، وليس بديلًا عن التعلم الحقيقي من السوق. الهدف هو جعل حكمك أوضح قبل التنفيذ الأعمق، لا أن يعطيك يقينًا وهميًا.',
    section3Title: 'لماذا بُني',
    section3Body:
      'كثير من المؤسسين ينتقلون من فكرة أولية مباشرة إلى البناء أو الهوية أو التوظيف أو الإعلانات قبل أن تتضح الفرصة بما يكفي. بُني Madixo ليصنع طبقة وسطى أهدأ بين الفكرة الخام والتنفيذ الكامل.',
    section4Title: 'الأنسب لـ',
    section4Items: [
      'المؤسسين الذين يختبرون فكرة مشروع جديدة',
      'المشغلين الذين يراجعون هل الفرصة تستحق عملًا أعمق',
      'الفرق الصغيرة التي تريد دليلًا أوضح قبل الالتزام',
    ],
    section5Title: 'كيف يعمل المسار',
    section5Items: [
      'ابدأ من الفكرة والسوق والعميل المستهدف',
      'أنشئ تحليل فرصة منظمًا',
      'انتقل إلى دراسة الجدوى الأولية عند الحاجة',
      'حوّل الفكرة إلى مساحة تحقق وسجل ملاحظات السوق',
      'استخدم ما تعلمته لتقرر: استمر، عدّل، أو توقف',
    ],
    primary: 'ابدأ تحليل الفرصة',
    secondary: 'شاهد الباقات',
  },
} as const;

export default function AboutPage() {
  const [uiLang, setUiLang] = useState<UiLanguage>('en');

  useEffect(() => {
    setUiLang(getClientUiLanguage('en'));
  }, []);

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

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {copy.primary}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9]"
            >
              {copy.secondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.section1Title}</h2>
            <p className="mt-4 text-base leading-8 text-[#4B5563]">{copy.section1Body}</p>
          </section>

          <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.section2Title}</h2>
            <p className="mt-4 text-base leading-8 text-[#4B5563]">{copy.section2Body}</p>
          </section>

          <section className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.section3Title}</h2>
            <p className="mt-4 text-base leading-8 text-[#4B5563]">{copy.section3Body}</p>
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.section4Title}</h2>
            <div className="mt-4 space-y-3">
              {copy.section4Items.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[#D9E2F0] bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{copy.section5Title}</h2>
            <div className="mt-4 space-y-3">
              {copy.section5Items.map((item) => (
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

      <SiteFooter uiLang={uiLang} />
    </main>
  );
}
