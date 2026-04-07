import { NextResponse } from 'next/server';
import { normalizeUiLanguage, type UiLanguage } from '@/lib/madixo-validation';
import { applyUserIterationEngine } from '@/lib/madixo-validation-db';

function getLocalizedError(
  key: 'missingReportId' | 'planNotFound' | 'nextMoveNotFound' | 'generic',
  uiLang: UiLanguage
) {
  const messages = {
    missingReportId:
      uiLang === 'ar' ? 'معرّف التقرير مطلوب.' : 'A report ID is required.',
    planNotFound:
      uiLang === 'ar'
        ? 'تعذر العثور على خطة التحقق الحالية.'
        : 'The current validation plan could not be found.',
    nextMoveNotFound:
      uiLang === 'ar'
        ? 'لا توجد خطوة محفوظة لتطبيقها الآن.'
        : 'There is no saved step to apply right now.',
    generic:
      uiLang === 'ar'
        ? 'تعذر تطبيق الخطوة الحالية.'
        : 'The current step could not be applied.',
  } as const;

  return messages[key];
}

export async function POST(request: Request) {
  let uiLang: UiLanguage = 'en';

  try {
    const body = (await request.json()) as {
      reportId?: unknown;
      uiLang?: unknown;
    };

    uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const reportId =
      typeof body.reportId === 'string' ? body.reportId.trim() : '';

    if (!reportId) {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('missingReportId', uiLang) },
        { status: 400 }
      );
    }

    const savedPlan = await applyUserIterationEngine({
      reportId,
      uiLang,
    });

    return NextResponse.json({
      ok: true,
      plan: savedPlan.plan,
      workspace: savedPlan.workspace,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : getLocalizedError('generic', uiLang);

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    if (message === 'VALIDATION_PLAN_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('planNotFound', uiLang) },
        { status: 404 }
      );
    }

    if (message === 'ITERATION_ENGINE_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: getLocalizedError('nextMoveNotFound', uiLang) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: message || getLocalizedError('generic', uiLang) },
      { status: 500 }
    );
  }
}
