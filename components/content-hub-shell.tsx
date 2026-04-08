'use client';

import type { ReactNode } from 'react';
import ContentHubShell from '@/components/content-hub-shell';
import { useUiLanguageState } from '@/components/ui-language-provider';

export default function ContentHubPageShell({ children }: { children: ReactNode }) {
  const [uiLang] = useUiLanguageState();

  return (
    <main
      dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FAFAFB] text-[#111827]"
    >
      <ContentHubShell />
      {children}
    </main>
  );
}
