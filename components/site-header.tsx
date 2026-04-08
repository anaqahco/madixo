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
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white/95 px-5 py-4 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:px-7 md:py-4">
        <div dir="ltr" className="flex min-h-[64px] items-center justify-between gap-5 md:min-h-[72px]">
          <div className={`shrink-0 ${isArabic ? 'order-1' : 'order-2'}`}>{logo}</div>

          <LanguageSwitcher
            value={uiLang}
            onChange={onLanguageChange}
            className={`shrink-0 ${isArabic ? 'order-2' : 'order-1'}`}
          />
        </div>

        <div className="mt-4 border-t border-[#EEF2F7] pt-4">
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
