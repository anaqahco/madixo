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
    'rounded-full border px-[15px] py-[10px] text-[14px] font-semibold leading-none transition-colors duration-200';
  const secondaryPill =
    'border-[#DCE4EE] bg-white text-[#374151] hover:bg-[#F8FAFC]';
  const primaryPill =
    'border-[#111827] bg-[#111827] text-white hover:bg-[#0F172A]';

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white/95 px-5 py-4 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:px-7 md:py-4">
        <div
          className={`flex min-h-[64px] items-center justify-between gap-5 md:min-h-[72px] ${
            isArabic ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Link href="/" className="shrink-0" aria-label="Madixo home">
            <MadixoLogo />
          </Link>

          <LanguageSwitcher value={uiLang} className="shrink-0" />
        </div>

        <div className="mt-4 border-t border-[#EEF2F7] pt-4">
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
