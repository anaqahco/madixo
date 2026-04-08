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
            {logo}
          </div>

          <div
            className={`flex min-w-0 flex-1 flex-col gap-3 ${
              isArabic ? 'md:items-end' : 'md:items-start'
            }`}
          >
            <div className={`flex w-full ${isArabic ? 'justify-end' : 'justify-start'}`}>
              <LanguageSwitcher value={uiLang} onChange={onLanguageChange} />
            </div>

            <div className={`w-full ${isArabic ? 'md:ml-auto' : 'md:mr-auto'} md:max-w-[700px]`}>
              <AuthActions uiLang={uiLang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
