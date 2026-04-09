import Image from 'next/image';
import Link from 'next/link';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  uiLang: UiLanguage;
};

const COPY = {
  en: {
    dir: 'ltr',
    description:
      'Madixo helps founders move from idea analysis to early feasibility and a clearer next decision inside one focused workspace.',
    product: 'Product',
    company: 'Company',
    home: 'Home',
    pricing: 'Plans',
    blog: 'Blog',
    useCases: 'Use Cases',
    comparisons: 'Comparisons',
    about: 'About',
    contactPage: 'Contact',
    emailLabel: 'Email',
    emailValue: 'support@madixo.ai',
    emailHint: 'Support, billing, and product feedback.',
    cta: 'Start Opportunity Analysis',
    secondary: 'See Plans',
    copyright: 'All rights reserved.',
  },
  ar: {
    dir: 'rtl',
    description:
      'Madixo يساعد المؤسس على الانتقال من تحليل الفكرة إلى دراسة جدوى أولية ثم قرار أوضح حول الخطوة التالية داخل مساحة عمل واحدة.',
    product: 'المنتج',
    company: 'الشركة',
    home: 'الرئيسية',
    pricing: 'الباقات',
    blog: 'المدونة',
    useCases: 'حالات الاستخدام',
    comparisons: 'المقارنات',
    about: 'من نحن',
    contactPage: 'تواصل معنا',
    emailLabel: 'البريد الإلكتروني',
    emailValue: 'support@madixo.ai',
    emailHint: 'للدعم، والفوترة، وملاحظات المنتج.',
    cta: 'ابدأ تحليل الفرصة',
    secondary: 'شاهد الباقات',
    copyright: 'جميع الحقوق محفوظة.',
  },
} as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-[#4B5563] transition hover:text-[#111827]"
    >
      {label}
    </Link>
  );
}

export default function SiteFooter({ uiLang }: Props) {
  const copy = COPY[uiLang];
  const isArabic = uiLang === 'ar';

  const productLinks = [
    { href: '/', label: copy.home },
    { href: '/pricing', label: copy.pricing },
    { href: '/blog', label: copy.blog },
    { href: '/use-cases', label: copy.useCases },
    { href: '/compare-to', label: copy.comparisons },
  ];

  const companyLinks = [
    { href: '/about', label: copy.about },
    { href: '/contact', label: copy.contactPage },
  ];

  return (
    <footer dir={copy.dir} className="border-t border-[#E5E7EB] bg-[#FAFAFB]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
        <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6 md:rounded-[28px] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-12">
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/brand/madixo-logo.png"
                  alt="Madixo"
                  width={220}
                  height={56}
                  className="h-auto w-[165px] md:w-[205px]"
                />
              </Link>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4B5563] md:text-base md:leading-8">
                {copy.description}
              </p>

              <div
                className={`mt-5 flex flex-wrap gap-3 ${
                  isArabic ? 'justify-end' : 'justify-start'
                }`}
              >
                <Link
                  href="/"
                  className="inline-flex w-full justify-center rounded-full border border-[#111827] bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                >
                  {copy.cta}
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex w-full justify-center rounded-full border border-[#D9E2F0] bg-[#F8FAFD] px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#EEF3F9] sm:w-auto"
                >
                  {copy.secondary}
                </Link>
              </div>
            </div>

            <div className="w-full rounded-[22px] border border-[#D9E2F0] bg-[#F8FAFD] p-5 md:p-6">
              <p className={`text-xs font-semibold text-[#6B7280] ${isArabic ? 'text-right' : 'text-left'}`}>
                {copy.emailLabel}
              </p>
              <a
                href={`mailto:${copy.emailValue}`}
                className={`mt-2 block break-all text-lg font-semibold text-[#111827] hover:underline md:text-[1.75rem] ${
                  isArabic ? 'text-right' : 'text-left'
                }`}
              >
                {copy.emailValue}
              </a>
              <p className={`mt-3 text-sm leading-7 text-[#4B5563] ${isArabic ? 'text-right' : 'text-left'}`}>
                {copy.emailHint}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-[#E5E7EB] pt-6">
            {isArabic ? (
              <div className="grid gap-8 text-right sm:ml-auto sm:w-fit sm:grid-cols-[max-content_max-content] sm:gap-x-16 md:gap-x-24">
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">{copy.company}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {companyLinks.map((item) => (
                      <FooterLink key={item.href} href={item.href} label={item.label} />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">{copy.product}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {productLinks.map((item) => (
                      <FooterLink key={item.href} href={item.href} label={item.label} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 text-left sm:mr-auto sm:w-fit sm:grid-cols-[max-content_max-content] sm:gap-x-16 md:gap-x-24">
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">{copy.product}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {productLinks.map((item) => (
                      <FooterLink key={item.href} href={item.href} label={item.label} />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">{copy.company}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {companyLinks.map((item) => (
                      <FooterLink key={item.href} href={item.href} label={item.label} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`mt-8 border-t border-[#E5E7EB] pt-5 ${isArabic ? 'text-right' : 'text-left'}`}>
            <p className="text-xs text-[#9CA3AF]">© 2026 Madixo. {copy.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
