'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type UiLanguage,
  setClientUiLanguage,
} from '@/lib/ui-language';

type Props = {
  value: UiLanguage;
  onChange?: (language: UiLanguage) => void;
  className?: string;
};

export default function LanguageSwitcher({
  value,
  onChange,
  className = '',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const baseButton =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm';
  const activeButton =
    'bg-[#111827] text-white shadow-sm';
  const inactiveButton =
    'bg-white text-[#374151] hover:bg-[#F9FAFB]';

  const handleChange = (language: UiLanguage) => {
    if (language === value) return;

    setClientUiLanguage(language);
    onChange?.(language);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('uiLang', language);

      const nextQuery = params.toString();
      const nextUrl = `${pathname}${nextQuery ? `?${nextQuery}` : ''}`;

      router.replace(nextUrl, { scroll: false });
      router.refresh();
    });
  };

  return (
    <div
      dir="ltr"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E5E7EB] bg-white p-1 ${className}`}
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => handleChange('en')}
        disabled={isPending}
        className={`${baseButton} ${value === 'en' ? activeButton : inactiveButton}`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => handleChange('ar')}
        disabled={isPending}
        className={`${baseButton} ${value === 'ar' ? activeButton : inactiveButton}`}
      >
        عربي
      </button>
    </div>
  );
}
