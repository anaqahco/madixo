const DEFAULT_APP_URL = 'https://madixo.ai';

function normalizeBaseUrl(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function getConfiguredAppUrl() {
  return (
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeBaseUrl(process.env.APP_URL) ??
    DEFAULT_APP_URL
  );
}

export function buildAbsoluteAppUrl(path: string) {
  const base = getConfiguredAppUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, base).toString();
}

export function getBrowserAppUrl() {
  return (
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeBaseUrl(process.env.APP_URL) ??
    DEFAULT_APP_URL
  );
}
