'use client';

import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from '@/components/language-switcher';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  uiLang: UiLanguage;
  showAuthActions?: boolean;
};

const COPY = {
  en: {
    home: 'Home',
    pricing: 'Plans',
    blog: 'Blog',
    login: 'Log In',
    signup: 'Create Account',
    brandHint: 'Opportunity analysis workspace',
  },
  ar: {
    home: 'الرئيسية',
    pricing: 'الباقات',
    blog: 'المدونة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    brandHint: 'مساحة عمل لتحليل الفرص',
  },
} as const;

function MadixoLogo() {
  return (
    <Image
      src="/brand/madixo-logo.png"
      alt="Madixo"
      width={210}
      height={54}
      priority
      className="h-auto w-[175px] md:w-[210px]"
    />
  );
}

export default function AuthShellHeader({
  uiLang,
  showAuthActions = true,
}: Props) {
  const copy = COPY[uiLang];
  const isArabic = uiLang === 'ar';

  const pillBase =
    'rounded-full border px-4 py-2 text-sm font-semibold transition';
  const secondaryPill =
    'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]';
  const primaryPill =
    'border-[#111827] bg-[#111827] text-white hover:opacity-90';

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 md:py-5">
        <div
          className={`flex flex-col gap-5 ${
            isArabic ? 'md:flex-row' : 'md:flex-row-reverse'
          } md:items-start md:gap-8`}
        >
          <div
            className={`flex shrink-0 ${
              isArabic ? 'md:justify-start' : 'md:justify-end'
            } md:w-[220px] md:pt-4 lg:w-[260px]`}
          >
            <div className={`flex min-w-0 items-center gap-4 ${isArabic ? '' : 'md:flex-row-reverse'}`}>
              <Link href="/" className="shrink-0" aria-label="Madixo home">
                <MadixoLogo />
              </Link>

              <div className={`hidden min-w-0 md:block ${isArabic ? 'text-right' : 'text-left'}`}>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  MADIXO
                </p>
                <p className="truncate text-sm text-[#4B5563]">{copy.brandHint}</p>
              </div>
            </div>
          </div>

          <div
            className={`flex min-w-0 flex-1 flex-col gap-3 ${
              isArabic ? 'md:items-end' : 'md:items-start'
            }`}
          >
            <div className={`flex w-full ${isArabic ? 'justify-end' : 'justify-start'}`}>
              <LanguageSwitcher value={uiLang} />
            </div>

            <div className={`w-full ${isArabic ? 'md:ml-auto' : 'md:mr-auto'} md:max-w-[700px]`}>
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  isArabic ? 'justify-end' : 'justify-start'
                }`}
              >
                <Link href="/" className={`${pillBase} ${secondaryPill}`}>
                  {copy.home}
                </Link>

                <Link href="/pricing" className={`${pillBase} ${secondaryPill}`}>
                  {copy.pricing}
                </Link>

                <Link href="/blog" className={`${pillBase} ${secondaryPill}`}>
                  {copy.blog}
                </Link>

                {showAuthActions ? (
                  <>
                    <Link
                      href="/login?mode=login&next=%2Freports"
                      className={`${pillBase} ${secondaryPill}`}
                    >
                      {copy.login}
                    </Link>

                    <Link
                      href="/login?mode=signup&next=%2Freports"
                      className={`${pillBase} ${primaryPill}`}
                    >
                      {copy.signup}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
