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
  getUserValidationPlanForUserId,
  saveUserValidationPlanForUserId,
} from '@/lib/madixo-validation-db';
import { getUserEvidenceEntriesForUserId } from '@/lib/madixo-evidence-db';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';
const INITIAL_MODEL_TIMEOUT_MS = 10000;
const REFRESH_MODEL_TIMEOUT_MS = 18000;
const SECONDARY_MODEL_TIMEOUT_MS = 12000;

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

function compactText(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function uniqueItems(items: string[], maxItems: number, maxLength: number) {
  return Array.from(
    new Set(
      items
        .map((item) => compactText(item, maxLength))
        .filter((item) => item.length > 0)
    )
  ).slice(0, maxItems);
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
      ? 'اجعل كل قسم قصيرًا جدًا ومباشرًا، والقوائم مختصرة وغير مكررة.'
      : 'Keep every section very short, direct, and non-repetitive.'
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
- Next Steps: ${report.result.nextSteps.join(' | ')}

Requirements:
- This plan must work for any project type: product, service, SaaS, local business, digital product, consulting, marketplace, brand, physical or non-physical.
- Do not assume the opportunity is a SaaS, store, or app unless the report clearly says so.
- Focus on evidence-first validation, not building.
- Give a short execution window that fits the idea. Do not force 7 days.
- Give a checklist with 3 to 5 actions only. Do not force a fixed number.
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

function buildStarterValidationPlan(
  report: SavedMadixoReport,
  uiLang: UiLanguage
): ValidationPlan {
  const query = safeText(
    report.query,
    uiLang === 'ar' ? 'هذه الفرصة' : 'this opportunity'
  );
  const market = safeText(
    report.market,
    uiLang === 'ar' ? 'السوق الحالي' : 'the current market'
  );
  const customer = safeText(
    report.customer,
    safeText(
      report.result.bestFirstCustomer.description,
      uiLang === 'ar' ? 'أول شريحة مناسبة' : 'the first workable segment'
    )
  );
  const value = safeText(
    report.result.firstOffer.description,
    safeText(
      report.result.summary,
      uiLang === 'ar' ? 'قيمة مبدئية تحتاج تحققًا' : 'An early value proposition that still needs validation.'
    )
  );
  const priceIdea = safeText(
    report.result.firstOffer.priceIdea,
    uiLang === 'ar'
      ? 'اختبر مستوى الالتزام المناسب في هذا النوع من المشاريع.'
      : 'Test the right commitment level for this type of project.'
  );

  const nextSteps = uniqueItems(report.result.nextSteps || [], 4, 110);
  const painPoints = uniqueItems(report.result.painPoints || [], 3, 110);
  const risks = uniqueItems(report.result.risks || [], 3, 110);

  const checklist =
    uiLang === 'ar'
      ? uniqueItems(
          [
            nextSteps[0] || `حدّد 5 إلى 10 أشخاص من ${customer} داخل ${market} يمكن الوصول لهم هذا الأسبوع.`,
            `تواصل مع عدد صغير برسالة قصيرة لفهم المشكلة الحالية حول: ${compactText(query, 90)}.`,
            `اسألهم عن الوضع الحالي، درجة الإلحاح، وكيف يحلون المشكلة الآن.`,
            `سجّل الأنماط المتكررة: ألم واضح، رغبة حقيقية، واعتراضات متكررة.`,
            nextSteps[1] || `اختبر عرضًا أوليًا بسيطًا قبل أي بناء كامل.`,
          ],
          5,
          120
        )
      : uniqueItems(
          [
            nextSteps[0] || `List 5 to 10 reachable people from ${customer} in ${market} this week.`,
            `Send a short message to learn how they handle the current problem around ${compactText(query, 90)}.`,
            'Ask about the current workflow, urgency, and what they do today instead.',
            'Record repeated patterns: clear pain, real interest, and recurring objections.',
            nextSteps[1] || 'Test a simple first offer before building anything bigger.',
          ],
          5,
          120
        );

  const continueSignals =
    uiLang === 'ar'
      ? uniqueItems(
          [
            'وجود تفاعل حقيقي وسريع من الشريحة المستهدفة.',
            painPoints[0]
              ? `تكرار مشكلة واضحة مثل: ${painPoints[0]}`
              : 'تكرار نفس المشكلة أو الحاجة من أكثر من شخص.',
            'قبول خطوة عملية لاحقة مثل مكالمة، تجربة، أو طلب عرض.',
          ],
          4,
          95
        )
      : uniqueItems(
          [
            'The target segment responds with real interest.',
            painPoints[0]
              ? `A clear repeated pain shows up, such as: ${painPoints[0]}`
              : 'The same pain or need appears more than once.',
            'People accept a concrete next step such as a call, pilot, or offer review.',
          ],
          4,
          95
        );

  const pivotSignals =
    uiLang === 'ar'
      ? uniqueItems(
          [
            'يوجد اهتمام بالمشكلة لكن الرسالة أو العرض الحالي غير واضح.',
            'الاستجابة تأتي من شريحة مختلفة عن الشريحة التي بدأنا بها.',
            risks[0]
              ? `ظهر اعتراض متكرر مثل: ${risks[0]}`
              : 'ظهر اعتراض متكرر يحتاج تعديلًا في العرض أو الشريحة.',
          ],
          4,
          95
        )
      : uniqueItems(
          [
            'The problem feels relevant, but the current message or offer is not landing clearly.',
            'Interest comes from a different segment than the starting segment.',
            risks[0]
              ? `A recurring objection appears, such as: ${risks[0]}`
              : 'A recurring objection suggests the offer or segment should change.',
          ],
          4,
          95
        );

  const stopSignals =
    uiLang === 'ar'
      ? uniqueItems(
          [
            'لا يظهر ألم حقيقي أو إلحاح كافٍ بعد عدة محاولات قصيرة.',
            'لا يقبل أحد خطوة تالية واضحة حتى بعد تحسين الرسالة.',
            'تكلفة الوصول أو الإقناع تبدو أعلى من فرصة البداية الحالية.',
          ],
          4,
          95
        )
      : uniqueItems(
          [
            'No real pain or urgency appears after several short attempts.',
            'Nobody accepts a clear next step even after improving the message.',
            'The cost of reaching or convincing the segment looks too high for an initial wedge.',
          ],
          4,
          95
        );

  const interviewQuestions =
    uiLang === 'ar'
      ? uniqueItems(
          [
            `كيف تتعامل اليوم مع المشكلة المرتبطة بـ ${compactText(query, 80)}؟`,
            'ما أكثر شيء يزعجك في الوضع الحالي؟',
            'متى تصبح هذه المشكلة مستعجلة فعلًا؟',
            'ما الذي يجعلك تجرب حلًا جديدًا أو تدفع له؟',
          ],
          6,
          110
        )
      : uniqueItems(
          [
            `How do you handle the problem around ${compactText(query, 80)} today?`,
            'What is the most frustrating part of the current approach?',
            'When does this problem become urgent enough to act on?',
            'What would make you try or pay for a new solution?',
          ],
          6,
          110
        );

  const outreachChannels =
    uiLang === 'ar'
      ? uniqueItems(
          ['رسائل مباشرة', 'مكالمات قصيرة', 'شبكتك الحالية أو إحالات'],
          6,
          70
        )
      : uniqueItems(
          ['Direct messages', 'Short calls', 'Your existing network or referrals'],
          6,
          70
        );

  const outreachScript =
    uiLang === 'ar'
      ? `مرحبًا، أعمل حاليًا على فهم أفضل لطريقة تعامل ${customer} مع موضوع ${compactText(
          query,
          70
        )}. أبحث فقط عن فهم الواقع الحالي وليس البيع الآن. هل يمكنني أخذ 10 دقائق لمعرفة كيف تتعاملون معه اليوم وما الذي يزعجكم فيه؟`
      : `Hi, I am currently learning how ${customer} deals with ${compactText(
          query,
          70
        )}. I am not selling right now. I only want to understand the current workflow and what is still painful. Would you be open to a short 10-minute conversation?`;

  const evidenceGoal =
    uiLang === 'ar'
      ? 'تجميع دليل واضح على وجود ألم حقيقي، إلحاح كافٍ، واستعداد لخطوة تالية عملية.'
      : 'Collect clear evidence of real pain, enough urgency, and willingness to take a concrete next step.';

  const executionWindow = uiLang === 'ar' ? '3 إلى 5 أيام' : '3 to 5 days';

  const firstValidationTest =
    uiLang === 'ar'
      ? {
          title: 'اختبار محادثات السوق الأولى',
          description:
            checklist[0] || 'ابدأ بعدد صغير من المحادثات الحقيقية مع الشريحة الأولى.',
          whyThisTest: evidenceGoal,
        }
      : {
          title: 'First market conversations test',
          description:
            checklist[0] || 'Start with a small number of real conversations with the first segment.',
          whyThisTest: evidenceGoal,
        };

  const firstOffer = {
    title: safeText(
      report.result.firstOffer.title,
      uiLang === 'ar' ? 'العرض الأول' : 'First offer'
    ),
    description: value,
    pricingIdea: priceIdea,
  };

  return {
    validationFocus:
      uiLang === 'ar'
        ? `هل لدى ${customer} داخل ${market} مشكلة واضحة تستحق التحرك حول ${compactText(query, 90)}؟`
        : `Does ${customer} in ${market} have a clear enough problem worth acting on around ${compactText(query, 90)}?`,
    targetSegment: customer,
    valueProposition: value,
    outreachChannels,
    outreachScript,
    evidenceGoal,
    executionWindow,
    checklist,
    successSignals: continueSignals,
    continueSignals,
    pivotSignals,
    stopSignals,
    validationThesis:
      uiLang === 'ar'
        ? `اختبر ما إذا كانت هذه الفرصة تستحق خطوة أقوى قبل البناء الكامل.`
        : 'Test whether this opportunity deserves a stronger next step before full execution.',
    idealFirstCustomer: customer,
    interviewQuestions,
    firstValidationTest,
    firstOffer,
    checklist7Day: checklist,
  };
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
    max_output_tokens: compact ? 700 : 1100,
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

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
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
      } = await withTimeout(
        supabase.auth.getUser(accessToken),
        6000,
        'AUTH_TOKEN_TIMEOUT'
      );

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
  } = await withTimeout(supabase.auth.getUser(), 6000, 'AUTH_COOKIE_TIMEOUT');

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

async function buildPlanWithFastFallback(params: {
  report: SavedMadixoReport;
  uiLang: UiLanguage;
  forceRegenerate: boolean;
}): Promise<{ plan: ValidationPlan; generationMode: 'model' | 'fallback' }> {
  const { report, uiLang, forceRegenerate } = params;

  try {
    if (forceRegenerate) {
      const primary = await withTimeout(
        requestPlan(report, uiLang, false),
        REFRESH_MODEL_TIMEOUT_MS,
        'VALIDATION_PRIMARY_TIMEOUT'
      );
      return { plan: primary, generationMode: 'model' };
    }

    const compact = await withTimeout(
      requestPlan(report, uiLang, true),
      INITIAL_MODEL_TIMEOUT_MS,
      'VALIDATION_COMPACT_TIMEOUT'
    );
    return { plan: compact, generationMode: 'model' };
  } catch {
    try {
      const secondary = await withTimeout(
        requestPlan(report, uiLang, !forceRegenerate),
        SECONDARY_MODEL_TIMEOUT_MS,
        'VALIDATION_SECONDARY_TIMEOUT'
      );
      return { plan: secondary, generationMode: 'model' };
    } catch {
      return {
        plan: buildStarterValidationPlan(report, uiLang),
        generationMode: 'fallback',
      };
    }
  }
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

    let existing = null;

    try {
      existing = await getUserValidationPlanForUserId({
        userId: user.id,
        reportId: report.id,
        uiLang,
      });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'AUTH_REQUIRED') {
        throw error;
      }
    }

    if (!forceRegenerate && existing) {
      const evidenceEntries = await getUserEvidenceEntriesForUserId({
        userId: user.id,
        reportId: report.id,
        uiLang,
      });

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

    const { plan, generationMode } = await buildPlanWithFastFallback({
      report,
      uiLang,
      forceRegenerate,
    });

    if (forceRegenerate && generationMode === 'fallback' && existing) {
      const evidenceEntries = await getUserEvidenceEntriesForUserId({
        userId: user.id,
        reportId: report.id,
        uiLang,
      });

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

    const saved = await saveUserValidationPlanForUserId({
      userId: user.id,
      reportId: report.id,
      uiLang,
      plan,
    });

    return NextResponse.json({
      ok: true,
      plan: saved.plan,
      workspace: saved.workspace,
      source: generationMode === 'fallback' ? 'generated' : 'generated',
      meta: {
        generationMode,
      },
      timeline: buildTimelinePayload({
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        evidenceSummaryUpdatedAt: saved.evidenceSummaryUpdatedAt,
        nextMoveUpdatedAt: saved.iterationEngineUpdatedAt,
        evidenceEntries: [],
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to build validation plan.';

    return NextResponse.json(
      {
        ok: false,
        error:
          message === 'Auth session missing!' ||
          message === 'AUTH_TOKEN_TIMEOUT' ||
          message === 'AUTH_COOKIE_TIMEOUT'
            ? 'جار تجهيز مساحة التحقق. حاول مرة أخرى بعد لحظات.'
            : message,
      },
      { status: 500 }
    );
  }
}
