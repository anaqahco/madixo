import {
    lifecycleStatusLabel,
    lifecycleStatusTone,
    type ReportLifecycleStatus,
  } from '@/lib/madixo-lifecycle-status';
  import type { UiLanguage } from '@/lib/ui-language';
  
  type Props = {
    status: ReportLifecycleStatus;
    uiLang: UiLanguage;
  };
  
  export default function LifecycleStatusBadge({ status, uiLang }: Props) {
    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${lifecycleStatusTone(
          status
        )}`}
      >
        {lifecycleStatusLabel(status, uiLang)}
      </span>
    );
  }
  