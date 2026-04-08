function cleanBaseUrl(value: string | null | undefined) {
  if (!value) return '';
  return value.trim().replace(/\/$/, '');
}

function ensureLeadingSlash(path: string) {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
}

export { cleanBaseUrl };

export function getPublicAppUrl() {
  return (
    cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanBaseUrl(process.env.APP_URL) ||
    ''
  );
}

export function getBrowserAppUrl() {
  return getPublicAppUrl();
}

export function buildAbsoluteAppUrl(path = '') {
  const baseUrl =
    cleanBaseUrl(process.env.APP_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (!baseUrl) {
    throw new Error(
      'Missing APP_URL or NEXT_PUBLIC_APP_URL. Set the production domain in environment variables.'
    );
  }

  if (!path) return baseUrl;

  return `${baseUrl}${ensureLeadingSlash(path)}`;
}
