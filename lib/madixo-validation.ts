import type { SavedMadixoReport } from '@/lib/madixo-reports';

export type UiLanguage = 'ar' | 'en';
export type ValidationDecisionState = 'undecided' | 'continue' | 'pivot' | 'stop';
export type EvidenceEntryType = 'interview' | 'objection' | 'market_signal';
export type EvidenceSignalStrength = 'weak' | 'medium' | 'strong';
export type EvidenceRecommendation = 'continue' | 'pivot' | 'stop';
export type EvidenceConfidence = 'low' | 'medium' | 'high';
export type IterationNextMove =
  | 'continue_as_is'
  | 'continue_with_changes'
  | 'pivot_audience'
  | 'pivot_offer'
  | 'stop';

export type ValidationPlan = {
  validationFocus: string;
  targetSegment: string;
  valueProposition: string;
  outreachChannels: string[];
  outreachScript: string;
  evidenceGoal: string;
  executionWindow: string;
  checklist: string[];
  successSignals: string[];
  continueSignals: string[];
  pivotSignals: string[];
  stopSignals: string[];

  // Legacy-compatible aliases kept so older screens and saved rows do not break.
  validationThesis: string;
  idealFirstCustomer: string;
  interviewQuestions: string[];
  firstValidationTest: {
    title: string;
    description: string;
    whyThisTest: string;
  };
  firstOffer: {
    title: string;
    description: string;
    pricingIdea: string;
  };
  checklist7Day: string[];
};

export type ValidationWorkspaceState = {
  completedChecklistIndexes: number[];
  notes: string;
  decisionState: ValidationDecisionState;
};

export type EvidenceNextBestStep = {
  title: string;
  goal: string;
  whyNow: string;
  actions: string[];
  successSignal: string;
  executionWindow: string;
};

export type EvidenceSynthesis = {
  validatedLearnings: string[];
  openQuestions: string[];
  strongestSignals: string[];
  recommendedDirection: EvidenceRecommendation;
  reasoning: string;
  confidence: EvidenceConfidence;
  nextBestStep: EvidenceNextBestStep;

  // Legacy-compatible fields retained for previously saved data and older components.
  topObjections: string[];
  topDesires: string[];
};

export type IterationEngineOutput = {
  nextMove: IterationNextMove;
  whyNow: string;
  whatToChange: string[];
  nextExperiment: string;
  updatedOffer: string;
  updatedOutreach: string;
  successCriteria: string[];
};

export type SavedValidationPlan = {
  id: string;
  reportId: string;
  uiLang: UiLanguage;
  createdAt: string;
  updatedAt: string;
  plan: ValidationPlan;
  workspace: ValidationWorkspaceState;
  evidenceSummary: EvidenceSynthesis | null;
  evidenceSummaryUpdatedAt: string | null;
  iterationEngine: IterationEngineOutput | null;
  iterationEngineUpdatedAt: string | null;
};

export type ValidationEvidenceEntry = {
  id: string;
  reportId: string;
  uiLang: UiLanguage;
  entryType: EvidenceEntryType;
  title: string;
  content: string;
  source: string;
  signalStrength: EvidenceSignalStrength;
  createdAt: string;
  updatedAt: string;
};

export type CreateValidationEvidenceInput = {
  reportId: string;
  uiLang: UiLanguage;
  entryType: EvidenceEntryType;
  title: string;
  content: string;
  source?: string;
  signalStrength?: EvidenceSignalStrength;
};

export type UpdateValidationEvidenceInput = {
  id: string;
  title?: string;
  content?: string;
  source?: string;
  signalStrength?: EvidenceSignalStrength;
};

export type ValidationRequestBody = {
  report: SavedMadixoReport;
  uiLang?: UiLanguage;
};

export function isUiLanguage(value: unknown): value is UiLanguage {
  return value === 'ar' || value === 'en';
}

export function normalizeUiLanguage(
  value: unknown,
  fallback: UiLanguage = 'en'
): UiLanguage {
  return isUiLanguage(value) ? value : fallback;
}

export function isValidationDecisionState(
  value: unknown
): value is ValidationDecisionState {
  return (
    value === 'undecided' ||
    value === 'continue' ||
    value === 'pivot' ||
    value === 'stop'
  );
}


export function isEvidenceEntryType(value: unknown): value is EvidenceEntryType {
  return (
    value === 'interview' ||
    value === 'objection' ||
    value === 'market_signal'
  );
}

export function normalizeEvidenceEntryType(
  value: unknown,
  fallback: EvidenceEntryType = 'market_signal'
): EvidenceEntryType {
  return isEvidenceEntryType(value) ? value : fallback;
}

export function isEvidenceSignalStrength(
  value: unknown
): value is EvidenceSignalStrength {
  return value === 'weak' || value === 'medium' || value === 'strong';
}

export function normalizeEvidenceSignalStrength(
  value: unknown,
  fallback: EvidenceSignalStrength = 'medium'
): EvidenceSignalStrength {
  return isEvidenceSignalStrength(value) ? value : fallback;
}

export function isEvidenceRecommendation(
  value: unknown
): value is EvidenceRecommendation {
  return value === 'continue' || value === 'pivot' || value === 'stop';
}

export function normalizeEvidenceRecommendation(
  value: unknown,
  fallback: EvidenceRecommendation = 'continue'
): EvidenceRecommendation {
  return isEvidenceRecommendation(value) ? value : fallback;
}

export function isEvidenceConfidence(
  value: unknown
): value is EvidenceConfidence {
  return value === 'low' || value === 'medium' || value === 'high';
}

export function normalizeEvidenceConfidence(
  value: unknown,
  fallback: EvidenceConfidence = 'medium'
): EvidenceConfidence {
  return isEvidenceConfidence(value) ? value : fallback;
}

function safeStringArray(value: unknown, maxItems = 6) {
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

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = safeText(value);
    if (text) {
      return text;
    }
  }

  return '';
}

function buildDefaultNextBestStep(uiLang: UiLanguage): EvidenceNextBestStep {
  return {
    title:
      uiLang === 'ar'
        ? 'الخطوة التالية المقترحة'
        : 'Recommended next step',
    goal:
      uiLang === 'ar'
        ? 'جمع دليل أوضح قبل اتخاذ قرار أكبر.'
        : 'Collect clearer evidence before making a bigger decision.',
    whyNow:
      uiLang === 'ar'
        ? 'الأدلة الحالية غير كافية بعد للحسم.'
        : 'The current evidence is not yet strong enough for a firm decision.',
    actions:
      uiLang === 'ar'
        ? ['أضف عدة ملاحظات سوق حقيقية أخرى ثم أعد التقييم.']
        : ['Add a few more real market notes, then review the decision again.'],
    successSignal:
      uiLang === 'ar'
        ? 'وجود نمط متكرر وواضح في الاستجابة.'
        : 'A repeated and clearly visible response pattern.',
    executionWindow: uiLang === 'ar' ? 'عدة أيام قصيرة' : 'A short few days',
  };
}

export function isIterationNextMove(value: unknown): value is IterationNextMove {
  return (
    value === 'continue_as_is' ||
    value === 'continue_with_changes' ||
    value === 'pivot_audience' ||
    value === 'pivot_offer' ||
    value === 'stop'
  );
}

export function normalizeIterationNextMove(
  value: unknown,
  fallback: IterationNextMove = 'continue_with_changes'
): IterationNextMove {
  return isIterationNextMove(value) ? value : fallback;
}

export function normalizeIterationEngineOutput(
  value: unknown
): IterationEngineOutput | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const obj = value as Record<string, unknown>;

  return {
    nextMove: normalizeIterationNextMove(obj.nextMove, 'continue_with_changes'),
    whyNow: safeText(obj.whyNow),
    whatToChange: safeStringArray(obj.whatToChange, 5),
    nextExperiment: safeText(obj.nextExperiment),
    updatedOffer: safeText(obj.updatedOffer),
    updatedOutreach: safeText(obj.updatedOutreach),
    successCriteria: safeStringArray(obj.successCriteria, 5),
  };
}

export function normalizeEvidenceSynthesis(
  value: unknown,
  uiLang: UiLanguage = 'en'
): EvidenceSynthesis | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const obj = value as Record<string, unknown>;
  const nextBestStepObj =
    typeof obj.nextBestStep === 'object' && obj.nextBestStep !== null
      ? (obj.nextBestStep as Record<string, unknown>)
      : null;

  const strongestSignals = safeStringArray(
    obj.strongestSignals,
    4
  );

  const validatedLearnings = safeStringArray(
    obj.validatedLearnings ?? obj.topDesires ?? obj.strongestSignals,
    4
  );

  const openQuestions = safeStringArray(
    obj.openQuestions ?? obj.topObjections,
    4
  );

  return {
    validatedLearnings,
    openQuestions,
    strongestSignals,
    recommendedDirection: normalizeEvidenceRecommendation(
      obj.recommendedDirection,
      'continue'
    ),
    reasoning: safeText(obj.reasoning),
    confidence: normalizeEvidenceConfidence(obj.confidence, 'medium'),
    nextBestStep: nextBestStepObj
      ? {
          title: firstNonEmpty(
            nextBestStepObj.title,
            uiLang === 'ar' ? 'الخطوة التالية المقترحة' : 'Recommended next step'
          ),
          goal: safeText(nextBestStepObj.goal),
          whyNow: safeText(nextBestStepObj.whyNow),
          actions: safeStringArray(nextBestStepObj.actions, 6),
          successSignal: safeText(nextBestStepObj.successSignal),
          executionWindow: firstNonEmpty(
            nextBestStepObj.executionWindow,
            uiLang === 'ar' ? 'عدة أيام قصيرة' : 'A short few days'
          ),
        }
      : buildDefaultNextBestStep(uiLang),
    topObjections: safeStringArray(obj.topObjections ?? obj.openQuestions, 4),
    topDesires: safeStringArray(
      obj.topDesires ?? obj.validatedLearnings ?? obj.strongestSignals,
      4
    ),
  };
}

export function normalizeValidationWorkspaceState(
  value: Partial<ValidationWorkspaceState> | null | undefined
): ValidationWorkspaceState {
  const completedChecklistIndexes = Array.isArray(value?.completedChecklistIndexes)
    ? Array.from(
        new Set(
          value.completedChecklistIndexes.filter((item): item is number =>
            Number.isInteger(item)
          )
        )
      ).sort((a, b) => a - b)
    : [];

  return {
    completedChecklistIndexes,
    notes: typeof value?.notes === 'string' ? value.notes : '',
    decisionState: isValidationDecisionState(value?.decisionState)
      ? value.decisionState
      : 'undecided',
  };
}

export function getPlanChecklist(plan: ValidationPlan) {
  const items = safeStringArray(plan.checklist, 8);
  return items.length ? items : safeStringArray(plan.checklist7Day, 8);
}

export function getPlanExecutionWindow(plan: ValidationPlan) {
  return firstNonEmpty(plan.executionWindow, '');
}

export function normalizeValidationPlan(
  value: unknown,
  uiLang: UiLanguage = 'en'
): ValidationPlan | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const obj = value as Record<string, unknown>;
  const firstValidationTest =
    typeof obj.firstValidationTest === 'object' && obj.firstValidationTest !== null
      ? (obj.firstValidationTest as Record<string, unknown>)
      : {};
  const firstOffer =
    typeof obj.firstOffer === 'object' && obj.firstOffer !== null
      ? (obj.firstOffer as Record<string, unknown>)
      : {};

  const checklist = safeStringArray(obj.checklist ?? obj.checklist7Day, 8);
  const continueSignals = safeStringArray(obj.continueSignals, 4);
  const pivotSignals = safeStringArray(obj.pivotSignals, 4);
  const stopSignals = safeStringArray(obj.stopSignals, 4);

  const validationFocus = firstNonEmpty(
    obj.validationFocus,
    obj.validationThesis,
    uiLang === 'ar' ? 'الفرضية الحالية' : 'Current validation focus'
  );

  const targetSegment = firstNonEmpty(
    obj.targetSegment,
    obj.idealFirstCustomer,
    uiLang === 'ar' ? 'العميل أو الشريحة الأولى' : 'First target segment'
  );

  const valueProposition = firstNonEmpty(
    obj.valueProposition,
    firstOffer.description,
    uiLang === 'ar' ? 'القيمة المقترحة' : 'Proposed value'
  );

  const outreachScript = firstNonEmpty(obj.outreachScript);
  const evidenceGoal = firstNonEmpty(
    obj.evidenceGoal,
    firstValidationTest.whyThisTest,
    uiLang === 'ar' ? 'تجميع دليل أوضح من السوق.' : 'Collect clearer evidence from the market.'
  );

  const executionWindow = firstNonEmpty(
    obj.executionWindow,
    uiLang === 'ar' ? 'عدة أيام قصيرة' : 'A short few days'
  );

  const interviewQuestions = safeStringArray(obj.interviewQuestions, 6);

  return {
    validationFocus,
    targetSegment,
    valueProposition,
    outreachChannels: safeStringArray(obj.outreachChannels, 6),
    outreachScript,
    evidenceGoal,
    executionWindow,
    checklist,
    successSignals: safeStringArray(obj.successSignals ?? obj.continueSignals, 4),
    continueSignals,
    pivotSignals,
    stopSignals,
    validationThesis: validationFocus,
    idealFirstCustomer: targetSegment,
    interviewQuestions,
    firstValidationTest: {
      title: firstNonEmpty(
        firstValidationTest.title,
        uiLang === 'ar' ? 'الخطوة الأولى' : 'First step'
      ),
      description: firstNonEmpty(
        firstValidationTest.description,
        checklist[0],
        uiLang === 'ar' ? 'ابدأ بخطوة عملية صغيرة.' : 'Start with one small practical step.'
      ),
      whyThisTest: evidenceGoal,
    },
    firstOffer: {
      title: firstNonEmpty(
        firstOffer.title,
        uiLang === 'ar' ? 'العرض الحالي' : 'Current offer'
      ),
      description: valueProposition,
      pricingIdea: firstNonEmpty(
        firstOffer.pricingIdea,
        uiLang === 'ar' ? 'اختبر درجة الالتزام المناسبة لهذا النوع من المشاريع.' : 'Test the right commitment level for this kind of project.'
      ),
    },
    checklist7Day: checklist,
  };
}
