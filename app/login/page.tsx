import Link from 'next/link';
import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import GoogleAuthButton from '../../components/google-auth-button';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import { login, signup } from './actions';

type SearchParams = Promise<{
  next?: string;
  mode?: string;
  error?: string;
  message?: string;
}>;

const COPY = {
  ar: {
    dir: 'rtl',
    brand: 'Madixo',
    eyebrow: 'MADIXO',
    loginTitle: 'سجّل الدخول للمتابعة',
    signupTitle: 'أنشئ حسابك',
    loginDescription:
      'ادخل إلى مساحة عملك، وواصل التحقق، وافتح تقاريرك ومقارناتك من مكان واحد واضح.',
    signupDescription:
      'أنشئ حسابًا لحفظ تقاريرك، ومتابعة التحقق، والعودة لفرصك في أي وقت.',
    loginTab: 'تسجيل الدخول',
    signupTab: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholderLogin: 'أدخل كلمة المرور',
    passwordPlaceholderSignup: '8 أحرف مع حرف كبير ورمز',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    passwordRulesTitle: 'متطلبات كلمة المرور',
    passwordRules: [
      '8 أحرف على الأقل',
      'حرف كبير واحد على الأقل',
      'رمز واحد على الأقل مثل ! أو @ أو #',
      'يجب أن تتطابق كلمة المرور مع التأكيد',
    ],
    passwordRuleShort:
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير ورمز واحد على الأقل.',
    submitLogin: 'تسجيل الدخول',
    submitSignup: 'إنشاء حساب',
    backHome: 'العودة للرئيسية',
    divider: 'أو',
    sideEyebrow: 'مساحة واحدة واضحة',
    sideTitle: 'ادخل إلى مساحة عملك بسرعة وبشكل أوضح.',
    sideDescription:
      'كل تقرير، وكل فرصة، وكل خطوة تحقق تبقى معك في مكان واحد داخل Madixo.',
    sidePoints: [
      'احفظ تقاريرك وارجع لها في أي وقت',
      'تابع أين وصلت كل فرصة الآن',
      'انتقل من التحليل إلى التحقق في مسار واضح',
    ],
    authHintLogin: 'ليس لديك حساب بعد؟',
    authHintSignup: 'لديك حساب بالفعل؟',
    authHintActionLogin: 'أنشئ حسابًا',
    authHintActionSignup: 'سجّل الدخول',
  },
  en: {
    dir: 'ltr',
    brand: 'Madixo',
    eyebrow: 'MADIXO',
    loginTitle: 'Log in to continue',
    signupTitle: 'Create your account',
    loginDescription:
      'Access your workspace, continue validation, and open your reports and comparisons from one clear place.',
    signupDescription:
      'Create an account to save reports, continue validation, and return to your opportunities anytime.',
    loginTab: 'Log In',
    signupTab: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot your password?',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholderLogin: 'Enter your password',
    passwordPlaceholderSignup: '8 characters with 1 uppercase and 1 symbol',
    confirmPasswordPlaceholder: 'Re-enter your password',
    passwordRulesTitle: 'Password rules',
    passwordRules: [
      'At least 8 characters',
      'At least 1 uppercase letter',
      'At least 1 symbol like ! or @ or #',
      'Your password and confirmation must match',
    ],
    passwordRuleShort:
      'Your password must be at least 8 characters and include at least 1 uppercase letter and 1 symbol.',
    submitLogin: 'Log In',
    submitSignup: 'Create Account',
    backHome: 'Return Home',
    divider: 'or',
    sideEyebrow: 'One clear workspace',
    sideTitle: 'Get back into your workspace faster and more clearly.',
    sideDescription:
      'Every report, every opportunity, and every validation step stays with you in one place inside Madixo.',
    sidePoints: [
      'Save your reports and come back anytime',
      'See exactly where each opportunity stands now',
      'Move from analysis to validation in one clear flow',
    ],
    authHintLogin: "Don't have an account yet?",
    authHintSignup: 'Already have an account?',
    authHintActionLogin: 'Create one',
    authHintActionSignup: 'Log in',
  },
} as const;

export default async function LoginPage({
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

  const mode = params.mode === 'signup' ? 'signup' : 'login';
  const error = typeof params.error === 'string' ? params.error : '';
  const message = typeof params.message === 'string' ? params.message : '';

  const passwordPattern = '(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}';

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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.brand}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                {mode === 'login'
                  ? copy.loginDescription
                  : copy.signupDescription}
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-9">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#667085]">
                {copy.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
                {mode === 'login' ? copy.loginTitle : copy.signupTitle}
              </h2>

              <p className="mt-4 text-base leading-8 text-[#4B5563]">
                {mode === 'login'
                  ? copy.loginDescription
                  : copy.signupDescription}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-[#111827] text-white'
                    : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                }`}
              >
                {copy.loginTab}
              </Link>

              <Link
                href={`/login?mode=signup&next=${encodeURIComponent(nextPath)}`}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-[#111827] text-white'
                    : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                }`}
              >
                {copy.signupTab}
              </Link>
            </div>

            <div className="mt-7">
              <GoogleAuthButton
                uiLang={uiLang}
                mode={mode}
                nextPath={nextPath}
              />
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
                {copy.divider}
              </span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <form action={mode === 'login' ? login : signup} className="space-y-5">
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

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  {copy.password}
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={mode === 'signup' ? 8 : undefined}
                  pattern={mode === 'signup' ? passwordPattern : undefined}
                  title={mode === 'signup' ? copy.passwordRuleShort : undefined}
                  placeholder={
                    mode === 'login'
                      ? copy.passwordPlaceholderLogin
                      : copy.passwordPlaceholderSignup
                  }
                  className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
                />
              </div>

              {mode === 'login' ? (
                <div className="mt-[-6px] text-sm">
                  <Link
                    href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
                    className="font-semibold text-[#374151] transition hover:text-black"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>
              ) : null}

              {mode === 'signup' ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#374151]">
                    {copy.confirmPassword}
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder={copy.confirmPasswordPlaceholder}
                    className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
                  />
                </div>
              ) : null}

              {mode === 'signup' ? (
                <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-sm font-semibold text-[#111827]">
                    {copy.passwordRulesTitle}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {copy.passwordRules.map((rule) => (
                      <li
                        key={rule}
                        className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#374151]"
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

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
                {mode === 'login' ? copy.submitLogin : copy.submitSignup}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm leading-7 text-[#667085]">
                {mode === 'login' ? copy.authHintLogin : copy.authHintSignup}{' '}
                <Link
                  href={`/login?mode=${mode === 'login' ? 'signup' : 'login'}&next=${encodeURIComponent(nextPath)}`}
                  className="font-semibold text-[#111827] hover:opacity-80"
                >
                  {mode === 'login'
                    ? copy.authHintActionLogin
                    : copy.authHintActionSignup}
                </Link>
              </p>

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
