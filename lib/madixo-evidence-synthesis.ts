import type { SavedMadixoReport } from '@/lib/madixo-reports';
import type {
  EvidenceConfidence,
  EvidenceRecommendation,
  EvidenceSynthesis,
  SavedValidationPlan,
  UiLanguage,
  ValidationDecisionState,
  ValidationEvidenceEntry,
} from '@/lib/madixo-validation';
import {
  normalizeEvidenceConfidence,
  normalizeEvidenceRecommendation,
} from '@/lib/madixo-validation';

const FALLBACK_SYNTHESIS: EvidenceSynthesis = {
  validatedLearnings: [],
  openQuestions: [],
  strongestSignals: [],
  recommendedDirection: 'continue',
  reasoning: '',
  confidence: 'medium',
  nextBestStep: {
    title: 'Recommended next step',
    goal: 'Collect clearer evidence before a bigger decision.',
    whyNow: 'The current evidence is still limited.',
    actions: ['Add more real market notes, then review the direction again.'],
    successSignal: 'A repeated and visible pattern from the market.',
    executionWindow: 'A short few days',
  },
  topObjections: [],
  topDesires: [],
};

export const evidenceSynthesisSchema = {
  name: 'madixo_evidence_synthesis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      validatedLearnings: {
        type: 'array',
        items: { type: 'string' },
      },
      openQuestions: {
        type: 'array',
        items: { type: 'string' },
      },
      strongestSignals: {
        type: 'array',
        items: { type: 'string' },
      },
      recommendedDirection: {
        type: 'string',
        enum: ['continue', 'pivot', 'stop'],
      },
      reasoning: {
        type: 'string',
      },
      confidence: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
      nextBestStep: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          goal: { type: 'string' },
          whyNow: { type: 'string' },
          actions: {
            type: 'array',
            items: { type: 'string' },
          },
          successSignal: { type: 'string' },
          executionWindow: { type: 'string' },
        },
        required: [
          'title',
          'goal',
          'whyNow',
          'actions',
          'successSignal',
          'executionWindow',
        ],
      },
      topObjections: {
        type: 'array',
        items: { type: 'string' },
      },
      topDesires: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'validatedLearnings',
      'openQuestions',
      'strongestSignals',
      'recommendedDirection',
      'reasoning',
      'confidence',
      'nextBestStep',
      'topObjections',
      'topDesires',
    ],
  },
} as const;

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeStringArray(value: unknown, maxItems = 4) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
        .map((item) => item.trim())
    )
  ).slice(0, maxItems);
}

function sectionTitle(
  entryType: ValidationEvidenceEntry['entryType'],
  uiLang: UiLanguage
) {
  if (uiLang === 'ar') {
    if (entryType === 'interview') return 'مقابلة';
    if (entryType === 'objection') return 'اعتراض';
    return 'ملاحظة سوق';
  }

  if (entryType === 'interview') return 'Interview';
  if (entryType === 'objection') return 'Objection';
  return 'Market note';
}

function strengthLabel(
  signalStrength: ValidationEvidenceEntry['signalStrength'],
  uiLang: UiLanguage
) {
  if (uiLang === 'ar') {
    if (signalStrength === 'strong') return 'قوية';
    if (signalStrength === 'weak') return 'ضعيفة';
    return 'متوسطة';
  }

  if (signalStrength === 'strong') return 'Strong';
  if (signalStrength === 'weak') return 'Weak';
  return 'Medium';
}

function formatEvidenceEntries(
  entries: ValidationEvidenceEntry[],
  uiLang: UiLanguage
) {
  if (!entries.length) {
    return uiLang === 'ar'
      ? 'لا توجد ملاحظات سوق محفوظة بعد.'
      : 'No saved market notes yet.';
  }

  return entries
    .map((entry, index) => {
      const source = safeText(
        entry.source,
        uiLang === 'ar' ? 'غير محدد' : 'Not specified'
      );

      return [
        `${index + 1}. ${sectionTitle(entry.entryType, uiLang)} — ${entry.title}`,
        `${uiLang === 'ar' ? 'القوة' : 'Strength'}: ${strengthLabel(
          entry.signalStrength,
          uiLang
        )}`,
        `${uiLang === 'ar' ? 'المصدر' : 'Source'}: ${source}`,
        `${uiLang === 'ar' ? 'المحتوى' : 'Content'}: ${entry.content}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function buildEvidenceSynthesisInput(params: {
  report: SavedMadixoReport;
  uiLang: UiLanguage;
  plan: SavedValidationPlan | null;
  evidenceEntries: ValidationEvidenceEntry[];
  currentDecision?: ValidationDecisionState;
}) {
  const { report, uiLang, plan, evidenceEntries, currentDecision } = params;

  const languageLine =
    uiLang === 'ar'
      ? 'اكتب الخلاصة بالعربية الفصحى البسيطة والمباشرة فقط، وبأسلوب مفهوم لأي متحدث بالعربية في أي بلد عربي. اجعل الجمل قصيرة وطبيعية، وابتعد عن لغة المستشارين والمصطلحات الثقيلة. وإذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا.'
      : 'Write the synthesis in English only.';

  const decisionLine = currentDecision
    ? uiLang === 'ar'
      ? `قرار المؤسس الحالي: ${currentDecision}`
      : `Current founder decision: ${currentDecision}`
    : '';

  const planContext = plan
    ? `
${uiLang === 'ar' ? 'خطة التجربة الحالية:' : 'Current validation workspace:'}
- ${uiLang === 'ar' ? 'التركيز الحالي' : 'Current focus'}: ${safeText(plan.plan.validationFocus)}
- ${uiLang === 'ar' ? 'الشريحة الحالية' : 'Current segment'}: ${safeText(plan.plan.targetSegment)}
- ${uiLang === 'ar' ? 'القيمة الحالية' : 'Current value proposition'}: ${safeText(plan.plan.valueProposition)}
- ${uiLang === 'ar' ? 'هدف الدليل' : 'Evidence goal'}: ${safeText(plan.plan.evidenceGoal)}
- ${uiLang === 'ar' ? 'الإطار الزمني' : 'Execution window'}: ${safeText(plan.plan.executionWindow)}
- ${uiLang === 'ar' ? 'ملاحظات المؤسس' : 'Founder notes'}: ${safeText(
        plan.workspace.notes,
        uiLang === 'ar' ? 'لا توجد ملاحظات إضافية.' : 'No extra notes.'
      )}
`
    : '';

  return `
${languageLine}

Create a grounded synthesis for this opportunity.

${uiLang === 'ar' ? 'سياق التقرير:' : 'Report context:'}
- ${uiLang === 'ar' ? 'الفكرة' : 'Business idea'}: ${safeText(
        report.query,
        uiLang === 'ar' ? 'فكرة غير محددة' : 'Untitled opportunity'
      )}
- ${uiLang === 'ar' ? 'السوق' : 'Target market'}: ${safeText(
        report.market,
        uiLang === 'ar' ? 'غير محدد' : 'Not specified'
      )}
- ${uiLang === 'ar' ? 'العميل' : 'Target customer'}: ${safeText(
        report.customer,
        uiLang === 'ar' ? 'غير محدد' : 'Not specified'
      )}
- ${uiLang === 'ar' ? 'درجة الفرصة' : 'Opportunity score'}: ${report.result.opportunityScore}/100
- ${uiLang === 'ar' ? 'الخلاصة' : 'Summary'}: ${safeText(report.result.summary)}
- ${uiLang === 'ar' ? 'لماذا هذه الفرصة' : 'Why this opportunity'}: ${safeText(
        report.result.whyThisOpportunity
      )}
- ${uiLang === 'ar' ? 'نقاط الألم' : 'Pain points'}: ${report.result.painPoints.join(' | ')}
- ${uiLang === 'ar' ? 'المخاطر' : 'Risks'}: ${report.result.risks.join(' | ')}
${decisionLine}
${planContext}
${uiLang === 'ar' ? 'ملاحظات السوق المحفوظة:' : 'Saved market notes:'}
${formatEvidenceEntries(evidenceEntries, uiLang)}

${uiLang === 'ar' ? 'المطلوب:' : 'Requirements:'}
- ${uiLang === 'ar' ? 'كن Evidence-first ومحافظًا جدًا.' : 'Be evidence-first and very conservative.'}
- ${uiLang === 'ar' ? 'إذا كانت اللغة عربية، فاستخدم العربية الفصحى البسيطة والمباشرة، واختر الكلمات الأكثر شيوعًا ووضوحًا، واجعل الجمل قصيرة وطبيعية، وتجنب الكلمات المحلية أو الغامضة أو المترجمة حرفيًا أو لغة المستشارين الثقيلة. وإذا ورد اسم منصة أو علامة تجارية معروفة، فاكتبه بصيغته العربية الشائعة داخل الجملة العربية متى كان ذلك طبيعيًا.' : 'If the output language is Arabic, use plain standard Arabic that is easy for any Arabic speaker to understand.'}
- ${uiLang === 'ar' ? 'لا تستنتج شيئًا غير مدعوم بوضوح من الملاحظات.' : 'Do not infer anything that is not clearly supported by the notes.'}
- ${uiLang === 'ar' ? 'هذه المخرجات يجب أن تناسب أي مشروع مهما كان نوعه.' : 'The output must work for any project type.'}
- ${uiLang === 'ar' ? 'validatedLearnings = ما أصبح واضحًا فعلًا من الأدلة الحالية.' : 'validatedLearnings = what is actually becoming clear from the current evidence.'}
- ${uiLang === 'ar' ? 'openQuestions = ما الذي ما زال غير محسوم أو يحتاج اختبارًا إضافيًا.' : 'openQuestions = what is still uncertain or needs more testing.'}
- ${uiLang === 'ar' ? 'strongestSignals = أوضح الإشارات المتكررة أو المهمة من السوق.' : 'strongestSignals = the strongest repeated or important signals from the market.'}
- ${uiLang === 'ar' ? 'recommendedDirection يجب أن يكون واحدًا فقط: continue أو pivot أو stop.' : 'recommendedDirection must be exactly one of: continue, pivot, or stop.'}
- ${uiLang === 'ar' ? 'إذا كان recommendedDirection = continue فهذا يعني الاستمرار إلى تجربة صغيرة محدودة، وليس التوسع الكبير.' : 'If recommendedDirection = continue, it means continue to a small controlled test, not a big scale-up.'}
- ${uiLang === 'ar' ? 'reasoning يجب أن يكون قصيرًا وعمليًا وصادقًا.' : 'reasoning must be short, practical, and honest.'}
- ${uiLang === 'ar' ? 'confidence يجب أن تعكس جودة وكمية الأدلة الحالية، لا الثقة المتخيلة.' : 'confidence must reflect the quality and amount of current evidence, not imagined confidence.'}
- ${uiLang === 'ar' ? 'nextBestStep يجب أن يكون اختبارًا صغيرًا أو خطوة عملية قصيرة تقلل أكبر مجهول حالي.' : 'nextBestStep must be a small test or short practical step that reduces the biggest current unknown.'}
- ${uiLang === 'ar' ? 'topObjections و topDesires حقول توافق رجعي فقط. املأها فقط إذا كانت مدعومة بوضوح، وإلا أعدها فارغة.' : 'topObjections and topDesires are backward-compatibility fields only. Fill them only if clearly supported; otherwise return empty arrays.'}
`;
}

export function normalizeEvidenceSynthesis(value: unknown): EvidenceSynthesis {
  if (typeof value !== 'object' || value === null) {
    return FALLBACK_SYNTHESIS;
  }

  const obj = value as Record<string, unknown>;
  const nextBestStep =
    typeof obj.nextBestStep === 'object' && obj.nextBestStep !== null
      ? (obj.nextBestStep as Record<string, unknown>)
      : null;

  return {
    validatedLearnings: safeStringArray(
      obj.validatedLearnings ?? obj.topDesires ?? obj.strongestSignals,
      4
    ),
    openQuestions: safeStringArray(
      obj.openQuestions ?? obj.topObjections,
      4
    ),
    strongestSignals: safeStringArray(obj.strongestSignals, 4),
    recommendedDirection: normalizeEvidenceRecommendation(
      obj.recommendedDirection,
      'continue'
    ),
    reasoning: safeText(obj.reasoning),
    confidence: normalizeEvidenceConfidence(obj.confidence, 'medium'),
    nextBestStep: nextBestStep
      ? {
          title: safeText(nextBestStep.title, FALLBACK_SYNTHESIS.nextBestStep.title),
          goal: safeText(nextBestStep.goal, FALLBACK_SYNTHESIS.nextBestStep.goal),
          whyNow: safeText(nextBestStep.whyNow, FALLBACK_SYNTHESIS.nextBestStep.whyNow),
          actions: safeStringArray(nextBestStep.actions, 6),
          successSignal: safeText(
            nextBestStep.successSignal,
            FALLBACK_SYNTHESIS.nextBestStep.successSignal
          ),
          executionWindow: safeText(
            nextBestStep.executionWindow,
            FALLBACK_SYNTHESIS.nextBestStep.executionWindow
          ),
        }
      : FALLBACK_SYNTHESIS.nextBestStep,
    topObjections: safeStringArray(obj.topObjections, 4),
    topDesires: safeStringArray(obj.topDesires, 4),
  };
}

export function decisionLabel(
  value: EvidenceRecommendation | ValidationDecisionState,
  uiLang: UiLanguage
) {
  if (uiLang === 'ar') {
    if (value === 'continue') return 'استمر';
    if (value === 'pivot') return 'عدّل';
    if (value === 'stop') return 'أوقف';
    return 'غير محسوم';
  }

  if (value === 'continue') return 'Continue';
  if (value === 'pivot') return 'Pivot';
  if (value === 'stop') return 'Stop';
  return 'Undecided';
}

export function confidenceLabel(
  value: EvidenceConfidence,
  uiLang: UiLanguage
) {
  if (uiLang === 'ar') {
    if (value === 'high') return 'عالية';
    if (value === 'low') return 'منخفضة';
    return 'متوسطة';
  }

  if (value === 'high') return 'High';
  if (value === 'low') return 'Low';
  return 'Medium';
}
