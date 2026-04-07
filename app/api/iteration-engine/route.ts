import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getUserReportsByIds } from '@/lib/madixo-db';
import { getUserEvidenceEntries } from '@/lib/madixo-evidence-db';
import {
  buildFallbackIterationEngine,
  buildIterationEngineInput,
  iterationEngineSchema,
  normalizeIterationEngineOutput,
} from '@/lib/madixo-iteration-engine';
import {
  type IterationEngineOutput,
  type UiLanguage,
  type ValidationDecisionState,
  normalizeUiLanguage,
  isValidationDecisionState,
} from '@/lib/madixo-validation';
import {
  getUserValidationPlan,
  saveUserIterationEngine,
} from '@/lib/madixo-validation-db';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';


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

function getLocalizedError(
  key:
    | 'missingReportId'
    | 'reportNotFound'
    | 'emptyEvidence'
    | 'emptySummary',
  uiLang: UiLanguage
) {
  const messages = {
    missingReportId:
      uiLang === 'ar' ? 'معرّف التقرير مطلوب.' : 'A report ID is required.',
    reportNotFound:
      uiLang === 'ar'
        ? 'تعذر العثور على هذا التقرير.'
        : 'This report could not be found.',
    emptyEvidence:
      uiLang === 'ar'
        ? 'أضف بعض ملاحظات السوق أولًا قبل إنشاء أفضل خطوة الآن.'
        : 'Add some market notes first before generating the best step now.',
    emptySummary:
      uiLang === 'ar'
        ? 'أنشئ رؤية القرار أولًا قبل إنشاء أفضل خطوة الآن.'
        : 'Generate the decision view first before generating the best step now.',
  } as const;

  return messages[key];
}

function getInstructions(uiLang: UiLanguage, secondPass = false) {
  if (uiLang === 'ar') {
    return secondPass
      ? 'أنت Madixo. المحاولة السابقة كانت عامة أو ناقصة. هذه المرة أخرج JSON عمليًا جدًا ومحددًا، مع تفاصيل قابلة للتنفيذ خلال أيام قليلة. لا تترك أي حقل فارغًا، ولا تكتب كلامًا عامًا. اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. لا تخلط العربية والإنجليزية داخل الجمل العادية. إذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا، ولا تستخدم الحروف اللاتينية إلا إذا كان الاسم أو الاختصار لا يُفهم عادة بدونها. إذا أمكن قول الفكرة بكلمتين بسيطتين بدل تعبير تحليلي ثقيل، فاختر الصياغة الأبسط. قبل إخراج الإجابة، راجع النص بصمت وبسّطه لغويًا إذا وجدت كلمة قد لا تكون واضحة لمعظم المستخدمين العرب.'
      : 'أنت Madixo، مستشار عملي يحول ملاحظات السوق ورؤية القرار إلى أفضل خطوة عملية الآن. اعتمد فقط على التقرير والخطة الحالية ورؤية القرار والملاحظات الحالية. لا تكرر الخطة القديمة حرفيًا، بل اقترح التعديل العملي التالي. اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. لا تخلط العربية والإنجليزية داخل الجمل العادية. إذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا، ولا تستخدم الحروف اللاتينية إلا إذا كان الاسم أو الاختصار لا يُفهم عادة بدونها. إذا أمكن قول الفكرة بكلمتين بسيطتين بدل تعبير تحليلي ثقيل، فاختر الصياغة الأبسط. قبل إخراج الإجابة، راجع النص بصمت وبسّطه لغويًا إذا وجدت كلمة قد لا تكون واضحة لمعظم المستخدمين العرب. أخرج JSON فقط مطابقًا للمخطط المطلوب وبدون markdown أو code fences.';
  }

  return secondPass
    ? 'You are Madixo. The previous attempt was too generic or incomplete. This time return a highly practical JSON with specific execution details for the next few days. Do not leave any field empty, and avoid vague advice.'
    : 'You are Madixo, a practical advisor that turns the current report, saved market notes, and the decision view into the best practical step now. Use only the current report, current plan, saved decision view, and saved notes. Do not repeat the old plan verbatim; propose the next practical step. Output only JSON matching the requested schema, with no markdown or code fences.';
}

function extractTextFromOutputItem(item: unknown): string[] {
  if (!isRecord(item)) return [];

  const content = getRecordArray(item.content);
  if (content.length) {
    return content.flatMap((part) => {
      const text = getTrimmedString(part.text);
      if (text) return [text];

      const outputText = getTrimmedString(part.output_text);
      if (outputText) return [outputText];

      const value = getTrimmedString(part.value);
      if (value) return [value];

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
    if (collected.length) return collected.join('\n').trim();
  }

  return '';
}

function stripMarkdownCodeFence(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function extractJsonCandidate(value: string) {
  const stripped = stripMarkdownCodeFence(value);
  if (!stripped) return '';

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1).trim();
  }

  return stripped;
}

function extractStructuredOutput(response: unknown): IterationEngineOutput | null {
  if (!isRecord(response)) {
    return null;
  }

  const normalizedDirect = normalizeIterationEngineOutput(response.output_parsed);
  if (normalizedDirect) return normalizedDirect;

  for (const item of getRecordArray(response.output)) {
    const normalizedItem = normalizeIterationEngineOutput(item.parsed);
    if (normalizedItem) return normalizedItem;

    for (const part of getRecordArray(item.content)) {
      const normalizedPart = normalizeIterationEngineOutput(part.parsed);
      if (normalizedPart) return normalizedPart;
    }
  }

  return null;
}

function isStrongEnough(value: IterationEngineOutput | null) {
  if (!value) return false;
  if (value.whyNow.trim().length < 70) return false;
  if (value.whatToChange.length < 2) return false;
  if (value.nextExperiment.trim().length < 45) return false;
  if (value.updatedOffer.trim().length < 30) return false;
  if (value.updatedOutreach.trim().length < 30) return false;
  if (value.successCriteria.length < 3) return false;
  return true;
}

async function callModel(params: {
  uiLang: UiLanguage;
  prompt: string;
  secondPass?: boolean;
}): Promise<IterationEngineOutput | null> {
  const { uiLang, prompt, secondPass = false } = params;

  const response = await client.responses.create({
    model: MODEL,
    instructions: getInstructions(uiLang, secondPass),
    input: prompt,
    max_output_tokens: 2600,
    truncation: 'disabled',
    text: {
      format: {
        type: 'json_schema',
        ...iterationEngineSchema,
      },
    },
  });

  if (response.status === 'failed') {
    throw new Error(
      response.error?.message ||
        (uiLang === 'ar'
          ? 'فشل النموذج في إنشاء الخطوة التالية.'
          : 'The model failed to generate the best step now.')
    );
  }

  const direct = extractStructuredOutput(response);
  if (direct) return direct;

  const rawText = getRawResponseText(response);
  const jsonCandidate = extractJsonCandidate(rawText);

  if (!jsonCandidate) return null;

  try {
    const parsed = JSON.parse(jsonCandidate);
    return normalizeIterationEngineOutput(parsed);
  } catch {
    return null;
  }
}

async function readSavedIteration(reportId: string, uiLang: UiLanguage) {
  const savedPlan = await getUserValidationPlan(reportId, uiLang);
  if (!savedPlan) return null;
  return {
    iterationEngine: savedPlan.iterationEngine,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uiLang = normalizeUiLanguage(searchParams.get('uiLang'), 'en');
    const reportId = searchParams.get('reportId')?.trim() || '';

    if (!reportId) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('missingReportId', uiLang) },
        { status: 400 }
      );
    }

    const saved = await readSavedIteration(reportId, uiLang);
    return NextResponse.json({
      ok: true,
      iterationEngine: saved?.iterationEngine || null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load the best step now.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reportId?: unknown;
      uiLang?: unknown;
      currentDecision?: unknown;
    };

    const uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const reportId = typeof body.reportId === 'string' ? body.reportId.trim() : '';

    if (!reportId) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('missingReportId', uiLang) },
        { status: 400 }
      );
    }

    const [report] = await getUserReportsByIds([reportId]);

    if (!report) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('reportNotFound', uiLang) },
        { status: 404 }
      );
    }

    const currentDecision: ValidationDecisionState | undefined =
      isValidationDecisionState(body.currentDecision) ? body.currentDecision : undefined;

    const [plan, evidenceEntries] = await Promise.all([
      getUserValidationPlan(reportId, uiLang),
      getUserEvidenceEntries(reportId, uiLang),
    ]);

    if (!evidenceEntries.length) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('emptyEvidence', uiLang) },
        { status: 400 }
      );
    }

    if (!plan?.evidenceSummary) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('emptySummary', uiLang) },
        { status: 400 }
      );
    }

    const prompt = buildIterationEngineInput({
      report,
      uiLang,
      plan,
      evidenceEntries,
      evidenceSummary: plan.evidenceSummary,
      currentDecision,
    });

    let iterationEngine = await callModel({ uiLang, prompt, secondPass: false });

    if (!isStrongEnough(iterationEngine)) {
      iterationEngine = await callModel({ uiLang, prompt, secondPass: true });
    }

    let finalIterationEngine: IterationEngineOutput;
    let source: 'model' | 'fallback';

    if (iterationEngine && isStrongEnough(iterationEngine)) {
      finalIterationEngine = iterationEngine;
      source = 'model';
    } else {
      finalIterationEngine = buildFallbackIterationEngine({
        report,
        uiLang,
        plan,
        evidenceEntries,
        evidenceSummary: plan.evidenceSummary,
        currentDecision,
      });
      source = 'fallback';
    }

    const savedPlan = await saveUserIterationEngine({
      reportId,
      uiLang,
      iterationEngine: finalIterationEngine,
    });

    return NextResponse.json({
      ok: true,
      iterationEngine: savedPlan.iterationEngine,
      savedAt: savedPlan.iterationEngineUpdatedAt,
      source,
    });
  } catch (error) {
    console.error('ITERATION_ENGINE_POST_FAILED', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate the best step now.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
