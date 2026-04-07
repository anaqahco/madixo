import type { MadixoPlan } from '@/lib/madixo-plans';

export type MadixoBillingStatus =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unknown';

export type MadixoBillingInfo = {
  provider: 'paddle';
  configured: boolean;
  checkoutEnabled: boolean;
  environment: 'sandbox' | 'live';
  status: MadixoBillingStatus;
  customerId: string | null;
  subscriptionId: string | null;
  priceId: string | null;
  nextBilledAt: string | null;
  cancelAtPeriodEnd: boolean;
  lastUpdatedAt: string | null;
};

export function getMadixoBillingEnvironment(): 'sandbox' | 'live' {
  const explicit = process.env.NEXT_PUBLIC_PADDLE_ENV;

  if (explicit === 'sandbox' || explicit === 'live') {
    return explicit;
  }

  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.startsWith('test_')
    ? 'sandbox'
    : 'live';
}

export function getMadixoPaddleApiBaseUrl() {
  return getMadixoBillingEnvironment() === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com';
}

export function getMadixoPaddlePriceId(plan: MadixoPlan) {
  if (plan === 'pro') {
    return process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? null;
  }

  if (plan === 'team') {
    return process.env.NEXT_PUBLIC_PADDLE_PRICE_TEAM_MONTHLY ?? null;
  }

  return null;
}

export function getPlanFromPaddlePriceId(priceId: string | null | undefined): MadixoPlan | null {
  if (!priceId) {
    return null;
  }

  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY) {
    return 'pro';
  }

  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_TEAM_MONTHLY) {
    return 'team';
  }

  return null;
}

export function normalizeMadixoBillingStatus(
  value: unknown
): MadixoBillingStatus {
  if (
    value === 'active' ||
    value === 'trialing' ||
    value === 'past_due' ||
    value === 'paused' ||
    value === 'canceled'
  ) {
    return value;
  }

  if (value === 'inactive' || value === null || value === undefined || value === '') {
    return 'inactive';
  }

  return 'unknown';
}

export function isPaidMadixoPlan(plan: MadixoPlan) {
  return plan === 'pro' || plan === 'team';
}
