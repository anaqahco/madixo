import { NextResponse } from 'next/server';
import {
  createUserEvidenceEntry,
  deleteUserEvidenceEntry,
  getUserEvidenceEntries,
  updateUserEvidenceEntry,
} from '@/lib/madixo-evidence-db';
import {
  normalizeEvidenceEntryType,
  normalizeEvidenceSignalStrength,
  normalizeUiLanguage,
} from '@/lib/madixo-validation';

function trimText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function authErrorResponse(uiLang: 'ar' | 'en') {
  return NextResponse.json(
    {
      ok: false,
      error:
        uiLang === 'ar'
          ? 'يجب تسجيل الدخول للوصول إلى الأدلة.'
          : 'You must be logged in to access evidence entries.',
    },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reportId = trimText(url.searchParams.get('reportId'));
  const uiLang = normalizeUiLanguage(url.searchParams.get('uiLang'), 'en');

  if (!reportId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'A valid reportId is required.',
      },
      { status: 400 }
    );
  }

  try {
    const entries = await getUserEvidenceEntries(reportId, uiLang);

    return NextResponse.json({
      ok: true,
      entries,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return authErrorResponse(uiLang);
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load evidence entries.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reportId?: unknown;
      uiLang?: unknown;
      entryType?: unknown;
      title?: unknown;
      content?: unknown;
      source?: unknown;
      signalStrength?: unknown;
    };

    const reportId = trimText(body.reportId);
    const uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const entryType = normalizeEvidenceEntryType(body.entryType, 'interview');
    const title = trimText(body.title);
    const content = trimText(body.content);
    const source = trimText(body.source);
    const signalStrength = normalizeEvidenceSignalStrength(
      body.signalStrength,
      'medium'
    );

    if (!reportId) {
      return NextResponse.json(
        { ok: false, error: 'A valid reportId is required.' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        {
          ok: false,
          error:
            uiLang === 'ar'
              ? 'العنوان والمحتوى مطلوبان.'
              : 'Title and content are required.',
        },
        { status: 400 }
      );
    }

    const entry = await createUserEvidenceEntry({
      reportId,
      uiLang,
      entryType,
      title,
      content,
      source,
      signalStrength,
    });

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    const uiLang = 'en';

    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return authErrorResponse(uiLang);
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create evidence entry.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: unknown;
      uiLang?: unknown;
      title?: unknown;
      content?: unknown;
      source?: unknown;
      signalStrength?: unknown;
    };

    const id = trimText(body.id);
    const uiLang = normalizeUiLanguage(body.uiLang, 'en');
    const title =
      typeof body.title === 'string' ? trimText(body.title) : undefined;
    const content =
      typeof body.content === 'string' ? trimText(body.content) : undefined;
    const source =
      typeof body.source === 'string' ? trimText(body.source) : undefined;
    const signalStrength =
      typeof body.signalStrength === 'undefined'
        ? undefined
        : normalizeEvidenceSignalStrength(body.signalStrength, 'medium');

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'A valid id is required.' },
        { status: 400 }
      );
    }

    if (typeof title === 'string' && !title) {
      return NextResponse.json(
        {
          ok: false,
          error:
            uiLang === 'ar'
              ? 'لا يمكن حفظ عنوان فارغ.'
              : 'Title cannot be empty.',
        },
        { status: 400 }
      );
    }

    if (typeof content === 'string' && !content) {
      return NextResponse.json(
        {
          ok: false,
          error:
            uiLang === 'ar'
              ? 'لا يمكن حفظ محتوى فارغ.'
              : 'Content cannot be empty.',
        },
        { status: 400 }
      );
    }

    const entry = await updateUserEvidenceEntry({
      id,
      title,
      content,
      source,
      signalStrength,
    });

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    const uiLang = 'en';

    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return authErrorResponse(uiLang);
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update evidence entry.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: unknown;
    };

    const id = trimText(body.id);

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'A valid id is required.' },
        { status: 400 }
      );
    }

    await deleteUserEvidenceEntry(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const uiLang = 'en';

    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return authErrorResponse(uiLang);
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete evidence entry.',
      },
      { status: 500 }
    );
  }
}
