import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  normalizeUiLanguage,
  normalizeValidationWorkspaceState,
} from '@/lib/madixo-validation';
import { saveUserValidationWorkspaceForUserId } from '@/lib/madixo-validation-db';

function getBearerToken(request: Request) {
  const value = request.headers.get('authorization');
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}


async function withAuthTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function getAuthenticatedUser(accessToken?: string | null) {
  const supabase = await createClient();

  if (accessToken) {
    try {
      const {
        data: { user },
        error,
      } = await withAuthTimeout(
        supabase.auth.getUser(accessToken),
        6000,
        'AUTH_TOKEN_TIMEOUT'
      );

      if (error) {
        throw new Error(error.message);
      }

      if (user) {
        return user;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AUTH_TOKEN_TIMEOUT';

      if (message !== 'AUTH_TOKEN_TIMEOUT') {
        throw new Error(message);
      }
    }
  }

  const {
    data: { user },
    error,
  } = await withAuthTimeout(supabase.auth.getUser(), 6000, 'AUTH_COOKIE_TIMEOUT');

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

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
    const accessToken = getBearerToken(request);
    const workspace =
      typeof body.workspace === 'object' && body.workspace !== null
        ? normalizeValidationWorkspaceState(body.workspace)
        : normalizeValidationWorkspaceState(undefined);

    const user = await getAuthenticatedUser(accessToken);

    if (!user) {
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

    try {
      const saved = await saveUserValidationWorkspaceForUserId({
        userId: user.id,
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
        error:
          message === 'Auth session missing!'
            ? 'جار حفظ مساحة التحقق. حاول مرة أخرى بعد لحظات.'
            : message,
      },
      { status: 500 }
    );
  }
}
