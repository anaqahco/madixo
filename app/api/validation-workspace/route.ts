import { NextResponse } from 'next/server';
import {
  normalizeUiLanguage,
  normalizeValidationWorkspaceState,
} from '@/lib/madixo-validation';
import { saveUserValidationWorkspace } from '@/lib/madixo-validation-db';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reportId?: unknown;
      uiLang?: unknown;
      workspace?: unknown;
    };

    if (typeof body.reportId !== 'string' || !body.reportId.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: 'A valid reportId is required.',
        },
        { status: 400 }
      );
    }

    const uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const workspace =
      typeof body.workspace === 'object' && body.workspace !== null
        ? normalizeValidationWorkspaceState(body.workspace)
        : normalizeValidationWorkspaceState(undefined);

    try {
      const saved = await saveUserValidationWorkspace({
        reportId: body.reportId,
        uiLang,
        workspace,
      });

      return NextResponse.json({
        ok: true,
        workspace: saved.workspace,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        return NextResponse.json(
          {
            ok: false,
            error:
              uiLang === 'ar'
                ? 'يجب تسجيل الدخول لحفظ مساحة العمل.'
                : 'You must be logged in to save the workspace.',
          },
          { status: 401 }
        );
      }

      throw error;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to save the validation workspace.';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
