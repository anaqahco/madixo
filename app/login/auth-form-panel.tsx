'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import GoogleAuthButton from '@/components/google-auth-button';
import {
  hasMinPasswordLength,
  hasPasswordNumberOrSymbol,
  hasPasswordUppercase,
} from '@/lib/password-rules';
import type { UiLanguage } from '@/lib/ui-language';
import { login, signup } from './actions';

type AuthCopy = {
  dir: 'rtl' | 'ltr';
  brand: string;
  eyebrow: string;
  loginTitle: string;
  signupTitle: string;
  loginDescription: string;
  signupDescription: string;
  loginTab: string;
  signupTab: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  emailPlaceholder: string;
  passwordPlaceholderLogin: string;
  passwordPlaceholderSignup: string;
  confirmPasswordPlaceholder: string;
  passwordRulesTitle: string;
  passwordRules: readonly string[];
  submitLogin: string;
  submitSignup: string;
  submitSignupDisabled: string;
  backHome: string;
  divider: string;
  authHintLogin: string;
  authHintSignup: string;
  authHintActionLogin: string;
  authHintActionSignup: string;
  showPassword: string;
  hidePassword: string;
  passwordRuleHint: string;
};

type Props = {
  uiLang: UiLanguage;
  copy: AuthCopy;
  mode: 'login' | 'signup';
  nextPath: string;
  error: string;
  message: string;
};

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

function PasswordField({
  label,
  name,
  value,
  placeholder,
  autoComplete,
  show,
  onToggle,
  onChange,
  helper,
  isValid,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  helper?: string;
  isValid?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={8}
          placeholder={placeholder}
          className={`w-full rounded-[22px] border bg-[#FCFCFD] px-4 py-3.5 ${helper ? 'pe-28' : 'pe-24'} text-sm text-[#111827] outline-none transition focus:bg-white ${
            isValid
              ? 'border-[#16A34A] bg-white shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:border-[#16A34A]'
              : 'border-[#E5E7EB] focus:border-[#111827]'
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 end-4 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#111827]"
          aria-label={helper}
        >
          <EyeIcon open={show} />
          {helper ? <span>{helper}</span> : null}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({
  mode,
  copy,
  disabled,
}: {
  mode: 'login' | 'signup';
  copy: AuthCopy;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  const label =
    mode === 'login'
      ? copy.submitLogin
      : disabled && !pending
        ? copy.submitSignupDisabled
        : copy.submitSignup;

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#D0D5DD] disabled:text-[#667085] disabled:hover:opacity-100"
    >
      {pending ? '...' : label}
    </button>
  );
}

export default function AuthFormPanel({
  uiLang,
  copy,
  mode,
  nextPath,
  error,
  message,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const isSignup = mode === 'signup';
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

  const signupReady =
    email.trim().length > 0 &&
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

  useEffect(() => {
    if (!message && !error) return;

    const element = feedbackRef.current;
    if (!element) return;

    const frame = window.requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      window.setTimeout(() => {
        element.focus({ preventScroll: true });
      }, 260);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [error, message]);

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-sm md:p-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#667085]">
          {copy.eyebrow}
        </p>

        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] md:text-5xl">
          {isSignup ? copy.signupTitle : copy.loginTitle}
        </h2>

        <p className="mt-4 text-base leading-8 text-[#4B5563]">
          {isSignup ? copy.signupDescription : copy.loginDescription}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href={`/login?mode=login&next=${encodeURIComponent(nextPath)}`}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            !isSignup
              ? 'bg-[#111827] text-white'
              : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
          }`}
        >
          {copy.loginTab}
        </Link>

        <Link
          href={`/login?mode=signup&next=${encodeURIComponent(nextPath)}`}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            isSignup
              ? 'bg-[#111827] text-white'
              : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
          }`}
        >
          {copy.signupTab}
        </Link>
      </div>

      <div className="mt-7">
        <GoogleAuthButton uiLang={uiLang} mode={mode} nextPath={nextPath} />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
          {copy.divider}
        </span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <form action={isSignup ? signup : login} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#374151]">
            {copy.email}
          </label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            className="w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5 text-sm text-[#111827] outline-none transition focus:border-[#111827] focus:bg-white"
          />
        </div>

        <PasswordField
          label={copy.password}
          name="password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? copy.passwordPlaceholderSignup : copy.passwordPlaceholderLogin}
          helper={showPassword ? copy.hidePassword : copy.showPassword}
          isValid={isSignup && password.length > 0 && passwordChecks.hasMinLength && passwordChecks.hasUppercase && passwordChecks.hasNumberOrSymbol}
        />

        {isSignup ? (
          <>
            <PasswordField
              label={copy.confirmPassword}
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              autoComplete="new-password"
              placeholder={copy.confirmPasswordPlaceholder}
              helper={showConfirmPassword ? copy.hidePassword : copy.showPassword}
              isValid={confirmPassword.length > 0 && passwordChecks.passwordsMatch}
            />

            <div className="rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#111827]">
                  {copy.passwordRulesTitle}
                </p>
                <span className="text-xs font-medium text-[#667085]">
                  {copy.passwordRuleHint}
                </span>
              </div>

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
          </>
        ) : null}

        {error ? (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700 outline-none"
            aria-live="polite"
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className="rounded-[22px] border border-[#D1FAE5] bg-[#ECFDF3] px-4 py-3 text-sm leading-7 text-[#027A48] outline-none"
            aria-live="polite"
          >
            {message}
          </div>
        ) : null}

        {!isSignup ? (
          <div className={`${isArabic ? 'text-left' : 'text-right'}`}>
            <Link
              href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
              className="text-sm font-semibold text-[#111827] transition hover:opacity-80"
            >
              {copy.forgotPassword}
            </Link>
          </div>
        ) : null}

        <SubmitButton mode={mode} copy={copy} disabled={isSignup ? !signupReady : false} />
      </form>

      <div className={`mt-6 ${isArabic ? 'text-right' : 'text-left'} text-sm text-[#4B5563]`}>
        <span>{isSignup ? copy.authHintSignup : copy.authHintLogin} </span>
        <Link
          href={
            isSignup
              ? `/login?mode=login&next=${encodeURIComponent(nextPath)}`
              : `/login?mode=signup&next=${encodeURIComponent(nextPath)}`
          }
          className="font-semibold text-[#111827] transition hover:opacity-80"
        >
          {isSignup ? copy.authHintActionSignup : copy.authHintActionLogin}
        </Link>
      </div>

      <div className={`mt-4 ${isArabic ? 'text-right' : 'text-left'}`}>
        <Link
          href="/"
          className="text-sm font-semibold text-[#374151] transition hover:text-black"
        >
          {copy.backHome}
        </Link>
      </div>
    </section>
  );
}
