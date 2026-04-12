import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SavedMadixoReport } from '@/lib/madixo-reports';
import {
  type ValidationPlan,
  type UiLanguage,
  normalizeUiLanguage,
  normalizeValidationPlan,
} from '@/lib/madixo-validation';
import {
  getUserValidationPlan,
  saveUserValidationPlan,
} from '@/lib/madixo-validation-db';
import { getUserEvidenceEntries } from '@/lib/madixo-evidence-db';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

const validationSchema = {
  name: 'madixo_validation_plan',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      validationFocus: { type: 'string' },
      targetSegment: { type: 'string' },
      valueProposition: { type: 'string' },
      outreachChannels: {
        type: 'array',
        items: { type: 'string' },
      },
      outreachScript: { type: 'string' },
      evidenceGoal: { type: 'string' },
      executionWindow: { type: 'string' },
      checklist: {
        type: 'array',
        items: { type: 'string' },
      },
      successSignals: {
        type: 'array',
        items: { type: 'string' },
      },
      continueSignals: {
        type: 'array',
        items: { type: 'string' },
      },
      pivotSignals: {
        type: 'array',
        items: { type: 'string' },
      },
      stopSignals: {
        type: 'array',
        items: { type: 'string' },
      },
      interviewQuestions: {
        type: 'array',
        items: { type: 'string' },
      },
      firstValidationTest: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          whyThisTest: { type: 'string' },
        },
        required: ['title', 'description', 'whyThisTest'],
      },
      firstOffer: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          pricingIdea: { type: 'string' },
        },
        required: ['title', 'description', 'pricingIdea'],
      },
    },
    required: [
      'validationFocus',
      'targetSegment',
      'valueProposition',
      'outreachChannels',
      'outreachScript',
      'evidenceGoal',
      'executionWindow',
      'checklist',
      'successSignals',
      'continueSignals',
      'pivotSignals',
      'stopSignals',
      'interviewQuestions',
      'firstValidationTest',
      'firstOffer',
    ],
  },
} as const;

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function buildInput(
  report: SavedMadixoReport,
  uiLang: UiLanguage,
  compact = false
) {
  const languageLine =
    uiLang === 'ar'
      ? 'اكتب الخطة بالعربية الفصحى البسيطة والمباشرة فقط، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. وإذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا.'
      : 'Write the plan in English only.';

  const brevityLine = compact
    ? uiLang === 'ar'
      ? 'اجعل كل قسم قصيرًا ومباشرًا، والقوائم مختصرة وغير مكررة.'
      : 'Keep every section short, direct, and non-repetitive.'
    : uiLang === 'ar'
      ? 'كن عمليًا وواضحًا ومحافظًا. استخدم لغة عربية فصحى بسيطة ومباشرة تناسب أي نوع مشروع. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو المبهمة أو المترجمة حرفيًا، وفضّل التعبير العملي اليومي على لغة التحليل الثقيلة.'
      : 'Be practical, clear, conservative, and suitable for any project type.';

  return `
${languageLine}
${brevityLine}

Create a practical validation workspace plan for this opportunity.

Report context:
- Business Idea: ${safeText(report.query, 'Untitled opportunity')}
- Target Market: ${safeText(
    report.market,
    uiLang === 'ar' ? 'غير محدد' : 'Not specified'
  )}
- Target Customer: ${safeText(
    report.customer,
    uiLang === 'ar' ? 'غير محدد' : 'Not specified'
  )}
- Opportunity Score: ${report.result.opportunityScore}/100
- Opportunity Label: ${safeText(
    report.result.opportunityLabel,
    uiLang === 'ar' ? 'فرصة متوسطة' : 'Moderate opportunity'
  )}
- Summary: ${safeText(report.result.summary, '')}
- Why This Opportunity: ${safeText(report.result.whyThisOpportunity, '')}
- Best First Customer: ${safeText(
    report.result.bestFirstCustomer.description,
    ''
  )}
- First Offer: ${safeText(report.result.firstOffer.description, '')}
- First Offer Price Idea: ${safeText(report.result.firstOffer.priceIdea, '')}
- Go-To-Market: ${safeText(report.result.goToMarket, '')}
- Risks: ${report.result.risks.join(' | ')}
- Pain Points: ${report.result.painPoints.join(' | ')}

Requirements:
- This plan must work for any project type: product, service, SaaS, local business, digital product, consulting, marketplace, brand, physical or non-physical.
- Do not assume the opportunity is a SaaS, store, or app unless the report clearly says so.
- Focus on evidence-first validation, not building.
- Give a short execution window that fits the idea. Do not force 7 days.
- Give a checklist with 3 to 6 actions only. Do not force a fixed number.
- Keep the actions small, practical, and realistic.
- Keep wording neutral and universal.
- The outreach script must be reusable and simple.
- Interview questions should work even if the project is not a software product.
- Continue, pivot, and stop signals must be realistic and conservative.
- Do not overpromise certainty. The goal is to collect clearer evidence, not to sound confident.
`;
}

type ValidationTimelinePayload = {
  planCreatedAt: string | null;
  planUpdatedAt: string | null;
  latestEvidenceAt: string | null;
  evidenceCount: number;
  evidenceSummaryUpdatedAt: string | null;
  nextMoveUpdatedAt: string | null;
};

function buildTimelinePayload(params: {
  createdAt?: string | null;
  updatedAt?: string | null;
  evidenceSummaryUpdatedAt?: string | null;
  nextMoveUpdatedAt?: string | null;
  evidenceEntries?: { createdAt: string }[];
}): ValidationTimelinePayload {
  const latestEvidenceAt = params.evidenceEntries?.[0]?.createdAt ?? null;

  return {
    planCreatedAt: params.createdAt ?? null,
    planUpdatedAt: params.updatedAt ?? null,
    latestEvidenceAt,
    evidenceCount: params.evidenceEntries?.length ?? 0,
    evidenceSummaryUpdatedAt: params.evidenceSummaryUpdatedAt ?? null,
    nextMoveUpdatedAt: params.nextMoveUpdatedAt ?? null,
  };
}

function validateReport(value: unknown): value is SavedMadixoReport {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.query === 'string' &&
    typeof obj.market === 'string' &&
    typeof obj.customer === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.result === 'object' &&
    obj.result !== null
  );
}

async function requestPlan(
  report: SavedMadixoReport,
  uiLang: UiLanguage,
  compact = false
): Promise<ValidationPlan> {
  const response = await client.responses.create({
    model: MODEL,
    instructions:
      uiLang === 'ar'
        ? 'أنت Madixo، نظام عملي يساعد المؤسس على اختبار أي مشروع بشكل واقعي ومحافظ. أخرج فقط JSON مطابقًا للمخطط. لا تبالغ في اليقين. لا تفترض نوع مشروع معين. لا تفرض 7 أيام أو 7 خطوات. اجعل المخرجات واضحة وبسيطة ومناسبة للمبتدئ والمتقدم. اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. لا تخلط العربية والإنجليزية داخل الجمل العادية. إذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا، ولا تستخدم الحروف اللاتينية إلا إذا كان الاسم أو الاختصار لا يُفهم عادة بدونها. إذا أمكن قول الفكرة بكلمتين بسيطتين بدل تعبير تحليلي ثقيل، فاختر الصياغة الأبسط. قبل إخراج الإجابة، راجع النص بصمت وبسّطه لغويًا إذا وجدت كلمة قد لا تكون واضحة لمعظم المستخدمين العرب.'
        : 'You are Madixo, a practical system that helps founders validate any type of project in a realistic, conservative way. Output only JSON matching the schema. Do not overstate certainty. Do not assume a specific project type. Do not force 7 days or 7 steps. Keep the output clear, simple, and commercially grounded.',
    input: buildInput(report, uiLang, compact),
    max_output_tokens: compact ? 5200 : 4200,
    truncation: 'disabled',
    text: {
      format: {
        type: 'json_schema',
        ...validationSchema,
      },
    },
  });

  if (response.status === 'failed') {
    throw new Error(
      response.error?.message ||
        'The model failed to build the validation plan.'
    );
  }

  const rawText =
    typeof response.output_text === 'string' ? response.output_text.trim() : '';

  if (!rawText) {
    throw new Error(
      response.status === 'incomplete'
        ? 'The validation plan was incomplete.'
        : 'The validation plan response was empty.'
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      response.status === 'incomplete'
        ? 'The validation plan was incomplete.'
        : 'The validation plan JSON could not be parsed.'
    );
  }

  const plan = normalizeValidationPlan(parsed, uiLang);

  if (!plan) {
    throw new Error('The validation plan could not be normalized.');
  }

  return plan;
}

function getBearerToken(request: Request) {
  const value = request.headers.get('authorization');
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function withAuthTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function getAuthenticatedUser(accessToken?: string | null) {
  const supabase = await createClient();

  if (accessToken) {
    try {
      const {
        data: { user },
        error,
      } = await withAuthTimeout(supabase.auth.getUser(accessToken), 6000, 'AUTH_TOKEN_TIMEOUT');

      if (error) {
        throw new Error(error.message);
      }

      if (user) {
        return user;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AUTH_TOKEN_TIMEOUT';

      if (message !== 'AUTH_TOKEN_TIMEOUT') {
        throw new Error(message);
      }
    }
  }

  const {
    data: { user },
    error,
  } = await withAuthTimeout(supabase.auth.getUser(), 6000, 'AUTH_COOKIE_TIMEOUT');

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      report?: unknown;
      uiLang?: unknown;
      forceRegenerate?: unknown;
    };

    if (!validateReport(body.report)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'A valid saved report is required.',
        },
        { status: 400 }
      );
    }

    const report = body.report;
    const uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const forceRegenerate = body.forceRegenerate === true;
    const accessToken = getBearerToken(request);

    const user = await getAuthenticatedUser(accessToken);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          code: 'AUTH_REQUIRED',
          error:
            uiLang === 'ar'
              ? 'يجب تسجيل الدخول أولًا لبدء مساحة التحقق.'
              : 'You need to sign in first to start the validation workspace.',
        },
        { status: 401 }
      );
    }

    if (!forceRegenerate) {
      try {
        const existing = await getUserValidationPlan(report.id, uiLang, accessToken);

        if (existing) {
          const evidenceEntries = await getUserEvidenceEntries(report.id, uiLang, accessToken);

          return NextResponse.json({
            ok: true,
            plan: existing.plan,
            workspace: existing.workspace,
            source: 'saved',
            timeline: buildTimelinePayload({
              createdAt: existing.createdAt,
              updatedAt: existing.updatedAt,
              evidenceSummaryUpdatedAt: existing.evidenceSummaryUpdatedAt,
              nextMoveUpdatedAt: existing.iterationEngineUpdatedAt,
              evidenceEntries,
            }),
          });
        }
      } catch (error) {
        if (!(error instanceof Error) || error.message !== 'AUTH_REQUIRED') {
          throw error;
        }
      }
    }

    let plan: ValidationPlan;

    try {
      plan = await requestPlan(report, uiLang, false);
    } catch (firstError) {
      try {
        plan = await requestPlan(report, uiLang, true);
      } catch (secondError) {
        const message =
          secondError instanceof Error
            ? secondError.message
            : firstError instanceof Error
              ? firstError.message
              : 'Failed to build validation plan.';

        return NextResponse.json(
          {
            ok: false,
            error:
              uiLang === 'ar'
                ? 'جار تجهيز مساحة التحقق. حاول مرة أخرى بعد لحظات.'
                : message,
          },
          { status: 502 }
        );
      }
    }

    try {
      const saved = await saveUserValidationPlan({
        reportId: report.id,
        uiLang,
        plan,
        accessToken,
      });

      return NextResponse.json({
        ok: true,
        plan: saved.plan,
        workspace: saved.workspace,
        source: 'generated',
        timeline: buildTimelinePayload({
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
          evidenceSummaryUpdatedAt: saved.evidenceSummaryUpdatedAt,
          nextMoveUpdatedAt: saved.iterationEngineUpdatedAt,
          evidenceEntries: [],
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        return NextResponse.json(
          {
            ok: false,
            code: 'AUTH_REQUIRED',
            error:
              uiLang === 'ar'
                ? 'يجب تسجيل الدخول لحفظ مساحة التحقق.'
                : 'You must be logged in to save the validation workspace.',
          },
          { status: 401 }
        );
      }

      throw error;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to build validation plan.';

    return NextResponse.json(
      {
        ok: false,
        error:
          message === 'Auth session missing!'
            ? 'جار تجهيز مساحة التحقق. حاول مرة أخرى بعد لحظات.'
            : message,
      },
      { status: 500 }
    );
  }
}
