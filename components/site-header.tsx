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
      <div
        dir="ltr"
        className="flex flex-col gap-4 rounded-[28px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:flex-row md:items-start md:justify-between md:px-6"
      >
        <div className={`shrink-0 ${isArabic ? 'md:order-1' : 'md:order-2'}`}>
          {logo}
        </div>

        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`flex w-full flex-col gap-3 md:w-auto md:max-w-[640px] ${
            isArabic ? 'md:order-2 md:items-end' : 'md:order-1 md:items-start'
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
