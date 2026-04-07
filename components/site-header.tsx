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
  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`}>
      <div
        className={`flex flex-col gap-4 rounded-[28px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 ${
          uiLang === 'ar' ? 'md:flex-row-reverse' : 'md:flex-row'
        } md:items-start md:justify-between`}
      >
        <div className="shrink-0">{logo}</div>

        <div
          className={`flex w-full flex-col gap-3 md:w-auto md:max-w-[640px] ${
            uiLang === 'ar' ? 'md:items-start' : 'md:items-end'
          }`}
        >
          <LanguageSwitcher value={uiLang} onChange={onLanguageChange} />
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
