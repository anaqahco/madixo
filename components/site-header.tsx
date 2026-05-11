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
    <div className={`mx-auto w-full ${maxWidthClass} ${className}`} ref={menuRef}>
      <div className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white/95 shadow-[0_8px_30px_rgba(17,24,39,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:rounded-[28px]">

        {/* Top bar */}
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 md:px-7 md:py-4"
        >
          {/* Logo */}
          <div className="shrink-0">{logo}</div>

          {/* Desktop nav — only visible on large screens */}
          {showPrimaryLinks ? (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
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

          {/* Right: Language + Hamburger */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher
              value={uiLang}
              onChange={onLanguageChange}
              className="shrink-0"
            />

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] transition hover:bg-[#F3F4F6] sm:h-10 sm:w-10"
              aria-label={navCopy.menu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown panel */}
        {menuOpen ? (
          <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className="border-t border-[#EEF2F7] px-4 py-4 sm:px-5 md:px-7"
            style={{ animation: 'fadeIn 150ms ease-out' }}
          >
            {/* Nav links — always show in dropdown on mobile, hide on lg since they are in the top bar */}
            {showPrimaryLinks ? (
              <div className="mb-4 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
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

            {/* Auth section */}
            <div className={showPrimaryLinks ? 'border-t border-[#EEF2F7] pt-4 lg:border-0 lg:pt-0' : ''}>
              <AuthActions uiLang={uiLang} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
