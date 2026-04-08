'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type UiLanguage, setClientUiLanguage } from '@/lib/ui-language';

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
  const [isPending, startTransition] = useTransition();

  const baseButton =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm';
  const activeButton = 'bg-[#111827] text-white shadow-sm';
  const inactiveButton = 'bg-white text-[#374151] hover:bg-[#F9FAFB]';

  const handleChange = (language: UiLanguage) => {
    if (language === value) return;

    setClientUiLanguage(language);
    onChange?.(language);

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white p-1 ${className}`}
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
