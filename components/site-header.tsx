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
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 md:py-5">
        <div
          className={`flex items-center justify-between gap-4 ${
            uiLang === 'ar' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          <div className="shrink-0">{logo}</div>

          <LanguageSwitcher value={uiLang} onChange={onLanguageChange} />
        </div>

        <div className="mt-4 border-t border-[#F3F4F6] pt-4 md:mt-5 md:pt-5">
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
