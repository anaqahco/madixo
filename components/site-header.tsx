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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

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
    <div className={`mx-auto w-full overflow-hidden ${maxWidthClass} ${className}`} ref={menuRef}>
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white/95 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:rounded-[24px] md:rounded-[28px]">

        {/* Top bar */}
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex min-h-[52px] items-center gap-2 px-3 py-2 sm:min-h-[60px] sm:gap-4 sm:px-5 sm:py-3 md:px-7 md:py-4"
        >
          {/* Logo — force smaller on mobile via child img override */}
          <div className="min-w-0 shrink [&_img]:!w-[120px] sm:[&_img]:!w-[170px] md:[&_img]:!w-[220px]">{logo}</div>

          {showPrimaryLinks ? (
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-[#CCFBF1] text-[#0F766E]'
                      : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher
              value={uiLang}
              onChange={onLanguageChange}
              className="shrink-0"
            />
            {/* Hamburger — mobile/tablet only */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] transition hover:bg-[#F3F4F6] sm:h-9 sm:w-9 lg:hidden"
              aria-label={navCopy.menu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop: Auth always visible */}
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="hidden border-t border-[#EEF2F7] px-3 pb-3 pt-3 sm:px-5 md:px-7 lg:block"
        >
          <AuthActions uiLang={uiLang} />
        </div>

        {/* Mobile dropdown */}
        {menuOpen ? (
          <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className="border-t border-[#EEF2F7] px-3 pb-4 pt-3 sm:px-5 lg:hidden"
            style={{ animation: 'fadeIn 150ms ease-out' }}
          >
            {showPrimaryLinks ? (
              <div className="mb-3">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        'flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
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

            <div className={showPrimaryLinks ? 'border-t border-[#EEF2F7] pt-3' : ''}>
              <AuthActions uiLang={uiLang} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
