'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SiteHeader from '@/components/site-header';
import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  initialUiLang: UiLanguage;
};

const COPY = {
  en: {
    blog: 'Blog',
    useCases: 'Use Cases',
    comparisons: 'Comparisons',
  },
  ar: {
    blog: 'المقالات',
    useCases: 'حالات الاستخدام',
    comparisons: 'المقارنات',
  },
} as const;

function MadixoLogo() {
  return (
    <Image
      src="/brand/madixo-logo.png"
      alt="Madixo"
      width={220}
      height={56}
      priority
      className="h-auto w-[170px] md:w-[220px]"
    />
  );
}

export default function ContentHubShell({ initialUiLang }: Props) {
  const pathname = usePathname();
  const [uiLang, setUiLang] = useState<UiLanguage>(initialUiLang);
  const copy = COPY[uiLang];

  const isBlog = pathname === '/blog' || pathname.startsWith('/blog/');
  const isUseCases = pathname === '/use-cases' || pathname.startsWith('/use-cases/');
  const isComparisons = pathname === '/compare-to' || pathname.startsWith('/compare-to/');

  const pillBase = 'rounded-full border px-4 py-2 text-sm font-semibold transition';
  const activePill = 'border-[#111827] bg-[#111827] text-white';
  const inactivePill =
    'border-[#D9E2F0] bg-white text-[#374151] hover:bg-[#F9FAFB]';

  return (
    <>
      <section className="px-6 pt-6 md:pt-8">
        <SiteHeader
          uiLang={uiLang}
          onLanguageChange={setUiLang}
          logo={<MadixoLogo />}
        />
      </section>

      <section className="px-6 pt-4">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center gap-3 ${
            uiLang === 'ar' ? 'justify-end' : 'justify-start'
          }`}
        >
          <Link
            href="/blog"
            className={`${pillBase} ${isBlog ? activePill : inactivePill}`}
          >
            {copy.blog}
          </Link>

          <Link
            href="/use-cases"
            className={`${pillBase} ${isUseCases ? activePill : inactivePill}`}
          >
            {copy.useCases}
          </Link>

          <Link
            href="/compare-to"
            className={`${pillBase} ${isComparisons ? activePill : inactivePill}`}
          >
            {copy.comparisons}
          </Link>
        </div>
      </section>
    </>
  );
}
