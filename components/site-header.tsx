'use client';

import type { ReactNode } from 'react';
import LanguageSwitcher from '@/components/language-switcher';
import AuthActions from '@/components/auth-actions';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  uiLang: UiLanguage;
  onLanguageChange: (language: UiLanguage) => void;
  logo: ReactNode;
  maxWidthClass?: string;
  className?: string;
};

export default function SiteHeader({
  uiLang,
  onLanguageChange,
  logo,
  maxWidthClass = 'max-w-6xl',
  className = '',
}: Props) {
  const isArabic = uiLang === 'ar';

  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`}>
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-5 sm:py-4 md:rounded-[28px] md:px-7 md:py-4">
        <div dir="ltr" className="flex min-h-[56px] items-center justify-between gap-4 sm:min-h-[64px] md:min-h-[72px] md:gap-5">
          <div className={`shrink-0 ${isArabic ? 'order-1' : 'order-2'}`}>{logo}</div>

          <LanguageSwitcher
            value={uiLang}
            onChange={onLanguageChange}
            className={`shrink-0 ${isArabic ? 'order-2' : 'order-1'}`}
          />
        </div>

        <div className="mt-3 border-t border-[#EEF2F7] pt-3 sm:mt-4 sm:pt-4">
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
