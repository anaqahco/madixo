'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import SiteHeader from '@/components/site-header';
import MixedText from '@/components/mixed-text';
import ValidationEvidenceSection from '@/components/validation-evidence-section';
import ValidationEvidenceSynthesis from '@/components/validation-evidence-synthesis';
import ValidationIterationEngine from '@/components/validation-iteration-engine';
import type { SavedMadixoReport } from '@/lib/madixo-reports';
import {
  type EvidenceSynthesis,
  type UiLanguage,
  type ValidationEvidenceEntry,
  type ValidationPlan,
  type ValidationWorkspaceState,
  normalizeEvidenceSynthesis,
  normalizeValidationPlan,
  normalizeValidationWorkspaceState,
  getPlanChecklist,
} from '@/lib/madixo-validation';
import { getClientUiLanguage, setClientUiLanguage } from '@/lib/ui-language';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

type Props = {
  report: SavedMadixoReport;
  initialUiLang: UiLanguage;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type ExportState = 'idle' | 'loading';

type AppliedStepNotice = {
  title: string;
  summary: string;
  changes: string[];
  nextAction: string;
  planSummaryTitle: string;
  planSummaryItems: string[];
  createdAt: number;
};

type NoticeSnapshotSource = {
  plan: ValidationPlan;
  workspace: ValidationWorkspaceState;
};

type LocalValidationSnapshot = {
  savedAt: string;
  plan: ValidationPlan;
  workspace: ValidationWorkspaceState;
  source: 'saved' | 'generated';
  evidenceEntries: ValidationEvidenceEntry[];
  evidenceSynthesis: EvidenceSynthesis | null;
};

function getValidationSnapshotKey(reportId: string, uiLang: UiLanguage) {
  return `madixo_validation_snapshot_v1:${reportId}:${uiLang}`;
}

function readLocalValidationSnapshot(
  reportId: string,
  uiLang: UiLanguage
): LocalValidationSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
      getValidationSnapshotKey(reportId, uiLang)
    );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      savedAt?: unknown;
      plan?: unknown;
      workspace?: unknown;
      source?: unknown;
      evidenceEntries?: unknown;
      evidenceSynthesis?: unknown;
    };

    const plan = normalizeValidationPlan(parsed.plan, uiLang);

    if (!plan) {
      return null;
    }

    const evidenceEntries = Array.isArray(parsed.evidenceEntries)
      ? parsed.evidenceEntries.filter(
          (entry): entry is ValidationEvidenceEntry =>
            Boolean(
              entry &&
                typeof entry === 'object' &&
                typeof (entry as ValidationEvidenceEntry).id === 'string' &&
                typeof (entry as ValidationEvidenceEntry).title === 'string' &&
                typeof (entry as ValidationEvidenceEntry).content === 'string'
            )
        )
      : [];

    return {
      savedAt:
        typeof parsed.savedAt === 'string'
          ? parsed.savedAt
          : new Date().toISOString(),
      plan,
      workspace:
        parsed.workspace && typeof parsed.workspace === 'object'
          ? normalizeValidationWorkspaceState(
              parsed.workspace as Partial<ValidationWorkspaceState>
            )
          : normalizeValidationWorkspaceState(undefined),
      source: parsed.source === 'saved' ? 'saved' : 'generated',
      evidenceEntries,
      evidenceSynthesis: normalizeEvidenceSynthesis(
        parsed.evidenceSynthesis,
        uiLang
      ),
    };
  } catch {
    return null;
  }
}

function writeLocalValidationSnapshot(params: {
  reportId: string;
  uiLang: UiLanguage;
  snapshot: LocalValidationSnapshot;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    getValidationSnapshotKey(params.reportId, params.uiLang),
    JSON.stringify(params.snapshot)
  );
}

const UI_COPY = {
  en: {
    dir: 'ltr',
    eyebrow: 'Validation Workspace',
    title: 'Turn this report into evidence',
    description:
      'Use one clear workspace: collect market notes, see what is becoming clear, understand what is still uncertain, then run the best step now.',
    loading: 'Building validation workspace',
    failed: 'Failed to load the validation workspace.',
    regenerate: 'Refresh Workspace',
    exportPdf: 'Export Validation PDF',
    exportingPdf: 'Exporting PDF...',
    sourceSaved: 'Saved workspace',
    sourceGenerated: 'New workspace',
    opportunitySummary: 'Opportunity Summary',
    score: 'Opportunity score',
    validationFocus: 'Current validation focus',
    targetSegment: 'Current target segment',
    valueProposition: 'Current value',
    evidenceGoal: 'Evidence goal',
    executionWindow: 'Suggested window',
    outreachChannels: 'Suggested channels',
    outreachScript: 'Simple outreach script',
    planChecklist: 'What to do now',
    continueSignals: 'Continue signals',
    pivotSignals: 'Pivot signals',
    stopSignals: 'Stop signals',
    currentDecision: 'Your current decision now',
    notesTitle: 'Your current notes',
    notesDescription:
      'Use this space for short founder notes. Save only what matters now.',
    notesPlaceholder:
      'Write short notes about what you are seeing now, what surprised you, or what you want to remember before the next step.',
    saveWorkspace: 'Save now',
    savingWorkspace: 'Saving...',
    workspaceSaved: 'Saved',
    workspaceFailed: 'Failed to save the current decision and notes.',
    autoSaveHint:
      'Your current decision and notes are saved automatically after any change.',
    autoSaveIdle: 'No unsaved changes',
    autoSavePending: 'Changes pending',
    autoSaveSaving: 'Saving automatically...',
    autoSaveSaved: 'Saved automatically',
    undecided: 'Undecided',
    continueOption: 'Continue',
    pivotOption: 'Adjust',
    stopOption: 'Stop',
    noChannels: 'No suggested channels yet.',
    noChecklist: 'No action list yet.',
    noSignals: 'No signals yet.',
    flowProgress: 'Flow progress',
    step1: '1. Save market notes',
    step2: '2. Generate the decision view',
    step3: '3. Update your current decision',
    step4: '4. Run the best step now',
    loadingLead:
      'The first validation workspace can take up to 90 seconds to prepare.',
    loadingCountdown: 'Estimated time left',
    loadingReadySoon: 'We are preparing the report, evidence flow, and the first working plan now.',

    appliedBannerTitle: 'The current plan was updated',
    appliedBannerSummary:
      'The previous step was applied successfully. Here is what changed now.',
    appliedChange1:
      'The active plan/checklist was updated based on the applied step.',
    appliedChange2:
      'The current decision was reset so you can evaluate the next evidence calmly.',
    appliedChange3:
      'The old decision view was cleared because you now need fresh market notes before building a new one.',
    appliedChange4:
      'The previous “best step now” is no longer active until you update the decision view again.',
    appliedNextAction:
      'Now run the updated plan, collect new market notes, rebuild the decision view, then generate the best step now again.',
    dismissNotice: 'Hide',
    changedNowTitle: 'What changed now',
    nextActionTitle: 'What to do now',
    planSummaryTitle: 'Your updated plan now',
    focusLabel: 'Current focus',
    valueLabel: 'Current value',
    goalLabel: 'Evidence goal',
    doNowLabel: 'Do now',

    nextClickTitle: 'Where to go now',
    nextClickDescription:
      'After applying the plan, start here in order: market notes first, then the decision view.',
    goToEvidence: 'Go to market notes',
    goToDecisionView: 'Go to decision view',
    pathStep1: 'Collect a new market note',
    pathStep2: 'Rebuild the decision view',
    pathStep3: 'Generate the best step now',
    quickNavTitle: 'Quick navigation',
    quickNavDescription:
      'Jump to the part you need now without scrolling through the full page.',
    navSummary: 'Summary',
    navChannels: 'Channels',
    navChecklist: 'Action list',
    navEvidence: 'Market notes',
    navDecisionView: 'Decision view',
    navCurrentDecision: 'Current decision',
    navBestStep: 'Best step now',
    mobileBarPrimary: 'Go to market notes',
    mobileBarSecondary: 'Decision view',
    mobileBarTertiary: 'Best step now',
  },
  ar: {
    dir: 'rtl',
    eyebrow: 'مساحة التحقق',
    title: 'حوّل هذا التقرير إلى أدلة',
    description:
      'استخدم مساحة واحدة واضحة: اجمع ملاحظات السوق، شاهد ما أصبح واضحًا، افهم ما ما زال غير مؤكد، ثم نفّذ أفضل خطوة الآن.',
    loading: 'جار تجهيز مساحة التحقق',
    failed: 'فشل تحميل مساحة التحقق.',
    regenerate: 'تحديث مساحة التحقق',
    exportPdf: 'تصدير PDF للتحقق',
    exportingPdf: 'جار تصدير PDF...',
    sourceSaved: 'مساحة محفوظة',
    sourceGenerated: 'مساحة جديدة',
    opportunitySummary: 'خلاصة الفرصة',
    score: 'درجة الفرصة',
    validationFocus: 'تركيز التحقق الحالي',
    targetSegment: 'الشريحة المستهدفة الآن',
    valueProposition: 'القيمة الحالية',
    evidenceGoal: 'هدف الدليل',
    executionWindow: 'الإطار الزمني المقترح',
    outreachChannels: 'القنوات المقترحة',
    outreachScript: 'رسالة وصول بسيطة',
    planChecklist: 'ماذا تفعل الآن',
    continueSignals: 'إشارات الاستمرار',
    pivotSignals: 'إشارات التعديل',
    stopSignals: 'إشارات الإيقاف',
    currentDecision: 'قرارك الحالي الآن',
    notesTitle: 'ملاحظاتك الحالية',
    notesDescription:
      'استخدم هذه المساحة لملاحظات المؤسس القصيرة. احفظ فقط ما يهم الآن.',
    notesPlaceholder:
      'اكتب ملاحظات قصيرة عمّا تراه الآن، وما الذي فاجأك، أو ما الذي تريد تذكره قبل الخطوة التالية.',
    saveWorkspace: 'حفظ الآن',
    savingWorkspace: 'جار الحفظ...',
    workspaceSaved: 'تم الحفظ',
    workspaceFailed: 'فشل حفظ القرار الحالي والملاحظات.',
    autoSaveHint:
      'يتم حفظ القرار الحالي والملاحظات تلقائيًا بعد أي تعديل.',
    autoSaveIdle: 'لا توجد تغييرات غير محفوظة',
    autoSavePending: 'توجد تغييرات بانتظار الحفظ',
    autoSaveSaving: 'جار الحفظ تلقائيًا...',
    autoSaveSaved: 'تم الحفظ تلقائيًا',
    undecided: 'غير محسوم',
    continueOption: 'استمر',
    pivotOption: 'عدّل',
    stopOption: 'أوقف',
    noChannels: 'لا توجد قنوات مقترحة بعد.',
    noChecklist: 'لا توجد قائمة تنفيذ بعد.',
    noSignals: 'لا توجد إشارات بعد.',
    flowProgress: 'تقدم المسار',
    step1: '1. احفظ ملاحظات السوق',
    step2: '2. أنشئ رؤية القرار',
    step3: '3. حدّث قرارك الحالي',
    step4: '4. نفّذ أفضل خطوة الآن',
    loadingLead:
      'قد يستغرق تجهيز أول مساحة تحقق حتى 90 ثانية.',
    loadingCountdown: 'الوقت المتبقي التقريبي',
    loadingReadySoon: 'يتم الآن تجهيز التقرير، ومسار الأدلة، والخطة الأولى القابلة للعمل.',

    appliedBannerTitle: 'تم تحديث الخطة الحالية',
    appliedBannerSummary:
      'تم تطبيق الخطوة السابقة بنجاح. هذا ما تغيّر الآن بوضوح:',
    appliedChange1:
      'تم تحديث الخطة الحالية وقائمة التنفيذ بناءً على الخطوة التي طبّقتها.',
    appliedChange2:
      'تمت إعادة القرار الحالي إلى "غير محسوم" حتى تقيّم الأدلة القادمة بهدوء.',
    appliedChange3:
      'تمت إزالة رؤية القرار السابقة لأنك تحتاج الآن إلى ملاحظات سوق جديدة قبل بناء رؤية جديدة.',
    appliedChange4:
      'أفضل خطوة الآن السابقة لم تعد نشطة، ولن تظهر خطوة جديدة حتى تحدّث رؤية القرار مرة أخرى.',
    appliedNextAction:
      'الآن نفّذ الخطة المحدّثة، ثم اجمع ملاحظات سوق جديدة، ثم حدّث رؤية القرار، ثم أنشئ أفضل خطوة الآن من جديد.',
    dismissNotice: 'إخفاء',
    changedNowTitle: 'ما الذي تغيّر الآن',
    nextActionTitle: 'ماذا تفعل الآن',
    planSummaryTitle: 'الخطة الحالية الآن',
    focusLabel: 'التركيز الحالي',
    valueLabel: 'القيمة الحالية',
    goalLabel: 'هدف الدليل',
    doNowLabel: 'افعل الآن',

    nextClickTitle: 'إلى أين تذهب الآن',
    nextClickDescription:
      'بعد تطبيق الخطة، ابدأ من هنا بهذا الترتيب: ملاحظات السوق أولًا، ثم رؤية القرار.',
    goToEvidence: 'اذهب إلى ملاحظات السوق',
    goToDecisionView: 'اذهب إلى رؤية القرار',
    pathStep1: 'أضف ملاحظة سوق جديدة',
    pathStep2: 'حدّث رؤية القرار',
    pathStep3: 'أنشئ أفضل خطوة الآن',
    quickNavTitle: 'تنقل سريع',
    quickNavDescription:
      'انتقل مباشرة إلى الجزء الذي تحتاجه الآن بدون نزول طويل داخل الصفحة.',
    navSummary: 'الخلاصة',
    navChannels: 'القنوات',
    navChecklist: 'قائمة التنفيذ',
    navEvidence: 'ملاحظات السوق',
    navDecisionView: 'رؤية القرار',
    navCurrentDecision: 'القرار الحالي',
    navBestStep: 'أفضل خطوة الآن',
    mobileBarPrimary: 'اذهب إلى ملاحظات السوق',
    mobileBarSecondary: 'رؤية القرار',
    mobileBarTertiary: 'أفضل خطوة الآن',
  },
} as const;

function MadixoLogo() {
  return (
    <Image
      src="/brand/madixo-logo.png"
      alt="Madixo"
      width={210}
      height={54}
      priority
      className="h-auto w-[175px] md:w-[210px]"
    />
  );
}

function getSafePdfFileName(report: SavedMadixoReport) {
  const candidate =
    [report.query, report.result?.query]
      .find(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0
      )
      ?.trim() || 'madixo-validation';

  const cleaned = candidate.replace(/[^\p{L}\p{N}\-\s]/gu, '').trim();
  return cleaned || 'madixo-validation';
}

function getCurrentStep(params: {
  entriesCount: number;
  hasDecisionView: boolean;
  decisionState: ValidationWorkspaceState['decisionState'];
}) {
  if (params.entriesCount <= 0) return 1;
  if (!params.hasDecisionView) return 2;
  if (params.decisionState === 'undecided') return 3;
  return 4;
}

function getStepCounterLabel(
  currentStep: number,
  totalSteps: number,
  uiLang: UiLanguage
) {
  return uiLang === 'ar'
    ? `الخطوة ${currentStep} من ${totalSteps}`
    : `Step ${currentStep} of ${totalSteps}`;
}

function serializeWorkspaceState(workspace: ValidationWorkspaceState) {
  return JSON.stringify({
    decisionState: workspace.decisionState,
    notes: workspace.notes,
  });
}

function compactText(value: string, maxLength = 140) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function uniqueItems(items: string[], maxItems = 4) {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter((item) => item.length > 0))
  ).slice(0, maxItems);
}

function buildAppliedNoticeFromSnapshot(
  snapshot: NoticeSnapshotSource,
  uiLang: UiLanguage
): AppliedStepNotice {
  const copy = UI_COPY[uiLang];
  const checklist = uniqueItems(getPlanChecklist(snapshot.plan), 3);

  const planSummaryItems = [
    `${copy.focusLabel}: ${compactText(snapshot.plan.validationFocus, 110)}`,
    `${copy.valueLabel}: ${compactText(snapshot.plan.valueProposition, 110)}`,
    `${copy.goalLabel}: ${compactText(snapshot.plan.evidenceGoal, 110)}`,
    ...checklist.map(
      (item) => `${copy.doNowLabel}: ${compactText(item, 95)}`
    ),
  ].slice(0, 5);

  return {
    title: copy.appliedBannerTitle,
    summary: copy.appliedBannerSummary,
    changes: [
      copy.appliedChange1,
      copy.appliedChange2,
      copy.appliedChange3,
      copy.appliedChange4,
    ],
    nextAction: copy.appliedNextAction,
    planSummaryTitle: copy.planSummaryTitle,
    planSummaryItems,
    createdAt: Date.now(),
  };
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5 md:p-6">
      <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
      <div className="mt-4 text-[#4B5563]">{children}</div>
    </section>
  );
}

function BulletList({
  items,
}: {
  items?: string[] | null;
}) {
  const safeItems = Array.isArray(items)
    ? items.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      )
    : [];

  return (
    <ul className="space-y-3">
      {safeItems.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 24)}`}
          className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#374151]"
        >
          <MixedText as="span" text={item} />
        </li>
      ))}
    </ul>
  );
}

function DecisionPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition sm:w-auto ${
        active
          ? 'border-[#111827] bg-[#111827] text-white'
          : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
      }`}
    >
      {label}
    </button>
  );
}

function SaveStateBadge({
  uiLang,
  saveState,
  hasPendingChanges,
}: {
  uiLang: UiLanguage;
  saveState: SaveState;
  hasPendingChanges: boolean;
}) {
  const copy = UI_COPY[uiLang];

  if (saveState === 'saving') {
    return (
      <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
        {copy.autoSaveSaving}
      </span>
    );
  }

  if (saveState === 'saved') {
    return (
      <span className="rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-2 text-sm font-semibold text-[#027A48]">
        {copy.autoSaveSaved}
      </span>
    );
  }

  if (saveState === 'error') {
    return (
      <span className="rounded-full border border-[#FECDCA] bg-[#FEF3F2] px-4 py-2 text-sm font-semibold text-[#B42318]">
        {copy.workspaceFailed}
      </span>
    );
  }

  if (hasPendingChanges) {
    return (
      <span className="rounded-full border border-[#FEDF89] bg-[#FFFAEB] px-4 py-2 text-sm font-semibold text-[#B54708]">
        {copy.autoSavePending}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#374151]">
      {copy.autoSaveIdle}
    </span>
  );
}

function AppliedPlanNotice({
  uiLang,
  notice,
  onDismiss,
  onGoToEvidence,
  onGoToDecisionView,
}: {
  uiLang: UiLanguage;
  notice: AppliedStepNotice;
  onDismiss: () => void;
  onGoToEvidence: () => void;
  onGoToDecisionView: () => void;
}) {
  const copy = UI_COPY[uiLang];

  return (
    <section className="rounded-[28px] border border-[#ABEFC6] bg-[#ECFDF3] p-4 shadow-sm sm:p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#05603A]">{notice.title}</h2>
          <p className="mt-2 text-sm leading-7 text-[#067647]">
            {notice.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#ABEFC6] bg-white px-4 py-2 text-sm font-semibold text-[#05603A]"
        >
          {copy.dismissNotice}
        </button>
      </div>

      <div className="mt-5 rounded-[22px] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#111827]">
          {copy.nextClickTitle}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#4B5563]">
          {copy.nextClickDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
            1. {copy.pathStep1}
          </span>
          <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
            2. {copy.pathStep2}
          </span>
          <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
            3. {copy.pathStep3}
          </span>
        </div>

        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={onGoToEvidence}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white sm:w-auto"
          >
            {copy.goToEvidence}
          </button>

          <button
            type="button"
            onClick={onGoToDecisionView}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#111827] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] sm:w-auto"
          >
            {copy.goToDecisionView}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
        <div className="rounded-[22px] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#111827]">
            {copy.changedNowTitle}
          </h3>
          <ul className="mt-4 space-y-3">
            {notice.changes.map((item, index) => (
              <li
                key={`${index}-${item.slice(0, 20)}`}
                className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#374151]"
              >
                <MixedText as="span" text={item} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#111827]">
            {notice.planSummaryTitle}
          </h3>
          <ul className="mt-4 space-y-3">
            {notice.planSummaryItems.map((item, index) => (
              <li
                key={`${index}-${item.slice(0, 20)}`}
                className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#374151]"
              >
                <MixedText as="span" text={item} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#111827]">
            {copy.nextActionTitle}
          </h3>
          <div className="mt-4 rounded-2xl bg-[#F9FAFB] px-4 py-4 text-sm leading-7 text-[#374151]">
            <MixedText as="p" text={notice.nextAction} />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickNavCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{
    label: string;
    onClick: () => void;
  }>;
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5 md:p-6 lg:hidden">
      <h2 className="text-base font-bold text-[#111827]">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#374151]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}


async function getBrowserAccessToken(timeoutMs = 1800) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const supabase = createBrowserSupabaseClient();
    const sessionResult = (await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('AUTH_SESSION_TIMEOUT')), timeoutMs);
      }),
    ])) as {
      data?: {
        session?: {
          access_token?: string | null;
        } | null;
      };
    };

    return sessionResult?.data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function buildRequestHeaders(contentType = true) {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }

  const accessToken = await getBrowserAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function fetchJsonWithTimeout<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<{ response: Response; payload: T }> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    const payload = (await response.json()) as T;
    return { response, payload };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('VALIDATION_FETCH_TIMEOUT');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function shouldRetryValidationRequest(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return /auth session missing|failed to fetch|network|timeout|timed out|temporary|502|503|504|try again|validation_fetch_timeout|جار تجهيز|استغرق تجهيز مساحة التحقق/i.test(
    message.toLowerCase()
  );
}

function waitForValidationRetry(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchEvidenceEntries(reportId: string, uiLang: UiLanguage) {
  const response = await fetch(
    `/api/evidence?reportId=${encodeURIComponent(reportId)}&uiLang=${uiLang}`,
    {
      cache: 'no-store',
      headers: await buildRequestHeaders(false),
    }
  );

  const payload = (await response.json()) as {
    ok?: boolean;
    error?: string;
    entries?: ValidationEvidenceEntry[];
  };

  if (!response.ok || !payload.ok || !Array.isArray(payload.entries)) {
    throw new Error(payload.error || 'Failed to load evidence entries.');
  }

  return payload.entries;
}

async function fetchSavedSynthesis(reportId: string, uiLang: UiLanguage) {
  const params = new URLSearchParams({ reportId, uiLang });
  const response = await fetch(`/api/evidence-synthesis?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: await buildRequestHeaders(false),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    synthesis?: unknown;
  };

  if (!response.ok || !payload.ok) {
    throw new Error('Failed to load the decision view.');
  }

  return normalizeEvidenceSynthesis(payload.synthesis, uiLang);
}

export default function ValidationModeClient({
  report,
  initialUiLang,
}: Props) {
  const [uiLang, setUiLang] = useState<UiLanguage>(initialUiLang);
  const [state, setState] = useState<LoadState>('idle');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [error, setError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');
  const [plan, setPlan] = useState<ValidationPlan | null>(null);
  const [workspace, setWorkspace] = useState<ValidationWorkspaceState>(
    normalizeValidationWorkspaceState(undefined)
  );
  const [planSource, setPlanSource] = useState<'saved' | 'generated' | null>(
    null
  );
  const [evidenceEntries, setEvidenceEntries] = useState<
    ValidationEvidenceEntry[]
  >([]);
  const [evidenceSynthesis, setEvidenceSynthesis] =
    useState<EvidenceSynthesis | null>(null);
  const [iterationRefreshToken, setIterationRefreshToken] = useState(0);
  const [appliedNotice, setAppliedNotice] = useState<AppliedStepNotice | null>(
    null
  );
  const [loadingCountdownSeconds, setLoadingCountdownSeconds] = useState(90);
  const [loadingProgressPercent, setLoadingProgressPercent] = useState(4);

  const autoSaveTimeoutRef = useRef<number | null>(null);
  const lastSavedWorkspaceRef = useRef<string>(
    serializeWorkspaceState(normalizeValidationWorkspaceState(undefined))
  );
  const appliedNoticeRef = useRef<HTMLDivElement | null>(null);
  const summarySectionRef = useRef<HTMLDivElement | null>(null);
  const channelsSectionRef = useRef<HTMLDivElement | null>(null);
  const checklistSectionRef = useRef<HTMLDivElement | null>(null);
  const evidenceSectionRef = useRef<HTMLDivElement | null>(null);
  const synthesisSectionRef = useRef<HTMLDivElement | null>(null);
  const decisionSectionRef = useRef<HTMLDivElement | null>(null);
  const iterationSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUiLang(getClientUiLanguage(initialUiLang));
  }, [initialUiLang]);

  useEffect(() => {
    if (appliedNotice && appliedNoticeRef.current) {
      appliedNoticeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [appliedNotice]);

  useEffect(() => {
    if (state !== 'loading' || plan) {
      setLoadingCountdownSeconds(90);
      setLoadingProgressPercent(4);
      return;
    }

    const totalDurationMs = 90000;
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remainingSeconds = Math.max(
        0,
        Math.ceil((totalDurationMs - elapsed) / 1000)
      );
      const ratio = Math.min(elapsed / totalDurationMs, 1);
      const nextProgress = Math.min(
        95,
        Math.max(4, Math.round(4 + (95 - 4) * ratio))
      );

      setLoadingCountdownSeconds(remainingSeconds);
      setLoadingProgressPercent(nextProgress);
    }, 250);

    return () => window.clearInterval(interval);
  }, [state, plan]);

  const copy = UI_COPY[uiLang];
  const serializedWorkspace = serializeWorkspaceState(workspace);
  const hasPendingWorkspaceChanges =
    serializedWorkspace !== lastSavedWorkspaceRef.current;

  const saveWorkspaceRequest = async (
    nextWorkspace: ValidationWorkspaceState
  ) => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch('/api/validation-workspace', {
          method: 'POST',
          headers: await buildRequestHeaders(),
          body: JSON.stringify({
            reportId: report.id,
            uiLang,
            workspace: nextWorkspace,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          workspace?: ValidationWorkspaceState;
        };

        if (!response.ok || !payload.ok || !payload.workspace) {
          throw new Error(payload.error || copy.workspaceFailed);
        }

        return normalizeValidationWorkspaceState(payload.workspace);
      } catch (error) {
        lastError = error;

        if (attempt < 2 && shouldRetryValidationRequest(error)) {
          await waitForValidationRetry(800);
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(copy.workspaceFailed);
  };

  const commitWorkspaceSave = async (mode: 'auto' | 'manual') => {
    const currentSerialized = serializeWorkspaceState(workspace);

    if (mode === 'auto' && currentSerialized === lastSavedWorkspaceRef.current) {
      return;
    }

    try {
      setSaveState('saving');
      setWorkspaceError('');

      const savedWorkspace = await saveWorkspaceRequest(workspace);
      const savedSerialized = serializeWorkspaceState(savedWorkspace);

      lastSavedWorkspaceRef.current = savedSerialized;
      setWorkspace(savedWorkspace);
      setSaveState('saved');

      window.setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current));
      }, 1600);
    } catch (err) {
      setSaveState('error');
      setWorkspaceError(
        err instanceof Error ? err.message : copy.workspaceFailed
      );
    }
  };

  const loadValidationSnapshot = async (
    language: UiLanguage,
    options?: {
      forceRegenerate?: boolean;
      silent?: boolean;
      fallbackSnapshot?: LocalValidationSnapshot | null;
    }
  ) => {
    if (!options?.silent) {
      setState('loading');
      setError('');
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const timeoutMs = attempt === 1 ? 50000 : 22000;
        const { response, payload } = await fetchJsonWithTimeout<{
          ok?: boolean;
          error?: string;
          plan?: ValidationPlan;
          workspace?: ValidationWorkspaceState;
          source?: 'saved' | 'generated';
        }>(
          '/api/validate',
          {
            method: 'POST',
            headers: await buildRequestHeaders(),
            body: JSON.stringify({
              report,
              uiLang: language,
              forceRegenerate: options?.forceRegenerate === true,
            }),
          },
          timeoutMs
        );

        if (!response.ok || !payload.ok || !payload.plan) {
          throw new Error(payload.error || copy.failed);
        }

        const normalizedPlan = normalizeValidationPlan(payload.plan, language);

        if (!normalizedPlan) {
          throw new Error(payload.error || copy.failed);
        }

        const nextWorkspace = normalizeValidationWorkspaceState(payload.workspace);

        const [entriesResult, synthesisResult] = await Promise.allSettled([
          fetchEvidenceEntries(report.id, language),
          fetchSavedSynthesis(report.id, language),
        ]);

        setPlan(normalizedPlan);
        setWorkspace(nextWorkspace);
        lastSavedWorkspaceRef.current = serializeWorkspaceState(nextWorkspace);
        setPlanSource(payload.source || 'generated');
        setEvidenceEntries(
          entriesResult.status === 'fulfilled'
            ? entriesResult.value
            : options?.fallbackSnapshot?.evidenceEntries ?? []
        );
        setEvidenceSynthesis(
          synthesisResult.status === 'fulfilled'
            ? synthesisResult.value
            : options?.fallbackSnapshot?.evidenceSynthesis ?? null
        );
        setIterationRefreshToken((current) => current + 1);
        setState('ready');
        setSaveState('idle');
        setWorkspaceError('');
        setError('');
        return;
      } catch (error) {
        lastError = error;

        if (attempt < 3 && shouldRetryValidationRequest(error)) {
          await waitForValidationRetry(attempt === 1 ? 1400 : 900);
          continue;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(copy.failed);
  };

  useEffect(() => {
    const fallbackSnapshot = readLocalValidationSnapshot(report.id, uiLang);

    if (fallbackSnapshot) {
      setPlan(fallbackSnapshot.plan);
      setWorkspace(fallbackSnapshot.workspace);
      lastSavedWorkspaceRef.current = serializeWorkspaceState(
        fallbackSnapshot.workspace
      );
      setPlanSource(fallbackSnapshot.source);
      setEvidenceEntries(fallbackSnapshot.evidenceEntries);
      setEvidenceSynthesis(fallbackSnapshot.evidenceSynthesis);
      setIterationRefreshToken((current) => current + 1);
      setState('ready');
      setSaveState('idle');
      setWorkspaceError('');
      setError('');
    }

    void (async () => {
      try {
        await loadValidationSnapshot(uiLang, {
          silent: Boolean(fallbackSnapshot),
          fallbackSnapshot,
        });
      } catch (err) {
        if (!fallbackSnapshot) {
          setState('error');
          setError(err instanceof Error ? err.message : copy.failed);
        }
      }
    })();

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang, report.id]);

  useEffect(() => {
    if (state !== 'ready' || !plan) {
      return;
    }

    if (serializedWorkspace === lastSavedWorkspaceRef.current) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    setSaveState('idle');
    setWorkspaceError('');

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      void commitWorkspaceSave('auto');
    }, 700);

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedWorkspace, state, plan, uiLang]);

  useEffect(() => {
    if (state !== 'ready' || !plan) {
      return;
    }

    writeLocalValidationSnapshot({
      reportId: report.id,
      uiLang,
      snapshot: {
        savedAt: new Date().toISOString(),
        plan,
        workspace,
        source: planSource || 'generated',
        evidenceEntries,
        evidenceSynthesis,
      },
    });
  }, [
    state,
    plan,
    workspace,
    planSource,
    evidenceEntries,
    evidenceSynthesis,
    report.id,
    uiLang,
  ]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleLanguageChange = (language: UiLanguage) => {
    setClientUiLanguage(language);
    setUiLang(language);
  };

  const handleSaveWorkspace = async () => {
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }

    await commitWorkspaceSave('manual');
  };

  const handleExportPdf = async () => {
    if (!plan) return;

    try {
      setExportState('loading');

      const response = await fetch('/api/export-validation-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          plan,
          workspace,
          uiLang,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || 'Failed to export PDF.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = getSafePdfFileName(report);
      link.href = url;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : copy.workspaceFailed
      );
    } finally {
      setExportState('idle');
    }
  };

  const checklist = plan ? getPlanChecklist(plan) : [];

  const summaryRows = plan
    ? [
        { label: copy.validationFocus, value: plan.validationFocus },
        { label: copy.targetSegment, value: plan.targetSegment },
        { label: copy.valueProposition, value: plan.valueProposition },
        { label: copy.evidenceGoal, value: plan.evidenceGoal },
        { label: copy.executionWindow, value: plan.executionWindow },
      ]
    : [];

  const entriesCount = evidenceEntries.length;
  const hasDecisionView = Boolean(evidenceSynthesis);
  const totalSteps = 4;
  const currentStep = getCurrentStep({
    entriesCount,
    hasDecisionView,
    decisionState: workspace.decisionState,
  });
  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const stepCounterLabel = getStepCounterLabel(currentStep, totalSteps, uiLang);
  const stepItems = [copy.step1, copy.step2, copy.step3, copy.step4];
  const quickNavItems = [
    { label: copy.navSummary, onClick: () => scrollToSection(summarySectionRef) },
    { label: copy.navChannels, onClick: () => scrollToSection(channelsSectionRef) },
    { label: copy.navChecklist, onClick: () => scrollToSection(checklistSectionRef) },
    { label: copy.navEvidence, onClick: () => scrollToSection(evidenceSectionRef) },
    { label: copy.navDecisionView, onClick: () => scrollToSection(synthesisSectionRef) },
    { label: copy.navCurrentDecision, onClick: () => scrollToSection(decisionSectionRef) },
    { label: copy.navBestStep, onClick: () => scrollToSection(iterationSectionRef) },
  ];

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#111827]" dir={copy.dir}>
      <div className={`mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8 ${plan ? 'pb-28 lg:pb-8' : ''}`}>
        <SiteHeader
          uiLang={uiLang}
          onLanguageChange={handleLanguageChange}
          logo={<MadixoLogo />}
        />

        <div className="mt-6 rounded-[28px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#111827] sm:text-3xl md:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4B5563] md:text-base">
                {copy.description}
              </p>
            </div>

            <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  void loadValidationSnapshot(uiLang, { forceRegenerate: true })
                }
                disabled={state === 'loading'}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {copy.regenerate}
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!plan || exportState === 'loading' || state === 'loading'}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {exportState === 'loading'
                  ? copy.exportingPdf
                  : copy.exportPdf}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[#374151]">
              {planSource === 'saved' ? copy.sourceSaved : copy.sourceGenerated}
            </span>
            <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-[#1D4ED8]">
              {copy.score}: {report.result.opportunityScore}/100
            </span>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                  {copy.flowProgress}
                </p>
                <p className="mt-1 text-base font-bold text-[#111827]">
                  {stepCounterLabel}
                </p>
              </div>
              <span className="rounded-full border border-[#D9E6FF] bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1D4ED8]">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#111827] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stepItems.map((item, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isDone = stepNumber < currentStep;

                return (
                  <div
                    key={item}
                    className={`rounded-[22px] border px-4 py-4 text-sm font-semibold transition ${
                      isActive
                        ? 'border-[#111827] bg-[#111827] text-white'
                        : isDone
                          ? 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'border-[#E5E7EB] bg-white text-[#374151]'
                    }`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {state === 'loading' ? (
          <div className="mt-6 rounded-[28px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  {copy.eyebrow}
                </p>
                <h2 className="mt-3 text-xl font-black tracking-tight text-[#111827] sm:text-2xl md:text-4xl">
                  {copy.loading}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#4B5563] md:text-base">
                  {copy.loadingLead}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                  {copy.loadingReadySoon}
                </p>
              </div>

              <div className="w-full max-w-[220px] rounded-[24px] border border-[#D9E6FF] bg-[#EFF6FF] p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                  {copy.loadingCountdown}
                </p>
                <p className="mt-3 text-4xl font-black text-[#111827]">
                  {loadingCountdownSeconds}
                </p>
                <p className="mt-1 text-sm text-[#4B5563]">
                  {uiLang === 'ar' ? 'ثانية' : 'seconds'}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#1D4ED8]">
                  {loadingProgressPercent}%
                </span>
                <span className="text-sm font-semibold text-[#6B7280]">
                  {copy.loading}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#111827] transition-all duration-300"
                  style={{ width: `${loadingProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {state === 'error' ? (
          <div className="mt-6 rounded-[28px] border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm text-[#B42318] shadow-sm">
            {error || copy.failed}
          </div>
        ) : null}

        {appliedNotice ? (
          <div ref={appliedNoticeRef} className="mt-6 scroll-mt-24">
            <AppliedPlanNotice
              uiLang={uiLang}
              notice={appliedNotice}
              onDismiss={() => setAppliedNotice(null)}
              onGoToEvidence={() => {
                scrollToSection(evidenceSectionRef);
              }}
              onGoToDecisionView={() => {
                scrollToSection(synthesisSectionRef);
              }}
            />
          </div>
        ) : null}

        {plan ? (
          <div className="mt-6">
            <QuickNavCard
              title={copy.quickNavTitle}
              description={copy.quickNavDescription}
              items={quickNavItems}
            />
          </div>
        ) : null}

        {plan ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div ref={summarySectionRef} className="scroll-mt-24">
                <SectionCard title={copy.opportunitySummary}>
                <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                  {summaryRows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-[22px] bg-[#F9FAFB] p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        {row.label}
                      </p>
                      <div className="mt-2 text-sm leading-7 text-[#374151]">
                        <MixedText as="span" text={row.value} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
              </div>

              <div ref={channelsSectionRef} className="scroll-mt-24">
                <SectionCard title={copy.outreachChannels}>
                {plan.outreachChannels.length ? (
                  <BulletList items={plan.outreachChannels} />
                ) : (
                  <p className="text-sm leading-7 text-[#6B7280]">
                    {copy.noChannels}
                  </p>
                )}
              </SectionCard>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
              <SectionCard title={copy.outreachScript}>
                <div className="rounded-[24px] bg-[#F9FAFB] p-5 text-sm leading-7 text-[#374151]">
                  <MixedText as="p" text={plan.outreachScript} />
                </div>
              </SectionCard>

              <div ref={checklistSectionRef} className="scroll-mt-24">
                <SectionCard title={copy.planChecklist}>
                {checklist.length ? (
                  <BulletList items={checklist} />
                ) : (
                  <p className="text-sm leading-7 text-[#6B7280]">
                    {copy.noChecklist}
                  </p>
                )}
              </SectionCard>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
              <SectionCard title={copy.continueSignals}>
                {plan.continueSignals.length ? (
                  <BulletList items={plan.continueSignals} />
                ) : (
                  <p className="text-sm leading-7 text-[#6B7280]">
                    {copy.noSignals}
                  </p>
                )}
              </SectionCard>
              <SectionCard title={copy.pivotSignals}>
                {plan.pivotSignals.length ? (
                  <BulletList items={plan.pivotSignals} />
                ) : (
                  <p className="text-sm leading-7 text-[#6B7280]">
                    {copy.noSignals}
                  </p>
                )}
              </SectionCard>
              <SectionCard title={copy.stopSignals}>
                {plan.stopSignals.length ? (
                  <BulletList items={plan.stopSignals} />
                ) : (
                  <p className="text-sm leading-7 text-[#6B7280]">
                    {copy.noSignals}
                  </p>
                )}
              </SectionCard>
            </div>

            <div ref={evidenceSectionRef} className="scroll-mt-24">
              <ValidationEvidenceSection
                reportId={report.id}
                uiLang={uiLang}
                entries={evidenceEntries}
                onEntriesChange={(nextEntries) => {
                  setEvidenceEntries(nextEntries);
                  setEvidenceSynthesis(null);
                  setIterationRefreshToken((current) => current + 1);
                  setAppliedNotice(null);
                }}
              />
            </div>

            <div ref={synthesisSectionRef} className="scroll-mt-24">
              <ValidationEvidenceSynthesis
                reportId={report.id}
                uiLang={uiLang}
                currentDecision={workspace.decisionState}
                entriesCount={entriesCount}
                synthesis={evidenceSynthesis}
                onSynthesisChange={(nextSynthesis) => {
                  setEvidenceSynthesis(nextSynthesis);
                  setIterationRefreshToken((current) => current + 1);
                  setAppliedNotice(null);
                }}
              />
            </div>

            <div ref={decisionSectionRef} className="scroll-mt-24">
              <SectionCard title={copy.currentDecision}>
              <div className="flex flex-wrap gap-3">
                <DecisionPill
                  active={workspace.decisionState === 'undecided'}
                  label={copy.undecided}
                  onClick={() =>
                    setWorkspace((current) => ({
                      ...current,
                      decisionState: 'undecided',
                    }))
                  }
                />
                <DecisionPill
                  active={workspace.decisionState === 'continue'}
                  label={copy.continueOption}
                  onClick={() =>
                    setWorkspace((current) => ({
                      ...current,
                      decisionState: 'continue',
                    }))
                  }
                />
                <DecisionPill
                  active={workspace.decisionState === 'pivot'}
                  label={copy.pivotOption}
                  onClick={() =>
                    setWorkspace((current) => ({
                      ...current,
                      decisionState: 'pivot',
                    }))
                  }
                />
                <DecisionPill
                  active={workspace.decisionState === 'stop'}
                  label={copy.stopOption}
                  onClick={() =>
                    setWorkspace((current) => ({
                      ...current,
                      decisionState: 'stop',
                    }))
                  }
                />
              </div>

              <div className="mt-6 rounded-[24px] bg-[#F9FAFB] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">
                      {copy.notesTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#6B7280]">
                      {copy.notesDescription}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#1D4ED8]">
                      {copy.autoSaveHint}
                    </p>
                  </div>

                  <SaveStateBadge
                    uiLang={uiLang}
                    saveState={saveState}
                    hasPendingChanges={hasPendingWorkspaceChanges}
                  />
                </div>

                <textarea
                  value={workspace.notes}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder={copy.notesPlaceholder}
                  rows={5}
                  className="mt-4 w-full rounded-[22px] border border-[#E5E7EB] bg-white px-4 py-4 text-sm leading-7 text-[#111827] outline-none transition focus:border-[#111827]"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSaveWorkspace()}
                  disabled={saveState === 'saving'}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saveState === 'saving'
                    ? copy.savingWorkspace
                    : copy.saveWorkspace}
                </button>
              </div>

              {workspaceError ? (
                <div className="mt-4 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                  {workspaceError}
                </div>
              ) : null}
            </SectionCard>
            </div>

            <div ref={iterationSectionRef} className="scroll-mt-24">
                <ValidationIterationEngine
                reportId={report.id}
                uiLang={uiLang}
                currentDecision={workspace.decisionState}
                hasEvidenceSummary={Boolean(evidenceSynthesis)}
                refreshToken={iterationRefreshToken}
                onApplyComplete={(snapshot) => {
                  setPlan(snapshot.plan);
                  setWorkspace(snapshot.workspace);
                  lastSavedWorkspaceRef.current = serializeWorkspaceState(
                    snapshot.workspace
                  );
                  setSaveState('idle');
                  setWorkspaceError('');
                  setEvidenceSynthesis(null);
                  setIterationRefreshToken((current) => current + 1);
                  setAppliedNotice(
                    buildAppliedNoticeFromSnapshot(
                      {
                        plan: snapshot.plan,
                        workspace: snapshot.workspace,
                      },
                      uiLang
                    )
                  );
                }}
              />
            </div>
          </div>
        ) : null}

        {plan ? (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl gap-2">
              <button
                type="button"
                onClick={() => scrollToSection(evidenceSectionRef)}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
              >
                {copy.mobileBarPrimary}
              </button>
              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    currentStep >= 4 ? iterationSectionRef : synthesisSectionRef
                  )
                }
                className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full border border-[#111827] bg-white px-4 py-2 text-sm font-semibold text-[#111827]"
              >
                {currentStep >= 4 ? copy.mobileBarTertiary : copy.mobileBarSecondary}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
