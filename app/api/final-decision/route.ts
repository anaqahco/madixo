import { NextResponse } from 'next/server';
import { type UiLanguage, normalizeUiLanguage } from '@/lib/madixo-validation';

function getRemovedMessage(uiLang: UiLanguage) {
  return uiLang === 'ar'
    ? 'تمت إزالة هذا المسار من النسخة الحالية. استخدم القرار الحالي داخل مساحة التحقق ثم أنشئ أفضل خطوة الآن.'
    : 'This route was removed from the current product flow. Use the current decision inside the validation workspace, then generate the best step now.';
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
      code: 'FINAL_DECISION_REMOVED',
      error: getRemovedMessage(uiLang),
    },
    { status: 404 }
  );
}
