import { createClient } from '@/lib/supabase/server';
import type {
  EvidenceSynthesis,
  IterationEngineOutput,
  SavedValidationPlan,
  UiLanguage,
  ValidationPlan,
  ValidationWorkspaceState,
  ValidationDecisionState,
} from '@/lib/madixo-validation';
import {
  normalizeEvidenceSynthesis,
  normalizeIterationEngineOutput,
  normalizeValidationPlan,
  normalizeValidationWorkspaceState,
  getPlanChecklist,
} from '@/lib/madixo-validation';
import {
  nextMoveLabel,
  sanitizeIterationEngineOutput,
  summarizeActionItems,
  summarizeLongText,
} from '@/lib/madixo-iteration-engine';
import {
  getReportLifecycleStatus,
  type ReportLifecycleStatus,
} from '@/lib/madixo-lifecycle-status';

type ValidationPlansRow = {
  id: string;
  user_id: string;
  report_id: string;
  ui_lang: UiLanguage;
  plan_json: unknown;
  notes: string;
  decision_state: ValidationDecisionState;
  completed_checklist_indexes: number[];
  evidence_summary_json: unknown | null;
  evidence_summary_updated_at: string | null;
  iteration_engine_json: unknown | null;
  iteration_engine_updated_at: string | null;
  iteration_count: number;
  final_decision_summary_json: unknown | null;
  final_decision_saved_at: string | null;
  created_at: string;
  updated_at: string;
};

async function getRequiredUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  return { supabase, user };
}

function uniqueNonEmptyItems(items: string[], maxItems = 6) {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter((item) => item.length > 0))
  ).slice(0, maxItems);
}

function compactText(value: string, maxLength = 220) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function compactItems(items: string[], maxItems = 6, maxLength = 110) {
  return uniqueNonEmptyItems(
    items.map((item) => compactText(item, maxLength)),
    maxItems
  );
}

function sanitizeValidationPlan(plan: ValidationPlan, uiLang: UiLanguage): ValidationPlan {
  const checklist = compactItems(getPlanChecklist(plan), 6, 110);
  const validationFocus = compactText(plan.validationFocus || plan.validationThesis, 220);
  const targetSegment = compactText(plan.targetSegment || plan.idealFirstCustomer, 180);
  const valueProposition = compactText(plan.valueProposition || plan.firstOffer.description, 180);
  const evidenceGoal = compactText(plan.evidenceGoal || plan.firstValidationTest.whyThisTest, 180);

  return {
    validationFocus,
    targetSegment,
    valueProposition,
    outreachChannels: compactItems(plan.outreachChannels, 6, 70),
    outreachScript: compactText(plan.outreachScript, 220),
    evidenceGoal,
    executionWindow: compactText(plan.executionWindow, 80),
    checklist,
    successSignals: compactItems(plan.successSignals, 4, 95),
    continueSignals: compactItems(plan.continueSignals, 4, 95),
    pivotSignals: compactItems(plan.pivotSignals, 4, 95),
    stopSignals: compactItems(plan.stopSignals, 4, 95),
    validationThesis: validationFocus,
    idealFirstCustomer: targetSegment,
    interviewQuestions: compactItems(plan.interviewQuestions, 6, 120),
    firstValidationTest: {
      title: compactText(plan.firstValidationTest.title, 90),
      description: compactText(plan.firstValidationTest.description, 140),
      whyThisTest: evidenceGoal,
    },
    firstOffer: {
      title: compactText(plan.firstOffer.title, 90),
      description: valueProposition,
      pricingIdea: compactText(plan.firstOffer.pricingIdea, 120),
    },
    checklist7Day: checklist,
  } satisfies ValidationPlan;
}

function mapRowToSavedValidationPlan(row: ValidationPlansRow): SavedValidationPlan {
  const normalizedPlan = normalizeValidationPlan(row.plan_json, row.ui_lang);
  const cleanPlan = sanitizeValidationPlan(
    normalizedPlan ||
      sanitizeValidationPlan(
        {
          validationFocus: row.ui_lang === 'ar' ? 'الفرضية الحالية' : 'Current validation focus',
          targetSegment: row.ui_lang === 'ar' ? 'الشريحة الأولى' : 'Initial segment',
          valueProposition: row.ui_lang === 'ar' ? 'القيمة الحالية' : 'Current value',
          outreachChannels: [],
          outreachScript: '',
          evidenceGoal: row.ui_lang === 'ar' ? 'جمع دليل أوضح.' : 'Collect clearer evidence.',
          executionWindow: row.ui_lang === 'ar' ? 'عدة أيام قصيرة' : 'A short few days',
          checklist: [],
          successSignals: [],
          continueSignals: [],
          pivotSignals: [],
          stopSignals: [],
          validationThesis: row.ui_lang === 'ar' ? 'الفرضية الحالية' : 'Current validation focus',
          idealFirstCustomer: row.ui_lang === 'ar' ? 'الشريحة الأولى' : 'Initial segment',
          interviewQuestions: [],
          firstValidationTest: {
            title: row.ui_lang === 'ar' ? 'الخطوة الأولى' : 'First step',
            description: '',
            whyThisTest: row.ui_lang === 'ar' ? 'جمع دليل أوضح.' : 'Collect clearer evidence.',
          },
          firstOffer: {
            title: row.ui_lang === 'ar' ? 'العرض الحالي' : 'Current offer',
            description: row.ui_lang === 'ar' ? 'القيمة الحالية' : 'Current value',
            pricingIdea:
              row.ui_lang === 'ar'
                ? 'اختبر درجة الالتزام المناسبة.'
                : 'Test the right commitment level.',
          },
          checklist7Day: [],
        },
        row.ui_lang
      ),
    row.ui_lang
  );
  const cleanIterationEngine = sanitizeIterationEngineOutput(
    normalizeIterationEngineOutput(row.iteration_engine_json)
  );

  return {
    id: row.id,
    reportId: row.report_id,
    uiLang: row.ui_lang,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    plan: cleanPlan,
    workspace: normalizeValidationWorkspaceState({
      completedChecklistIndexes: row.completed_checklist_indexes,
      notes: row.notes,
      decisionState: row.decision_state,
    }),
    evidenceSummary: normalizeEvidenceSynthesis(row.evidence_summary_json, row.ui_lang),
    evidenceSummaryUpdatedAt: row.evidence_summary_updated_at ?? null,
    iterationEngine: cleanIterationEngine,
    iterationEngineUpdatedAt: row.iteration_engine_updated_at ?? null,
  };
}

function buildAppliedChecklist(params: {
  uiLang: UiLanguage;
  iterationEngine: IterationEngineOutput;
}) {
  const { uiLang, iterationEngine } = params;
  const cleanIterationEngine = sanitizeIterationEngineOutput(iterationEngine) || iterationEngine;

  const items: string[] = [];
  const pushItem = (value: string) => {
    const compact = compactText(value, 100);
    if (!compact) return;
    if (items.includes(compact)) return;
    items.push(compact);
  };

  for (const item of summarizeActionItems(cleanIterationEngine.whatToChange, 2, 80)) {
    pushItem(item);
  }

  for (const step of summarizeActionItems([cleanIterationEngine.nextExperiment], 2, 90)) {
    pushItem(step);
  }

  const offerShort = summarizeLongText(cleanIterationEngine.updatedOffer, 100, 2);
  if (offerShort) {
    pushItem(
      uiLang === 'ar'
        ? `حدّث القيمة أو العرض: ${offerShort}`
        : `Update the value or offer: ${offerShort}`
    );
  }

  const outreachShort = summarizeLongText(cleanIterationEngine.updatedOutreach, 100, 2);
  if (outreachShort) {
    pushItem(
      uiLang === 'ar'
        ? `استخدم الرسالة المحدثة: ${outreachShort}`
        : `Use the updated outreach: ${outreachShort}`
    );
  }

  if (!items.length) {
    pushItem(
      uiLang === 'ar'
        ? 'نفّذ خطوة قصيرة جديدة واجمع ملاحظات سوق إضافية.'
        : 'Run one short new step and collect more market notes.'
    );
  }

  return items.slice(0, 6);
}

function buildAppliedNotes(params: {
  uiLang: UiLanguage;
  currentNotes: string;
  iterationEngine: IterationEngineOutput;
}) {
  const { uiLang, currentNotes, iterationEngine } = params;
  const localizedMove = nextMoveLabel(iterationEngine.nextMove, uiLang);
  const prefix =
    uiLang === 'ar'
      ? `تم تحديث الخطة الحالية بناءً على: ${localizedMove}`
      : `The current plan was updated based on: ${localizedMove}`;

  return [currentNotes.trim(), prefix, compactText(iterationEngine.whyNow, 180)]
    .filter((item) => item.trim().length > 0)
    .join('\n\n')
    .trim();
}

function buildAppliedPlan(params: {
  uiLang: UiLanguage;
  plan: ValidationPlan;
  iterationEngine: IterationEngineOutput;
}) {
  const { uiLang, plan, iterationEngine } = params;
  const cleanIterationEngine = sanitizeIterationEngineOutput(iterationEngine) || iterationEngine;
  const updatedChecklist = buildAppliedChecklist({ uiLang, iterationEngine: cleanIterationEngine });
  const updatedValue = summarizeLongText(cleanIterationEngine.updatedOffer, 170, 2);

  return sanitizeValidationPlan(
    {
      ...plan,
      valueProposition: updatedValue || plan.valueProposition,
      outreachScript:
        summarizeLongText(cleanIterationEngine.updatedOutreach, 190, 2) || plan.outreachScript,
      evidenceGoal: summarizeLongText(cleanIterationEngine.whyNow, 180, 2) || plan.evidenceGoal,
      executionWindow: plan.executionWindow || (uiLang === 'ar' ? 'عدة أيام قصيرة' : 'A short few days'),
      checklist: updatedChecklist,
      successSignals:
        summarizeActionItems(cleanIterationEngine.successCriteria, 3, 90) || plan.successSignals,
      validationThesis: plan.validationFocus,
      idealFirstCustomer: plan.targetSegment,
      firstValidationTest: {
        title: uiLang === 'ar' ? 'الخطوة الحالية' : 'Current step',
        description: summarizeLongText(cleanIterationEngine.nextExperiment, 150, 2) || plan.firstValidationTest.description,
        whyThisTest: summarizeLongText(cleanIterationEngine.whyNow, 180, 2) || plan.firstValidationTest.whyThisTest,
      },
      firstOffer: {
        ...plan.firstOffer,
        description: updatedValue || plan.firstOffer.description,
      },
    },
    uiLang
  );
}

export async function getUserValidationPlan(
  reportId: string,
  uiLang: UiLanguage
): Promise<SavedValidationPlan | null> {
  const { supabase, user } = await getRequiredUser();

  const { data, error } = await supabase
    .from('validation_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('report_id', reportId)
    .eq('ui_lang', uiLang)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}

export async function saveUserValidationPlan(params: {
  reportId: string;
  uiLang: UiLanguage;
  plan: ValidationPlan;
}): Promise<SavedValidationPlan> {
  const { supabase, user } = await getRequiredUser();

  const payload = {
    user_id: user.id,
    report_id: params.reportId,
    ui_lang: params.uiLang,
    plan_json: sanitizeValidationPlan(params.plan, params.uiLang),
  };

  const { data, error } = await supabase
    .from('validation_plans')
    .upsert(payload, {
      onConflict: 'user_id,report_id,ui_lang',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save validation plan.');
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}

export async function saveUserValidationWorkspace(params: {
  reportId: string;
  uiLang: UiLanguage;
  workspace: ValidationWorkspaceState;
}): Promise<SavedValidationPlan> {
  const { supabase, user } = await getRequiredUser();

  const normalized = normalizeValidationWorkspaceState(params.workspace);

  const { data, error } = await supabase
    .from('validation_plans')
    .update({
      notes: normalized.notes,
      decision_state: normalized.decisionState,
      completed_checklist_indexes: normalized.completedChecklistIndexes,
    })
    .eq('user_id', user.id)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save validation workspace.');
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}

export async function saveUserEvidenceSynthesis(params: {
  reportId: string;
  uiLang: UiLanguage;
  synthesis: EvidenceSynthesis;
}): Promise<SavedValidationPlan> {
  const { supabase, user } = await getRequiredUser();

  const { data, error } = await supabase
    .from('validation_plans')
    .update({
      evidence_summary_json: params.synthesis,
      evidence_summary_updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save evidence synthesis.');
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}

export async function saveUserIterationEngine(params: {
  reportId: string;
  uiLang: UiLanguage;
  iterationEngine: IterationEngineOutput;
}): Promise<SavedValidationPlan> {
  const { supabase, user } = await getRequiredUser();
  const cleanIterationEngine = sanitizeIterationEngineOutput(params.iterationEngine) || params.iterationEngine;

  const { data, error } = await supabase
    .from('validation_plans')
    .update({
      iteration_engine_json: cleanIterationEngine,
      iteration_engine_updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to save the iteration engine output.');
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}

export async function applyUserIterationEngine(params: {
  reportId: string;
  uiLang: UiLanguage;
}): Promise<SavedValidationPlan> {
  const { supabase, user } = await getRequiredUser();

  const { data: existing, error: readError } = await supabase
    .from('validation_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (!existing) {
    throw new Error('VALIDATION_PLAN_NOT_FOUND');
  }

  const savedPlan = mapRowToSavedValidationPlan(existing as ValidationPlansRow);

  if (!savedPlan.iterationEngine) {
    throw new Error('ITERATION_ENGINE_NOT_FOUND');
  }

  const appliedPlan = buildAppliedPlan({
    uiLang: params.uiLang,
    plan: savedPlan.plan,
    iterationEngine: savedPlan.iterationEngine,
  });

  const appliedNotes = buildAppliedNotes({
    uiLang: params.uiLang,
    currentNotes: savedPlan.workspace.notes,
    iterationEngine: savedPlan.iterationEngine,
  });

  const { data, error } = await supabase
    .from('validation_plans')
    .update({
      plan_json: appliedPlan,
      notes: appliedNotes,
      decision_state: 'undecided',
      completed_checklist_indexes: [],
      evidence_summary_json: null,
      evidence_summary_updated_at: null,
      iteration_engine_json: null,
      iteration_engine_updated_at: null,
      final_decision_summary_json: null,
      final_decision_saved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('report_id', params.reportId)
    .eq('ui_lang', params.uiLang)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to apply the current step.');
  }

  return mapRowToSavedValidationPlan(data as ValidationPlansRow);
}


export async function getUserValidationPlanLookup(
  reportIds: string[],
  uiLang: UiLanguage
): Promise<Record<string, SavedValidationPlan>> {
  const cleanIds = Array.from(
    new Set(reportIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

  if (!cleanIds.length) {
    return {};
  }

  const { supabase, user } = await getRequiredUser();

  const { data, error } = await supabase
    .from('validation_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('ui_lang', uiLang)
    .in('report_id', cleanIds);

  if (error) {
    throw new Error(error.message);
  }

  const lookup: Record<string, SavedValidationPlan> = {};

  for (const row of (data || []) as ValidationPlansRow[]) {
    lookup[row.report_id] = mapRowToSavedValidationPlan(row);
  }

  return lookup;
}

export async function getUserValidationStatusMap(
  reportIds: string[],
  uiLang: UiLanguage
): Promise<Record<string, ReportLifecycleStatus>> {
  const cleanIds = Array.from(
    new Set(reportIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

  if (!cleanIds.length) {
    return {};
  }

  const plansByReportId = await getUserValidationPlanLookup(cleanIds, uiLang);
  const statusMap: Record<string, ReportLifecycleStatus> = {};

  for (const reportId of cleanIds) {
    const plan = plansByReportId[reportId];

    statusMap[reportId] = getReportLifecycleStatus({
      hasValidationPlan: Boolean(plan),
      hasEvidenceSummary: Boolean(plan?.evidenceSummary),
      hasDecisionState:
        Boolean(plan?.workspace?.decisionState) &&
        plan?.workspace?.decisionState !== 'undecided',
      hasIterationEngine: Boolean(plan?.iterationEngine),
    });
  }

  return statusMap;
}
