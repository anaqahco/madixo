import type { SavedMadixoReport } from '@/lib/madixo-reports';
import type {
  EvidenceSynthesis,
  IterationEngineOutput,
  IterationNextMove,
  SavedValidationPlan,
  UiLanguage,
  ValidationDecisionState,
  ValidationEvidenceEntry,
} from '@/lib/madixo-validation';
import { normalizeIterationEngineOutput as baseNormalizeIterationEngineOutput } from '@/lib/madixo-validation';

export const iterationEngineSchema = {
  name: 'madixo_iteration_engine',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      nextMove: {
        type: 'string',
        enum: [
          'continue_as_is',
          'continue_with_changes',
          'pivot_audience',
          'pivot_offer',
          'stop',
        ],
      },
      whyNow: { type: 'string' },
      whatToChange: {
        type: 'array',
        items: { type: 'string' },
      },
      nextExperiment: { type: 'string' },
      updatedOffer: { type: 'string' },
      updatedOutreach: { type: 'string' },
      successCriteria: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'nextMove',
      'whyNow',
      'whatToChange',
      'nextExperiment',
      'updatedOffer',
      'updatedOutreach',
      'successCriteria',
    ],
  },
} as const;

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeStringArray(value: unknown, maxItems = 5) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, maxItems);
}

function normalizeTextBlock(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitTextIntoChunks(value: string) {
  const clean = normalizeTextBlock(value);
  if (!clean) return [] as string[];

  const rawParts = clean
    .split(/\n+/)
    .flatMap((part) => part.split(/(?<=[.!؟…])\s+|[،,:؛]+\s*|\s*[\-–•]\s+/))
    .map((part) => part.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of rawParts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  return unique;
}

function compactText(value: string, maxLength = 320, maxChunks = 4) {
  const chunks = splitTextIntoChunks(value);
  if (!chunks.length) return '';

  const selected: string[] = [];
  let total = 0;

  for (const chunk of chunks) {
    const normalizedChunk = chunk.trim();
    if (!normalizedChunk) continue;

    const remaining = maxLength - total - (selected.length ? 1 : 0);
    if (remaining <= 0) break;

    const clippedChunk =
      normalizedChunk.length > remaining ? normalizedChunk.slice(0, Math.max(remaining, 24)).trim() : normalizedChunk;

    if (!clippedChunk) break;

    selected.push(clippedChunk);
    total += (selected.length > 1 ? 1 : 0) + clippedChunk.length;

    if (normalizedChunk.length > clippedChunk.length) break;
    if (selected.length >= maxChunks) break;
  }

  const result = selected.join(' ').trim();
  if (result) return result;

  return normalizeTextBlock(value).slice(0, maxLength).trim();
}

function compactArrayItems(items: string[], maxItems = 4, maxLength = 140) {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const compact = compactText(item, maxLength, 2);
    if (!compact) continue;
    const key = compact.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(compact);
    if (unique.length >= maxItems) break;
  }

  return unique;
}

function normalizeChunkKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[ً-ٟ]/g, '')
    .replace(/["'“”‘’«»]/g, '')
    .replace(/[.,!؟…،:؛()\[\]{}\/\-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function areNearDuplicateChunks(a: string, b: string) {
  const keyA = normalizeChunkKey(a);
  const keyB = normalizeChunkKey(b);

  if (!keyA || !keyB) return false;
  if (keyA === keyB) return true;
  if (keyA.startsWith(keyB) || keyB.startsWith(keyA)) return true;

  const wordsA = keyA.split(' ').filter(Boolean);
  const wordsB = keyB.split(' ').filter(Boolean);
  if (!wordsA.length || !wordsB.length) return false;

  const short = wordsA.length <= wordsB.length ? wordsA : wordsB;
  const long = wordsA.length > wordsB.length ? wordsA : wordsB;
  const overlap = short.filter((word) => long.includes(word)).length;

  return overlap >= Math.max(3, Math.ceil(short.length * 0.75));
}

export function summarizeActionItems(items: string[], maxItems = 4, maxLength = 110) {
  const collected: string[] = [];

  for (const item of items) {
    const parts = splitTextIntoChunks(item);

    for (const part of parts) {
      const compact = compactText(part, maxLength, 1);
      if (!compact) continue;
      if (collected.some((existing) => areNearDuplicateChunks(existing, compact))) continue;
      collected.push(compact);
      if (collected.length >= maxItems) return collected;
    }
  }

  return collected;
}

export function summarizeLongText(value: string, maxLength = 220, maxChunks = 3) {
  const parts = summarizeActionItems(
    [value],
    maxChunks,
    Math.max(48, Math.floor(maxLength / Math.max(maxChunks, 1)))
  );

  if (parts.length) {
    return compactText(parts.join(' '), maxLength, maxChunks);
  }

  return compactText(value, maxLength, maxChunks);
}

export function sanitizeIterationEngineOutput(value: IterationEngineOutput | null) {
  if (!value) return null;

  return {
    nextMove: value.nextMove,
    whyNow: summarizeLongText(value.whyNow, 220, 2),
    whatToChange: summarizeActionItems(value.whatToChange, 3, 95),
    nextExperiment: summarizeLongText(value.nextExperiment, 240, 3),
    updatedOffer: summarizeLongText(value.updatedOffer, 160, 2),
    updatedOutreach: summarizeLongText(value.updatedOutreach, 180, 2),
    successCriteria: summarizeActionItems(value.successCriteria, 3, 90),
  } satisfies IterationEngineOutput;
}

function sectionTitle(entryType: ValidationEvidenceEntry['entryType'], uiLang: UiLanguage) {
  if (uiLang === 'ar') {
    if (entryType === 'interview') return 'مقابلة';
    if (entryType === 'objection') return 'اعتراض';
    return 'إشارة سوق';
  }

  if (entryType === 'interview') return 'Interview';
  if (entryType === 'objection') return 'Objection';
  return 'Market signal';
}

function strengthLabel(signalStrength: ValidationEvidenceEntry['signalStrength'], uiLang: UiLanguage) {
  if (uiLang === 'ar') {
    if (signalStrength === 'strong') return 'قوية';
    if (signalStrength === 'weak') return 'ضعيفة';
    return 'متوسطة';
  }

  if (signalStrength === 'strong') return 'Strong';
  if (signalStrength === 'weak') return 'Weak';
  return 'Medium';
}

function formatEvidenceEntries(entries: ValidationEvidenceEntry[], uiLang: UiLanguage) {
  if (!entries.length) {
    return uiLang === 'ar' ? 'لا توجد عناصر أدلة محفوظة بعد.' : 'No saved evidence entries yet.';
  }

  return entries
    .map((entry, index) => {
      const source = safeText(entry.source, uiLang === 'ar' ? 'غير محدد' : 'Not specified');

      return [
        `${index + 1}. ${sectionTitle(entry.entryType, uiLang)} — ${entry.title}`,
        `${uiLang === 'ar' ? 'القوة' : 'Strength'}: ${strengthLabel(entry.signalStrength, uiLang)}`,
        `${uiLang === 'ar' ? 'المصدر' : 'Source'}: ${source}`,
        `${uiLang === 'ar' ? 'المحتوى' : 'Content'}: ${entry.content}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function buildIterationEngineInput(params: {
  report: SavedMadixoReport;
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  evidenceEntries: ValidationEvidenceEntry[];
  evidenceSummary: EvidenceSynthesis | null;
  currentDecision?: ValidationDecisionState;
}) {
  const { report, uiLang, plan, evidenceEntries, evidenceSummary, currentDecision } = params;

  const languageLine = uiLang === 'ar' ? 'اكتب المخرجات بالعربية الفصحى البسيطة والمباشرة فقط، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. وإذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا.' : 'Write the output in English only.';
  const decisionLine = currentDecision
    ? uiLang === 'ar'
      ? `قرار المؤسس الحالي: ${currentDecision}`
      : `Current founder decision: ${currentDecision}`
    : '';

  const evidenceSummaryContext = evidenceSummary
    ? `
${uiLang === 'ar' ? 'خلاصة الأدلة الحالية:' : 'Current evidence summary:'}
- ${uiLang === 'ar' ? 'الاتجاه المقترح' : 'Recommended direction'}: ${evidenceSummary.recommendedDirection}
- ${uiLang === 'ar' ? 'درجة الثقة' : 'Confidence'}: ${evidenceSummary.confidence}
- ${uiLang === 'ar' ? 'السبب' : 'Reasoning'}: ${compactText(safeText(evidenceSummary.reasoning), 220, 3)}
- ${uiLang === 'ar' ? 'أهم الاعتراضات' : 'Top objections'}: ${compactArrayItems(evidenceSummary.topObjections, 4, 90).join(' | ')}
- ${uiLang === 'ar' ? 'أهم الرغبات' : 'Top desires'}: ${compactArrayItems(evidenceSummary.topDesires, 4, 90).join(' | ')}
- ${uiLang === 'ar' ? 'أقوى الإشارات' : 'Strongest signals'}: ${compactArrayItems(evidenceSummary.strongestSignals, 4, 90).join(' | ')}
`
    : '';

  const planContext = plan
    ? `
${uiLang === 'ar' ? 'خطة الاختبار الحالية:' : 'Current testing plan:'}
- ${uiLang === 'ar' ? 'فرضية الاختبار' : 'Testing thesis'}: ${compactText(safeText(plan.plan.validationThesis), 220, 3)}
- ${uiLang === 'ar' ? 'أفضل عميل أول' : 'Best first customer'}: ${compactText(safeText(plan.plan.idealFirstCustomer), 160, 2)}
- ${uiLang === 'ar' ? 'قنوات الوصول' : 'Outreach channels'}: ${compactArrayItems(plan.plan.outreachChannels, 6, 50).join(' | ')}
- ${uiLang === 'ar' ? 'رسالة الوصول الحالية' : 'Current outreach script'}: ${compactText(summarizeLongText(safeText(plan.plan.outreachScript), 160, 2), 220, 3)}
- ${uiLang === 'ar' ? 'أول اختبار' : 'First test'}: ${safeText(plan.plan.firstValidationTest.title)} — ${compactText(summarizeLongText(safeText(plan.plan.firstValidationTest.description), 170, 2), 220, 3)}
- ${uiLang === 'ar' ? 'أول عرض' : 'First offer'}: ${safeText(plan.plan.firstOffer.title)} — ${compactText(summarizeLongText(safeText(plan.plan.firstOffer.description), 150, 2), 200, 3)}
- ${uiLang === 'ar' ? 'ملاحظات المؤسس' : 'Founder notes'}: ${compactText(summarizeLongText(safeText(plan.workspace.notes, uiLang === 'ar' ? 'لا توجد ملاحظات إضافية.' : 'No extra notes.'), 180, 2), 180, 3)}
`
    : '';

  return `
${languageLine}

Create the next practical iteration for this opportunity.

${uiLang === 'ar' ? 'سياق التقرير:' : 'Report context:'}
- ${uiLang === 'ar' ? 'الفكرة' : 'Business idea'}: ${safeText(report.query, uiLang === 'ar' ? 'فكرة غير محددة' : 'Untitled opportunity')}
- ${uiLang === 'ar' ? 'السوق' : 'Target market'}: ${safeText(report.market, uiLang === 'ar' ? 'غير محدد' : 'Not specified')}
- ${uiLang === 'ar' ? 'العميل' : 'Target customer'}: ${safeText(report.customer, uiLang === 'ar' ? 'غير محدد' : 'Not specified')}
- ${uiLang === 'ar' ? 'درجة الفرصة' : 'Opportunity score'}: ${report.result.opportunityScore}/100
- ${uiLang === 'ar' ? 'الملخص' : 'Summary'}: ${compactText(safeText(report.result.summary), 180, 3)}
- ${uiLang === 'ar' ? 'أفضل عميل أول' : 'Best first customer'}: ${compactText(safeText(report.result.bestFirstCustomer.description), 160, 2)}
- ${uiLang === 'ar' ? 'أول عرض' : 'First offer'}: ${compactText(safeText(report.result.firstOffer.description), 160, 2)}
- ${uiLang === 'ar' ? 'الألم الرئيسي' : 'Pain points'}: ${compactArrayItems(report.result.painPoints, 4, 60).join(' | ')}
- ${uiLang === 'ar' ? 'المخاطر' : 'Risks'}: ${compactArrayItems(report.result.risks, 4, 60).join(' | ')}
${decisionLine}
${planContext}
${evidenceSummaryContext}
${uiLang === 'ar' ? 'الأدلة الملتقطة من السوق:' : 'Captured market evidence:'}
${formatEvidenceEntries(evidenceEntries, uiLang)}

${uiLang === 'ar' ? 'المطلوب:' : 'Requirements:'}
- ${uiLang === 'ar' ? 'أخرج خطوة تنفيذية تالية واحدة واضحة فقط.' : 'Output one clear next execution step only.'}
- ${uiLang === 'ar' ? 'إذا كانت اللغة عربية، فاستخدم العربية الفصحى البسيطة والمباشرة، واختر الكلمات الأكثر شيوعًا ووضوحًا، واجعل الجمل قصيرة وطبيعية، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا أو لغة المستشارين الثقيلة. وإذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا.' : 'If the output language is Arabic, use plain standard Arabic that is easy for any Arabic speaker to understand.'}
- ${uiLang === 'ar' ? 'اختر nextMove واحدًا فقط من القائمة المعطاة.' : 'Choose exactly one nextMove from the allowed list.'}
- ${uiLang === 'ar' ? 'اجعل whyNow عمليًا جدًا ومبنيًا على الأدلة.' : 'Make whyNow practical and evidence-based.'}
- ${uiLang === 'ar' ? 'whatToChange يجب أن يحتوي 2 إلى 4 تعديلات مباشرة.' : 'whatToChange should contain 2 to 4 direct changes.'}
- ${uiLang === 'ar' ? 'nextExperiment يجب أن يكون اختبارًا صغيرًا قابلًا للتنفيذ خلال أيام قليلة.' : 'nextExperiment must be a small practical experiment that can be run in a few days.'}
- ${uiLang === 'ar' ? 'updatedOffer يجب أن يكون العرض التالي المقترح بصياغة واضحة.' : 'updatedOffer should describe the next proposed offer clearly.'}
- ${uiLang === 'ar' ? 'updatedOutreach يجب أن يكون رسالة جاهزة يمكن استخدامها فعليًا.' : 'updatedOutreach should be a ready-to-use outreach message.'}
- ${uiLang === 'ar' ? 'successCriteria يجب أن يحتوي 3 إلى 4 إشارات نجاح قابلة للملاحظة.' : 'successCriteria should contain 3 to 4 observable success criteria.'}
- ${uiLang === 'ar' ? 'إذا كانت الأدلة ضعيفة جدًا فاختر stop أو continue_with_changes فقط إذا كان ذلك مدعومًا بوضوح.' : 'If the evidence is weak, only choose stop or continue_with_changes when clearly supported.'}
`;
}

function containsAny(text: string, needles: string[]) {
  const lower = text.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function inferNextMove(
  summary: EvidenceSynthesis | null,
  objections: string[],
  desires: string[]
): IterationNextMove {
  if (summary?.recommendedDirection === 'stop') {
    return 'stop';
  }

  const joined = [...objections, ...desires].join(' ');
  if (
    summary?.recommendedDirection === 'pivot' &&
    containsAny(joined, ['شريحة', 'segment', 'audience', 'mothers', 'teens', 'طلاب', 'طلاب', 'نساء'])
  ) {
    return 'pivot_audience';
  }

  if (
    summary?.recommendedDirection === 'pivot' ||
    containsAny(joined, ['سعر', 'price', 'عرض', 'offer', 'pack', 'bundle', 'مقاس', 'size', 'قياس'])
  ) {
    return 'pivot_offer';
  }

  if (summary?.recommendedDirection === 'continue') {
    return objections.length ? 'continue_with_changes' : 'continue_as_is';
  }

  return objections.length ? 'continue_with_changes' : 'continue_as_is';
}

function makeWhatToChange(params: {
  uiLang: UiLanguage;
  objections: string[];
  desires: string[];
  signals: string[];
}) {
  const { uiLang, objections, desires, signals } = params;
  const items: string[] = [];

  if (objections[0]) {
    items.push(
      uiLang === 'ar'
        ? `عالج الاعتراض الأوضح مباشرة: ${objections[0]}`
        : `Address the clearest objection directly: ${objections[0]}`
    );
  }

  if (desires[0]) {
    items.push(
      uiLang === 'ar'
        ? `اجعل العرض يبرز الرغبة الأوضح: ${desires[0]}`
        : `Make the offer highlight the clearest desire: ${desires[0]}`
    );
  }

  if (signals[0]) {
    items.push(
      uiLang === 'ar'
        ? `اختبر القناة أو الإشارة الأقوى بدل التوسع العشوائي: ${signals[0]}`
        : `Test the strongest channel or signal before broad expansion: ${signals[0]}`
    );
  }

  if (items.length < 2) {
    items.push(
      uiLang === 'ar'
        ? 'بسّط الرسالة التسويقية وركّز على منفعة واحدة واضحة.'
        : 'Simplify the marketing message and focus on one clear benefit.'
    );
  }

  if (items.length < 3) {
    items.push(
      uiLang === 'ar'
        ? 'قلّل التشتت في الاختبار التالي واستهدف شريحة واحدة وعرضًا واحدًا.'
        : 'Reduce test complexity in the next step and focus on one audience with one offer.'
    );
  }

  return items.slice(0, 4);
}

function makeWhyNow(params: {
  uiLang: UiLanguage;
  summary: EvidenceSynthesis | null;
  objections: string[];
  desires: string[];
  signals: string[];
}) {
  const { uiLang, summary, objections, desires, signals } = params;

  if (uiLang === 'ar') {
    return `الأدلة الحالية لا تشير إلى توقف كامل، لكنها لا تدعم الاستمرار العشوائي أيضًا. لدينا ${signals[0] || 'إشارة سوق قابلة للاختبار'} مع ${objections[0] || 'اعتراض يحتاج معالجة'}، لذلك الأنسب الآن هو خطوة تنفيذية أصغر وأكثر دقة تترجم الرغبة الأوضح (${desires[0] || 'الشراء عند وضوح الفائدة'}) إلى عرض ورسالة واختبار أكثر تحديدًا. ${summary?.reasoning ? `كما أن خلاصة الأدلة الحالية تشير إلى: ${summary.reasoning}` : ''}`.trim();
  }

  return `The current evidence does not justify stopping completely, but it also does not support random continuation. We have ${signals[0] || 'a testable market signal'} alongside ${objections[0] || 'an objection that needs handling'}, so the best next step is a tighter execution step that translates the clearest desire (${desires[0] || 'purchase intent when the value is clear'}) into a sharper offer, message, and experiment. ${summary?.reasoning ? `The current evidence summary also indicates: ${summary.reasoning}` : ''}`.trim();
}

function makeNextExperiment(params: {
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  nextMove: IterationNextMove;
  objections: string[];
  desires: string[];
}) {
  const { uiLang, plan, nextMove, objections, desires } = params;
  const baseTest = plan?.plan.firstValidationTest.title || (uiLang === 'ar' ? 'اختبار سريع جديد' : 'A new quick test');
  const baseDesc = plan?.plan.firstValidationTest.description || '';

  if (uiLang === 'ar') {
    const moveText =
      nextMove === 'pivot_audience'
        ? 'على شريحة مختلفة لكنها قريبة'
        : nextMove === 'pivot_offer'
        ? 'بعرض معدل'
        : nextMove === 'stop'
        ? 'كتجربة أخيرة صغيرة قبل الإيقاف'
        : 'مع تعديلات واضحة';

    return `${baseTest}: نفّذ نسخة مختصرة من الاختبار الحالي ${moveText}. استخدم عرضًا يجيب على الاعتراض الرئيسي (${objections[0] || 'السعر/الملاءمة'}) ورسالة تركّز على الرغبة الأقوى (${desires[0] || 'الفائدة العملية'}). اجمع 20-30 إشارة واضحة خلال 3-5 أيام بدل التوسع الواسع. ${baseDesc}`.trim();
  }

  const moveText =
    nextMove === 'pivot_audience'
      ? 'for a nearby but different audience'
      : nextMove === 'pivot_offer'
      ? 'with an adjusted offer'
      : nextMove === 'stop'
      ? 'as one final small test before stopping'
      : 'with clear changes';

  return `${baseTest}: run a shorter version of the current test ${moveText}. Use an offer that addresses the main objection (${objections[0] || 'price/fit'}) and a message that highlights the strongest desire (${desires[0] || 'practical value'}). Collect 20-30 clear signals within 3-5 days instead of broad expansion. ${baseDesc}`.trim();
}

function makeUpdatedOffer(params: {
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  objections: string[];
  desires: string[];
}) {
  const { uiLang, plan, objections, desires } = params;
  const title = plan?.plan.firstOffer.title || (uiLang === 'ar' ? 'عرض اختبار معدل' : 'Adjusted test offer');
  const pricing = plan?.plan.firstOffer.pricingIdea || '';
  if (uiLang === 'ar') {
    return `${title}: اجعل العرض أوضح وأقل مقاومة للشراء، واذكر المنفعة الأقوى (${desires[0] || 'الفائدة العملية'}) مع معالجة الاعتراض الرئيسي (${objections[0] || 'السعر أو الملاءمة'}). ${pricing ? `فكرة التسعير الحالية: ${pricing}.` : ''}`.trim();
  }
  return `${title}: make the offer clearer and easier to buy, highlight the strongest desire (${desires[0] || 'practical value'}) and address the main objection (${objections[0] || 'price or fit'}). ${pricing ? `Current pricing idea: ${pricing}.` : ''}`.trim();
}

function makeUpdatedOutreach(params: {
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  desires: string[];
}) {
  const { uiLang, plan, desires } = params;
  const base = plan?.plan.outreachScript || '';
  if (uiLang === 'ar') {
    return base
      ? `${base} مع تعديل البداية لتكون أوضح حول الفائدة: ${desires[0] || 'الفائدة العملية الواضحة'}، وإنهاء الرسالة بدعوة مباشرة لتجربة محدودة الآن.`
      : `مرحبًا، نختبر الآن عرضًا محددًا مبنيًا على ما طلبه العملاء فعلًا: ${desires[0] || 'فائدة عملية واضحة'}. إذا كان هذا مناسبًا لك، أرسل كلمة "مهتم" وسأرسل لك التفاصيل وطريقة الطلب المباشرة.`;
  }
  return base
    ? `${base} Start more clearly with the main value point: ${desires[0] || 'a clear practical benefit'}, and close with a direct invitation to join the limited test now.`
    : `Hi, we are testing a focused offer built around what customers actually asked for: ${desires[0] || 'a clear practical benefit'}. If this feels relevant, reply with "Interested" and I will send the direct details and order flow.`;
}

function makeSuccessCriteria(params: {
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  nextMove: IterationNextMove;
}) {
  const { uiLang, plan, nextMove } = params;
  const baseSignals =
    nextMove === 'stop'
      ? plan?.plan.stopSignals
      : nextMove === 'pivot_audience' || nextMove === 'pivot_offer'
      ? plan?.plan.pivotSignals
      : plan?.plan.continueSignals;

  const items = safeStringArray(baseSignals, 4);
  if (items.length >= 3) return items;

  if (uiLang === 'ar') {
    return [
      ...items,
      'الحصول على 20 إشارة اهتمام واضحة على الأقل من نفس الشريحة المستهدفة.',
      'وجود ردود فعل تشير إلى فهم واضح للعرض بدون شرح طويل.',
      'ظهور نية شراء أو طلب مباشر أو طلب تفاصيل السعر/الطلب.',
    ].slice(0, 4);
  }

  return [
    ...items,
    'Get at least 20 clear interest signals from the same target segment.',
    'See responses that show the offer is understood without long explanation.',
    'See direct buying intent, requests for price, or requests for ordering details.',
  ].slice(0, 4);
}

export function buildFallbackIterationEngine(params: {
  report: SavedMadixoReport;
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  evidenceEntries: ValidationEvidenceEntry[];
  evidenceSummary: EvidenceSynthesis | null;
  currentDecision?: ValidationDecisionState;
}): IterationEngineOutput {
  const { uiLang, plan, evidenceSummary, evidenceEntries } = params;

  const objections = [
    ...(evidenceSummary?.topObjections || []),
    ...evidenceEntries.filter((e) => e.entryType === 'objection').map((e) => e.title || e.content),
  ].filter(Boolean);

  const desires = [
    ...(evidenceSummary?.topDesires || []),
    ...evidenceEntries.filter((e) => e.entryType === 'interview').map((e) => e.title || e.content),
  ].filter(Boolean);

  const signals = [
    ...(evidenceSummary?.strongestSignals || []),
    ...evidenceEntries.filter((e) => e.entryType === 'market_signal').map((e) => e.title || e.content),
  ].filter(Boolean);

  const nextMove = inferNextMove(evidenceSummary, objections, desires);

  return sanitizeIterationEngineOutput({
    nextMove,
    whyNow: makeWhyNow({ uiLang, summary: evidenceSummary, objections, desires, signals }),
    whatToChange: makeWhatToChange({ uiLang, objections, desires, signals }),
    nextExperiment: makeNextExperiment({ uiLang, plan, nextMove, objections, desires }),
    updatedOffer: makeUpdatedOffer({ uiLang, plan, objections, desires }),
    updatedOutreach: makeUpdatedOutreach({ uiLang, plan, desires }),
    successCriteria: makeSuccessCriteria({ uiLang, plan, nextMove }),
  })!;
}

export function normalizeIterationEngineOutput(value: unknown): IterationEngineOutput | null {
  return sanitizeIterationEngineOutput(baseNormalizeIterationEngineOutput(value));
}


export function nextMoveLabel(value: IterationNextMove, uiLang: UiLanguage) {
  if (uiLang === 'ar') {
    if (value === 'continue_as_is') return 'استمر كما هو';
    if (value === 'continue_with_changes') return 'استمر مع تعديلات';
    if (value === 'pivot_audience') return 'عدّل الشريحة';
    if (value === 'pivot_offer') return 'عدّل العرض';
    return 'أوقف';
  }

  if (value === 'continue_as_is') return 'Continue as is';
  if (value === 'continue_with_changes') return 'Continue with changes';
  if (value === 'pivot_audience') return 'Pivot audience';
  if (value === 'pivot_offer') return 'Pivot offer';
  return 'Stop';
}
