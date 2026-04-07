export type UiLanguage = 'ar' | 'en';
export type MoneyCurrency = 'USD' | 'SAR';

export type FeasibilityVerdictKey =
  | 'start_now'
  | 'start_with_conditions'
  | 'not_yet';

export type FeasibilityCostItem = {
  item: string;
  estimate: string;
  note: string;
};

export type FeasibilityRevenueScenario = {
  scenario: string;
  monthlyRevenue: string;
  note: string;
};

export type InitialFeasibilityStudy = {
  verdictKey: FeasibilityVerdictKey;
  verdictLabel: string;
  verdictSummary: string;
  keyAssumptions: string[];
  startupCosts: {
    totalRange: string;
    items: FeasibilityCostItem[];
  };
  monthlyCosts: {
    totalRange: string;
    items: FeasibilityCostItem[];
  };
  revenueScenarios: FeasibilityRevenueScenario[];
  breakEvenTimeline: string;
  breakEvenSummary: string;
  financialRisks: string[];
  recommendedAction: string;
  disclaimer: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeText(value: unknown, fallback: string) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function normalizeVerdictKey(value: unknown): FeasibilityVerdictKey {
  if (
    value === 'start_now' ||
    value === 'start_with_conditions' ||
    value === 'not_yet'
  ) {
    return value;
  }

  return 'start_with_conditions';
}

function normalizeStringArray(
  value: unknown,
  fallback: string[],
  exactLength?: number
) {
  const safe = Array.isArray(value)
    ? value.filter(isNonEmptyString).map((item) => item.trim())
    : [];

  if (!safe.length) {
    return exactLength ? fallback.slice(0, exactLength) : fallback;
  }

  if (!exactLength) {
    return safe;
  }

  const trimmed = safe.slice(0, exactLength);

  while (trimmed.length < exactLength) {
    trimmed.push(
      fallback[trimmed.length] ||
        fallback[fallback.length - 1] ||
        'Add a realistic assumption.'
    );
  }

  return trimmed;
}

function normalizeCostItems(
  value: unknown,
  fallback: FeasibilityCostItem[],
  exactLength: number
) {
  const safe = Array.isArray(value)
    ? value
        .map((item) => {
          const obj = isObject(item) ? item : {};

          return {
            item: normalizeText(obj.item, ''),
            estimate: normalizeText(obj.estimate, ''),
            note: normalizeText(obj.note, ''),
          };
        })
        .filter((item) => item.item && item.estimate && item.note)
    : [];

  if (!safe.length) {
    return fallback.slice(0, exactLength);
  }

  const trimmed = safe.slice(0, exactLength);

  while (trimmed.length < exactLength) {
    trimmed.push(fallback[trimmed.length] || fallback[fallback.length - 1]);
  }

  return trimmed;
}

function normalizeRevenueScenarios(
  value: unknown,
  fallback: FeasibilityRevenueScenario[],
  exactLength: number
) {
  const safe = Array.isArray(value)
    ? value
        .map((item) => {
          const obj = isObject(item) ? item : {};

          return {
            scenario: normalizeText(obj.scenario, ''),
            monthlyRevenue: normalizeText(obj.monthlyRevenue, ''),
            note: normalizeText(obj.note, ''),
          };
        })
        .filter((item) => item.scenario && item.monthlyRevenue && item.note)
    : [];

  if (!safe.length) {
    return fallback.slice(0, exactLength);
  }

  const trimmed = safe.slice(0, exactLength);

  while (trimmed.length < exactLength) {
    trimmed.push(fallback[trimmed.length] || fallback[fallback.length - 1]);
  }

  return trimmed;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function inferCurrencyFromText(value: string): MoneyCurrency | null {
  const text = value.toLowerCase();

  if (
    text.includes('ريال') ||
    text.includes('ر.س') ||
    text.includes('sar') ||
    text.includes('﷼')
  ) {
    return 'SAR';
  }

  if (text.includes('$') || text.includes('usd') || text.includes('dollar')) {
    return 'USD';
  }

  return null;
}

function hasMonthlyMarker(value: string) {
  return /\/\s*month|\bmonth\b|شهري|شهريًا/i.test(value);
}

function extractNumericValues(value: string) {
  const matches = value.match(/\d[\d,]*(?:\.\d+)?/g) || [];

  return matches
    .map((part) => Number(part.replace(/,/g, '')))
    .filter((num) => Number.isFinite(num) && num >= 0);
}

function buildMoneyText(params: {
  values: number[];
  currency: MoneyCurrency;
  uiLang: UiLanguage;
  monthly: boolean;
  plus: boolean;
}) {
  const sorted = [...params.values].sort((a, b) => a - b);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];

  if (!Number.isFinite(low)) {
    return '';
  }

  const lowText = formatNumber(low);
  const highText = Number.isFinite(high) ? formatNumber(high) : lowText;
  const single = sorted.length === 1 || low === high;

  if (params.uiLang === 'ar') {
    const unit = params.currency === 'SAR' ? 'ريال' : 'دولار';
    const amount = single
      ? `${lowText}${params.plus ? '+' : ''} ${unit}`
      : `${lowText}–${highText} ${unit}`;

    return params.monthly ? `${amount} شهريًا` : amount;
  }

  if (params.currency === 'SAR') {
    const amount = single
      ? `SAR ${lowText}${params.plus ? '+' : ''}`
      : `SAR ${lowText}–${highText}`;

    return params.monthly ? `${amount} / month` : amount;
  }

  const amount = single
    ? `$${lowText}${params.plus ? '+' : ''}`
    : `$${lowText}–$${highText}`;

  return params.monthly ? `${amount} / month` : amount;
}

export function normalizeMoneyRangeText(
  value: string,
  params: {
    uiLang: UiLanguage;
    preferredCurrency?: MoneyCurrency;
  }
) {
  const safe = typeof value === 'string' ? value.trim() : '';

  if (!safe) {
    return safe;
  }

  const values = extractNumericValues(safe);

  if (!values.length) {
    return safe;
  }

  const currency = inferCurrencyFromText(safe) || params.preferredCurrency || 'USD';
  const monthly = hasMonthlyMarker(safe);
  const plus = safe.includes('+') && values.length === 1;

  return buildMoneyText({
    values,
    currency,
    uiLang: params.uiLang,
    monthly,
    plus,
  });
}

export function normalizeFeasibilityStudyDisplay(
  study: InitialFeasibilityStudy,
  uiLang: UiLanguage,
  preferredCurrency?: MoneyCurrency
): InitialFeasibilityStudy {
  return {
    ...study,
    startupCosts: {
      ...study.startupCosts,
      totalRange: normalizeMoneyRangeText(study.startupCosts.totalRange, {
        uiLang,
        preferredCurrency,
      }),
      items: study.startupCosts.items.map((item) => ({
        ...item,
        estimate: normalizeMoneyRangeText(item.estimate, {
          uiLang,
          preferredCurrency,
        }),
      })),
    },
    monthlyCosts: {
      ...study.monthlyCosts,
      totalRange: normalizeMoneyRangeText(study.monthlyCosts.totalRange, {
        uiLang,
        preferredCurrency,
      }),
      items: study.monthlyCosts.items.map((item) => ({
        ...item,
        estimate: normalizeMoneyRangeText(item.estimate, {
          uiLang,
          preferredCurrency,
        }),
      })),
    },
    revenueScenarios: study.revenueScenarios.map((scenario) => ({
      ...scenario,
      monthlyRevenue: normalizeMoneyRangeText(scenario.monthlyRevenue, {
        uiLang,
        preferredCurrency,
      }),
    })),
  };
}

export function normalizeInitialFeasibilityStudy(
  value: unknown
): InitialFeasibilityStudy {
  const obj = isObject(value) ? value : {};

  const fallbackStartupItems: FeasibilityCostItem[] = [
    {
      item: 'Product setup',
      estimate: '$1,000–$3,000',
      note: 'Landing page, simple product setup, and first working version.',
    },
    {
      item: 'Design and brand basics',
      estimate: '$300–$1,200',
      note: 'Basic visual identity, UI cleanup, and presentation assets.',
    },
    {
      item: 'Launch marketing',
      estimate: '$500–$2,000',
      note: 'Initial testing budget for content, ads, or outreach.',
    },
    {
      item: 'Tools and legal basics',
      estimate: '$100–$600',
      note: 'Domains, subscriptions, and simple setup costs.',
    },
  ];

  const fallbackMonthlyItems: FeasibilityCostItem[] = [
    {
      item: 'Software and infrastructure',
      estimate: '$100–$500 / month',
      note: 'Hosting, AI usage, analytics, and core SaaS tools.',
    },
    {
      item: 'Marketing',
      estimate: '$300–$2,000 / month',
      note: 'Ongoing tests for acquisition and message refinement.',
    },
    {
      item: 'Operations',
      estimate: '$100–$700 / month',
      note: 'Support, admin work, and light automation tools.',
    },
    {
      item: 'Freelance support',
      estimate: '$0–$1,500 / month',
      note: 'Part-time design, content, or technical help if needed.',
    },
  ];

  const fallbackRevenueScenarios: FeasibilityRevenueScenario[] = [
    {
      scenario: 'Conservative',
      monthlyRevenue: '$500–$1,500 / month',
      note: 'Slow early traction with a few paying customers.',
    },
    {
      scenario: 'Base case',
      monthlyRevenue: '$2,000–$6,000 / month',
      note: 'Steady early execution with a clearer offer and repeatable sales.',
    },
    {
      scenario: 'Optimistic',
      monthlyRevenue: '$8,000–$20,000+ / month',
      note: 'Strong positioning, better retention, and faster distribution.',
    },
  ];

  const verdictKey = normalizeVerdictKey(obj.verdictKey);

  const fallbackVerdictLabel =
    verdictKey === 'start_now'
      ? 'Start now'
      : verdictKey === 'not_yet'
        ? 'Do not start yet'
        : 'Start with conditions';

  const fallbackVerdictSummary =
    verdictKey === 'start_now'
      ? 'The idea looks workable early if you keep the first version focused and commercial.'
      : verdictKey === 'not_yet'
        ? 'The idea still needs clearer economics or a tighter offer before it deserves early investment.'
        : 'The idea can work, but only with disciplined assumptions, a small initial scope, and fast market feedback.';

  return {
    verdictKey,
    verdictLabel: normalizeText(obj.verdictLabel, fallbackVerdictLabel),
    verdictSummary: normalizeText(obj.verdictSummary, fallbackVerdictSummary),
    keyAssumptions: normalizeStringArray(
      obj.keyAssumptions,
      [
        'The first offer is narrow enough to explain quickly.',
        'Early buyers already feel the problem and can pay soon.',
        'The first version can be launched without a heavy team.',
        'Distribution will come from a focused channel, not broad awareness.',
      ],
      4
    ),
    startupCosts: {
      totalRange: normalizeText(
        isObject(obj.startupCosts) ? obj.startupCosts.totalRange : undefined,
        '$2,000–$7,000'
      ),
      items: normalizeCostItems(
        isObject(obj.startupCosts) ? obj.startupCosts.items : undefined,
        fallbackStartupItems,
        4
      ),
    },
    monthlyCosts: {
      totalRange: normalizeText(
        isObject(obj.monthlyCosts) ? obj.monthlyCosts.totalRange : undefined,
        '$500–$4,500 / month'
      ),
      items: normalizeCostItems(
        isObject(obj.monthlyCosts) ? obj.monthlyCosts.items : undefined,
        fallbackMonthlyItems,
        4
      ),
    },
    revenueScenarios: normalizeRevenueScenarios(
      obj.revenueScenarios,
      fallbackRevenueScenarios,
      3
    ),
    breakEvenTimeline: normalizeText(
      obj.breakEvenTimeline,
      'Around 3–9 months, depending on customer acquisition speed and pricing discipline.'
    ),
    breakEvenSummary: normalizeText(
      obj.breakEvenSummary,
      'Break-even depends mainly on whether the first paid customers arrive before the project becomes operationally heavy.'
    ),
    financialRisks: normalizeStringArray(
      obj.financialRisks,
      [
        'Customer acquisition may cost more than expected.',
        'The first offer may be too broad or weakly differentiated.',
        'Manual work may stay high for too long and slow margins.',
      ],
      3
    ),
    recommendedAction: normalizeText(
      obj.recommendedAction,
      'Build a small first version, validate willingness to pay early, and keep costs tightly controlled.'
    ),
    disclaimer: normalizeText(
      obj.disclaimer,
      'This is an initial feasibility study based on assumptions, not a final financial plan or accounting forecast.'
    ),
  };
}

export const initialFeasibilitySchema = {
  name: 'madixo_initial_feasibility_study',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      verdictKey: {
        type: 'string',
        enum: ['start_now', 'start_with_conditions', 'not_yet'],
      },
      verdictLabel: { type: 'string' },
      verdictSummary: { type: 'string' },
      keyAssumptions: {
        type: 'array',
        minItems: 4,
        maxItems: 4,
        items: { type: 'string' },
      },
      startupCosts: {
        type: 'object',
        additionalProperties: false,
        properties: {
          totalRange: { type: 'string' },
          items: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                item: { type: 'string' },
                estimate: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['item', 'estimate', 'note'],
            },
          },
        },
        required: ['totalRange', 'items'],
      },
      monthlyCosts: {
        type: 'object',
        additionalProperties: false,
        properties: {
          totalRange: { type: 'string' },
          items: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                item: { type: 'string' },
                estimate: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['item', 'estimate', 'note'],
            },
          },
        },
        required: ['totalRange', 'items'],
      },
      revenueScenarios: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            scenario: { type: 'string' },
            monthlyRevenue: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['scenario', 'monthlyRevenue', 'note'],
        },
      },
      breakEvenTimeline: { type: 'string' },
      breakEvenSummary: { type: 'string' },
      financialRisks: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string' },
      },
      recommendedAction: { type: 'string' },
      disclaimer: { type: 'string' },
    },
    required: [
      'verdictKey',
      'verdictLabel',
      'verdictSummary',
      'keyAssumptions',
      'startupCosts',
      'monthlyCosts',
      'revenueScenarios',
      'breakEvenTimeline',
      'breakEvenSummary',
      'financialRisks',
      'recommendedAction',
      'disclaimer',
    ],
  },
} as const;
