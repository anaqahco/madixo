import Link from 'next/link';
import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';

type SearchParams = Promise<{
  email?: string;
  next?: string;
}>;

const COPY = {
  en: {
    dir: 'ltr',
    badge: 'Account Created',
    title: 'Check your email',
    description:
      'Your account was created successfully. We sent a verification link to',
    fallbackEmail: 'your email',
    helper:
      'Open your inbox and click the verification link to activate your account. If you do not see the message, check your spam or junk folder.',
    backToLogin: 'Back to Log In',
    returnHome: 'Return Home',
  },
  ar: {
    dir: 'rtl',
    badge: 'تم إنشاء الحساب',
    title: 'تحقق من بريدك الإلكتروني',
    description: 'تم إنشاء حسابك بنجاح. أرسلنا رابط التحقق إلى',
    fallbackEmail: 'بريدك الإلكتروني',
    helper:
      'افتح صندوق الوارد واضغط على رابط التحقق لتفعيل حسابك. إذا لم تجد الرسالة، فتحقق من مجلد الرسائل غير المرغوب فيها أو البريد العشوائي.',
    backToLogin: 'العودة لتسجيل الدخول',
    returnHome: 'العودة للرئيسية',
  },
} as const;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const uiLang = getServerUiLanguageFromCookie(cookieStore);
  const copy = COPY[uiLang];

  const email = typeof params.email === 'string' ? params.email : '';
  const nextPath =
    typeof params.next === 'string' && params.next.startsWith('/')
      ? params.next
      : '/reports';

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
          {copy.description}{' '}
          <span className="font-semibold text-[#111827]">
            {email || copy.fallbackEmail}
          </span>
          .
        </p>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
          <p className="text-sm leading-7 text-[#4B5563]">{copy.helper}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copy.backToLogin}
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            {copy.returnHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
