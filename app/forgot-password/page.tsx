import Link from 'next/link';
import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import { requestPasswordReset } from '../login/actions';

type SearchParams = Promise<{
  next?: string;
  error?: string;
  message?: string;
}>;

const COPY = {
  ar: {
    dir: 'rtl',
    eyebrow: 'استعادة الحساب',
    title: 'نسيت كلمة المرور؟',
    description:
      'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'you@example.com',
    submit: 'إرسال رابط إعادة التعيين',
    backToLogin: 'العودة إلى تسجيل الدخول',
    backHome: 'العودة للرئيسية',
    sideEyebrow: 'استرجاع الوصول',
    sideTitle: 'ارجع إلى حسابك بسرعة.',
    sideDescription:
      'سنرسل لك رابطًا آمنًا لاختيار كلمة مرور جديدة ومتابعة العمل داخل Madixo.',
    sidePoints: [
      'رابط آمن لإعادة تعيين كلمة المرور',
      'العودة إلى حسابك من نفس البريد الإلكتروني',
      'متابعة التقارير والتحقق من حيث توقفت',
    ],
  },
  en: {
    dir: 'ltr',
    eyebrow: 'Account Recovery',
    title: 'Forgot your password?',
    description:
      'Enter your email address and we will send you a secure reset link.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    submit: 'Send reset link',
    backToLogin: 'Back to Log In',
    backHome: 'Return Home',
    sideEyebrow: 'Recover access',
    sideTitle: 'Get back into your account quickly.',
    sideDescription:
      'We will send you a secure link to choose a new password and continue working inside Madixo.',
    sidePoints: [
      'A secure link to reset your password',
      'Return using the same email address',
      'Continue reports and validation where you left off',
    ],
  },
} as const;

export default async function ForgotPasswordPage({
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
      : '/reports';

  const error = typeof params.error === 'string' ? params.error : '';
  const message = typeof params.message === 'string' ? params.message : '';

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 py-8 text-[#111827] md:py-10"
    >
      <AuthShellHeader uiLang={uiLang} showAuthActions={false} />

      <div className="mx-auto mt-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <section className="hidden rounded-[32px] border border-[#E5E7EB] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-8 shadow-sm lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.sideEyebrow}
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#111827]">
                {copy.sideTitle}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-8 text-[#4B5563]">
                {copy.sideDescription}
              </p>

              <div className="mt-8 space-y-3">
                {copy.sidePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[22px] border border-[#E5E7EB] bg-white px-5 py-4 text-sm font-medium leading-7 text-[#374151]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
              <p className="text-sm leading-7 text-[#4B5563]">
                {copy.description}
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-9">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#667085]">
                {copy.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
                {copy.title}
              </h2>

              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {copy.description}
              </p>
            </div>

            <form action={requestPasswordReset} className="mt-7 space-y-5">
              <input type="hidden" name="next" value={nextPath} />

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  {copy.email}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={copy.emailPlaceholder}
                  className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
                />
              </div>

              {error ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-[22px] border border-[#D1FAE5] bg-[#ECFDF3] px-4 py-3 text-sm leading-7 text-[#027A48]">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {copy.submit}
              </button>
            </form>

            <div className="mt-6 text-center">
              <div>
                <Link
                  href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
                  className="text-sm font-semibold text-[#111827] transition hover:opacity-80"
                >
                  {copy.backToLogin}
                </Link>
              </div>

              <div className="mt-4">
                <Link
                  href="/"
                  className="text-sm font-semibold text-[#374151] transition hover:text-black"
                >
                  {copy.backHome}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
