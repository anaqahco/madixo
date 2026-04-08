'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buildAbsoluteAppUrl } from '@/lib/app-url';

type UiLanguage = 'ar' | 'en';

type AuthMode = 'login' | 'signup';

const COPY = {
  en: {
    missingCredentials: 'Please enter your email and password.',
    missingConfirmPassword: 'Please confirm your password.',
    passwordMismatch: 'Your password and confirmation do not match.',
    genericLoginError: 'We could not log you in. Please try again.',
    genericSignupError: 'We could not create your account. Please try again.',
    invalidCredentials: 'The email or password is incorrect.',
    emailNotConfirmed: 'Please verify your email first, then try again.',
    alreadyRegistered:
      'This email is already registered. Log in instead or use another email.',
    weakPassword:
      'Your password must be at least 8 characters and include at least 1 uppercase letter and 1 symbol.',
    rateLimit: 'Too many attempts. Please wait a little and try again.',
    signupDisabled: 'Account creation is currently unavailable.',
    missingRecoveryEmail: 'Please enter your email address first.',
    genericRecoveryError:
      'We could not send the reset link right now. Please try again.',
    recoverySent:
      'If this email exists, a password reset link has been sent.',
  },
  ar: {
    missingCredentials: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
    missingConfirmPassword: 'يرجى تأكيد كلمة المرور.',
    passwordMismatch: 'كلمة المرور وتأكيدها غير متطابقين.',
    genericLoginError: 'تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    genericSignupError: 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    emailNotConfirmed: 'يرجى التحقق من بريدك الإلكتروني أولًا ثم حاول مرة أخرى.',
    alreadyRegistered:
      'هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول أو استخدم بريدًا آخر.',
    weakPassword:
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حرف كبير واحد ورمز واحد على الأقل.',
    rateLimit: 'هناك عدد كبير من المحاولات. انتظر قليلًا ثم أعد المحاولة.',
    signupDisabled: 'إنشاء الحسابات غير متاح حاليًا.',
    missingRecoveryEmail: 'يرجى إدخال بريدك الإلكتروني أولًا.',
    genericRecoveryError:
      'تعذر إرسال رابط إعادة التعيين الآن. حاول مرة أخرى.',
    recoverySent:
      'إذا كان البريد موجودًا، فسيصلك رابط إعادة تعيين كلمة المرور.',
  },
} as const;

function detectLanguage(value: string | null): UiLanguage {
  if (!value) return 'en';
  return value.toLowerCase().includes('ar') ? 'ar' : 'en';
}

function getSafeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : '/reports';
  return next.startsWith('/') ? next : '/reports';
}

function getSafeText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function translateAuthError(
  message: string | null | undefined,
  language: UiLanguage,
  mode: AuthMode
) {
  const copy = COPY[language];
  const normalized = (message ?? '').toLowerCase();

  if (!normalized) {
    return mode === 'login' ? copy.genericLoginError : copy.genericSignupError;
  }

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('email not found') ||
    normalized.includes('invalid email or password')
  ) {
    return copy.invalidCredentials;
  }

  if (
    normalized.includes('email not confirmed') ||
    normalized.includes('email_not_confirmed')
  ) {
    return copy.emailNotConfirmed;
  }

  if (
    normalized.includes('user already registered') ||
    normalized.includes('already registered') ||
    normalized.includes('already been registered') ||
    normalized.includes('user already exists')
  ) {
    return copy.alreadyRegistered;
  }

  if (
    normalized.includes('password should be at least') ||
    normalized.includes('password must be at least') ||
    normalized.includes('weak password') ||
    normalized.includes('password is too weak')
  ) {
    return copy.weakPassword;
  }

  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('too many attempts')
  ) {
    return copy.rateLimit;
  }

  if (
    normalized.includes('signups not allowed') ||
    normalized.includes('signup is disabled') ||
    normalized.includes('sign up not allowed')
  ) {
    return copy.signupDisabled;
  }

  return mode === 'login' ? copy.genericLoginError : copy.genericSignupError;
}

function backToLogin(params: {
  mode?: AuthMode;
  next: string;
  error?: string;
  message?: string;
}) {
  const search = new URLSearchParams();

  search.set('next', params.next);

  if (params.mode) {
    search.set('mode', params.mode);
  }

  if (params.error) {
    search.set('error', params.error);
  }

  if (params.message) {
    search.set('message', params.message);
  }

  redirect(`/login?${search.toString()}`);
}

function backToForgotPassword(params: {
  next: string;
  error?: string;
  message?: string;
}) {
  const search = new URLSearchParams();
  search.set('next', params.next);

  if (params.error) {
    search.set('error', params.error);
  }

  if (params.message) {
    search.set('message', params.message);
  }

  redirect(`/forgot-password?${search.toString()}`);
}

function buildFinishUrl(next: string) {
  return `/auth/finish?next=${encodeURIComponent(next)}`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();
  const language = detectLanguage(headerStore.get('accept-language'));
  const copy = COPY[language];

  const next = getSafeNext(formData.get('next'));
  const email = getSafeText(formData.get('email'));
  const password = getSafeText(formData.get('password'));

  if (!email || !password) {
    backToLogin({
      mode: 'login',
      next,
      error: copy.missingCredentials,
    });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    backToLogin({
      mode: 'login',
      next,
      error: translateAuthError(error.message, language, 'login'),
    });
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();
  const language = detectLanguage(headerStore.get('accept-language'));
  const copy = COPY[language];

  const next = getSafeNext(formData.get('next'));
  const email = getSafeText(formData.get('email'));
  const password = getSafeText(formData.get('password'));
  const confirmPassword = getSafeText(formData.get('confirmPassword'));

  if (!email || !password) {
    backToLogin({
      mode: 'signup',
      next,
      error: copy.missingCredentials,
    });
  }

  if (!confirmPassword) {
    backToLogin({
      mode: 'signup',
      next,
      error: copy.missingConfirmPassword,
    });
  }

  if (password !== confirmPassword) {
    backToLogin({
      mode: 'signup',
      next,
      error: copy.passwordMismatch,
    });
  }

  if (!isStrongPassword(password)) {
    backToLogin({
      mode: 'signup',
      next,
      error: copy.weakPassword,
    });
  }

  const callbackUrl = buildAbsoluteAppUrl(`/auth/callback?next=${encodeURIComponent(next)}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
      data: {
        language,
      },
    },
  });

  if (error) {
    backToLogin({
      mode: 'signup',
      next,
      error: translateAuthError(error.message, language, 'signup'),
    });
  }

  const sessionCreated = Boolean(data.session);

  revalidatePath('/', 'layout');

  if (sessionCreated) {
    redirect(buildFinishUrl(next));
  }

  backToLogin({
    mode: 'login',
    next,
    message:
      language === 'ar'
        ? 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني أولًا ثم سجّل الدخول.'
        : 'Your account was created. Please verify your email first, then log in.',
  });
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();
  const language = detectLanguage(headerStore.get('accept-language'));
  const copy = COPY[language];

  const next = getSafeNext(formData.get('next'));
  const email = getSafeText(formData.get('email'));
  const callbackUrl = buildAbsoluteAppUrl(`/auth/callback?flow=recovery&next=${encodeURIComponent(next)}`);

  if (!email) {
    backToForgotPassword({
      next,
      error: copy.missingRecoveryEmail,
    });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
  });

  if (error) {
    backToForgotPassword({
      next,
      error: copy.genericRecoveryError,
    });
  }

  backToForgotPassword({
    next,
    message: copy.recoverySent,
  });
}
