import type { UiLanguage } from '@/lib/ui-language';

type Props = {
  hasFeasibility: boolean;
  hasValidation: boolean;
  uiLang: UiLanguage;
};

function getStageSummaryLabel(params: Props) {
  const { hasFeasibility, hasValidation, uiLang } = params;

  if (uiLang === 'ar') {
    if (hasFeasibility && hasValidation) return 'تحليل + جدوى + تحقق';
    if (hasFeasibility) return 'تحليل + جدوى';
    if (hasValidation) return 'تحليل + تحقق';
    return 'تحليل فقط';
  }

  if (hasFeasibility && hasValidation) return 'Analysis + Feasibility + Validation';
  if (hasFeasibility) return 'Analysis + Feasibility';
  if (hasValidation) return 'Analysis + Validation';
  return 'Analysis only';
}

function getStageSummaryTone(hasFeasibility: boolean, hasValidation: boolean) {
  if (hasFeasibility && hasValidation) {
    return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]';
  }

  if (hasFeasibility) {
    return 'border-[#D9E6FF] bg-[#EFF6FF] text-[#1D4ED8]';
  }

  if (hasValidation) {
    return 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]';
  }

  return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]';
}

export default function ReportStageSummaryBadge({
  hasFeasibility,
  hasValidation,
  uiLang,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStageSummaryTone(
        hasFeasibility,
        hasValidation
      )}`}
    >
      {getStageSummaryLabel({ hasFeasibility, hasValidation, uiLang })}
    </span>
  );
}
