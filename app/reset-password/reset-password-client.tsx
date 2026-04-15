'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AuthShellHeader from '@/components/auth-shell-header';
import { createClient } from '@/lib/supabase/client';
import {
  hasMinPasswordLength,
  hasPasswordNumberOrSymbol,
  hasPasswordUppercase,
  isStrongPassword,
} from '@/lib/password-rules';
import type { UiLanguage } from '@/lib/ui-language';

const COPY = {
  ar: {
    dir: 'rtl',
    eyebrow: 'تعيين كلمة مرور جديدة',
    title: 'اختر كلمة مرور جديدة',
    description:
      'أدخل كلمة مرور جديدة لحسابك. سيتفعّل الحفظ بعد اكتمال الشروط كلها.',
    password: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    passwordPlaceholder: '8 أحرف مع حرف كبير ورقم أو رمز',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    passwordRulesTitle: 'متطلبات كلمة المرور',
    passwordRules: [
      '8 أحرف على الأقل',
      'حرف كبير واحد على الأقل',
      'رقم واحد أو رمز واحد على الأقل',
      'يجب أن تتطابق كلمة المرور مع التأكيد',
    ],
    submit: 'حفظ كلمة المرور الجديدة',
    submitDisabled: 'أكمل الشروط أولًا',
    saving: 'جارٍ الحفظ...',
    success: 'تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.',
    genericError: 'تعذر تحديث كلمة المرور. حاول مرة أخرى.',
    passwordMismatch: 'كلمة المرور وتأكيدها غير متطابقين.',
    weakPassword:
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير واحد ورقم أو رمز واحد على الأقل.',
    missingPassword: 'يرجى إدخال كلمة المرور الجديدة.',
    invalidRecovery:
      'رابط الاستعادة غير مكتمل أو انتهت صلاحيته. اطلب رابطًا جديدًا.',
    backToLogin: 'العودة إلى تسجيل الدخول',
    requestNewLink: 'طلب رابط جديد',
    showPassword: 'إظهار',
    hidePassword: 'إخفاء',
  },
  en: {
    dir: 'ltr',
    eyebrow: 'Set a new password',
    title: 'Choose a new password',
    description:
      'Enter a new password for your account. Saving unlocks when every rule is complete.',
    password: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordPlaceholder: '8 characters with 1 uppercase and 1 number or symbol',
    confirmPasswordPlaceholder: 'Re-enter your new password',
    passwordRulesTitle: 'Password rules',
    passwordRules: [
      'At least 8 characters',
      'At least 1 uppercase letter',
      'At least 1 number or symbol',
      'Your password and confirmation must match',
    ],
    submit: 'Save new password',
    submitDisabled: 'Complete the requirements first',
    saving: 'Saving...',
    success: 'Your password was updated. You can log in now.',
    genericError: 'We could not update your password. Please try again.',
    passwordMismatch: 'Your password and confirmation do not match.',
    weakPassword:
      'Your password must be at least 8 characters and include at least 1 uppercase letter and 1 number or symbol.',
    missingPassword: 'Please enter your new password.',
    invalidRecovery:
      'This recovery link is incomplete or has expired. Please request a new one.',
    backToLogin: 'Back to Log In',
    requestNewLink: 'Request a new link',
    showPassword: 'Show',
    hidePassword: 'Hide',
  },
} as const;

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M3 3l18 18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M9.88 5.09A9.77 9.77 0 0 1 12 4.85c5.52 0 9.27 4.63 10 6.15a1.65 1.65 0 0 1 0 1.4 12.64 12.64 0 0 1-3.02 3.73M6.61 6.61A12.82 12.82 0 0 0 2 11a1.65 1.65 0 0 0 0 1.4c.75 1.52 4.5 6.15 10 6.15 1.73 0 3.3-.45 4.67-1.08"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M2 12s3.75-6.15 10-6.15S22 12 22 12s-3.75 6.15-10 6.15S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function RequirementIcon({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-[#16A34A]">
        <path
          d="M16.7 5.3 8.4 13.6 4.8 10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  return <span className="h-3.5 w-3.5 rounded-full bg-[#D0D5DD]" aria-hidden="true" />;
}

type Props = {
  uiLang: UiLanguage;
  nextPath: string;
};

export default function ResetPasswordClient({ uiLang, nextPath }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const copy = COPY[uiLang];
  const isArabic = uiLang === 'ar';

  const passwordChecks = useMemo(() => {
    const hasMinLength = hasMinPasswordLength(password);
    const hasUppercase = hasPasswordUppercase(password);
    const hasNumberOrSymbol = hasPasswordNumberOrSymbol(password);
    const passwordsMatch =
      confirmPassword.length > 0 && password.length > 0 && password === confirmPassword;

    return {
      hasMinLength,
      hasUppercase,
      hasNumberOrSymbol,
      passwordsMatch,
    };
  }, [confirmPassword, password]);

  const readyToSave =
    passwordChecks.hasMinLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasNumberOrSymbol &&
    passwordChecks.passwordsMatch;

  const requirements = [
    { label: copy.passwordRules[0], passed: passwordChecks.hasMinLength },
    { label: copy.passwordRules[1], passed: passwordChecks.hasUppercase },
    { label: copy.passwordRules[2], passed: passwordChecks.hasNumberOrSymbol },
    { label: copy.passwordRules[3], passed: passwordChecks.passwordsMatch },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setError(copy.missingPassword);
      setSuccess('');
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      setSuccess('');
      return;
    }

    if (!isStrongPassword(password)) {
      setError(copy.weakPassword);
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(copy.invalidRecovery);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(copy.success);
      setPassword('');
      setConfirmPassword('');

      await supabase.auth.signOut().catch(() => null);

      window.setTimeout(() => {
        window.location.replace(
          `/login?mode=login&next=${encodeURIComponent(nextPath)}&message=${encodeURIComponent(copy.success)}`
        );
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      dir={copy.dir}
      className="min-h-screen bg-[#FAFAFB] px-6 py-8 text-[#111827] md:py-10"
    >
      <AuthShellHeader uiLang={uiLang} showAuthActions={false} />

      <div className="mx-auto mt-8 max-w-2xl rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-9">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#667085]">
            {copy.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
            {copy.title}
          </h1>

          <p className="mt-4 text-base leading-8 text-[#4B5563]">
            {copy.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              {copy.password}
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                placeholder={copy.passwordPlaceholder}
                className={`w-full rounded-[22px] border bg-[#FCFCFD] px-4 py-3.5 pe-24 text-sm text-[#111827] outline-none transition ${
                  password.length > 0 &&
                  passwordChecks.hasMinLength &&
                  passwordChecks.hasUppercase &&
                  passwordChecks.hasNumberOrSymbol
                    ? 'border-[#16A34A] bg-white shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:border-[#16A34A]'
                    : 'border-[#E5E7EB] focus:border-[#111827] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 end-4 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#111827]"
              >
                <EyeIcon open={showPassword} />
                <span>{showPassword ? copy.hidePassword : copy.showPassword}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              {copy.confirmPassword}
            </label>
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (error) setError('');
                }}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                placeholder={copy.confirmPasswordPlaceholder}
                className={`w-full rounded-[22px] border bg-[#FCFCFD] px-4 py-3.5 pe-24 text-sm text-[#111827] outline-none transition ${
                  confirmPassword.length > 0 && passwordChecks.passwordsMatch
                    ? 'border-[#16A34A] bg-white shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:border-[#16A34A]'
                    : 'border-[#E5E7EB] focus:border-[#111827] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 end-4 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#111827]"
              >
                <EyeIcon open={showConfirmPassword} />
                <span>
                  {showConfirmPassword ? copy.hidePassword : copy.showPassword}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="text-sm font-semibold text-[#111827]">
              {copy.passwordRulesTitle}
            </p>
            <ul className="mt-3 space-y-2.5">
              {requirements.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm leading-7 ${
                    rule.passed
                      ? 'border-[#DCFCE7] bg-white text-[#166534]'
                      : 'border-transparent bg-white text-[#667085]'
                  } ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}
                >
                  <RequirementIcon passed={rule.passed} />
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[22px] border border-[#D1FAE5] bg-[#ECFDF3] px-4 py-3 text-sm leading-7 text-[#027A48]">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving || !readyToSave}
            className="w-full rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#D0D5DD] disabled:text-[#667085] disabled:hover:opacity-100"
          >
            {saving ? copy.saving : readyToSave ? copy.submit : copy.submitDisabled}
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
              href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
              className="text-sm font-semibold text-[#374151] transition hover:text-black"
            >
              {copy.requestNewLink}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
