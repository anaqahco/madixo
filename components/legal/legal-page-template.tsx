'use client';

import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { useUiLanguageState } from '@/components/ui-language-provider';

type Section = {
  title: string;
  body: string;
  bullets?: readonly string[];
};

type Copy = {
  en: {
    dir: 'ltr';
    eyebrow: string;
    title: string;
    description: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    sections: readonly Section[];
    contactTitle: string;
    contactBody: string;
    contactCta: string;
    secondaryCta: string;
    pricingCta?: string;
  };
  ar: {
    dir: 'rtl';
    eyebrow: string;
    title: string;
    description: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    sections: readonly Section[];
    contactTitle: string;
    contactBody: string;
    contactCta: string;
    secondaryCta: string;
    pricingCta?: string;
  };
};

type Props = {
  copy: Copy;
};

export default function LegalPageTemplate({ copy }: Props) {
  const [uiLang, setUiLang] = useUiLanguageState();
  const content = copy[uiLang];
  const isArabic = uiLang === 'ar';

  return (
    <main dir={content.dir} className="min-h-screen bg-[#FAFAFB] text-[#111827]">
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

      <section className="mx-auto max-w-5xl px-6 pb-10 pt-10 md:pt-12">
        <div className="rounded-[32px] border border-[#D9E2F0] bg-[#F7F9FC] p-8 shadow-sm md:p-10">
          <p className="text-sm font-medium text-[#6B7280]">{content.eyebrow}</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">{content.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#4B5563] md:text-lg">{content.description}</p>
            </div>

            <div className={`rounded-[18px] border border-[#D9E2F0] bg-white px-4 py-3 ${isArabic ? 'md:text-right' : 'md:text-left'}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                {content.lastUpdatedLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#111827]">{content.lastUpdatedValue}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="space-y-6">
          {content.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-[#D9E2F0] bg-white p-6 shadow-sm md:p-7"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-[#4B5563]">{section.body}</p>

              {section.bullets?.length ? (
                <div className="mt-5 grid gap-3">
                  {section.bullets.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-[#D9E2F0] bg-[#F8FAFD] px-4 py-3 text-sm leading-7 text-[#374151]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-2">
        <div className="rounded-[28px] border border-[#D9E2F0] bg-[#F7F9FC] p-6 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{content.contactTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4B5563]">{content.contactBody}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:support@madixo.ai"
              className="inline-flex rounded-full border border-[#111827] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {content.contactCta}
            </a>
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9]"
            >
              {content.secondaryCta}
            </Link>
            {content.pricingCta ? (
              <Link
                href="/pricing"
                className="inline-flex rounded-full border border-[#D9E2F0] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EEF3F9]"
              >
                {content.pricingCta}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter uiLang={uiLang} />
    </main>
  );
}
