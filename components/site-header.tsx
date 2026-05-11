'use client';

import { useState, useEffect, useRef } from 'react';
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
    menu: 'Menu',
  },
  ar: {
    home: 'الرئيسية',
    pricing: 'الباقات',
    blog: 'المقالات',
    useCases: 'حالات الاستخدام',
    comparisons: 'المقارنات',
    menu: 'القائمة',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

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
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`} ref={menuRef}>
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-5 sm:py-3.5 md:rounded-[28px] md:px-7 md:py-4">

        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex items-center justify-between gap-3"
        >
          <div className="shrink-0">{logo}</div>

          {showPrimaryLinks ? (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.active
                      ? 'text-[#0F766E] bg-[#CCFBF1]'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher
              value={uiLang}
              onChange={onLanguageChange}
              className="shrink-0"
            />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] transition hover:bg-[#F3F4F6] sm:h-11 sm:w-11"
              aria-label={navCopy.menu}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className="mt-3 border-t border-[#EEF2F7] pt-4 animate-[fadeIn_150ms_ease-out]"
          >
            {showPrimaryLinks ? (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        'flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                        item.active
                          ? 'bg-[#0F766E] text-white'
                          : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-[#EEF2F7] pt-3">
              <AuthActions uiLang={uiLang} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
