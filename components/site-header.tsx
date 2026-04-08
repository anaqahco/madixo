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
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 md:gap-5">
          <div
            className={`flex items-center justify-between gap-4 ${
              isArabic ? 'text-right' : 'text-left'
            }`}
          >
            <div className={`shrink-0 ${isArabic ? 'order-1' : 'order-2'}`}>{logo}</div>

            <LanguageSwitcher
              value={uiLang}
              onChange={onLanguageChange}
              className={isArabic ? 'order-2' : 'order-1'}
            />
          </div>

          <div className="w-full">
            <AuthActions uiLang={uiLang} />
          </div>
        </div>
      </div>
    </div>
  );
}
