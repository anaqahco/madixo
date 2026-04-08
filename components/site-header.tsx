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
      <div className="flex flex-col gap-4 rounded-[30px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:flex-row md:items-start md:justify-between md:gap-6 md:px-6 md:py-5">
        <div
          className={`order-1 shrink-0 md:order-2 ${
            isArabic ? 'md:self-start' : 'md:self-start'
          }`}
        >
          {logo}
        </div>

        <div
          className={`order-2 flex w-full flex-col gap-3 md:order-1 md:max-w-[760px] ${
            isArabic ? 'md:items-end' : 'md:items-start'
          }`}
        >
          <LanguageSwitcher
            value={uiLang}
            onChange={onLanguageChange}
            className={isArabic ? 'self-end' : 'self-start'}
          />
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
