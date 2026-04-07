import Link from 'next/link';
import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type SearchParams = Promise<{
  message?: string;
  next?: string;
}>;

const DEFAULT_NEXT = '/dashboard';

const COPY = {
  en: {
    dir: 'ltr',
    badge: 'Verification Error',
    title: 'We could not verify your email',
    defaultMessage: 'Something went wrong during email verification.',
    helper:
      'Please try the verification flow again. If the link has expired, sign in again or create a new account to receive a fresh verification email.',
    tryAgain: 'Try Again',
    backToLogin: 'Back to Log In',
  },
  ar: {
    dir: 'rtl',
    badge: 'خطأ في التحقق',
    title: 'تعذر التحقق من بريدك الإلكتروني',
    defaultMessage: 'حدث خطأ أثناء التحقق من البريد الإلكتروني.',
    helper:
      'يرجى إعادة محاولة التحقق مرة أخرى. إذا انتهت صلاحية الرابط، سجّل الدخول من جديد أو أنشئ حسابًا جديدًا للحصول على رسالة تحقق جديدة.',
    tryAgain: 'إعادة المحاولة',
    backToLogin: 'العودة لتسجيل الدخول',
  },
} as const;

export default async function AuthErrorPage({
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

  const message =
    typeof params.message === 'string' && params.message.trim()
      ? params.message
      : copy.defaultMessage;

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 py-8 text-[#111827] md:py-10"
    >
      <AuthShellHeader uiLang={uiLang} />

      <div className="mx-auto mt-8 max-w-2xl rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-sm md:p-10">
        <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
          {copy.badge}
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
          {copy.title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4B5563]">
          {message}
        </p>

        <div className="mt-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5">
          <p className="text-sm leading-7 text-[#7F1D1D]">{copy.helper}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/login?mode=signup&next=${encodeURIComponent(nextPath)}`}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.tryAgain}
          </Link>

          <Link
            href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
            className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            {copy.backToLogin}
          </Link>
        </div>
      </div>
    </main>
  );
}
