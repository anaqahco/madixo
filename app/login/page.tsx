import { cookies } from 'next/headers';
import AuthShellHeader from '@/components/auth-shell-header';
import { getServerUiLanguageFromCookie } from '@/lib/ui-language';
import AuthFormPanel from './auth-form-panel';

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
    passwordPlaceholderSignup: '8 أحرف مع حرف كبير ورقم أو رمز',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    passwordRulesTitle: 'متطلبات كلمة المرور',
    passwordRules: [
      '8 أحرف على الأقل',
      'حرف كبير واحد على الأقل',
      'رقم واحد أو رمز واحد على الأقل',
      'يجب أن تتطابق كلمة المرور مع التأكيد',
    ],
    submitLogin: 'تسجيل الدخول',
    submitSignup: 'إنشاء حساب',
    submitSignupDisabled: 'أكمل الشروط أولًا',
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
    showPassword: 'إظهار',
    hidePassword: 'إخفاء',
    passwordRuleHint: 'يتفعّل الزر بعد اكتمال الشروط كلها',
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
    passwordPlaceholderSignup: '8 characters with 1 uppercase and 1 number or symbol',
    confirmPasswordPlaceholder: 'Re-enter your password',
    passwordRulesTitle: 'Password rules',
    passwordRules: [
      'At least 8 characters',
      'At least 1 uppercase letter',
      'At least 1 number or symbol',
      'Your password and confirmation must match',
    ],
    submitLogin: 'Log In',
    submitSignup: 'Create Account',
    submitSignupDisabled: 'Complete the requirements first',
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
    showPassword: 'Show',
    hidePassword: 'Hide',
    passwordRuleHint: 'The button unlocks when every rule is complete',
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
                {mode === 'login' ? copy.loginDescription : copy.signupDescription}
              </p>
            </div>
          </section>

          <AuthFormPanel
            uiLang={uiLang}
            copy={copy}
            mode={mode}
            nextPath={nextPath}
            error={error}
            message={message}
          />
        </div>
      </div>
    </main>
  );
}
