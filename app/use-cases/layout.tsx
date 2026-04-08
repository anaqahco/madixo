import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import ContentHubShell from '@/components/content-hub-shell';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

export default async function UseCasesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  return (
    <main
      dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FAFAFB] text-[#111827]"
    >
      <ContentHubShell initialUiLang={uiLang} />
      {children}
    </main>
  );
}
