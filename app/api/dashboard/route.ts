import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentMadixoPlanPayload } from '@/lib/madixo-plan-store';
import { getCurrentMadixoPlanUsage } from '@/lib/madixo-plan-usage';
import type { AnalysisResult, SavedMadixoReport } from '@/lib/madixo-reports';
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

type DashboardStage =
  | 'analysis_only'
  | 'collecting_evidence'
  | 'decision_view_ready'
  | 'current_decision_set'
  | 'best_step_ready';

function toSafeText(value: string | null | undefined, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeUiLang(value: string | null): UiLanguage {
  return value === 'ar' ? 'ar' : 'en';
}

function mapRowToSavedReport(row: ReportsTableRow): SavedMadixoReport {
  return {
    id: row.id,
    createdAt: row.created_at,
    query: toSafeText(row.query, 'Untitled opportunity'),
    market: toSafeText(row.market, 'Not specified'),
    customer: toSafeText(row.customer, 'Not specified'),
    result: row.result_json,
  };
}

function getDashboardStage(
  row: ValidationPlanStatusRow | undefined
): DashboardStage {
  if (!row) return 'analysis_only';
  if (row.iteration_engine_json) return 'best_step_ready';
  if (
    row.decision_state === 'continue' ||
    row.decision_state === 'pivot' ||
    row.decision_state === 'stop'
  ) {
    return 'current_decision_set';
  }
  if (row.evidence_summary_json) return 'decision_view_ready';
  return 'collecting_evidence';
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function chooseBestPlanRow(
  rows: ValidationPlanStatusRow[],
  uiLang: UiLanguage
): ValidationPlanStatusRow | undefined {
  if (!rows.length) return undefined;

  const exactLanguageRows = rows.filter((row) => row.ui_lang === uiLang);
  const pool = exactLanguageRows.length ? exactLanguageRows : rows;

  return [...pool].sort(
    (a, b) => toTimestamp(b.updated_at) - toTimestamp(a.updated_at)
  )[0];
}

async function getRequiredUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const uiLang = normalizeUiLang(request.nextUrl.searchParams.get('uiLang'));

  try {
    const { supabase, user } = await getRequiredUser();

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const reports = ((data || []) as ReportsTableRow[]).map(mapRowToSavedReport);
    const reportIds = reports.map((report) => report.id);

    const stageMap: Record<string, DashboardStage> = {};
    const stageUpdatedAtMap: Record<string, string> = {};

    for (const reportId of reportIds) {
      stageMap[reportId] = 'analysis_only';
    }

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

      const grouped = new Map<string, ValidationPlanStatusRow[]>();

      for (const row of (planRows || []) as ValidationPlanStatusRow[]) {
        const existing = grouped.get(row.report_id) || [];
        existing.push(row);
        grouped.set(row.report_id, existing);
      }

      for (const reportId of reportIds) {
        const chosen = chooseBestPlanRow(grouped.get(reportId) || [], uiLang);
        if (!chosen) continue;

        stageMap[reportId] = getDashboardStage(chosen);
        if (chosen.updated_at) {
          stageUpdatedAtMap[reportId] = chosen.updated_at;
        }
      }
    }

    const [planPayload, usage] = await Promise.all([
      getCurrentMadixoPlanPayload(uiLang),
      getCurrentMadixoPlanUsage(request),
    ]);

    return NextResponse.json(
      {
        ok: true,
        reports,
        stageMap,
        stageUpdatedAtMap,
        plan: planPayload.plan,
        currentPlanLabel: planPayload.label,
        planUsage: usage,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard.';

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
