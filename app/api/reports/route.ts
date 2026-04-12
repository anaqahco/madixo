import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AnalysisResult, ReportSortOption } from '@/lib/madixo-reports';
import type { UiLanguage } from '@/lib/ui-language';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
};

type ReportsTableRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  query: string;
  market: string;
  customer: string;
  opportunity_score: number;
  opportunity_label: string;
  summary: string;
  result_json: AnalysisResult;
};

type ValidationDecisionState = 'undecided' | 'continue' | 'pivot' | 'stop';

type ValidationPlanStatusRow = {
  report_id: string;
  ui_lang: UiLanguage;
  evidence_summary_json: unknown | null;
  iteration_engine_json: unknown | null;
  decision_state: ValidationDecisionState | null;
  updated_at?: string | null;
};

function toSafeText(value: string | null | undefined, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeSort(value: string | null): ReportSortOption {
  if (value === 'oldest' || value === 'highestScore' || value === 'lowestScore') {
    return value;
  }
  return 'latest';
}


function getBearerToken(request: Request) {
  const value = request.headers.get('authorization');
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function getRequiredUser(request: Request) {
  const supabase = await createClient();
  const accessToken = getBearerToken(request);

  if (accessToken) {
    const {
      data: tokenUserData,
      error: tokenUserError,
    } = await supabase.auth.getUser(accessToken);

    if (!tokenUserError && tokenUserData.user) {
      return { supabase, user: tokenUserData.user };
    }
  }

  const {
    data: cookieUserData,
    error: cookieUserError,
  } = await supabase.auth.getUser();

  if (!cookieUserError && cookieUserData.user) {
    return { supabase, user: cookieUserData.user };
  }

  throw new Error('AUTH_REQUIRED');
}

async function getReportsAndValidation(request: Request, sortBy: ReportSortOption) {
  const { supabase, user } = await getRequiredUser(request);

  let query = supabase.from('reports').select('*').eq('user_id', user.id);

  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highestScore':
      query = query
        .order('opportunity_score', { ascending: false })
        .order('created_at', { ascending: false });
      break;
    case 'lowestScore':
      query = query
        .order('opportunity_score', { ascending: true })
        .order('created_at', { ascending: false });
      break;
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const reports = ((data || []) as ReportsTableRow[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    query: toSafeText(row.query, 'Untitled opportunity'),
    market: toSafeText(row.market, 'Not specified'),
    customer: toSafeText(row.customer, 'Not specified'),
    result: row.result_json,
  }));

  const reportIds = reports.map((item) => item.id);
  let validationPlans: ValidationPlanStatusRow[] = [];

  if (reportIds.length) {
    const { data: planRows, error: plansError } = await supabase
      .from('validation_plans')
      .select(
        'report_id, ui_lang, evidence_summary_json, iteration_engine_json, decision_state, updated_at'
      )
      .eq('user_id', user.id)
      .in('report_id', reportIds);

    if (plansError) {
      throw new Error(plansError.message);
    }

    validationPlans = (planRows || []) as ValidationPlanStatusRow[];
  }

  return { reports, validationPlans };
}

async function getSingleReportAndValidation(request: Request, id: string) {
  const { supabase, user } = await getRequiredUser(request);

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { report: null, validationPlans: [] as ValidationPlanStatusRow[] };
  }

  const report = {
    id: data.id,
    createdAt: data.created_at,
    query: toSafeText(data.query, 'Untitled opportunity'),
    market: toSafeText(data.market, 'Not specified'),
    customer: toSafeText(data.customer, 'Not specified'),
    result: data.result_json,
  };

  const { data: planRows, error: plansError } = await supabase
    .from('validation_plans')
    .select(
      'report_id, ui_lang, evidence_summary_json, iteration_engine_json, decision_state, updated_at'
    )
    .eq('user_id', user.id)
    .eq('report_id', id);

  if (plansError) {
    throw new Error(plansError.message);
  }

  return {
    report,
    validationPlans: (planRows || []) as ValidationPlanStatusRow[],
  };
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')?.trim() || '';

    if (id) {
      const payload = await getSingleReportAndValidation(request, id);

      return NextResponse.json(
        {
          ok: true,
          ...payload,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    const sortBy = normalizeSort(request.nextUrl.searchParams.get('sort'));
    const payload = await getReportsAndValidation(request, sortBy);

    return NextResponse.json(
      {
        ok: true,
        ...payload,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load reports.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        {
          ok: false,
          error: 'AUTH_REQUIRED',
        },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: string };
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing report id.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { supabase, user } = await getRequiredUser(request);

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete report.';

    if (message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
