import { NextResponse } from 'next/server';
import { type UiLanguage, normalizeUiLanguage } from '@/lib/madixo-validation';

function getRemovedMessage(uiLang: UiLanguage) {
  return uiLang === 'ar'
    ? 'تمت إزالة هذا المسار من النسخة الحالية. المسار المعتمد الآن هو: ملاحظات السوق، رؤية القرار، القرار الحالي، ثم أفضل خطوة الآن.'
    : 'This route was removed from the current product flow. The active workflow is: market notes, decision view, current decision, then best step now.';
}

export async function POST(request: Request) {
  let uiLang: UiLanguage = 'en';

  try {
    const body = (await request.json().catch(() => ({}))) as {
      uiLang?: unknown;
    };

    uiLang = normalizeUiLanguage(body.uiLang, 'en');
  } catch {
    uiLang = 'en';
  }

  return NextResponse.json(
    {
      ok: false,
      code: 'REOPEN_VALIDATION_REMOVED',
      error: getRemovedMessage(uiLang),
    },
    { status: 404 }
  );
}
