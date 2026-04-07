export type UiLanguage = 'ar' | 'en';

export const UI_LANGUAGE_COOKIE = 'madixo_ui_lang';

export function isUiLanguage(value: unknown): value is UiLanguage {
  return value === 'ar' || value === 'en';
}

export function normalizeUiLanguage(value: unknown, fallback: UiLanguage = 'en'): UiLanguage {
  return isUiLanguage(value) ? value : fallback;
}

export function getDirection(language: UiLanguage) {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function getLanguageLabel(language: UiLanguage) {
  return language === 'ar' ? 'العربية' : 'English';
}

export function getServerUiLanguageFromCookie(
  cookieStore: Pick<{ get(name: string): { value: string } | undefined }, 'get'>
): UiLanguage {
  const raw = cookieStore.get(UI_LANGUAGE_COOKIE)?.value;
  return normalizeUiLanguage(raw, 'en');
}

export function getClientUiLanguage(fallback: UiLanguage = 'en'): UiLanguage {
  if (typeof document === 'undefined') {
    return fallback;
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${UI_LANGUAGE_COOKIE}=`))
    ?.split('=')
    ?.slice(1)
    ?.join('=');

  if (isUiLanguage(cookieValue)) {
    return cookieValue;
  }

  const documentLanguage = document.documentElement.lang;
  if (isUiLanguage(documentLanguage)) {
    return documentLanguage;
  }

  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ar')) {
    return 'ar';
  }

  return fallback;
}

export function setClientUiLanguage(language: UiLanguage) {
  if (typeof document === 'undefined') {
    return;
  }

  const oneYearInSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${UI_LANGUAGE_COOKIE}=${language}; path=/; max-age=${oneYearInSeconds}; samesite=lax`;
}
