export function cleanBaseUrl(value: string | null | undefined) {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
}

export function getPublicAppUrl() {
  return (
    cleanBaseUrl(process.env.APP_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    'https://madixo.ai'
  );
}

export function buildAbsoluteAppUrl(path = '/') {
  const baseUrl = getPublicAppUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function getBrowserAppUrl() {
  return getPublicAppUrl();
}
