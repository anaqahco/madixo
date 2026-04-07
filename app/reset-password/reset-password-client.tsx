'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthShellHeader from '@/components/auth-shell-header';
import { createClient } from '@/lib/supabase/client';
import type { UiLanguage } from '@/lib/ui-language';

const COPY = {
  ar: {
    dir: 'rtl',
    eyebrow: 'تعيين كلمة مرور جديدة',
    title: 'اختر كلمة مرور جديدة',
    description:
      'أدخل كلمة مرور جديدة لحسابك ثم أكمل العودة إلى Madixo.',
    password: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    passwordPlaceholder: '8 أحرف مع حرف كبير ورمز',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    passwordRulesTitle: 'متطلبات كلمة المرور',
    passwordRules: [
      '8 أحرف على الأقل',
      'حرف كبير واحد على الأقل',
      'رمز واحد على الأقل مثل ! أو @ أو #',
      'يجب أن تتطابق كلمة المرور مع التأكيد',
    ],
    submit: 'حفظ كلمة المرور الجديدة',
    saving: 'جارٍ الحفظ...',
    success: 'تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.',
    genericError: 'تعذر تحديث كلمة المرور. حاول مرة أخرى.',
    passwordMismatch: 'كلمة المرور وتأكيدها غير متطابقين.',
    weakPassword:
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير واحد ورمز واحد على الأقل.',
    missingPassword: 'يرجى إدخال كلمة المرور الجديدة.',
    invalidRecovery:
      'رابط الاستعادة غير مكتمل أو انتهت صلاحيته. اطلب رابطًا جديدًا.',
    backToLogin: 'العودة إلى تسجيل الدخول',
    requestNewLink: 'طلب رابط جديد',
  },
  en: {
    dir: 'ltr',
    eyebrow: 'Set a new password',
    title: 'Choose a new password',
    description:
      'Enter a new password for your account and continue back into Madixo.',
    password: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordPlaceholder: '8 characters with 1 uppercase and 1 symbol',
    confirmPasswordPlaceholder: 'Re-enter your new password',
    passwordRulesTitle: 'Password rules',
    passwordRules: [
      'At least 8 characters',
      'At least 1 uppercase letter',
      'At least 1 symbol like ! or @ or #',
      'Your password and confirmation must match',
    ],
    submit: 'Save new password',
    saving: 'Saving...',
    success: 'Your password was updated. You can log in now.',
    genericError: 'We could not update your password. Please try again.',
    passwordMismatch: 'Your password and confirmation do not match.',
    weakPassword:
      'Your password must be at least 8 characters and include at least 1 uppercase letter and 1 symbol.',
    missingPassword: 'Please enter your new password.',
    invalidRecovery:
      'This recovery link is incomplete or has expired. Please request a new one.',
    backToLogin: 'Back to Log In',
    requestNewLink: 'Request a new link',
  },
} as const;

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

type Props = {
  uiLang: UiLanguage;
  nextPath: string;
};

export default function ResetPasswordClient({ uiLang, nextPath }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const copy = COPY[uiLang];

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

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              {copy.password}
            </label>
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder={copy.passwordPlaceholder}
              className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              {copy.confirmPassword}
            </label>
            <input
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (error) setError('');
              }}
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder={copy.confirmPasswordPlaceholder}
              className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
            />
          </div>

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
            disabled={saving}
            className="w-full rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? copy.saving : copy.submit}
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
