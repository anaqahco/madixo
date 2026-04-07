import Link from 'next/link';
import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type SearchParams = Promise<{
  next?: string;
}>;

const DEFAULT_NEXT = '/dashboard';

const COPY = {
  en: {
    dir: 'ltr',
    badge: 'Email Verified',
    title: 'Your email has been verified successfully',
    description: 'Your Madixo account is now active and ready to use.',
    continueToReports: 'Continue to Dashboard',
    goHome: 'Go to Home',
  },
  ar: {
    dir: 'rtl',
    badge: 'تم التحقق من البريد',
    title: 'تم التحقق من بريدك الإلكتروني بنجاح',
    description: 'حسابك في Madixo أصبح الآن مفعلًا وجاهزًا للاستخدام.',
    continueToReports: 'المتابعة إلى لوحة التحكم',
    goHome: 'الذهاب إلى الرئيسية',
  },
} as const;

export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const copy = COPY[uiLang];

  const nextPath =
    typeof params.next === 'string' && params.next.startsWith('/')
      ? params.next
      : DEFAULT_NEXT;

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 py-8 text-[#111827] md:py-10"
    >
      <AuthShellHeader uiLang={uiLang} />

      <div className="mx-auto mt-8 max-w-2xl rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm md:p-10">
        <div className="inline-flex items-center rounded-full border border-[#D1FAE5] bg-[#ECFDF3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#027A48]">
          {copy.badge}
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4B5563]">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={nextPath}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.continueToReports}
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            {copy.goHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
