import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { findLatestMatchingUserReport } from '@/lib/madixo-db';
import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS } from '@/lib/madixo-plans';
import { getCurrentMadixoPlan } from '@/lib/madixo-plan-store';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

const ARABIC_WRITING_RULES = `
- اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي.
- اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية.
- اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة.
- لا تخلط العربية والإنجليزية داخل الجمل العادية.
- إذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا، ولا تستخدم الحروف اللاتينية إلا إذا كان الاسم أو الاختصار لا يُفهم عادة بدونها.
- إذا أمكن قول الفكرة بكلمتين بسيطتين بدل تعبير تحليلي ثقيل، فاختر الصياغة الأبسط.
- قبل إخراج الإجابة، راجع النص بصمت وبسّطه لغويًا إذا وجدت كلمة قد لا تكون واضحة لمعظم المستخدمين العرب.
`.trim();
function getMaxOutputTokens() {
  const value = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || '7000');

  if (!Number.isFinite(value) || value <= 0) {
    return 7000;
  }

  return Math.floor(value);
}

const MAX_OUTPUT_TOKENS = getMaxOutputTokens();

const ANALYSIS_USAGE_COOKIE = 'madixo_analysis_usage_v1';

type AnalysisUsageStore = {
  items: string[];
};

function getRequestCookiesMap(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const entries = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf('=');
      if (index === -1) return [part, ''] as const;
      return [part.slice(0, index), part.slice(index + 1)] as const;
    });

  return new Map(entries);
}

function readAnalysisUsageFromRequest(request: Request): AnalysisUsageStore {
  try {
    const cookiesMap = getRequestCookiesMap(request);
    const raw = cookiesMap.get(ANALYSIS_USAGE_COOKIE);
    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(decodeURIComponent(raw)) as AnalysisUsageStore;
    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 50),
    };
  } catch {
    return { items: [] };
  }
}

function writeAnalysisUsageCookie(response: NextResponse, store: AnalysisUsageStore) {
  response.cookies.set(ANALYSIS_USAGE_COOKIE, encodeURIComponent(JSON.stringify({
    items: store.items.slice(0, 50),
  })), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
}

function buildAnalysisUsageKey(params: {
  query: string;
  market: string;
  customer: string;
  language: OutputLanguage;
}) {
  return JSON.stringify({
    q: normalizeComparableText(params.query),
    m: normalizeComparableText(params.market),
    c: normalizeComparableText(params.customer),
    l: params.language,
  });
}


type AnalyzeRequestBody = {
  query?: string;
  market?: string;
  customer?: string;
  uiLang?: OutputLanguage;
};

type OutputLanguage = 'ar' | 'en';

type ScoreBreakdownItem = {
  score: number;
  note: string;
};

type ScoreBreakdown = {
  demand: ScoreBreakdownItem;
  abilityToWin: ScoreBreakdownItem;
  monetization: ScoreBreakdownItem;
  speedToMvp: ScoreBreakdownItem;
  distribution: ScoreBreakdownItem;
};

type AnalysisResult = {
  query: string;
  opportunityScore: number;
  opportunityLabel: string;
  scoreBreakdown: ScoreBreakdown;
  summary: string;
  whyThisOpportunity: string;
  marketDemand: {
    title: string;
    description: string;
  };
  competition: {
    title: string;
    description: string;
  };
  targetCustomers: {
    title: string;
    description: string;
  };
  bestFirstCustomer: {
    title: string;
    description: string;
  };
  suggestedMvp: {
    title: string;
    description: string;
    features: string[];
  };
  firstOffer: {
    title: string;
    priceIdea: string;
    description: string;
  };
  revenueModel: {
    title: string;
    price: string;
    description: string;
  };
  nextSteps: string[];
  painPoints: string[];
  opportunityAngle: string;
  goToMarket: string;
  risks: string[];
};

type DisplayInputs = {
  query: string;
  market: string;
  customer: string;
};

const reportSchema = {
  name: 'madixo_opportunity_report',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      query: { type: 'string' },
      displayMarket: { type: 'string' },
      displayCustomer: { type: 'string' },
      opportunityScore: { type: 'number' },
      opportunityLabel: { type: 'string' },
      scoreBreakdown: {
        type: 'object',
        additionalProperties: false,
        properties: {
          demand: {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'number' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          },
          abilityToWin: {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'number' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          },
          monetization: {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'number' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          },
          speedToMvp: {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'number' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          },
          distribution: {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'number' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          },
        },
        required: [
          'demand',
          'abilityToWin',
          'monetization',
          'speedToMvp',
          'distribution',
        ],
      },
      summary: { type: 'string' },
      whyThisOpportunity: { type: 'string' },
      marketDemand: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
      competition: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
      targetCustomers: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
      bestFirstCustomer: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
      suggestedMvp: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          features: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['title', 'description', 'features'],
      },
      firstOffer: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          priceIdea: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'priceIdea', 'description'],
      },
      revenueModel: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          price: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'price', 'description'],
      },
      nextSteps: {
        type: 'array',
        items: { type: 'string' },
      },
      painPoints: {
        type: 'array',
        items: { type: 'string' },
      },
      opportunityAngle: { type: 'string' },
      goToMarket: { type: 'string' },
      risks: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'query',
      'displayMarket',
      'displayCustomer',
      'opportunityScore',
      'opportunityLabel',
      'scoreBreakdown',
      'summary',
      'whyThisOpportunity',
      'marketDemand',
      'competition',
      'targetCustomers',
      'bestFirstCustomer',
      'suggestedMvp',
      'firstOffer',
      'revenueModel',
      'nextSteps',
      'painPoints',
      'opportunityAngle',
      'goToMarket',
      'risks',
    ],
  },
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeText(value: unknown, fallback: string) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u064B-\u065F\u0670]/g, '');
}

function areSameInputs(a: { query: string; market: string; customer: string }, b: { query: string; market: string; customer: string }) {
  return (
    normalizeComparableText(a.query) === normalizeComparableText(b.query) &&
    normalizeComparableText(a.market) === normalizeComparableText(b.market) &&
    normalizeComparableText(a.customer) === normalizeComparableText(b.customer)
  );
}

const PLACEHOLDER_INPUTS = new Set([
  '1',
  '11',
  '111',
  'test',
  'testing',
  'demo',
  'none',
  'na',
  'asdf',
  'qwerty',
  'xxx',
  'غير محدد',
  'غير معروف',
  'لا اعرف',
  'لا أعرف',
  'لا يوجد',
  'لايوجد',
  'غير موجود',
  'مافي',
  'ما فيه',
  'بدون',
  'شي',
  'شيء',
  'فكرة',
  'عميل',
  'سوق',
]);










function countLettersForInputValidation(value: string) {
  const matches = value.match(/[A-Za-z؀-ۿ]/g);
  return matches ? matches.length : 0;
}


function looksLikePlaceholderInput(value: string) {
  const simplified = normalizeComparableText(value).replace(/[^a-z؀-ۿ0-9\s]/g, '').trim();

  if (!simplified) return true;
  if (PLACEHOLDER_INPUTS.has(simplified)) return true;
  if (/^\d+$/.test(simplified)) return true;

  const compact = simplified.replace(/\s+/g, '');
  if (compact.length >= 2 && new Set(compact).size === 1) return true;

  return false;
}



function looksLikeMeaningfulIdeaInput(value: string) {
  const normalized = value.trim();

  if (!normalized) return false;
  if (looksLikePlaceholderInput(value)) return false;
  if (countLettersForInputValidation(normalized) < 2) return false;

  return true;
}

function looksLikeValidCustomerDescriptionInput(value: string) {
  const normalized = value.trim();

  if (!normalized) return false;
  if (looksLikePlaceholderInput(value)) return false;
  if (countLettersForInputValidation(normalized) < 2) return false;

  return true;
}

function validateAnalyzeInputs(params: {
  query: string;
  market: string;
  customer: string;
  outputLanguage: OutputLanguage;
}) {
  const errors: string[] = [];

  if (!looksLikeMeaningfulIdeaInput(params.query)) {
    errors.push(
      params.outputLanguage === 'ar'
        ? 'اكتب الفكرة بشكل يمكن فهمه، حتى لو كانت قصيرة. مثال: بيع تيشيرتات، سيروم لحية، منصة حجوزات، أو استيراد منتجات وتطويرها.'
        : 'Write the idea in a way that can be understood, even if it is short. Example: selling T-shirts, beard serum, booking platform, or importing products and adapting them.'
    );
  }

  if (
    !params.market ||
    countLettersForInputValidation(params.market) < 2 ||
    looksLikePlaceholderInput(params.market)
  ) {
    errors.push(
      params.outputLanguage === 'ar'
        ? 'اكتب السوق بشكل واضح، مثل: السعودية أو الرياض أو الخليج.'
        : 'Write the market clearly, such as Saudi Arabia, Riyadh, or GCC.'
    );
  }

  if (!looksLikeValidCustomerDescriptionInput(params.customer)) {
    errors.push(
      params.outputLanguage === 'ar'
        ? 'اكتب العميل المستهدف بشكل واضح، حتى لو كان مختصرًا، مثل: الشباب، الأمهات، أصحاب العيادات، أو للجنسين كبار وصغار.'
        : 'Write the target customer clearly, even in a short way, such as youth, mothers, clinic owners, or all ages.'
    );
  }

  return {
    ok: errors.length === 0,
    error: errors[0] || null,
  };
}

function normalizeStringArray(
  value: unknown,
  fallback: string[],
  exactLength?: number
) {
  const safe = Array.isArray(value)
    ? value.filter(isNonEmptyString).map((item) => item.trim())
    : [];

  if (safe.length === 0) {
    return exactLength ? fallback.slice(0, exactLength) : fallback;
  }

  if (!exactLength) {
    return safe;
  }

  const trimmed = safe.slice(0, exactLength);

  while (trimmed.length < exactLength) {
    trimmed.push(fallback[trimmed.length] || 'Add a concrete next step.');
  }

  return trimmed;
}

function normalizeSection(
  value: unknown,
  fallbackTitle: string,
  fallbackDescription: string
) {
  const obj = typeof value === 'object' && value !== null ? value : {};

  return {
    title: normalizeText(
      (obj as Record<string, unknown>).title,
      fallbackTitle
    ),
    description: normalizeText(
      (obj as Record<string, unknown>).description,
      fallbackDescription
    ),
  };
}

function normalizeOfferSection(
  value: unknown,
  fallbackTitle: string,
  fallbackPrice: string,
  fallbackDescription: string
) {
  const obj = typeof value === 'object' && value !== null ? value : {};

  return {
    title: normalizeText(
      (obj as Record<string, unknown>).title,
      fallbackTitle
    ),
    priceIdea: normalizeText(
      (obj as Record<string, unknown>).priceIdea,
      fallbackPrice
    ),
    description: normalizeText(
      (obj as Record<string, unknown>).description,
      fallbackDescription
    ),
  };
}

function normalizeRevenueSection(
  value: unknown,
  fallbackTitle: string,
  fallbackPrice: string,
  fallbackDescription: string
) {
  const obj = typeof value === 'object' && value !== null ? value : {};

  return {
    title: normalizeText(
      (obj as Record<string, unknown>).title,
      fallbackTitle
    ),
    price: normalizeText(
      (obj as Record<string, unknown>).price,
      fallbackPrice
    ),
    description: normalizeText(
      (obj as Record<string, unknown>).description,
      fallbackDescription
    ),
  };
}

function normalizeMvpSection(
  value: unknown,
  fallbackLanguage: OutputLanguage
) {
  const obj = typeof value === 'object' && value !== null ? value : {};

  const fallbackTitle =
    fallbackLanguage === 'ar' ? 'نسخة أولية مركزة' : 'Focused starter MVP';

  const fallbackDescription =
    fallbackLanguage === 'ar'
      ? 'ابدأ بنطاق ضيق يحل مشكلة واضحة ومؤلمة ويمكن قياس أثرها تجاريًا.'
      : 'Launch with one narrow workflow that solves a painful, measurable business problem.';

  const fallbackFeatures =
    fallbackLanguage === 'ar'
      ? ['الوظيفة الأساسية', 'لوحة متابعة بسيطة', 'إعداد وتشغيل سريع']
      : [
          'Core workflow automation',
          'Simple reporting dashboard',
          'Basic onboarding and setup',
        ];

  return {
    title: normalizeText(
      (obj as Record<string, unknown>).title,
      fallbackTitle
    ),
    description: normalizeText(
      (obj as Record<string, unknown>).description,
      fallbackDescription
    ),
    features: normalizeStringArray(
      (obj as Record<string, unknown>).features,
      fallbackFeatures,
      3
    ),
  };
}

function countArabicChars(text: string) {
  const matches = text.match(/[\u0600-\u06FF]/g);
  return matches ? matches.length : 0;
}

function countLatinChars(text: string) {
  const matches = text.match(/[A-Za-z]/g);
  return matches ? matches.length : 0;
}


function getBearerToken(request: Request) {
  const value = request.headers.get('authorization');
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function readPlanFromUserMetadata(user: { user_metadata?: Record<string, unknown> | null } | null) {
  if (!user || !user.user_metadata) {
    return null;
  }

  const value = user.user_metadata.madixo_plan;
  return parsePlan(typeof value === 'string' ? value : null);
}

function detectOutputLanguage(params: {
  query: string;
  market: string;
  customer: string;
}): OutputLanguage {
  const queryArabic = countArabicChars(params.query) * 1.8;
  const queryLatin = countLatinChars(params.query) * 1.8;

  const marketArabic = countArabicChars(params.market) * 1.1;
  const marketLatin = countLatinChars(params.market) * 1.1;

  const customerArabic = countArabicChars(params.customer) * 1.2;
  const customerLatin = countLatinChars(params.customer) * 1.2;

  const arabicScore = queryArabic + marketArabic + customerArabic;
  const latinScore = queryLatin + marketLatin + customerLatin;

  if (arabicScore === 0 && latinScore === 0) {
    return 'en';
  }

  return arabicScore >= latinScore ? 'ar' : 'en';
}

function buildLanguageInstruction(language: OutputLanguage) {
  if (language === 'ar') {
    return `
لغة التقرير المطلوبة: العربية فقط.

قواعد مهمة جدًا:
${ARABIC_WRITING_RULES}
- استخدم العربية في جميع العناوين والوصف والنقاط والأقسام والخلاصة.
- لا تستخدم عناوين إنجليزية إذا كانت لغة التقرير عربية.
- اجعل opportunityLabel قصيرة جدًا بالعربية، من 2 إلى 4 كلمات.
`;
  }

  return `
Report language required: English only.

Critical rules:
- Write the full report in English.
- Do not mix Arabic and English in normal prose unless a brand, platform, or unavoidable user term must remain unchanged.
- Use English for all titles, descriptions, bullets, summaries, and labels.
- Keep opportunityLabel short in English, ideally 2 to 4 words.
`;
}

function labelFromScore(score: number, language: OutputLanguage) {
  if (language === 'ar') {
    if (score >= 75) return 'فرصة قوية';
    if (score >= 60) return 'سوق واعد';
    if (score >= 40) return 'فرصة متوسطة';
    return 'تحتاج تحقق';
  }

  if (score >= 75) return 'High Potential';
  if (score >= 60) return 'Promising Niche';
  if (score >= 40) return 'Moderate Opportunity';
  return 'Needs Validation';
}

function normalizeOpportunityScore(value: unknown, fallback = 65) {
  let score = typeof value === 'number' ? value : fallback;

  if (!Number.isFinite(score) || score < 1) {
    score = fallback;
  }

  if (score >= 1 && score <= 10) {
    score = score * 10;
  }

  score = Math.round(score);
  score = Math.max(1, Math.min(100, score));

  return score;
}

function normalizeScoreBreakdownItem(
  value: unknown,
  fallbackScore: number,
  fallbackNote: string
): ScoreBreakdownItem {
  const obj = typeof value === 'object' && value !== null ? value : {};

  return {
    score: normalizeOpportunityScore(
      (obj as Record<string, unknown>).score,
      fallbackScore
    ),
    note: normalizeText((obj as Record<string, unknown>).note, fallbackNote),
  };
}

function normalizeScoreBreakdown(
  value: unknown,
  language: OutputLanguage
): ScoreBreakdown {
  const obj = typeof value === 'object' && value !== null ? value : {};

  const fallbacks =
    language === 'ar'
      ? {
          demand: 'يوجد طلب واضح إذا كانت المشكلة متكررة ومؤلمة للعميل.',
          abilityToWin:
            'يمكن تحسين فرص الفوز عبر التخصص في شريحة أو زاوية أوضح.',
          monetization:
            'هناك مسار ربحي جيد إذا كان العرض الأول واضحًا ومباشرًا.',
          speedToMvp: 'يمكن إطلاق نسخة أولية مقنعة خلال وقت معقول.',
          distribution:
            'الوصول للعملاء ممكن لكنه يحتاج جهدًا مركزًا في الاكتساب.',
        }
      : {
          demand:
            'Demand appears real if the offer targets a painful and frequent problem.',
          abilityToWin:
            'A narrower niche and sharper positioning can improve the chance to win.',
          monetization:
            'There is a viable path to monetization if the first offer is concrete and outcome-driven.',
          speedToMvp: 'A focused MVP can likely be launched relatively quickly.',
          distribution:
            'Distribution is possible, but customer acquisition may require focused founder-led effort.',
        };

  return {
    demand: normalizeScoreBreakdownItem(
      (obj as Record<string, unknown>).demand,
      72,
      fallbacks.demand
    ),
    abilityToWin: normalizeScoreBreakdownItem(
      (obj as Record<string, unknown>).abilityToWin,
      64,
      fallbacks.abilityToWin
    ),
    monetization: normalizeScoreBreakdownItem(
      (obj as Record<string, unknown>).monetization,
      70,
      fallbacks.monetization
    ),
    speedToMvp: normalizeScoreBreakdownItem(
      (obj as Record<string, unknown>).speedToMvp,
      76,
      fallbacks.speedToMvp
    ),
    distribution: normalizeScoreBreakdownItem(
      (obj as Record<string, unknown>).distribution,
      63,
      fallbacks.distribution
    ),
  };
}

function calculateOverallScoreFromBreakdown(breakdown: ScoreBreakdown) {
  const total =
    breakdown.demand.score +
    breakdown.abilityToWin.score +
    breakdown.monetization.score +
    breakdown.speedToMvp.score +
    breakdown.distribution.score;

  return Math.round(total / 5);
}

function validateAndRepairResult(
  raw: unknown,
  inputQuery: string,
  language: OutputLanguage
): AnalysisResult {
  const obj = typeof raw === 'object' && raw !== null ? raw : {};
  const scoreBreakdown = normalizeScoreBreakdown(
    (obj as Record<string, unknown>).scoreBreakdown,
    language
  );
  const derivedScore = calculateOverallScoreFromBreakdown(scoreBreakdown);
  const score = derivedScore;

  const fallbackCopy =
    language === 'ar'
      ? {
          summary: 'تبدو هذه الفرصة واعدة تجاريًا لكنها ما زالت تحتاج تحققًا مبكرًا من العملاء.',
          whyThisOpportunity:
            'المشكلة تبدو حقيقية ومتكررة ويمكن تحويلها إلى عرض ربحي واضح.',
          marketDemandTitle: 'طلب واضح',
          marketDemandDescription:
            'توجد مؤشرات طلب إذا تمحور العرض حول أثر تشغيلي أو تجاري واضح.',
          competitionTitle: 'منافسة متفرقة',
          competitionDescription:
            'توجد منافسة، لكن لا يزال هناك مجال للتميز بزاوية أوضح وتخصص أدق.',
          targetCustomersTitle: 'عملاء محددون',
          targetCustomersDescription:
            'ابدأ بعملاء لديهم ألم عاجل وميزانية ومسار شراء قصير.',
          bestFirstCustomerTitle: 'عميل أول مناسب',
          bestFirstCustomerDescription:
            'ابدأ بعميل مبكر يشعر بالمشكلة الآن ويمكنه الموافقة بسرعة على تجربة مدفوعة.',
          firstOfferTitle: 'عرض تجريبي',
          firstOfferPrice: 'إعداد مدفوع + أول شهر',
          firstOfferDescription:
            'بع عرضًا تجريبيًا مدفوعًا قبل بناء منصة أكبر.',
          revenueTitle: 'اشتراك متكرر',
          revenuePrice: 'اشتراك شهري',
          revenueDescription:
            'استخدم نموذجًا متكررًا مرتبطًا بقيمة مستمرة واحتفاظ أعلى.',
          nextSteps: [
            'أجر 10 مقابلات مع العملاء المستهدفين.',
            'بع تجربة مدفوعة واحدة.',
            'ابنِ أصغر نسخة مفيدة ممكنة.',
          ],
          painPoints: [
            'العمل اليدوي يهدر وقت الفريق.',
            'يوجد تسرب في الإيراد بسبب ضعف المتابعة.',
            'الرؤية التشغيلية والأدائية محدودة.',
          ],
          opportunityAngle:
            'اربح عبر التركيز على سير عمل واحد مؤلم ونتيجة واحدة قابلة للقياس.',
          goToMarket:
            'ابدأ بوصول مباشر وبيع مؤسس-بمؤسس وعرض تجريبي ضيق لكسب أول العملاء.',
          risks: [
            'قد لا يشتري السوق بالسرعة المتوقعة.',
            'قد يكون العرض واسعًا أكثر من اللازم.',
            'قد تصبح عملية التنفيذ معقدة مبكرًا.',
          ],
        }
      : {
          summary:
            'This opportunity looks commercially promising but still needs early customer validation.',
          whyThisOpportunity:
            'The problem appears real, recurring, and monetizable for a clear buyer group.',
          marketDemandTitle: 'Visible demand',
          marketDemandDescription:
            'There are signs of demand if the offer is positioned around clear operational ROI.',
          competitionTitle: 'Fragmented competition',
          competitionDescription:
            'Competition exists, but a focused positioning angle can still create room to win.',
          targetCustomersTitle: 'Specific buyer group',
          targetCustomersDescription:
            'Prioritize customers with urgent pain, budget, and a fast buying path.',
          bestFirstCustomerTitle: 'Early adopter buyer',
          bestFirstCustomerDescription:
            'Start with buyers who already feel the pain and can approve a pilot quickly.',
          firstOfferTitle: 'Pilot offer',
          firstOfferPrice: 'Paid setup + first month',
          firstOfferDescription:
            'Sell a paid pilot before building a bigger platform.',
          revenueTitle: 'Recurring subscription',
          revenuePrice: 'Monthly subscription',
          revenueDescription:
            'Use a recurring pricing model tied to ongoing value and retention.',
          nextSteps: [
            'Interview 10 target buyers.',
            'Sell one paid pilot offer.',
            'Build the smallest useful MVP.',
          ],
          painPoints: [
            'Manual workflows waste staff time.',
            'Revenue leaks from inconsistent follow-up.',
            'Visibility into performance is limited.',
          ],
          opportunityAngle:
            'Win by focusing on one urgent workflow and one measurable outcome.',
          goToMarket:
            'Use direct outreach, founder-led sales, and a narrow pilot offer to get the first customers.',
          risks: [
            'The market may not buy quickly enough.',
            'The value proposition may be too broad.',
            'Execution may become too complex too early.',
          ],
        };

  return {
    query: normalizeText((obj as Record<string, unknown>).query, inputQuery),
    opportunityScore: score,
    opportunityLabel: labelFromScore(score, language),
    scoreBreakdown,
    summary: normalizeText(
      (obj as Record<string, unknown>).summary,
      fallbackCopy.summary
    ),
    whyThisOpportunity: normalizeText(
      (obj as Record<string, unknown>).whyThisOpportunity,
      fallbackCopy.whyThisOpportunity
    ),
    marketDemand: normalizeSection(
      (obj as Record<string, unknown>).marketDemand,
      fallbackCopy.marketDemandTitle,
      fallbackCopy.marketDemandDescription
    ),
    competition: normalizeSection(
      (obj as Record<string, unknown>).competition,
      fallbackCopy.competitionTitle,
      fallbackCopy.competitionDescription
    ),
    targetCustomers: normalizeSection(
      (obj as Record<string, unknown>).targetCustomers,
      fallbackCopy.targetCustomersTitle,
      fallbackCopy.targetCustomersDescription
    ),
    bestFirstCustomer: normalizeSection(
      (obj as Record<string, unknown>).bestFirstCustomer,
      fallbackCopy.bestFirstCustomerTitle,
      fallbackCopy.bestFirstCustomerDescription
    ),
    suggestedMvp: normalizeMvpSection(
      (obj as Record<string, unknown>).suggestedMvp,
      language
    ),
    firstOffer: normalizeOfferSection(
      (obj as Record<string, unknown>).firstOffer,
      fallbackCopy.firstOfferTitle,
      fallbackCopy.firstOfferPrice,
      fallbackCopy.firstOfferDescription
    ),
    revenueModel: normalizeRevenueSection(
      (obj as Record<string, unknown>).revenueModel,
      fallbackCopy.revenueTitle,
      fallbackCopy.revenuePrice,
      fallbackCopy.revenueDescription
    ),
    nextSteps: normalizeStringArray(
      (obj as Record<string, unknown>).nextSteps,
      fallbackCopy.nextSteps,
      3
    ),
    painPoints: normalizeStringArray(
      (obj as Record<string, unknown>).painPoints,
      fallbackCopy.painPoints,
      3
    ),
    opportunityAngle: normalizeText(
      (obj as Record<string, unknown>).opportunityAngle,
      fallbackCopy.opportunityAngle
    ),
    goToMarket: normalizeText(
      (obj as Record<string, unknown>).goToMarket,
      fallbackCopy.goToMarket
    ),
    risks: normalizeStringArray(
      (obj as Record<string, unknown>).risks,
      fallbackCopy.risks,
      3
    ),
  };
}

function normalizeDisplayInputs(
  raw: unknown,
  fallback: {
    query: string;
    market: string;
    customer: string;
  },
  language: OutputLanguage
): DisplayInputs {
  const obj = typeof raw === 'object' && raw !== null ? raw : {};
  const notSpecified = language === 'ar' ? 'غير محدد' : 'Not specified';

  return {
    query: normalizeText((obj as Record<string, unknown>).query, fallback.query),
    market: normalizeText(
      (obj as Record<string, unknown>).displayMarket,
      fallback.market || notSpecified
    ),
    customer: normalizeText(
      (obj as Record<string, unknown>).displayCustomer,
      fallback.customer || notSpecified
    ),
  };
}

function buildAnalysisInput(params: {
  query: string;
  market: string;
  customer: string;
  outputLanguage: OutputLanguage;
}) {
  const languageInstruction = buildLanguageInstruction(params.outputLanguage);

  return `Analyze this startup opportunity for Madixo.

Business Idea:
${params.query}

Target Market:
${params.market}

Target Customer:
${params.customer}

Return a practical founder-grade opportunity report.

${languageInstruction}

Rules:
- Prioritize commercial clarity, buyer specificity, fast validation paths, and realistic first offers.
- Avoid generic advice.
- Keep every field concise, sharp, and readable inside dashboard cards.
- query must restate the business idea in the requested output language for clean display inside the report.
- If the exact same inputs are analyzed again, keep the reasoning and scoring internally consistent instead of drifting.
- displayMarket must restate the target market in the requested output language.
- displayCustomer must restate the target customer in the requested output language.
- If target market or target customer is missing, return the language-appropriate equivalent of "Not specified".
- opportunityScore must be a number from 1 to 100.
- Do NOT use a 1-10 score.
- scoreBreakdown must include exactly these five factors:
  - demand
  - abilityToWin
  - monetization
  - speedToMvp
  - distribution
- Each scoreBreakdown factor must have:
  - score: number from 1 to 100
  - note: short explanation
- opportunityLabel must stay short and consistent with the score.
- Avoid inflated assumptions.
- If the output language is Arabic, use plain modern standard Arabic that is easy for any Arabic speaker to understand, with short natural sentences and everyday business wording. Avoid local, ambiguous, literal-translated, or consultant-style jargon. Prefer Arabic-script platform names inside Arabic sentences whenever natural.
- Do not assume very high ad spend unless clearly justified.
- Prefer operational signals over speculative budget assumptions.
- Return exactly 3 items for features, nextSteps, painPoints, and risks.

Length rules:
- summary: max 2 sentences
- whyThisOpportunity: max 2 sentences
- each scoreBreakdown note: max 1 sentence
- each section title: max 4 words
- each section description: max 2 sentences
- firstOffer.priceIdea: short phrase only
- revenueModel.price: short phrase only
- opportunityAngle: max 2 sentences
- goToMarket: max 2 sentences
- each item in features, nextSteps, painPoints, and risks should be short and direct
- Do not repeat the same idea across multiple sections`;
}

function getIncompleteErrorMessage(reason?: string) {
  if (reason === 'max_output_tokens') {
    return 'Madixo needed a little more room to finish this analysis. Please try again.';
  }

  return 'Madixo could not complete this analysis. Please try again.';
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Madixo Analyze API is working.',
    model: MODEL,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;

    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Business idea is required.',
        },
        { status: 400 }
      );
    }

    const requestedUiLang =
      body.uiLang === 'ar' || body.uiLang === 'en' ? body.uiLang : undefined;

    const outputLanguage =
      requestedUiLang ||
      detectOutputLanguage({
        query,
        market: body.market?.trim() || '',
        customer: body.customer?.trim() || '',
      });


    const market = body.market?.trim() || '';
    const customer = body.customer?.trim() || '';

    const inputValidation = validateAnalyzeInputs({
      query,
      market,
      customer,
      outputLanguage,
    });

    if (!inputValidation.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: 'INPUT_TOO_WEAK',
          error: inputValidation.error,
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const accessToken = getBearerToken(request);

    let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null = null;
    let authErrorMessage = '';

    if (accessToken) {
      const {
        data: tokenUserData,
        error: tokenUserError,
      } = await supabase.auth.getUser(accessToken);

      if (!tokenUserError && tokenUserData.user) {
        user = tokenUserData.user;
      } else if (tokenUserError) {
        authErrorMessage = tokenUserError.message;
      }
    }

    if (!user) {
      const {
        data: cookieUserData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        authErrorMessage = authError.message;
      }

      user = cookieUserData.user;
    }

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          code: 'AUTH_REQUIRED',
          error:
            outputLanguage === 'ar'
              ? 'يجب تسجيل الدخول أولًا لبدء تحليل الفرصة.'
              : 'You need to sign in first to start the opportunity analysis.',
          details: authErrorMessage || undefined,
        },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: 'OPENAI_API_KEY is missing from .env.local',
        },
        { status: 500 }
      );
    }

    const currentPlan = readPlanFromUserMetadata(user) ?? (await getCurrentMadixoPlan());
    const currentPlanLimits = PLAN_LIMITS[currentPlan];
    const currentUsage = readAnalysisUsageFromRequest(request);
    const usageKey = buildAnalysisUsageKey({
      query,
      market,
      customer,
      language: outputLanguage,
    });
    const alreadyCounted = currentUsage.items.includes(usageKey);

    const matchedReport = await findLatestMatchingUserReport({
      query,
      market,
      customer,
    });

    if (matchedReport && areSameInputs(
      { query, market, customer },
      {
        query: matchedReport.query,
        market: matchedReport.market,
        customer: matchedReport.customer,
      }
    )) {
      const repairedCachedResult = validateAndRepairResult(
        matchedReport.result,
        matchedReport.query,
        outputLanguage
      );

      return NextResponse.json({
        ok: true,
        result: {
          ...repairedCachedResult,
          query: matchedReport.query,
        },
        displayInputs: {
          query: matchedReport.query,
          market: matchedReport.market,
          customer: matchedReport.customer,
        },
        meta: {
          model: 'cached_previous_report',
          usage: null,
          outputLanguage,
          cached: true,
        },
      });
    }

    if (
      currentPlan === 'free' &&
      !alreadyCounted &&
      typeof currentPlanLimits.analysisRuns === 'number' &&
      currentUsage.items.length >= currentPlanLimits.analysisRuns
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: 'ANALYSIS_LIMIT',
          reason: 'analysis_limit',
          error: outputLanguage === 'ar'
            ? 'استهلكت 5 تحليلات مجانية. تحتاج إلى الترقية للمتابعة.'
            : 'You used the 5 free analyses. Upgrade to continue.',
        },
        { status: 403 }
      );
    }

    const response = await client.responses.create({
      model: MODEL,
      instructions:
        outputLanguage === 'ar'
          ? `أنت Madixo، محلل فرص تجارية للمؤسسين والشركات الصغيرة. أخرج فقط التقرير المنظم المطلوب. كن موجزًا، عمليًا، واقعيًا، ومحددًا. اجعل جميع الأقسام سهلة القراءة، قصيرة، ومتماسكة. ${ARABIC_WRITING_RULES} اكتب بالعربية فقط إلا إذا كان اسم منصة أو اختصارًا لا يُفهم عادة بدون لغته الأصلية.`
          : 'You are Madixo, an AI opportunity analyst for founders and small businesses. Output only the structured report requested. Be concise, commercially useful, specific, compact, and realistic. Keep all sections tight and readable. Avoid speculative numbers unless clearly justified. Write in English only unless a platform or acronym must remain unchanged.',
      input: buildAnalysisInput({
        query,
        market,
        customer,
        outputLanguage,
      }),
      max_output_tokens: MAX_OUTPUT_TOKENS,
      truncation: 'auto',
      text: {
        format: {
          type: 'json_schema',
          ...reportSchema,
        },
      },
    });

    if (response.status === 'failed') {
      return NextResponse.json(
        {
          ok: false,
          error:
            response.error?.message || 'The model failed to generate a response.',
        },
        { status: 502 }
      );
    }

    if (response.status === 'incomplete') {
      const reason =
        response.incomplete_details?.reason || 'unknown_incomplete_reason';

      return NextResponse.json(
        {
          ok: false,
          error: getIncompleteErrorMessage(reason),
        },
        { status: 502 }
      );
    }

    if (response.status !== 'completed') {
      return NextResponse.json(
        {
          ok: false,
          error: `Unexpected response status: ${response.status}`,
        },
        { status: 502 }
      );
    }

    const rawText = response.output_text?.trim();

    if (!rawText) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The model returned an empty response.',
        },
        { status: 502 }
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'The model returned invalid JSON.',
        },
        { status: 502 }
      );
    }

    const displayInputs = normalizeDisplayInputs(
      parsed,
      {
        query,
        market,
        customer,
      },
      outputLanguage
    );

    const result = validateAndRepairResult(parsed, query, outputLanguage);

    const successResponse = NextResponse.json({
      ok: true,
      result: {
        ...result,
        query: displayInputs.query,
      },
      displayInputs,
      meta: {
        model: response.model,
        usage: response.usage ?? null,
        outputLanguage,
        cached: false,
      },
    });

    if (currentPlan === 'free' && !alreadyCounted) {
      writeAnalysisUsageCookie(successResponse, {
        items: [...currentUsage.items, usageKey],
      });
    }

    return successResponse;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while analyzing the opportunity.',
      },
      { status: 500 }
    );
  }
}
