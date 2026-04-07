import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { updateReportResultInDb } from '@/lib/madixo-db';
import {
  initialFeasibilitySchema,
  normalizeFeasibilityStudyDisplay,
  normalizeInitialFeasibilityStudy,
  type InitialFeasibilityStudy,
  type MoneyCurrency,
} from '@/lib/madixo-feasibility';
import type { AnalysisResult } from '@/lib/madixo-reports';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

type UiLanguage = 'ar' | 'en';

type FeasibilityRequestBody = {
  query?: string;
  market?: string;
  customer?: string;
  uiLang?: UiLanguage;
  reportId?: string;
  result?: AnalysisResult;
};


type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function getTrimmedString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}



const ARABIC_WRITING_RULES = `
- اكتب بالعربية الفصحى البسيطة والمباشرة.
- اجعل الصياغة عملية وسريعة الفهم.
- لا تدّعِ دقة محاسبية نهائية.
- هذه دراسة أولية مبنية على افتراضات فقط.
- استخدم جملًا قصيرة قدر الإمكان.
- اجعل كل نقطة مختصرة وواضحة.
`.trim();

function normalizeText(value: string | null | undefined, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getMaxOutputTokens(compact = false) {
  const configured = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || '3200');
  const fallback = compact ? 1600 : 2600;

  if (!Number.isFinite(configured) || configured <= 0) {
    return fallback;
  }

  const capped = compact ? Math.min(configured, 1600) : Math.min(configured, 3200);
  return Math.floor(Math.max(compact ? 1100 : 1800, capped));
}

function detectPreferredCurrency(params: {
  query: string;
  market: string;
  customer: string;
}): MoneyCurrency {
  const text = `${params.query} ${params.market} ${params.customer}`.toLowerCase();
  const saudiMarkers = [
    'saudi',
    'saudi arabia',
    'ksa',
    'riyadh',
    'jeddah',
    'dammam',
    'khobar',
    'makkah',
    'mecca',
    'medina',
    'madinah',
    'الرياض',
    'جدة',
    'السعود',
    'السعودية',
    'المملكة',
    'الدمام',
    'الخبر',
    'مكة',
    'المدينة',
    'ر.س',
    'ريال',
    'sar',
  ];

  return saudiMarkers.some((marker) => text.includes(marker)) ? 'SAR' : 'USD';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function moneyRange(
  min: number,
  max: number,
  params: {
    currency: MoneyCurrency;
    uiLang: UiLanguage;
    monthly?: boolean;
    plus?: boolean;
  }
) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const lowText = formatNumber(low);
  const highText = formatNumber(high);
  const isSingle = low === high;

  if (params.uiLang === 'ar') {
    const unit = params.currency === 'SAR' ? 'ريال' : 'دولار';
    const base = isSingle
      ? `${lowText}${params.plus ? '+' : ''} ${unit}`
      : `${lowText}–${highText} ${unit}`;

    return params.monthly ? `${base} شهريًا` : base;
  }

  if (params.currency === 'SAR') {
    const base = isSingle
      ? `SAR ${lowText}${params.plus ? '+' : ''}`
      : `SAR ${lowText}–${highText}`;

    return params.monthly ? `${base} / month` : base;
  }

  const base = isSingle
    ? `$${lowText}${params.plus ? '+' : ''}`
    : `$${lowText}–$${highText}`;

  return params.monthly ? `${base} / month` : base;
}

function buildFeasibilityInput(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
  preferredCurrency: MoneyCurrency;
  result: AnalysisResult;
  compact?: boolean;
}) {
  const safeMarket = normalizeText(
    params.market,
    params.uiLang === 'ar' ? 'غير محدد' : 'Not specified'
  );
  const safeCustomer = normalizeText(
    params.customer,
    params.uiLang === 'ar' ? 'غير محدد' : 'Not specified'
  );

  const currencyLine =
    params.uiLang === 'ar'
      ? params.preferredCurrency === 'SAR'
        ? 'استخدم الريال السعودي في جميع التقديرات لأن السوق المستهدف سعودي أو مرتبط بالسعودية.'
        : 'استخدم الدولار الأمريكي في جميع التقديرات لأن السوق المستهدف غير سعودي بشكل واضح.'
      : params.preferredCurrency === 'SAR'
        ? 'Use Saudi riyal (SAR) for all estimates because the target market is Saudi or Saudi-linked.'
        : 'Use USD for all estimates because the target market is not clearly Saudi.';

  const formattingLine =
    params.uiLang === 'ar'
      ? params.preferredCurrency === 'SAR'
        ? 'نسّق كل نطاق من الأصغر إلى الأكبر بهذا الشكل فقط: 2,000–7,000 ريال أو 500–3,000 ريال شهريًا.'
        : 'نسّق كل نطاق من الأصغر إلى الأكبر بهذا الشكل فقط: 2,000–7,000 دولار أو 500–3,000 دولار شهريًا.'
      : params.preferredCurrency === 'SAR'
        ? 'Format every range from low to high only like this: SAR 2,000–7,000 or SAR 500–3,000 / month.'
        : 'Format every range from low to high only like this: $2,000–$7,000 or $500–$3,000 / month.';

  const shared = [
    params.uiLang === 'ar'
      ? 'أنشئ دراسة جدوى أولية مبنية على هذا التقرير.'
      : 'Create an initial feasibility study from this opportunity report.',
    '',
    `${params.uiLang === 'ar' ? 'فكرة المشروع' : 'Business idea'}: ${params.query}`,
    `${params.uiLang === 'ar' ? 'السوق المستهدف' : 'Target market'}: ${safeMarket}`,
    `${params.uiLang === 'ar' ? 'العميل المستهدف' : 'Target customer'}: ${safeCustomer}`,
    `${params.uiLang === 'ar' ? 'درجة الفرصة' : 'Opportunity score'}: ${params.result.opportunityScore}/100`,
    `${params.uiLang === 'ar' ? 'الخلاصة' : 'Summary'}: ${params.result.summary}`,
    `${params.uiLang === 'ar' ? 'لماذا هذه الفرصة' : 'Why this opportunity'}: ${params.result.whyThisOpportunity}`,
    `${params.uiLang === 'ar' ? 'النسخة الأولية المقترحة' : 'Suggested MVP'}: ${params.result.suggestedMvp.title} — ${params.result.suggestedMvp.description}`,
    `${params.uiLang === 'ar' ? 'أول عرض' : 'First offer'}: ${params.result.firstOffer.title} — ${params.result.firstOffer.priceIdea}`,
    `${params.uiLang === 'ar' ? 'نموذج الإيرادات' : 'Revenue model'}: ${params.result.revenueModel.title} — ${params.result.revenueModel.price}`,
    `${params.uiLang === 'ar' ? 'المخاطر' : 'Risks'}: ${params.result.risks.join(' | ')}`,
  ];

  if (!params.compact) {
    shared.push(
      `${params.uiLang === 'ar' ? 'طلب السوق' : 'Market demand'}: ${params.result.marketDemand.title} — ${params.result.marketDemand.description}`,
      `${params.uiLang === 'ar' ? 'المنافسة' : 'Competition'}: ${params.result.competition.title} — ${params.result.competition.description}`,
      `${params.uiLang === 'ar' ? 'العملاء المستهدفون' : 'Target customers'}: ${params.result.targetCustomers.title} — ${params.result.targetCustomers.description}`,
      `${params.uiLang === 'ar' ? 'ميزات النسخة الأولية' : 'MVP features'}: ${params.result.suggestedMvp.features.join(', ')}`,
      `${params.uiLang === 'ar' ? 'الخطوات التالية' : 'Next steps'}: ${params.result.nextSteps.join(' | ')}`
    );
  }

  shared.push(
    '',
    params.uiLang === 'ar'
      ? [
          'المطلوب:',
          '- أخرج تقديرات أولية فقط وليست خطة مالية نهائية.',
          '- افترض بداية صغيرة يقودها مؤسس أو فريق صغير.',
          `- ${currencyLine}`,
          `- ${formattingLine}`,
          '- لا تكتب الشهر قبل الرقم، ولا تعكس ترتيب النطاق أبدًا.',
          '- كن واقعيًا ولا تبالغ في الأرقام.',
          '- اجعل كل وصف أو ملاحظة قصيرة ومباشرة.',
          params.compact
            ? '- اجعل كل حقل مختصرًا جدًا، ويفضل جملة واحدة قصيرة.'
            : '- اجعل المخرجات مختصرة وواضحة وسهلة القراءة.',
        ].join('\n')
      : [
          'Requirements:',
          '- Produce rough early-stage estimates, not final accounting-grade numbers.',
          '- Assume an early founder-led or small-team launch.',
          `- ${currencyLine}`,
          `- ${formattingLine}`,
          '- Never put month before the amount, and never reverse a range.',
          '- Stay realistic and do not inflate figures.',
          '- Keep every note short and direct.',
          params.compact
            ? '- Keep each field very compact, ideally one short sentence.'
            : '- Keep the whole output concise and easy to scan.',
        ].join('\n')
  );

  return shared.join('\n');
}

async function requestFeasibility(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
  preferredCurrency: MoneyCurrency;
  result: AnalysisResult;
  compact?: boolean;
}) {
  return client.responses.create({
    model: MODEL,
    instructions:
      params.uiLang === 'ar'
        ? `أنت Madixo، خبير في الجدوى الأولية للمشاريع. أخرج فقط الدراسة المنظمة المطلوبة. كن عمليًا وصريحًا وواقعيًا ومختصرًا. ${ARABIC_WRITING_RULES}`
        : 'You are Madixo, an AI analyst that prepares early feasibility studies for founders. Output only the requested structured study. Be practical, realistic, commercially useful, concise, and easy to scan. Do not present speculative figures as certainty.',
    input: buildFeasibilityInput(params),
    max_output_tokens: getMaxOutputTokens(params.compact),
    truncation: 'auto',
    text: {
      format: {
        type: 'json_schema',
        ...initialFeasibilitySchema,
      },
    },
  });
}

function extractParsedFromPart(part: unknown): unknown | null {
  if (!isRecord(part)) return null;

  if (isRecord(part.parsed)) {
    return part.parsed;
  }

  if (isRecord(part.json)) {
    return part.json;
  }

  if (isRecord(part.arguments)) {
    return part.arguments;
  }

  return null;
}

function extractParsedFromItem(item: unknown): unknown | null {
  if (!isRecord(item)) return null;

  if (isRecord(item.parsed)) {
    return item.parsed;
  }

  for (const part of getRecordArray(item.content)) {
    const parsed = extractParsedFromPart(part);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function extractTextFromOutputItem(item: unknown): string[] {
  if (!isRecord(item)) {
    return [];
  }

  const content = getRecordArray(item.content);
  if (content.length) {
    return content.flatMap((part) => {
      const text = getTrimmedString(part.text);
      if (text) {
        return [text];
      }

      const outputText = getTrimmedString(part.output_text);
      if (outputText) {
        return [outputText];
      }

      const value = getTrimmedString(part.value);
      if (value) {
        return [value];
      }

      return [];
    });
  }

  const text = getTrimmedString(item.text);
  return text ? [text] : [];
}

function getRawResponseText(response: unknown): string {
  if (!isRecord(response)) {
    return '';
  }

  const outputText = getTrimmedString(response.output_text);
  if (outputText) {
    return outputText;
  }

  const output = getRecordArray(response.output);
  if (output.length) {
    const collected = output.flatMap((item) => extractTextFromOutputItem(item));

    if (collected.length) {
      return collected.join('\n').trim();
    }
  }

  return '';
}

function stripMarkdownCodeFence(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function extractJsonCandidate(value: string) {
  const stripped = stripMarkdownCodeFence(value);

  if (!stripped) {
    return '';
  }

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1).trim();
  }

  return stripped;
}

function parseStudyFromResponse(response: unknown): InitialFeasibilityStudy | null {
  if (isRecord(response) && isRecord(response.output_parsed)) {
    return normalizeInitialFeasibilityStudy(response.output_parsed);
  }

  if (isRecord(response)) {
    for (const item of getRecordArray(response.output)) {
      const parsed = extractParsedFromItem(item);
      if (isRecord(parsed)) {
        return normalizeInitialFeasibilityStudy(parsed);
      }
    }
  }

  const rawText = getRawResponseText(response);
  const jsonCandidate = extractJsonCandidate(rawText);

  if (!jsonCandidate) {
    return null;
  }

  try {
    return normalizeInitialFeasibilityStudy(JSON.parse(jsonCandidate));
  } catch {
    return null;
  }
}

function detectBusinessMode(params: {
  query: string;
  market: string;
  customer: string;
  result: AnalysisResult;
}) {
  const text = [
    params.query,
    params.market,
    params.customer,
    params.result.summary,
    params.result.suggestedMvp.title,
    params.result.revenueModel.title,
    params.result.firstOffer.title,
  ]
    .join(' ')
    .toLowerCase();

  const isArabic = /[\u0600-\u06FF]/.test(text);

  const softwareTerms = isArabic
    ? ['تطبيق', 'منصة', 'برمج', 'ذكاء', 'saas', 'ai', 'software', 'dashboard', 'automation']
    : ['app', 'platform', 'software', 'saas', 'ai', 'automation', 'dashboard'];
  const serviceTerms = isArabic
    ? ['خدمة', 'استشارة', 'وكالة', 'تنفيذ', 'إدارة', 'تصميم']
    : ['service', 'consulting', 'agency', 'done-for-you', 'management', 'design'];
  const productTerms = isArabic
    ? ['متجر', 'منتج', 'ملابس', 'تيشيرت', 'قميص', 'شحن', 'مخزون', 'طباعة']
    : ['store', 'product', 'ecommerce', 'inventory', 'shipping', 'shirt', 't-shirt', 'clothing'];

  const hasAny = (terms: string[]) => terms.some((term) => text.includes(term));

  if (hasAny(productTerms)) return 'product';
  if (hasAny(serviceTerms)) return 'service';
  if (hasAny(softwareTerms)) return 'software';

  return 'hybrid';
}

function getRangeByMode(mode: 'software' | 'service' | 'product' | 'hybrid') {
  switch (mode) {
    case 'software':
      return {
        startup: [1200, 6100] as const,
        monthly: [400, 4000] as const,
        conservative: [400, 1500] as const,
        base: [2000, 6000] as const,
        optimistic: [7000, 18000] as const,
      };
    case 'service':
      return {
        startup: [1200, 6100] as const,
        monthly: [350, 3800] as const,
        conservative: [700, 2000] as const,
        base: [2500, 6500] as const,
        optimistic: [7000, 15000] as const,
      };
    case 'product':
      return {
        startup: [1400, 7100] as const,
        monthly: [350, 3800] as const,
        conservative: [800, 2500] as const,
        base: [3000, 8000] as const,
        optimistic: [9000, 22000] as const,
      };
    default:
      return {
        startup: [1200, 6100] as const,
        monthly: [350, 3800] as const,
        conservative: [500, 1800] as const,
        base: [2000, 6000] as const,
        optimistic: [7000, 18000] as const,
      };
  }
}

function buildLocalFallbackStudy(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
  preferredCurrency: MoneyCurrency;
  result: AnalysisResult;
}) {
  const mode = detectBusinessMode(params);
  const ranges = getRangeByMode(mode);
  const score = Number.isFinite(params.result.opportunityScore)
    ? Math.max(1, Math.min(100, Math.round(params.result.opportunityScore)))
    : 60;

  const verdictKey: InitialFeasibilityStudy['verdictKey'] =
    score >= 75 ? 'start_now' : score >= 55 ? 'start_with_conditions' : 'not_yet';

  if (params.uiLang === 'ar') {
    const verdictLabel =
      verdictKey === 'start_now'
        ? 'ابدأ الآن'
        : verdictKey === 'not_yet'
          ? 'ليس الآن'
          : 'ابدأ لكن بشروط';

    const summary =
      verdictKey === 'start_now'
        ? 'المشروع يبدو قابلًا للتنفيذ مبدئيًا إذا بدأت بنسخة ضيقة وتحكمت في الإنفاق من البداية.'
        : verdictKey === 'not_yet'
          ? 'الفكرة تحتاج ضبطًا أقوى في العرض أو التسعير أو القناة قبل ضخ تكلفة أكبر.'
          : 'الفكرة تبدو ممكنة، لكن نجاحها المبكر يعتمد على عرض أول واضح، تكلفة منخفضة، وتجربة سوق سريعة.';

    return normalizeFeasibilityStudyDisplay(
      normalizeInitialFeasibilityStudy({
        verdictKey,
        verdictLabel,
        verdictSummary: summary,
        keyAssumptions: [
          `سيبدأ المشروع بعرض أول بسيط حول: ${params.result.firstOffer.title}.`,
          `سيتم اختبار البيع في سوق ${normalizeText(params.market, 'مبدئي')} قبل التوسع.`,
          `النسخة الأولى ستبقى صغيرة وتعتمد على: ${params.result.suggestedMvp.title}.`,
          'سيتم ضبط المصروفات في البداية وعدم بناء فريق كبير مبكرًا.',
        ],
        startupCosts: {
          totalRange: moneyRange(ranges.startup[0], ranges.startup[1], {
            currency: params.preferredCurrency,
            uiLang: params.uiLang,
          }),
          items: [
            {
              item: 'إعداد النسخة الأولى',
              estimate: moneyRange(mode === 'product' ? 800 : 600, mode === 'product' ? 3500 : 2500, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
              }),
              note: 'إنشاء النسخة الأولى أو تجهيز العرض الأساسي ووسائل التنفيذ.',
            },
            {
              item: 'الهوية والمواد الأساسية',
              estimate: moneyRange(200, 900, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
              }),
              note: 'تصميم أولي، صفحات أساسية، وتجهيز مواد العرض.',
            },
            {
              item: 'التجربة التسويقية الأولى',
              estimate: moneyRange(300, 2000, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
              }),
              note: 'محتوى، إعلانات، أو تواصل مباشر لاختبار الطلب.',
            },
            {
              item: 'أدوات وتشغيل أولي',
              estimate: moneyRange(100, 700, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
              }),
              note: 'دومين، أدوات، اشتراكات، أو تجهيز تشغيلي بسيط.',
            },
          ],
        },
        monthlyCosts: {
          totalRange: moneyRange(ranges.monthly[0], ranges.monthly[1], {
            currency: params.preferredCurrency,
            uiLang: params.uiLang,
            monthly: true,
          }),
          items: [
            {
              item: 'أدوات وبنية تشغيل',
              estimate: moneyRange(mode === 'software' ? 100 : 50, mode === 'software' ? 600 : 400, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
                monthly: true,
              }),
              note: 'استضافة أو أدوات إدارة ومتابعة وتشغيل أساسي.',
            },
            {
              item: 'تسويق مستمر',
              estimate: moneyRange(200, 1500, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
                monthly: true,
              }),
              note: 'اختبار الرسائل والقنوات وتحسين الاكتساب.',
            },
            {
              item: 'تشغيل وخدمة',
              estimate: moneyRange(100, 700, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
                monthly: true,
              }),
              note: 'متابعة العملاء والتنفيذ والدعم البسيط.',
            },
            {
              item: 'دعم جزئي عند الحاجة',
              estimate: moneyRange(0, 1200, {
                currency: params.preferredCurrency,
                uiLang: params.uiLang,
                monthly: true,
              }),
              note: 'تصميم أو محتوى أو تطوير جزئي فقط عند الضرورة.',
            },
          ],
        },
        revenueScenarios: [
          {
            scenario: 'متحفظ',
            monthlyRevenue: moneyRange(ranges.conservative[0], ranges.conservative[1], {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'بداية بطيئة مع عدد محدود من العملاء أو الطلبات الأولى.',
          },
          {
            scenario: 'أساسي',
            monthlyRevenue: moneyRange(ranges.base[0], ranges.base[1], {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'عرض أوضح وقناة اكتساب تعمل بشكل مقبول في البداية.',
          },
          {
            scenario: 'متفائل',
            monthlyRevenue: moneyRange(ranges.optimistic[0], ranges.optimistic[1], {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'تحسن أسرع في العرض والتسعير والقناة مع احتفاظ أفضل.',
          },
        ],
        breakEvenTimeline:
          score >= 75 ? 'تقريبًا خلال 3–6 أشهر' : score >= 55 ? 'تقريبًا خلال 4–9 أشهر' : 'بعد 6–12 شهرًا إذا تحسنت الفرضيات',
        breakEvenSummary:
          'نقطة التعادل هنا تعتمد أساسًا على سرعة أول مبيعات مدفوعة وانضباطك في إبقاء النسخة الأولى صغيرة وقابلة للبيع.',
        financialRisks: [
          'قد تكون تكلفة الوصول لأول عميل أعلى من المتوقع.',
          'قد يكون العرض الأول واسعًا أكثر من اللازم أو غير واضح بما يكفي.',
          'قد يبقى العمل اليدوي مرتفعًا في البداية ويضغط على الهامش.',
        ],
        recommendedAction:
          'ابنِ عرضًا أوليًا صغيرًا، اختبر استعداد الدفع بسرعة، ثم وسّع فقط بعد ظهور طلب واضح ومتكرر.',
        disclaimer:
          'هذه دراسة جدوى أولية مبنية على افتراضات وليست خطة مالية نهائية أو توقعًا محاسبيًا دقيقًا.',
      }),
      params.uiLang,
      params.preferredCurrency
    );
  }

  const verdictLabel =
    verdictKey === 'start_now'
      ? 'Start now'
      : verdictKey === 'not_yet'
        ? 'Not yet'
        : 'Start with conditions';

  const summary =
    verdictKey === 'start_now'
      ? 'The opportunity looks workable early if you launch with a narrow first offer and keep early spending controlled.'
      : verdictKey === 'not_yet'
        ? 'The idea still needs a tighter offer, pricing logic, or distribution angle before bigger spend makes sense.'
        : 'The idea can work, but only with a focused first offer, small initial scope, and disciplined early execution.';

  return normalizeFeasibilityStudyDisplay(
    normalizeInitialFeasibilityStudy({
      verdictKey,
      verdictLabel,
      verdictSummary: summary,
      keyAssumptions: [
        `The first offer will stay narrow around: ${params.result.firstOffer.title}.`,
        `The first launch will test demand in ${normalizeText(params.market, 'the target market')} before expansion.`,
        `The first version will stay small around: ${params.result.suggestedMvp.title}.`,
        'The project will avoid heavy team costs in the early stage.',
      ],
      startupCosts: {
        totalRange: moneyRange(ranges.startup[0], ranges.startup[1], {
          currency: params.preferredCurrency,
          uiLang: params.uiLang,
        }),
        items: [
          {
            item: 'Initial build or setup',
            estimate: moneyRange(mode === 'product' ? 800 : 600, mode === 'product' ? 3500 : 2500, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
            }),
            note: 'A small first version, first offer setup, or execution basics.',
          },
          {
            item: 'Brand and core assets',
            estimate: moneyRange(200, 900, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
            }),
            note: 'Basic brand cleanup, landing assets, and sales materials.',
          },
          {
            item: 'First market test',
            estimate: moneyRange(300, 2000, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
            }),
            note: 'Content, ads, or outreach to validate real demand.',
          },
          {
            item: 'Tools and operating setup',
            estimate: moneyRange(100, 700, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
            }),
            note: 'Domain, software, subscriptions, or light operational setup.',
          },
        ],
      },
      monthlyCosts: {
        totalRange: moneyRange(ranges.monthly[0], ranges.monthly[1], {
          currency: params.preferredCurrency,
          uiLang: params.uiLang,
          monthly: true,
        }),
        items: [
          {
            item: 'Software and operating stack',
            estimate: moneyRange(mode === 'software' ? 100 : 50, mode === 'software' ? 600 : 400, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'Core infrastructure, software, and day-to-day operating tools.',
          },
          {
            item: 'Ongoing marketing',
            estimate: moneyRange(200, 1500, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'Testing channels, messages, and acquisition efficiency.',
          },
          {
            item: 'Operations and support',
            estimate: moneyRange(100, 700, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'Execution, customer follow-up, and basic support load.',
          },
          {
            item: 'Part-time help if needed',
            estimate: moneyRange(0, 1200, {
              currency: params.preferredCurrency,
              uiLang: params.uiLang,
              monthly: true,
            }),
            note: 'Light freelance support for design, content, or technical work.',
          },
        ],
      },
      revenueScenarios: [
        {
          scenario: 'Conservative',
          monthlyRevenue: moneyRange(ranges.conservative[0], ranges.conservative[1], {
            currency: params.preferredCurrency,
            uiLang: params.uiLang,
            monthly: true,
          }),
          note: 'Slow traction with a small number of early customers or orders.',
        },
        {
          scenario: 'Base case',
          monthlyRevenue: moneyRange(ranges.base[0], ranges.base[1], {
            currency: params.preferredCurrency,
            uiLang: params.uiLang,
            monthly: true,
          }),
          note: 'A clearer offer with a decent acquisition channel and repeatable sales.',
        },
        {
          scenario: 'Optimistic',
          monthlyRevenue: moneyRange(ranges.optimistic[0], ranges.optimistic[1], {
            currency: params.preferredCurrency,
            uiLang: params.uiLang,
            monthly: true,
          }),
          note: 'Faster traction, stronger retention, and better offer-market fit.',
        },
      ],
      breakEvenTimeline:
        score >= 75 ? 'Roughly 3–6 months' : score >= 55 ? 'Roughly 4–9 months' : 'Likely 6–12+ months unless the offer improves',
      breakEvenSummary:
        'Break-even depends mainly on how quickly the first paid customers arrive and how tightly the project controls early complexity.',
      financialRisks: [
        'Customer acquisition could cost more than expected.',
        'The first offer may still be too broad or weakly differentiated.',
        'Manual work may stay high for too long and reduce early margins.',
      ],
      recommendedAction:
        'Launch a small first offer, validate willingness to pay early, then expand only after demand becomes clearer.',
      disclaimer:
        'This is an initial feasibility study based on assumptions, not a final financial plan or accounting-grade forecast.',
    }),
    params.uiLang,
    params.preferredCurrency
  );
}

function getFailureMessage(response: unknown, uiLang: UiLanguage) {
  if (isRecord(response)) {
    const status = getTrimmedString(response.status) ?? '';
    const error = isRecord(response.error) ? response.error : null;
    const errorMessage = error ? getTrimmedString(error.message) ?? '' : '';

    if (status === 'failed' && errorMessage) {
      return errorMessage;
    }
  }

  return uiLang === 'ar'
    ? 'تعذر إنشاء الدراسة بهذه الصيغة، لذلك تم استخدام تقدير أولي آمن بدل إظهار فشل للعميل.'
    : 'The study could not be generated in the preferred format, so a safe fallback estimate was used instead of showing a hard failure.';
}

async function generateStudyWithFallback(params: {
  query: string;
  market: string;
  customer: string;
  uiLang: UiLanguage;
  preferredCurrency: MoneyCurrency;
  result: AnalysisResult;
}) {
  const first = await requestFeasibility({ ...params, compact: false });
  const firstParsed = parseStudyFromResponse(first);

  if (firstParsed) {
    return {
      feasibility: normalizeFeasibilityStudyDisplay(
        firstParsed,
        params.uiLang,
        params.preferredCurrency
      ),
      compactFallbackUsed: false,
      localFallbackUsed: false,
    };
  }

  const second = await requestFeasibility({ ...params, compact: true });
  const secondParsed = parseStudyFromResponse(second);

  if (secondParsed) {
    return {
      feasibility: normalizeFeasibilityStudyDisplay(
        secondParsed,
        params.uiLang,
        params.preferredCurrency
      ),
      compactFallbackUsed: true,
      localFallbackUsed: false,
    };
  }

  const localFallback = buildLocalFallbackStudy(params);

  return {
    feasibility: localFallback,
    compactFallbackUsed: true,
    localFallbackUsed: true,
    fallbackReason:
      getFailureMessage(second, params.uiLang) ||
      getFailureMessage(first, params.uiLang),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as FeasibilityRequestBody;

    const outputLanguage: UiLanguage = body.uiLang === 'ar' ? 'ar' : 'en';
    const query = normalizeText(body.query);
    const market = normalizeText(body.market);
    const customer = normalizeText(body.customer);
    const reportId = normalizeText(body.reportId) || null;
    const result = body.result;

    if (!query || !result) {
      return NextResponse.json(
        {
          ok: false,
          error:
            outputLanguage === 'ar'
              ? 'تعذر إنشاء دراسة الجدوى بسبب نقص البيانات.'
              : 'Unable to generate the feasibility study because required data is missing.',
        },
        { status: 400 }
      );
    }

    const preferredCurrency = detectPreferredCurrency({ query, market, customer });

    const { feasibility, compactFallbackUsed, localFallbackUsed, fallbackReason } =
      await generateStudyWithFallback({
        query,
        market,
        customer,
        uiLang: outputLanguage,
        preferredCurrency,
        result,
      });

    let persistedReportId: string | null = null;
    let persistenceError: string | null = null;

    if (reportId) {
      try {
        const updated = await updateReportResultInDb({
          id: reportId,
          result: {
            ...result,
            query,
            initialFeasibility: feasibility,
          },
        });

        persistedReportId = updated.id;
      } catch (error) {
        persistenceError =
          error instanceof Error
            ? error.message
            : outputLanguage === 'ar'
              ? 'تعذر حفظ الدراسة داخل التقرير الحالي.'
              : 'Unable to save the study into the current report.';
      }
    }

    return NextResponse.json({
      ok: true,
      feasibility,
      preferredCurrency,
      compactFallbackUsed,
      localFallbackUsed,
      fallbackReason: localFallbackUsed ? fallbackReason || null : null,
      persistedReportId,
      persistenceError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate the feasibility study right now.',
      },
      { status: 500 }
    );
  }
}
