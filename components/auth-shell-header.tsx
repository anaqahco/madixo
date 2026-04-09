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
  },
  ar: {
    home: 'الرئيسية',
    pricing: 'الباقات',
    blog: 'المدونة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
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
      className="h-auto w-[150px] sm:w-[170px] md:w-[210px]"
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
    'rounded-full border px-[13px] py-[9px] text-[13px] font-semibold leading-none transition-colors duration-200 sm:px-[15px] sm:py-[10px] sm:text-[14px]';
  const secondaryPill =
    'border-[#DCE4EE] bg-white text-[#374151] hover:bg-[#F8FAFC]';
  const primaryPill =
    'border-[#111827] bg-[#111827] text-white hover:bg-[#0F172A]';

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-5 sm:py-4 md:rounded-[28px] md:px-7 md:py-4">
        <div
          className={`flex min-h-[52px] items-center justify-between gap-3 sm:min-h-[60px] sm:gap-4 md:min-h-[72px] md:gap-5 ${
            isArabic ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Link href="/" className="shrink-0" aria-label="Madixo home">
            <MadixoLogo />
          </Link>

          <LanguageSwitcher value={uiLang} className="shrink-0" />
        </div>

        <div className="mt-3 border-t border-[#EEF2F7] pt-3 sm:mt-4 sm:pt-4">
          <div
            className={`flex flex-wrap items-center gap-2.5 ${
              isArabic ? 'justify-end' : 'justify-start'
            }`}
          >
            <Link href="/" className={`${pillBase} whitespace-nowrap ${secondaryPill}`}>
              {copy.home}
            </Link>

            <Link href="/pricing" className={`${pillBase} whitespace-nowrap ${secondaryPill}`}>
              {copy.pricing}
            </Link>

            <Link href="/blog" className={`${pillBase} whitespace-nowrap ${secondaryPill}`}>
              {copy.blog}
            </Link>

            {showAuthActions ? (
              <>
                <Link
                  href="/login?mode=login&next=%2Freports"
                  className={`${pillBase} whitespace-nowrap ${secondaryPill}`}
                >
                  {copy.login}
                </Link>

                <Link
                  href="/login?mode=signup&next=%2Freports"
                  className={`${pillBase} whitespace-nowrap ${primaryPill}`}
                >
                  {copy.signup}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
