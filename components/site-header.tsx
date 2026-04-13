'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const NAV_COPY = {
  en: {
    home: 'Home',
    pricing: 'Plans',
    blog: 'Blog',
    useCases: 'Use Cases',
    comparisons: 'Comparisons',
  },
  ar: {
    home: 'الرئيسية',
    pricing: 'الباقات',
    blog: 'المقالات',
    useCases: 'حالات الاستخدام',
    comparisons: 'المقارنات',
  },
} as const;

function isMarketingPath(pathname: string) {
  return ![
    '/dashboard',
    '/results',
    '/reports',
    '/validate',
    '/upgrade',
  ].some((prefix) => pathname.startsWith(prefix));
}

export default function SiteHeader({
  uiLang,
  onLanguageChange,
  logo,
  maxWidthClass = 'max-w-6xl',
  className = '',
}: Props) {
  const pathname = usePathname();
  const isArabic = uiLang === 'ar';
  const navCopy = NAV_COPY[uiLang];
  const showPrimaryLinks = isMarketingPath(pathname);

  const navItems = [
    { href: '/', label: navCopy.home, active: pathname === '/' },
    { href: '/pricing', label: navCopy.pricing, active: pathname === '/pricing' },
    {
      href: '/blog',
      label: navCopy.blog,
      active: pathname === '/blog' || pathname.startsWith('/blog/'),
    },
    {
      href: '/use-cases',
      label: navCopy.useCases,
      active: pathname === '/use-cases' || pathname.startsWith('/use-cases/'),
    },
    {
      href: '/compare-to',
      label: navCopy.comparisons,
      active: pathname === '/compare-to' || pathname.startsWith('/compare-to/'),
    },
  ];

  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`}>
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-5 sm:py-4 md:rounded-[28px] md:px-7 md:py-4">
        <div dir="ltr" className="flex min-h-[52px] items-center justify-between gap-3 sm:min-h-[60px] sm:gap-4 md:min-h-[72px] md:gap-5">
          <div className={`shrink-0 ${isArabic ? 'order-1' : 'order-2'}`}>{logo}</div>

          <LanguageSwitcher
            value={uiLang}
            onChange={onLanguageChange}
            className={`shrink-0 ${isArabic ? 'order-2' : 'order-1'}`}
          />
        </div>

        {showPrimaryLinks ? (
          <div className="mt-3 border-t border-[#EEF2F7] pt-3 sm:mt-4 sm:pt-4">
            <div
              dir={isArabic ? 'rtl' : 'ltr'}
              className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition',
                    item.active
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#D9E2F0] bg-[#F8FAFD] text-[#374151] hover:bg-[#EEF3F9]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3 border-t border-[#EEF2F7] pt-3 sm:mt-4 sm:pt-4">
          <AuthActions uiLang={uiLang} />
        </div>
      </div>
    </div>
  );
}
