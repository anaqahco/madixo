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
      className="h-auto w-[170px] md:w-[190px]"
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
        <div className="flex flex-col gap-4 md:gap-5">
          <div className="flex items-center justify-between gap-4">
            <div
              className={`flex min-w-0 items-center gap-3 ${
                isArabic ? 'order-1 text-right' : 'order-2 text-left'
              }`}
            >
              <Link href="/" className="shrink-0" aria-label="Madixo home">
                <MadixoLogo />
              </Link>

              <div className="hidden min-w-0 md:block">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  MADIXO
                </p>
                <p className="truncate text-sm text-[#4B5563]">{copy.brandHint}</p>
              </div>
            </div>

            <LanguageSwitcher
              value={uiLang}
              className={isArabic ? 'order-2' : 'order-1'}
            />
          </div>

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
  );
}
