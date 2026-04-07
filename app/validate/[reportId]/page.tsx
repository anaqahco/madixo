import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ValidationModeClient from '@/components/validation-mode-client';
import { getUserReportsByIds } from '@/lib/madixo-db';
import type { SavedMadixoReport } from '@/lib/madixo-reports';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type Params = Promise<{
  reportId: string;
}>;

export default async function ValidateReportPage({
  params,
}: {
  params: Params;
}) {
  const { reportId } = await params;

  if (!reportId) {
    notFound();
  }

  let report: SavedMadixoReport | undefined;

  try {
    const results = await getUserReportsByIds([reportId]);
    report = results[0];
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      redirect(`/login?mode=login&next=${encodeURIComponent(`/validate/${reportId}`)}`);
    }

    throw error;
  }

  if (!report) {
    notFound();
  }

  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  return <ValidationModeClient report={report} initialUiLang={uiLang} />;
}
