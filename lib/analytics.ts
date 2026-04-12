type AnalyticsPrimitive = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsPrimitive>;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, AnalyticsPrimitive>) => void;
  }
}

function normalizeValue(value: AnalyticsPrimitive) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.slice(0, 100);
  }

  return value;
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.gtag !== 'function') {
    return;
  }

  const normalizedEntries = Object.entries(params)
    .map(([key, value]) => [key, normalizeValue(value)] as const)
    .filter(([, value]) => value !== undefined);

  window.gtag('event', eventName, Object.fromEntries(normalizedEntries));
}
