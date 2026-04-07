import { cookies } from 'next/headers';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import ResetPasswordClient from './reset-password-client';

type SearchParams = Promise<{
  next?: string;
}>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);

  const nextPath =
    typeof params.next === 'string' && params.next.startsWith('/')
      ? params.next
      : '/reports';

  return <ResetPasswordClient uiLang={uiLang} nextPath={nextPath} />;
}
