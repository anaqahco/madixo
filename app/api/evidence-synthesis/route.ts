import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getUserReportsByIds } from '@/lib/madixo-db';
import { getUserEvidenceEntries } from '@/lib/madixo-evidence-db';
import {
  buildEvidenceSynthesisInput,
  evidenceSynthesisSchema,
} from '@/lib/madixo-evidence-synthesis';
import {
  type EvidenceSynthesis,
  type UiLanguage,
  type ValidationDecisionState,
  type ValidationEvidenceEntry,
  normalizeEvidenceSynthesis,
  normalizeUiLanguage,
  isValidationDecisionState,
} from '@/lib/madixo-validation';
import {
  getUserValidationPlan,
  saveUserEvidenceSynthesis,
} from '@/lib/madixo-validation-db';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-5';

function getLocalizedError(
  key: 'missingReportId' | 'reportNotFound' | 'emptyEvidence',
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
        ? 'أضف بعض ملاحظات السوق أولًا قبل إنشاء الخلاصة.'
        : 'Add some market notes first before generating the synthesis.',
  } as const;

  return messages[key];
}

function getSynthesisInstructions(uiLang: UiLanguage, secondPass = false) {
  if (uiLang === 'ar') {
    return secondPass
      ? 'أنت Madixo. المحاولة السابقة كانت ناقصة أو عامة. هذه المرة أخرج JSON واضحًا ومحددًا ومكتملًا. اعتمد فقط على ملاحظات السوق الحالية، ولا تخترع اعتراضات أو رغبات أو طلبًا غير موجود. اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. لا تترك الحقول المهمة فارغة، واجعل reasoning و nextBestStep عمليين وقصيرين. أخرج JSON فقط مطابقًا للمخطط المطلوب وبدون markdown أو code fences.'
      : 'أنت Madixo، نظام واقعي ومحافظ يحوّل ملاحظات السوق إلى فهم أوضح وقرار أهدأ. اعتمد فقط على الملاحظات الحالية، ولا تخترع اعتراضات أو رغبات أو طلبًا غير موجود. اكتب بالعربية الفصحى البسيطة والمباشرة، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اختر الكلمات الأكثر شيوعًا ووضوحًا، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا من الإنجليزية. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. لا تخلط العربية والإنجليزية داخل الجمل العادية. إذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا، ولا تستخدم الحروف اللاتينية إلا إذا كان الاسم أو الاختصار لا يُفهم عادة بدونها. إذا أمكن قول الفكرة بكلمتين بسيطتين بدل تعبير تحليلي ثقيل، فاختر الصياغة الأبسط. قبل إخراج الإجابة، راجع النص بصمت وبسّطه لغويًا إذا وجدت كلمة قد لا تكون واضحة لمعظم المستخدمين العرب. أخرج JSON فقط مطابقًا للمخطط المطلوب وبدون أي شرح إضافي.';
  }

  return secondPass
    ? 'You are Madixo. The previous attempt was incomplete or too generic. This time return a complete, specific JSON. Use only the current market notes. Do not invent objections, desires, or demand. Keep the reasoning practical and concise. Output only JSON matching the schema, with no markdown or code fences.'
    : 'You are Madixo, a realistic and conservative system that turns market notes into clearer understanding and calmer decisions. Use only the current notes. Do not invent objections, desires, or demand. Output only JSON that matches the schema, with no extra explanation.';
}


function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function extractParsedFromPart(part: unknown): unknown | null {
  const partRecord = asRecord(part);
  if (!partRecord) return null;

  if (partRecord.parsed && typeof partRecord.parsed === 'object') {
    return partRecord.parsed;
  }

  if (partRecord.json && typeof partRecord.json === 'object') {
    return partRecord.json;
  }

  if (partRecord.arguments && typeof partRecord.arguments === 'object') {
    return partRecord.arguments;
  }

  return null;
}

function extractParsedFromItem(item: unknown): unknown | null {
  const itemRecord = asRecord(item);
  if (!itemRecord) return null;

  if (itemRecord.parsed && typeof itemRecord.parsed === 'object') {
    return itemRecord.parsed;
  }

  if (Array.isArray(itemRecord.content)) {
    for (const part of itemRecord.content) {
      const parsed = extractParsedFromPart(part);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function extractStructuredOutput(
  response: unknown,
  uiLang: UiLanguage
): EvidenceSynthesis | null {
  const responseRecord = asRecord(response);
  const directParsed = responseRecord?.output_parsed;
  const normalizedDirect = normalizeEvidenceSynthesis(directParsed, uiLang);
  if (normalizedDirect) {
    return normalizedDirect;
  }

  if (Array.isArray(responseRecord?.output)) {
    for (const item of responseRecord.output) {
      const parsed = extractParsedFromItem(item);
      const normalized = normalizeEvidenceSynthesis(parsed, uiLang);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function extractTextFromOutputItem(item: unknown): string[] {
  const itemRecord = asRecord(item);
  if (!itemRecord) {
    return [];
  }

  if (Array.isArray(itemRecord.content)) {
    return itemRecord.content.flatMap((part) => {
      const partRecord = asRecord(part);
      if (!partRecord) return [];

      if (typeof partRecord.text === 'string' && partRecord.text.trim()) {
        return [partRecord.text.trim()];
      }

      if (typeof partRecord.output_text === 'string' && partRecord.output_text.trim()) {
        return [partRecord.output_text.trim()];
      }

      if (typeof partRecord.value === 'string' && partRecord.value.trim()) {
        return [partRecord.value.trim()];
      }

      return [];
    });
  }

  if (typeof itemRecord.text === 'string' && itemRecord.text.trim()) {
    return [itemRecord.text.trim()];
  }

  return [];
}

function getRawResponseText(response: unknown): string {
  const responseRecord = asRecord(response);

  if (typeof responseRecord?.output_text === 'string' && responseRecord.output_text.trim()) {
    return responseRecord.output_text.trim();
  }

  if (Array.isArray(responseRecord?.output)) {
    const collected = responseRecord.output.flatMap((item) =>
      extractTextFromOutputItem(item)
    );

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

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
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

function isStrongEnough(synthesis: EvidenceSynthesis | null) {
  if (!synthesis) return false;
  if (synthesis.reasoning.trim().length < 24) return false;
  if (synthesis.nextBestStep.goal.trim().length < 12) return false;
  if (synthesis.nextBestStep.whyNow.trim().length < 12) return false;
  if (synthesis.nextBestStep.actions.length < 1) return false;
  if (
    synthesis.validatedLearnings.length === 0 &&
    synthesis.strongestSignals.length === 0
  ) {
    return false;
  }
  return true;
}

function getDirectionFromEvidence(
  entries: ValidationEvidenceEntry[],
  currentDecision?: ValidationDecisionState
): EvidenceSynthesis['recommendedDirection'] {
  const strongCount = entries.filter((entry) => entry.signalStrength === 'strong').length;
  const weakCount = entries.filter((entry) => entry.signalStrength === 'weak').length;

  if (weakCount >= 3 && weakCount > strongCount + 1) {
    return 'pivot';
  }

  if (
    currentDecision === 'continue' ||
    currentDecision === 'pivot' ||
    currentDecision === 'stop'
  ) {
    return currentDecision;
  }

  return 'continue';
}

function buildFallbackSynthesis(params: {
  uiLang: UiLanguage;
  report: Awaited<ReturnType<typeof getUserReportsByIds>>[number];
  entries: ValidationEvidenceEntry[];
  currentDecision?: ValidationDecisionState;
}): EvidenceSynthesis {
  const { uiLang, report, entries, currentDecision } = params;

  const topEntries = entries.slice(0, 4);
  const strongestSignals = topEntries.map((entry) => entry.title.trim()).filter(Boolean);

  const validatedLearnings =
    topEntries
      .filter((entry) => entry.signalStrength !== 'weak')
      .slice(0, 3)
      .map((entry) => entry.content.trim())
      .filter(Boolean) || [];

  const openQuestions =
    uiLang === 'ar'
      ? [
          'هل هذا النمط يتكرر مع أكثر من عميل محتمل؟',
          'هل الاستعداد للدفع واضح أم ما زال غير مؤكد؟',
          'ما الرسالة أو العرض الذي يعطي استجابة أفضل في الخطوة التالية؟',
        ]
      : [
          'Is this pattern repeated across more than one potential customer?',
          'Is willingness to pay clear, or still uncertain?',
          'Which message or offer performs better in the next step?',
        ];

  const recommendedDirection = getDirectionFromEvidence(entries, currentDecision);
  const confidence =
    entries.length >= 8 ? 'medium' : entries.length >= 3 ? 'low' : 'low';

  const actions =
    uiLang === 'ar'
      ? [
          'نفّذ خطوة صغيرة جديدة مع رسالة أو عرض أوضح.',
          'سجّل ردود السوق الجديدة في ملاحظات السوق.',
          'أعد بناء رؤية القرار بعد ظهور نمط متكرر أو أوضح.',
        ]
      : [
          'Run one more small test with a clearer message or offer.',
          'Record the new market responses in market notes.',
          'Rebuild the decision view after a clearer repeated pattern appears.',
        ];

  const reasoning =
    uiLang === 'ar'
      ? `تم إنشاء هذه الرؤية من ${entries.length} ملاحظات سوق محفوظة. توجد إشارات أولية مفيدة، لكن ما زلنا بحاجة إلى تكرار أوضح قبل قرار أكبر.`
      : `This view was created from ${entries.length} saved market notes. There are useful early signals, but a clearer repeated pattern is still needed before a bigger decision.`;

  return {
    validatedLearnings:
      validatedLearnings.length > 0
        ? validatedLearnings
        : uiLang === 'ar'
          ? ['ظهرت إشارات أولية من السوق تستحق خطوة تحقق إضافية.']
          : ['Early market signals suggest this deserves another validation step.'],
    openQuestions,
    strongestSignals:
      strongestSignals.length > 0
        ? strongestSignals
        : uiLang === 'ar'
          ? ['لا تزال الإشارات الحالية محدودة وتحتاج إلى تكرار أوضح.']
          : ['The current signals are still limited and need clearer repetition.'],
    recommendedDirection,
    reasoning,
    confidence,
    nextBestStep: {
      title: uiLang === 'ar' ? 'الخطوة التالية المقترحة' : 'Recommended next step',
      goal:
        uiLang === 'ar'
          ? `تقليل أكبر مجهول حالي قبل قرار أكبر حول فكرة: ${report?.query || 'الفرصة الحالية'}.`
          : `Reduce the biggest unknown before making a bigger decision about: ${report?.query || 'the current opportunity'}.`,
      whyNow:
        uiLang === 'ar'
          ? 'لأن الملاحظات الحالية مفيدة، لكنها ما زالت تحتاج إلى نمط أوضح ومتكرر.'
          : 'Because the current notes are useful, but still need a clearer repeated pattern.',
      actions,
      successSignal:
        uiLang === 'ar'
          ? 'ظهور رد متكرر وواضح من السوق يمكن ملاحظته في أكثر من ملاحظة جديدة.'
          : 'A clear repeated market response visible across more than one new note.',
      executionWindow: uiLang === 'ar' ? '3–5 أيام' : '3–5 days',
    },
    topObjections: [],
    topDesires: [],
  };
}

async function callModel(params: {
  uiLang: UiLanguage;
  prompt: string;
  secondPass?: boolean;
}): Promise<EvidenceSynthesis | null> {
  const { uiLang, prompt, secondPass = false } = params;

  const response = await client.responses.create({
    model: MODEL,
    instructions: getSynthesisInstructions(uiLang, secondPass),
    input: prompt,
    max_output_tokens: 2600,
    truncation: 'disabled',
    text: {
      format: {
        type: 'json_schema',
        ...evidenceSynthesisSchema,
      },
    },
  });

  if (response.status === 'failed') {
    throw new Error(
      response.error?.message ||
        (uiLang === 'ar'
          ? 'فشل النموذج في إنشاء الخلاصة.'
          : 'The model failed to generate the synthesis.')
    );
  }

  const direct = extractStructuredOutput(response, uiLang);
  if (direct) {
    return direct;
  }

  const rawText = getRawResponseText(response);
  const jsonCandidate = extractJsonCandidate(rawText);

  if (!jsonCandidate) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonCandidate);
    return normalizeEvidenceSynthesis(parsed, uiLang);
  } catch {
    return null;
  }
}

async function readSavedSynthesis(reportId: string, uiLang: UiLanguage) {
  const savedPlan = await getUserValidationPlan(reportId, uiLang);

  if (!savedPlan) {
    return null;
  }

  return savedPlan.evidenceSummary;
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

    const synthesis = await readSavedSynthesis(reportId, uiLang);

    return NextResponse.json({
      ok: true,
      synthesis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load the synthesis.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        {
          ok: false,
          error: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
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

    const prompt = buildEvidenceSynthesisInput({
      report,
      uiLang,
      plan,
      evidenceEntries,
      currentDecision,
    });

    let synthesis = await callModel({
      uiLang,
      prompt,
      secondPass: false,
    });

    if (!isStrongEnough(synthesis)) {
      synthesis = await callModel({
        uiLang,
        prompt,
        secondPass: true,
      });
    }

    let finalSynthesis: EvidenceSynthesis;
    let source: 'model' | 'fallback';

    if (isStrongEnough(synthesis)) {
      finalSynthesis = synthesis!;
      source = 'model';
    } else {
      finalSynthesis = buildFallbackSynthesis({
        uiLang,
        report,
        entries: evidenceEntries,
        currentDecision,
      });
      source = 'fallback';
    }

    const savedPlan = await saveUserEvidenceSynthesis({
      reportId,
      uiLang,
      synthesis: finalSynthesis,
    });

    return NextResponse.json({
      ok: true,
      synthesis: savedPlan.evidenceSummary,
      savedAt: savedPlan.evidenceSummaryUpdatedAt,
      source,
    });
  } catch (error) {
    console.error('EVIDENCE_SYNTHESIS_POST_FAILED', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate the synthesis.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        {
          ok: false,
          error: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
