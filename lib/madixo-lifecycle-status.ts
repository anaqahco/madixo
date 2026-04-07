import type { UiLanguage } from '@/lib/ui-language';

export type ReportLifecycleStatus =
  | 'analysis_only'
  | 'collecting_evidence'
  | 'decision_view_ready'
  | 'current_decision_set'
  | 'best_step_ready';

export function getReportLifecycleStatus(params: {
  hasValidationPlan: boolean;
  hasEvidenceSummary: boolean;
  hasDecisionState: boolean;
  hasIterationEngine: boolean;
}): ReportLifecycleStatus {
  const {
    hasValidationPlan,
    hasEvidenceSummary,
    hasDecisionState,
    hasIterationEngine,
  } = params;

  if (hasIterationEngine) return 'best_step_ready';
  if (hasDecisionState) return 'current_decision_set';
  if (hasEvidenceSummary) return 'decision_view_ready';
  if (hasValidationPlan) return 'collecting_evidence';
  return 'analysis_only';
}

export function lifecycleStatusLabel(
  status: ReportLifecycleStatus,
  uiLang: UiLanguage
) {
  const copy = {
    ar: {
      analysis_only: 'تحليل فقط',
      collecting_evidence: 'يحتاج ملاحظات سوق',
      decision_view_ready: 'رؤية القرار جاهزة',
      current_decision_set: 'قرار حالي محدد',
      best_step_ready: 'أفضل خطوة الآن جاهزة',
    },
    en: {
      analysis_only: 'Analysis only',
      collecting_evidence: 'Needs market notes',
      decision_view_ready: 'Decision view ready',
      current_decision_set: 'Current decision set',
      best_step_ready: 'Best step ready',
    },
  } as const;

  return copy[uiLang][status];
}

export function lifecycleStatusTone(status: ReportLifecycleStatus) {
  switch (status) {
    case 'best_step_ready':
      return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
    case 'current_decision_set':
      return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
    case 'decision_view_ready':
      return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
    case 'collecting_evidence':
      return 'border-[#FDEAD7] bg-[#FFF7ED] text-[#C2410C]';
    case 'analysis_only':
    default:
      return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]';
  }
}

export function lifecycleStatusPriority(status: ReportLifecycleStatus) {
  switch (status) {
    case 'best_step_ready':
      return 1;
    case 'current_decision_set':
      return 2;
    case 'decision_view_ready':
      return 3;
    case 'collecting_evidence':
      return 4;
    case 'analysis_only':
    default:
      return 5;
  }
}
